// app/landing/page.tsx — Decode Audit public landing page
// Version 1.0 — 2026-05-23
//
// Vises til uauthentiserede besøgende (via proxy.ts redirect).
// B2B landingpage: forklarer hvad Decode Audit er + klar CTA.
// URL: audit.decodeai.dk/landing

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Decode Audit — AI-kvalitetssikring og EU AI Act compliance",
  description: "Kortlæg risici, dokumentér processer og sikr at jeres AI-systemer lever op til EU AI Act. For teams der bruger AI i Danmark.",
}

const FEATURES = [
  {
    icon: "⚖",
    title: "EU AI Act compliance",
    desc: "Risikoklassificering, dokumentationskrav og løbende overvågning tilpasset jeres systemer. High-risk deadline: december 2027.",
  },
  {
    icon: "🔍",
    title: "Risikokortlægning",
    desc: "Systematisk kortlægning af AI-risici på tværs af systemer — ikke en tjekliste, men en levende auditlog.",
  },
  {
    icon: "📋",
    title: "Audit-rapport",
    desc: "Struktureret dokumentation til bestyrelse, jurister og tilsyn. Genbrugelig ved fremtidige audits.",
  },
  {
    icon: "📡",
    title: "Løbende overvågning",
    desc: "Dashboard med incidents, testresultater og compliance-status. Alerting når noget ændrer sig.",
  },
]

const PROCESS = [
  { n: 1, title: "Kortlægning", desc: "Vi identificerer jeres AI-systemer, deres formål og potentielle risikoklasse under EU AI Act." },
  { n: 2, title: "Dokumentation", desc: "Systematisk dokumentation af processer, databaser, bias-risici og menneskelig oversight." },
  { n: 3, title: "Audit-rapport", desc: "Rapport med konkrete anbefalinger, prioriterede indsatser og lovkrav der gælder for jer." },
  { n: 4, title: "Dashboard", desc: "Adgang til Decode Audit — løbende sporing af compliance-status, incidents og testresultater." },
]

const WHO = [
  "Teams der bruger AI i HR, rekruttering, kundeservice eller intern drift",
  "Virksomheder der vil forstå hvad EU AI Act opdateringen (maj 2026) betyder for dem",
  "Organisationer der vil dokumentere AI-brug til bestyrelse, revisor eller offentlige myndigheder",
  "Tech-teams der vil have én kilde til sandhed om AI-systemernes tilstand",
]

