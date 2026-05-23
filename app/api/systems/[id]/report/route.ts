// app/api/systems/[id]/report/route.ts — Send compliance-rapport som email via Resend
// Version 1.0 — 2026-05-23

import { NextRequest } from "next/server";
import { dbGet } from "@/app/lib/db";

const RESEND_KEY  = process.env.RESEND_API_KEY;
const PUBLIC_URL  = process.env.NEXT_PUBLIC_URL ?? "https://audit.decodeai.dk";

const RISK_DA: Record<string, string> = {
  minimal:      "Minimal",
  limited:      "Begrænset",
  high:         "Høj risiko",
  unacceptable: "Uacceptabel",
};

const STATUS_DA: Record<string, string> = {
  met: "Opfyldt", gap: "Mangler", partial: "Delvist", na: "Ikke relevant",
};

// POST /api/systems/[id]/report — send rapport-email
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { to, message } = await req.json() as { to: string; message?: string };

  if (!to?.includes("@")) {
    return Response.json({ error: "Ugyldig email" }, { status: 400 });
  }
  if (!RESEND_KEY) {
    return Response.json({ error: "RESEND_API_KEY mangler" }, { status: 500 });
  }

  // Hent system-data
  const rows = await dbGet<Record<string, unknown>[]>(
    `/ai_systems?id=eq.${id}&select=*,compliance_requirements(*),incidents(*)&limit=1`
  );
  const system = rows[0];
  if (!system) return Response.json({ error: "System ikke fundet" }, { status: 404 });

  const compliance = (system.compliance_requirements as Record<string, string>[]) ?? [];
  const incidents  = (system.incidents  as Record<string, unknown>[]) ?? [];

  const metCount     = compliance.filter(c => c.status === "met").length;
  const gapCount     = compliance.filter(c => c.status === "gap").length;
  const partialCount = compliance.filter(c => c.status === "partial").length;
  const naCount      = compliance.filter(c => c.status === "na").length;
  const totalRelevant = compliance.length - naCount;
  const score = totalRelevant > 0
    ? Math.round(((metCount + partialCount * 0.5) / totalRelevant) * 100)
    : null;

  const openInc  = (incidents as Record<string, unknown>[]).filter(i => i.status === "open" || i.status === "investigating");
  const today    = new Date().toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
  const reportUrl = `${PUBLIC_URL}/systems/${id}/report`;

  const scoreColor = score === null ? "#888"
    : score >= 80 ? "#16a34a"
    : score >= 50 ? "#d97706"
    : "#dc2626";

  const complianceRows = compliance
    .filter(c => c.status !== "na")
    .map(c => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#6b7280;">${c.article ?? c.requirement_id ?? "—"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">${c.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;font-weight:600;color:${
          c.status === "met" ? "#16a34a" : c.status === "gap" ? "#dc2626" : "#d97706"
        };">${STATUS_DA[c.status] ?? c.status}</td>
      </tr>
    `).join("")

  const html = `<!DOCTYPE html>
<html lang="da">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <div style="max-width:680px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;margin-bottom:8px;">Decode AI · EU AI Act Compliance</div>
      <h1 style="font-size:24px;font-weight:700;margin:0;">${system.name as string}</h1>
      <p style="font-size:13px;color:#6b7280;margin-top:6px;">${today}</p>
    </div>

    <!-- Score cards -->
    <div style="display:flex;gap:16px;margin-bottom:32px;text-align:center;">
      <div style="flex:1;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin-bottom:8px;">EU AI Act niveau</div>
        <div style="font-size:18px;font-weight:700;">${RISK_DA[system.risk_level as string] ?? system.risk_level ?? "—"}</div>
      </div>
      <div style="flex:1;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin-bottom:8px;">Compliance score</div>
        <div style="font-size:28px;font-weight:700;color:${scoreColor};">${score !== null ? `${score}%` : "—"}</div>
        <div style="font-size:11px;color:#9ca3af;">${metCount} opfyldt · ${gapCount} gap · ${partialCount} delvist</div>
      </div>
      <div style="flex:1;background:#fff;border:${openInc.length > 0 ? "1px solid #fca5a5" : "1px solid #e5e7eb"};border-radius:10px;padding:20px;background:${openInc.length > 0 ? "#fef2f2" : "#fff"};">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin-bottom:8px;">Åbne incidents</div>
        <div style="font-size:28px;font-weight:700;color:${openInc.length > 0 ? "#dc2626" : "#16a34a"};">${openInc.length}</div>
      </div>
    </div>

    ${message ? `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:24px;">
      <p style="font-size:14px;line-height:1.7;margin:0;">${message.replace(/\n/g, "<br>")}</p>
    </div>
    ` : ""}

    <!-- Compliance tabel -->
    ${compliance.length > 0 ? `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      <div style="padding:16px 20px;border-bottom:1px solid #f3f4f6;">
        <h2 style="font-size:14px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:0.06em;">Compliance krav</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:500;">Artikel</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:500;">Krav</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:500;">Status</th>
          </tr>
        </thead>
        <tbody>${complianceRows}</tbody>
      </table>
    </div>
    ` : ""}

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${reportUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;">
        Se den fulde rapport →
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;font-size:11px;color:#9ca3af;">
      <p>Anne Ringgaard · <a href="mailto:anne@decodeai.dk" style="color:#9ca3af;">anne@decodeai.dk</a> · <a href="https://decodeai.dk" style="color:#9ca3af;">decodeai.dk</a></p>
    </div>
  </div>
</body>
</html>`;

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      Authorization:   `Bearer ${RESEND_KEY}`,
    },
    body: JSON.stringify({
      from:    "Decode Audit <audit@decodeai.dk>",
      to:      [to],
      subject: `EU AI Act compliance rapport — ${system.name as string}`,
      html,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    return Response.json({ error: `Email fejl: ${err}` }, { status: 502 });
  }

  return Response.json({ ok: true });
}
