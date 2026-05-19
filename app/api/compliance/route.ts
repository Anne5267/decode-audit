import { NextRequest } from "next/server";
import { dbGet, dbPost, auditLog } from "@/app/lib/db";

// GET /api/compliance — liste med filtrering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const system_id = searchParams.get("system_id");
    const framework = searchParams.get("framework");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit") ?? "100";

    let path = "/compliance_requirements?select=*,ai_systems(name)&order=framework.asc,created_at.desc";
    if (system_id) path += `&system_id=eq.${system_id}`;
    if (framework) path += `&framework=eq.${framework}`;
    if (status) path += `&status=eq.${status}`;
    path += `&limit=${limit}`;

    const rows = await dbGet(path);
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/compliance — opret krav
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { system_id, framework, requirement_id, title, description, due_date } = body;
    if (!system_id || !framework || !title) {
      return Response.json({ error: "system_id, framework og title er påkrævet" }, { status: 400 });
    }

    const row = await dbPost<{ id: number } & Record<string, unknown>>("/compliance_requirements", {
      system_id,
      framework,
      requirement_id: requirement_id ?? null,
      title,
      description: description ?? null,
      status: "pending",
      evidence: null,
      due_date: due_date ?? null,
    });
    await auditLog({ table: "compliance_requirements", recordId: row.id, action: "INSERT", newValues: row });
    return Response.json(row, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
