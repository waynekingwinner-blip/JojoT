/* ============================================================
   TabBar.tsx — animated bottom navigation.
   ============================================================ */

import { motion } from 'framer-motion'
import { CheckSquare, Droplet, Users, User } from 'lucide-react'
import type { Tab } from '../lib/store'
import { playSound, primeAudio } from '../lib/sound'
import { haptic } from '../lib/haptics'

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'today', label: 'Today', icon: CheckSquare },
  { id: 'hydrate', label: 'Water', icon: Droplet },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'profile', label: 'You', icon: User },
]

export default function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar">
      <div className="tabbar-inner">
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = active === id
          return (
            <button
              key={id}
              className={`tab ${on ? 'active' : ''}`}
              aria-current={on ? 'page' : undefined}
              onClick={() => {
                if (on) return
                primeAudio()
                playSound('tap')
                void haptic('light')
                onChange(id)
              }}
            >
              {on && (
                <motion.span
                  layoutId="tab-ind"
                  className="tab-ind"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <motion.span
                animate={{ y: on ? -1 : 0, scale: on ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                style={{ display: 'grid', placeItems: 'center' }}
              >
                <Icon size={20} strokeWidth={on ? 2.2 : 1.7} />
              </motion.span>
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
