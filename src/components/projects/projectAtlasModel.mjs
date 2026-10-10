const ORBIT_SCORE = 0.28;

/** Keep one selected project central while the remaining cards stay peripheral. */
export function buildProjectGravityScores(projects, selectedId) {
  if (projects.length === 0) return {};
  const activeId = projects.some((project) => project.id === selectedId)
    ? selectedId
    : projects[0].id;

  return Object.fromEntries(
    projects.map((project) => [project.id, project.id === activeId ? 1 : ORBIT_SCORE]),
  );
}
