// Quick "role" chips on the jobs page. Each preset is a set of title words, so
// "Developer" finds developer, engineer, SDE and software roles instead of the
// one literal word. Shared by the hero chips, the filter bar and the server.

export const ROLE_PRESETS = {
  developer: { label: "Developer", terms: ["developer", "engineer", "SDE", "software"] },
  data: { label: "Data & analytics", terms: ["analyst", "data", "analytics", "BI", "scientist"] },
  design: { label: "Design", terms: ["designer", "UI", "UX", "graphic"] },
  // TODO(owner): confirm these words for "Senior roles". If Artha's experience
  // levels are confirmed, switching this chip to the exp_level filter is better.
  senior: { label: "Senior roles", terms: ["senior", "lead", "principal", "sr"] },
} as const;

export type RoleKey = keyof typeof ROLE_PRESETS;

export function isRoleKey(v: string | null | undefined): v is RoleKey {
  return !!v && Object.prototype.hasOwnProperty.call(ROLE_PRESETS, v);
}

export function roleTerms(role: string | null | undefined): string[] {
  return isRoleKey(role) ? [...ROLE_PRESETS[role].terms] : [];
}
