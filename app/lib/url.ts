/**
 * Base URL til server-side fetch i server components.
 * - Lokalt: http://localhost:3000
 * - Vercel preview: https://[VERCEL_URL]
 * - Produktion: https://[NEXT_PUBLIC_SITE_URL] (sæt denne i Vercel env vars)
 */
export function baseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
