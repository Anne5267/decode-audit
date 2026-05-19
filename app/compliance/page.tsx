import Link from "next/link";
import { STATUS_DA } from "@/app/lib/labels";

import { baseUrl } from "@/app/lib/url";
const BASE = baseUrl();

interface Compliance {
  id: number; framework: string; requirement_id: string | null; title: string;
  status: string; due_date: string | null; ai_systems?: { name: string };
}

const STATUS_COLOR: Record<string, string> = {
  met: "var(--met)", not_met: "var(--not_met)", partial: "var(--partial)", na: "var(--na)", pending: "var(--pending)",
};

async function getCompliance(sp: Record<string, string>) {
  const qs = new URLSearchParams();
  if (sp.framework) qs.set("framework", sp.framework);
  if (sp.status) qs.set("status", sp.status);
  qs.set("limit", "200");
  const res = await fetch(`${BASE}/api/compliance?${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function CompliancePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const items: Compliance[] = await getCompliance(sp);

  const met = items.filter((i) => i.status === "met").length;
  const notMet = items.filter((i) => i.status === "not_met").length;
  const partial = items.filter((i) => i.status === "partial").length;
  const rate = items.length > 0 ? Math.round((met / items.length) * 100) : null;

  // Gruppér per framework
  const byFramework: Record<string, Compliance[]> = {};
  for (const item of items) {
    if (!byFramework[item.framework]) byFramework[item.framework] = [];
    byFramework[item.framework].push(item);
  }

  const frameworks = Object.keys(byFramework).sort();

  const filters = [
    { label: "Alle", href: "/compliance" },
    { label: "Ikke opfyldt", href: "/compliance?status=not_met" },
    { label: "Delvist", href: "/compliance?status=partial" },
    { label: "Opfyldt", href: "/compliance?status=met" },
    { label: "EU AI Act", href: "/compliance?framework=EU+AI+Act" },
    { label: "ISO 42001", href: "/compliance?framework=ISO+42001" },
    { label: "GDPR", href: "/compliance?framework=GDPR" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Compliance</h1>
        <Link href="/compliance/new" style={{
          background: "var(--surface)", border: "1px solid var(--accent)",
          color: "var(--accent)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500,
        }}>
          + Tilføj krav
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total krav", val: items.length, color: "var(--text)" },
          { label: "Opfyldt", val: met, color: "var(--met)" },
          { label: "Ikke opfyldt", val: notMet, color: "var(--not_met)" },
          { label: "Delvist", val: partial, color: "var(--partial)" },
          { label: "Rate", val: rate !== null ? `${rate}%` : "—", color: rate !== null ? (rate >= 80 ? "var(--met)" : "var(--not_met)") : "var(--muted)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", minWidth: 80 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {filters.map((f) => (
          <Link key={f.href} href={f.href} style={{
            padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)",
          }}>
            {f.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
          Ingen compliance krav defineret.{" "}
          <Link href="/compliance/new" style={{ color: "var(--accent)" }}>Tilføj det første.</Link>
        </div>
      ) : frameworks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {frameworks.map((fw) => {
            const fwItems = byFramework[fw];
            const fwMet = fwItems.filter((i) => i.status === "met").length;
            const fwRate = Math.round((fwMet / fwItems.length) * 100);
            return (
              <div key={fw}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--accent)" }}>{fw}</h2>
                  <span style={{ fontSize: 12, color: fwRate >= 80 ? "var(--met)" : "var(--not_met)" }}>
                    {fwRate}% ({fwMet}/{fwItems.length})
                  </span>
                </div>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["ID", "Titel", "System", "Status", "Deadline"].map((h) => (
                          <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "var(--muted)", fontSize: 11, fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fwItems.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12 }}>{c.requirement_id ?? "—"}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <Link href={`/compliance/${c.id}`} style={{ color: "var(--text)", fontSize: 13 }}>{c.title}</Link>
                          </td>
                          <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12 }}>{c.ai_systems?.name ?? "—"}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COLOR[c.status] ?? "var(--muted)" }}>{STATUS_DA[c.status] ?? c.status}</span>
                          </td>
                          <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12 }}>
                            {c.due_date ? new Date(c.due_date).toLocaleDateString("da-DK") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Framework", "ID", "Titel", "System", "Status", "Deadline"].map((h) => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "var(--muted)", fontSize: 11, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 14px", color: "var(--accent)", fontSize: 12, fontWeight: 500 }}>{c.framework}</td>
                  <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12 }}>{c.requirement_id ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <Link href={`/compliance/${c.id}`} style={{ color: "var(--text)", fontSize: 13 }}>{c.title}</Link>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12 }}>{c.ai_systems?.name ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COLOR[c.status] ?? "var(--muted)" }}>{STATUS_DA[c.status] ?? c.status}</span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12 }}>
                    {c.due_date ? new Date(c.due_date).toLocaleDateString("da-DK") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
