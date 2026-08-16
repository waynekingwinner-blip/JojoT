/* ============================================================
   ChallengeDetail.tsx — the rules of a challenge, then join.
   Numbered sticky-note list, "+N joined" pill, mood board.
   ============================================================ */

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useApp } from '../lib/store'
import { NOTE_COLORS } from '../lib/data'
import { SoundButton, IconButton, MoodStrip, CheckCircle } from '../components/ui'
/* Themed pose layouts — sliced from the bordered sheet King supplied,
   cut along its own grid lines. Every slot is filled: King marked the
   deliberate gaps with red question marks on TestFlight, so no gaps. */
import p06 from '../assets/lib/p06.png' // dumbbells
import p13 from '../assets/lib/p13.png' // sprint
import p07 from '../assets/lib/p07.png' // squat
import p08 from '../assets/lib/p08.png' // plank
import p01 from '../assets/lib/p01.png' // warrior
import p32 from '../assets/lib/p32.png' // high knees
import p11 from '../assets/lib/p11.png' // cycling
import p12 from '../assets/lib/p12.png' // hiking
import p03 from '../assets/lib/p03.png' // side stretch
import p02 from '../assets/lib/p02.png' // striding
import p30 from '../assets/lib/p30.png' // dog walk
import p14 from '../assets/lib/p14.png' // tree pose
import p28 from '../assets/lib/p28.png' // neck stretch
import p24 from '../assets/lib/p24.png' // bath
import p18 from '../assets/lib/p18.png' // avocado
import p23 from '../assets/lib/p23.png' // tea
import p22 from '../assets/lib/p22.png' // reading
import p31 from '../assets/lib/p31.png' // stairs
import p26 from '../assets/lib/p26.png' // journaling
import p34 from '../assets/lib/p34.png' // summit
import p15 from '../assets/lib/p15.png' // fruit bowl
import p17 from '../assets/lib/p17.png' // juice
import p16 from '../assets/lib/p16.png' // salad
import p19 from '../assets/lib/p19.png' // water bottle
import p29 from '../assets/lib/p29.png' // meditation
import p20 from '../assets/lib/p20.png' // child's pose
import p25 from '../assets/lib/p25.png' // window sit
import p27 from '../assets/lib/p27.png' // prayer hands

const CARD_FIGURES: Record<string, (string | undefined)[]> = {
  hard:      [p06, p13, p07, p08],
  medium:    [p01, p32, p11, p12],
  soft:      [p03, p02, p30, p14],
  glow:      [p28, p24, p17, p23],
  better:    [p22, p31, p26, p34],
  sugarfree: [p15, p18, p16, p19],
  mental:    [p29, p20, p25, p27],
}


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
          <MoodStrip tones={c.tones} figures={CARD_FIGURES[c.id]} />
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
