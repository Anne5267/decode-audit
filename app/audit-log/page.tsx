import Link from "next/link";
import { baseUrl } from "@/app/lib/url";

const BASE = baseUrl();

interface AuditRow {
  id: number;
  table_name: string;
  record_id: number;
  action: "INSERT" | "UPDATE" | "DELETE";
  changed_by: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_at: string;
}

const TABLE_LABELS: Record<string, string> = {
  ai_systems: "System",
  test_cases: "Test Case",
  incidents: "Incident",
  compliance_requirements: "Compliance",
};

const TABLE_HREF: Record<string, (id: number) => string> = {
  ai_systems: (id) => `/systems/${id}`,
  test_cases: (id) => `/test-cases/${id}`,
  incidents: (id) => `/incidents/${id}`,
  compliance_requirements: (id) => `/compliance/${id}`,
};

const ACTION_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  INSERT: { color: "var(--passed)", bg: "#0e1a0e", border: "var(--sev4-border)", label: "Oprettet" },
  UPDATE: { color: "var(--accent)", bg: "var(--sev3-bg)", border: "var(--sev3-border)", label: "Opdateret" },
  DELETE: { color: "var(--failed)", bg: "var(--sev1-bg)", border: "var(--sev1-border)", label: "Slettet" },
};

const FIELD_LABELS: Record<string, string> = {
  name: "Navn", title: "Titel", status: "Status", severity: "Alvorlighed",
  description: "Beskrivelse", category: "Kategori", assigned_to: "Tildelt",
  root_cause: "Rodårsag", resolution_notes: "Løsningsnoter", evidence: "Evidence",
  due_date: "Deadline", framework: "Framework", risk_level: "Risikoniveau",
  owner: "Ejer", environment: "Miljø",
};

const STATUS_DA: Record<string, string> = {
  open: "Åben", investigating: "Undersøges", resolved: "Løst", wont_fix: "Ignoreret",
  passed: "Bestået", failed: "Fejlet", pending: "Afventer", flaky: "Ustabil", skipped: "Sprunget over",
  met: "Opfyldt", not_met: "Ikke opfyldt", partial: "Delvist", na: "N/A",
  active: "Aktiv", inactive: "Inaktiv", deprecated: "Udfaset", testing: "Under test",
};

function formatValue(key: string, val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string") {
    if (key === "status" || key.endsWith("_status")) return STATUS_DA[val] ?? val;
    if (key.endsWith("_at") || key === "due_date") {
      try { return new Date(val).toLocaleString("da-DK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return val; }
    }
    return val;
  }
  if (typeof val === "number") {
    if (key === "severity") return ["", "Kritisk", "Høj", "Medium", "Lav", "Triviel"][val as number] ?? String(val);
    return String(val);
  }
  return String(val);
}

function DiffView({ old_values, new_values, action }: Pick<AuditRow, "old_values" | "new_values" | "action">) {
  if (action === "INSERT" && new_values) {
    const keys = ["name", "title", "status", "severity", "category", "framework"].filter((k) => k in new_values);
    if (keys.length === 0) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
        {keys.map((k) => (
          <span key={k} style={{ fontSize: 11, background: "#0e1a0e", border: "1px solid var(--sev4-border)", borderRadius: 4, padding: "2px 8px", color: "var(--passed)" }}>
            {FIELD_LABELS[k] ?? k}: {formatValue(k, new_values[k])}
          </span>
        ))}
      </div>
    );
  }

  if (action === "UPDATE" && old_values && new_values) {
    const changed = Object.keys(new_values).filter(
      (k) => !["updated_at", "changed_at", "id"].includes(k) && JSON.stringify(old_values[k]) !== JSON.stringify(new_values[k])
    );
    if (changed.length === 0) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
        {changed.map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ color: "var(--muted)", minWidth: 80 }}>{FIELD_LABELS[k] ?? k}</span>
            <span style={{ color: "var(--failed)", textDecoration: "line-through", fontSize: 11 }}>
              {formatValue(k, old_values[k])}
            </span>
            <span style={{ color: "var(--muted)" }}>→</span>
            <span style={{ color: "var(--passed)", fontSize: 11 }}>
              {formatValue(k, new_values[k])}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (action === "DELETE" && old_values) {
    const label = (old_values.name ?? old_values.title ?? `#${old_values.id}`) as string;
    return (
      <div style={{ fontSize: 12, color: "var(--failed)", marginTop: 6 }}>
        Slettet: {label}
      </div>
    );
  }

  return null;
}

