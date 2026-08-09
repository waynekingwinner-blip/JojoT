# DEVIN.md — work queue for the App Store agent

> **给 King 的说明**:这是我(Claude,本地开发机)写给 Devin 的任务单。
> 让 Devin `git pull` 后读这个文件,做完把结果写进 `DEVIN-FEEDBACK.md` 并 push,
> 我再读它继续。**Devin 不要改 `DEVIN.md`,只写 `DEVIN-FEEDBACK.md`。**

---

## Protocol

| File | Written by | Read by |
| --- | --- | --- |
| `DEVIN.md` (this file) | Claude (dev machine) | Devin |
| `DEVIN-FEEDBACK.md` | Devin | Claude |

Rules:

1. **Devin never edits `DEVIN.md`.** Append to `DEVIN-FEEDBACK.md` only.
2. Every task below has an ID (`D1`, `D2`, …). Answer by ID.
3. If a step is blocked, say **exactly** what blocked it — the error string, the
   screen you were on, what you expected. "Didn't work" is not usable.
4. **Never guess a value.** If a field is unknown, write `UNKNOWN` and say why.
   A wrong Team ID or Key ID costs a day of debugging downstream.
5. Do not submit anything to App Review until `DEVIN.md` says the build is ready.
   Right now it is **not** — the app still ships a mock in-app purchase layer.

---

## Context

**App**: JojoT — a 75-day challenge tracker. React + Vite + Capacitor 6.
**Apple account**: `wangjyca@gmail.com` (Apple Developer Program, paid/active).
**Bundle id (intended)**: `com.jojot.app`
**Repo**: this one. `main` is the working branch.

Build locally with:

```bash
npm install
npm run build        # tsc + vite  → dist/
npx cap sync ios     # copies dist/ into ios/ and installs pods
open ios/App/App.xcworkspace
```

Current state of the code:

- ✅ iOS platform added, `xcodebuild` for simulator succeeds
- ✅ Real camera for progress pictures (`@capacitor/camera`)
- ✅ Share-card generation (`@capacitor/share`)
- ✅ Daily local notification behind the Reminders toggle
- ❌ **In-app purchases are still a mock** — `src/lib/purchases.ts` fakes success.
  This is being replaced with RevenueCat. **Do not submit before that lands.**
- ❌ No app icon yet
- ❌ Privacy policy / support URLs not yet hosted

---

## Task queue

### D1 — Confirm the Apple Developer account is submission-ready

In App Store Connect → **Business** (Agreements, Tax, and Banking), confirm all
three are `Active`:

- [ ] Paid Apps Agreement
- [ ] Bank Account
- [ ] Tax Form

**Report**: the status of each. If any is not Active, say which and what it is
waiting on. Without all three the app cannot sell subscriptions — this is the
single most common cause of "app is live but earns $0".

Also report the **vendorNumber** (App Store Connect → Business, the number next
to the company name). It is needed later to reconcile sales reports.

---

### D2 — Claim the bundle identifier

In the Apple Developer portal → **Certificates, Identifiers & Profiles →
Identifiers**, check whether `com.jojot.app` is available.

- If available: register it as an App ID. Enable the **In-App Purchase**
  capability. Do **not** enable capabilities the app does not use.
- If taken by someone else: **stop and report**. Do not invent a variant —
  the bundle id is baked into RevenueCat and ASC and changing it later is
  expensive. I will pick the replacement.

**Report**: the exact bundle id registered, or `TAKEN`.

---

### D3 — Report the account identifiers

I need these to wire up RevenueCat and any App Store Connect API scripting.

**Report** all four:

| Field | Where to find it |
| --- | --- |
| **Team ID** | Developer portal → Membership details (10 chars, e.g. `A1B2C3D4E5`) |
| **Issuer ID** | ASC → Users and Access → Integrations → App Store Connect API (a UUID) |
| **ASC App ID** | after D4 — the numeric id in the App Store Connect URL |
| **vendorNumber** | from D1 |

---

### D4 — Create the App Store Connect app record

ASC → **My Apps → + → New App**.

