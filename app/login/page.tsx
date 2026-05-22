"use client";
import { useState } from "react";

const DEADLINE = "august 2026";
const CONTACT = "anne@decodeai.dk";

const features = [
  "EU AI Act compliance tracking per system",
  "Test cases, incidents og krav i ét overblik",
  "Immutabel audit log — klar til Article 12",
  "Compliance rate og gap-analyse på tværs af systemer",
  "Strukturerede rapporter til DPO, CTO og revisor",
];

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.replace("/");
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .da-landing {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 0;
          min-height: calc(100vh - 52px);
        }
        .da-left {
          padding: 5rem 4rem 5rem 3rem;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .da-right {
          padding: 5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .da-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .da-eyebrow::before {
          content: '';
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--accent);
          display: inline-block;
          animation: breathe 3s ease-in-out infinite;
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .da-h1 {
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 700;
          line-height: 1.2;
          color: var(--text);
          margin-bottom: 1.2rem;
        }
        .da-h1 em {
          font-style: normal;
          color: var(--accent);
        }
        .da-sub {
          font-size: 0.95rem;
          color: var(--muted);
          line-height: 1.75;
          max-width: 520px;
          margin-bottom: 2.5rem;
        }
        .da-features {
          list-style: none;
          padding: 0;
          margin: 0 0 2.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .da-features li {
          font-size: 0.87rem;
          color: var(--muted);
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          line-height: 1.5;
        }
        .da-features li::before {
          content: '—';
          color: var(--accent);
          opacity: 0.5;
          flex-shrink: 0;
          margin-top: 0.05em;
        }
        .da-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--accent);
          color: #1a1208;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 0.8rem 1.6rem;
          border-radius: 8px;
          text-decoration: none;
          transition: opacity 0.2s;
          align-self: flex-start;
        }
        .da-cta:hover { opacity: 0.88; }
        .da-cta-note {
          font-size: 0.75rem;
          color: var(--muted);
          margin-top: 0.8rem;
          opacity: 0.7;
        }
        .da-deadline {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(224, 82, 82, 0.08);
          border: 1px solid rgba(224, 82, 82, 0.2);
          border-radius: 6px;
          padding: 0.5rem 0.9rem;
          font-size: 0.78rem;
          color: #e05252;
          margin-bottom: 2rem;
        }
        .da-divider {
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          opacity: 0.4;
          text-align: center;
          margin: 2rem 0;
          position: relative;
        }
        .da-divider::before, .da-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 30%;
          height: 1px;
          background: var(--border);
        }
        .da-divider::before { left: 0; }
        .da-divider::after { right: 0; }
        .da-login-label {
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          opacity: 0.6;
          margin-bottom: 1.2rem;
        }
        @media (max-width: 860px) {
          .da-landing {
            grid-template-columns: 1fr;
          }
          .da-left {
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding: 3rem 1.5rem;
          }
          .da-right {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>

      <div className="da-landing">
        {/* LEFT — Marketing */}
        <div className="da-left">
          <div className="da-eyebrow">Decode Audit · EU AI Act Compliance</div>

          <div className="da-deadline">
            ⏱ EU AI Act: fuldt ikrafttræden {DEADLINE}
          </div>

          <h1 className="da-h1">
            Find hvad jeres AI<br />
            <em>faktisk gør.</em>
          </h1>

          <p className="da-sub">
            Decode Audit er en struktureret compliance-platform til AI-systemer i produktion.
            Dokumenterede testresultater, incidents og krav — samlet ét sted, klar til
            EU AI Act Article 12 og jeres næste revisor-gennemgang.
          </p>

          <ul className="da-features">
            {features.map((f) => <li key={f}>{f}</li>)}
          </ul>

          <a
            href={`mailto:${CONTACT}?subject=Decode%20Audit%20—%20forespørgsel&body=Hej%20Anne%2C%0A%0AJeg%20er%20interesseret%20i%20Decode%20Audit.%0A%0AMed%20venlig%20hilsen`}
            className="da-cta"
          >
            Book en gratis samtale med Anne →
          </a>
          <p className="da-cta-note">
            Svar inden for én hverdag · {CONTACT}
          </p>
        </div>

        {/* RIGHT — Login */}
        <div className="da-right">
          <div className="da-login-label">Eksisterende kunder</div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="password"
              placeholder="Adgangskode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{
                background: "var(--bg)",
                border: `1px solid ${error ? "var(--failed)" : "var(--border)"}`,
                borderRadius: 8,
                padding: "10px 14px",
                color: "var(--text)",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                width: "100%",
              }}
            />
            {error && (
              <div style={{ color: "var(--failed)", fontSize: 12 }}>
                Forkert adgangskode.
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                background: loading || !password ? "var(--border)" : "var(--accent)",
                color: loading || !password ? "var(--muted)" : "#1a1208",
                border: "none",
                borderRadius: 8,
                padding: "10px",
                fontWeight: 600,
                fontSize: 14,
                cursor: loading || !password ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {loading ? "Logger ind..." : "Log ind"}
            </button>
          </form>

          <div className="da-divider">eller</div>

          <div style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.7 }}>
            Ny kunde?{" "}
            <a
              href={`mailto:${CONTACT}`}
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              Skriv til Anne
            </a>{" "}
            for adgang til en demo-konto.
          </div>
        </div>
      </div>
    </>
  );
}
