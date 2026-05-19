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

export default function NewCompliancePage() {
  return <Suspense><NewComplianceForm /></Suspense>;
}

function NewComplianceForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [form, setForm] = useState({
    system_id: sp.get("system_id") ?? "",
    framework: "EU AI Act", requirement_id: "",
    title: "", description: "", due_date: "",
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
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          system_id: Number(form.system_id),
          requirement_id: form.requirement_id || null,
          due_date: form.due_date || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fejl");
      router.push(`/compliance/${data.id}`);
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24, fontSize: 13 }}>
        <a href="/compliance" style={{ color: "var(--muted)" }}>← Compliance</a>
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Nyt Compliance Krav</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={FIELD}>
          <label style={LABEL}>AI System *</label>
          <select style={INPUT} value={form.system_id} onChange={set("system_id")} required>
            <option value="">Vælg system...</option>
            {systems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={FIELD}>
            <label style={LABEL}>Framework *</label>
            <select style={INPUT} value={form.framework} onChange={set("framework")} required>
              <option value="EU AI Act">EU AI Act</option>
              <option value="ISO 42001">ISO 42001</option>
              <option value="GDPR">GDPR</option>
              <option value="NIST AI RMF">NIST AI RMF</option>
              <option value="SOC 2">SOC 2</option>
              <option value="Internal">Internal policy</option>
            </select>
          </div>
          <div style={FIELD}>
            <label style={LABEL}>Krav ID</label>
            <input style={INPUT} value={form.requirement_id} onChange={set("requirement_id")} placeholder="fx Art. 9, Annex IV" />
          </div>
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Titel *</label>
          <input style={INPUT} value={form.title} onChange={set("title")} required placeholder="fx Risk management system for high-risk AI" />
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Beskrivelse</label>
          <textarea style={{ ...INPUT, minHeight: 80, resize: "vertical" }} value={form.description} onChange={set("description")} placeholder="Hvad kræver dette krav specifikt?" />
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Deadline</label>
          <input style={INPUT} type="date" value={form.due_date} onChange={set("due_date")} />
        </div>
        {error && <div style={{ color: "var(--failed)", fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={saving} style={{
          background: saving ? "var(--border)" : "var(--accent)",
          color: saving ? "var(--muted)" : "#1a1208",
          border: "none", borderRadius: 8, padding: "10px 20px",
          fontWeight: 600, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
          alignSelf: "flex-start",
        }}>
          {saving ? "Gemmer..." : "Opret krav"}
        </button>
      </form>
    </div>
  );
}
