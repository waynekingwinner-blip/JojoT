/* ============================================================
   ChallengeSelect.tsx — browse challenges, open one, or build
   your own. Drives ChallengeDetail / CreateChallenge.
   ============================================================ */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Plus } from 'lucide-react'
import { useApp } from '../lib/store'
import { Tappable, MoodStrip } from '../components/ui'
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

import ChallengeDetail from './ChallengeDetail'
import CreateChallenge from './CreateChallenge'

export default function ChallengeSelect() {
  const { allChallenges } = useApp()
  const [detailId, setDetailId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  if (creating) {
    return (
      <CreateChallenge
        onCancel={() => setCreating(false)}
        onCreated={(id) => {
          setCreating(false)
          setDetailId(id)
        }}
      />
    )
  }

  if (detailId) {
    return <ChallengeDetail challengeId={detailId} onBack={() => setDetailId(null)} />
  }

  return (
    <div className="screen">
      <div className="scroll no-tab">
        <div className="title-block">
          <h1>
            Select
            <br />
            your challenge
          </h1>
          <p>soft, medium, hard, better me…</p>
        </div>

        <div style={{ marginTop: 22 }}>
          {allChallenges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              style={{ marginBottom: 26 }}
            >
              <Tappable sound="tap" onClick={() => setDetailId(c.id)} style={{ cursor: 'pointer' }}>
                <div className="row between" style={{ marginBottom: 10, alignItems: 'flex-end' }}>
                  <div>
                    <div className="eyebrow">
                      {c.custom ? 'Yours' : i === 0 ? 'Most popular' : c.tagline}
                    </div>
                    <div
                      style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 2 }}
                    >
                      {c.name}
                    </div>
                  </div>
                  <ChevronRight size={22} className="faint" style={{ marginBottom: 4 }} />
                </div>
                <MoodStrip tones={c.tones} figures={CARD_FIGURES[c.id]} />
              </Tappable>
            </motion.div>
          ))}

          {/* create your own */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Tappable
              sound="pop"
              onClick={() => setCreating(true)}
              className="card flat"
              style={{
                padding: '22px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  border: '1.5px dashed var(--ink-ghost)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Plus size={20} />
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 16.5, fontWeight: 600 }}>
                  Create your own
                </span>
                <span style={{ display: 'block', fontSize: 13, color: 'var(--ink-faint)', marginTop: 1 }}>
                  Your rules, your length, your list
                </span>
              </span>
            </Tappable>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
