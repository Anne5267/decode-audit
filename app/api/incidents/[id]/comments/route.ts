import { NextRequest } from "next/server";
import { dbPost } from "@/app/lib/db";

type Params = { params: Promise<{ id: string }> };

// POST /api/incidents/[id]/comments
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { content, author } = await req.json();
    if (!content) return Response.json({ error: "content er påkrævet" }, { status: 400 });

    const comment = await dbPost("/tracker_comments", {
      incident_id: Number(id),
      content,
      author: author ?? "Anne",
    });
    return Response.json(comment, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