export default function LandingPage() {
  const deadline = new Date("2026-08-02")
  const today = new Date()
  // daysLeft fjernet 2026-05-25 — deadline rykket til december 2027, banner ændret
  // const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <main style={{ background: "#0f0d0c", color: "#e8e0d8", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", minHeight: "100vh" }}>

      {/* ── Nav ── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1.25rem 2rem", borderBottom: "1px solid #1a1614",
        maxWidth: 1100, margin: "0 auto",
      }}>
        <div>
          <span style={{ color: "#c8a878", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.05em" }}>
            Decode Audit
          </span>
          <span style={{ color: "#3a3228", fontSize: "0.75rem", marginLeft: "0.75rem" }}>
            by Decode AI
          </span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a href="/demo" style={{
            color: "#c8a878", fontSize: "0.8rem", textDecoration: "none",
          }}>
            Se demo →
          </a>
          <a href="mailto:anne@decodeai.dk?subject=Decode Audit — forespørgsel" style={{
            color: "#a09890", fontSize: "0.8rem", textDecoration: "none",
          }}>
            Kontakt
          </a>
          <a href="/login" style={{
            color: "#c8a878", fontSize: "0.8rem", textDecoration: "none",
            border: "1px solid #2a2418", borderRadius: 8,
            padding: "0.4rem 0.9rem",
          }}>
            Log ind
          </a>
        </div>
      </nav>

      {/* ── EU AI Act opdatering banner ── */}
      {/* Maj 2026: Annex III high-risk deadline rykket til december 2027 — nyt hook: reglerne ændrede sig */}
      <div style={{
        background: "#0e1218", borderBottom: "1px solid #1a2030",
        padding: "0.6rem 2rem", textAlign: "center",
      }}>
        <p style={{ color: "#6a8aaa", fontSize: "0.78rem", letterSpacing: "0.04em" }}>
          EU AI Act opdateret maj 2026 — ny deadline for high-risk systemer: december 2027. <a href="/risikotest" style={{ color: "#c8a878", textDecoration: "none" }}>Kender I jeres risikostatus? →</a>
        </p>
      </div>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <p style={{ color: "#5a4a40", fontSize: "0.68rem", letterSpacing: "0.2em", marginBottom: "1.5rem" }}>
          EU AI ACT · COMPLIANCE · RISIKOSTYRING
        </p>
        <h1 style={{
          fontFamily: "Georgia, serif", fontWeight: 300,
          fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.2,
          marginBottom: "1.5rem", letterSpacing: "-0.02em",
        }}>
          AI-kvalitetssikring<br />der er til at forstå
        </h1>
        <p style={{ color: "#a09890", fontSize: "clamp(0.95rem, 2vw, 1.05rem)", lineHeight: 1.85, maxWidth: 560, margin: "0 auto 2.5rem" }}>
          Decode Audit hjælper jer med at kortlægge risici, dokumentere AI-processer og
          leve op til EU AI Act — ikke med en tjekliste, men med et levende system
          der følger jeres systemer over tid.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="mailto:anne@decodeai.dk?subject=Decode Audit — forespørgsel"
            style={{
              display: "inline-block",
              background: "#c8a878", color: "#0f0d0c",
              padding: "0.9rem 2.25rem", borderRadius: 12,
              textDecoration: "none", fontSize: "0.95rem",
              fontWeight: 600, letterSpacing: "0.02em",
            }}
          >
            Book en snak med Anne →
          </a>
          <a
            href="#hvordan"
            style={{
              display: "inline-block",
              border: "1px solid #2a2420", color: "#a09890",
              padding: "0.9rem 2rem", borderRadius: 12,
              textDecoration: "none", fontSize: "0.9rem",
            }}
          >
            Læs mere ↓
          </a>
        </div>
        <p style={{ color: "#3a3228", fontSize: "0.72rem", marginTop: "1.25rem" }}>
          Ingen binding · Samtalen er gratis · Kontakt: anne@decodeai.dk
        </p>
      </section>

      {/* ── Features ── */}
      <section id="hvad" style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem 2rem 5rem" }}>
        <p style={{ color: "#5a4a40", fontSize: "0.65rem", letterSpacing: "0.15em", textAlign: "center", marginBottom: "2.5rem" }}>
          HVAD DECODE AUDIT GIVER JER
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: "#141210", border: "1px solid #1e1a18",
              borderRadius: 14, padding: "1.75rem 1.5rem",
            }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "0.75rem" }}>{f.icon}</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 300, fontSize: "1rem", marginBottom: "0.5rem" }}>
                {f.title}
              </h3>
              <p style={{ color: "#7a6a60", fontSize: "0.82rem", lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Hvem er det til ── */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 2rem 5rem" }}>
        <div style={{ background: "#141210", border: "1px solid #1e1a18", borderRadius: 16, padding: "2rem 2.5rem" }}>
          <p style={{ color: "#5a4a40", fontSize: "0.65rem", letterSpacing: "0.15em", marginBottom: "1.25rem" }}>
            HVEM DET ER TIL
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {WHO.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <span style={{ color: "#7a9a60", flexShrink: 0, marginTop: "0.1rem" }}>✓</span>
                <span style={{ color: "#a09890", fontSize: "0.88rem", lineHeight: 1.7 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Processen ── */}
      <section id="hvordan" style={{ maxWidth: 720, margin: "0 auto", padding: "0 2rem 5rem" }}>
        <p style={{ color: "#5a4a40", fontSize: "0.65rem", letterSpacing: "0.15em", textAlign: "center", marginBottom: "2.5rem" }}>
          SÅDAN ARBEJDER VI
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {PROCESS.map((s, i, arr) => (
            <div key={i} style={{ display: "flex", gap: "1.25rem", position: "relative" as const }}>
              <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: i === 0 ? "#c8a878" : "#1e1a18",
                  border: `1px solid ${i === 0 ? "#c8a878" : "#2a2420"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.72rem", color: i === 0 ? "#0f0d0c" : "#5a4a40",
                  flexShrink: 0,
                }}>
                  {s.n}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: "#1e1a18", minHeight: 36 }} />
                )}
              </div>
              <div style={{ paddingBottom: i < arr.length - 1 ? "1.75rem" : 0, paddingTop: "0.35rem" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "1rem", fontWeight: 300, margin: "0 0 0.25rem" }}>
                  {s.title}
                </p>
                <p style={{ color: "#5a4a40", fontSize: "0.82rem", lineHeight: 1.6, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Om Anne ── */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 2rem 5rem" }}>
        <div style={{ background: "#141210", border: "1px solid #1e1a18", borderRadius: 16, padding: "2rem 2.5rem" }}>
          <p style={{ color: "#5a4a40", fontSize: "0.65rem", letterSpacing: "0.15em", marginBottom: "1rem" }}>
            OM ANNE RINGGAARD
          </p>
          <p style={{ color: "#c8c0b8", lineHeight: 1.9, fontSize: "0.95rem", marginBottom: "1rem" }}>
            Anne Ringgaard arbejder med AI-kvalitetssikring og EU AI Act compliance for virksomheder
            og teams der bruger AI i Danmark. Hun bygger systemer der holder — ikke rapporter der samler støv.
          </p>
          <p style={{ color: "#a09890", lineHeight: 1.8, fontSize: "0.88rem", marginBottom: "1rem" }}>
            Bag Decode Audit er der en person der selv bygger og tester AI-systemer.
            Det er ikke konsulentsprog — det er hands-on forståelse for hvad der går galt
            og præcis hvad I skal dokumentere.
          </p>
          <p style={{ color: "#5a4a40", lineHeight: 1.8, fontSize: "0.82rem" }}>
            Anne arbejder også med MCT-coaching for neurodivergente.{" "}
            <a href="https://www.decodeai.dk" style={{ color: "#6a7a68", textDecoration: "none" }}>
              Decode Coaching →
            </a>
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ textAlign: "center", padding: "0 2rem 6rem", maxWidth: 520, margin: "0 auto" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#c8a878" }}>✦</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 300, fontSize: "1.8rem", marginBottom: "1rem" }}>
          Klar til at kortlægge?
        </h2>
        <p style={{ color: "#a09890", lineHeight: 1.85, marginBottom: "2rem", fontSize: "0.93rem" }}>
          En gratis snak afklarer om Decode Audit passer til jer —
          hvad I har, hvad I mangler, og hvad der haster mest.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
          <a
            href="/risikotest"
            style={{
              display: "inline-block",
              background: "#c8a878", color: "#0f0d0c",
              padding: "0.9rem 2rem", borderRadius: 12,
              textDecoration: "none", fontSize: "0.95rem",
              fontWeight: 600, letterSpacing: "0.02em",
            }}
          >
            Tag AI Risikotest →
          </a>
          <a
            href="mailto:anne@decodeai.dk?subject=Decode Audit — forespørgsel&body=Hej Anne,%0A%0AJeg er interesseret i at høre mere om Decode Audit.%0A%0AVores AI-systemer / situation:%0A%0A"
            style={{
              display: "inline-block",
              background: "#1a1614", color: "#c8a878",
              padding: "0.9rem 2rem", borderRadius: 12,
              textDecoration: "none", fontSize: "0.95rem",
              fontWeight: 500, border: "1px solid #2a2418",
            }}
          >
            Skriv til Anne →
          </a>
        </div>
        <p style={{ color: "#3a3228", fontSize: "0.72rem" }}>
          anne@decodeai.dk · Svar inden for 24 timer
        </p>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid #1a1614", padding: "1.5rem 2rem",
        display: "flex", justifyContent: "space-between", flexWrap: "wrap" as const,
        gap: "0.5rem", maxWidth: 1100, margin: "0 auto",
      }}>
        <p style={{ color: "#3a3228", fontSize: "0.7rem" }}>
          © 2026 Decode AI · Anne Ringgaard · anne@decodeai.dk
        </p>
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          <a href="https://www.decodeai.dk" style={{ color: "#3a3228", fontSize: "0.7rem", textDecoration: "none" }}>
            Decode Coaching
          </a>
          <a href="/login" style={{ color: "#3a3228", fontSize: "0.7rem", textDecoration: "none" }}>
            Log ind →
          </a>
        </div>
      </footer>

    </main>
  )
}
