// Seven-segment readout drawn as flat geometry so it sits in the same plane as
// the honeycomb (no HTML text, no font dependency for the digits).
import React from 'react';

const SEGMENTS = {
  0: 'ABCDEF', 1: 'BC', 2: 'ABGED', 3: 'ABGCD', 4: 'FGBC',
  5: 'AFGCD', 6: 'AFGECD', 7: 'ABC', 8: 'ABCDEFG', 9: 'ABCDFG',
};

// Proportions measured off the reference: tall, narrow, thick-stroked digits.
export const GLYPH_W = 0.46;
export const GLYPH_GAP = 0.1;
export const COLON_W = 0.34;

// 45° mitre on every segment end, no extra gap: neighbouring segments touch at
// the corner diagonal, which is what gives a real LCD its notched look.
const bevel = t => t * 0.45;

function hSegment(x0, x1, y, t) {
  const b = bevel(t);
  return [[x0 + b, y], [x1 - b, y], [x1, y + t / 2], [x1 - b, y + t], [x0 + b, y + t], [x0, y + t / 2]];
}

function vSegment(x, y0, y1, t) {
  const b = bevel(t);
  return [[x, y0 + b], [x + t / 2, y0], [x + t, y0 + b], [x + t, y1 - b], [x + t / 2, y1], [x, y1 - b]];
}

const path = (points, key) => (
  <polygon key={key} points={points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} />
);

// One glyph in a `size`-tall box, origin at its top-left corner.
function Glyph({ char, x, y, size, color }) {
  const h = size;
  const t = h * 0.145;
  const w = h * GLYPH_W;
  const mid = h / 2;

  if (char === ':') {
    const s = t * 0.9;
    const dotX = x + h * 0.11;
    return (
      <g fill={color}>
        <rect x={dotX} y={y + h * 0.27} width={s} height={s} />
        <rect x={dotX} y={y + h * 0.59} width={s} height={s} />
      </g>
    );
  }

  const on = SEGMENTS[char] || '';
  // Segments run centre-to-centre so neighbouring bars overlap: on red the
  // junctions read solid, and only the outer silhouette keeps the 45° mitre that
  // makes it look like a real LCD. Digits with a middle bar tuck the verticals
  // into it, digits without one (0) overlap the two halves instead.
  const hasMid = on.includes('G');
  const hx0 = x + t / 2;
  const hx1 = x + w - t / 2;
  const vy0 = y + t / 2;
  const vy1 = y + mid;
  const upperEnd = hasMid ? vy1 : vy1 + t / 2;
  const lowerStart = hasMid ? vy1 : vy1 - t / 2;
  const shapes = [
    on.includes('A') && path(hSegment(hx0, hx1, y, t), 'A'),
    on.includes('G') && path(hSegment(hx0, hx1, y + mid - t / 2, t), 'G'),
    on.includes('D') && path(hSegment(hx0, hx1, y + h - t, t), 'D'),
    on.includes('F') && path(vSegment(x, vy0, upperEnd, t), 'F'),
    on.includes('B') && path(vSegment(x + w - t, vy0, upperEnd, t), 'B'),
    on.includes('E') && path(vSegment(x, lowerStart, y + h - t / 2, t), 'E'),
    on.includes('C') && path(vSegment(x + w - t, lowerStart, y + h - t / 2, t), 'C'),
  ].filter(Boolean);

  return <g fill={color}>{shapes}</g>;
}

const advance = (ch, height) => (ch === ':' ? height * COLON_W : height * (GLYPH_W + GLYPH_GAP));

export function EmergencyDigits({ value = '00:00:00', color = '#030101', height = 112, x = 0, y = 0, skew = -8 }) {
  const chars = String(value).split('');
  const width = emergencyDigitsWidth(value, height);
  const midY = y + height / 2;
  const midX = x + width / 2;
  // The reference readout is oblique: the segments lean right like a skewed LCD.
  const transform = skew ? `translate(${midX} ${midY}) skewX(${skew}) translate(${-midX} ${-midY})` : undefined;
  let cursor = x;
  return (
    <g transform={transform} shapeRendering="geometricPrecision">
      {chars.map((ch, i) => {
        const node = <Glyph key={`${ch}-${i}`} char={ch} x={cursor} y={y} size={height} color={color} />;
        cursor += advance(ch, height);
        return node;
      })}
    </g>
  );
}

export function emergencyDigitsWidth(value, height) {
  const chars = String(value).split('');
  return chars.reduce((sum, ch) => sum + advance(ch, height), 0) - height * GLYPH_GAP;
}
