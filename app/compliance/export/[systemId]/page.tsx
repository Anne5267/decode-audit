import { baseUrl } from "@/app/lib/url";
import { STATUS_DA } from "@/app/lib/labels";
import { PrintButton } from "./PrintButton";

const BASE = baseUrl();

const STATUS_COLOR: Record<string, string> = {
  met: "#4ade80", not_met: "#f87171", partial: "#fbbf24", na: "#94a3b8", pending: "#94a3b8",
};

interface ComplianceItem {
  id: number; framework: string; requirement_id: string | null;
  title: string; description: string | null; status: string;
  evidence: string | null; due_date: string | null;
}

interface AiSystem {
  id: number; name: string; description: string | null;
}

async function getData(systemId: string) {
  const [itemsRes, systemRes] = await Promise.all([
    fetch(`${BASE}/api/compliance?system_id=${systemId}&limit=200`, { cache: "no-store" }),
    fetch(`${BASE}/api/systems/${systemId}`, { cache: "no-store" }),
  ]);
  const items: ComplianceItem[] = itemsRes.ok ? await itemsRes.json() : [];
  const system: AiSystem | null = systemRes.ok ? await systemRes.json() : null;
  return { items, system };
}

export default async function ComplianceExportPage({ params }: { params: Promise<{ systemId: string }> }) {
  const { systemId } = await params;
  const { items, system } = await getData(systemId);

  const met     = items.filter(i => i.status === "met").length;
  const notMet  = items.filter(i => i.status === "not_met").length;
  const partial = items.filter(i => i.status === "partial").length;
  const rate    = items.length > 0 ? Math.round((met / items.length) * 100) : 0;

  const byFramework: Record<string, ComplianceItem[]> = {};
  for (const item of items) {
    if (!byFramework[item.framework]) byFramework[item.framework] = [];
    byFramework[item.framework].push(item);
  }

  const today = new Date().toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #111 !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @media screen {
          .print-page { max-width: 860px; margin: 0 auto; padding: 2rem; }
        }
      `}</style>

      {/* Print-knap */}
      <div className="no-print" style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center" }}>
        <PrintButton />
        <a href="/compliance" style={{ fontSize: 13, color: "var(--muted)" }}>← Tilbage til Compliance</a>
      </div>

      <div className="print-page">
        {/* Header */}
        <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "2px solid #222" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#666", marginBottom: 6 }}>
            Decode Audit · Compliance-rapport
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {system?.name ?? `System ${systemId}`}
          </h1>
          {system?.description && (
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{system.description}</p>
          )}
          <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>Genereret: {today}</p>
        </div>

        {/* Sammenfatning */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "2rem" }}>
          {[
            { label: "Total krav", val: items.length, color: "#333" },
            { label: "Opfyldt", val: met, color: "#16a34a" },
            { label: "Ikke opfyldt", val: notMet, color: "#dc2626" },
            { label: "Compliance rate", val: `${rate}%`, color: rate >= 80 ? "#16a34a" : "#dc2626" },
          ].map(s => (
            <div key={s.label} style={{ border: "1px solid #ddd", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "#888", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Krav per framework */}
        {Object.entries(byFramework).map(([fw, fwItems]) => (
          <div key={fw} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #eee" }}>
              {fw} ({fwItems.filter(i => i.status === "met").length}/{fwItems.length} opfyldt)
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  {["ID", "Titel", "Status", "Deadline", "Evidence"].map(h => (
                    <th key={h} style={{ padding: "7px 10px", textAlign: "left", color: "#555", fontWeight: 600, borderBottom: "1px solid #ddd" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fwItems.map((item, idx) => (
                  <tr key={item.id} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 10px", color: "#666", whiteSpace: "nowrap" }}>{item.requirement_id ?? "—"}</td>
                    <td style={{ padding: "8px 10px", color: "#222", lineHeight: 1.4 }}>{item.title}</td>
                    <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>
                      <span style={{ fontWeight: 600, color: STATUS_COLOR[item.status] ?? "#666" }}>
                        {STATUS_DA[item.status] ?? item.status}
                      </span>
                    </td>
                    <td style={{ padding: "8px 10px", color: "#666", whiteSpace: "nowrap" }}>
                      {item.due_date ? new Date(item.due_date).toLocaleDateString("da-DK") : "—"}
                    </td>
                    <td style={{ padding: "8px 10px", color: "#555", lineHeight: 1.4, maxWidth: 240 }}>
                      {item.evidence ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #eee", fontSize: 11, color: "#aaa", textAlign: "center" }}>
          Decode Audit · audit.decodeai.dk · Genereret {today}
        </div>
      </div>
    </div>
  );
}
