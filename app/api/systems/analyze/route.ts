// app/api/systems/analyze/route.ts — AI-assisteret risikovurdering af nyt system
// Version 1.0 — 2026-05-23
// Bruges af /systems/new-formularen inden oprettelse

import { NextRequest } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

interface AnalysisResult {
  risk_level:          "minimal" | "limited" | "high" | "unacceptable"
  risk_reasoning:      string
  compliance_articles: { article: string; title: string; description: string; priority: "must" | "should" | "consider" }[]
  initial_gaps:        string[]
  suggested_owner:     string
  environment_guess:   "production" | "staging" | "development"
}

const EU_AIACT_ARTICLES = `
Art. 5: Forbudte AI-praksisser (social scoring, subliminal manipulation, biometrisk kategorisering)
Art. 6: Klassifikation af høj-risiko AI-systemer (Bilag III use cases)
Art. 9: Risikostyringssystem — skal dokumenteres og vedligeholdes
Art. 10: Datakvalitet og datastyring — trænings-, validerings- og testdata
Art. 11: Teknisk dokumentation — Bilag IV
Art. 12: Logføring og sporing — automatisk logging
Art. 13: Transparens og information til brugere — klare oplysninger
Art. 14: Menneskelig kontrol — oversight og override-mekanismer
Art. 15: Nøjagtighed, robusthed og cybersikkerhed
Art. 52: Transparens-krav for specifikke AI-systemer (chatbots, deepfakes)
Art. 53: Generelle AI-modeller — GPAI — registrering og dokumentation
`;

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY mangler" }, { status: 500 });
  }

  const { name, description, use_case, model_provider, model_name } = await req.json();

  if (!name && !description && !use_case) {
    return Response.json({ error: "Mindst navn eller beskrivelse kræves" }, { status: 400 });
  }

  const prompt = `Du er EU AI Act specialist. Analyser dette AI-system og returner kun valid JSON.

SYSTEM:
Navn: ${name || "(ikke angivet)"}
Beskrivelse: ${description || "(ikke angivet)"}
Use case: ${use_case || "(ikke angivet)"}
Provider/model: ${[model_provider, model_name].filter(Boolean).join(" / ") || "(ikke angivet)"}

RELEVANTE EU AI ACT ARTIKLER:
${EU_AIACT_ARTICLES}

Returner JSON (ingen markdown, ingen forklaring):
{
  "risk_level": "minimal" | "limited" | "high" | "unacceptable",
  "risk_reasoning": "2-3 sætninger om hvorfor dette risikoniveau",
  "compliance_articles": [
    {
      "article": "Art. XX",
      "title": "Kort titel",
      "description": "Hvad systemet skal opfylde — konkret og specifikt for DETTE system",
      "priority": "must" | "should" | "consider"
    }
  ],
  "initial_gaps": ["Konkret risiko eller gap der typisk er for denne type system"],
  "suggested_owner": "Hvem bør typisk eje compliance for denne systemtype (fx 'AI-ansvarlig', 'Data Engineer', 'Legal')",
  "environment_guess": "production" | "staging" | "development"
}

Medtag max 6 compliance_articles, max 4 initial_gaps. Vær specifik for DETTE system — undgå generiske krav.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":        ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `Anthropic fejl: ${err}` }, { status: 502 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "";

    // Parse JSON — strip any markdown fences if present
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({ error: "Ingen JSON i svar" }, { status: 502 });

    const analysis: AnalysisResult = JSON.parse(jsonMatch[0]);
    return Response.json(analysis);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
