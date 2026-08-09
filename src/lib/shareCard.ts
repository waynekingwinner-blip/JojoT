/* ============================================================
   shareCard.ts — render the day as a shareable image.

   Draws a 1080×1350 (4:5) card on an offscreen canvas and hands
   it to the native share sheet. Deliberately does not need the
   backend: this is the social hook that works on day one.
   ============================================================ */

import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { photoDataUrl } from './photos'

const W = 1080
const H = 1350

const INK = '#141414'
const SOFT = '#6f6f6f'
const FAINT = '#a5a5a5'
const PAPER = '#f4f2ef'

export type CardInput = {
  day: number
  totalDays: number
  challengeName: string
  tasks: { text: string; done: boolean }[]
  photoRef?: string
  name?: string
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/** Draw an image cropped to fill a box, centred (object-fit: cover). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

/** Truncate to fit a width, adding an ellipsis. */
function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text
  let s = text
  while (s.length > 1 && ctx.measureText(`${s}…`).width > max) s = s.slice(0, -1)
  return `${s}…`
}

/**
 * One dot per day of the challenge, filled up to today. Centred in the
 * box, sized so the whole challenge always fits whatever its length.
 */
function drawDayGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  day: number,
  totalDays: number,
) {
  if (h < 80 || totalDays < 1) return

  const cols = Math.min(15, totalDays)
  const rows = Math.ceil(totalDays / cols)
  const step = Math.min(w / cols, h / rows, 74)
  const r = Math.max(6, step * 0.24)

  const gridW = step * cols
  const gridH = step * rows
  const ox = x + (w - gridW) / 2 + step / 2
  const oy = y + (h - gridH) / 2 + step / 2

  for (let i = 0; i < totalDays; i++) {
    const cx = ox + (i % cols) * step
    const cy = oy + Math.floor(i / cols) * step
    const n = i + 1

    ctx.beginPath()
    ctx.arc(cx, cy, n === day ? r * 1.35 : r, 0, Math.PI * 2)

    if (n < day) {
      ctx.fillStyle = INK
      ctx.fill()
    } else if (n === day) {
      ctx.fillStyle = INK
      ctx.fill()
      ctx.strokeStyle = INK
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, r * 2.3, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.fillStyle = '#e0dcd7'
      ctx.fill()
    }
  }
}

export async function renderCard(input: CardInput): Promise<string> {
  // make sure the webfonts are in before measuring/drawing text
  try {
    await document.fonts.ready
  } catch {
    /* not fatal — falls back to system fonts */
  }

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')

  const photo = input.photoRef ? await photoDataUrl(input.photoRef) : null
  const img = photo ? await loadImage(photo) : null

  // ---- background ----
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  const PAD = 72
  let y = 92

  // ---- wordmark ----
  ctx.fillStyle = FAINT
  ctx.font = '600 26px Poppins, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.letterSpacing = '6px'
  ctx.fillText('JOJOT', PAD, y)
  ctx.letterSpacing = '0px'

  // ---- day ----
  y += 116
  ctx.fillStyle = INK
  ctx.font = '700 132px "Playfair Display", Georgia, serif'
  ctx.fillText(`Day ${input.day}`, PAD, y)

  // ---- challenge ----
  y += 54
  ctx.fillStyle = SOFT
  ctx.font = '400 32px Poppins, system-ui, sans-serif'
  ctx.fillText(
    fit(ctx, `${input.challengeName} · day ${input.day} of ${input.totalDays}`, W - PAD * 2),
    PAD,
    y,
  )

  // ---- photo, when there is one ----
  y += 46
  const listTop = (() => {
    if (!img) return y + 18
    const boxH = 470
    ctx.save()
    roundRect(ctx, PAD, y, W - PAD * 2, boxH, 28)
    ctx.clip()
    drawCover(ctx, img, PAD, y, W - PAD * 2, boxH)
    ctx.restore()
    return y + boxH + 56
  })()

  // ---- task list ----
  y = listTop
  const rows = input.tasks.slice(0, img ? 4 : 8)
  for (const t of rows) {
    const cy = y + 2

    // tick
    ctx.beginPath()
    ctx.arc(PAD + 17, cy - 10, 17, 0, Math.PI * 2)
    if (t.done) {
      ctx.fillStyle = INK
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(PAD + 9, cy - 10)
      ctx.lineTo(PAD + 15, cy - 4)
      ctx.lineTo(PAD + 26, cy - 17)
      ctx.stroke()
    } else {
      ctx.strokeStyle = '#d8d8d8'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    ctx.fillStyle = t.done ? INK : FAINT
    ctx.font = `${t.done ? 500 : 400} 30px Poppins, system-ui, sans-serif`
    ctx.fillText(fit(ctx, t.text, W - PAD * 2 - 62), PAD + 50, cy)

    y += 62
  }

  const hidden = input.tasks.length - rows.length
  if (hidden > 0) {
    ctx.fillStyle = FAINT
    ctx.font = '400 26px Poppins, system-ui, sans-serif'
    ctx.fillText(`+${hidden} more`, PAD + 50, y + 2)
    y += 56
  }

  // ---- day grid ----
  // Without a photo the card is top-heavy, and a grid of the whole
  // challenge is the thing people actually want to post anyway.
  if (!img) {
    drawDayGrid(ctx, PAD, y + 34, W - PAD * 2, H - 148 - (y + 34) - 48, input.day, input.totalDays)
  }

  // ---- footer ----
  const doneCount = input.tasks.filter((t) => t.done).length
  const total = input.tasks.length

  ctx.fillStyle = PAPER
  ctx.fillRect(0, H - 148, W, 148)

  ctx.fillStyle = INK
  ctx.font = '600 34px Poppins, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`${doneCount} of ${total} done`, PAD, H - 78)

  ctx.fillStyle = FAINT
  ctx.font = '400 26px Poppins, system-ui, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(input.name ? `${input.name} on JojoT` : 'JojoT', W - PAD, H - 78)

  // progress rule
  const pct = total ? doneCount / total : 0
  ctx.fillStyle = '#e2ded9'
  ctx.fillRect(PAD, H - 52, W - PAD * 2, 6)
  ctx.fillStyle = INK
  ctx.fillRect(PAD, H - 52, (W - PAD * 2) * pct, 6)

  return canvas.toDataURL('image/png')
}

/**
 * Render and open the native share sheet.
 * Falls back to a download on the web, where Share has no file support.
 */
export async function shareDay(input: CardInput): Promise<'shared' | 'saved' | 'cancelled'> {
  const dataUrl = await renderCard(input)
  const base64 = dataUrl.split(',')[1]
  const fileName = `jojot-day-${input.day}.png`

  if (!Capacitor.isNativePlatform()) {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = fileName
    a.click()
    return 'saved'
  }

  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache,
  })

  try {
    await Share.share({
      title: `Day ${input.day}`,
      text: `Day ${input.day} of ${input.totalDays} — ${input.challengeName}`,
      files: [uri],
      dialogTitle: 'Share your day',
    })
    return 'shared'
  } catch {
    return 'cancelled'
  }
}
