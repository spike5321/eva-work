import React, { useEffect, useState } from 'react';
import {
  EMERGENCY_PANELS,
  EMERGENCY_PALETTE,
  EMERGENCY_LABELS as L,
  PLANE,
  GAP,
  emergencyLayout,
  formatClock,
} from './emergency-layout.js';
import { EmergencyDigits, emergencyDigitsWidth } from './EmergencyDigits.jsx';
import './emergency-splash.css';

const { red, ink } = EMERGENCY_PALETTE;
const STROKE = GAP * 2;

// Solid black triangle, reference-style: up above the word, down below it.
function Triangle({ cx, y, size = 42, down = false }) {
  const h = size * 0.86;
  const w = size * 0.56;
  const points = down
    ? `${cx},${y} ${cx - w},${y - h} ${cx + w},${y - h}`
    : `${cx},${y} ${cx + w},${y + h} ${cx - w},${y + h}`;
  return <polygon points={points} fill={ink} />;
}

function Rule({ x1, x2, y, width = 2, opacity = 1 }) {
  return <line x1={x1} x2={x2} y1={y} y2={y} stroke={ink} strokeWidth={width} opacity={opacity} />;
}

function micro(text, x, y, { size = 9, weight = 600, anchor = 'start', spacing = 1.6 } = {}) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} letterSpacing={spacing} textAnchor={anchor} fill={ink}>
      {text}
    </text>
  );
}

function EmergencyCell({ cx, cy }) {
  return (
    <g transform="translate(0 4)">
      <Triangle cx={cx} y={cy - 65} size={34} />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="20" fontWeight="750" letterSpacing="0.3" fill={ink}>
        EMERGENCY
      </text>
      <Triangle cx={cx} y={cy + 57} size={34} down />
    </g>
  );
}

function IdentityCell({ cx, cy }) {
  const x = cx - 68;
  return (
    <g>
      {micro('PILOT', x, cy - 56, { size: 8.5, spacing: 2.4 })}
      <text x={x} y={cy - 36} fontSize="16" fontWeight="700" letterSpacing="0.6" fill={ink}>{L.pilot}</text>
      <Rule x1={x} x2={x + 136} y={cy - 26} width={1.5} />
      {micro('UNIT', x, cy - 6, { size: 8.5, spacing: 2.4 })}
      <text x={x} y={cy + 14} fontSize="16" fontWeight="700" letterSpacing="0.6" fill={ink}>{L.unit}</text>
      {micro('LINK', x, cy + 38, { size: 8.5, spacing: 2.4 })}
      <text x={x} y={cy + 58} fontSize="16" fontWeight="700" letterSpacing="0.6" fill={ink}>{L.link}</text>
    </g>
  );
}

function WarningCell({ cx, cy }) {
  const x = cx - 68;
  return (
    <g>
      <rect x={x} y={cy - 62} width={136} height={44} fill="none" stroke={ink} strokeWidth={3} />
      <rect x={x + 96} y={cy - 62} width={40} height={44} fill="url(#emg-hatch)" />
      <text x={x + 10} y={cy - 30} fontSize="22" fontWeight="900" fill={ink} fontFamily="EvaDisplay, serif">警告</text>
      {micro('WARNING', x + 52, cy - 40, { size: 7, spacing: 1.2 })}
      {micro('WARNING', x + 52, cy - 31, { size: 7, spacing: 1.2, opacity: 0 })}
      {micro('SYSTEM LINK', x, cy + 2, { size: 8, spacing: 1.8 })}
      {micro('MANUAL START', x, cy + 17, { size: 8, spacing: 1.8 })}
      <text x={x} y={cy + 50} fontSize="22" fontWeight="700" letterSpacing="2" fill={ink}>STANDBY</text>
      <Rule x1={x} x2={x + 136} y={cy + 64} width={2} />
    </g>
  );
}

