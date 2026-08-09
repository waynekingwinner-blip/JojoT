/* ============================================================
   Paywall.tsx — the subscription gate.

   A hard paywall shown straight after onboarding: three
   auto-renewing tiers (Weekly $7.99 / Monthly $14.99 /
   Yearly $49.99), Restore Purchases, and the App Store
   auto-renewal disclosure.

   Every line in PERKS must be a feature that actually ships —
   App Review reads this list (Guideline 2.3.1).
   ============================================================ */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { SoundButton, MoodTile, Toast } from '../components/ui'
import { useApp } from '../lib/store'
import {
  PLANS,
  DEFAULT_PLAN,
  getPlan,
  buy,
  restore,
  TERMS_URL,
  PRIVACY_URL,
  type PlanId,
} from '../lib/purchases'
import { playSound } from '../lib/sound'
import { haptic } from '../lib/haptics'
import { linkHandler } from '../lib/openUrl'

const PERKS = [
  'Every challenge — 75 Hard, Medium, Soft & more',
  'See your friends’ to-do lists in real time',
  'Build your own challenge and to-do list',
  'Water, steps & daily progress pictures',
  'Share your day as a progress card',
]

const HERO_TONES = ['#2b2b2b', '#6b6b6b', '#4a4a4a', '#8f8f8f']

export default function Paywall() {
  const { setEntitlement } = useApp()
  const [plan, setPlan] = useState<PlanId>(DEFAULT_PLAN)
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const say = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2600)
  }

  const subscribe = async () => {
    if (busy) return
    setBusy('buy')
    const res = await buy(plan)
    setBusy(null)
    if (res.ok) {
      playSound('success')
      void haptic('success')
      setEntitlement(res.entitlement)
    } else {
      playSound('error')
      say('Purchase was not completed.')
    }
  }

  const doRestore = async () => {
    if (busy) return
    setBusy('restore')
    const res = await restore()
    setBusy(null)
    if (res.ok) {
      playSound('success')
      void haptic('success')
      setEntitlement(res.entitlement)
    } else {
      playSound('error')
      say('No previous purchase found on this Apple ID.')
    }
  }

  const selected = getPlan(plan)

  return (
    <div className="screen" style={{ background: '#fff' }}>
      <Toast message={toast} />

      <div className="scroll no-tab" style={{ paddingTop: 'calc(var(--safe-top) + 4px)', paddingBottom: 0 }}>
        {/* ---- hero ---- */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <h1 className="display" style={{ fontSize: 40, lineHeight: 1.02 }}>
            Keep the
            <br />
            <em>promise</em>
          </h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 10 }}>
            Unlock JojoT and start your 75 days.
          </p>
        </div>

        <div className="strip" style={{ margin: '16px 0 18px', borderRadius: 14 }}>
          {HERO_TONES.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
            >
              <MoodTile tone={t} seed={i + 3} />
            </motion.div>
          ))}
        </div>

        {/* ---- perks ---- */}
        <div style={{ marginBottom: 20 }}>
          {PERKS.map((p, i) => (
            <motion.div
              key={p}
              className="row gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              style={{ alignItems: 'flex-start', marginTop: i === 0 ? 0 : 10 }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Check size={13} strokeWidth={3.4} color="#fff" />
              </span>
              <span style={{ fontSize: 14.5, lineHeight: 1.35 }}>{p}</span>
            </motion.div>
          ))}
        </div>

        {/* ---- plans ---- */}
        <div className="stack" style={{ marginBottom: 18 }}>
          {PLANS.map((p) => {
            const on = plan === p.id
            return (
              <motion.button
                key={p.id}
                className={`plan ${on ? 'on' : ''}`}
                whileTap={{ scale: 0.985 }}
                onClick={() => {
                  playSound('tap')
                  void haptic('light')
                  setPlan(p.id)
                }}
              >
                {p.badge && <span className="plan-badge">{p.badge}</span>}
                <span className="plan-radio">
                  <i />
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 15.5 }}>{p.title}</span>
                  <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-faint)', marginTop: 1 }}>
                    {p.equivalent}
                  </span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 16 }}>{p.price}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-faint)' }}>
                    /{p.id === 'weekly' ? 'week' : p.id === 'monthly' ? 'month' : 'year'}
                  </span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ---- sticky footer: CTA + legal ---- */}
      <div
        style={{
          padding: '12px 20px calc(14px + var(--safe-bottom))',
          background: 'linear-gradient(to top, #fff 72%, rgba(255,255,255,0))',
        }}
      >
        <SoundButton
          className="block xl"
          sound="pop"
          disabled={busy != null}
          onClick={subscribe}
        >
          {busy === 'buy' ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'grid', placeItems: 'center' }}
            >
              <Loader2 size={19} />
            </motion.span>
          ) : (
            `Continue — ${selected.price}/${selected.id === 'weekly' ? 'wk' : selected.id === 'monthly' ? 'mo' : 'yr'}`
          )}
        </SoundButton>

        <div className="row center gap-4" style={{ marginTop: 12, marginBottom: 10 }}>
          <button className="link-btn" onClick={doRestore} disabled={busy != null}>
            {busy === 'restore' ? 'Restoring…' : 'Restore Purchases'}
          </button>
        </div>

        <p className="legal">
          {selected.per}, auto-renewing. Payment is charged to your Apple ID account at
          confirmation of purchase. The subscription renews automatically unless it is cancelled
          at least 24 hours before the end of the current period. Manage or cancel in your
          account settings.
          <br />
          <a href={TERMS_URL} onClick={linkHandler(TERMS_URL)} target="_blank" rel="noreferrer">
            Terms of Use
          </a>{' '}
          ·{' '}
          <a href={PRIVACY_URL} onClick={linkHandler(PRIVACY_URL)} target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
