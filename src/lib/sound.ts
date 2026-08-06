/* ============================================================
   sound.ts — synthesized UI sounds via the Web Audio API.
   No audio files needed: every click/tap/success tone is
   generated on the fly. Soft, pleasant, "candy" UI sounds.
   ============================================================ */

type SoundName = 'tap' | 'click' | 'toggle' | 'success' | 'pop' | 'water' | 'whoosh' | 'chime' | 'error'

const STORAGE_KEY = 'jojot:sound'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = readEnabled()

function readEnabled(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === null ? true : v === '1'
  } catch {
    return true
  }
}

export function isSoundEnabled() {
  return enabled
}

export function setSoundEnabled(on: boolean) {
  enabled = on
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
  } catch {
    /* ignore */
  }
  if (on) playSound('toggle')
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** A single tuned blip. */
function blip(
  c: AudioContext,
  out: GainNode,
  opts: {
    freq: number
    type?: OscillatorType
    dur?: number
    gain?: number
    delay?: number
    glideTo?: number
  },
) {
  const { freq, type = 'sine', dur = 0.12, gain = 0.4, delay = 0, glideTo } = opts
  const t = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur)
  // gentle attack + decay envelope
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g)
  g.connect(out)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

/** Soft filtered-noise burst (used for "water"/"whoosh"). */
function noise(
  c: AudioContext,
  out: GainNode,
  opts: { dur?: number; gain?: number; freq?: number; q?: number; sweep?: number },
) {
  const { dur = 0.18, gain = 0.18, freq = 900, q = 6, sweep } = opts
  const t = c.currentTime
  const frames = Math.floor(c.sampleRate * dur)
  const buf = c.createBuffer(1, frames, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  const src = c.createBufferSource()
  src.buffer = buf
  const filt = c.createBiquadFilter()
  filt.type = 'bandpass'
  filt.frequency.setValueAtTime(freq, t)
  filt.Q.value = q
  if (sweep) filt.frequency.exponentialRampToValueAtTime(sweep, t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filt)
  filt.connect(g)
  g.connect(out)
  src.start(t)
  src.stop(t + dur)
}

export function playSound(name: SoundName) {
  if (!enabled) return
  const c = getCtx()
  if (!c || !master) return

  switch (name) {
    case 'tap':
      blip(c, master, { freq: 660, type: 'sine', dur: 0.07, gain: 0.22, glideTo: 880 })
      break
    case 'click':
      blip(c, master, { freq: 520, type: 'triangle', dur: 0.06, gain: 0.3, glideTo: 720 })
      break
    case 'pop':
      blip(c, master, { freq: 380, type: 'sine', dur: 0.13, gain: 0.32, glideTo: 760 })
      break
    case 'toggle':
      blip(c, master, { freq: 600, type: 'square', dur: 0.05, gain: 0.16, glideTo: 820 })
      break
    case 'whoosh':
      noise(c, master, { dur: 0.26, gain: 0.12, freq: 500, q: 1.5, sweep: 1800 })
      break
    case 'water':
      blip(c, master, { freq: 720, type: 'sine', dur: 0.16, gain: 0.28, glideTo: 360 })
      noise(c, master, { dur: 0.14, gain: 0.06, freq: 1600, q: 3, sweep: 600 })
      break
    case 'success':
      // happy little arpeggio
      blip(c, master, { freq: 523.25, type: 'sine', dur: 0.16, gain: 0.3 })
      blip(c, master, { freq: 659.25, type: 'sine', dur: 0.16, gain: 0.3, delay: 0.09 })
      blip(c, master, { freq: 783.99, type: 'sine', dur: 0.24, gain: 0.32, delay: 0.18 })
      blip(c, master, { freq: 1046.5, type: 'sine', dur: 0.32, gain: 0.26, delay: 0.27 })
      break
    case 'chime':
      blip(c, master, { freq: 880, type: 'sine', dur: 0.3, gain: 0.22 })
      blip(c, master, { freq: 1318.5, type: 'sine', dur: 0.4, gain: 0.16, delay: 0.06 })
      break
    case 'error':
      blip(c, master, { freq: 320, type: 'sawtooth', dur: 0.12, gain: 0.18, glideTo: 200 })
      break
  }
}

/** Call once on first user gesture so iOS unlocks audio. */
export function primeAudio() {
  getCtx()
}
