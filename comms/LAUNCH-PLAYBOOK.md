# JojoT 上线剧本 —— 从空白到「等 King 点头提交」

> **给 JA:这份文件是为了让你一路跑完,中途不用问任何人。**
> 每个字段的最终文案都在这里,直接复制。遇到本文件没写的情况才回报。
>
> 维护者:PM · 最后更新 2026-08-10

---

## 0. 前置

- 完整上下文:`comms/JA-BRIEF.md`
- 通信规矩:`comms/PROTOCOL.md`(⚠️ 本仓库**公开**,敏感标识一律不写进来)
- 任务清单:`comms/pm-to-ja.md`

**红线:最后那一步 Submit for Review,永远等 King 当面点头。**

---

## 1. 账号与标识(= MSG-PM-001 的 J1~J6)

照 `comms/pm-to-ja.md` 的 J1~J6 做。要点复述:

- **J1** 三项协议必须 Active,否则上线也收不到钱
- **J2** bundle id `com.jojot.app`,被占就停下回报
- **J3** Team ID / Issuer ID → **私发 King,不写进仓库**
- **J4** 建 App 记录,SKU `jojot-ios-001`,**先别填元数据**
- **J5** 三个订阅产品,Description ≤55 字符
- **J6** In-App Purchase Key,**必须本 app 专属 Apple 账号生成**,`.p8` 只能下一次

---

## 2. App Store 元数据(全部最终文案,直接复制)

### Name(30 字符上限)

```
JojoT
```

### Subtitle(30 字符上限)

```
75 days, one list at a time
```
*(27 字符)*

### Promotional Text(170 字符上限,可随时改,不用过审)

```
Pick a 75-day challenge or write your own. One list a day, water, steps and a daily progress picture — and a card you can share when the days start adding up.
```
*(159 字符)*

### Keywords(100 字符上限,逗号分隔,不要空格)

```
75 hard,75 soft,challenge,habit,tracker,streak,daily,routine,water,steps,discipline,checklist
```
*(93 字符)*

### Description

⚠️ **每一句都必须对应真实功能(Guideline 2.3.1)。这段已逐条核对过代码,不要自行添加卖点。**
⚠️ **末尾的 EULA 链接必须保留(Guideline 3.1.2),删了会被自动预审拒回。**

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

### What's New(首版)

```
First release.
```

### URLs

| 字段 | 值 |
| --- | --- |
| Support URL | `https://waynekingwinner-blip.github.io/JojoT/` |
| Marketing URL | *(留空)* |
| Privacy Policy URL | `https://waynekingwinner-blip.github.io/JojoT/privacy/` |

⚠️ 两个 URL 已用无登录态 curl 实测返回 200。填完自己再验一次。

### Category

- Primary: **Health & Fitness**
- Secondary: *(留空)*

### Copyright

```
2026 JojoT
```

---

## 3. 截图

**用 `store-assets/iphone-6.9/` 里的 6 张,尺寸精确 1290×2796。**

⚠️ **不要用 `shots/` 目录** —— 那是 860×1760 的仓库预览图,尺寸不合规,ASC 会拒。

上传顺序(第一张最重要,商店列表页只显示前 2~3 张):

| 顺序 | 文件 | 画面 |
| --- | --- | --- |
| 1 | `04-today.png` | Day 42,清单勾了 4 条,底部 75 天点阵 |
| 2 | `03-choose-a-challenge.png` | 七个挑战 + 自建 |
| 3 | `01-keep-the-promise.png` | Onboarding 首屏 |
| 4 | `05-water.png` | 喝水追踪 |
| 5 | `06-you.png` | 统计与设置 |
| 6 | `02-paywall.png` | 订阅页 |

只需要 **iPhone 6.9″** 一组。iPad 不用传(本次不做 iPad 版本)。

---

## 4. Age Rating(年龄分级问卷)

如实作答。JojoT 的正确答案:

| 问题 | 答案 |
| --- | --- |
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Sexual Content or Nudity | None |
| Profanity or Crude Humor | None |
| Alcohol, Tobacco, or Drug Use or References | **None** ※ |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| Medical/Treatment Information | **None** ※※ |
| Gambling | None |
| Contests | None |
| Unrestricted Web Access | **No** |
| User Generated Content | **No** ※※※ |

※ 挑战规则里出现 "no alcohol",这是**戒断要求**,不是饮酒内容或鼓励。选 None。
※※ ⚠️ **必须选 None,而且 app 内外都不能出现医疗声明**(治疗、缓解疼痛、预防损伤、康复、理疗、医疗级)。写了就会被划进 EU MDR 监管范围。描述里已经明确写了「not medical advice」。
※※※ 社群聊天已从 v1.0 移除,没有任何用户生成内容,也没有用户之间的交流。

预期结果:**4+**

---

## 5. App Privacy(隐私问卷)

⚠️ 这一栏答错会和隐私政策页对不上,是常见拒审点。JojoT 的实际情况:

