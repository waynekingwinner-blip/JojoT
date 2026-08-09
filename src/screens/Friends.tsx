/* ============================================================
   Friends.tsx — everyone's to-do list, side by side with yours.
   ============================================================ */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FRIENDS } from '../lib/data'
import { CheckCircle, Toast } from '../components/ui'
import { playSound } from '../lib/sound'
import { haptic } from '../lib/haptics'

export default function Friends() {
  const [toast, setToast] = useState<string | null>(null)

  const say = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <div className="screen">
      <Toast message={toast} />
      <div className="scroll">
        <div className="row between" style={{ paddingTop: 6, marginBottom: 18 }}>
          <h1 className="display" style={{ fontSize: 32, fontWeight: 700 }}>
            Friends
          </h1>
          <button
            className="link-btn"
            onClick={() => {
              playSound('pop')
              void haptic('light')
              say('Invite link copied')
            }}
          >
            + Add Friends
          </button>
        </div>

        <div className="stack-lg">
          {FRIENDS.map((f, i) => (
            <motion.div
              key={f.id}
              className="card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ padding: '18px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}
            >
              {/* avatar column */}
              <div style={{ textAlign: 'center', width: 84, flexShrink: 0 }}>
                <div className="ring" style={{ width: 74, height: 74, margin: '0 auto' }}>
                  <div
                    className="avatar"
                    style={{ width: '100%', height: '100%', background: f.tone, fontSize: 26 }}
                  >
                    {f.initial}
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, marginTop: 8 }}>{f.name}</div>
                <div className="faint" style={{ fontSize: 13.5 }}>Day {f.day}</div>
              </div>

              {/* their list */}
              <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                {f.tasks.map((t, k) => (
                  <div
                    key={k}
                    className="row gap-3"
                    style={{ padding: '6px 0', alignItems: 'flex-start' }}
                  >
                    <CheckCircle on={t.done} ink size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: t.done ? 600 : 400,
                          lineHeight: 1.3,
                          color: t.done ? 'var(--ink)' : 'var(--ink-soft)',
                        }}
                      >
                        {t.text}
                      </div>
                      {t.at && (
                        <div className="faint" style={{ fontSize: 12 }}>
                          {t.at}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <p className="faint" style={{ textAlign: 'center', fontSize: 12.5, paddingBottom: 6 }}>
            Their lists update the moment they tick something off.
          </p>
        </div>
      </div>
    </div>
  )
}
