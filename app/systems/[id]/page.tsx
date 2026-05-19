import Link from "next/link";
import { STATUS_DA, CATEGORY_DA, SEV_LABEL } from "@/app/lib/labels";

import { baseUrl } from "@/app/lib/url";
const BASE = baseUrl();

interface TestCase {
  id: number; title: string; status: string; category: string; severity: number;
}
interface Incident {
  id: number; title: string; status: string; severity: number; created_at: string;
}
interface Compliance {
  id: number; framework: string; requirement_id: string | null; title: string; status: string; due_date: string | null;
}
interface System {
  id: number; name: string; description: string | null; provider: string | null;
  risk_level: string | null; status: string; use_case: string | null;
  test_cases: TestCase[]; incidents: Incident[]; compliance_requirements: Compliance[];
}

const STATUS_COLOR: Record<string, string> = {
  open: "var(--open)", investigating: "var(--investigating)", resolved: "var(--resolved)",
  wont_fix: "var(--wont_fix)", passed: "var(--passed)", failed: "var(--failed)",
  pending: "var(--pending)", flaky: "var(--flaky)", met: "var(--met)",
  not_met: "var(--not_met)", partial: "var(--partial)", na: "var(--na)",
};

const SEV_TEXT = ["", "var(--sev1-text)", "var(--sev2-text)", "var(--sev3-text)", "var(--sev4-text)", "var(--sev5-text)"];

async function getSystem(id: string) {
  const res = await fetch(`${BASE}/api/systems/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function SystemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const system: System | null = await getSystem(id);

  if (!system) {
    return <div style={{ color: "var(--failed)", padding: 40 }}>System ikke fundet.</div>;
  }

  const passed = system.test_cases.filter((t) => t.status === "passed").length;
  const failed = system.test_cases.filter((t) => t.status === "failed").length;
  const passRate = system.test_cases.length > 0 ? Math.round((passed / system.test_cases.length) * 100) : null;
  const openInc = system.incidents.filter((i) => i.status === "open" || i.status === "investigating").length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link href="/systems" style={{ color: "var(--muted)", fontSize: 13 }}>← Systemer</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>{system.name}</h1>
          {system.status && (
            <span style={{ fontSize: 12, color: STATUS_COLOR[system.status] ?? "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 8px" }}>
              {STATUS_DA[system.status] ?? system.status}
            </span>
          )}
        </div>
        {system.description && <p style={{ color: "var(--muted)", marginTop: 6 }}>{system.description}</p>}
        <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
          {system.provider && <span>Provider: {system.provider}</span>}
          {system.risk_level && <span>EU AI Act risikoniveau: <strong style={{ color: "var(--text)" }}>{system.risk_level}</strong></span>}
          {system.use_case && <span>Use case: {system.use_case}</span>}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Tests", val: system.test_cases.length },
          { label: "Pass rate", val: passRate !== null ? `${passRate}%` : "—", color: passRate !== null ? (passRate >= 80 ? "var(--passed)" : "var(--failed)") : "var(--muted)" },
          { label: "Fejlede tests", val: failed, color: failed > 0 ? "var(--failed)" : "var(--muted)" },
          { label: "Åbne incidents", val: openInc, color: openInc > 0 ? "var(--open)" : "var(--muted)" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 20px", minWidth: 120 }}>
            <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color ?? "var(--text)" }}>{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Test Cases */}
      <Section
        title="Test Cases"
        count={system.test_cases.length}
        addHref={`/test-cases/new?system_id=${id}`}
        addLabel="+ Ny test"
        empty="Ingen test cases endnu."
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Titel", "Kategori", "Severity", "Status"].map((h) => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {system.test_cases.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 12px" }}>
                  <Link href={`/test-cases/${t.id}`} style={{ color: "var(--accent)" }}>{t.title}</Link>
                </td>
                <td style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 12 }}>{CATEGORY_DA[t.category] ?? t.category}</td>
                <td style={{ padding: "10px 12px", color: SEV_TEXT[t.severity] ?? "var(--muted)", fontSize: 12 }}>{SEV_LABEL[t.severity]}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ color: STATUS_COLOR[t.status] ?? "var(--muted)", fontSize: 12 }}>{STATUS_DA[t.status] ?? t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Incidents */}
      <Section
        title="Incidents"
        count={system.incidents.length}
        addHref={`/incidents/new?system_id=${id}`}
        addLabel="+ Ny incident"
        empty="Ingen incidents."
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Titel", "Severity", "Status", "Oprettet"].map((h) => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {system.incidents.map((i) => (
              <tr key={i.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 12px" }}>
                  <Link href={`/incidents/${i.id}`} style={{ color: "var(--accent)" }}>{i.title}</Link>
                </td>
                <td style={{ padding: "10px 12px", color: SEV_TEXT[i.severity] ?? "var(--muted)", fontSize: 12 }}>{SEV_LABEL[i.severity]}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ color: STATUS_COLOR[i.status] ?? "var(--muted)", fontSize: 12 }}>{STATUS_DA[i.status] ?? i.status}</span>
                </td>
                <td style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 12 }}>
                  {new Date(i.created_at).toLocaleDateString("da-DK")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Compliance */}
      <Section
        title="Compliance krav"
        count={system.compliance_requirements.length}
        addHref={`/compliance/new?system_id=${id}`}
        addLabel="+ Tilføj krav"
        empty="Ingen compliance krav defineret."
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Framework", "Krav ID", "Titel", "Status", "Deadline"].map((h) => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {system.compliance_requirements.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 12px", color: "var(--accent)", fontSize: 12, fontWeight: 500 }}>{c.framework}</td>
                <td style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 12 }}>{c.requirement_id ?? "—"}</td>
                <td style={{ padding: "10px 12px" }}>
                  <Link href={`/compliance/${c.id}`} style={{ color: "var(--text)" }}>{c.title}</Link>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ color: STATUS_COLOR[c.status] ?? "var(--muted)", fontSize: 12 }}>{STATUS_DA[c.status] ?? c.status}</span>
                </td>
                <td style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 12 }}>
                  {c.due_date ? new Date(c.due_date).toLocaleDateString("da-DK") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

function Section({ title, count, addHref, addLabel, empty, children }: {
  title: string; count: number; addHref: string; addLabel: string; empty: string; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600 }}>{title} <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}>({count})</span></h2>
        <Link href={addHref} style={{ color: "var(--accent)", fontSize: 13 }}>{addLabel}</Link>
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        {count > 0 ? children : (
          <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>{empty}</div>
        )}
      </div>
    </section>
  );
}
