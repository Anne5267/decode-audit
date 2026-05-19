import Link from "next/link";
import UpdateComplianceForm from "@/app/components/UpdateComplianceForm";
import { STATUS_DA } from "@/app/lib/labels";

import { baseUrl } from "@/app/lib/url";
const BASE = baseUrl();

interface ComplianceItem {
  id: number; framework: string; requirement_id: string | null;
  title: string; description: string | null; status: string;
  evidence: string | null; due_date: string | null;
  created_at: string; updated_at: string;
  ai_systems?: { name: string };
}

const STATUS_COLOR: Record<string, string> = {
  met: "var(--met)", not_met: "var(--not_met)",
  partial: "var(--partial)", na: "var(--na)", pending: "var(--pending)",
};

async function getItem(id: string) {
  const res = await fetch(`${BASE}/api/compliance/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ComplianceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item: ComplianceItem | null = await getItem(id);
  if (!item) return <div style={{ color: "var(--failed)", padding: 40 }}>Compliance krav ikke fundet.</div>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href="/compliance" style={{ color: "var(--muted)", fontSize: 13 }}>← Compliance</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>{item.framework}</span>
        {item.requirement_id && <span style={{ color: "var(--muted)", fontSize: 12 }}>{item.requirement_id}</span>}
        <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLOR[item.status] ?? "var(--muted)" }}>{STATUS_DA[item.status] ?? item.status}</span>
        {item.ai_systems && <span style={{ fontSize: 12, color: "var(--muted)" }}>{item.ai_systems.name}</span>}
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{item.title}</h1>

      {item.description && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 8 }}>Kravbeskrivelse</div>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{item.description}</p>
        </div>
      )}

      {item.evidence && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--met)", borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--met)", marginBottom: 8 }}>Evidence / dokumentation</div>
          <p style={{ color: "var(--text)", lineHeight: 1.7 }}>{item.evidence}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 12, color: "var(--muted)" }}>
        {item.due_date && <span>Deadline: {new Date(item.due_date).toLocaleDateString("da-DK")}</span>}
        <span>Oprettet: {new Date(item.created_at).toLocaleDateString("da-DK")}</span>
        <span>Opdateret: {new Date(item.updated_at).toLocaleDateString("da-DK")}</span>
      </div>

      <UpdateComplianceForm itemId={item.id} currentStatus={item.status} currentEvidence={item.evidence} />
    </div>
  );
}
