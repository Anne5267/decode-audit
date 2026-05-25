// app/risikotest/page.tsx — AI Risikotest: EU AI Act risikoscreening
// Version 1.0 — 2026-05-25
//
// Offentlig lead-gen side. Ingen auth krævet (whitelist i proxy.ts).
// 10 spørgsmål → score 0-100 → lead-capture → gem i decode_leads via /api/leads.
// Telegram-notifikation + auto-drafted opfølgningsmail til kritisk/høj leads.
//
// Design: matcher audit.decodeai.dk dark-amber tema (globals.css).

"use client";

import { useState, useEffect } from "react";

// ─── Spørgsmål ───────────────────────────────────────────────────────────────

interface Option {
  label: string;
  points: number;
}

interface Question {
  id: number;
  text: string;
  sub?: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Bruger jeres organisation AI til at træffe beslutninger om mennesker?",
    sub: "F.eks. ansættelse, kredit, sagsbehandling, sygefravær",
    options: [
      { label: "Ja — AI har direkte indflydelse på vigtige beslutninger", points: 20 },
      { label: "Ja — som støtteværktøj, mennesker beslutter endeligt", points: 10 },
      { label: "Nej", points: 0 },
    ],
  },
  {
    id: 2,
    text: "Har jeres IT-afdeling en dokumenteret AI-politik?",
    sub: "En formel politik der regulerer hvilke AI-tools må bruges, og til hvad",
    options: [
      { label: "Ja — komplet, godkendt og kommunikeret", points: 0 },
      { label: "Under udarbejdelse", points: 5 },
      { label: "Nej / ved ikke", points: 12 },
    ],
  },
  {
    id: 3,
    text: "Er jeres AI-systemer klassificeret under EU AI Act?",
    sub: "Dvs. vurderet om de er høj-risiko, begrænset-risiko eller minimal-risiko",
    options: [
      { label: "Ja — alle systemer er klassificeret", points: 0 },
      { label: "Delvist — nogle, men ikke alle", points: 10 },
      { label: "Nej / vi har aldrig gjort det", points: 18 },
    ],
  },
  {
    id: 4,
    text: "Bruger medarbejdere offentlige AI-tools med klientdata?",
    sub: "ChatGPT, Gemini, Copilot eller lignende — med data om kunder eller ansatte",
    options: [
      { label: "Aldrig — det er forbudt og aktivt håndhævet", points: 0 },
      { label: "Sjældent / uformelt / vi tror ikke det sker", points: 8 },
      { label: "Regelmæssigt / vi ved det faktisk ikke", points: 18 },
    ],
  },
  {
    id: 5,
    text: "Har I en systematisk proces for at opdage bias i jeres AI?",
    sub: "Test, validering og dokumentation af om AI-systemerne behandler grupper ligeværdigt",
    options: [
      { label: "Ja — løbende test og dokumenteret proces", points: 0 },
      { label: "Ad hoc — kun når et problem opstår", points: 8 },
      { label: "Nej", points: 12 },
    ],
  },
  {
    id: 6,
    text: "Gemmer eller behandler jeres AI persondata om kunder eller medarbejdere?",
    sub: "Inkl. adfærdsdata, profiler, interaktionshistorik",
    options: [
      { label: "Nej / minimalt og anonymiseret", points: 0 },
      { label: "Ja — med fuld GDPR-dokumentation og databehandleraftaler", points: 4 },
      { label: "Ja — men dokumentation er ufuldstændig", points: 12 },
    ],
  },
  {
    id: 7,
    text: "Har I dokumenteret hvem der har ansvar for hvert AI-system?",
    sub: "Klart defineret ejerskab: hvem er ansvarlig for drift, fejl og compliance?",
    options: [
      { label: "Ja — klart ejeransvar for alle systemer", points: 0 },
      { label: "Uklart / delt ansvar / afhænger af situationen", points: 8 },
      { label: "Ingen har formel ansvar for AI", points: 14 },
    ],
  },
  {
    id: 8,
    text: "Har medarbejderne fået AI-kompetencetræning?",
    sub: "EU AI Act artikel 4 kræver at alle der bruger AI har passende viden og kompetence",
    options: [
      { label: "Ja — struktureret træning gennemført i 2025–2026", points: 0 },
      { label: "Ad hoc / enkeltpersoner har fået det", points: 7 },
      { label: "Nej", points: 12 },
    ],
  },
  {
    id: 9,
    text: "Er der menneskelig oversight på alle AI-assisterede beslutninger?",
    sub: "Mennesker ser og godkender AI's output inden det påvirker rigtige mennesker",
    options: [
      { label: "Ja, altid — mennesker tager den endelige beslutning", points: 0 },
      { label: "Sommetider — afhænger af situation og medarbejder", points: 8 },
      { label: "Sjældent / AI-output bruges direkte", points: 15 },
    ],
  },
  {
    id: 10,
    text: "Kan din ledelse i dag liste jeres AI-systemer og deres risici?",
    sub: "Er der et samlet overblik — ikke blot hos IT, men i ledelses- og bestyrelseslaget?",
    options: [
      { label: "Ja — komplet overblik på ledelsesniveau", points: 0 },
      { label: "Delvist / kun IT kender billedet", points: 6 },
      { label: "Nej — det vil overraske mange", points: 12 },
    ],
  },
];

