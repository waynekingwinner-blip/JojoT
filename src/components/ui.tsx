/* ============================================================
   ui.tsx — reusable building blocks with built-in sound + haptics.
   ============================================================ */

import { AnimatePresence, motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'
import { Check } from 'lucide-react'
import { playSound, primeAudio } from '../lib/sound'
import { haptic } from '../lib/haptics'

type SoundName = Parameters<typeof playSound>[0]
type Haptics = 'light' | 'medium' | 'heavy' | 'success' | false

/* ---- SoundButton: every button click plays a sound + haptic ---- */
export function SoundButton({
  children,
  onClick,
  className = '',
  sound = 'click',
  haptics = 'light',
  style,
  disabled,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  sound?: SoundName
  haptics?: Haptics
  style?: CSSProperties
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={`btn ${className}`}
      style={style}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={() => {
        if (disabled) return
        primeAudio()
        playSound(sound)
        if (haptics) void haptic(haptics)
        onClick?.()
      }}
    >
      {children}
    </motion.button>
  )
}

/* ---- Tappable: any element that should click with sound ---- */
export function Tappable({
  children,
  onClick,
  className = '',
  sound = 'tap',
  haptics = 'light',
  style,
  as = 'div',
  ariaLabel,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  sound?: SoundName
  haptics?: Haptics
  style?: CSSProperties
  as?: 'div' | 'button'
  ariaLabel?: string
}) {
  const Comp: any = as === 'button' ? motion.button : motion.div
  return (
    <Comp
      aria-label={ariaLabel}
      className={className}
      style={style}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        primeAudio()
        playSound(sound)
        if (haptics) void haptic(haptics)
        onClick?.()
      }}
    >
      {children}
    </Comp>
  )
}

/* ---- IconButton ---- */
export function IconButton({
  children,
  onClick,
  sound = 'tap',
  className = '',
  ariaLabel,
  style,
}: {
  children: ReactNode
  onClick?: () => void
  sound?: SoundName
  className?: string
  ariaLabel?: string
  style?: CSSProperties
}) {
  return (
    <motion.button
      aria-label={ariaLabel}
      className={`icon-btn ${className}`}
      style={style}
      whileTap={{ scale: 0.88 }}
      onClick={() => {
        primeAudio()
        playSound(sound)
        void haptic('light')
        onClick?.()
      }}
    >
      {children}
    </motion.button>
  )
}

/* ---- CheckCircle: the circular tick used across every list ---- */
export function CheckCircle({
  on,
  ink = false,
  size = 'md',
  onClick,
}: {
  on: boolean
  /** black fill vs. the softer grey fill */
  ink?: boolean
  size?: 'sm' | 'md'
  onClick?: () => void
}) {
  return (
    <motion.button
      aria-label={on ? 'Mark as not done' : 'Mark as done'}
      className={`check ${ink ? 'ink' : ''} ${on ? 'on' : ''} ${size === 'sm' ? 'sm' : ''}`}
      whileTap={onClick ? { scale: 0.85 } : undefined}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <AnimatePresence initial={false}>
        {on && (
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 20 }}
            style={{ display: 'grid', placeItems: 'center', color: ink ? '#fff' : '#fff' }}
          >
            <Check size={size === 'sm' ? 14 : 17} strokeWidth={3.4} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ---- MoodTile: an abstract editorial "photo" tile ----
   The App Store screenshots use licensed lifestyle photography;
   these deterministic gradient tiles stand in for it so the
   layout reads the same without shipping someone else's images. */
export function MoodTile({
  tone,
  seed = 0,
  radius = 0,
  figure,
  style,
}: {
  tone: string
  seed?: number
  radius?: number
  /** silhouette image drawn over the gradient; auto-inverts on dark tones */
  figure?: string
  style?: CSSProperties
}) {
  const angle = 120 + ((seed * 47) % 90)
  const light = mix(tone, '#ffffff', 0.4)
  const dark = mix(tone, '#2a2a2a', 0.22)
  // luminance decides black figure (light tile) vs white figure (dark tile)
  const lum = /^#/.test(tone) ? parseInt(tone.slice(1, 3), 16) : 255
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: radius,
        overflow: 'hidden',
        background: `
          radial-gradient(60% 45% at ${20 + ((seed * 23) % 60)}% ${15 + ((seed * 31) % 50)}%, ${light} 0%, transparent 70%),
          linear-gradient(${angle}deg, ${dark} 0%, ${tone} 48%, ${light} 100%)`,
        ...style,
      }}
    >
      {figure && (
        <img
          src={figure}
          alt=""
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '4%',
            maxHeight: '90%',
            maxWidth: '86%',
            transform: 'translateX(-50%)',
            filter: lum < 140 ? 'invert(1)' : 'none',
            opacity: 0.92,
            objectFit: 'contain',
          }}
        />
      )}
    </div>
  )
}

