// app/systems/[id]/report/page.tsx — Printbar compliance-rapport
// Version 1.0 — 2026-05-23
// Åbn i browser og tryk Ctrl+P / Cmd+P for at gemme som PDF

import { dbGet } from "@/app/lib/db";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";
import SendReportButton from "./SendReportButton";

const RISK_DA: Record<string, string> = {
  minimal:      "Minimal",
  limited:      "Begrænset",
  high:         "Høj risiko",
  unacceptable: "Uacceptabel",
};

const STATUS_DA: Record<string, string> = {
  met:     "Opfyldt",
  gap:     "Mangler",
  partial: "Delvist opfyldt",
  na:      "Ikke relevant",
  passed:  "Bestået",
  failed:  "Fejlet",
  pending: "Afventer",
  open:    "Åben",
  investigating: "Under undersøgelse",
  resolved: "Løst",
};

const RISK_COLORS: Record<string, string> = {
  minimal:      "#4ade80",
  limited:      "#facc15",
  high:         "#fb923c",
  unacceptable: "#f87171",
};

const STATUS_COLORS: Record<string, string> = {
  met:          "#4ade80",
  gap:          "#f87171",
  partial:      "#fb923c",
  na:           "#9ca3af",
  passed:       "#4ade80",
  failed:       "#f87171",
  open:         "#fb923c",
  investigating: "#facc15",
  resolved:     "#4ade80",
};

interface ComplianceItem {
  id: number
  framework: string
  article: string | null
  requirement_id: string | null
  title: string
  description: string | null
  status: string
  responsible: string | null
  due_date: string | null
}

interface Incident {
  id: number
  title: string
  severity: number
  status: string
  created_at: string
  description: string | null
}

interface System {
  id: number
  name: string
  description: string | null
  model_provider: string | null
  model_name: string | null
  owner: string | null
  use_case: string | null
  risk_level: string | null
  status: string
  environment: string | null
  created_at: string
  compliance_requirements: ComplianceItem[]
  incidents: Incident[]
}

const SEV_LABEL = ["", "Kritisk", "Høj", "Medium", "Lav", "Triviel"];

