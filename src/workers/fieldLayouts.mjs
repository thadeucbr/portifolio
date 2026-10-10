const DIMENSIONS = {
  chip: { halfWidth: 0.62, halfHeight: 0.62, gapX: 1.8, gapY: 1.6 },
  card: { halfWidth: 1.76, halfHeight: 0.64, gapX: 3.8, gapY: 1.8 },
};

export function createThrowImpulse({ distance, velocityX, velocityY, cancelled = false }) {
  const free = !cancelled && distance >= 8;
  if (!free) return { free: false, vx: 0, vy: 0 };
  return {
    free: true,
    vx: Math.max(-18, Math.min(18, velocityX)),
    vy: Math.max(-18, Math.min(18, velocityY)),
  };
}

function clamp(value, lower, upper) {
  return Math.max(lower, Math.min(upper, value));
}

function gridPositions(count, safeX, safeY, gapX, gapY) {
  const positions = [{ x: 0, y: 0 }];
  for (let ring = 1; positions.length < count; ring += 1) {
    const ringPoints = [
      { x: 0, y: -ring * Math.min(gapY, safeY) },
      { x: ring * Math.min(gapX, safeX), y: 0 },
      { x: 0, y: ring * Math.min(gapY, safeY) },
      { x: -ring * Math.min(gapX, safeX), y: 0 },
    ];
    for (let step = 1; step < ring && positions.length + ringPoints.length < count; step += 1) {
      const offsetX = step * Math.min(gapX, safeX);
      const offsetY = step * Math.min(gapY, safeY);
      ringPoints.push(
        { x: -offsetX, y: -ring * Math.min(gapY, safeY) },
        { x: offsetX, y: -ring * Math.min(gapY, safeY) },
        { x: -offsetX, y: ring * Math.min(gapY, safeY) },
        { x: offsetX, y: ring * Math.min(gapY, safeY) },
        { x: ring * Math.min(gapX, safeX), y: -offsetY },
        { x: ring * Math.min(gapX, safeX), y: offsetY },
        { x: -ring * Math.min(gapX, safeX), y: -offsetY },
        { x: -ring * Math.min(gapX, safeX), y: offsetY },
      );
    }
    for (const point of ringPoints) {
      if (positions.length >= count) break;
      positions.push(point);
    }
  }
  return positions;
}

function trianglePositions(count, safeX, safeY, gapX, gapY) {
  let rows = 1;
  while ((rows * (rows + 1)) / 2 < count) rows += 1;
  const verticalGap = Math.min(gapY, safeY / Math.max(1, (rows - 1) / 2));
  const positions = [];
  for (let row = 0; row < rows && positions.length < count; row += 1) {
    const columns = row + 1;
    const horizontalGap = Math.min(gapX, safeX / Math.max(1, (columns - 1) / 2));
    for (let column = 0; column < columns && positions.length < count; column += 1) {
      positions.push({
        x: (column - (columns - 1) / 2) * horizontalGap,
        y: (row - (rows - 1) / 2) * verticalGap,
      });
    }
  }
  return positions;
}

export function createFieldLayoutTargets(ids, layout, selectedId, width, height, shape = "chip") {
  if (layout === "orbital") return null;
  if (ids.length === 0) return {};

  const dimensions = DIMENSIONS[shape] ?? DIMENSIONS.chip;
  const safeX = Math.max(0, width / 2 - dimensions.halfWidth - 0.2);
  const safeY = Math.max(0, height / 2 - dimensions.halfHeight - 0.2);
  const selected = ids.includes(selectedId) ? selectedId : ids[0];
  const orderedIds = [selected, ...ids.filter((id) => id !== selected)];
  let positions;

  if (layout === "circle") {
    const peers = Math.max(0, orderedIds.length - 1);
    const radiusX = Math.min(safeX, Math.max(dimensions.gapX, (peers * dimensions.gapX) / (2 * Math.PI)));
    const radiusY = Math.min(safeY, Math.max(dimensions.gapY, radiusX * 0.78));
    positions = [{ x: 0, y: 0 }];
    for (let index = 0; index < peers; index += 1) {
      const angle = (index / peers) * Math.PI * 2 - Math.PI / 2;
      positions.push({ x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY });
    }
  } else if (layout === "grid") {
    positions = gridPositions(orderedIds.length, safeX, safeY, dimensions.gapX, dimensions.gapY);
  } else {
    positions = trianglePositions(orderedIds.length, safeX, safeY, dimensions.gapX, dimensions.gapY);
  }

  const targets = {};
  orderedIds.forEach((id, index) => {
    const point = positions[index] ?? { x: 0, y: 0 };
    targets[id] = {
      x: clamp(point.x, -safeX, safeX),
      y: clamp(point.y, -safeY, safeY),
    };
  });
  return targets;
}