/** 4-up mood board used on challenge cards. */
export function MoodStrip({
  tones,
  radius = 10,
  figures,
}: {
  tones: string[]
  radius?: number
  figures?: (string | undefined)[]
}) {
  return (
    <div className="strip" style={{ borderRadius: radius }}>
      {tones.slice(0, 4).map((t, i) => (
        <MoodTile key={i} tone={t} seed={i + 1} figure={figures?.[i]} />
      ))}
    </div>
  )
}

function mix(hex: string, to: string, amount: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  try {
    const a = p(hex)
    const b = p(to)
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * amount))
    return `rgb(${c[0]},${c[1]},${c[2]})`
  } catch {
    return hex
  }
}

/* ---- Tumbler: the water cup, fills from the bottom ---- */
export function Tumbler({ fill, size = 240 }: { fill: number; size?: number }) {
  const pct = Math.max(0, Math.min(1, fill))
  const bodyTop = 96
  const bodyBottom = 286
  const fillY = bodyBottom - (bodyBottom - bodyTop) * pct

  return (
    <svg width={size} height={size * 1.28} viewBox="0 0 200 300" fill="none" aria-hidden>
      <defs>
        <clipPath id="cup-body">
          <path d="M62 96 H138 L130 274 A10 10 0 0 1 120 284 H80 A10 10 0 0 1 70 274 Z" />
        </clipPath>
      </defs>

      {/* straw */}
      <rect x="112" y="12" width="9" height="56" rx="4.5" fill="var(--water)" opacity="0.85" />

      {/* handle */}
      <path
        d="M138 128 C170 128 178 148 178 176 C178 206 168 224 140 226"
        stroke="var(--water)"
        strokeWidth="17"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      {/* lid */}
      <rect x="58" y="60" width="84" height="40" rx="11" fill="#f0f0f0" />
      <rect x="58" y="60" width="84" height="40" rx="11" fill="var(--water)" opacity="0.2" />

      {/* body — empty state */}
      <g clipPath="url(#cup-body)">
        <rect x="50" y="90" width="100" height="210" fill="var(--water)" opacity="0.28" />
        {/* the water */}
        <motion.rect
          x="50"
          width="100"
          initial={false}
          animate={{ y: fillY, height: bodyBottom - fillY + 4 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          fill="var(--water)"
        />
      </g>
    </svg>
  )
}

/* ---- Bottom sheet ---- */
export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playSound('tap')
              onClose()
            }}
          />
          <motion.div
            className="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <div className="sheet-grip" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ---- Toast ---- */
export function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---- Faux iOS status bar for the phone frame ---- */
export function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <div className="dots">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  )
}

function SignalIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5" width="3" height="7" rx="1" />
      <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  )
}
function WifiIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
      <path d="M8.5 11.5l2.2-2.7a3.4 3.4 0 00-4.4 0l2.2 2.7zM8.5 5.2c1.8 0 3.5.66 4.8 1.85l1.6-1.95A9.6 9.6 0 008.5 2.4 9.6 9.6 0 002.1 5.1l1.6 1.95A7.2 7.2 0 018.5 5.2z" />
    </svg>
  )
}
function BatteryIcon() {
  return (
    <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
      <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" opacity="0.4" />
      <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
      <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

/* ---- Toggle switch ---- */
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      role="switch"
      aria-checked={on}
      onClick={() => {
        primeAudio()
        playSound('toggle')
        void haptic('light')
        onChange(!on)
      }}
      whileTap={{ scale: 0.92 }}
      style={{
        width: 50,
        height: 30,
        borderRadius: 999,
        padding: 3,
        display: 'flex',
        justifyContent: on ? 'flex-end' : 'flex-start',
        background: on ? 'var(--ink)' : '#e2e2e2',
        transition: 'background 0.25s',
        flexShrink: 0,
      }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff' }}
      />
    </motion.button>
  )
}
