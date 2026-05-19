import { NextRequest } from "next/server";
import { dbGet, dbPatch, auditLog } from "@/app/lib/db";

type Params = { params: Promise<{ id: string }> };

// POST /api/incidents/[id]/resolve
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { root_cause, resolution_notes, status } = await req.json();
    const newStatus = status === "wont_fix" ? "wont_fix" : "resolved";

    const rows = await dbGet<unknown[]>(`/incidents?id=eq.${id}`);
    const old = Array.isArray(rows) ? rows[0] : null;
    if (!old) return Response.json({ error: "Incident ikke fundet" }, { status: 404 });

    const patch: Record<string, unknown> = {
      status: newStatus,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (root_cause) patch.root_cause = root_cause;
    if (resolution_notes) patch.notes = resolution_notes;

    await dbPatch(`/incidents?id=eq.${id}`, patch);
    await auditLog({
      table: "incidents", recordId: Number(id), action: "UPDATE",
      oldValues: old as Record<string, unknown>,
      newValues: patch,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
