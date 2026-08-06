/* ============================================================
   Profile.tsx — you: stats, subscription, inspiration boards,
   books, settings.
   ============================================================ */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  ChevronRight,
  Eye,
  RefreshCw,
  Repeat,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { BOARDS, BOOKS } from '../lib/data'
import { getPlan } from '../lib/purchases'
import { MoodTile, Sheet, SoundButton, Tappable, Toast, Toggle } from '../components/ui'
import { isSoundEnabled, setSoundEnabled, playSound } from '../lib/sound'
import { haptic } from '../lib/haptics'

export default function Profile() {
  const {
    state,
    challenge,
    currentDay,
    leaveChallenge,
    resetAll,
    cancelSubscription,
    setReminders,
    setShare,
  } = useApp()

  const [soundOn, setSoundOn] = useState(isSoundEnabled())
  const [board, setBoard] = useState(BOARDS[0].id)
  const [confirm, setConfirm] = useState<null | 'cancel' | 'reset' | 'switch'>(null)
  const [toast, setToast] = useState<string | null>(null)

  const say = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2200)
  }

  const totalDone = Object.values(state.logs).reduce((a, d) => a + d.done.length, 0)
  const pct = challenge ? Math.round((currentDay / challenge.days) * 100) : 0
  const plan = state.entitlement ? getPlan(state.entitlement.planId) : null
  const activeBoard = BOARDS.find((b) => b.id === board)!

  return (
    <div className="screen">
      <Toast message={toast} />
      <div className="scroll">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', paddingTop: 12, marginBottom: 22 }}
        >
          <div className="ring" style={{ width: 92, height: 92, margin: '0 auto 12px' }}>
            <div
              className="avatar"
              style={{ width: '100%', height: '100%', background: 'var(--ink)', fontSize: 34 }}
            >
              {state.name ? state.name[0].toUpperCase() : '·'}
            </div>
          </div>
          <h1 className="display" style={{ fontSize: 28 }}>{state.name || 'You'}</h1>
          <div className="faint" style={{ fontSize: 13.5, marginTop: 4 }}>
            {challenge ? `${challenge.short} · Day ${currentDay}` : 'No challenge yet'}
          </div>
        </motion.div>

        {/* stats */}
        <div className="row gap-2">
          {[
            { v: `${currentDay}`, l: 'day' },
            { v: `${totalDone}`, l: 'tasks done' },
            { v: `${pct}%`, l: 'complete' },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card flat"
              style={{ flex: 1, padding: '16px 6px', textAlign: 'center', borderRadius: 'var(--r)' }}
            >
              <div className="display" style={{ fontSize: 26, fontWeight: 700 }}>{s.v}</div>
              <div className="faint" style={{ fontSize: 11, marginTop: 2 }}>{s.l}</div>
            </motion.div>
          ))}
        </div>

        {/* subscription */}
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: '26px 2px 10px' }}>Subscription</h2>
        <div className="card" style={{ padding: 16 }}>
          {plan && state.entitlement ? (
            <>
              <div className="row between">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15.5 }}>JojoT Premium · {plan.title}</div>
                  <div className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>
                    {plan.price} — renews {state.entitlement.renewsISO}
                  </div>
                </div>
                <span className="pill ink" style={{ fontSize: 11, padding: '5px 11px' }}>Active</span>
              </div>
              <div className="divider" style={{ margin: '14px 0' }} />
              <button
                className="link-btn"
                onClick={() => {
                  playSound('tap')
                  setConfirm('cancel')
                }}
              >
                Cancel subscription
              </button>
            </>
          ) : (
            <div className="row between">
              <div>
                <div style={{ fontWeight: 600, fontSize: 15.5 }}>No active subscription</div>
                <div className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>
                  JojoT needs Premium to run
                </div>
              </div>
            </div>
          )}
        </div>

        {/* inspiration boards */}
        <div className="row between" style={{ margin: '26px 2px 10px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>Inspiration</h2>
          <div className="row gap-2">
            {BOARDS.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  playSound('tap')
                  setBoard(b.id)
                }}
                className="pill line"
                style={{
                  fontSize: 11.5,
                  padding: '5px 11px',
                  background: board === b.id ? 'var(--ink)' : 'transparent',
                  color: board === b.id ? '#fff' : 'var(--ink-soft)',
                  borderColor: board === b.id ? 'var(--ink)' : 'var(--line)',
                }}
              >
                {b.title}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {activeBoard.tones.map((t, i) => (
            <motion.div
              key={`${activeBoard.id}-${i}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{ aspectRatio: '0.85', borderRadius: 10, overflow: 'hidden' }}
            >
              <MoodTile tone={t} seed={i + 2} radius={10} />
            </motion.div>
          ))}
        </div>

        {/* books */}
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: '26px 2px 10px' }}>Reading list</h2>
        <div className="card" style={{ padding: '4px 16px' }}>
          {BOOKS.map((b, i) => (
            <Tappable
              key={b.title}
              sound="tap"
              onClick={() => say(`${b.title} added to your list`)}
              className="row between"
              style={{
                padding: '13px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 14.5 }}>{b.title}</div>
                <div className="faint" style={{ fontSize: 12.5 }}>{b.author}</div>
              </div>
              <ChevronRight size={18} className="faint" />
            </Tappable>
          ))}
        </div>

        {/* settings */}
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: '26px 2px 10px' }}>Settings</h2>
        <div className="card" style={{ padding: '4px 16px' }}>
          <SettingRow
            icon={soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            title="Button sounds"
            sub="Satisfying taps & pops"
            first
            control={
              <Toggle
                on={soundOn}
                onChange={(v) => {
                  setSoundEnabled(v)
                  setSoundOn(v)
                }}
              />
            }
          />
          <SettingRow
            icon={<Bell size={18} />}
            title="Reminders"
            sub="Gentle nudges, never naggy"
            control={<Toggle on={state.remindersOn} onChange={setReminders} />}
          />
          <SettingRow
            icon={<Eye size={18} />}
            title="Share my list"
            sub="Friends can see your to-do live"
            control={<Toggle on={state.shareWithFriends} onChange={setShare} />}
          />
        </div>

        {/* actions */}
        <div className="stack" style={{ marginTop: 18, paddingBottom: 8 }}>
          <SoundButton
            className="ghost block"
            sound="tap"
            onClick={() => setConfirm('switch')}
          >
            <Repeat size={17} /> Switch challenge
          </SoundButton>
          <SoundButton
            className="ghost block"
            sound="whoosh"
            haptics="medium"
            onClick={() => setConfirm('reset')}
            style={{ color: 'var(--ink-soft)' }}
          >
            <RefreshCw size={17} /> Reset everything
          </SoundButton>
        </div>

        <p className="faint" style={{ textAlign: 'center', fontSize: 11.5, marginTop: 16 }}>
          JojoT · 75 day challenge with friends
        </p>
      </div>

      {/* confirm sheets */}
      <Sheet open={confirm != null} onClose={() => setConfirm(null)}>
        <h3 className="display" style={{ fontSize: 24, textAlign: 'center' }}>
          {confirm === 'cancel'
            ? 'Cancel subscription?'
            : confirm === 'switch'
              ? 'Switch challenge?'
              : 'Reset everything?'}
        </h3>
        <p className="muted" style={{ fontSize: 13.5, textAlign: 'center', margin: '10px 0 20px', lineHeight: 1.45 }}>
          {confirm === 'cancel'
            ? 'You will lose access to JojoT and land back on the subscribe screen.'
            : confirm === 'switch'
              ? 'Your current challenge and its daily logs will be cleared so you can start fresh.'
              : 'This wipes your name, challenge, logs and subscription from this device.'}
        </p>
        <div className="stack" style={{ paddingBottom: 8 }}>
          <SoundButton
            className="block"
            sound="click"
            haptics="medium"
            onClick={() => {
              if (confirm === 'cancel') cancelSubscription()
              else if (confirm === 'switch') leaveChallenge()
              else resetAll()
              setConfirm(null)
            }}
          >
            {confirm === 'cancel' ? 'Cancel subscription' : confirm === 'switch' ? 'Switch' : 'Reset'}
          </SoundButton>
          <SoundButton className="ghost block" sound="tap" onClick={() => setConfirm(null)}>
            Keep as is
          </SoundButton>
        </div>
      </Sheet>
    </div>
  )
}

function SettingRow({
  icon,
  title,
  sub,
  control,
  first,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  control: React.ReactNode
  first?: boolean
}) {
  return (
    <div
      className="row between"
      style={{ padding: '13px 0', borderTop: first ? 'none' : '1px solid var(--line-soft)' }}
    >
      <div className="row gap-3">
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--paper)',
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14.5 }}>{title}</div>
          <div className="faint" style={{ fontSize: 12 }}>{sub}</div>
        </div>
      </div>
      {control}
    </div>
  )
}
