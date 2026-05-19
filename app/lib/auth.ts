/**
 * auth.ts — simpel password-gate til tracker
 */

export function isAuthorized(req: Request): boolean {
  const pw = req.headers.get("x-tracker-password");
  return pw === process.env.TRACKER_PASSWORD;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