const MAX_POINTS = 123; // 20+12+18+18+12+12+14+12+15+10

// ─── Score-kategorier ─────────────────────────────────────────────────────────

interface Category {
  label: string;
  range: string;
  color: string;
  border: string;
  bg: string;
  description: string;
  urgency: string;
  cta: string;
}

const CATEGORIES: Record<string, Category> = {
  lav: {
    label: "Lav risiko",
    range: "0–25",
    color: "#7a9a60",
    border: "rgba(122,154,96,0.35)",
    bg: "rgba(122,154,96,0.06)",
    description: "Jeres organisation har et godt fundament. Men selv et solidt udgangspunkt kan have usynlige huller — særligt i dokumentation og governance, som EU AI Act stiller eksplicitte krav til.",
    urgency: "Gode nyheder — men gennemgangen er stadig værdifuld.",
    cta: "Få en gratis screeningssamtale",
  },
  moderat: {
    label: "Moderat risiko",
    range: "26–50",
    color: "#c8a878",
    border: "rgba(200,168,120,0.35)",
    bg: "rgba(200,168,120,0.06)",
    description: "I er i gang — men der er identificerede huller der kan blive kostbare. EU AI Act december 2027-deadline for high-risk systemer nærmer sig, og dokumentationsgabs tager tid at lukke.",
    urgency: "Der er tid — men ikke til at vente.",
    cta: "Book en uforpligtende risikodrøftelse",
  },
  høj: {
    label: "Høj risiko",
    range: "51–75",
    color: "#c87848",
    border: "rgba(200,120,72,0.35)",
    bg: "rgba(200,120,72,0.06)",
    description: "Jeres AI-eksponering er reel. I har systemer eller processer der sandsynligvis kræver aktiv handling under EU AI Act. Manglende compliance kan føre til bøder op til 15 mio. EUR eller 3% af global omsætning.",
    urgency: "Dette bør prioriteres i de kommende måneder.",
    cta: "Bestil en Decode Audit-samtale",
  },
  kritisk: {
    label: "Kritisk risiko",
    range: "76–100",
    color: "#e05050",
    border: "rgba(224,80,80,0.35)",
    bg: "rgba(224,80,80,0.06)",
    description: "Jeres risikoprofil er kritisk. I har sandsynligvis AI-systemer i high-risk kategorier under EU AI Act — og dokumentationen er ikke på plads. Det kræver øjeblikkelig struktureret indsats.",
    urgency: "Handl nu. Deadlines er reelle. Konsekvenser er reelle.",
    cta: "Kontakt os med det samme",
  },
};

function getCategory(score: number): string {
  if (score <= 25) return "lav";
  if (score <= 50) return "moderat";
  if (score <= 75) return "høj";
  return "kritisk";
}

