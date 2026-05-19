import Link from "next/link";
import ResolveIncidentPanel from "@/app/components/ResolveIncidentPanel";
import AddCommentForm from "@/app/components/AddCommentForm";

import { baseUrl } from "@/app/lib/url";
const BASE = baseUrl();

interface Comment {
  id: number; content: string; author: string; created_at: string;
}
interface Incident {
  id: number; title: string; description: string; status: string; severity: number;
  category: string; detected_by: string | null; assigned_to: string | null;
  impact: string | null; root_cause: string | null; notes: string | null;
  resolved_at: string | null; created_at: string; updated_at: string;
  ai_systems?: { name: string }; test_cases?: { title: string } | null;
  comments: Comment[];
}

import { STATUS_DA, CATEGORY_DA, SEV_LABEL } from "@/app/lib/labels";

const STATUS_COLOR: Record<string, string> = {
  open: "var(--open)", investigating: "var(--investigating)",
  resolved: "var(--resolved)", wont_fix: "var(--wont_fix)",
};
const SEV_TEXT = ["", "var(--sev1-text)", "var(--sev2-text)", "var(--sev3-text)", "var(--sev4-text)", "var(--sev5-text)"];
const SEV_BG = ["", "var(--sev1-bg)", "var(--sev2-bg)", "var(--sev3-bg)", "var(--sev4-bg)", "var(--sev5-bg)"];
const SEV_BORDER = ["", "var(--sev1-border)", "var(--sev2-border)", "var(--sev3-border)", "var(--sev4-border)", "var(--sev5-border)"];

async function getIncident(id: string) {
  const res = await fetch(`${BASE}/api/incidents/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inc: Incident | null = await getIncident(id);
  if (!inc) return <div style={{ color: "var(--failed)", padding: 40 }}>Incident ikke fundet.</div>;

  const sev = inc.severity;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href="/incidents" style={{ color: "var(--muted)", fontSize: 13 }}>← Incidents</Link>
      </div>

      <div style={{
        background: SEV_BG[sev], border: `1px solid ${SEV_BORDER[sev]}`,
        borderRadius: 10, padding: "20px 24px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: SEV_TEXT[sev],
            background: SEV_BG[sev], border: `1px solid ${SEV_BORDER[sev]}`, borderRadius: 4, padding: "2px 8px",
          }}>
            {SEV_LABEL[sev]}
          </span>
          <span style={{ fontSize: 12, color: STATUS_COLOR[inc.status] ?? "var(--muted)" }}>{STATUS_DA[inc.status] ?? inc.status}</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{CATEGORY_DA[inc.category] ?? inc.category}</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{inc.title}</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{inc.description}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        <div>
          {inc.impact && (
            <Field label="Impact">
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{inc.impact}</p>
            </Field>
          )}

          {inc.root_cause && (
            <Field label="Rodårsag">
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{inc.root_cause}</p>
            </Field>
          )}

          {inc.notes && (
            <Field label="Løsningsnoter">
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{inc.notes}</p>
            </Field>
          )}

          {/* Comments */}
          <Field label={`Kommentarer (${inc.comments.length})`}>
            {inc.comments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {inc.comments.map((c) => (
                  <div key={c.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{c.author}</span>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>
                        {new Date(c.created_at).toLocaleDateString("da-DK", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>{c.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>Ingen kommentarer endnu.</p>
            )}
            <AddCommentForm incidentId={inc.id} />
          </Field>
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Meta label="System" value={inc.ai_systems?.name} />
              <Meta label="Test case" value={inc.test_cases?.title} />
              <Meta label="Opdaget af" value={inc.detected_by} />
              <Meta label="Assigned to" value={inc.assigned_to} />
              <Meta label="Oprettet" value={new Date(inc.created_at).toLocaleDateString("da-DK")} />
              {inc.resolved_at && (
                <Meta label="Løst" value={new Date(inc.resolved_at).toLocaleDateString("da-DK")} />
              )}
            </div>
          </div>

          <ResolveIncidentPanel incidentId={inc.id} status={inc.status} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 10, fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  );
}

function Meta({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: value ? "var(--text)" : "var(--muted)" }}>{value ?? "—"}</div>
    </div>
  );
}
