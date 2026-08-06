/* ============================================================
   Friends.tsx — everyone's to-do list in real time, plus the
   community chat groups.
   ============================================================ */

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Send, Users } from 'lucide-react'
import { FRIENDS, CHAT_GROUPS, CHAT_THREAD, type ChatMessage } from '../lib/data'
import { CheckCircle, IconButton, SoundButton, Tappable, Toast } from '../components/ui'
import { playSound } from '../lib/sound'
import { haptic } from '../lib/haptics'

export default function Friends() {
  const [tab, setTab] = useState<'friends' | 'chat'>('friends')
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const say = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2000)
  }

  if (openGroup) {
    const group = CHAT_GROUPS.find((g) => g.id === openGroup)!
    return <ChatRoom name={group.name} members={group.members} onBack={() => setOpenGroup(null)} />
  }

  return (
    <div className="screen">
      <Toast message={toast} />
      <div className="scroll">
        <div className="row between" style={{ paddingTop: 6, marginBottom: 16 }}>
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

        <div className="seg" style={{ marginBottom: 18 }}>
          {(['friends', 'chat'] as const).map((t) => {
            const on = tab === t
            return (
              <button
                key={t}
                className={on ? 'active' : ''}
                onClick={() => {
                  playSound('tap')
                  void haptic('light')
                  setTab(t)
                }}
              >
                {on && (
                  <motion.span
                    layoutId="friends-seg"
                    className="seg-ind"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {t === 'friends' ? 'Live to-do' : 'Chat groups'}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'friends' ? (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="stack-lg"
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="stack"
            >
              {CHAT_GROUPS.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Tappable
                    sound="tap"
                    onClick={() => setOpenGroup(g.id)}
                    className="card flat"
                    style={{ padding: 14, display: 'flex', gap: 13, alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        background: 'var(--paper)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Users size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row between" style={{ gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {g.name}
                        </span>
                        <span className="faint" style={{ fontSize: 11.5, flexShrink: 0 }}>{g.when}</span>
                      </div>
                      <div
                        className="faint"
                        style={{ fontSize: 12.5, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {g.last}
                      </div>
                      <div className="faint" style={{ fontSize: 11, marginTop: 3 }}>
                        {g.members.toLocaleString()} members
                      </div>
                    </div>
                  </Tappable>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function ChatRoom({ name, members, onBack }: { name: string; members: number; onBack: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_THREAD)
  const [draft, setDraft] = useState('')

  const send = () => {
    const text = draft.trim()
    if (!text) return
    playSound('pop')
    void haptic('light')
    const now = new Date()
    setMessages((m) => [
      ...m,
      {
        id: `m${m.length + 1}`,
        who: 'you',
        text,
        when: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        me: true,
      },
    ])
    setDraft('')
  }

  return (
    <div className="screen">
      <div className="row gap-2" style={{ padding: '6px 14px 10px', borderBottom: '1px solid var(--line-soft)' }}>
        <IconButton className="plain" ariaLabel="Back" onClick={onBack}>
          <ArrowLeft size={20} />
        </IconButton>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </div>
          <div className="faint" style={{ fontSize: 11.5 }}>{members.toLocaleString()} members</div>
        </div>
      </div>

      <div className="scroll" style={{ paddingTop: 14 }}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              justifyContent: m.me ? 'flex-end' : 'flex-start',
              marginBottom: 10,
            }}
          >
            <div style={{ maxWidth: '76%' }}>
              {!m.me && (
                <div className="faint" style={{ fontSize: 11.5, marginBottom: 3, marginLeft: 12 }}>
                  {m.who}
                </div>
              )}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 18,
                  background: m.me ? 'var(--ink)' : 'var(--paper)',
                  color: m.me ? '#fff' : 'var(--ink)',
                  fontSize: 14.5,
                  lineHeight: 1.35,
                }}
              >
                {m.text}
              </div>
              <div
                className="faint"
                style={{ fontSize: 10.5, marginTop: 3, textAlign: m.me ? 'right' : 'left', padding: '0 10px' }}
              >
                {m.when}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div
        className="row gap-2"
        style={{
          padding: '10px 16px calc(14px + var(--safe-bottom))',
          borderTop: '1px solid var(--line-soft)',
          background: '#fff',
        }}
      >
        <input
          className="field"
          placeholder="Message"
          value={draft}
          maxLength={200}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          style={{ flex: 1, borderRadius: 999, padding: '12px 16px' }}
        />
        <SoundButton
          sound="pop"
          onClick={send}
          disabled={!draft.trim()}
          style={{ width: 46, height: 46, padding: 0, borderRadius: '50%' }}
        >
          <Send size={17} />
        </SoundButton>
      </div>
    </div>
  )
}
