"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const INPUT: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 6, padding: "8px 12px", color: "var(--text)",
  fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Afventer" },
  { value: "met", label: "Opfyldt" },
  { value: "partial", label: "Delvist opfyldt" },
  { value: "not_met", label: "Ikke opfyldt" },
  { value: "na", label: "N/A" },
];

export default function UpdateComplianceForm({
  itemId, currentStatus, currentEvidence,
}: {
  itemId: number;
  currentStatus: string;
  currentEvidence: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [evidence, setEvidence] = useState(currentEvidence ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/compliance/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, evidence: evidence || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fejl");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginTop: 20 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", padding: "12px 16px", display: "flex", justifyContent: "space-between",
          alignItems: "center", fontSize: 13, fontWeight: 500, color: "var(--text)",
          background: "transparent", cursor: "pointer",
        }}
      >
        <span>Opdater status og evidence</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form onSubmit={submit} style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
            <select style={INPUT} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Evidence / dokumentation</label>
            <textarea
              style={{ ...INPUT, minHeight: 90, resize: "vertical" }}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Link til testresultat, dokument, eller beskrivelse af hvordan kravet er opfyldt..."
            />
          </div>
          {error && <div style={{ color: "var(--failed)", fontSize: 12 }}>{error}</div>}
          <button
            type="submit"
            disabled={saving}
            style={{
              alignSelf: "flex-start",
              background: saving ? "var(--border)" : "var(--accent)",
              color: saving ? "var(--muted)" : "#1a1208",
              border: "none", borderRadius: 6, padding: "8px 16px",
              fontWeight: 600, fontSize: 13, cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Gemmer..." : "Gem ændringer"}
          </button>
        </form>
      )}
    </div>
  );
}
