export function projectTransitionName(projectId) {
  const normalized = String(projectId ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `portfolio-project-${normalized || "unknown"}`;
}
