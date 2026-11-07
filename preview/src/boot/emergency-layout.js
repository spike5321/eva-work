// Geometry for the emergency splash: a single flat honeycomb plane that the DOM
// then puts into perspective. No DOM here, only numbers, so the same data can be
// measured in tests and drawn as SVG.
//
// The plane is a flat-top hex lattice in design pixels. CSS applies
// `translate() scale() perspective() rotateY() rotateZ()` to the whole SVG, so
// every cell, glyph and triangle shares one projection.

export const EMERGENCY_PALETTE = Object.freeze({
  red: '#ef060c',
  deep: '#b90308',
  ink: '#030101',
});

export const HEX_W = 200;
export const HEX_H = HEX_W * Math.sqrt(3) / 2;
export const ROW_H = HEX_H;
export const GAP = 5;
export const PROJECTION = Object.freeze({ perspective: 1100, rotateY: -30, rotateZ: -2 });

const round = n => Math.round(n * 100) / 100;

export function hexVertices(cx, cy, w = HEX_W, h = HEX_H) {
  const hw = w / 2;
  const hh = h / 2;
  return [
    [cx - hw / 2, cy - hh],
    [cx + hw / 2, cy - hh],
    [cx + hw, cy],
    [cx + hw / 2, cy + hh],
    [cx - hw / 2, cy + hh],
    [cx - hw, cy],
  ];
}

export const toPoints = pts => pts.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');

// col/row/type. The six middle cells merge into one uninterrupted instrument.
const SLOT_TABLE = [
  [0, 0, 'emergency'], [0, 1, 'emergency'], [0, 2, 'emergency'], [0, 3, 'emergency'],
  [1, 0, 'identity'], [1, 1, 'warning'], [1, 2, 'levels'],
  [2, 0, 'emergency'], [2, 1, 'clock'], [2, 2, 'clock'], [2, 3, 'emergency'],
  [3, 0, 'signal'], [3, 1, 'clock'], [3, 2, 'status'],
  [4, 0, 'emergency'], [4, 1, 'clock'], [4, 2, 'clock'], [4, 3, 'emergency'],
  [5, 0, 'internal'], [5, 1, 'clock'], [5, 2, 'nerv'],
  [6, 0, 'emergency'], [6, 1, 'emergency'], [6, 2, 'emergency'], [6, 3, 'emergency'],
];

export const EMERGENCY_LABELS = Object.freeze({
  pilot: 'AYANAMI REI',
  unit: 'EVA-00',
  link: 'STANDBY',
  status: '緊急狀態',
  time: 'LOCAL SYSTEM TIME',
  monitor: 'SIGNAL MONITOR',
  internal: '內部',
  internalEn: 'INTERNAL',
});

// Cancel shared edges, then walk the remaining perimeter of the joined cells.
function mergedRowOutline(list) {
  const key = ([x, y]) => `${round(x)},${round(y)}`;
  const edges = new Map();
  for (const cell of list) {
    cell.polygon.forEach((a, i) => {
      const b = cell.polygon[(i + 1) % 6];
      const edgeKey = [key(a), key(b)].sort().join('|');
      if (edges.has(edgeKey)) edges.delete(edgeKey);
      else edges.set(edgeKey, [a, b]);
    });
  }
  const next = new Map([...edges.values()].map(([a, b]) => [key(a), b]));
  const pts = [[...edges.values()][0][0]];
  while (pts.length < edges.size) {
    pts.push(next.get(key(pts[pts.length - 1])));
  }
  return pts;
}

const slots = SLOT_TABLE.map(([col, row, type]) => {
  const cx = col * HEX_W * 0.75;
  const cy = (row + (col % 2) / 2) * ROW_H;
  return { id: `${type}-${row}-${col}`, type, row, col, cx, cy, polygon: hexVertices(cx, cy) };
});

const clockSlots = slots.filter(s => s.type === 'clock');
const clock = {
  id: 'clock',
  type: 'clock',
  row: 1,
  col: 3,
  cx: 450,
  cy: ROW_H * 1.5,
  polygon: mergedRowOutline(clockSlots),
};

export const EMERGENCY_PANELS = Object.freeze(
  [
    ...slots.filter(s => s.type !== 'clock').map(s => ({ ...s, points: toPoints(s.polygon) })),
    { ...clock, points: toPoints(clock.polygon) },
  ].sort((a, b) => a.row - b.row || a.cx - b.cx),
);

export const EMERGENCY_CLOCK = Object.freeze({ ...clock, points: toPoints(clock.polygon) });

const bounds = EMERGENCY_PANELS.reduce(
  (acc, cell) => {
    cell.polygon.forEach(([x, y]) => {
      acc.minX = Math.min(acc.minX, x);
      acc.maxX = Math.max(acc.maxX, x);
      acc.minY = Math.min(acc.minY, y);
      acc.maxY = Math.max(acc.maxY, y);
    });
    return acc;
  },
  { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
);

export const PLANE = Object.freeze({
  minX: bounds.minX,
  minY: bounds.minY,
  width: bounds.maxX - bounds.minX,
  height: bounds.maxY - bounds.minY,
  viewBox: `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`,
});

const DEG = Math.PI / 180;

// Same order as the CSS chain: rotateZ, rotateY, perspective divide, scale, translate.
function project(px, py, { perspective, rotateY, rotateZ, scale, x, y }) {
  const cosZ = Math.cos(rotateZ * DEG);
  const sinZ = Math.sin(rotateZ * DEG);
  const cosY = Math.cos(rotateY * DEG);
  const sinY = Math.sin(rotateY * DEG);
  const zx = px * cosZ - py * sinZ;
  const zy = px * sinZ + py * cosZ;
  const ry = zx * cosY;
  const rz = -zx * sinY;
  const k = perspective / (perspective - rz);
  return [ry * k * scale + x, zy * k * scale + y];
}

// Targets from the design spec: 58-70vw wide, 76-86vh tall, extra space on ultra-wide.
export function emergencyLayout(width, height) {
  const { perspective, rotateY, rotateZ } = PROJECTION;
  const toLocal = ([x, y]) => [x - PLANE.minX - PLANE.width / 2, y - PLANE.minY - PLANE.height / 2];
  const probe = { perspective, rotateY, rotateZ, scale: 1, x: 0, y: 0 };

  let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
  for (const cell of EMERGENCY_PANELS) {
    for (const point of cell.polygon) {
      const [sx, sy] = project(...toLocal(point), probe);
      minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
      minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
    }
  }

  const projW = maxX - minX;
  const projH = maxY - minY;
  // Ultra-wide screens keep black margins instead of stretching to fill.
  const scale = Math.min((width * 0.68) / projW, (height - 160) / projH);
  // The plane is centred on the viewport by CSS, so the offset only has to move
  // the projected bounding box back onto the viewport centre.
  const x = -scale * ((minX + maxX) / 2);
  const y = -scale * ((minY + maxY) / 2) - 55;

  return {
    width: PLANE.width,
    height: PLANE.height,
    perspective,
    rotateY,
    rotateZ,
    scale,
    x,
    y,
    transform: `translate3d(${round(x)}px, ${round(y)}px, 0) scale(${round(scale * 1000) / 1000}) perspective(${perspective}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
    projected: { width: projW * scale, height: projH * scale },
  };
}

export function formatClock(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
