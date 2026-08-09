/* ============================================================
   Onboarding.tsx — editorial intro slides, then your name.
   ============================================================ */

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { SoundButton, MoodTile, IconButton } from '../components/ui'
import { useApp } from '../lib/store'
import { playSound } from '../lib/sound'

type Slide = { title: string; em: string; body: string; tones: string[] }

const SLIDES: Slide[] = [
  {
    title: 'Keep the',
    em: 'promise',
    body: '75 days. One list a day. The version of you that you keep promising yourself.',
    tones: ['#2b2b2b', '#6b6b6b', '#4a4a4a', '#8f8f8f'],
  },
  {
    title: 'One list,',
    em: 'every day',
    body: 'Water, steps, workouts, reading, progress pictures — tracked in one place, every day.',
    tones: ['#9a9a9a', '#c4c4c4', '#7e7e7e', '#dcdcdc'],
  },
  {
    title: 'Watch it',
    em: 'add up',
    body: 'Every day you finish fills in. Share the card when a run of them starts to look good.',
    tones: ['#d4d4d4', '#b0b0b0', '#e6e6e6', '#c2c2c2'],
  },
]

export default function Onboarding() {
  const { finishOnboarding } = useApp()
  const [i, setI] = useState(0)
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')

  const slide = SLIDES[i]
  const last = i === SLIDES.length - 1

  const back = () => {
    if (naming) return setNaming(false)
    if (i > 0) setI((v) => v - 1)
  }

  return (
    <div className="screen">
      {/* back */}
      <div style={{ padding: '4px 16px 0', height: 46 }}>
        {(i > 0 || naming) && (
          <IconButton className="plain" ariaLabel="Back" onClick={back}>
            <ArrowLeft size={20} />
          </IconButton>
        )}
      </div>

      <div className="scroll no-tab" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          {!naming ? (
            <motion.div
              key={`slide-${i}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <h1 className="display" style={{ fontSize: 46, textAlign: 'center', marginTop: 12 }}>
                {slide.title}
                <br />
                <em>{slide.em}</em>
              </h1>

              <div className="strip" style={{ margin: '30px 0', borderRadius: 16 }}>
                {slide.tones.map((t, k) => (
                  <motion.div
                    key={`${i}-${k}`}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: k * 0.06 }}
                  >
                    <MoodTile tone={t} seed={i * 4 + k} />
                  </motion.div>
                ))}
              </div>

              <p
                className="muted"
                style={{ fontSize: 15.5, lineHeight: 1.5, textAlign: 'center', padding: '0 12px' }}
              >
                {slide.body}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <h1 className="display" style={{ fontSize: 40, textAlign: 'center' }}>
                What should we
                <br />
                <em>call you?</em>
              </h1>
              <p className="muted" style={{ fontSize: 14.5, textAlign: 'center', margin: '12px 0 26px' }}>
                This is the name on your progress cards.
              </p>
              <input
                className="field"
                placeholder="Your name"
                value={name}
                maxLength={24}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) finishOnboarding(name)
                }}
                style={{ textAlign: 'center', fontSize: 17 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* dots */}
        {!naming && (
          <div className="row center gap-2" style={{ margin: '26px 0 18px' }}>
            {SLIDES.map((_, idx) => (
              <motion.span
                key={idx}
                animate={{ width: idx === i ? 22 : 6, opacity: idx === i ? 1 : 0.28 }}
                style={{ height: 6, borderRadius: 999, background: 'var(--ink)', display: 'block' }}
              />
            ))}
          </div>
        )}

        <div className="stack" style={{ marginTop: naming ? 26 : 0, paddingBottom: 8 }}>
          <SoundButton
            className="block xl"
            sound={naming ? 'success' : 'pop'}
            haptics={naming ? 'success' : 'light'}
            disabled={naming && !name.trim()}
            onClick={() => {
              if (naming) finishOnboarding(name)
              else if (last) setNaming(true)
              else setI((v) => v + 1)
            }}
          >
            {naming ? 'Continue' : last ? 'Get started' : 'Next'}
          </SoundButton>

          {!naming && !last && (
            <button
              className="link-btn"
              style={{ display: 'block', margin: '0 auto', padding: 6 }}
              onClick={() => {
                playSound('tap')
                setI(SLIDES.length - 1)
              }}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
