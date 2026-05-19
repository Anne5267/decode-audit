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

export default function NewTestCasePage() {
  return <Suspense><NewTestCaseForm /></Suspense>;
}

function NewTestCaseForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [form, setForm] = useState({
    system_id: sp.get("system_id") ?? "",
    title: "", description: "", category: "accuracy",
    severity: "3", input_data: "", expected_output: "",
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
      const res = await fetch("/api/test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          system_id: Number(form.system_id),
          severity: Number(form.severity),
          input_data: form.input_data || null,
          expected_output: form.expected_output || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fejl");
      router.push(`/test-cases/${data.id}`);
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24, fontSize: 13 }}>
        <a href="/test-cases" style={{ color: "var(--muted)" }}>← Test Cases</a>
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Ny Test Case</h1>
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
          <input style={INPUT} value={form.title} onChange={set("title")} required placeholder="fx Korrekt afvisning af skadeligt indhold" />
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Beskrivelse</label>
          <textarea style={{ ...INPUT, minHeight: 80, resize: "vertical" }} value={form.description} onChange={set("description")} placeholder="Hvad tester denne case specifikt?" />
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
              <option value="edge_case">Edge case</option>
              <option value="regression">Regression</option>
              <option value="compliance">Compliance</option>
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
          <label style={LABEL}>Input data / prompt</label>
          <textarea style={{ ...INPUT, minHeight: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} value={form.input_data} onChange={set("input_data")} placeholder="Det input der sendes til systemet..." />
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Forventet output</label>
          <textarea style={{ ...INPUT, minHeight: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} value={form.expected_output} onChange={set("expected_output")} placeholder="Hvad forventer vi systemet returnerer / gør?" />
        </div>
        {error && <div style={{ color: "var(--failed)", fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={saving} style={{
          background: saving ? "var(--border)" : "var(--accent)",
          color: saving ? "var(--muted)" : "#1a1208",
          border: "none", borderRadius: 8, padding: "10px 20px",
          fontWeight: 600, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
          alignSelf: "flex-start",
        }}>
          {saving ? "Gemmer..." : "Opret test case"}
        </button>
      </form>
    </div>
  );
}
