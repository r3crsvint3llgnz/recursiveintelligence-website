export function getBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const base = fromEnv || "http://localhost:3000";
  return base.replace(/\/$/, "");
}
