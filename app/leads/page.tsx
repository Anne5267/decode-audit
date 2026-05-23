// app/leads/page.tsx — Leads fra AI Risikotest og andre lead-gen sider
// Version 1.0 — 2026-05-23

import { baseUrl } from "@/app/lib/url";
import { ContactedToggle } from "./ContactedToggle";

const BASE = baseUrl();

interface Lead {
  id: string;
  created_at: string;
  name: string | null;
  email: string;
  score: number | null;
  source: string;
  category: string | null;
  contacted: boolean;
  notes: string | null;
}

const CAT_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  kritisk: { text: "var(--sev1-text)", bg: "var(--sev1-bg)", border: "var(--sev1-border)" },
  høj:     { text: "var(--sev2-text)", bg: "var(--sev2-bg)", border: "var(--sev2-border)" },
  moderat: { text: "var(--sev3-text)", bg: "var(--sev3-bg)", border: "var(--sev3-border)" },
  lav:     { text: "var(--sev4-text)", bg: "var(--sev4-bg)", border: "var(--sev4-border)" },
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("da-DK", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

async function getLeads(): Promise<Lead[]> {
  try {
    const res = await fetch(`${BASE}/api/leads`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function LeadsPage() {
  const leads = await getLeads();

  const stats = {
    total: leads.length,
    contacted: leads.filter((l) => l.contacted).length,
    kritisk: leads.filter((l) => l.category === "kritisk").length,
    høj: leads.filter((l) => l.category === "høj").length,
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Leads</h1>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Indsamlet via AI Risikotest og andre lead-gen sider på decodeai.dk
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total leads", value: stats.total, warn: false },
          { label: "Kontaktet", value: `${stats.contacted} / ${stats.total}`, warn: false },
          { label: "Kritisk risiko", value: stats.kritisk, warn: stats.kritisk > 0 },
          { label: "Høj risiko", value: stats.høj, warn: false },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--surface)",
            border: `1px solid ${s.warn ? "var(--sev1-border)" : "var(--border)"}`,
            borderRadius: 10, padding: "16px 20px",
          }}>
            <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.warn ? "var(--sev1-text)" : "var(--accent)" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Liste */}
      {leads.length === 0 ? (
        <div style={{
          padding: 60, textAlign: "center", color: "var(--muted)",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
        }}>
          Ingen leads endnu. Leads vises her når nogen udfylder AI Risikotest.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {leads.map((lead) => {
            const cat = lead.category ? CAT_COLOR[lead.category] : null;
            return (
              <div key={lead.id} style={{
                background: lead.contacted ? "var(--surface)" : (cat?.bg ?? "var(--surface)"),
                border: `1px solid ${lead.contacted ? "var(--border)" : (cat?.border ?? "var(--border)")}`,
                borderRadius: 8, padding: "14px 16px",
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                alignItems: "center",
                gap: 12,
                opacity: lead.contacted ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}>
                {/* Primær info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                      {lead.email}
                    </span>
                    {lead.name && (
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        · {lead.name}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {fmtDate(lead.created_at)}
                    </span>
                    <span style={{ color: "var(--border)" }}>·</span>
                    <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "capitalize" }}>
                      {lead.source}
                    </span>
                  </div>
                </div>

                {/* Score */}
                {lead.score !== null && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: cat?.text ?? "var(--accent)" }}>
                      {lead.score}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>/ 100</div>
                  </div>
                )}

                {/* Kategori badge */}
                {lead.category && (
                  <div style={{
                    fontSize: 11, fontWeight: 600, textTransform: "capitalize",
                    padding: "3px 8px", borderRadius: 5,
                    background: cat?.bg ?? "var(--surface)",
                    border: `1px solid ${cat?.border ?? "var(--border)"}`,
                    color: cat?.text ?? "var(--muted)",
                  }}>
                    {lead.category}
                  </div>
                )}

                {/* Kontaktet toggle */}
                <ContactedToggle id={lead.id} initial={lead.contacted} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
