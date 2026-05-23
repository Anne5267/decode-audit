"use client";
// ContactedToggle.tsx — markér lead som kontaktet / ikke kontaktet
import { useState } from "react";

export function ContactedToggle({ id, initial }: { id: string; initial: boolean }) {
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
