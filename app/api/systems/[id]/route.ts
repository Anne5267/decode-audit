import { NextRequest } from "next/server";
import { dbGet, dbPatch, auditLog } from "@/app/lib/db";

type Params = { params: Promise<{ id: string }> };

// GET /api/systems/[id] — system med alle incidents + testcases + compliance
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const [system, tests, incidents, compliance] = await Promise.all([
      dbGet(`/system_quality_overview?id=eq.${id}`),
      dbGet(`/test_cases?system_id=eq.${id}&order=priority.asc,created_at.desc`),
      dbGet(`/incidents?system_id=eq.${id}&order=severity.asc,created_at.desc`),
      dbGet(`/compliance_requirements?system_id=eq.${id}&order=framework.asc,article.asc`),
    ]);
    const sys = Array.isArray(system) ? system[0] : system;
    if (!sys) return Response.json({ error: "System ikke fundet" }, { status: 404 });
    return Response.json({ ...sys, test_cases: tests, incidents, compliance });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// PUT /api/systems/[id] — opdater system
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, model_provider, model_name, environment, owner } = body;
    await dbPatch(`/ai_systems?id=eq.${id}`, {
      name, description, model_provider, model_name, environment, owner,
      updated_at: new Date().toISOString(),
    });
    await auditLog({ table: "ai_systems", recordId: Number(id), action: "UPDATE", newValues: body });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
