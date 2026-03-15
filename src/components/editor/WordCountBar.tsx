'use client';

// ─── WordCountBar ─────────────────────────────────────────────────────────────
//
// Displays the current word count and optional progress toward a word target.
//
// Progress arc SVG:
//   - Gray circle track
//   - Coloured arc fill based on percent
//     0-99%  → blue
//     100%   → green
//   - Hidden when no target is set
//
// ─────────────────────────────────────────────────────────────────────────────

interface WordCountBarProps {
  count: number;
  target?: number;
  percent: number;
}

export function WordCountBar({ count, target, percent }: WordCountBarProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {target != null && <ProgressArc percent={percent} />}
      <span>
        {count.toLocaleString()} {count === 1 ? 'word' : 'words'}
        {target != null && (
          <span className="ml-1 text-muted-foreground/70">
            {' '}/ {target.toLocaleString()} target
          </span>
        )}
      </span>
    </div>
  );
}

// ─── Progress arc ─────────────────────────────────────────────────────────────

const SIZE = 20;
const STROKE = 2.5;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function ProgressArc({ percent }: { percent: number }) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const dashOffset = CIRCUMFERENCE * (1 - clampedPercent / 100);

  const arcColor =
    clampedPercent >= 100
      ? 'text-green-500'
      : 'text-blue-500';

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-label={`${clampedPercent}% of word target`}
      role="img"
    >
      {/* Track */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        fill="none"
        strokeWidth={STROKE}
        className="stroke-muted"
      />
      {/* Progress */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        fill="none"
        strokeWidth={STROKE}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        className={`stroke-current transition-all duration-300 ${arcColor}`}
      />
    </svg>
  );
}