async function getAuditLog(sp: Record<string, string>) {
  const qs = new URLSearchParams();
  if (sp.table) qs.set("table", sp.table);
  if (sp.action) qs.set("action", sp.action);
  qs.set("limit", "150");
  const res = await fetch(`${BASE}/api/audit-log?${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const rows: AuditRow[] = await getAuditLog(sp);

  const tables = ["ai_systems", "incidents", "test_cases", "compliance_requirements"];
  const actions = ["INSERT", "UPDATE", "DELETE"];

  const tableFilters = [
    { label: "Alle", href: "/audit-log" },
    ...tables.map((t) => ({ label: TABLE_LABELS[t] ?? t, href: `/audit-log?table=${t}` })),
  ];

  const actionFilters = actions.map((a) => ({
    label: ACTION_STYLE[a].label,
    href: sp.table ? `/audit-log?table=${sp.table}&action=${a}` : `/audit-log?action=${a}`,
    style: ACTION_STYLE[a],
  }));

  const activeTable = sp.table ?? null;
  const activeAction = sp.action ?? null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Audit Log</h1>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          Uforanderlig historik over alle ændringer i systemet — hvem, hvad og hvornår.
        </p>
      </div>

      {/* Filtre */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {tableFilters.map((f) => {
            const isActive = f.href === "/audit-log" ? !activeTable && !activeAction : f.href.includes(activeTable ?? "___");
            return (
              <Link key={f.href} href={f.href} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: isActive ? 600 : 400,
                background: isActive ? "var(--accent)" : "var(--surface)",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                color: isActive ? "#1a1208" : "var(--muted)",
              }}>
                {f.label}
              </Link>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {actionFilters.map((f) => {
            const isActive = f.href.includes(activeAction ?? "___");
            return (
              <Link key={f.href} href={f.href} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: isActive ? 600 : 400,
                background: isActive ? f.style.bg : "var(--surface)",
                border: `1px solid ${isActive ? f.style.border : "var(--border)"}`,
                color: isActive ? f.style.color : "var(--muted)",
              }}>
                {f.label}
              </Link>
            );
          })}
        </div>
        <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: "auto" }}>
          {rows.length} {rows.length === 1 ? "ændring" : "ændringer"}
        </span>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
          Ingen audit-poster matcher filteret.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {rows.map((row) => {
            const actionStyle = ACTION_STYLE[row.action] ?? ACTION_STYLE.UPDATE;
            const tableLabel = TABLE_LABELS[row.table_name] ?? row.table_name;
            const href = TABLE_HREF[row.table_name]?.(row.record_id);
            const recordLabel = (row.new_values?.name ?? row.new_values?.title ?? row.old_values?.name ?? row.old_values?.title) as string | undefined;

            return (
              <div key={row.id} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${actionStyle.color}`,
                borderRadius: 8,
                padding: "12px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Action badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                    color: actionStyle.color, background: actionStyle.bg,
                    border: `1px solid ${actionStyle.border}`,
                    borderRadius: 4, padding: "2px 7px", flexShrink: 0,
                  }}>
                    {actionStyle.label.toUpperCase()}
                  </span>

                  {/* Tabel */}
                  <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>{String(tableLabel)}</span>

                  {/* Record link */}
                  {recordLabel && (
                    href ? (
                      <Link href={href} style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>
                        {String(recordLabel)}
                      </Link>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--text)" }}>{String(recordLabel)}</span>
                    )
                  )}
                  {!recordLabel && href && (
                    <Link href={href} style={{ fontSize: 12, color: "var(--muted)" }}>#{row.record_id}</Link>
                  )}

                  {/* Spacer */}
                  <span style={{ flex: 1 }} />

                  {/* Hvem */}
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{row.changed_by}</span>

                  {/* Hvornår */}
                  <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>
                    {new Date(row.changed_at).toLocaleString("da-DK", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>

                <DiffView action={row.action} old_values={row.old_values} new_values={row.new_values} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
