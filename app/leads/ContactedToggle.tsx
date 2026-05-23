"use client";
// ContactedToggle.tsx — lead actions: kontaktet toggle + email draft
// Version 1.1 — 2026-05-23 (tilføjet: email draft generator)
// Version 1.0 — 2026-05-23 (oprettet)
import { useState } from "react";

interface LeadActionProps {
  id: string;
  initial: boolean;
  email: string;
  name: string | null;
  score: number | null;
  source: string;
  category: string | null;
  notes: string | null;
}

// ── Contacted toggle ──────────────────────────────────────────────────────────

function ContactedToggle({ id, initial, onChange }: { id: string; initial: boolean; onChange: (v: boolean) => void }) {
  const [contacted, setContacted] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const next = !contacted;
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, contacted: next }),
      });
      setContacted(next);
      onChange(next);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        background: contacted ? "rgba(74,222,128,0.1)" : "var(--surface)",
        border: `1px solid ${contacted ? "rgba(74,222,128,0.3)" : "var(--border)"}`,
        color: contacted ? "#4ade80" : "var(--muted)",
        borderRadius: 6,
        padding: "4px 10px",
        fontSize: 11,
        fontWeight: 500,
        cursor: loading ? "default" : "pointer",
        opacity: loading ? 0.6 : 1,
        whiteSpace: "nowrap",
        transition: "all 0.15s",
      }}
    >
      {contacted ? "✓ Kontaktet" : "Markér kontaktet"}
    </button>
  );
}

// ── Email draft modal ─────────────────────────────────────────────────────────

function EmailDraftModal({ draft, email, onClose }: { draft: string; email: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(draft).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const mailtoHref = `mailto:${email}?body=${encodeURIComponent(draft)}`;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 24, maxWidth: 560, width: "100%",
          maxHeight: "80vh", overflow: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Email-udkast</span>
          <button onClick={onClose} style={{ color: "var(--muted)", cursor: "pointer", fontSize: 16, background: "none", border: "none" }}>✕</button>
        </div>

        <pre style={{
          fontSize: 12, lineHeight: 1.6, color: "var(--text)",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          background: "var(--bg)", padding: 16, borderRadius: 8,
          border: "1px solid var(--border)", marginBottom: 16,
          fontFamily: "inherit",
        }}>
          {draft}
        </pre>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={copy}
            style={{
              flex: 1, padding: "8px 16px", borderRadius: 6, fontSize: 12,
              background: copied ? "rgba(74,222,128,0.1)" : "var(--accent)",
              color: copied ? "#4ade80" : "white",
              border: copied ? "1px solid rgba(74,222,128,0.3)" : "none",
              cursor: "pointer", fontWeight: 500, transition: "all 0.15s",
            }}
          >
            {copied ? "✓ Kopieret" : "Kopiér"}
          </button>
          <a
            href={mailtoHref}
            style={{
              flex: 1, padding: "8px 16px", borderRadius: 6, fontSize: 12,
              background: "var(--surface)", color: "var(--accent)",
              border: "1px solid var(--border)",
              cursor: "pointer", fontWeight: 500, textDecoration: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            Åbn i mail →
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function LeadActions({
  id, initial, email, name, score, source, category, notes,
}: LeadActionProps) {
  const [contacted, setContacted] = useState(initial);
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateDraft() {
    setDrafting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, score, source, category, notes }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDraft(data.draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fejl");
    } finally {
      setDrafting(false);
    }
  }

  return (
    <>
      {draft && (
        <EmailDraftModal
          draft={draft}
          email={email}
          onClose={() => setDraft(null)}
        />
      )}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button
          onClick={generateDraft}
          disabled={drafting}
          title="Generer personaliseret opfølgningsmail"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: error ? "#f87171" : "var(--muted)",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 500,
            cursor: drafting ? "default" : "pointer",
            opacity: drafting ? 0.6 : 1,
            whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
        >
          {drafting ? "Skriver…" : error ? "Fejl" : "✉ Draft"}
        </button>
        <ContactedToggle id={id} initial={contacted} onChange={setContacted} />
      </div>
    </>
  );
}

// backwards compat — brugt i page.tsx
export { ContactedToggle };
