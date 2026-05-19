import Link from "next/link";
import { STATUS_DA, CATEGORY_DA, SEV_LABEL } from "@/app/lib/labels";

import { baseUrl } from "@/app/lib/url";
const BASE = baseUrl();

interface TestCase {
  id: number; title: string; status: string; category: string; severity: number;
  ai_systems?: { name: string }; created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  passed: "var(--passed)", failed: "var(--failed)",
  pending: "var(--pending)", flaky: "var(--flaky)",
};
const SEV_TEXT = ["", "var(--sev1-text)", "var(--sev2-text)", "var(--sev3-text)", "var(--sev4-text)", "var(--sev5-text)"];

async function getTestCases(sp: Record<string, string>) {
  const qs = new URLSearchParams();
  if (sp.status) qs.set("status", sp.status);
  if (sp.category) qs.set("category", sp.category);
  qs.set("limit", "200");
  const res = await fetch(`${BASE}/api/test-cases?${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function TestCasesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const tests: TestCase[] = await getTestCases(sp);

  const passed = tests.filter((t) => t.status === "passed").length;
  const failed = tests.filter((t) => t.status === "failed").length;
  const pending = tests.filter((t) => t.status === "pending").length;
  const passRate = tests.length > 0 ? Math.round((passed / tests.length) * 100) : null;

  const filters = [
    { label: "Alle", href: "/test-cases" },
    { label: "Fejlede", href: "/test-cases?status=failed" },
    { label: "Bestået", href: "/test-cases?status=passed" },
    { label: "Afventer", href: "/test-cases?status=pending" },
    { label: "Flaky", href: "/test-cases?status=flaky" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Test Cases</h1>
        <Link href="/test-cases/new" style={{
          background: "var(--surface)", border: "1px solid var(--accent)",
          color: "var(--accent)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500,
        }}>
          + Ny test
        </Link>
      </div>

      {/* Summary bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total", val: tests.length, color: "var(--text)" },
          { label: "Bestået", val: passed, color: "var(--passed)" },
          { label: "Fejlet", val: failed, color: "var(--failed)" },
          { label: "Afventer", val: pending, color: "var(--pending)" },
          { label: "Pass rate", val: passRate !== null ? `${passRate}%` : "—", color: passRate !== null ? (passRate >= 80 ? "var(--passed)" : "var(--failed)") : "var(--muted)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", minWidth: 80 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {filters.map((f) => (
          <Link key={f.href} href={f.href} style={{
            padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)",
          }}>
            {f.label}
          </Link>
        ))}
      </div>

      {tests.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
          Ingen test cases matcher filteret.
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Titel", "System", "Kategori", "Severity", "Status", "Dato"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--muted)", fontSize: 11, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <Link href={`/test-cases/${t.id}`} style={{ color: "var(--accent)", fontWeight: 500 }}>{t.title}</Link>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12 }}>{t.ai_systems?.name ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12 }}>{CATEGORY_DA[t.category] ?? t.category}</td>
                  <td style={{ padding: "10px 14px", color: SEV_TEXT[t.severity] ?? "var(--muted)", fontSize: 12 }}>{SEV_LABEL[t.severity]}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_COLOR[t.status] ?? "var(--muted)" }}>{STATUS_DA[t.status] ?? t.status}</span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12 }}>
                    {new Date(t.created_at).toLocaleDateString("da-DK")}
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