- Platform: **iOS**
- Name: `JojoT` — if taken, report back, do not improvise a name
- Primary language: **English (U.S.)**
- Bundle ID: the one from D2
- SKU: `jojot-ios-001`
- User Access: Full Access

**Do not fill in the description, screenshots, or submit for review yet.**
Metadata comes later in one pass, because the app's copy is still changing.

**Report**: the numeric ASC App ID from the URL, e.g.
`https://appstoreconnect.apple.com/apps/**6748291043**/...`

---

### D5 — Create the three subscription products

ASC → your app → **Monetization → Subscriptions**.

Create one **Subscription Group** named `JojoT Premium`, then three subscriptions
inside it. The product ids must match the code **exactly** — they are read from
`src/lib/purchases.ts`:

| Reference Name | Product ID | Duration | Price (USD) |
| --- | --- | --- | --- |
| Premium Weekly | `jojot.premium.weekly` | 1 Week | 7.99 |
| Premium Monthly | `jojot.premium.monthly` | 1 Month | 14.99 |
| Premium Yearly | `jojot.premium.yearly` | 1 Year | 49.99 |

For each one you must also add, or it will not reach `Ready to Submit`:

- **Subscription display name** (shown in the purchase sheet)
- **Description** — ⚠️ **hard limit 55 characters.** Suggested:
  - Weekly: `Every challenge, friends' lists, and daily photos.` (49)
  - Monthly: `Every challenge, friends' lists, and daily photos.` (49)
  - Yearly: `A full year of every challenge and every feature.` (48)
- **Localization** for English (U.S.)
- At least one **price** for all territories

**Do not add an Introductory Offer / free trial yet.** Whether we ship a trial
changes the App Review notes, and I want to decide that in one place. If ASC
forces a choice, choose **no trial** and report it.

**Report**: the state of each of the three products (`Missing Metadata`,
`Ready to Submit`, etc.).

---

### D6 — Generate the In-App Purchase Key ⚠️ highest-risk step

This is the single most common cause of "RevenueCat shows $0 while Apple is
actually taking money", and of paying users being locked out of the app.

ASC → **Users and Access → Integrations** (tab at the top) → left sidebar
**Keys → In-App Purchase**.

1. Click `+` to generate a new key. Name it `JojoT StoreKit`.
2. Download the `.p8` file. **It can only be downloaded once.**
3. Note the **Key ID**.

**Critical**: this key must be generated **from this Apple account**
(`wangjyca@gmail.com`). Do **not** reuse a `.p8` from any other project or
account. With StoreKit 2, a missing or foreign key means transactions are
silently never recorded.

**Report**: the Key ID, and confirm the `.p8` was downloaded and where it is
stored. **Do not paste the contents of the `.p8` into this repo or into
`DEVIN-FEEDBACK.md`** — it is a secret. Just confirm you have it.

---

### D7 — Do NOT submit yet

Blocked on my side. I still owe:

- real RevenueCat purchase layer replacing the mock
- app icon
- hosted privacy policy + support page
- the Supabase backend that makes the "friends' lists in real time" and
  "community chat groups" paywall claims actually true (they are currently
  hardcoded fixtures — submitting as-is is a Guideline 2.3.1 rejection)
- fresh screenshots matching the redesigned copy

I will update this file when the build is submittable.

---

## Feedback template

Copy this into `DEVIN-FEEDBACK.md`, fill it in, commit, push.

```markdown
## Round 1 — <date>

### D1 Business agreements
- Paid Apps Agreement:
- Bank Account:
- Tax Form:
- vendorNumber:

### D2 Bundle id
- Registered:

### D3 Identifiers
- Team ID:
- Issuer ID:
- ASC App ID:

### D4 App record
- Created: yes / no
- App name accepted:
- ASC App ID:

### D5 Subscriptions
- jojot.premium.weekly:
- jojot.premium.monthly:
- jojot.premium.yearly:

### D6 In-App Purchase Key
- Key ID:
- .p8 downloaded and stored: yes / no
- Generated from wangjyca@gmail.com: yes / no

### Blocked / anything unexpected
-
```
