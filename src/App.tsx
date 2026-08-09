/* ============================================================
   App.tsx — shell, flow routing, page transitions.

   Flow: onboarding → paywall (hard gate) → pick a challenge → app
   ============================================================ */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp, type Tab } from './lib/store'
import { StatusBar } from './components/ui'
import TabBar from './components/TabBar'
import Onboarding from './screens/Onboarding'
import Paywall from './screens/Paywall'
import ChallengeSelect from './screens/ChallengeSelect'
import Today from './screens/Today'
import Hydrate from './screens/Hydrate'
import Profile from './screens/Profile'
import { primeAudio } from './lib/sound'
import { resyncQuietly } from './lib/reminders'

export default function App() {
  const { state, challenge, isPremium } = useApp()
  const [tab, setTab] = useState<Tab>('today')

  // unlock audio on first interaction (iOS requirement)
  useEffect(() => {
    const unlock = () => primeAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  // re-arm the daily reminder across launches, without prompting
  useEffect(() => {
    void resyncQuietly(state.remindersOn)
  }, [state.remindersOn])

  const flow: 'onboarding' | 'paywall' | 'choose' | 'app' = !state.onboarded
    ? 'onboarding'
    : !isPremium
      ? 'paywall'
      : !challenge
        ? 'choose'
        : 'app'

  return (
    <div className="app-root">
      <div className="phone">
        <StatusBar />

        {/* A single keyed motion.div (no AnimatePresence) makes flow changes
            bulletproof: the new flow always mounts immediately instead of
            waiting for the previous screen's exit animation. */}
        <motion.div key={flow} {...enter} className="screen">
          {flow === 'onboarding' && <Onboarding />}

          {flow === 'paywall' && <Paywall />}

          {flow === 'choose' && <ChallengeSelect />}

          {flow === 'app' && (
            <>
              <motion.div key={tab} {...slide} className="screen">
                {tab === 'today' && <Today goHydrate={() => setTab('hydrate')} />}
                {tab === 'hydrate' && <Hydrate />}
                {tab === 'profile' && <Profile />}
              </motion.div>
              <TabBar active={tab} onChange={setTab} />
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

const enter = {
  initial: { opacity: 0, scale: 0.99 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const },
}

const slide = {
  initial: { opacity: 0, x: 14 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const },
}
