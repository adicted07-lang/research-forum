"use client";

interface ArticleCoverProps {
  category: string;
  title: string;
  className?: string;
}

/* Simple string hash to seed visuals per-title */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/* Deterministic pseudo-random from seed */
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

interface CategoryTheme {
  bg: string;
  colors: [string, string, string];
  accent: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  news: {
    bg: "#0f1729",
    colors: ["#3b82f6", "#60a5fa", "#1e40af"],
    accent: "#93c5fd",
  },
  opinion: {
    bg: "#1a0f29",
    colors: ["#8b5cf6", "#a78bfa", "#6d28d9"],
    accent: "#c4b5fd",
  },
  how_to: {
    bg: "#0a1f14",
    colors: ["#10b981", "#34d399", "#059669"],
    accent: "#6ee7b7",
  },
  interview: {
    bg: "#1f150a",
    colors: ["#f59e0b", "#fbbf24", "#d97706"],
    accent: "#fcd34d",
  },
  announcement: {
    bg: "#1f0a0f",
    colors: ["#ef4444", "#f87171", "#dc2626"],
    accent: "#fca5a5",
  },
  makers: {
    bg: "#0a1a1f",
    colors: ["#14b8a6", "#2dd4bf", "#0d9488"],
    accent: "#5eead4",
  },
};

const DEFAULT_THEME: CategoryTheme = {
  bg: "#0f1729",
  colors: ["#3b82f6", "#60a5fa", "#1e40af"],
  accent: "#93c5fd",
};

