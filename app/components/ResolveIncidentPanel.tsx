"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const INPUT: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 6, padding: "8px 12px", color: "var(--text)",
  fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%",
};

export default function ResolveIncidentPanel({ incidentId, status }: { incidentId: number; status: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ root_cause: "", resolution_notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "resolved" || status === "wont_fix") return null;

  const set = (k: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function resolve(action: "resolved" | "wont_fix") {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action,
          root_cause: form.root_cause || null,
          resolution_notes: form.resolution_notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fejl");
      }
      router.refresh();
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", padding: "12px 16px", display: "flex", justifyContent: "space-between",
          alignItems: "center", fontSize: 13, fontWeight: 500, color: "var(--text)",
          background: "transparent", cursor: "pointer",
        }}
      >
        <span>Luk incident</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rodårsag</label>
            <textarea
              style={{ ...INPUT, minHeight: 70, resize: "vertical" }}
              value={form.root_cause}
              onChange={set("root_cause")}
              placeholder="Hvad var den underliggende årsag?"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Løsningsnoter</label>
            <textarea
              style={{ ...INPUT, minHeight: 70, resize: "vertical" }}
              value={form.resolution_notes}
              onChange={set("resolution_notes")}
              placeholder="Hvad blev gjort for at løse det?"
            />
          </div>
          {error && <div style={{ color: "var(--failed)", fontSize: 12 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => resolve("resolved")}
              disabled={saving}
              style={{
                background: saving ? "var(--border)" : "var(--passed)",
                color: saving ? "var(--muted)" : "#0e1a0e",
                border: "none", borderRadius: 6, padding: "8px 16px",
                fontWeight: 600, fontSize: 13, cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Gemmer..." : "Marker som løst"}
            </button>
            <button
              onClick={() => resolve("wont_fix")}
              disabled={saving}
              style={{
                background: "transparent",
                color: "var(--muted)",
                border: "1px solid var(--border)", borderRadius: 6, padding: "8px 16px",
                fontWeight: 500, fontSize: 13, cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              Ignorer (won&apos;t fix)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
