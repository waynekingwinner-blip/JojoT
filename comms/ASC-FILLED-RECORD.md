# JojoT · App Store Connect 已填内容全记录(JA → PM)

> ⚠️ **2026-08-12 起本文件部分过时。** PM 已通过 ASC API 直接修改:
> 描述与关键词(75 Day Hard → 75 Strict)、Support/Privacy URL(→ jojot.vercel.app)、
> 发布方式(→ Manually release)、订阅层级(Yearly=1/Monthly=2/Weekly=3)、
> 6 张截图(全部替换为 75 Strict 版)、versionString(1.0 → 1.0.0)。
> **以 ASC 实时状态为准,本文件仅作历史记录。**

> 整理时间:2026-08-12 · 账号:JojoT 专属 Apple 账号(Jingyu Wang 的 ASC 会话)
> 敏感标识(Team ID / Issuer ID / Key ID / vendorNumber / 审核联系人电话邮箱)一律不写入本文件,均已私发 King。
> 本文件可进仓库(已按 PROTOCOL.md 公开标准清洗)。

---

## 1. 账号与标识(J1~J7)

| 项 | 值 / 状态 |
| --- | --- |
| Paid Apps Agreement | Active(Jul 2, 2026 – Jul 2, 2027) |
| Bank Account | Active(Velton LLC (1481), US, USD) |
| Tax Form | Active(U.S. Form W-9) |
| Bundle ID | `com.jojot.app`(capability 仅 In-App Purchase) |
| ASC App ID | 6799851593 |
| App 名 / SKU / 语言 | JojoT / `jojot-ios-001` / English (U.S.) |
| In-App Purchase Key (J6) | 已生成并配入 RevenueCat,Valid credentials(Key ID 私发) |
| ASC API Key (J7) | 名称 `JojoT RevenueCat`,Access = App Manager,新生成非复用,.p8 一次性下载完成在 King 本地(Key ID 私发) |

## 2. 订阅(Monetization → Subscriptions)

订阅组:**JojoT Premium**(层级 1=Weekly / 2=Monthly / 3=Yearly)

| Product ID | Reference Name | 周期 | US 价格 | 状态 |
| --- | --- | --- | --- | --- |
| `jojot.premium.weekly` | Premium Weekly | 1 week | $7.99 | Prepare for Submission |
| `jojot.premium.monthly` | Premium Monthly | 1 month | $14.99 | Prepare for Submission |
| `jojot.premium.yearly` | Premium Yearly | 1 year | $49.99 | Prepare for Submission |

- 三个产品均:English (U.S.) 本地化;其余国家价格自动换算;无 Introductory Offer/试用;Family Sharing 关。
- **Review Information:三个产品都已上传审核截图 `02-paywall.png`(1290×2796),逐个刷新验证已落库。Review Notes 留空。**

## 3. App Information

| 字段 | 值 |
| --- | --- |
| Name | `JojoT` |
| Subtitle | `75 days, one list at a time` |
| Primary Category | Health & Fitness |
| Secondary Category | (留空) |
| Content Rights | ⚠️ 未设置(剧本没写;JojoT 无第三方内容,建议答 No,等 PM/King 确认) |
| License Agreement | Apple's Standard License Agreement(默认未动) |

## 4. 版本页(iOS App Version 1.0)

### Promotional Text
```
Pick a 75-day challenge or write your own. One list a day, water, steps and a daily progress picture — and a card you can share when the days start adding up.
```

### Keywords
```
75 hard,75 soft,challenge,habit,tracker,streak,daily,routine,water,steps,discipline,checklist
```

### Description(剧本原文,EULA 链接完好保留)
```
Seventy-five days. One list a day. JojoT keeps the promise you keep making to yourself.

Pick a challenge and work through its list every day — or write your own from scratch. Every day you finish fills in, until the whole run is there in front of you.

CHOOSE YOUR CHALLENGE
• 75 Day Hard — no compromises, no excuses
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

SEE IT ADD UP
• Every day of the challenge as a grid, filled in as you go
• Look back at any earlier day
• Share your day as a clean progress card

YOUR PICTURES STAY YOURS
JojoT has no account and no server. Your name, your challenge, your daily lists and your progress pictures live on your device and are never uploaded. There is no analytics SDK, no advertising, and no tracking of any kind.

MISSING A DAY DOESN'T RESET YOU
The traditional rules say start over. JojoT doesn't. Come back tomorrow.

—

JojoT requires a subscription: Weekly $7.99, Monthly $14.99, or Yearly $49.99. Prices are shown in full before you pay. Payment is charged to your Apple ID at confirmation of purchase. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period; manage or cancel any time in your App Store account settings.

JojoT is a habit tracker, not medical or fitness advice. It does not diagnose, treat or prevent anything. Talk to a doctor before starting a demanding programme.

Support: https://waynekingwinner-blip.github.io/JojoT/
Privacy Policy: https://waynekingwinner-blip.github.io/JojoT/privacy/
Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

### 其余字段

| 字段 | 值 |
| --- | --- |
| Support URL | `https://waynekingwinner-blip.github.io/JojoT/` |
| Marketing URL | (留空) |
| Copyright | `2026 JojoT` |
| App Store Version Release | Automatically release this version(默认;如要手动放量需改) |
| Build | ⚠️ 未挂 —— 等 PM/King 的 Xcode 上传 |