// ─── Komponenter ──────────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i < current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i < current ? "var(--accent)" : i === current ? "rgba(200,168,120,0.4)" : "rgba(255,255,255,0.08)",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const cat = CATEGORIES[getCategory(score)];
  const pct = score / 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {/* Cirkulær gauge */}
      <div style={{ position: "relative", width: 180, height: 180 }}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Baggrund */}
          <circle
            cx="90" cy="90" r="75"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12"
            strokeDasharray="471"
            strokeDashoffset="118"
            strokeLinecap="round"
            transform="rotate(135 90 90)"
          />
          {/* Score-bue */}
          <circle
            cx="90" cy="90" r="75"
            fill="none"
            stroke={cat.color}
            strokeWidth="12"
            strokeDasharray="471"
            strokeDashoffset={471 - pct * 353}
            strokeLinecap="round"
            transform="rotate(135 90 90)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.6s ease" }}
          />
        </svg>
        {/* Score i midten */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 42, fontWeight: 700, color: cat.color, lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>/ 100</span>
        </div>
      </div>

      {/* Kategori-badge */}
      <div style={{
        padding: "6px 18px",
        borderRadius: 20,
        background: cat.bg,
        border: `1px solid ${cat.border}`,
        color: cat.color,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}>
        {cat.label}
      </div>
    </div>
  );
}

// ─── Hoved-komponent ─────────────────────────────────────────────────────────

type Phase = "intro" | "quiz" | "score" | "capture" | "done";

