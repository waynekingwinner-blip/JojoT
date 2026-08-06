# JojoT

**Complete a 75 day challenge with your friends — and see their to-do lists in real time.**

A functional recreation of the *Her 75* iOS app
([id6746784659](https://apps.apple.com/us/app/her-75/id6746784659)), rebranded as
**JojoT**. Screen structure, flow, typography, and the subscription paywall are
matched to the shipped app; the code is React + Vite wrapped for native with
Capacitor.

## Flow

```
Onboarding  →  Paywall (hard gate)  →  Select your challenge  →  Challenge detail  →  App
```

The paywall sits immediately after onboarding, exactly as the live app does —
there is no free tier. Subscribing or restoring a purchase is the only way in.

## Screens

| Screen | What it does |
| --- | --- |
| **Onboarding** | Three editorial slides (*Become that girl* / *Do it with friends* / *Follow your routine*) then your name |
| **Paywall** | Weekly $7.99 · Monthly $14.99 · Yearly $49.99, Restore Purchases, auto-renewal disclosure, Terms & Privacy |
| **Select your challenge** | 75 Day Hard, 75 Medium, 75 Soft, Glow Within, Better Me, Sugar Free, Mental Wellness — plus **Create your own** |
| **Challenge detail** | `+N joined` pill, mood board, the numbered sticky-note rule list, join CTA |
| **Today** | `Day N`, day-scrubber segments, friends row, your editable to-do list with live water / step / photo readouts |
| **Water** | Tumbler that fills, ±250 ml, quick adds, goal taken from the active challenge, auto-ticks the water task at 100% |
| **Friends** | Everyone's list live with completion times, plus **community chat groups** with a working thread |
| **You** | Stats, subscription management, inspiration boards, reading list, settings, switch challenge, reset |

Screenshots live in [`shots/`](shots/).

## Paywall

Product catalogue and terms in [`src/lib/purchases.ts`](src/lib/purchases.ts) mirror
the App Store listing:

| Plan | Price | Product id |
| --- | --- | --- |
| Premium Weekly | **$7.99** | `jojot.premium.weekly` |
| Premium Monthly | **$14.99** | `jojot.premium.monthly` |
| Premium Yearly | **$49.99** | `jojot.premium.yearly` |

`buy()` and `restore()` are the two seams a real store client plugs into — swap
their bodies for StoreKit / Google Play Billing (or RevenueCat's
`Purchases.purchasePackage`) and nothing in the UI changes. Today they write a
receipt to `localStorage` and always succeed, so the flow is testable end to end.
Purchase state lives in the app store as an `Entitlement`; cancelling from
**You → Subscription** drops you straight back onto the paywall.

## Functionality

Everything on screen does something and persists to `localStorage`
(`jojot:state:v1`):

- **Day counting** is derived from the real start date — day 1 is the day you join.
- **To-do lists are editable** — the pencil on Today lets you rename, delete and add tasks per challenge.
- **Custom challenges** — name it, pick a length (21/30/60/75/100), write your own list.
- **Water** feeds the Today readout (`1,5 / 3,8 L`) and auto-completes its task at goal.
- **Steps** and **progress pictures** are logged per day.
- **Day scrubber** — tap a segment under `Day N` to look back at an earlier day.
- **Chat** — send a message into a group thread.

### A note on imagery

The App Store screenshots use licensed lifestyle photography. Rather than ship
someone else's photos, mood boards and progress pictures render as deterministic
abstract tiles (`MoodTile` in [`src/components/ui.tsx`](src/components/ui.tsx)) in
the same editorial palette, so every layout reads the same. Drop real assets in
and the components take them unchanged.

## Design system — strictly black and white

High-contrast display serif (**Playfair Display**) over a geometric sans
(**Poppins**), with sticky-note task numbers in **Caveat**. Tokens live at the top
of [`src/index.css`](src/index.css).

**Every value in the app is a pure neutral (`r == g == b`).** There is no hue
anywhere — depth comes from lightness, weight and type contrast alone. That
covers tokens, gradients, avatar rings, mood boards, the water tumbler, confetti
and SVG fills; colour emoji were removed from the seed copy for the same reason.

This is enforced, not asserted:

```bash
npm run build && npx vite preview --port 4173 &
npm run check:mono
```

[`scripts/check-mono.mjs`](scripts/check-mono.mjs) visits all 17 screen states and
audits each one twice:

1. **Computed styles** — every element, every colour-bearing property
   (`color`, backgrounds *including gradients*, borders, `box-shadow`, SVG
   `fill`/`stroke`, …). Any resolved `rgb()` with unequal channels fails.
2. **Rendered pixels** — screenshots the screen and checks *every pixel*, which
   also catches what CSS can't declare: emoji, images, canvas.

Current result: **17/17 screens clean, worst channel spread 0** — every rendered
pixel is exactly grey.

> Chromium is launched with `--disable-lcd-text`. Without it, subpixel text
> antialiasing fringes glyph edges with `rgb(17,109,201)` and its mirror
> `rgb(201,109,17)`, which is a screenshot artefact rather than colour in the app.

## Button sounds

Every interactive element plays a soft synthesized tone — no audio files, all
generated at runtime with the Web Audio API
([`src/lib/sound.ts`](src/lib/sound.ts)). Distinct sounds for `tap`, `click`,
`pop`, `toggle`, `water`, `success`, `chime`, `whoosh`, `error`. Audio unlocks on
the first gesture (iOS requirement) and can be muted from **You → Settings →
Button sounds**. Native builds also get haptics via the Capacitor Haptics plugin,
with a web Vibration API fallback ([`src/lib/haptics.ts`](src/lib/haptics.ts)).

## Tech stack

- **React 18 + TypeScript + Vite**
- **Framer Motion** — transitions, spring physics, layout animation
- **lucide-react** — icons
- **Capacitor 6** — native iOS/Android shells (`com.jojot.app`)

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Open at desktop width for a framed phone preview; open narrow / on a phone and it
goes full-bleed.

```bash
npm run build      # type-checks + outputs to dist/
npm run preview
```

### Native packaging

```bash
npm run build
npx cap add ios          # or: npx cap add android
npm run cap:sync
npx cap open ios         # or android
```

### Regenerate screenshots

```bash
npm run build && npx vite preview --port 4173 &
node scripts/shots.mjs
```
