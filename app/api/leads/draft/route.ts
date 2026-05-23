// app/api/leads/draft/route.ts — Generer personaliseret opfølgningsmail til lead
// Version 1.0 — 2026-05-23

import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;

const SOURCE_CONTEXT: Record<string, string> = {
  "ai-risikotest":  "fuldførte Decode AI Risikotest (EU AI Act risikoscreening)",
  "decode-audit":   "udfyldte forespørgsel om Decode Audit (fuld compliance-gennemgang)",
  "nyhedsbrev":     "tilmeldte sig Decode-nyhedsbrevet",
  "decode-learn":   "forespurgte på Decode Learn workshop",
  "mct-virksomhed": "forespurgte på MCT-adgang til sin organisation",
};

const CATEGORY_CONTEXT: Record<string, string> = {
  kritisk: "scoring i den kritiske risikozone (76-100). De har sandsynligvis AI-systemer der kræver øjeblikkelig compliance-indsats inden EU AI Act træder i kraft.",
  høj:     "scoring i høj risikozone (51-75). De har identificerede risici der kræver handling inden for de kommende måneder.",
  moderat: "scoring i moderat risikozone (26-50). De er i gang men har gaps der bør adresseres.",
  lav:     "scoring i lav risikozone (0-25). Godt udgangspunkt — men de kan stadig have dokumentationsgaps.",
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, score, source, category, notes } = await req.json();

    if (!email) return NextResponse.json({ error: "email mangler" }, { status: 400 });

    const sourceCtx  = SOURCE_CONTEXT[source] ?? `henvendte sig via ${source}`;
    const categoryCtx = category ? CATEGORY_CONTEXT[category] : null;
    const scoreStr   = score !== null && score !== undefined ? `${score}/100` : null;

    const notesCtx = notes ? `\nEkstra info fra formularen: ${notes}` : "";

    const prompt = `Du er Anne Ringgaard — MCT-coach og grundlægger af Decode AI.
Du hjælper virksomheder med EU AI Act compliance, AI-risikostyring og MCT-baseret teamcoaching.
Din tone: varm, direkte, kompetent. Ingen floskler. Ingen AI-meta-sprog.
Du skriver altid på dansk.

Skriv en opfølgningsmail til ${name || "en ny lead"} (${email}).

Kontekst:
- De ${sourceCtx}
${scoreStr ? `- Risikoscore: ${scoreStr}` : ""}
${category ? `- Kategori: ${category} — ${categoryCtx}` : ""}
${notesCtx}

Mailen skal:
1. Anerkende det de gjorde (test, forespørgsel etc.) — konkret, ikke generisk
2. Spejle deres situation baseret på score/kategori — vise at Anne har set deres resultat
3. Foreslå ét næste skridt (afklarende opkald eller konkret tilbud — tilpas til kilde)
4. Slutte med en åben invitation — ikke et call-to-action pres

Format:
- Emne: [linje]
- Hilsen
- 3-4 afsnit, max 180 ord samlet
- Signatur: Anne Ringgaard · anne@decodeai.dk · decodeai.dk

Skriv KUN selve mailen. Ingen forklaring. Ingen metadata.`;

    const res2 = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 600,
        messages:   [{ role: "user", content: prompt }],
      }),
    });
    if (!res2.ok) throw new Error(`Anthropic ${res2.status}: ${await res2.text()}`);
    const data2 = await res2.json();
    const text = (data2.content?.[0]?.text ?? "").trim();
    if (!text) return NextResponse.json({ error: "Ingen tekst genereret" }, { status: 500 });

    return NextResponse.json({ draft: text });
  } catch (err) {
    console.error("draft POST fejl:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
