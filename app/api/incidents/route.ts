import { NextRequest } from "next/server";
import { dbGet, dbPost, auditLog } from "@/app/lib/db";

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
    const { system_id, title, description, severity, category, detected_by, assigned_to, test_case_id, impact } = body;
    if (!system_id || !title || !description || !category) {
      return Response.json({ error: "system_id, title, description og category er påkrævet" }, { status: 400 });
    }

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
