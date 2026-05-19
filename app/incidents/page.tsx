import Link from "next/link";
import { STATUS_DA, CATEGORY_DA, SEV_LABEL } from "@/app/lib/labels";

import { baseUrl } from "@/app/lib/url";
const BASE = baseUrl();

interface Incident {
  id: number; title: string; status: string; severity: number; category: string;
  ai_systems?: { name: string }; created_at: string; assigned_to: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  open: "var(--open)", investigating: "var(--investigating)", resolved: "var(--resolved)", wont_fix: "var(--wont_fix)",
};
const SEV_TEXT = ["", "var(--sev1-text)", "var(--sev2-text)", "var(--sev3-text)", "var(--sev4-text)", "var(--sev5-text)"];
const SEV_BG = ["", "var(--sev1-bg)", "var(--sev2-bg)", "var(--sev3-bg)", "var(--sev4-bg)", "var(--sev5-bg)"];
const SEV_BORDER = ["", "var(--sev1-border)", "var(--sev2-border)", "var(--sev3-border)", "var(--sev4-border)", "var(--sev5-border)"];

async function getIncidents(searchParams: Record<string, string>) {
  const qs = new URLSearchParams();
  if (searchParams.status) qs.set("status", searchParams.status);
  if (searchParams.severity) qs.set("severity", searchParams.severity);
  qs.set("limit", "100");
  const res = await fetch(`${BASE}/api/incidents?${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function IncidentsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const incidents: Incident[] = await getIncidents(sp);

  const filters = [
    { label: "Alle", href: "/incidents" },
    { label: "Åbne", href: "/incidents?status=open" },
    { label: "Undersøges", href: "/incidents?status=investigating" },
    { label: "Løst", href: "/incidents?status=resolved" },
    { label: "Kritiske", href: "/incidents?severity=1" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Incidents</h1>
        <Link href="/incidents/new" style={{
          background: "var(--surface)", border: "1px solid var(--accent)",
          color: "var(--accent)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500,
        }}>
          + Ny incident
        </Link>
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

      {incidents.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
          Ingen incidents matcher filteret.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {incidents.map((inc) => (
            <Link key={inc.id} href={`/incidents/${inc.id}`} style={{
              background: SEV_BG[inc.severity] ?? "var(--surface)",
              border: `1px solid ${SEV_BORDER[inc.severity] ?? "var(--border)"}`,
              borderRadius: 8,
              padding: "14px 16px",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto auto",
              alignItems: "center",
              gap: 12,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 600,
                background: SEV_BG[inc.severity], color: SEV_TEXT[inc.severity] ?? "var(--muted)",
                border: `1px solid ${SEV_BORDER[inc.severity]}`,
                borderRadius: 4, padding: "2px 8px",
              }}>
                {SEV_LABEL[inc.severity] ?? `SEV${inc.severity}`}
              </span>
              <div>
                <div style={{ fontWeight: 500 }}>{inc.title}</div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>{CATEGORY_DA[inc.category] ?? inc.category} · {inc.ai_systems?.name}</div>
              </div>
              <span style={{ fontSize: 12, color: STATUS_COLOR[inc.status] ?? "var(--muted)" }}>{STATUS_DA[inc.status] ?? inc.status}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{inc.assigned_to ?? "—"}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(inc.created_at).toLocaleDateString("da-DK")}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
