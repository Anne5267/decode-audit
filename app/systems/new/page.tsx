// app/systems/new/page.tsx — Opret nyt AI-system med AI-assisteret risikovurdering
// Version 2.0 — 2026-05-23

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FIELD: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const LABEL: React.CSSProperties = { fontSize: 12, color: "var(--muted)", fontWeight: 500 };
const INPUT: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 6, padding: "8px 12px", color: "var(--text)",
  fontSize: 14, fontFamily: "inherit", outline: "none",
};

const RISK_COLORS: Record<string, string> = {
  minimal:      "var(--sev5-text)",
  limited:      "var(--sev4-text)",
  high:         "var(--sev2-text)",
  unacceptable: "var(--sev1-text)",
};

const RISK_DA: Record<string, string> = {
  minimal:      "Minimal",
  limited:      "Begrænset",
  high:         "Høj risiko",
  unacceptable: "Uacceptabel",
};

const PRIORITY_LABELS: Record<string, string> = {
  must:    "Krav",
  should:  "Anbefalet",
  consider: "Overvej",
};
const PRIORITY_COLORS: Record<string, string> = {
  must:    "var(--sev2-text)",
  should:  "var(--sev3-text)",
  consider: "var(--sev4-text)",
};

interface ComplianceArticle {
  article:     string
  title:       string
  description: string
  priority:    "must" | "should" | "consider"
}

interface Analysis {
  risk_level:          string
  risk_reasoning:      string
  compliance_articles: ComplianceArticle[]
  initial_gaps:        string[]
  suggested_owner:     string
  environment_guess:   string
}

