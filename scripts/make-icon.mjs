/* Render the app icon at 1024×1024 and write it into the iOS asset
   catalog. App Store icons must be opaque, square and un-rounded —
   iOS applies its own mask — so the alpha channel is flattened out
   at the end and asserted.

   Usage:
     node scripts/make-icon.mjs [grid|letter|ring]            preview only
     node scripts/make-icon.mjs [grid|letter|ring] --install  write into ios/
*/
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync } from 'node:fs'

const S = 1024
const VARIANT = process.argv[2] || 'grid'
const INSTALL = process.argv.includes('--install')
const OUT = process.env.OUT || 'scratch/icons'
const ICONSET = 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'

/* ---- variants -------------------------------------------------- */

// The dot grid is the app's own motif: it is what the share card
// draws for a challenge, so the icon and the thing people post match.
const grid = () => {
  const cols = 5
  const step = S * 0.163
  const r = S * 0.049
  const gridW = step * (cols - 1)
  const o = (S - gridW) / 2
  const filled = 13 // a challenge in progress, not finished

  let dots = ''
  for (let i = 0; i < cols * cols; i++) {
    const cx = o + (i % cols) * step
    const cy = o + Math.floor(i / cols) * step
    dots +=
      i < filled
        ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/>`
        : `<circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="none" stroke="#fff" stroke-width="8" opacity="0.42"/>`
  }
  return `<rect width="${S}" height="${S}" fill="#0d0d0d"/>${dots}`
}

const letter = () => `
  <rect width="${S}" height="${S}" fill="#0d0d0d"/>
  <text x="50%" y="50%" dy="0.34em" text-anchor="middle"
        font-family="Playfair Display, Georgia, serif"
        font-size="${S * 0.72}" font-weight="700" fill="#fff">J</text>`

const ring = () => {
  const r = S * 0.3
  const c = 2 * Math.PI * r
  return `
  <rect width="${S}" height="${S}" fill="#0d0d0d"/>
  <circle cx="${S / 2}" cy="${S / 2}" r="${r}" fill="none" stroke="#fff"
          stroke-width="${S * 0.075}" opacity="0.22"/>
  <circle cx="${S / 2}" cy="${S / 2}" r="${r}" fill="none" stroke="#fff"
          stroke-width="${S * 0.075}" stroke-linecap="round"
          stroke-dasharray="${c * 0.56} ${c}" transform="rotate(-90 ${S / 2} ${S / 2})"/>
  <circle cx="${S / 2}" cy="${S / 2}" r="${S * 0.062}" fill="#fff"/>`
}

const VARIANTS = { grid, letter, ring }

/* ---- render ---------------------------------------------------- */

const body = (VARIANTS[VARIANT] ?? grid)()
const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<style>html,body{margin:0;padding:0;background:#0d0d0d}svg{display:block}</style>
<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${body}</svg>`

mkdirSync(OUT, { recursive: true })
const raw = `${OUT}/icon-${VARIANT}.png`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: S, height: S } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: raw })
await browser.close()

/* ---- flatten alpha and verify ---------------------------------- */

execFileSync('python3', [
  '-c',
  `from PIL import Image; Image.open("${raw}").convert("RGB").save("${raw}")`,
])

const hasAlpha = execFileSync('sips', ['-g', 'hasAlpha', raw]).toString()
if (!/hasAlpha:\s*no/.test(hasAlpha)) throw new Error(`icon still has an alpha channel:\n${hasAlpha}`)

const dims = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', raw]).toString()
console.log(`${raw}\n${dims.trim()}\nhasAlpha: no  ✓`)

if (INSTALL) {
  copyFileSync(raw, ICONSET)
  console.log(`installed → ${ICONSET}`)
}
