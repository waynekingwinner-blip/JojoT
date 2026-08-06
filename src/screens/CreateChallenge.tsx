/* ============================================================
   CreateChallenge.tsx — build a challenge from scratch:
   name it, set its length, write your own daily list.
   ============================================================ */

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { useApp } from '../lib/store'
import { NOTE_COLORS } from '../lib/data'
import { SoundButton, IconButton } from '../components/ui'
import { playSound } from '../lib/sound'
import { haptic } from '../lib/haptics'

const LENGTHS = [21, 30, 60, 75, 100]

const SUGGESTIONS = [
  'Drink 3 L of water',
  'Walk 10,000 steps',
  'Read 10 pages',
  '45 minute workout',
  'Take a progress picture',
  'No sugar',
  'In bed by 10pm',
]

export default function CreateChallenge({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: (id: string) => void
}) {
  const { createChallenge } = useApp()
  const [name, setName] = useState('')
  const [days, setDays] = useState(75)
  const [tasks, setTasks] = useState<string[]>([])
  const [draft, setDraft] = useState('')

  const addTask = (text: string) => {
    const t = text.trim()
    if (!t || tasks.includes(t)) return
    playSound('pop')
    void haptic('light')
    setTasks((v) => [...v, t])
    setDraft('')
  }

  const canCreate = name.trim().length > 0 && tasks.length > 0

  return (
    <div className="screen">
      <div className="row between" style={{ padding: '4px 16px 0', height: 46 }}>
        <IconButton className="plain" ariaLabel="Back" onClick={onCancel}>
          <ArrowLeft size={20} />
        </IconButton>
      </div>

      <div className="scroll no-tab" style={{ paddingTop: 0 }}>
        <h1 className="display" style={{ fontSize: 34, textAlign: 'center', marginTop: 4 }}>
          Create your
          <br />
          <em>own challenge</em>
        </h1>

        {/* name */}
        <label className="eyebrow" style={{ display: 'block', margin: '26px 0 8px' }}>
          Name it
        </label>
        <input
          className="field"
          placeholder="e.g. 60 Day Reset"
          value={name}
          maxLength={30}
          onChange={(e) => setName(e.target.value)}
        />

        {/* length */}
        <label className="eyebrow" style={{ display: 'block', margin: '22px 0 8px' }}>
          How many days?
        </label>
        <div className="row gap-2 wrap">
          {LENGTHS.map((d) => {
            const on = days === d
            return (
              <motion.button
                key={d}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  playSound('tap')
                  void haptic('light')
                  setDays(d)
                }}
                className="pill"
                style={{
                  background: on ? 'var(--ink)' : '#fff',
                  color: on ? '#fff' : 'var(--ink)',
                  boxShadow: on ? 'none' : 'var(--shadow-sm)',
                  fontWeight: 600,
                }}
              >
                {d}
              </motion.button>
            )
          })}
        </div>

        {/* tasks */}
        <label className="eyebrow" style={{ display: 'block', margin: '24px 0 8px' }}>
          Your daily list
        </label>

        <div className="row gap-2">
          <input
            className="field"
            placeholder="Add a daily task"
            value={draft}
            maxLength={70}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTask(draft)
            }}
            style={{ flex: 1 }}
          />
          <IconButton ariaLabel="Add task" sound="pop" onClick={() => addTask(draft)}>
            <Plus size={20} />
          </IconButton>
        </div>

        {tasks.length === 0 && (
          <div className="row gap-2 wrap" style={{ marginTop: 12 }}>
            {SUGGESTIONS.map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.94 }}
                onClick={() => addTask(s)}
                className="pill line"
                style={{ fontSize: 12.5 }}
              >
                + {s}
              </motion.button>
            ))}
          </div>
        )}

        <div className="card" style={{ marginTop: 14, padding: tasks.length ? '6px 16px 10px' : 0 }}>
          <AnimatePresence initial={false}>
            {tasks.map((t, i) => (
              <motion.div
                key={t}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="row gap-3"
                style={{
                  padding: '12px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
                  overflow: 'hidden',
                }}
              >
                <span className="note" style={{ background: NOTE_COLORS[i % NOTE_COLORS.length] }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>{t}</span>
                <IconButton
                  className="plain"
                  ariaLabel={`Remove ${t}`}
                  sound="whoosh"
                  onClick={() => setTasks((v) => v.filter((x) => x !== t))}
                >
                  <X size={17} className="faint" />
                </IconButton>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div style={{ marginTop: 22, paddingBottom: 10 }}>
          <SoundButton
            className="block xl"
            sound="success"
            haptics="success"
            disabled={!canCreate}
            onClick={() => onCreated(createChallenge({ name: name.trim(), days, tasks }))}
          >
            Create challenge
          </SoundButton>
        </div>
      </div>
    </div>
  )
}
