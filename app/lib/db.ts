/**
 * db.ts — Supabase raw fetch helper
 * Samme mønster som mind-coach. Ingen JS-klient, bare fetch mod REST API.
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function headers(extra?: Record<string, string>) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...extra,
  };
}

export async function dbGet<T>(path: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`DB GET ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function dbPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`DB POST ${path}: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function dbPatch(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method: "PATCH",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`DB PATCH ${path}: ${res.status} ${await res.text()}`);
}

export async function dbDelete(path: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method: "DELETE",
    headers: headers({ Prefer: "return=minimal" }),
  });
  if (!res.ok) throw new Error(`DB DELETE ${path}: ${res.status} ${await res.text()}`);
}

export async function auditLog(opts: {
  table: string;
  recordId: number;
  action: "INSERT" | "UPDATE" | "DELETE";
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  changedBy?: string;
}) {
  await fetch(`${SUPABASE_URL}/rest/v1/tracker_audit_log`, {
    method: "POST",
    headers: headers({ Prefer: "return=minimal" }),
    body: JSON.stringify({
      table_name: opts.table,
      record_id: opts.recordId,
      action: opts.action,
      changed_by: opts.changedBy ?? "api",
      old_values: opts.oldValues ?? null,
      new_values: opts.newValues ?? null,
    }),
  }).catch(() => {
    // audit er non-fatal — men vi vil gerne vide om det fejler
    if (!process.env.RESEND_API_KEY) return;
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Decode Audit <audit@decodeai.dk>",
        to: ["anne@decodeai.dk"],
        subject: `Audit write fejlede — ${opts.table}`,
        html: `<p>En audit-log write fejlede.</p><p><strong>Tabel:</strong> ${opts.table}<br><strong>Record:</strong> ${opts.recordId}<br><strong>Action:</strong> ${opts.action}</p>`,
      }),
    }).catch(() => {});
  });
}
