import { NextRequest } from "next/server";
import { z } from "zod";
import { dbGet, dbPost, auditLog } from "@/app/lib/db";

const CreateTestCaseSchema = z.object({
  system_id: z.number().int().positive(),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum(["safety", "accuracy", "bias", "hallucination", "performance", "edge_case", "regression", "compliance"]),
  input_data: z.string().max(5000).optional().nullable(),
  expected_output: z.string().max(5000).optional().nullable(),
  severity: z.number().int().min(1).max(5).optional(),
});

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
    const result = CreateTestCaseSchema.safeParse(body);
    if (!result.success) return Response.json({ error: result.error.flatten() }, { status: 400 });
    const { system_id, title, description, category, input_data, expected_output, severity } = result.data;

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
