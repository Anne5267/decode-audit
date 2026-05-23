// app/api/systems/route.ts — AI-systemer CRUD
// Version 1.1 — 2026-05-23 — felter aligned med DB-schema + risk_level/status/use_case

import { NextRequest } from "next/server";
import { z } from "zod";
import { dbGet, dbPost, auditLog } from "@/app/lib/db";

const CreateSystemSchema = z.object({
  name:           z.string().min(1).max(200),
  description:    z.string().max(2000).optional(),
  model_provider: z.string().max(100).optional(),
  model_name:     z.string().max(100).optional(),
  environment:    z.enum(["production", "staging", "development"]).optional(),
  owner:          z.string().max(200).optional(),
  use_case:       z.string().max(500).optional(),
  risk_level:     z.enum(["minimal", "limited", "high", "unacceptable"]).optional(),
  status:         z.enum(["active", "testing", "inactive", "deprecated"]).default("active"),
});

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
    const result = CreateSystemSchema.safeParse(body);
    if (!result.success) return Response.json({ error: result.error.flatten() }, { status: 400 });

    const system = await dbPost<{ id: number } & Record<string, unknown>>("/ai_systems", result.data);
    await auditLog({ table: "ai_systems", recordId: system.id, action: "INSERT", newValues: system });
    return Response.json(system, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