function LevelsCell({ cx, cy }) {
  const x = cx - 68;
  const rows = [['OXYGEN', 30], ['CARBON DIOXIDE', 20], ['NITROGEN', 50]];
  return (
    <g>
      {rows.map(([label, value], i) => {
        const y = cy - 66 + i * 38;
        return (
          <g key={label}>
            <rect x={x} y={y} width={128} height={11} fill="none" stroke={ink} strokeWidth={2} />
            <rect x={x + 2} y={y + 2} width={Math.max(0, (124 * value) / 100)} height={7} fill={ink} />
            {micro(`${label} ${value}%`, x, y + 23, { size: 7.5, spacing: 1.2 })}
          </g>
        );
      })}
      {micro('LCL LEVELS / DEMO', x, cy + 66, { size: 7.5, spacing: 1.1 })}
    </g>
  );
}

function StatusCell({ cx, cy }) {
  const x = cx - 34;
  const rows = ['STOP', 'SLOW', 'NORMAL', 'RACING'];
  return (
    <g>
      {rows.map((label, i) => {
        const y = cy - 44 + i * 30;
        const active = label === 'RACING';
        return (
          <g key={label}>
            {active && <rect x={x - 18} y={y - 11} width={11} height={11} fill={ink} />}
            <text x={x} y={y} fontSize="17" fontWeight="600" letterSpacing="3" fill={ink} opacity={active ? 1 : 0.72}>
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function SignalCell({ cx, cy }) {
  const bars = [22, 40, 26, 48, 30, 52, 36, 24, 44, 30, 50, 20];
  const x = cx - 72;
  const base = cy + 14;
  return (
    <g>
      {bars.map((h, i) => (
        <rect key={i} x={x + i * 12.5} y={base - h} width={8} height={h} fill={ink} opacity={i % 3 === 0 ? 0.55 : 1} />
      ))}
      <Rule x1={x} x2={x + 144} y={base} width={2} />
      {micro(L.monitor, cx, base + 16, { size: 8, spacing: 2, anchor: 'middle' })}
    </g>
  );
}

// Reference plaque: a heavy 內部 stamp with a hatched corner wedge, a bolted
// frame, and a narrower plate underneath carrying the system line. Every block
// is laid out inside explicit columns so nothing crosses the frame.
function InternalCell({ cx, cy }) {
  const w = 140;
  const x = cx - w / 2;
  const top = cy - 62;
  const mainH = 72;
  const subY = top + mainH + 6;
  const subH = 42;
  const wedgeX = x + 94;
  const hatch = [
    [wedgeX, top],
    [x + w, top],
    [x + w, top + mainH * 0.84],
    [x + 80, top + mainH * 0.84],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(' ');
  return (
    <g>
      <rect x={x} y={top} width={w} height={mainH} fill="none" stroke={ink} strokeWidth={3.5} />
      <polygon points={hatch} fill="url(#emg-hatch)" stroke={ink} strokeWidth={2} />
      <text
        x={x + 8}
        y={top + 44}
        fontSize="38"
        fontWeight="900"
        fill={ink}
        stroke={ink}
        strokeWidth={1.7}
        fontFamily="EvaDisplay, 'Noto Serif TC', serif"
      >
        {L.internal}
      </text>
      <text x={x + 9} y={top + 62} fontSize="13" fontWeight="700" letterSpacing="1" fill={ink}>
        {L.internalEn}
      </text>

      <rect x={x} y={subY} width={w} height={subH} fill="none" stroke={ink} strokeWidth={2.5} />
      <text
        x={cx}
        y={subY + 18}
        fontSize="17"
        fontWeight="900"
        fill={ink}
        textAnchor="middle"
        textLength={w - 14}
        lengthAdjust="spacingAndGlyphs"
      >
        主導観測システム
      </text>
      <text
        x={cx}
        y={subY + 33}
        fontSize="7.5"
        fontWeight="700"
        letterSpacing="0.6"
        fill={ink}
        textAnchor="middle"
        textLength={w - 20}
        lengthAdjust="spacingAndGlyphs"
      >
        MONITORING SYSTEM / EVA-00
      </text>
    </g>
  );
}

// Vertical stack of four ideographs, optically centred in the cell.
function VerticalCell({ cx, cy }) {
  const chars = [...L.status];
  const font = 34;
  const pitch = 36;
  const first = cy + font * 0.32 - ((chars.length - 1) * pitch) / 2;
  return (
    <g>
      {chars.map((ch, i) => (
        <text
          key={i}
          x={cx}
          y={first + i * pitch}
          textAnchor="middle"
          fontSize={font}
          fontWeight="900"
          fill={ink}
          stroke={ink}
          strokeWidth={0.6}
          fontFamily="EvaDisplay, 'Noto Serif TC', serif"
        >
          {ch}
        </text>
      ))}
    </g>
  );
}

function NervCell({ cx, cy }) {
  const [failed, setFailed] = useState(false);
  return failed
    ? <text x={cx} y={cy + 12} textAnchor="middle" fontSize="38" fill={ink}>NERV</text>
    : <image href="/assets/nerv.png" x={cx - 58} y={cy - 58} width={116} height={116} onError={() => setFailed(true)} style={{ filter: 'brightness(0)' }} />;
}

function ClockCell({ cx, cy, now }) {
  const value = formatClock(now);
  const height = 112;
  const width = emergencyDigitsWidth(value, height);
  const x = cx + 30 - width / 2;
  const y = cy - height / 2 - 2;
  return (
    <g>
      <EmergencyDigits value={value} height={height} x={x} y={y} color={ink} />
      {micro(L.time, cx + 30, y + height + 22, { size: 10, spacing: 2.2, anchor: 'middle' })}
      <VerticalCell cx={cx + 290} cy={cy} />
      <Triangle cx={cx - 150} y={cy - 145} size={32} />
      <Triangle cx={cx + 150} y={cy - 145} size={32} />
      <Triangle cx={cx - 150} y={cy + 145} size={32} down />
      <Triangle cx={cx + 150} y={cy + 145} size={32} down />
    </g>
  );
}

const CONTENT = {
  emergency: EmergencyCell,
  identity: IdentityCell,
  warning: WarningCell,
  levels: LevelsCell,
  status: StatusCell,
  signal: SignalCell,
  internal: InternalCell,
  vertical: VerticalCell,
  nerv: NervCell,
  clock: ClockCell,
};

export function EmergencySplash({ now = new Date(), ready, exiting, exitProgress = 0, paused, reducedMotion, onStart }) {
  const [size, setSize] = useState(() => [
    typeof window === 'undefined' ? 1440 : window.innerWidth,
    typeof window === 'undefined' ? 900 : window.innerHeight,
  ]);
  useEffect(() => {
    const onResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const layout = emergencyLayout(size[0], size[1]);

  return (
    <div
      className="eva-emergency"
      data-motion={reducedMotion ? 'still' : paused ? 'paused' : 'alive'}
      data-exiting={exiting ? 'true' : 'false'}
      style={{ opacity: exiting ? Math.max(0, 1 - exitProgress) : 1 }}
    >
      <div
        className="emg-plane"
        onClick={onStart}
        style={{
          width: layout.width,
          height: layout.height,
          marginLeft: -layout.width / 2,
          marginTop: -layout.height / 2,
          transform: layout.transform,
        }}
      >
        <svg viewBox={PLANE.viewBox} width="100%" height="100%" aria-hidden="true" fontFamily="Arial, sans-serif">
          <defs>
            <pattern id="emg-hatch" width="12" height="12" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill={red} />
              <rect width="6" height="12" fill={ink} />
            </pattern>
          </defs>
          {EMERGENCY_PANELS.map((panel, index) => {
            const Content = CONTENT[panel.type] || EmergencyCell;
            const breathing = panel.type !== 'clock';
            return (
              <g
                key={panel.id}
                className={breathing ? 'emg-cell' : 'emg-cell emg-cell--steady'}
                style={{ animationDelay: `${(index % 6) * 140}ms` }}
              >
                <polygon points={panel.points} fill={red} stroke="#000" strokeWidth={STROKE} strokeLinejoin="miter" data-hex={panel.id} />
                <g data-content={panel.id} transform={['identity', 'warning', 'levels', 'internal'].includes(panel.type) ? `translate(${panel.cx} ${panel.cy}) scale(.85) translate(${-panel.cx} ${-panel.cy})` : undefined}>
                  <Content cx={panel.cx} cy={panel.cy} now={now} />
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="emg-actions">
        <button type="button" className="emg-start" onClick={onStart} disabled={!ready}>
          <span className="emg-start-cn">起動接續</span>
          <span className="emg-start-en">INITIATE LINK</span>
        </button>
      </div>
    </div>
  );
}
