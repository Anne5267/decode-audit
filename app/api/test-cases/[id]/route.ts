import { NextRequest } from "next/server";
import { dbGet, dbPatch, dbDelete, auditLog } from "@/app/lib/db";

type Params = { params: Promise<{ id: string }> };

// GET /api/test-cases/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const rows = await dbGet<unknown[]>(
      `/test_cases?id=eq.${id}&select=*,ai_systems(name)`
    );
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return Response.json({ error: "Test case ikke fundet" }, { status: 404 });
    return Response.json(row);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// PUT /api/test-cases/[id] — opdater status, actual_output, notes
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const rows = await dbGet<unknown[]>(`/test_cases?id=eq.${id}`);
    const old = Array.isArray(rows) ? rows[0] : null;
    if (!old) return Response.json({ error: "Test case ikke fundet" }, { status: 404 });

    const patch = { ...body, updated_at: new Date().toISOString() };
    await dbPatch(`/test_cases?id=eq.${id}`, patch);
    await auditLog({
      table: "test_cases", recordId: Number(id), action: "UPDATE",
      oldValues: old as Record<string, unknown>,
      newValues: patch,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/test-cases/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const rows = await dbGet<unknown[]>(`/test_cases?id=eq.${id}`);
    const old = Array.isArray(rows) ? rows[0] : null;
    if (!old) return Response.json({ error: "Test case ikke fundet" }, { status: 404 });

    await dbDelete(`/test_cases?id=eq.${id}`);
    await auditLog({
      table: "test_cases", recordId: Number(id), action: "DELETE",
      oldValues: old as Record<string, unknown>,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