export default function RisikotestPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [animateIn, setAnimateIn] = useState(true);

  // Lead-form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const question = QUESTIONS[qIndex];
  const cat = CATEGORIES[getCategory(score)];

  function transition(fn: () => void) {
    setAnimateIn(false);
    setTimeout(() => {
      fn();
      setAnimateIn(true);
    }, 200);
  }

  function handleOptionSelect(points: number, idx: number) {
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, points];
      if (qIndex < QUESTIONS.length - 1) {
        transition(() => {
          setAnswers(newAnswers);
          setQIndex(qIndex + 1);
          setSelected(null);
        });
      } else {
        const raw = newAnswers.reduce((a, b) => a + b, 0);
        const finalScore = Math.min(100, Math.round((raw / MAX_POINTS) * 100));
        setAnswers(newAnswers);
        setScore(finalScore);
        transition(() => {
          setPhase("score");
          setSelected(null);
        });
      }
    }, 380);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setSubmitError("Ugyldig email"); return; }
    setSubmitting(true);
    setSubmitError("");

    const catKey = getCategory(score);
    const notes = company.trim() ? `Virksomhed: ${company.trim()}` : null;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim().toLowerCase(),
          score,
          source: "ai-risikotest",
          category: catKey,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Serverfejl");
      transition(() => setPhase("done"));
    } catch {
      setSubmitError("Noget gik galt. Prøv igen eller skriv til anne@decodeai.dk.");
    } finally {
      setSubmitting(false);
    }
  }

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1.5rem",
    background: "#0f0d0c",
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 640,
    background: "#1a1614",
    border: "1px solid #2a2420",
    borderRadius: 16,
    padding: "clamp(2rem, 5vw, 3rem)",
    opacity: animateIn ? 1 : 0,
    transform: animateIn ? "translateY(0)" : "translateY(12px)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0f0d0c",
    border: "1px solid #2a2420",
    borderRadius: 8,
    padding: "0.75rem 1rem",
    color: "#e8e0d8",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.15s",
  };

  // ─── INTRO ─────────────────────────────────────────────────────────────────

  if (phase === "intro") {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          {/* Logo/brand */}
          <div style={{
            fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
            color: "#c8a878", marginBottom: "2.5rem", opacity: 0.7,
          }}>
            Decode Audit · AI Risikotest
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 300,
            lineHeight: 1.2,
            color: "#e8e0d8",
            marginBottom: "1.25rem",
            letterSpacing: "-0.01em",
          }}>
            Er jeres virksomhed klar til<br />
            <span style={{ color: "#c8a878", fontStyle: "italic" }}>EU AI Act?</span>
          </h1>

          {/* Subtext */}
          <p style={{
            color: "#a09880", lineHeight: 1.75,
            marginBottom: "0.75rem", fontSize: 15,
          }}>
            10 spørgsmål. 3 minutter. Et klart billede af jeres AI-risikoniveau.
          </p>
          <p style={{
            color: "#6a5a50", lineHeight: 1.7,
            marginBottom: "2.5rem", fontSize: 13,
          }}>
            EU AI Act trådte fuldt i kraft i 2025. Reglerne for high-risk AI-systemer
            gælder fra december 2027 — men compliance tager tid at bygge.
            Bøder: op til 15 mio. EUR eller 3% af global omsætning.
          </p>

          {/* Start-knap */}
          <button
            onClick={() => transition(() => setPhase("quiz"))}
            style={{
              background: "#c8a878", color: "#0f0d0c",
              border: "none", borderRadius: 10,
              padding: "0.9rem 2.5rem",
              fontSize: 15, fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer", letterSpacing: "0.01em",
              transition: "opacity 0.15s, transform 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.opacity = "0.87"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Start testen →
          </button>

          {/* Trust signals */}
          <p style={{ color: "#4a3a30", fontSize: 12, marginTop: "1.5rem" }}>
            Anonymt · Ingen spam · Resultater vises med det samme
          </p>
        </div>
      </div>
    );
  }

  // ─── QUIZ ─────────────────────────────────────────────────────────────────

  if (phase === "quiz") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {/* Header: progress */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <ProgressDots current={qIndex} total={QUESTIONS.length} />
            <span style={{ fontSize: 12, color: "#6a5a50", letterSpacing: "0.04em" }}>
              {qIndex + 1} / {QUESTIONS.length}
            </span>
          </div>

          {/* Spørgsmål */}
          <h2 style={{
            fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
            fontWeight: 400,
            color: "#e8e0d8",
            lineHeight: 1.4,
            marginBottom: question.sub ? "0.6rem" : "2rem",
          }}>
            {question.text}
          </h2>

          {question.sub && (
            <p style={{ fontSize: 13, color: "#6a5a50", marginBottom: "2rem", lineHeight: 1.6 }}>
              {question.sub}
            </p>
          )}

          {/* Svarmuligheder */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {question.options.map((opt, idx) => {
              const isSelected = selected === idx;
              return (
                <button
                  key={idx}
                  onClick={() => !selected && handleOptionSelect(opt.points, idx)}
                  style={{
                    background: isSelected ? "rgba(200,168,120,0.1)" : "#0f0d0c",
                    border: `1px solid ${isSelected ? "#c8a878" : "#2a2420"}`,
                    borderRadius: 10,
                    padding: "1rem 1.25rem",
                    color: isSelected ? "#e8e0d8" : "#a09880",
                    fontSize: 14,
                    textAlign: "left",
                    cursor: selected !== null ? "default" : "pointer",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                  onMouseOver={(e) => {
                    if (selected === null) {
                      e.currentTarget.style.borderColor = "rgba(200,168,120,0.4)";
                      e.currentTarget.style.color = "#e8e0d8";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selected === null) {
                      e.currentTarget.style.borderColor = "#2a2420";
                      e.currentTarget.style.color = "#a09880";
                    }
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: `2px solid ${isSelected ? "#c8a878" : "#3a2a20"}`,
                    background: isSelected ? "#c8a878" : "transparent",
                    flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#0f0d0c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── SCORE ────────────────────────────────────────────────────────────────

  if (phase === "score") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {/* Score-visning */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6a5a50", marginBottom: "1.5rem" }}>
              Jeres AI-risikoniveau
            </div>
            <ScoreGauge score={score} />
          </div>

          {/* Kategori-forklaring */}
          <div style={{
            background: cat.bg,
            border: `1px solid ${cat.border}`,
            borderRadius: 10,
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: cat.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
              {cat.urgency}
            </div>
            <p style={{ fontSize: 14, color: "#a09880", lineHeight: 1.7 }}>
              {cat.description}
            </p>
          </div>

          {/* Hvad sker der nu */}
          <p style={{ fontSize: 14, color: "#6a5a50", lineHeight: 1.65, marginBottom: "1.75rem" }}>
            Udfyld formularen nedenfor — vi sender dig en kort personlig vurdering
            baseret på jeres score og kontakter dig inden for 24 timer.
          </p>

          <button
            onClick={() => transition(() => setPhase("capture"))}
            style={{
              width: "100%",
              background: "#c8a878", color: "#0f0d0c",
              border: "none", borderRadius: 10,
              padding: "0.9rem",
              fontSize: 15, fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.opacity = "0.87"; }}
            onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {cat.cta} →
          </button>
        </div>
      </div>
    );
  }

  // ─── CAPTURE ──────────────────────────────────────────────────────────────

  if (phase === "capture") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6a5a50", marginBottom: "0.75rem" }}>
              Score: <span style={{ color: cat.color }}>{score}/100 · {cat.label}</span>
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 400, color: "#e8e0d8", lineHeight: 1.3, marginBottom: "0.6rem" }}>
              Hvem sender vi vurderingen til?
            </h2>
            <p style={{ fontSize: 13, color: "#6a5a50", lineHeight: 1.6 }}>
              Anne Ringgaard — ISTQB CT-AI certificeret, EU AI Act specialist — sender dig en personlig vurdering inden for 24 timer.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              placeholder="Navn (valgfrit)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(200,168,120,0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2420"; }}
            />
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(200,168,120,0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2420"; }}
            />
            <input
              type="text"
              placeholder="Virksomhed (valgfrit)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(200,168,120,0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2420"; }}
            />

            {submitError && (
              <p style={{ color: "#e05050", fontSize: 13 }}>{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? "#3a2a20" : "#c8a878",
                color: submitting ? "#6a5a50" : "#0f0d0c",
                border: "none", borderRadius: 10,
                padding: "0.9rem",
                fontSize: 15, fontWeight: 600, fontFamily: "inherit",
                cursor: submitting ? "default" : "pointer",
                marginTop: 4,
                transition: "all 0.15s",
              }}
            >
              {submitting ? "Sender..." : "Send mig vurderingen →"}
            </button>
          </form>

          <p style={{ fontSize: 11, color: "#4a3a30", marginTop: "1rem", textAlign: "center" }}>
            Vi deler aldrig din email med tredjepart · GDPR-compliant · Afmeld til enhver tid
          </p>
        </div>
      </div>
    );
  }

  // ─── DONE ─────────────────────────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, textAlign: "center" }}>
        {/* Check-ikon */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(122,154,96,0.1)",
          border: "1px solid rgba(122,154,96,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.5rem",
        }}>
          <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
            <path d="M2 11L10 19L26 2" stroke="#7a9a60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: 400, color: "#e8e0d8", marginBottom: "0.75rem" }}>
          Tak — vi er på det.
        </h2>
        <p style={{ color: "#a09880", lineHeight: 1.75, marginBottom: "0.5rem", fontSize: 14 }}>
          Anne sender dig en personlig vurdering inden for 24 timer baseret på jeres score.
        </p>
        <p style={{ color: "#6a5a50", lineHeight: 1.65, marginBottom: "2rem", fontSize: 13 }}>
          Har du spørgsmål der ikke kan vente? Skriv direkte til{" "}
          <a href="mailto:anne@decodeai.dk" style={{ color: "#c8a878", textDecoration: "none" }}>
            anne@decodeai.dk
          </a>
        </p>

        {/* Score opsummering */}
        <div style={{
          background: cat.bg,
          border: `1px solid ${cat.border}`,
          borderRadius: 10,
          padding: "1rem 1.25rem",
          marginBottom: "1.75rem",
        }}>
          <div style={{ fontSize: 12, color: cat.color, fontWeight: 600, marginBottom: 4 }}>
            Jeres score: {score}/100 · {cat.label}
          </div>
          <div style={{ fontSize: 13, color: "#6a5a50" }}>
            {cat.urgency}
          </div>
        </div>

        {/* Audit-link */}
        <a
          href="https://audit.decodeai.dk"
          style={{
            display: "inline-block",
            background: "none",
            border: "1px solid #2a2420",
            borderRadius: 10,
            padding: "0.75rem 1.75rem",
            color: "#a09880",
            fontSize: 14,
            textDecoration: "none",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "rgba(200,168,120,0.35)"; e.currentTarget.style.color = "#e8e0d8"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "#2a2420"; e.currentTarget.style.color = "#a09880"; }}
        >
          Se hvad Decode Audit indeholder →
        </a>
      </div>
    </div>
  );
}
