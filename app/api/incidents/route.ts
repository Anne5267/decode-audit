import { NextRequest } from "next/server";
import { z } from "zod";
import { dbGet, dbPost, auditLog } from "@/app/lib/db";

const CreateIncidentSchema = z.object({
  system_id: z.number().int().positive(),
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(5000),
  severity: z.number().int().min(1).max(5).optional(),
  category: z.enum(["bias", "hallucination", "safety", "accuracy", "performance", "edge_case", "regression", "compliance"]),
  detected_by: z.string().max(200).optional(),
  assigned_to: z.string().max(200).optional(),
  test_case_id: z.number().int().positive().optional().nullable(),
  impact: z.string().max(2000).optional().nullable(),
});

// GET /api/incidents — list med filtrering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const system_id = searchParams.get("system_id");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const limit = searchParams.get("limit") ?? "50";
    const offset = searchParams.get("offset") ?? "0";

    let path = "/incidents?order=severity.asc,created_at.desc";
    if (system_id) path += `&system_id=eq.${system_id}`;
    if (status) path += `&status=eq.${status}`;
    if (severity) path += `&severity=eq.${severity}`;
    path += `&limit=${limit}&offset=${offset}`;

    // Hent incidents + system-navn via select
    path = path.replace("/incidents?", "/incidents?select=*,ai_systems(name)&");

    const incidents = await dbGet(path);
    return Response.json(incidents);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/incidents — opret incident
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = CreateIncidentSchema.safeParse(body);
    if (!result.success) return Response.json({ error: result.error.flatten() }, { status: 400 });
    const { system_id, title, description, severity, category, detected_by, assigned_to, test_case_id, impact } = result.data;

    const incident = await dbPost<{ id: number } & Record<string, unknown>>("/incidents", {
      system_id, title, description,
      severity: severity ?? 3,
      category, detected_by, assigned_to,
      test_case_id: test_case_id ?? null,
      impact: impact ?? null,
      status: "open",
    });
    await auditLog({ table: "incidents", recordId: incident.id, action: "INSERT", newValues: incident });
    return Response.json(incident, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
