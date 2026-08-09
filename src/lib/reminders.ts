/* ============================================================
   reminders.ts — the daily nudge behind the Reminders toggle.

   Returns whether scheduling actually succeeded so the UI can
   put the switch back if the user denied notifications. A toggle
   that stays on while nothing is scheduled is worse than no
   toggle at all.
   ============================================================ */

import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const ID = 1
const HOUR = 9

export type ReminderResult = 'scheduled' | 'cancelled' | 'denied' | 'unsupported'

/**
 * Re-arm the reminder on launch without ever showing a permission
 * prompt. The default state has reminders on, and prompting for
 * notifications on first launch — before the app has shown any
 * value — is both bad practice and something Apple flags.
 */
export async function resyncQuietly(on: boolean): Promise<void> {
  if (!on || !Capacitor.isNativePlatform()) return
  try {
    const { display } = await LocalNotifications.checkPermissions()
    if (display !== 'granted') return
    await syncReminders(true)
  } catch {
    /* ignore */
  }
}

export async function syncReminders(on: boolean): Promise<ReminderResult> {
  if (!Capacitor.isNativePlatform()) return 'unsupported'

  try {
    await LocalNotifications.cancel({ notifications: [{ id: ID }] })
  } catch {
    /* nothing scheduled yet */
  }

  if (!on) return 'cancelled'

  let granted = false
  try {
    const current = await LocalNotifications.checkPermissions()
    granted =
      current.display === 'granted' ||
      (await LocalNotifications.requestPermissions()).display === 'granted'
  } catch {
    return 'denied'
  }

  if (!granted) return 'denied'

  await LocalNotifications.schedule({
    notifications: [
      {
        id: ID,
        title: 'Your list is waiting',
        body: 'One day at a time. Open JojoT and tick the first thing off.',
        schedule: { on: { hour: HOUR, minute: 0 }, allowWhileIdle: true },
      },
    ],
  })

  return 'scheduled'
}
