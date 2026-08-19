# JojoT v1.1.0 · 商店文案(提交时逐字段粘贴 / API 写入)

> 预备于 2026-08-19。1.0 过审后:建 1.1.0 版本 → 写入以下内容 → 传 7 张截图
> (store-assets/v1.1/iphone-6.9/,按文件名序)→ 挂无 BETA_UNLOCK 的 build → 闸门 B → 提交。

## Description(⚠️ 关键改动:删掉了 1.0 的 "no account and no server / never uploaded /
## no analytics no tracking" 段落 —— v1.1 有账号有服务器,那段留着 = §11.2(g) 级元数据不实)

```
Seventy-five days. One list a day. JojoT keeps the promise you keep making to yourself.

Pick a challenge and work through its list every day — or write your own from scratch. Every day you finish fills in, until the whole run is there in front of you.

CHOOSE YOUR CHALLENGE
• 75 Strict — no compromises, no excuses
• 75 Medium — the balanced middle path
• 75 Soft — gentle, sustainable, kind to your body
• Glow Within — radiance from the inside out
• Better Me — small promises, big transformation
• Sugar Free — break up with refined sugar
• Mental Wellness — a calmer, clearer, softer mind
• Or build your own — name it, pick a length, write your own list

YOUR DAY, TRACKED
• A daily checklist you can rename, reorder, add to and cut down
• Water tracking that fills as you drink and ticks itself off at your goal
• Step logging alongside the rest of your day
• A daily progress picture, taken or picked from your library

DO IT WITH FRIENDS
• Sign in with Apple and swap invite codes — no usernames to hunt for
• See your friends' daily lists next to yours, updated the moment they tick something off
• Cheer each other through the same 75 days
• Remove or report a friend at any time

SEE IT ADD UP
• Every day of the challenge as a grid, filled in as you go
• Look back at any earlier day
• Share your day as a clean progress card

YOUR PICTURES STAY YOURS
Progress pictures are stored on your device and are never uploaded — friends see your daily checklist, never your photos. Signing in is optional: skip Friends entirely and everything else works right on your device.

MISSING A DAY DOESN'T RESET YOU
The traditional rules say start over. JojoT doesn't. Come back tomorrow.

—

JojoT requires a subscription: Weekly $7.99, Monthly $14.99, or Yearly $49.99. Prices are shown in full before you pay. Payment is charged to your Apple ID at confirmation of purchase. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period; manage or cancel any time in your App Store account settings.

JojoT is a habit tracker, not medical or fitness advice. It does not diagnose, treat or prevent anything. Talk to a doctor before starting a demanding programme.

Support: https://jojot.vercel.app/
Privacy Policy: https://jojot.vercel.app/privacy/
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

## What's New in This Version

```
Do it with friends! Sign in with Apple, share your invite code, and see your friends' daily lists next to yours — live, the moment they tick something off.

• Friends: connect with an 8-character invite code, accept requests, cheer each other on
• Live updates when a friend completes a task
• All-new silhouette artwork across challenges, onboarding and the paywall
• Fixes and polish throughout
```

## Keywords(≤100 字符,含新增 friends/accountability)

```
75 day challenge,75 soft,75 medium,habit,tracker,streak,water,steps,friends,accountability
```

## Promotional Text(免审字段,可保持或换成好友卖点)

```
Pick a 75-day challenge — and now do it with friends. Share an invite code and see each other's daily lists, live. One list a day, water, steps and a progress picture.
```

## App Review Notes(整段替换)

```
This app requires an active subscription to access its content (hard paywall,
no free trial). Reviewers can unlock the full app by subscribing to any plan
using a Sandbox Apple ID — Sandbox purchases are not charged.

New in 1.1: an optional Friends feature. Sign in with Apple is used only for
this feature and is never required for the rest of the app. Friends connect by
exchanging 8-character invite codes shown on the Friends tab; accepted friends
then see each other's daily checklists, updated live. Progress pictures are
never uploaded and are never visible to friends. Users can remove or report a
friend from the Friends tab; reporting severs the connection immediately.

Friends data (display name, daily checklist state) is stored with our backend
(Supabase). Everything else remains on device.

Notes on permissions: Camera / Photo Library are requested only for the
optional daily progress picture (stored on device, never uploaded).
Notifications are optional and schedule a local daily reminder only.
```

## King 手动项备忘(day-of)

- **App Privacy 重答**(网页,答完点 Publish):新增 User Content(好友可见的清单文本,
  App Functionality,Linked to You)+ Health & Fitness(水量/步数进服务器,App
  Functionality,Linked to You);User ID 从 Not Linked 改成 **Linked to You**;
  Purchases 不变。具体以提交当天我给的对照表为准。
- 年龄分级:我先试 API 重答(UGC=Yes 需评估);409 才轮到你。
- 隐私政策部署:cd docs && vercel deploy --prod(我来,day-of)。
