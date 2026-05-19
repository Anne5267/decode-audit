import { NextRequest } from "next/server";
import { dbGet, dbPost, auditLog } from "@/app/lib/db";

// GET /api/systems — list alle systemer med quality-stats
export async function GET() {
  try {
    const systems = await dbGet("/system_quality_overview?order=name.asc");
    return Response.json(systems);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/systems — opret nyt system
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, model_provider, model_name, environment, owner } = body;
    if (!name) return Response.json({ error: "name er påkrævet" }, { status: 400 });

    const system = await dbPost<{ id: number } & Record<string, unknown>>("/ai_systems", {
      name, description, model_provider, model_name, environment, owner,
    });
    await auditLog({ table: "ai_systems", recordId: system.id, action: "INSERT", newValues: system });
    return Response.json(system, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