### 截图(iPhone 6.9" 组,1290×2796,按剧本顺序)

| 顺序 | 文件 |
| --- | --- |
| 1 | `04-today.png` |
| 2 | `03-choose-a-challenge.png` |
| 3 | `01-keep-the-promise.png` |
| 4 | `05-water.png` |
| 5 | `06-you.png` |
| 6 | `02-paywall.png` |

iPad / Apple Watch:未传(本次不做)。

## 5. Age Rating(新版 7 步问卷)

Step 1 · Features / In-App Controls & Capabilities:

| 问题 | 答案 |
| --- | --- |
| Parental Controls | No |
| Age Assurance | No |
| Unrestricted Web Access | No |
| User-Generated Content | No |
| Social Media | No |
| Social Media Disabled for Users Under 13 | No(无社交功能,此题被表单强制作答) |
| Messaging and Chat | No |
| Advertising | No |

Step 2~6 · 内容频率:

| 问题 | 答案 |
| --- | --- |
| Profanity or Crude Humor | None |
| Horror/Fear Themes | None |
| Alcohol, Tobacco, or Drug Use or References | None |
| Medical or Treatment Information | None |
| **Health or Wellness Topics** | **Yes**(⚠️ 剧本没有此题;预设挑战确属生活方式建议,King 拍板如实答) |
| Mature or Suggestive Themes | None |
| Sexual Content or Nudity | None |
| Graphic Sexual Content and Nudity | None |
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Realistic Violence | None |
| Guns or Other Weapons | None |
| Simulated Gambling | None |
| Contests | None |
| Gambling | No |
| Loot Boxes | No |

Step 7 · 结果:

| 项 | 值 |
| --- | --- |
| **Calculated Rating** | **9+**(非剧本预期 4+,因 Health/Wellness = Yes;各地换算:越南 12+、巴西 A10、韩国 ALL) |
| Age Categories and Override | Not Applicable |
| Age Suitability URL | (留空) |

## 6. App Privacy(已 Publish)

| 项 | 值 |
| --- | --- |
| Privacy Policy URL | `https://waynekingwinner-blip.github.io/JojoT/privacy/` |
| User Privacy Choices URL | (留空) |
| 是否收集数据 | Yes |
| 勾选的数据类型 | 仅 **Identifiers → User ID** + **Purchases**(其余全部未勾,含 Health & Fitness、Photos、Usage Data、Diagnostics) |
| User ID 用途 | 仅 App Functionality;不关联身份;不用于追踪 |
| Purchases (Purchase History) 用途 | 仅 App Functionality;不关联身份;不用于追踪 |
| 产品页预览 | "Data Not Linked to You — Identifiers" |
| 状态 | **Published**(by Jingyu Wang) |

## 7. App Review Information(版本页)

| 项 | 值 |
| --- | --- |
| Sign-in required | **No**(已取消勾选) |
| Contact Information | 已填(姓名/电话/邮箱,私发 King,不写此处) |
| Attachment | 无 |

### Notes(剧本第 6 节原文)
```
This app requires an active subscription to access its content (hard paywall,
no free trial). Reviewers can unlock the full app by subscribing to any plan
using a Sandbox Apple ID — Sandbox purchases are not charged.

No login or demo account is needed. All user data is stored locally on the
device; there is no account system and no server.

Subscriptions are handled by Apple In-App Purchase with RevenueCat.

Notes on permissions:
- Camera / Photo Library are requested only for the optional daily progress
  picture. Images are written to the app's private storage on the device and
  are never uploaded. Both permissions can be declined and the rest of the app
  works normally.
- Notifications are optional; they schedule a local daily reminder only.
```

## 8. 剩余未完成项

- [ ] **Build**:等 King 在账号机 Xcode Archive → Upload(MARKETING_VERSION 1.0.0 / BUILD 1),TestFlight processingState = VALID 后挂到 1.0.0
- [ ] **Content Rights**:待确认后答 No(JojoT 无第三方内容)
- [ ] 第 8 节提交前自查表逐条打勾 → comms 发 `Status: READY`
- [ ] 🛑 **Submit for Review:只等 King 当面下令**
