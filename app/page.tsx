import Link from "next/link";

import { baseUrl } from "@/app/lib/url";
const BASE = baseUrl();

async function getDashboard() {
  const res = await fetch(`${BASE}/api/dashboard`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getCriticalIncidents() {
  const res = await fetch(
    `${BASE}/api/incidents?status=open&severity=1&limit=5`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

function StatCard({ label, value, sub, warn }: {
  label: string; value: string | number; sub?: string; warn?: boolean;
}) {
  return (
    <div style={{
      background: "var(--surface)",
      border: `1px solid ${warn ? "var(--sev1-border)" : "var(--border)"}`,
      borderRadius: 10,
      padding: "20px 24px",
    }}>
      <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: warn ? "var(--sev1-text)" : "var(--accent)" }}>
        {value}
      </div>
      {sub && <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: number }) {
  const labels = ["", "Kritisk", "Høj", "Medium", "Lav", "Triviel"];
  const colors = ["", "var(--sev1-text)", "var(--sev2-text)", "var(--sev3-text)", "var(--sev4-text)", "var(--sev5-text)"];
  const bgs = ["", "var(--sev1-bg)", "var(--sev2-bg)", "var(--sev3-bg)", "var(--sev4-bg)", "var(--sev5-bg)"];
  const borders = ["", "var(--sev1-border)", "var(--sev2-border)", "var(--sev3-border)", "var(--sev4-border)", "var(--sev5-border)"];
  const i = severity ?? 3;
  return (
    <span style={{
      background: bgs[i],
      border: `1px solid ${borders[i]}`,
      color: colors[i],
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 600,
    }}>
      {labels[i] ?? `SEV${i}`}
    </span>
  );
}

interface Incident {
  id: number;
  title: string;
  severity: number;
  ai_systems?: { name: string };
  created_at: string;
}

interface SystemRow {
  id: number;
  name: string;
  total_tests: number;
  passed_tests: number;
  open_incidents: number;
  compliance_total: number;
  compliance_met: number;
}

export default async function DashboardPage() {
  const [data, criticals] = await Promise.all([getDashboard(), getCriticalIncidents()]);

  if (!data) {
    return (
      <div style={{ color: "var(--failed)", padding: 40 }}>
        Kunne ikke hente dashboard-data. Tjek SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY.
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        <StatCard label="AI Systemer" value={data.systems.total} />
        <StatCard
          label="Test Pass Rate"
          value={`${data.tests.pass_rate}%`}
          sub={`${data.tests.passed}/${data.tests.total} tests`}
          warn={data.tests.total > 0 && data.tests.pass_rate < 70}
        />
        <StatCard
          label="Åbne Incidents"
          value={data.incidents.open}
          sub={data.incidents.critical > 0 ? `${data.incidents.critical} kritiske` : undefined}
          warn={data.incidents.critical > 0}
        />
        <StatCard
          label="Compliance"
          value={`${data.compliance.rate}%`}
          sub={`${data.compliance.met}/${data.compliance.total} krav`}
          warn={data.compliance.total > 0 && data.compliance.rate < 70}
        />
      </div>

      {criticals.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "var(--sev1-text)" }}>
            Kritiske åbne incidents
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(criticals as Incident[]).map((inc) => (
              <Link key={inc.id} href={`/incidents/${inc.id}`} style={{
                background: "var(--sev1-bg)",
                border: "1px solid var(--sev1-border)",
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <SeverityBadge severity={inc.severity} />
                <span style={{ flex: 1, fontWeight: 500 }}>{inc.title}</span>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{inc.ai_systems?.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Systemer</h2>
          <Link href="/systems/new" style={{ color: "var(--accent)", fontSize: 13 }}>+ Tilføj system</Link>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["System", "Tests", "Pass %", "Åbne incidents", "Compliance"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "var(--muted)", fontSize: 12, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.systems.list as SystemRow[]).map((s) => {
                const passRate = s.total_tests > 0 ? Math.round((s.passed_tests / s.total_tests) * 100) : null;
                const compRate = s.compliance_total > 0 ? Math.round((s.compliance_met / s.compliance_total) * 100) : null;
                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={`/systems/${s.id}`} style={{ color: "var(--accent)", fontWeight: 500 }}>{s.name}</Link>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{s.total_tests}</td>
                    <td style={{ padding: "12px 16px", color: passRate !== null ? (passRate >= 80 ? "var(--passed)" : "var(--failed)") : "var(--muted)" }}>
                      {passRate !== null ? `${passRate}%` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: s.open_incidents > 0 ? "var(--open)" : "var(--muted)" }}>
                      {s.open_incidents}
                    </td>
                    <td style={{ padding: "12px 16px", color: compRate !== null ? (compRate >= 80 ? "var(--passed)" : "var(--partial)") : "var(--muted)" }}>
                      {compRate !== null ? `${compRate}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.systems.list.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
              Ingen systemer endnu.{" "}
              <Link href="/systems/new" style={{ color: "var(--accent)" }}>Tilføj det første.</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
