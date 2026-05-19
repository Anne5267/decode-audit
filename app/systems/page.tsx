import Link from "next/link";
import { STATUS_DA, RISK_DA } from "@/app/lib/labels";

import { baseUrl } from "@/app/lib/url";
const BASE = baseUrl();

interface System {
  id: number;
  name: string;
  description: string | null;
  provider: string | null;
  risk_level: string | null;
  status: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  open_incidents: number;
  critical_incidents: number;
  compliance_total: number;
  compliance_met: number;
  created_at: string;
}

const RISK_COLORS: Record<string, string> = {
  minimal: "var(--sev5-text)",
  limited: "var(--sev4-text)",
  high: "var(--sev2-text)",
  unacceptable: "var(--sev1-text)",
};

const STATUS_COLORS: Record<string, string> = {
  active: "var(--passed)",
  inactive: "var(--muted)",
  deprecated: "var(--pending)",
  testing: "var(--flaky)",
};

async function getSystems() {
  const res = await fetch(`${BASE}/api/systems`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function SystemsPage() {
  const systems: System[] = await getSystems();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>AI Systemer</h1>
        <Link href="/systems/new" style={{
          background: "var(--surface)",
          border: "1px solid var(--accent)",
          color: "var(--accent)",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 500,
        }}>
          + Tilføj system
        </Link>
      </div>

      {systems.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
          Ingen systemer registreret endnu.{" "}
          <Link href="/systems/new" style={{ color: "var(--accent)" }}>Tilføj det første.</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {systems.map((s) => {
            const passRate = s.total_tests > 0 ? Math.round((s.passed_tests / s.total_tests) * 100) : null;
            const compRate = s.compliance_total > 0 ? Math.round((s.compliance_met / s.compliance_total) * 100) : null;
            return (
              <Link key={s.id} href={`/systems/${s.id}`} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "16px 20px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 16,
                alignItems: "center",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</span>
                    {s.status && (
                      <span style={{ fontSize: 11, color: STATUS_COLORS[s.status] ?? "var(--muted)" }}>
                        {STATUS_DA[s.status] ?? s.status}
                      </span>
                    )}
                    {s.risk_level && (
                      <span style={{ fontSize: 11, color: RISK_COLORS[s.risk_level] ?? "var(--muted)" }}>
                        {RISK_DA[s.risk_level] ?? `EU AI Act: ${s.risk_level}`}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 4 }}>{s.description}</div>
                  )}
                  {s.provider && (
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{s.provider}</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: passRate !== null ? (passRate >= 80 ? "var(--passed)" : "var(--failed)") : "var(--muted)" }}>
                      {passRate !== null ? `${passRate}%` : "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>tests</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.open_incidents > 0 ? "var(--open)" : "var(--muted)" }}>
                      {s.open_incidents}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>incidents</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: compRate !== null ? (compRate >= 80 ? "var(--passed)" : "var(--partial)") : "var(--muted)" }}>
                      {compRate !== null ? `${compRate}%` : "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>compliance</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
