import Link from "next/link";
import RunTestForm from "@/app/components/RunTestForm";
import { STATUS_DA, CATEGORY_DA, SEV_LABEL } from "@/app/lib/labels";

import { baseUrl } from "@/app/lib/url";
const BASE = baseUrl();

interface TestCase {
  id: number; title: string; description: string | null; status: string;
  category: string; severity: number; input_data: string | null;
  expected_output: string | null; actual_output: string | null;
  created_at: string; updated_at: string;
  ai_systems?: { name: string };
}

const STATUS_COLOR: Record<string, string> = {
  passed: "var(--passed)", failed: "var(--failed)",
  pending: "var(--pending)", flaky: "var(--flaky)",
};
const SEV_TEXT = ["", "var(--sev1-text)", "var(--sev2-text)", "var(--sev3-text)", "var(--sev4-text)", "var(--sev5-text)"];

async function getTestCase(id: string) {
  const res = await fetch(`${BASE}/api/test-cases/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function TestCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tc: TestCase | null = await getTestCase(id);
  if (!tc) return <div style={{ color: "var(--failed)", padding: 40 }}>Test case ikke fundet.</div>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href="/test-cases" style={{ color: "var(--muted)", fontSize: 13 }}>← Test Cases</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: SEV_TEXT[tc.severity] ?? "var(--muted)" }}>{SEV_LABEL[tc.severity]}</span>
        <span style={{ fontSize: 12, color: STATUS_COLOR[tc.status] ?? "var(--muted)", fontWeight: 600 }}>{STATUS_DA[tc.status] ?? tc.status}</span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{CATEGORY_DA[tc.category] ?? tc.category}</span>
        {tc.ai_systems && <span style={{ fontSize: 12, color: "var(--accent)" }}>{tc.ai_systems.name}</span>}
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{tc.title}</h1>

      {tc.description && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 8 }}>Beskrivelse</div>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{tc.description}</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {tc.input_data && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 8 }}>Input data</div>
            <pre style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{tc.input_data}</pre>
          </div>
        )}
        {tc.expected_output && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 8 }}>Forventet output</div>
            <pre style={{ fontFamily: "monospace", fontSize: 12, color: "var(--passed)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{tc.expected_output}</pre>
          </div>
        )}
      </div>

      {tc.actual_output && (
        <div style={{ background: "var(--surface)", border: `1px solid ${tc.status === "failed" ? "var(--sev1-border)" : "var(--border)"}`, borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 8 }}>Faktisk output</div>
          <pre style={{ fontFamily: "monospace", fontSize: 12, color: tc.status === "failed" ? "var(--failed)" : "var(--text)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{tc.actual_output}</pre>
        </div>
      )}

      <RunTestForm testId={tc.id} currentStatus={tc.status} />

      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 16 }}>
        Oprettet: {new Date(tc.created_at).toLocaleDateString("da-DK")} ·
        Opdateret: {new Date(tc.updated_at).toLocaleDateString("da-DK")}
      </div>
    </div>
  );
}