export function ArticleCover({ category, title, className }: ArticleCoverProps) {
  const theme = CATEGORY_THEMES[category] ?? DEFAULT_THEME;
  const seed = hashString(title);
  const r = (i: number) => seededRandom(seed, i);

  /* Generate unique shape positions from title hash */
  const circles = Array.from({ length: 5 }, (_, i) => ({
    cx: 10 + r(i * 3) * 80,
    cy: 10 + r(i * 3 + 1) * 80,
    radius: 8 + r(i * 3 + 2) * 25,
    color: theme.colors[i % 3],
    delay: r(i * 7) * 4,
    duration: 5 + r(i * 5) * 6,
  }));

  const dots = Array.from({ length: 12 }, (_, i) => ({
    cx: 5 + r(i * 2 + 20) * 90,
    cy: 5 + r(i * 2 + 21) * 90,
    radius: 1 + r(i + 40) * 2.5,
    delay: r(i + 50) * 3,
    duration: 2 + r(i + 60) * 3,
  }));

  const lines = Array.from({ length: 4 }, (_, i) => ({
    x1: r(i * 4 + 80) * 100,
    y1: r(i * 4 + 81) * 100,
    x2: r(i * 4 + 82) * 100,
    y2: r(i * 4 + 83) * 100,
    delay: r(i + 90) * 3,
    duration: 6 + r(i + 95) * 5,
  }));

  /* Category-specific decorative element */
  const categoryDecor = getCategoryDecor(category, theme, r);

  return (
    <div
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={{ aspectRatio: "16/9", backgroundColor: theme.bg }}
    >
      <svg
        viewBox="0 0 100 56.25"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient background */}
          <radialGradient id={`bg-${seed}`} cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor={theme.colors[0]} stopOpacity="0.15" />
            <stop offset="100%" stopColor={theme.bg} stopOpacity="0" />
          </radialGradient>

          {/* Glow filter */}
          <filter id={`glow-${seed}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background gradient fill */}
        <rect width="100" height="56.25" fill={`url(#bg-${seed})`} />

        {/* Connecting lines */}
        {lines.map((line, i) => (
          <line
            key={`line-${i}`}
            x1={line.x1}
            y1={line.y1 * 0.5625}
            x2={line.x2}
            y2={line.y2 * 0.5625}
            stroke={theme.colors[1]}
            strokeOpacity="0.12"
            strokeWidth="0.15"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.06;0.18;0.06"
              dur={`${line.duration}s`}
              begin={`${line.delay}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}

        {/* Large floating circles */}
        {circles.map((c, i) => (
          <circle
            key={`circle-${i}`}
            cx={c.cx}
            cy={c.cy * 0.5625}
            r={c.radius}
            fill={c.color}
            fillOpacity="0.08"
            filter={i < 2 ? `url(#glow-${seed})` : undefined}
          >
            <animate
              attributeName="cy"
              values={`${c.cy * 0.5625};${c.cy * 0.5625 - 2 - r(i) * 3};${c.cy * 0.5625}`}
              dur={`${c.duration}s`}
              begin={`${c.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="0.06;0.14;0.06"
              dur={`${c.duration * 1.3}s`}
              begin={`${c.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Small pulsing dots */}
        {dots.map((d, i) => (
          <circle
            key={`dot-${i}`}
            cx={d.cx}
            cy={d.cy * 0.5625}
            r={d.radius}
            fill={theme.accent}
            fillOpacity="0.3"
          >
            <animate
              attributeName="r"
              values={`${d.radius};${d.radius * 1.6};${d.radius}`}
              dur={`${d.duration}s`}
              begin={`${d.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="0.3;0.5;0.3"
              dur={`${d.duration}s`}
              begin={`${d.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Category-specific decoration */}
        {categoryDecor}
      </svg>

      {/* Overlay gradient for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${theme.colors[0]}15 0%, transparent 50%, ${theme.colors[2]}10 100%)`,
        }}
      />
    </div>
  );
}

function getCategoryDecor(
  category: string,
  theme: CategoryTheme,
  r: (i: number) => number
): React.ReactNode {
  const cx = 30 + r(100) * 40;
  const cy = 12 + r(101) * 30;

  switch (category) {
    case "news":
      /* Globe / network nodes */
      return (
        <g opacity="0.25">
          <circle cx={cx} cy={cy} r="10" fill="none" stroke={theme.accent} strokeWidth="0.3">
            <animate attributeName="r" values="10;11;10" dur="6s" repeatCount="indefinite" />
          </circle>
          <ellipse cx={cx} cy={cy} rx="10" ry="4" fill="none" stroke={theme.accent} strokeWidth="0.2">
            <animate attributeName="ry" values="4;5;4" dur="6s" repeatCount="indefinite" />
          </ellipse>
          <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke={theme.accent} strokeWidth="0.2" />
          {/* Network nodes */}
          {[0, 1, 2, 3].map((i) => {
            const angle = (i / 4) * Math.PI * 2 + r(110 + i);
            const nx = cx + Math.cos(angle) * 16;
            const ny = cy + Math.sin(angle) * 9;
            return (
              <g key={`node-${i}`}>
                <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={theme.colors[1]} strokeWidth="0.15" strokeOpacity="0.4" />
                <circle cx={nx} cy={ny} r="1" fill={theme.accent} fillOpacity="0.6">
                  <animate attributeName="fill-opacity" values="0.3;0.8;0.3" dur={`${3 + i}s`} repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}
        </g>
      );

    case "opinion":
      /* Speech bubble shapes */
      return (
        <g opacity="0.2">
          <rect x={cx - 9} y={cy - 5} width="18" height="10" rx="3" fill="none" stroke={theme.accent} strokeWidth="0.3">
            <animate attributeName="y" values={`${cy - 5};${cy - 6.5};${cy - 5}`} dur="5s" repeatCount="indefinite" />
          </rect>
          <polygon points={`${cx - 3},${cy + 5} ${cx},${cy + 8} ${cx + 1},${cy + 5}`} fill="none" stroke={theme.accent} strokeWidth="0.3">
            <animate attributeName="points" values={`${cx - 3},${cy + 5} ${cx},${cy + 8} ${cx + 1},${cy + 5};${cx - 3},${cy + 3.5} ${cx},${cy + 6.5} ${cx + 1},${cy + 3.5};${cx - 3},${cy + 5} ${cx},${cy + 8} ${cx + 1},${cy + 5}`} dur="5s" repeatCount="indefinite" />
          </polygon>
          {/* Thought dots */}
          {[0, 1, 2].map((i) => (
            <line
              key={`thought-${i}`}
              x1={cx - 6 + i * 4}
              y1={cy - 1}
              x2={cx - 4 + i * 4}
              y2={cy - 1}
              stroke={theme.accent}
              strokeWidth="0.5"
              strokeLinecap="round"
            >
              <animate attributeName="stroke-opacity" values="0.3;0.8;0.3" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>
      );

    case "how_to":
      /* Gear / steps */
      return (
        <g opacity="0.2">
          {/* Gear shape */}
          <circle cx={cx} cy={cy} r="6" fill="none" stroke={theme.accent} strokeWidth="0.3">
            <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="20s" repeatCount="indefinite" />
          </circle>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i / 6) * Math.PI * 2;
            const ix = cx + Math.cos(angle) * 6;
            const iy = cy + Math.sin(angle) * 6;
            const ox = cx + Math.cos(angle) * 8;
            const oy = cy + Math.sin(angle) * 8;
            return (
              <line key={`tooth-${i}`} x1={ix} y1={iy} x2={ox} y2={oy} stroke={theme.accent} strokeWidth="0.4" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="20s" repeatCount="indefinite" />
              </line>
            );
          })}
          <circle cx={cx} cy={cy} r="2.5" fill="none" stroke={theme.accent} strokeWidth="0.2" />
          {/* Step dots */}
          {[0, 1, 2].map((i) => (
            <g key={`step-${i}`}>
              <circle cx={cx + 16 + i * 6} cy={cy + 2} r="1.5" fill={theme.accent} fillOpacity="0.4">
                <animate attributeName="fill-opacity" values="0.2;0.6;0.2" dur="2s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
              </circle>
              {i < 2 && (
                <line x1={cx + 17.5 + i * 6} y1={cy + 2} x2={cx + 20.5 + i * 6} y2={cy + 2} stroke={theme.accent} strokeWidth="0.2" strokeOpacity="0.3" />
              )}
            </g>
          ))}
        </g>
      );

    case "interview":
      /* Conversation bubbles / microphone */
      return (
        <g opacity="0.22">
          {/* Mic body */}
          <rect x={cx - 2.5} y={cy - 6} width="5" height="8" rx="2.5" fill="none" stroke={theme.accent} strokeWidth="0.3">
            <animate attributeName="y" values={`${cy - 6};${cy - 7};${cy - 6}`} dur="4s" repeatCount="indefinite" />
          </rect>
          <path d={`M${cx - 5},${cy} Q${cx - 5},${cy + 5} ${cx},${cy + 5} Q${cx + 5},${cy + 5} ${cx + 5},${cy}`} fill="none" stroke={theme.accent} strokeWidth="0.25">
            <animate attributeName="d" values={`M${cx - 5},${cy} Q${cx - 5},${cy + 5} ${cx},${cy + 5} Q${cx + 5},${cy + 5} ${cx + 5},${cy};M${cx - 5},${cy - 1} Q${cx - 5},${cy + 4} ${cx},${cy + 4} Q${cx + 5},${cy + 4} ${cx + 5},${cy - 1};M${cx - 5},${cy} Q${cx - 5},${cy + 5} ${cx},${cy + 5} Q${cx + 5},${cy + 5} ${cx + 5},${cy}`} dur="4s" repeatCount="indefinite" />
          </path>
          <line x1={cx} y1={cy + 5} x2={cx} y2={cy + 8} stroke={theme.accent} strokeWidth="0.25">
            <animate attributeName="y1" values={`${cy + 5};${cy + 4};${cy + 5}`} dur="4s" repeatCount="indefinite" />
          </line>
          {/* Sound waves */}
          {[1, 2, 3].map((i) => (
            <path
              key={`wave-${i}`}
              d={`M${cx + 6 + i * 3},${cy - 4} Q${cx + 8 + i * 3},${cy} ${cx + 6 + i * 3},${cy + 4}`}
              fill="none"
              stroke={theme.accent}
              strokeWidth="0.2"
              strokeOpacity={0.6 - i * 0.15}
            >
              <animate attributeName="stroke-opacity" values={`${0.2};${0.6 - i * 0.1};${0.2}`} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
            </path>
          ))}
        </g>
      );

    case "announcement":
      /* Megaphone rays */
      return (
        <g opacity="0.22">
          {/* Megaphone body */}
          <polygon points={`${cx - 6},${cy - 2} ${cx + 4},${cy - 6} ${cx + 4},${cy + 6} ${cx - 6},${cy + 2}`} fill="none" stroke={theme.accent} strokeWidth="0.3">
            <animate attributeName="points" values={`${cx - 6},${cy - 2} ${cx + 4},${cy - 6} ${cx + 4},${cy + 6} ${cx - 6},${cy + 2};${cx - 6},${cy - 2.5} ${cx + 4},${cy - 7} ${cx + 4},${cy + 7} ${cx - 6},${cy + 2.5};${cx - 6},${cy - 2} ${cx + 4},${cy - 6} ${cx + 4},${cy + 6} ${cx - 6},${cy + 2}`} dur="3s" repeatCount="indefinite" />
          </polygon>
          <rect x={cx - 8} y={cy - 2} width="2" height="4" rx="0.5" fill="none" stroke={theme.accent} strokeWidth="0.2" />
          {/* Radiating rays */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = ((i - 2) / 4) * Math.PI * 0.6;
            const len = 8 + i * 2;
            return (
              <line
                key={`ray-${i}`}
                x1={cx + 5}
                y1={cy}
                x2={cx + 5 + Math.cos(angle) * len}
                y2={cy + Math.sin(angle) * len}
                stroke={theme.accent}
                strokeWidth="0.2"
                strokeLinecap="round"
              >
                <animate attributeName="stroke-opacity" values="0.1;0.4;0.1" dur={`${2 + i * 0.3}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
              </line>
            );
          })}
          {/* Radiating circles */}
          {[1, 2].map((i) => (
            <circle key={`rad-${i}`} cx={cx + 5} cy={cy} r={10 + i * 6} fill="none" stroke={theme.accent} strokeWidth="0.15">
              <animate attributeName="r" values={`${10 + i * 6};${12 + i * 6};${10 + i * 6}`} dur={`${3 + i}s`} repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.1;0.25;0.1" dur={`${3 + i}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      );

    case "makers":
      /* Tool / wrench + building blocks */
      return (
        <g opacity="0.22">
          {/* Wrench shape */}
          <circle cx={cx - 4} cy={cy - 4} r="4" fill="none" stroke={theme.accent} strokeWidth="0.3" />
          <circle cx={cx - 4} cy={cy - 4} r="1.5" fill={theme.accent} fillOpacity="0.15" />
          <line x1={cx - 1} y1={cy - 1} x2={cx + 6} y2={cy + 6} stroke={theme.accent} strokeWidth="0.4" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from={`0 ${cx - 4} ${cy - 4}`} to={`-10 ${cx - 4} ${cy - 4}`} dur="3s" repeatCount="indefinite" values="0;-5;0" />
          </line>
          {/* Building blocks */}
          {[0, 1, 2].map((i) => (
            <rect
              key={`block-${i}`}
              x={cx + 10 + i * 5}
              y={cy + 2 - i * 4}
              width="4"
              height="4"
              rx="0.5"
              fill={theme.colors[i]}
              fillOpacity="0.2"
              stroke={theme.accent}
              strokeWidth="0.15"
            >
              <animate attributeName="fill-opacity" values="0.1;0.3;0.1" dur={`${3 + i}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
            </rect>
          ))}
        </g>
      );

    default:
      return null;
  }
}
