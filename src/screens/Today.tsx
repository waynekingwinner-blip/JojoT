/* ============================================================
   Today.tsx — the daily home: day counter, friends row, and
   your to-do list for the day (editable, water/steps/photo aware).
   ============================================================ */

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, X, Camera, Check, ChevronRight, Image as ImageIcon, Share2 } from 'lucide-react'
import { useApp } from '../lib/store'
import { shareDay } from '../lib/shareCard'
import { FRIENDS } from '../lib/data'
import { CheckCircle, IconButton, MoodTile, Sheet, SoundButton, Tappable, Toast } from '../components/ui'
import Confetti from '../components/Confetti'
import { playSound } from '../lib/sound'
import { haptic } from '../lib/haptics'
import { capturePhoto, isTone, type PhotoSource } from '../lib/photos'
import { usePhoto } from '../lib/usePhoto'

export default function Today({ goHydrate, goFriends }: { goHydrate: () => void; goFriends: () => void }) {
  const {
    state,
    challenge,
    currentDay,
    viewDay,
    setViewDay,
    log,
    waterGoalMl,
    toggleTask,
    addTask,
    updateTask,
    removeTask,
    savePhoto,
    addSteps,
  } = useApp()

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [photoOpen, setPhotoOpen] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const prevAll = useRef(false)

  const tasks = challenge?.tasks ?? []
  const done = log.done.filter((id) => tasks.some((t) => t.id === id))
  const allDone = tasks.length > 0 && done.length === tasks.length

  useEffect(() => {
    if (allDone && !prevAll.current) {
      setCelebrate(true)
      playSound('success')
      void haptic('success')
      const t = setTimeout(() => setCelebrate(false), 1400)
      prevAll.current = true
      return () => clearTimeout(t)
    }
    if (!allDone) prevAll.current = false
  }, [allDone])

  if (!challenge) return null

  const say = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2000)
  }

  // the 7-day window ending on the day being viewed
  const weekStart = Math.max(1, viewDay - 3)
  const week = Array.from({ length: 7 }, (_, i) => weekStart + i).filter((d) => d <= challenge.days)

  const submitDraft = () => {
    const t = draft.trim()
    if (!t) return
    addTask(t)
    setDraft('')
    playSound('pop')
    void haptic('light')
  }

  const shareToday = async () => {
    setSharing(true)
    try {
      const result = await shareDay({
        day: viewDay,
        totalDays: challenge.days,
        challengeName: challenge.short,
        tasks: tasks.map((t) => ({ text: t.text, done: log.done.includes(t.id) })),
        photoRef: log.photo,
        name: state.name || undefined,
      })
      if (result === 'saved') say('Card saved')
    } catch {
      say('Could not build your card')
    } finally {
      setSharing(false)
    }
  }

  const takePicture = async (source: PhotoSource) => {
    setCapturing(true)
    try {
      const ref = await capturePhoto(source, viewDay)
      if (!ref) return // cancelled, or permission denied — leave the sheet open
      savePhoto(ref)
      const photoTask = tasks.find((t) => t.kind === 'photo')
      if (photoTask && !log.done.includes(photoTask.id)) toggleTask(photoTask.id)
      playSound('success')
      void haptic('success')
      setPhotoOpen(false)
      say('Progress picture saved')
    } finally {
      setCapturing(false)
    }
  }

  return (
    <div className="screen">
      <Confetti show={celebrate} />
      <Toast message={toast} />

      <div className="scroll">
        {/* ---- day header ---- */}
        <div style={{ textAlign: 'center', paddingTop: 6 }}>
          <h1 className="display" style={{ fontSize: 34, fontWeight: 700 }}>
            Day {viewDay}
          </h1>
          <div className="segments" style={{ marginTop: 12 }}>
            {week.map((d) => (
              <Tappable
                key={d}
                as="button"
                sound="tap"
                haptics={false}
                ariaLabel={`View day ${d}`}
                onClick={() => {
                  if (d > currentDay) return say('That day hasn’t happened yet')
                  setViewDay(d)
                }}
                style={{ padding: '4px 2px' }}
              >
                <i className={d <= currentDay ? 'on' : ''} style={{ opacity: d === viewDay ? 1 : 0.45 }} />
              </Tappable>
            ))}
          </div>
          {viewDay !== currentDay && (
            <button
              className="link-btn"
              style={{ marginTop: 10 }}
              onClick={() => {
                playSound('tap')
                setViewDay(currentDay)
              }}
            >
              Back to today
            </button>
          )}
        </div>

        {/* ---- friends row ---- */}
        <div className="row gap-3" style={{ marginTop: 22, justifyContent: 'center' }}>
          {FRIENDS.slice(0, 3).map((f) => {
            const active = f.tasks.some((t) => t.done)
            return (
              <Tappable
                key={f.id}
                sound="tap"
                onClick={goFriends}
                ariaLabel={`${f.name}, day ${f.day}`}
                className={`ring ${active ? '' : 'off'}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="avatar" style={{ width: 62, height: 62, background: f.tone, fontSize: 22 }}>
                  {f.initial}
                </div>
              </Tappable>
            )
          })}
          <Tappable
            sound="pop"
            onClick={() => say('Invite link copied')}
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              border: '1.5px dashed var(--ink-ghost)',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 10.5, lineHeight: 1.15, color: 'var(--ink-soft)', fontWeight: 500 }}>
              Add
              <br />
              Friends
            </span>
          </Tappable>
        </div>

        {/* ---- list header ---- */}
        <div className="row between" style={{ marginTop: 30, marginBottom: 4 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{challenge.short}</h2>
          <IconButton
            className="plain"
            ariaLabel={editing ? 'Done editing' : 'Edit list'}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? <Check size={19} /> : <Pencil size={17} />}
          </IconButton>
        </div>

        {/* ---- tasks ---- */}
        <div style={{ marginTop: 4 }}>
          <AnimatePresence initial={false}>
            {tasks.map((task) => {
              const isDone = log.done.includes(task.id)

              let sub: string | null = null
              if (task.kind === 'water') {
                sub = `${(log.water / 1000).toFixed(1).replace('.', ',')} / ${(waterGoalMl / 1000)
                  .toFixed(1)
                  .replace('.', ',')} L`
              } else if (task.kind === 'steps') {
                sub = `${log.steps.toLocaleString()} steps today`
              } else if (task.kind === 'photo' && log.photo) {
                sub = 'Picture saved'
              }

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className={`task ${isDone ? 'done' : ''}`}>
                    <CheckCircle
                      on={isDone}
                      onClick={() => {
                        playSound(isDone ? 'tap' : 'pop')
                        void haptic(isDone ? 'light' : 'medium')
                        toggleTask(task.id)
                      }}
                    />

                    {task.kind === 'water' && <MiniTumbler />}

                    <div className="task-body">
                      {editing ? (
                        <input
                          className="field"
                          value={task.text}
                          onChange={(e) => updateTask(task.id, e.target.value)}
                          style={{ padding: '8px 10px', fontSize: 14.5, borderRadius: 10 }}
                        />
                      ) : (
                        <>
                          <div className="task-title">{task.text}</div>
                          {sub && <div className="task-sub">{sub}</div>}
                        </>
                      )}
                    </div>

                    {editing ? (
                      <IconButton
                        className="plain"
                        ariaLabel="Remove task"
                        sound="whoosh"
                        onClick={() => removeTask(task.id)}
                      >
                        <X size={17} className="faint" />
                      </IconButton>
                    ) : task.kind === 'water' ? (
                      <IconButton className="plain" ariaLabel="Open water tracker" onClick={goHydrate}>
                        <ChevronRight size={18} className="faint" />
                      </IconButton>
                    ) : task.kind === 'steps' ? (
                      <IconButton
                        className="plain"
                        ariaLabel="Add 1,000 steps"
                        sound="pop"
                        onClick={() => addSteps(1000)}
                      >
                        <Plus size={17} className="faint" />
                      </IconButton>
                    ) : task.kind === 'photo' ? (
                      <IconButton
                        className="plain"
                        ariaLabel="Take progress picture"
                        onClick={() => setPhotoOpen(true)}
                      >
                        <Camera size={17} className="faint" />
                      </IconButton>
                    ) : null}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* add a task */}
          {editing && (
            <div className="row gap-2" style={{ marginTop: 14 }}>
              <input
                className="field"
                placeholder="Add your own task"
                value={draft}
                maxLength={70}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitDraft()}
                style={{ flex: 1 }}
              />
              <IconButton ariaLabel="Add task" sound="pop" onClick={submitDraft}>
                <Plus size={20} />
              </IconButton>
            </div>
          )}
        </div>

        {/* ---- progress picture ---- */}
        {log.photo && <ProgressPicture photoRef={log.photo} day={viewDay} />}

        <SoundButton
          className="block ghost"
          sound="tap"
          disabled={sharing}
          onClick={() => void shareToday()}
          style={{
            marginTop: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
          }}
        >
          <Share2 size={17} />
          {sharing ? 'Preparing…' : 'Share your day'}
        </SoundButton>

        <p className="faint" style={{ textAlign: 'center', fontSize: 12.5, marginTop: 18, lineHeight: 1.5 }}>
          {done.length} of {tasks.length} done · day {viewDay} of {challenge.days}
          <br />
          {allDone ? 'Everything ticked. Every single one.' : 'Missing one doesn’t reset you. Just come back tomorrow.'}
        </p>
      </div>

      {/* ---- photo sheet ---- */}
      <Sheet open={photoOpen} onClose={() => !capturing && setPhotoOpen(false)}>
        <h3 className="display" style={{ fontSize: 24, textAlign: 'center' }}>
          Progress picture
        </h3>
        <p className="muted" style={{ fontSize: 13.5, textAlign: 'center', margin: '8px 0 18px' }}>
          Day {viewDay} of {challenge.days}. Same spot, same light, every day.
        </p>

        <SoundButton
          className="block"
          sound="pop"
          disabled={capturing}
          onClick={() => void takePicture('camera')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          <Camera size={18} />
          {capturing ? 'Saving…' : 'Take a picture'}
        </SoundButton>

        <SoundButton
          className="block ghost"
          sound="tap"
          disabled={capturing}
          onClick={() => void takePicture('library')}
          style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          <ImageIcon size={18} />
          Choose from library
        </SoundButton>

        <p className="faint" style={{ fontSize: 11.5, textAlign: 'center', margin: '14px 0 10px' }}>
          Your pictures stay on this device. They are never uploaded.
        </p>
        <SoundButton
          className="block ghost"
          sound="tap"
          disabled={capturing}
          onClick={() => setPhotoOpen(false)}
        >
          Cancel
        </SoundButton>
      </Sheet>
    </div>
  )
}

/** The day's picture — a real photo, or the abstract tile for
    mood-tone refs saved before the camera existed. */
function ProgressPicture({ photoRef, day }: { photoRef: string; day: number }) {
  const src = usePhoto(photoRef)

  return (
    <div style={{ marginTop: 24 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Day {day} picture
      </div>
      <div style={{ height: 190, borderRadius: 16, overflow: 'hidden', background: 'var(--paper)' }}>
        {isTone(photoRef) ? (
          <MoodTile tone={photoRef} seed={day} />
        ) : src ? (
          <img
            src={src}
            alt={`Progress picture, day ${day}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : null}
      </div>
    </div>
  )
}

function MiniTumbler() {
  return (
    <svg width="22" height="30" viewBox="0 0 40 56" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <rect x="22" y="0" width="3.4" height="12" rx="1.7" fill="var(--water)" />
      <path
        d="M30 22 C38 22 40 27 40 34 C40 41 37 45 30 46"
        stroke="var(--water)"
        strokeWidth="4.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <rect x="6" y="9" width="24" height="9" rx="3" fill="var(--water)" opacity="0.35" />
      <path d="M7 18 H29 L26.6 52 A3 3 0 0 1 23.6 55 H12.4 A3 3 0 0 1 9.4 52 Z" fill="var(--water)" />
    </svg>
  )
}
