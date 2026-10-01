type Session = { access_token: string; refresh_token: string };
/** Prices and entitlement are verified by the authenticated app, never by this URL. */
export function destinoPagoPablo(plan: string, search = "", codigo = "", session?: Session | null): string {
  const selected = ["semanal", "mensual", "anual"].includes(plan) ? plan : "mensual";
  const validSession = typeof session?.access_token === "string" && Boolean(session.access_token)
    && typeof session?.refresh_token === "string" && Boolean(session.refresh_token);
  const url = new URL(validSession ? "https://usapablo.app/auth/sesion" : "https://usapablo.app/pricing");
  url.searchParams.set("plan", selected);
  const source = new URLSearchParams(search);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ph_did", "fbclid", "ttclid"]) {
    const value = source.get(key);
    if (value) url.searchParams.set(key, value);
  }
  const coupon = codigo || source.get("codigo");
  if (coupon) url.searchParams.set("codigo", coupon);
  if (validSession) url.hash = new URLSearchParams({ access_token: session!.access_token, refresh_token: session!.refresh_token }).toString();
  return url.toString();
}
