/* ============================================================
   Hydrate.tsx — the water tracker. Big tumbler that fills,
   quick-add amounts, goal taken from the active challenge.
   ============================================================ */

import { motion } from 'framer-motion'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useApp } from '../lib/store'
import { SoundButton, Tappable, Tumbler } from '../components/ui'
import { playSound } from '../lib/sound'
import { haptic } from '../lib/haptics'

const QUICK = [
  { ml: 250, label: 'glass' },
  { ml: 500, label: 'bottle' },
  { ml: 750, label: 'flask' },
]

export default function Hydrate() {
  const { log, waterGoalMl, addWater, setWater, challenge, viewDay } = useApp()

  const pct = Math.max(0, Math.min(1, log.water / waterGoalMl))
  const left = Math.max(0, waterGoalMl - log.water)

  const drink = (ml: number) => {
    playSound(ml > 0 ? 'water' : 'tap')
    void haptic('medium')
    addWater(ml)
  }

  return (
    <div className="screen">
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', paddingTop: 6 }}>
          <div className="eyebrow">Day {viewDay}</div>
          <h1 className="display" style={{ fontSize: 30, marginTop: 4 }}>
            Water
          </h1>
        </div>

        {/* tumbler */}
        <div style={{ display: 'grid', placeItems: 'center', marginTop: 6 }}>
          <Tumbler fill={pct} size={210} />
        </div>

        {/* readout */}
        <div style={{ textAlign: 'center', marginTop: -6 }}>
          <motion.div
            key={log.water}
            initial={{ scale: 0.94, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            style={{ fontSize: 30, fontWeight: 600, color: 'var(--water-deep)', letterSpacing: '-0.02em' }}
          >
            {log.water}ml
          </motion.div>
          <div className="faint" style={{ fontSize: 13, marginTop: 4 }}>
            {left > 0 ? `${left}ml to go · goal ${waterGoalMl}ml` : `Goal smashed — ${waterGoalMl}ml`}
          </div>
          {challenge && (
            <div className="bar" style={{ margin: '14px auto 0', maxWidth: 240 }}>
              <motion.i
                initial={false}
                animate={{ width: `${pct * 100}%` }}
                transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                style={{ background: 'var(--water-deep)' }}
              />
            </div>
          )}
        </div>

        {/* primary add */}
        <div className="row center gap-3" style={{ marginTop: 22 }}>
          <SoundButton
            className="ghost"
            sound="tap"
            onClick={() => drink(-250)}
            style={{ width: 52, height: 52, padding: 0, borderRadius: '50%' }}
          >
            <Minus size={20} />
          </SoundButton>
          <SoundButton className="water" sound="water" haptics="medium" onClick={() => drink(250)} style={{ minWidth: 168 }}>
            <Plus size={19} /> Water
          </SoundButton>
          <SoundButton
            className="ghost"
            sound="whoosh"
            onClick={() => {
              playSound('whoosh')
              setWater(0)
            }}
            style={{ width: 52, height: 52, padding: 0, borderRadius: '50%' }}
          >
            <RotateCcw size={18} />
          </SoundButton>
        </div>

        {/* quick add */}
        <div className="row gap-2" style={{ marginTop: 20 }}>
          {QUICK.map((q) => (
            <Tappable
              key={q.ml}
              sound="water"
              haptics="medium"
              onClick={() => drink(q.ml)}
              className="card flat"
              style={{
                flex: 1,
                padding: '14px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: 'var(--r)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--water-deep)' }}>+{q.ml}</div>
              <div className="faint" style={{ fontSize: 11.5, marginTop: 1 }}>{q.label}</div>
            </Tappable>
          ))}
        </div>

        <p className="faint" style={{ textAlign: 'center', fontSize: 12.5, marginTop: 22, lineHeight: 1.5 }}>
          Your goal comes from {challenge?.name ?? 'your challenge'}.
          <br />
          Ticking the water task on Today happens automatically at 100%.
        </p>
      </div>
    </div>
  )
}
