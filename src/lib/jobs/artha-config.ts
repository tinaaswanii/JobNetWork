// The original working client (lib/artha.ts and .env.example at 347508c) used
// this host. An earlier Lovable copy defaulted to api-usa.artha.link instead.
export const ARTHA_DEFAULT_BASE_URL = "https://api.artha.link/api/v1";

/** ARTHA_BASE_URL if set to a non-empty value, otherwise the default host. */
export function getArthaBaseUrl(env: Record<string, string | undefined> = process.env): string {
  const override = env["ARTHA_BASE_URL"]?.trim();
  return (override || ARTHA_DEFAULT_BASE_URL).replace(/\/+$/, "");
}
