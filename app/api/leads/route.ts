// app/api/leads/route.ts — Lead capture fra AI Risikotest og andre lead-gen sider
// Version 1.0 — 2026-05-23

import { NextRequest, NextResponse } from "next/server";
import { dbPost } from "@/app/lib/db";

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

    const { name, email, score, source, category } = body;

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
    });

    // Telegram-notifikation til Anne
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      const scoreLabel = score !== undefined ? `Score: ${score}/100` : "";
      const catLabel = category ? `(${category})` : "";
      const nameLabel = name ? ` · ${name}` : "";
      const text = `🎯 Ny lead fra ${source || "ai-risikotest"}\n${email}${nameLabel}\n${scoreLabel} ${catLabel}`.trim();

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

// GET /api/leads — simpel tæller (public — viser kun antal, ikke emails)
export async function GET() {
  try {
    const { dbGet } = await import("@/app/lib/db");
    const rows = await dbGet<{ count: string }[]>(
      "/decode_leads?select=count&count=exact&head=true"
    );
    // Supabase returnerer count i Content-Range header via head=true, men vi kan bare tælle
    const all = await dbGet<{ id: string }[]>("/decode_leads?select=id");
    return NextResponse.json({ count: Array.isArray(all) ? all.length : 0 }, { headers: CORS });
  } catch {
    return NextResponse.json({ count: 0 }, { headers: CORS });
  }
}
