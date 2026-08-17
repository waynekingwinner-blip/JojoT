/* ============================================================
   Friends.tsx — the real one this time.

   1.0 shipped without this tab because the data behind it was
   hardcoded fixtures. Now every row is a real person: fetched
   through RLS (which enforces mutual friendship AND the other
   side's share toggle), and re-fetched the moment a friend's
   day changes via Realtime.

   Signed-out state sells the feature and offers Sign in with
   Apple. Guideline 1.2 affordances (report / remove) live on
   each friend card.
   ============================================================ */

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Flag, UserMinus, UserPlus } from 'lucide-react'
import { useApp } from '../lib/store'
import { CheckCircle, IconButton, Sheet, SoundButton, Toast } from '../components/ui'
import { playSound } from '../lib/sound'
import { haptic } from '../lib/haptics'
import {
  acceptRequest,
  addFriendByCode,
  fetchFriendsToday,
  myInviteCode,
  pendingRequests,
  removeFriend,
  reportFriend,
  subscribeFriendEntries,
  type FriendToday,
  type PendingRequest,
} from '../lib/sync'

const TONES = [
  'linear-gradient(135deg,#8e8e8e,#3f3f3f)',
  'linear-gradient(135deg,#a8a8a8,#585858)',
  'linear-gradient(135deg,#c2c2c2,#767676)',
  'linear-gradient(135deg,#9a9a9a,#4c4c4c)',
]

export default function Friends() {
  const { profileId, socialAvailable, signIn } = useApp()
  const [toast, setToast] = useState<string | null>(null)
  const say = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2200)
  }

  if (!profileId) {
    return <SignedOut available={socialAvailable} signIn={signIn} say={say} toast={toast} />
  }
  return <FriendsList say={say} toast={toast} />
}

/* ------------------------------------------------------------------ */

