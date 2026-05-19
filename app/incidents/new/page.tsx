"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const FIELD = { display: "flex", flexDirection: "column" as const, gap: 6 };
const LABEL = { fontSize: 12, color: "var(--muted)", fontWeight: 500 };
const INPUT: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 6, padding: "8px 12px", color: "var(--text)",
  fontSize: 14, fontFamily: "inherit", outline: "none",
};

interface System { id: number; name: string; }

export default function NewIncidentPage() {
  return <Suspense><NewIncidentForm /></Suspense>;
}

function NewIncidentForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [form, setForm] = useState({
    system_id: sp.get("system_id") ?? "",
    title: "", description: "", category: "accuracy",
    severity: "3", detected_by: "", assigned_to: "", impact: "",
  });

  useEffect(() => {
    fetch("/api/systems").then((r) => r.json()).then(setSystems).catch(() => {});
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          system_id: Number(form.system_id),
          severity: Number(form.severity),
          impact: form.impact || null,
          detected_by: form.detected_by || null,
          assigned_to: form.assigned_to || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fejl");
      router.push(`/incidents/${data.id}`);
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24, fontSize: 13 }}>
        <a href="/incidents" style={{ color: "var(--muted)" }}>← Incidents</a>
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Ny Incident</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={FIELD}>
          <label style={LABEL}>AI System *</label>
          <select style={INPUT} value={form.system_id} onChange={set("system_id")} required>
            <option value="">Vælg system...</option>
            {systems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Titel *</label>
          <input style={INPUT} value={form.title} onChange={set("title")} required placeholder="Kort, præcis beskrivelse af problemet" />
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Beskrivelse *</label>
          <textarea style={{ ...INPUT, minHeight: 100, resize: "vertical" }} value={form.description} onChange={set("description")} required placeholder="Hvad skete der? Hvornår? Hvad var konteksten?" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={FIELD}>
            <label style={LABEL}>Kategori *</label>
            <select style={INPUT} value={form.category} onChange={set("category")} required>
              <option value="accuracy">Accuracy</option>
              <option value="bias">Bias</option>
              <option value="safety">Safety</option>
              <option value="hallucination">Hallucination</option>
              <option value="performance">Performance</option>
              <option value="compliance">Compliance</option>
              <option value="data_quality">Data quality</option>
              <option value="other">Andet</option>
            </select>
          </div>
          <div style={FIELD}>
            <label style={LABEL}>Severity</label>
            <select style={INPUT} value={form.severity} onChange={set("severity")}>
              <option value="1">1 — Kritisk</option>
              <option value="2">2 — Høj</option>
              <option value="3">3 — Medium</option>
              <option value="4">4 — Lav</option>
              <option value="5">5 — Triviel</option>
            </select>
          </div>
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Impact</label>
          <textarea style={{ ...INPUT, minHeight: 60, resize: "vertical" }} value={form.impact} onChange={set("impact")} placeholder="Hvad er konsekvenserne? Hvor mange brugere er berørt?" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={FIELD}>
            <label style={LABEL}>Opdaget af</label>
            <input style={INPUT} value={form.detected_by} onChange={set("detected_by")} placeholder="fx Anne / automated test" />
          </div>
          <div style={FIELD}>
            <label style={LABEL}>Assigned to</label>
            <input style={INPUT} value={form.assigned_to} onChange={set("assigned_to")} placeholder="fx Anne" />
          </div>
        </div>
        {error && <div style={{ color: "var(--failed)", fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={saving} style={{
          background: saving ? "var(--border)" : "var(--sev1-text)",
          color: saving ? "var(--muted)" : "var(--sev1-bg)",
          border: "none", borderRadius: 8, padding: "10px 20px",
          fontWeight: 600, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
          alignSelf: "flex-start",
        }}>
          {saving ? "Gemmer..." : "Opret incident"}
        </button>
      </form>
    </div>
  );
}
