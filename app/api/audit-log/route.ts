import { NextRequest } from "next/server";
import { dbGet } from "@/app/lib/db";

interface AuditRow {
  id: number;
  table_name: string;
  record_id: number;
  action: string;
  changed_by: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_at: string;
}

// GET /api/audit-log — hent audit trail med filtrering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table");
    const action = searchParams.get("action");
    const record_id = searchParams.get("record_id");
    const limit = searchParams.get("limit") ?? "100";
    const offset = searchParams.get("offset") ?? "0";

    let path = "/tracker_audit_log?order=changed_at.desc";
    if (table) path += `&table_name=eq.${encodeURIComponent(table)}`;
    if (action) path += `&action=eq.${encodeURIComponent(action)}`;
    if (record_id) path += `&record_id=eq.${record_id}`;
    path += `&limit=${limit}&offset=${offset}`;

    const rows = await dbGet<AuditRow[]>(path);
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