async function getSystem(id: string): Promise<System | null> {
  try {
    const rows = await dbGet<System[]>(
      `/ai_systems?id=eq.${id}&select=*,compliance_requirements(*),incidents(*)&limit=1`
    );
    return rows[0] ?? null;
  } catch { return null; }
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const system = await getSystem(id);
  if (!system) notFound();

  const compliance = system.compliance_requirements ?? [];
  const incidents  = system.incidents ?? [];

  const metCount     = compliance.filter(c => c.status === "met").length;
  const gapCount     = compliance.filter(c => c.status === "gap").length;
  const partialCount = compliance.filter(c => c.status === "partial").length;
  const naCount      = compliance.filter(c => c.status === "na").length;
  const totalRelevant = compliance.length - naCount;
  const complianceScore = totalRelevant > 0
    ? Math.round(((metCount + partialCount * 0.5) / totalRelevant) * 100)
    : null;

  const openIncidents = incidents.filter(i => i.status === "open" || i.status === "investigating");
  const criticalInc   = openIncidents.filter(i => i.severity === 1);

  const today = new Date().toLocaleDateString("da-DK", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Group compliance by framework
  const byFramework: Record<string, ComplianceItem[]> = {};
  for (const c of compliance) {
    const fw = c.framework ?? "Øvrige";
    if (!byFramework[fw]) byFramework[fw] = [];
    byFramework[fw].push(c);
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 20mm 18mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; background: #fff; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Print-knap (skjult ved print) */}
      <div className="no-print" style={{
        position: "fixed", top: 16, right: 16, zIndex: 100,
        display: "flex", gap: 8,
      }}>
        <a href={`/systems/${id}`} style={{
          background: "#f4f4f4", border: "1px solid #ddd",
          borderRadius: 6, padding: "8px 14px",
          fontSize: 13, color: "#555", textDecoration: "none",
        }}>← Tilbage</a>
        <SendReportButton systemId={system.id} />
        <PrintButton />
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{
          borderBottom: "2px solid #1a1a1a",
          paddingBottom: 24,
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>
              Decode AI · EU AI Act Compliance Rapport
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Georgia, serif", lineHeight: 1.2 }}>
              {system.name}
            </h1>
            {system.description && (
              <p style={{ fontSize: 13, color: "#666", marginTop: 6, lineHeight: 1.6, maxWidth: 480 }}>
                {system.description}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Rapport genereret</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{today}</div>
          </div>
        </div>

        {/* Executive summary */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 36,
        }}>
          {/* Risk level */}
          <div style={{
            border: `2px solid ${RISK_COLORS[system.risk_level ?? ""] ?? "#e5e7eb"}`,
            borderRadius: 10,
            padding: "16px 20px",
          }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 8 }}>EU AI Act niveau</div>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              color: RISK_COLORS[system.risk_level ?? ""] ?? "#1a1a1a",
            }}>
              {RISK_DA[system.risk_level ?? ""] ?? system.risk_level ?? "Ikke klassificeret"}
            </div>
          </div>

          {/* Compliance score */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 8 }}>Compliance score</div>
            <div style={{
              fontSize: 28,
              fontWeight: 700,
              color: complianceScore !== null
                ? complianceScore >= 80 ? "#16a34a" : complianceScore >= 50 ? "#d97706" : "#dc2626"
                : "#888",
            }}>
              {complianceScore !== null ? `${complianceScore}%` : "—"}
            </div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
              {metCount} opfyldt · {gapCount} gap · {partialCount} delvist
            </div>
          </div>

          {/* Open incidents */}
          <div style={{
            border: `1px solid ${criticalInc.length > 0 ? "#fca5a5" : "#e5e7eb"}`,
            borderRadius: 10,
            padding: "16px 20px",
            background: criticalInc.length > 0 ? "#fef2f2" : "transparent",
          }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 8 }}>Åbne incidents</div>
            <div style={{
              fontSize: 28,
              fontWeight: 700,
              color: openIncidents.length > 0 ? "#dc2626" : "#16a34a",
            }}>
              {openIncidents.length}
            </div>
            {criticalInc.length > 0 && (
              <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4, fontWeight: 600 }}>
                {criticalInc.length} kritisk
              </div>
            )}
          </div>
        </div>

        {/* System info */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
            Systeminformation
          </h2>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Use case", system.use_case],
                ["AI Provider", system.model_provider],
                ["Model", system.model_name],
                ["Miljø", system.environment],
                ["Ansvarlig ejer", system.owner],
                ["Status", STATUS_DA[system.status] ?? system.status],
                ["Oprettet", new Date(system.created_at).toLocaleDateString("da-DK")],
              ].filter(([, v]) => v).map(([label, value]) => (
                <tr key={label as string} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 0", color: "#6b7280", width: 200, verticalAlign: "top" }}>{label}</td>
                  <td style={{ padding: "8px 0", fontWeight: 500 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compliance krav per framework */}
        {Object.entries(byFramework).map(([fw, items]) => (
          <div key={fw} style={{ marginBottom: 36, pageBreakInside: "avoid" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
              {fw}
            </h2>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 500, width: 90 }}>Artikel</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 500 }}>Krav</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 500, width: 100 }}>Status</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 500, width: 90 }}>Ansvarlig</th>
                </tr>
              </thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "9px 10px", color: "#6b7280", fontSize: 11 }}>
                      {c.article ?? c.requirement_id ?? "—"}
                    </td>
                    <td style={{ padding: "9px 10px" }}>
                      <div style={{ fontWeight: 500, marginBottom: 2 }}>{c.title}</div>
                      {c.description && (
                        <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>
                          {c.description.slice(0, 120)}{c.description.length > 120 ? "…" : ""}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "9px 10px" }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: STATUS_COLORS[c.status] ?? "#6b7280",
                        background: `${STATUS_COLORS[c.status] ?? "#9ca3af"}18`,
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}>
                        {STATUS_DA[c.status] ?? c.status}
                      </span>
                      {c.due_date && (
                        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
                          Deadline: {new Date(c.due_date).toLocaleDateString("da-DK")}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "9px 10px", fontSize: 11, color: "#6b7280" }}>
                      {c.responsible ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Incidents */}
        {incidents.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
              Incidents
            </h2>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 500 }}>Titel</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 500, width: 80 }}>Severity</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 500, width: 110 }}>Status</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 500, width: 90 }}>Dato</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(i => (
                  <tr key={i.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "9px 10px" }}>
                      <div style={{ fontWeight: 500 }}>{i.title}</div>
                      {i.description && (
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                          {i.description.slice(0, 100)}{i.description.length > 100 ? "…" : ""}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "9px 10px", fontSize: 11, fontWeight: 600 }}>
                      <span style={{ color: i.severity <= 2 ? "#dc2626" : i.severity === 3 ? "#d97706" : "#6b7280" }}>
                        {SEV_LABEL[i.severity] ?? `SEV${i.severity}`}
                      </span>
                    </td>
                    <td style={{ padding: "9px 10px" }}>
                      <span style={{ fontSize: 11, color: STATUS_COLORS[i.status] ?? "#6b7280" }}>
                        {STATUS_DA[i.status] ?? i.status}
                      </span>
                    </td>
                    <td style={{ padding: "9px 10px", color: "#6b7280", fontSize: 11 }}>
                      {new Date(i.created_at).toLocaleDateString("da-DK")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: 20,
          marginTop: 40,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#9ca3af",
        }}>
          <span>Decode AI · anne@decodeai.dk · decodeai.dk</span>
          <span>Rapport: {today}</span>
        </div>
      </div>
    </>
  );
}
