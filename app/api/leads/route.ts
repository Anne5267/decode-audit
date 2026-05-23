// app/api/leads/route.ts — Lead capture fra AI Risikotest og andre lead-gen sider
// Version 1.2 — 2026-05-23 — Auto-draft til Telegram for kritisk/høj leads
// Version 1.1 — 2026-05-23 — GET returnerer fuld liste til intern brug

import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbPost } from "@/app/lib/db";

interface Lead {
  id: string;
  created_at: string;
  name: string | null;
  email: string;
  score: number | null;
  source: string;
  category: string | null;
  contacted: boolean;
  notes: string | null;
}

const TELEGRAM_TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ANTHROPIC_KEY    = process.env.ANTHROPIC_API_KEY;

const SOURCE_CONTEXT: Record<string, string> = {
  "ai-risikotest":  "fuldførte AI Risikotest (EU AI Act risikoscreening)",
  "decode-audit":   "udfyldte forespørgsel om Decode Audit",
  "nyhedsbrev":     "tilmeldte sig Decode-nyhedsbrevet",
  "decode-learn":   "forespurgte på Decode Learn workshop",
  "mct-virksomhed": "forespurgte på MCT-adgang til sin organisation",
  "decode-test":    "genererede en AI testsuite via Decode Test",
};

const CATEGORY_CONTEXT: Record<string, string> = {
  kritisk: "i den kritiske risikozone (76-100) — kræver øjeblikkelig handling",
  høj:     "i høj risikozone (51-75) — har identificerede risici der bør adresseres",
  moderat: "i moderat risikozone (26-50)",
  lav:     "i lav risikozone (0-25)",
};

async function generateEmailDraft(
  name: string | null, email: string,
  score: number | null, source: string,
  category: string | null, notes: string | null,
): Promise<string> {
  if (!ANTHROPIC_KEY) return "";
  const sourceCtx   = SOURCE_CONTEXT[source] ?? `henvendte sig via ${source}`;
  const categoryCtx = category ? CATEGORY_CONTEXT[category] : null;
  const scoreStr    = score !== null ? `${score}/100` : null;
  const notesCtx    = notes ? `\nEkstra info: ${notes}` : "";

  const prompt = `Du er Anne Ringgaard — grundlægger af Decode AI. Varm, direkte, kompetent. Ingen floskler. Dansk.

Skriv en kort opfølgningsmail til ${name || "en ny lead"} (${email}).
De ${sourceCtx}.${scoreStr ? `\nRisikoscore: ${scoreStr}` : ""}${category ? `\nKategori: ${category} — ${categoryCtx}` : ""}${notesCtx}

Mailen: emne-linje + 3 afsnit (maks 150 ord) + signatur (Anne Ringgaard · anne@decodeai.dk · decodeai.dk).
Skriv KUN mailen. Ingen forklaring.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return (data.content?.[0]?.text ?? "").trim();
  } catch { return ""; }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// OPTIONS — CORS preflight (statisk HTML fra Scannet kalder dette endpoint cross-origin)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// POST /api/leads — gem lead fra risikotest eller andre sider
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, email, score, source, category, notes } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Ugyldig email" }, { status: 400, headers: CORS });
    }

    // Gem i Supabase
    await dbPost("/decode_leads", {
      name: name?.trim() || null,
      email: email.trim().toLowerCase(),
      score: typeof score === "number" ? score : null,
      source: source || "ai-risikotest",
      category: category || null,
      notes: notes?.trim() || null,
    });

    // Telegram-notifikation + auto-draft til Anne
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      const scoreLabel = score !== null && score !== undefined ? `Score: ${score}/100` : "";
      const catLabel   = category ? `(${category})` : "";
      const nameLabel  = name ? ` · ${name}` : "";
      const notesLabel = notes ? `\n${notes}` : "";
      const urgencyEmoji = category === "kritisk" ? "🚨" : category === "høj" ? "🎯" : "💡";

      // Basis-besked
      const baseText = `${urgencyEmoji} Ny lead fra ${source || "ai-risikotest"}\n${email}${nameLabel}\n${scoreLabel} ${catLabel}${notesLabel}`.trim();

      // For kritisk og høj: generer email-draft med Haiku (non-blocking)
      const sendTelegram = async (text: string) => {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
        });
      };

      if (category === "kritisk" || category === "høj") {
        // Kør draft-generering og Telegram parallelt (draft er langsom)
        const draft = await generateEmailDraft(name || null, email, score ?? null, source || "ai-risikotest", category, notes || null);
        const fullText = draft
          ? `${baseText}\n\n--- Udkast til svar ---\n${draft}`
          : baseText;
        sendTelegram(fullText).catch(() => {});
      } else {
        sendTelegram(baseText).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (err) {
    console.error("leads POST fejl:", err);
    return NextResponse.json({ error: "Serverfejl" }, { status: 500, headers: CORS });
  }
}

// GET /api/leads — returnerer alle leads sorteret nyeste først
// Bruges af /leads server-component internt.
// CORS headers tillader public count-check fra risikotest-siden (bare url/?count=1).
export async function GET(req: NextRequest) {
  try {
    const countOnly = req.nextUrl.searchParams.get("count") === "1";
    if (countOnly) {
      const all = await dbGet<{ id: string }[]>("/decode_leads?select=id");
      return NextResponse.json({ count: Array.isArray(all) ? all.length : 0 }, { headers: CORS });
    }
    const leads = await dbGet<Lead[]>(
      "/decode_leads?select=*&order=created_at.desc&limit=200"
    );
    return NextResponse.json(Array.isArray(leads) ? leads : [], { headers: CORS });
  } catch {
    return NextResponse.json([], { headers: CORS });
  }
}

// PATCH /api/leads — opdater contacted-status
export async function PATCH(req: NextRequest) {
  try {
    const { id, contacted } = await req.json() as { id: string; contacted: boolean };
    if (!id) return NextResponse.json({ error: "id mangler" }, { status: 400 });
    const { dbPatch } = await import("@/app/lib/db");
    await dbPatch(`/decode_leads?id=eq.${id}`, { contacted });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
