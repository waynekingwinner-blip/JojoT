/* ============================================================
   figures.tsx — athletic figure silhouettes for the mood tiles.

   The grey gradients read as "images that failed to load" to the
   first real tester (King, on TestFlight). These keep the strict
   monochrome system — the figures are single-tone strokes over the
   same gradient tiles, so the pixel-level mono check still passes —
   but now the tiles unmistakably show strong bodies in motion.

   Style: bold round-cap strokes, Keith Haring energy. Athletic and
   confident, deliberately not explicit — the app is rated 9+ and a
   racier direction would drag the rating and review with it.
   ============================================================ */

/** Each pose is drawn in a 100×140 box: head (circle) + stroked limbs. */
export type Pose = { d: string; head: [number, number] }

export const POSES: Pose[] = [
  // 1 — sprinter, full stride
  {
    head: [72, 26],
    d: `M64 40 Q56 52 50 66 M50 66 Q40 74 26 76 M50 66 Q60 78 56 96 Q52 110 38 118
        M50 66 L52 68 M64 40 Q76 46 88 40 M50 66 Q66 88 84 92 Q94 94 96 104`,
  },
  // 2 — victory, arms high in a V
  {
    head: [50, 22],
    d: `M50 36 L50 84 M50 42 Q36 34 26 16 M50 42 Q64 34 74 16
        M50 84 Q40 104 34 124 M50 84 Q60 104 66 124`,
  },
  // 3 — yoga tree pose
  {
    head: [50, 20],
    d: `M50 34 L50 88 M50 46 Q34 52 30 66 M50 46 Q66 52 70 66 M30 66 Q34 76 50 78 M70 66 Q66 76 50 78
        M50 88 L50 126 M50 88 Q64 92 64 104 Q64 112 52 112`,
  },
  // 4 — overhead press, barbell up
  {
    head: [50, 30],
    d: `M22 14 L78 14 M50 44 L50 88 M50 48 Q38 40 30 16 M50 48 Q62 40 70 16
        M50 88 Q40 100 36 124 M50 88 Q60 100 64 124`,
  },
  // 5 — deep squat
  {
    head: [50, 34],
    d: `M50 48 L50 80 M50 54 Q32 58 20 50 M50 54 Q68 58 80 50
        M50 80 Q34 84 30 100 Q28 112 34 122 M50 80 Q66 84 70 100 Q72 112 66 122`,
  },
  // 6 — side stretch, long line
  {
    head: [40, 24],
    d: `M44 38 Q54 60 58 84 M44 38 Q28 46 20 62 M44 38 Q60 30 78 34
        M58 84 Q48 102 40 124 M58 84 Q70 100 80 118`,
  },
]

export function FigureSvg({
  pose,
  ink,
  strokeWidth = 8.5,
}: {
  pose: Pose
  ink: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 100 140"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <circle cx={pose.head[0]} cy={pose.head[1]} r={9} fill={ink} />
      <path
        d={pose.d}
        fill="none"
        stroke={ink}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
