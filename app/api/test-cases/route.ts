import { NextRequest } from "next/server";
import { dbGet, dbPost, auditLog } from "@/app/lib/db";

// GET /api/test-cases — liste med filtrering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const system_id = searchParams.get("system_id");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = searchParams.get("limit") ?? "100";
    const offset = searchParams.get("offset") ?? "0";

    let path = "/test_cases?select=*,ai_systems(name)&order=created_at.desc";
    if (system_id) path += `&system_id=eq.${system_id}`;
    if (status) path += `&status=eq.${status}`;
    if (category) path += `&category=eq.${category}`;
    path += `&limit=${limit}&offset=${offset}`;

    const rows = await dbGet(path);
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/test-cases — opret test case
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { system_id, title, description, category, input_data, expected_output, severity } = body;
    if (!system_id || !title || !category) {
      return Response.json({ error: "system_id, title og category er påkrævet" }, { status: 400 });
    }

    const row = await dbPost<{ id: number } & Record<string, unknown>>("/test_cases", {
      system_id,
      title,
      description: description ?? null,
      category,
      input_prompt: input_data ?? title, // input_prompt er NOT NULL i DB
      input_data: input_data ?? null,
      expected_output: expected_output ?? null,
      actual_output: null,
      severity: severity ?? 3,
      status: "pending",
    });
    await auditLog({ table: "test_cases", recordId: row.id, action: "INSERT", newValues: row });
    return Response.json(row, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