export default function NewSystemPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name:           "",
    description:    "",
    model_provider: "",
    model_name:     "",
    use_case:       "",
    owner:          "",
    environment:    "production" as "production" | "staging" | "development",
    risk_level:     "limited" as "minimal" | "limited" | "high" | "unacceptable",
    status:         "active" as "active" | "testing" | "inactive" | "deprecated",
  });

  const [analysis,  setAnalysis]  = useState<Analysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function analyze() {
    if (!form.name && !form.description) return
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch("/api/systems/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:           form.name,
          description:    form.description,
          use_case:       form.use_case,
          model_provider: form.model_provider,
          model_name:     form.model_name,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Analysefejl")
      const data: Analysis = await res.json()
      setAnalysis(data)
      // Apply suggestions to form
      setForm(f => ({
        ...f,
        risk_level:  data.risk_level as typeof f.risk_level,
        environment: data.environment_guess as typeof f.environment,
        owner:       f.owner || data.suggested_owner,
      }))
    } catch (err) {
      setError(String(err))
    } finally {
      setAnalyzing(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      // 1. Opret system
      const res = await fetch("/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Fejl ved oprettelse")

      const systemId: number = data.id

      // 2. Opret compliance-krav fra analyse (hvis der er nogen)
      if (analysis?.compliance_articles?.length) {
        const complianceRows = analysis.compliance_articles.map((a, i) => ({
          system_id:      systemId,
          framework:      "EU AI Act",
          article:        a.article,
          requirement_id: `${a.article.replace(/\s+/g, "").toLowerCase()}-${i + 1}`,
          title:          a.title,
          requirement:    a.description,
          description:    a.description,
          status:         "gap",
          responsible:    form.owner || null,
        }))

        await fetch("/api/compliance/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system_id: systemId, items: complianceRows }),
        }).catch(() => { /* non-fatal — compliance sættes op manuelt */ })
      }

      router.push(`/systems/${systemId}`)
    } catch (err) {
      setError(String(err))
      setSaving(false)
    }
  }

  const hasEnoughForAnalysis = form.name.trim().length > 0 || form.description.trim().length > 2

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 24, fontSize: 13, color: "var(--muted)" }}>
        <a href="/systems" style={{ color: "var(--muted)" }}>← Systemer</a>
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Nyt AI System</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 32 }}>
        Udfyld de grundlæggende felter — klik derefter "Analysér" for AI-assisteret risikovurdering og compliance-krav.
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Navn + use case */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={FIELD}>
            <label style={LABEL}>Systemnavn *</label>
            <input style={INPUT} value={form.name} onChange={set("name")} required placeholder="fx Kundeservice Bot" />
          </div>
          <div style={FIELD}>
            <label style={LABEL}>Use case</label>
            <input style={INPUT} value={form.use_case} onChange={set("use_case")} placeholder="fx Kundeservice, HR-screening" />
          </div>
        </div>

        {/* Beskrivelse */}
        <div style={FIELD}>
          <label style={LABEL}>Beskrivelse</label>
          <textarea
            style={{ ...INPUT, minHeight: 80, resize: "vertical" }}
            value={form.description}
            onChange={set("description")}
            placeholder="Hvad gør systemet? Hvem bruger det? Hvilke beslutninger tager det?"
          />
        </div>

        {/* Provider + model */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={FIELD}>
            <label style={LABEL}>AI Provider</label>
            <input style={INPUT} value={form.model_provider} onChange={set("model_provider")} placeholder="fx OpenAI, Anthropic" />
          </div>
          <div style={FIELD}>
            <label style={LABEL}>Model</label>
            <input style={INPUT} value={form.model_name} onChange={set("model_name")} placeholder="fx GPT-4o, Claude Sonnet" />
          </div>
        </div>

        {/* Analysér-knap */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={analyze}
            disabled={analyzing || !hasEnoughForAnalysis}
            style={{
              background:     analyzing ? "var(--border)" : "var(--surface)",
              border:         "1px solid var(--accent)",
              color:          analyzing ? "var(--muted)" : "var(--accent)",
              borderRadius:   8,
              padding:        "8px 18px",
              fontSize:       13,
              fontWeight:     500,
              cursor:         analyzing || !hasEnoughForAnalysis ? "not-allowed" : "pointer",
              opacity:        hasEnoughForAnalysis ? 1 : 0.4,
            }}
          >
            {analyzing ? "Analyserer…" : "⬡ Analysér med AI"}
          </button>
          {!hasEnoughForAnalysis && (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Udfyld navn eller beskrivelse for at aktivere</span>
          )}
        </div>

        {/* Analyse-resultater */}
        {analysis && (
          <div style={{
            background: "var(--surface)",
            border:     "1px solid var(--border)",
            borderRadius: 10,
            padding:    "20px 24px",
          }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 12 }}>
              AI-vurdering
            </div>

            {/* Risikoniveau */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Risikoniveau:</span>
              <span style={{
                background: "transparent",
                border:     `1px solid ${RISK_COLORS[analysis.risk_level] ?? "var(--border)"}`,
                color:      RISK_COLORS[analysis.risk_level] ?? "var(--text)",
                borderRadius: 5,
                padding:    "2px 10px",
                fontSize:   12,
                fontWeight: 600,
              }}>
                {RISK_DA[analysis.risk_level] ?? analysis.risk_level}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, marginBottom: 16 }}>
              {analysis.risk_reasoning}
            </p>

            {/* Compliance-artikler */}
            {analysis.compliance_articles.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 8 }}>
                  Compliance-krav der oprettes automatisk
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {analysis.compliance_articles.map((a, i) => (
                    <div key={i} style={{
                      background: "var(--bg)",
                      border:     "1px solid var(--border)",
                      borderRadius: 6,
                      padding:    "10px 14px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{a.article}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{a.title}</span>
                        <span style={{
                          marginLeft: "auto",
                          fontSize:   10,
                          fontWeight: 600,
                          color:      PRIORITY_COLORS[a.priority],
                        }}>
                          {PRIORITY_LABELS[a.priority]}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>{a.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps */}
            {analysis.initial_gaps.length > 0 && (
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 8 }}>
                  Typiske risici for denne type system
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                  {analysis.initial_gaps.map((g, i) => (
                    <li key={i} style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.55 }}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Owner + env + risk + status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={FIELD}>
            <label style={LABEL}>Ansvarlig ejer</label>
            <input style={INPUT} value={form.owner} onChange={set("owner")} placeholder="fx Legal, Data Engineer" />
          </div>
          <div style={FIELD}>
            <label style={LABEL}>Miljø</label>
            <select style={INPUT} value={form.environment} onChange={set("environment")}>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={FIELD}>
            <label style={LABEL}>EU AI Act risikoniveau</label>
            <select style={INPUT} value={form.risk_level} onChange={set("risk_level")}>
              <option value="minimal">Minimal</option>
              <option value="limited">Begrænset</option>
              <option value="high">Høj risiko</option>
              <option value="unacceptable">Uacceptabel</option>
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

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="submit" disabled={saving} style={{
            background:   saving ? "var(--border)" : "var(--accent)",
            color:        saving ? "var(--muted)" : "#1a1208",
            border:       "none",
            borderRadius: 8,
            padding:      "10px 24px",
            fontWeight:   600,
            fontSize:     14,
            cursor:       saving ? "not-allowed" : "pointer",
          }}>
            {saving ? "Opretter…" : "Opret system" + (analysis ? " + compliance-krav" : "")}
          </button>
          {analysis && (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {analysis.compliance_articles.length} krav oprettes automatisk
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
