// app/api/leads/route.ts — Lead capture fra AI Risikotest og andre lead-gen sider
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

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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

    // Telegram-notifikation til Anne
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      const scoreLabel = score !== undefined && score !== null ? `Score: ${score}/100` : "";
      const catLabel = category ? `(${category})` : "";
      const nameLabel = name ? ` · ${name}` : "";
      const notesLabel = notes ? `\n${notes}` : "";
      const text = `🎯 Ny lead fra ${source || "ai-risikotest"}\n${email}${nameLabel}\n${scoreLabel} ${catLabel}${notesLabel}`.trim();

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
      }).catch(() => {}); // non-fatal
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
