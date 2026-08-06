/* ============================================================
   Confetti.tsx — a little celebration burst.
   ============================================================ */

import { motion } from 'framer-motion'

const COLORS = ['#0a0a0a', '#4a4a4a', '#8a8a8a', '#b8b8b8', '#d8d8d8', '#2e2e2e']

export default function Confetti({ show }: { show: boolean }) {
  if (!show) return null
  const pieces = Array.from({ length: 26 })
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 40 }}>
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * Math.PI * 2
        const dist = 120 + (i % 5) * 30
        const x = Math.cos(angle) * dist
        const y = Math.sin(angle) * dist - 40
        const color = COLORS[i % COLORS.length]
        return (
          <motion.span
            key={i}
            className="confetti-dot"
            style={{ background: color }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x, y, opacity: 0, rotate: 360 + i * 20, scale: 0.6 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}
