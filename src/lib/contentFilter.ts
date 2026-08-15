/* ============================================================
   contentFilter.ts — the 1.2 filtering obligation, kept honest.

   Only text OTHER users can see goes through here: display names,
   custom task text, custom challenge names. Private local text is
   none of our business.

   This is a coarse first line — the report/remove/block trio is
   the real enforcement. The list stays short on purpose; false
   positives in a habit tracker ("assessment") are worse than
   letting the report button do its job.
   ============================================================ */

const BLOCKLIST = [
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'nigger', 'nigga',
  'faggot', 'retard', 'whore', 'slut', 'dick', 'cock', 'pussy',
  'porn', 'rape', 'nazi', 'kill yourself', 'kys',
]

const pattern = new RegExp(
  BLOCKLIST.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')).join('|'),
  'gi',
)

/** Replace blocked words with asterisks. Length-preserving-ish. */
export function cleanShared(text: string): string {
  return text.replace(pattern, (m) => '*'.repeat(Math.min(m.length, 8)))
}

export function isClean(text: string): boolean {
  pattern.lastIndex = 0
  return !pattern.test(text)
}
