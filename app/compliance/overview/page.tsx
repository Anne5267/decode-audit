import Link from "next/link";
import { STATUS_DA } from "@/app/lib/labels";
import { baseUrl } from "@/app/lib/url";

const BASE = baseUrl();

const STATUS_COLOR: Record<string, string> = {
  met: "var(--met)", not_met: "var(--not_met)", partial: "var(--partial)", na: "var(--na)", pending: "var(--pending)",
};

const STATUS_BG: Record<string, string> = {
  met: "rgba(74,222,128,0.06)", not_met: "rgba(248,113,113,0.06)", partial: "rgba(251,191,36,0.06)",
  na: "rgba(148,163,184,0.06)", pending: "rgba(148,163,184,0.06)",
};

interface ComplianceItem {
  id: number; framework: string; requirement_id: string | null;
  title: string; status: string; due_date: string | null;
  ai_systems?: { name: string };
}

// Ekstraher artikel-præfiks fra requirement_id (fx "Art. 9.1" → "Art. 9")
function articleGroup(reqId: string | null): string {
  if (!reqId) return "Uklassificeret";
  const m = reqId.match(/^(Art\.\s*\d+|Article\s*\d+|\w+\s*\d+)/i);
  return m ? m[0].replace(/\s+/g, " ").trim() : reqId.split(".")[0] || reqId;
}

async function getEuAiActItems(): Promise<ComplianceItem[]> {
  const res = await fetch(`${BASE}/api/compliance?framework=EU+AI+Act&limit=200`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function ComplianceOverviewPage() {
  const items = await getEuAiActItems();

  const met     = items.filter(i => i.status === "met").length;
  const notMet  = items.filter(i => i.status === "not_met").length;
  const partial = items.filter(i => i.status === "partial").length;
  const rate    = items.length > 0 ? Math.round((met / items.length) * 100) : null;

  // Gruppér per artikel
  const byArticle: Record<string, ComplianceItem[]> = {};
  for (const item of items) {
    const group = articleGroup(item.requirement_id);
    if (!byArticle[group]) byArticle[group] = [];
    byArticle[group].push(item);
  }
  const articles = Object.keys(byArticle).sort();

  // Augustdeadline — EU AI Act
  const deadline = new Date("2026-08-02");
  const today    = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>EU AI Act — Artikel-overblik</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Overblik over compliance status per artikel</p>
        </div>
        <Link href="/compliance" style={{ color: "var(--muted)", fontSize: 13 }}>← Compliance</Link>
      </div>

      {/* Deadline-banner */}
      <div style={{
        background: daysLeft <= 60 ? "rgba(248,113,113,0.08)" : "rgba(251,191,36,0.06)",
        border: `1px solid ${daysLeft <= 60 ? "rgba(248,113,113,0.25)" : "rgba(251,191,36,0.2)"}`,
        borderRadius: 10, padding: "12px 16px", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: daysLeft <= 60 ? "var(--not_met)" : "var(--partial)" }}>
            EU AI Act deadline — 2. august 2026
          </span>
          <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 12 }}>
            {daysLeft > 0 ? `${daysLeft} dage tilbage` : "Deadline overskredet"}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: rate !== null && rate >= 80 ? "var(--met)" : "var(--not_met)" }}>
          {rate !== null ? `${rate}% compliant` : "Ingen data"}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total krav", val: items.length, color: "var(--text)" },
          { label: "Opfyldt", val: met, color: "var(--met)" },
          { label: "Ikke opfyldt", val: notMet, color: "var(--not_met)" },
          { label: "Delvist", val: partial, color: "var(--partial)" },
          { label: "Compliance rate", val: rate !== null ? `${rate}%` : "—", color: rate !== null ? (rate >= 80 ? "var(--met)" : "var(--not_met)") : "var(--muted)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", minWidth: 80 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
          Ingen EU AI Act krav defineret.{" "}
          <Link href="/compliance/new" style={{ color: "var(--accent)" }}>Tilføj det første.</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {articles.map(article => {
            const artItems = byArticle[article];
            const artMet   = artItems.filter(i => i.status === "met").length;
            const artRate  = Math.round((artMet / artItems.length) * 100);
            const worstStatus = artItems.some(i => i.status === "not_met") ? "not_met"
              : artItems.some(i => i.status === "partial") ? "partial"
              : artItems.every(i => i.status === "met") ? "met" : "pending";

            return (
              <div key={article} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                {/* Artikel-header */}
                <div style={{
                  padding: "12px 16px",
                  background: STATUS_BG[worstStatus] ?? "transparent",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>{article}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{artItems.length} krav</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Progress bar */}
                    <div style={{ width: 80, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${artRate}%`, height: "100%", background: artRate >= 80 ? "var(--met)" : artRate >= 40 ? "var(--partial)" : "var(--not_met)", borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: artRate >= 80 ? "var(--met)" : "var(--not_met)", minWidth: 40 }}>
                      {artRate}%
                    </span>
                  </div>
                </div>

                {/* Krav */}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {artItems.map(item => (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "9px 16px", color: "var(--muted)", fontSize: 11, width: 80, whiteSpace: "nowrap" }}>
                          {item.requirement_id ?? "—"}
                        </td>
                        <td style={{ padding: "9px 16px" }}>
                          <Link href={`/compliance/${item.id}`} style={{ color: "var(--text)", fontSize: 13 }}>{item.title}</Link>
                          {item.ai_systems?.name && (
                            <span style={{ marginLeft: 8, fontSize: 11, color: "var(--muted)" }}>{item.ai_systems.name}</span>
                          )}
                        </td>
                        <td style={{ padding: "9px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COLOR[item.status] ?? "var(--muted)" }}>
                            {STATUS_DA[item.status] ?? item.status}
                          </span>
                        </td>
                        <td style={{ padding: "9px 16px", color: "var(--muted)", fontSize: 11, whiteSpace: "nowrap" }}>
                          {item.due_date ? new Date(item.due_date).toLocaleDateString("da-DK") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