**app 本身不收集任何数据**,但订阅经过 Apple 和 RevenueCat。如实申报:

### Data Types

| 类别 | 是否收集 | 说明 |
| --- | --- | --- |
| Contact Info | ❌ No | 无账号 |
| Health & Fitness | ❌ No | 全部留在设备,不上传 |
| Photos or Videos | ❌ No | 进度照片只写本机,**不上传** |
| Location | ❌ No | |
| Contacts | ❌ No | |
| User Content | ❌ No | |
| Browsing / Search History | ❌ No | |
| Identifiers | ✅ **Yes** | RevenueCat 生成的匿名 app user ID |
| **Purchases** | ✅ **Yes** | 订阅状态 / 购买记录 |
| Usage Data | ❌ No | 无任何 analytics SDK |
| Diagnostics | ❌ No | |
| Other Data | ❌ No | |

### 对 Identifiers 和 Purchases 两项的后续追问

| 追问 | 答案 |
| --- | --- |
| Used for tracking? | **No** |
| Linked to the user's identity? | **No** |
| Purpose | **App Functionality**(判断订阅是否有效) |

**不要**勾 Analytics、Advertising、Product Personalization。

---

## 6. App Review Information(审核备注)⚠️ 硬付费墙必填

JojoT 是**硬付费墙、无免费层、无试用**。审核员进不去 app 就会直接拒。

### Sign-in required

**No**(app 没有账号系统)

### Notes —— 原文复制

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

⚠️ **如果后来给订阅加了 Introductory Offer(免费试用),这段必须改成让审核员用试用解锁。** 试用是 ASC 服务端配置,不在 app 代码里 —— 付费墙上没有试用文案**不代表**没开试用。

### Contact Information

用 King 指定的联系邮箱(**私发,不写进本仓库**)。

---

## 7. 打包上传

**先确认 King 已经把 RevenueCat 的 Public SDK Key 给你**(`appl_` 开头)。
没有它,付费墙会显示 "Subscriptions unavailable",这个包不能提审。

```bash
git pull
npm install
cp .env.example .env.local
# 编辑 .env.local,填入:
#   VITE_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxx
npm run build && npx cap sync ios
open ios/App/App.xcworkspace
```

Xcode 里:

1. 选 **App** target → Signing & Capabilities → 登你自己的 Apple 账号
   (工程里 `DEVELOPMENT_TEAM` 故意留空、`CODE_SIGN_STYLE = Automatic`,Xcode 会自动填)
2. 确认 **In-App Purchase** capability 在
3. 顶部设备选 **Any iOS Device (arm64)**
4. **Product → Archive**
5. Organizer → **Distribute App → App Store Connect → Upload**

版本号:`MARKETING_VERSION = 1.0.0`,`CURRENT_PROJECT_VERSION = 1`(已设好,别改)。

### 上传后必须亲自核实

⚠️ **别信 Xcode 的成功提示。** 上传后等 5~15 分钟,去 ASC → TestFlight,
确认 build 出现且 **processingState = VALID**。

如果 Xcode 报错但 ASC 里 build 已经在了 —— **那就是传上去了,不要重传**,
重传会撞重复提交。

⚠️ **版本线陷阱**:1.0.0 一旦过审,这条 pre-release train 永久关闭。
之后任何 `CFBundleShortVersionString = 1.0.0` 的包上传会被苹果**静默丢弃**
(报 90062 / 90186 —— build 不是 FAILED,是根本不出现在列表里)。
下次发版必须先升到 1.0.1。

---

## 8. 提交前自查

逐条打勾,全绿才叫 King:

- [ ] Paid Apps Agreement / Bank / Tax 三项 **Active**
- [ ] 三个订阅产品状态 **Ready to Submit**,Description ≤55 字符
- [ ] RevenueCat In-App Purchase Key 显示 **✅ Valid credentials**,且是本账号生成
- [ ] RevenueCat Offering 是 **current**,entitlement 名是 `premium`
- [ ] 元数据全部填完,Description 末尾**保留了 EULA 链接**
- [ ] Support / Privacy URL **无登录态 curl 返回 200**
- [ ] 6 张截图已传,全部 **1290×2796**
- [ ] Age Rating 问卷已答,UGC = No,Medical = None
- [ ] App Privacy 已答:只勾 Identifiers + Purchases,均 **不用于追踪、不关联身份**
- [ ] App Review Notes 已填(硬付费墙 sandbox 解锁说明)
- [ ] Build 已上传且 ASC 里 **processingState = VALID**
- [ ] Build 已挂到 1.0.0 这个版本上
- [ ] 描述里每条卖点都在 app 里真实存在

---

## 9. 🛑 停

**全部就绪后,不要点 Submit for Review。**

在 `comms/ja-to-pm.md` 写一条 `Status: READY`,列出上面自查表的结果,
然后**等 King 明确说「提交」**。

这一步永远是 King 的决定,不是 AI 的。
