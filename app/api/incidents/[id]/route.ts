import { NextRequest } from "next/server";
import { dbGet, dbPatch, auditLog } from "@/app/lib/db";

type Params = { params: Promise<{ id: string }> };

// GET /api/incidents/[id] — incident + comments
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const [rows, comments] = await Promise.all([
      dbGet<unknown[]>(`/incidents?id=eq.${id}&select=*,ai_systems(name),test_cases(title)`),
      dbGet(`/tracker_comments?incident_id=eq.${id}&order=created_at.asc`),
    ]);
    const incident = Array.isArray(rows) ? rows[0] : null;
    if (!incident) return Response.json({ error: "Incident ikke fundet" }, { status: 404 });
    return Response.json({ ...incident, comments });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// PUT /api/incidents/[id] — opdater status / assignment
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const rows = await dbGet<unknown[]>(`/incidents?id=eq.${id}`);
    const old = Array.isArray(rows) ? rows[0] : null;

    await dbPatch(`/incidents?id=eq.${id}`, {
      ...body,
      updated_at: new Date().toISOString(),
    });
    await auditLog({
      table: "incidents", recordId: Number(id), action: "UPDATE",
      oldValues: old as Record<string, unknown>,
      newValues: body,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
