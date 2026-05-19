"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const INPUT: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 6, padding: "8px 12px", color: "var(--text)",
  fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%",
};

const STATUS_OPTIONS = [
  { value: "passed", label: "Bestået", color: "var(--passed)", bg: "#0e1a0e", border: "var(--sev4-border)" },
  { value: "failed", label: "Fejlet", color: "var(--failed)", bg: "var(--sev1-bg)", border: "var(--sev1-border)" },
  { value: "flaky", label: "Ustabil", color: "var(--flaky)", bg: "var(--sev2-bg)", border: "var(--sev2-border)" },
  { value: "pending", label: "Nulstil til afventer", color: "var(--muted)", bg: "var(--surface)", border: "var(--border)" },
];

export default function RunTestForm({ testId, currentStatus }: { testId: number; currentStatus: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("passed");
  const [actualOutput, setActualOutput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/test-cases/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          actual_output: actualOutput || null,
        }),
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

  const selected = STATUS_OPTIONS.find((o) => o.value === selectedStatus) ?? STATUS_OPTIONS[0];

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginTop: 16 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", padding: "12px 16px", display: "flex", justifyContent: "space-between",
          alignItems: "center", fontSize: 13, fontWeight: 500, color: "var(--text)",
          background: "transparent", cursor: "pointer",
        }}
      >
        <span>Registrer testkørsel</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form onSubmit={submit} style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Resultat</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setSelectedStatus(o.value)}
                  style={{
                    padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                    color: selectedStatus === o.value ? o.color : "var(--muted)",
                    background: selectedStatus === o.value ? o.bg : "var(--bg)",
                    border: `1px solid ${selectedStatus === o.value ? o.border : "var(--border)"}`,
                    cursor: "pointer",
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Faktisk output <span style={{ fontWeight: 400 }}>(valgfrit)</span>
            </label>
            <textarea
              style={{ ...INPUT, minHeight: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
              value={actualOutput}
              onChange={(e) => setActualOutput(e.target.value)}
              placeholder={selectedStatus === "failed"
                ? "Hvad returnerede systemet som var forkert?"
                : "Systemets faktiske output eller observation..."}
            />
          </div>

          {error && <div style={{ color: "var(--failed)", fontSize: 12 }}>{error}</div>}

          <button
            type="submit"
            disabled={saving}
            style={{
              alignSelf: "flex-start",
              background: saving ? "var(--border)" : selected.bg,
              color: saving ? "var(--muted)" : selected.color,
              border: `1px solid ${saving ? "var(--border)" : selected.border}`,
              borderRadius: 6, padding: "8px 16px",
              fontWeight: 600, fontSize: 13, cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Gemmer..." : `Gem — ${selected.label}`}
          </button>
        </form>
      )}
    </div>
  );
}
