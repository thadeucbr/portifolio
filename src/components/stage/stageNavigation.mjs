export const STAGE_IDS = Object.freeze(["hero", "systems", "resilience", "agent", "dossier"]);

/** Resolve numbered navigation shortcuts without hijacking text entry. */
export function stageForShortcut(key, editing = false) {
  if (editing || !/^[1-5]$/.test(key)) return null;
  return STAGE_IDS[Number(key) - 1];
}

/** Return the semantic direction for a stage change, or null when unchanged. */
export function transitionDirection(current, next) {
  const from = STAGE_IDS.indexOf(current);
  const to = STAGE_IDS.indexOf(next);
  if (from < 0 || to < 0 || from === to) return null;
  return to > from ? "nav-forward" : "nav-back";
}