function SignedOut({
  available,
  signIn,
  say,
  toast,
}: {
  available: boolean
  signIn: () => Promise<'ok' | 'cancelled' | 'failed'>
  say: (m: string) => void
  toast: string | null
}) {
  const [busy, setBusy] = useState(false)

  return (
    <div className="screen">
      <Toast message={toast} />
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 className="display" style={{ fontSize: 34, textAlign: 'center' }}>
          Do it
          <br />
          <em>together</em>
        </h1>
        <p className="muted" style={{ fontSize: 14.5, textAlign: 'center', margin: '14px 18px 26px', lineHeight: 1.5 }}>
          See your friends’ lists next to yours, the moment they tick something off.
          Sign in to connect — your progress pictures always stay on this device.
        </p>
        {available ? (
          <SoundButton
            className="block xl"
            sound="pop"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              const r = await signIn()
              setBusy(false)
              if (r === 'failed') say('Sign in didn’t work. Try again.')
            }}
            style={{ margin: '0 24px' }}
          >
            {busy ? 'Signing in…' : ' Sign in with Apple'}
          </SoundButton>
        ) : (
          <p className="faint" style={{ textAlign: 'center', fontSize: 12.5 }}>
            Friends aren’t available in this build.
          </p>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function FriendsList({ say, toast }: { say: (m: string) => void; toast: string | null }) {
  const [friends, setFriends] = useState<FriendToday[]>([])
  const [pending, setPending] = useState<PendingRequest[]>([])
  const [code, setCode] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [manage, setManage] = useState<FriendToday | null>(null)
  const [draft, setDraft] = useState('')

  const refresh = useCallback(() => {
    void fetchFriendsToday().then(setFriends)
    void pendingRequests().then(setPending)
  }, [])

  useEffect(() => {
    refresh()
    setLoaded(true)
    /* The store hydrates profileId from localStorage synchronously, so
       this screen can mount before the Supabase session finishes its
       async restore — the first fetch then runs unauthenticated, RLS
       returns nothing, and without a retry the code never appears. */
    let cancelled = false
    let attempt = 0
    const tryFetch = () => {
      void myInviteCode().then((c) => {
        if (cancelled) return
        if (c) setCode(c)
        else if (attempt++ < 6) setTimeout(tryFetch, 1500)
      })
    }
    tryFetch()
    /* Coming back from the background: the session may have just been
       refreshed (see backend.ts) — refetch everything this screen shows. */
    const onWake = () => {
      if (document.visibilityState !== 'visible') return
      attempt = 0
      refresh()
      tryFetch()
    }
    document.addEventListener('visibilitychange', onWake)
    const unsub = subscribeFriendEntries(refresh) // 朋友一勾任务,这里就刷新
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onWake)
      unsub()
    }
  }, [refresh])

  const submitCode = async () => {
    const c = draft.trim()
    if (!c) return
    const r = await addFriendByCode(c)
    playSound(r === 'sent' ? 'success' : 'error')
    say(r === 'sent' ? 'Request sent' : r === 'not-found' ? 'No one has that code' : 'Could not send request')
    if (r === 'sent') {
      setDraft('')
      setAddOpen(false)
    }
  }

  return (
    <div className="screen">
      <Toast message={toast} />
      <div className="scroll">
        <div className="row between" style={{ paddingTop: 6, marginBottom: 16 }}>
          <h1 className="display" style={{ fontSize: 32, fontWeight: 700 }}>Friends</h1>
          <button className="link-btn" onClick={() => { playSound('pop'); void haptic('light'); setAddOpen(true) }}>
            <UserPlus size={15} style={{ verticalAlign: -2, marginRight: 4 }} />Add
          </button>
        </div>

        {/* 我的邀请码 — first thing on the screen; a tester hunted for
            it at the bottom of the list and gave up before finding it.
            Never render nothing: a silently missing card is what made
            the invite flow look broken. */}
        {loaded && !code && (
          <div className="card flat" style={{ padding: 16, marginBottom: 14, textAlign: 'center' }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Your invite code</div>
            <p className="faint" style={{ fontSize: 13, margin: '4px 0 8px' }}>
              Couldn’t load your code. Check your connection.
            </p>
            <button
              className="link-btn"
              onClick={() => {
                playSound('pop')
                void myInviteCode().then((c) => c && setCode(c))
              }}
            >
              Retry
            </button>
          </div>
        )}
        {code && (
          <div className="card flat" style={{ padding: 16, marginBottom: 14, textAlign: 'center' }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Your invite code</div>
            <div className="display" style={{ fontSize: 28, letterSpacing: 4 }}>{code}</div>
            <div className="row center gap-3" style={{ marginTop: 8 }}>
              <button
                className="link-btn"
                onClick={() => {
                  // Friends without the app need the pitch and the store
                  // link, not a bare eight-character code.
                  const text = `Join me on JojoT — 75 days, one list a day. Get the app: https://apps.apple.com/app/id6799851593 then add me with code ${code}`
                  playSound('pop')
                  if (navigator.share) void navigator.share({ text }).catch(() => undefined)
                  else { void navigator.clipboard?.writeText(text); say('Invite copied') }
                }}
              >
                <UserPlus size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Invite a friend
              </button>
              <button
                className="link-btn"
                onClick={() => {
                  void navigator.clipboard?.writeText(code)
                  playSound('pop')
                  say('Code copied')
                }}
              >
                <Copy size={13} style={{ verticalAlign: -2, marginRight: 4 }} />Copy code
              </button>
            </div>
          </div>
        )}

        {/* 待接受 */}
        {pending.map((p) => (
          <div key={p.friendship_id} className="card flat row between" style={{ padding: 14, marginBottom: 10 }}>
            <span style={{ fontSize: 14.5 }}>
              <strong>{p.requester_name}</strong> wants to be friends
            </span>
            <SoundButton
              sound="success"
              onClick={async () => {
                if (await acceptRequest(p.friendship_id)) { say('Friend added'); refresh() }
              }}
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              Accept
            </SoundButton>
          </div>
        ))}

        {/* 好友列表 */}
        {friends.map((f, i) => (
          <motion.div
            key={f.profileId}
            className="card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ padding: '18px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}
          >
            <div style={{ textAlign: 'center', width: 84, flexShrink: 0 }}>
              <div className="ring" style={{ width: 74, height: 74, margin: '0 auto' }}>
                <div className="avatar" style={{ width: '100%', height: '100%', background: TONES[i % TONES.length], fontSize: 26 }}>
                  {f.name[0]?.toUpperCase() ?? '·'}
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginTop: 8 }}>{f.name}</div>
              <div className="faint" style={{ fontSize: 13 }}>
                {f.dayNo ? `Day ${f.dayNo}` : f.challengeName}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
              {f.tasks.length === 0 && (
                <p className="faint" style={{ fontSize: 13, paddingTop: 18 }}>Nothing logged yet today.</p>
              )}
              {f.tasks.map((t, k) => (
                <div key={k} className="row gap-3" style={{ padding: '6px 0', alignItems: 'flex-start' }}>
                  <CheckCircle on={t.done} ink size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: t.done ? 600 : 400, lineHeight: 1.3, color: t.done ? 'var(--ink)' : 'var(--ink-soft)' }}>
                      {t.text}
                    </div>
                    {t.done_at && (
                      <div className="faint" style={{ fontSize: 12 }}>
                        {new Date(t.done_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <IconButton className="plain" ariaLabel={`Manage ${f.name}`} onClick={() => setManage(f)}>
              <UserMinus size={16} />
            </IconButton>
          </motion.div>
        ))}

        {loaded && friends.length === 0 && pending.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p className="muted" style={{ fontSize: 14.5 }}>No friends yet.</p>
            <p className="faint" style={{ fontSize: 13, marginTop: 6 }}>
              Share your invite code and their list shows up here, live.
            </p>
          </div>
        )}

      </div>

      {/* 加好友 */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)}>
        <h3 className="display" style={{ fontSize: 24, textAlign: 'center' }}>Add a friend</h3>
        <p className="muted" style={{ fontSize: 13.5, textAlign: 'center', margin: '8px 0 16px' }}>
          Enter the code they shared with you.
        </p>
        <input
          className="field"
          placeholder="e.g. AB3K9XQ2"
          value={draft}
          maxLength={8}
          autoCapitalize="characters"
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && void submitCode()}
          style={{ textAlign: 'center', fontSize: 18, letterSpacing: 3 }}
        />
        <SoundButton className="block" sound="pop" disabled={!draft.trim()} onClick={() => void submitCode()} style={{ marginTop: 12 }}>
          <Check size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Send request
        </SoundButton>
        {code && (
          <p className="faint" style={{ fontSize: 13, textAlign: 'center', marginTop: 14 }}>
            Your code: <strong style={{ letterSpacing: 2 }}>{code}</strong>
            <button
              className="link-btn"
              style={{ marginLeft: 8 }}
              onClick={() => {
                void navigator.clipboard?.writeText(code)
                playSound('pop')
                say('Code copied')
              }}
            >
              <Copy size={12} style={{ verticalAlign: -2, marginRight: 3 }} />Copy
            </button>
          </p>
        )}
      </Sheet>

      {/* 管理好友:移除 / 举报(Guideline 1.2)*/}
      <Sheet open={manage != null} onClose={() => setManage(null)}>
        <h3 className="display" style={{ fontSize: 24, textAlign: 'center' }}>{manage?.name}</h3>
        <div className="stack" style={{ marginTop: 16 }}>
          <SoundButton
            className="block ghost"
            sound="tap"
            onClick={async () => {
              if (manage && (await removeFriend(manage.profileId))) {
                say('Friend removed'); setManage(null); refresh()
              }
            }}
          >
            <UserMinus size={16} style={{ verticalAlign: -3, marginRight: 6 }} />Remove friend
          </SoundButton>
          <SoundButton
            className="block ghost"
            sound="tap"
            onClick={async () => {
              if (manage && (await reportFriend(manage.profileId, 'Reported from friend card'))) {
                say('Reported. We review every report within 24 hours.'); setManage(null); refresh()
              }
            }}
          >
            <Flag size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Report &amp; remove
          </SoundButton>
        </div>
      </Sheet>
    </div>
  )
}
