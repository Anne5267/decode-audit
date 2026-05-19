"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FIELD = { display: "flex", flexDirection: "column" as const, gap: 6 };
const LABEL = { fontSize: 12, color: "var(--muted)", fontWeight: 500 };
const INPUT: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 6, padding: "8px 12px", color: "var(--text)",
  fontSize: 14, fontFamily: "inherit", outline: "none",
};

export default function NewSystemPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", provider: "", use_case: "",
    risk_level: "limited", status: "active",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fejl");
      router.push(`/systems/${data.id}`);
    } catch (err) {
      setError(String(err));
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24, fontSize: 13, color: "var(--muted)" }}>
        <a href="/systems" style={{ color: "var(--muted)" }}>← Systemer</a>
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Nyt AI System</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={FIELD}>
          <label style={LABEL}>Navn *</label>
          <input style={INPUT} value={form.name} onChange={set("name")} required placeholder="fx GPT-4 Kundeservice bot" />
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Beskrivelse</label>
          <textarea style={{ ...INPUT, minHeight: 80, resize: "vertical" }} value={form.description} onChange={set("description")} placeholder="Hvad gør systemet?" />
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Provider / Model</label>
          <input style={INPUT} value={form.provider} onChange={set("provider")} placeholder="fx OpenAI / GPT-4o" />
        </div>
        <div style={FIELD}>
          <label style={LABEL}>Use case</label>
          <input style={INPUT} value={form.use_case} onChange={set("use_case")} placeholder="fx Kundeservice, HR-screening, osv." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={FIELD}>
            <label style={LABEL}>EU AI Act risikoniveau</label>
            <select style={INPUT} value={form.risk_level} onChange={set("risk_level")}>
              <option value="minimal">Minimal</option>
              <option value="limited">Limited</option>
              <option value="high">High risk</option>
              <option value="unacceptable">Unacceptable</option>
            </select>
          </div>
          <div style={FIELD}>
            <label style={LABEL}>Status</label>
            <select style={INPUT} value={form.status} onChange={set("status")}>
              <option value="active">Active</option>
              <option value="testing">Testing</option>
              <option value="inactive">Inactive</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
        </div>
        {error && <div style={{ color: "var(--failed)", fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={saving} style={{
          background: saving ? "var(--border)" : "var(--accent)",
          color: saving ? "var(--muted)" : "#1a1208",
          border: "none", borderRadius: 8, padding: "10px 20px",
          fontWeight: 600, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
          alignSelf: "flex-start",
        }}>
          {saving ? "Gemmer..." : "Opret system"}
        </button>
      </form>
    </div>
  );
}
