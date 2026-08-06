/* ============================================================
   ChallengeDetail.tsx — the rules of a challenge, then join.
   Numbered sticky-note list, "+N joined" pill, mood board.
   ============================================================ */

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../lib/store'
import { NOTE_COLORS } from '../lib/data'
import { SoundButton, IconButton, MoodStrip, CheckCircle } from '../components/ui'

export default function ChallengeDetail({
  challengeId,
  onBack,
}: {
  challengeId: string
  onBack: () => void
}) {
  const { allChallenges, startChallenge } = useApp()
  const c = allChallenges.find((x) => x.id === challengeId)
  if (!c) return null

  return (
    <div className="screen">
      <div style={{ padding: '4px 16px 0', height: 46 }}>
        <IconButton className="plain" ariaLabel="Back" onClick={onBack}>
          <ArrowLeft size={20} />
        </IconButton>
      </div>

      <div className="scroll no-tab" style={{ paddingTop: 0 }}>
        <h1 className="display" style={{ fontSize: 34, textAlign: 'center', marginTop: 4 }}>
          {c.name}
        </h1>

        <div className="row center" style={{ margin: '14px 0 -14px', position: 'relative', zIndex: 2 }}>
          <motion.span
            className="pill"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            +{c.joined.toLocaleString()} joined
          </motion.span>
        </div>

        <div style={{ marginTop: 22 }}>
          <MoodStrip tones={c.tones} />
        </div>

        {/* rules card */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{ marginTop: 18, padding: '8px 18px 14px' }}
        >
          {c.tasks.map((t, i) => (
            <div
              key={t.id}
              className="row gap-3"
              style={{
                padding: '14px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
                alignItems: 'center',
              }}
            >
              <span className="note" style={{ background: NOTE_COLORS[i % NOTE_COLORS.length] }}>
                {i + 1}
              </span>
              <span style={{ flex: 1, fontSize: 15, lineHeight: 1.35, fontWeight: 500 }}>{t.text}</span>
              <CheckCircle on={false} />
            </div>
          ))}
        </motion.div>

        <p className="faint" style={{ textAlign: 'center', fontSize: 12.5, marginTop: 16, lineHeight: 1.5 }}>
          {c.days} days · {c.tasks.length} daily tasks
          <br />
          You can edit this list any time after you join.
        </p>

        <div style={{ marginTop: 20, paddingBottom: 10 }}>
          <SoundButton
            className="block xl"
            sound="success"
            haptics="success"
            onClick={() => startChallenge(c.id)}
          >
            Start {c.name}
          </SoundButton>
        </div>
      </div>
    </div>
  )
}
