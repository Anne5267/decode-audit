// app/api/compliance/bulk/route.ts — Batch-opret compliance-krav
// Version 1.0 — 2026-05-23
// Bruges af /systems/new efter AI-analyse

import { NextRequest } from "next/server";
import { headers as sbHeaders, auditLog } from "@/app/lib/db";

const SUPABASE_URL = process.env.SUPABASE_URL!;

interface ComplianceItem {
  system_id:      number
  framework:      string
  article:        string
  requirement_id: string
  title:          string
  requirement:    string
  description:    string
  status:         string
  responsible:    string | null
}

export async function POST(req: NextRequest) {
  try {
    const { system_id, items }: { system_id: number; items: ComplianceItem[] } = await req.json()

    if (!system_id || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "system_id og items[] kræves" }, { status: 400 })
    }

    // Batch insert via Supabase POST med array
    const rows = items.map(item => ({
      system_id:      system_id,
      framework:      item.framework ?? "EU AI Act",
      article:        item.article,
      requirement_id: item.requirement_id,
      title:          item.title,
      requirement:    item.requirement,
      description:    item.description,
      status:         item.status ?? "gap",
      responsible:    item.responsible ?? null,
    }))

    const res = await fetch(`${SUPABASE_URL}/rest/v1/compliance_requirements`, {
      method:  "POST",
      headers: sbHeaders({ Prefer: "return=representation" }),
      body:    JSON.stringify(rows),
    })

    if (!res.ok) {
      const err = await res.text()
      return Response.json({ error: `DB fejl: ${err}` }, { status: 500 })
    }

    const inserted: { id: number }[] = await res.json()

    // Audit hvert krav
    for (const r of inserted) {
      auditLog({
        table:     "compliance_requirements",
        recordId:  r.id,
        action:    "INSERT",
        newValues: r,
        changedBy: "ai-analyze",
      }).catch(() => {})
    }

    return Response.json({ ok: true, count: inserted.length }, { status: 201 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
