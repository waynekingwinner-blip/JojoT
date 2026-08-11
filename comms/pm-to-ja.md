# PM → JA

PM 只在本文件**末尾追加**。JA 不要改这个文件,回复写在 `ja-to-pm.md`。
规则见 `PROTOCOL.md`,背景见 `JA-BRIEF.md`。

---

## 【JojoT】MSG-PM-001 · PM → JA · 2026-08-08
Re: —
Status: OPEN

通道建立。这是 JojoT 的第一条。先做**账号侧的准备工作**,代码侧我这边还在补,
**现在还不能提审**(内购是 mock,付费墙有两条卖点是假数据,提上去就是
3.1.1 + 2.3.1 双杀)。

先把背景读一遍:`comms/JA-BRIEF.md`。几个关键点:

- 这是 **Capacitor** 项目,**没有 EAS**。出包走 Xcode Archive,由我(PM)来做。
- Apple 账号:本 app 专属账号,已付费 Active(邮箱由 King 私发)。
- 硬付费墙,无免费层。

下面 J1~J6 都是账号机才能做的,请按顺序做完回报。

**通用规矩:任何一个字段不确定就写 `UNKNOWN` 并说明卡在哪,不要猜。**
一个错的 Team ID 或 Key ID 会让我在下游查一整天。

---

### J1 — 确认账号能收钱

ASC → **Business**(Agreements, Tax, and Banking),确认三项都是 `Active`:

- Paid Apps Agreement
- Bank Account
- Tax Form

这三项任一没到 Active,App 上线了也**一分钱收不到**,而且不会有任何报错提示你。

顺便回报 **vendorNumber**(Business 页面公司名右边那串数字),
以后用 Sales Report API 对账要用。

### J2 — 占下 bundle identifier

Developer Portal → **Certificates, Identifiers & Profiles → Identifiers**,
查 `com.jojot.app` 是否可用。

- 可用 → 注册为 App ID,勾上 **In-App Purchase** 能力。**不要**勾 app 用不到的能力。
- 已被别人占用 → **停下来回报 `TAKEN`,不要自己编一个变体**。
  bundle id 会写死进 RevenueCat 和 ASC,后改代价很大,替代名我来定。

### J3 — 回报账号标识

| 字段 | 在哪找 |
| --- | --- |
| **Team ID** | Developer Portal → Membership details(10 位,如 `A1B2C3D4E5`) |
| **Issuer ID** | ASC → Users and Access → Integrations → App Store Connect API(一个 UUID) |
| **vendorNumber** | J1 那里 |

### J4 — 建 App Store Connect 记录

ASC → **My Apps → + → New App**

- Platform: **iOS**
- Name: `JojoT` —— 被占了就**回报**,不要自己改名
- Primary language: **English (U.S.)**
- Bundle ID: J2 注册的那个
- SKU: `jojot-ios-001`
- User Access: Full Access

⚠️ **先别填描述、别传截图、别提审。** 元数据等文案定稿后一次性填,
现在 app 的文案还在改。

回报 URL 里那串数字 App ID,例如
`https://appstoreconnect.apple.com/apps/`**`6748291043`**`/...`

### J5 — 建三个订阅产品

ASC → 你的 app → **Monetization → Subscriptions**。

先建一个 Subscription Group,名字 `JojoT Premium`,里面建三个订阅。
**Product ID 必须和代码逐字一致**(代码在 `src/lib/purchases.ts`):

| Reference Name | Product ID | 周期 | 价格 USD |
| --- | --- | --- | --- |
| Premium Weekly | `jojot.premium.weekly` | 1 Week | 7.99 |
| Premium Monthly | `jojot.premium.monthly` | 1 Month | 14.99 |
| Premium Yearly | `jojot.premium.yearly` | 1 Year | 49.99 |

每个还必须填,否则到不了 `Ready to Submit`:

- **Subscription display name**
- **Description** —— ⚠️ **硬上限 55 字符**(后台实测,文档没写清)。建议:
  - Weekly / Monthly:`Every challenge, friends' lists, and daily photos.`(49)
  - Yearly:`A full year of every challenge and every feature.`(48)
- English (U.S.) 本地化
- 至少一档价格

⚠️ **暂时不要加 Introductory Offer / 免费试用。**
加不加试用会改变审核备注的写法,我要在一个地方统一决定。
如果 ASC 逼你选,选**不加**,并回报。

回报三个产品各自的状态(`Missing Metadata` / `Ready to Submit` / ...)。

### J6 — 生成 In-App Purchase Key ⚠️ 全流程风险最高的一步

这一步做错的后果:RevenueCat 显示 $0 收入、付费用户付了钱进不去 app,
而苹果那边**真的在扣钱**。而且不会报错,只能靠对账发现。

ASC → **Users and Access → Integrations**(顶部标签)→ 左侧 **Keys → In-App Purchase**

1. `+` 生成新 key,命名 `JojoT StoreKit`
2. 下载 `.p8` 文件 —— **只能下载一次**
3. 记下 **Key ID**

⚠️ **这个 key 必须用**本 app 专属的那个 Apple 账号**生成。**
**绝对不要复用其他项目或其他账号的 `.p8`。** StoreKit 2 下,
key 缺失或不属于本账号 = 交易静默丢失。

回报 Key ID + 确认 `.p8` 已下载并妥善保存(说清存哪了)。
⚠️ **不要把 `.p8` 的内容贴进 comms 或提交进仓库** —— 那是密钥。只说你拿到了。

---

### 还不能做的

**不要 Submit for Review。** 我这边还欠:

- 真实 RevenueCat 内购层(替掉 mock)
- App 图标
- 隐私政策 + 支持页托管(公网无登录可达)
- Supabase 后端 —— 让付费墙上「实时看朋友清单」「社群聊天」这两条**变成真的**
  (现在是硬编码假数据,审核员点进去就能发现,2.3.1 拒)
- 按新文案重出截图

这些完成后我会发 MSG-PM-002 说明可以提审了。

--- 需要你回的(标 Re: MSG-PM-001):
- [ ] J1 三项协议状态 + vendorNumber
- [ ] J2 bundle id 注册结果(或 `TAKEN`)
- [ ] J3 Team ID + Issuer ID
- [ ] J4 ASC App ID(数字)+ app 名是否被占
- [ ] J5 三个订阅产品各自状态
- [ ] J6 Key ID + `.p8` 是否已下载保存 + 是否用本账号生成
- [ ] 任何卡住的地方:照抄原始报错文字,别转述

---

## 【JojoT】MSG-PM-002 · PM → JA · 2026-08-09
Re: MSG-PM-001
Status: INFO

通道正式接上了。仓库换地址了,**以旧地址为准的任何东西都作废**。

### 仓库

```
https://github.com/waynekingwinner-blip/JojoT
```

**公开仓库,clone 不需要任何登录:**

```bash
git clone https://github.com/waynekingwinner-blip/JojoT.git
```

⚠️ 如果你之前 clone 过 `villacojerjp-byte/JojoT`,**把它删掉**。那个仓库停在
开工前的状态,落后十几个 commit:内购是假的、有竞品文案、图标是占位图、
还有会直接触发 2.3.1 的假数据页面。拿那份去打包基本必拒。

### 回信怎么写

你的收件箱是 `comms/ja-to-pm.md`,只往**末尾追加**,只 commit 这一个文件。

如果你这台机器没有本仓库的写权限(很可能没有),**不要卡在这里** ——
把回信内容直接给 King,他贴给我,一样走得通。通道形式不重要,信息到位就行。

### 隐私政策 / 支持页(已上线,J4 之后填元数据要用)

两个都已验证公网无登录可达,返回 200:

```
Support URL:  https://waynekingwinner-blip.github.io/JojoT/
Privacy URL:  https://waynekingwinner-blip.github.io/JojoT/privacy/
```

### 代码侧现状

✅ 已完成:真实内购(RevenueCat + StoreKit 2)、相机、分享卡片、本地通知、
App 图标、字体本地打包、隐私/支持页上线。付费墙上每一条卖点都对应真实功能。

⚠️ 范围已收窄:社群聊天和好友实时清单**从 v1.0 移除**。
前者是 UGC,要背 Guideline 1.2 的全套运营义务;后者原本是硬编码假数据,
留着就是 2.3.1。两者都等 v1.1 带后端再上。

### 打包(等我通知再做,现在别 Archive)

这台开发机**不接触任何 Apple 账号或证书** —— King 出于账号风险隔离的要求。
所以签名和上传全部由你在你自己机器上做:

```bash
npm install
cp .env.example .env.local     # 填 RevenueCat 的 appl_ key(King 给你)
npm run build && npx cap sync ios
open ios/App/App.xcworkspace   # 登你自己的 Apple 账号,自动签名,Archive
```

工程里 `DEVELOPMENT_TEAM` 故意留空、`CODE_SIGN_STYLE = Automatic`、
全仓库零 Team ID,Xcode 会自动填你的 team。

⚠️ `.env.local` 绝不提交。没填 key 的话付费墙会显示 "Subscriptions unavailable" ——
这是刻意设计的:宁可显示不可用,也不能白送 app 或显示编造的价格。

--- 需要你回的(标 Re: MSG-PM-002):
- [ ] 确认已从新地址 clone,旧仓库副本已删
- [ ] MSG-PM-001 的 J1~J6 结果

---

## 【JojoT】MSG-PM-003 · PM → JA · 2026-08-09
Re: MSG-JA(口头回报)
Status: OPEN

**你那两条提醒都是对的,第二条是我的错,已经改了。谢谢。**

### 更正:回报方式改了

MSG-PM-001 里我让你把 Team ID / Issuer ID / vendorNumber 写进
`comms/ja-to-pm.md`。**那条指令作废。** 本仓库是 public,写进去等于公开发布,
而 Team ID 恰恰是 Apple 账号之间最直接的关联标识 —— King 之所以要两台机器
隔离,防的就是这个。我把这些当成"内部标识"处理了,是我判断错。

新规则见 `comms/PROTOCOL.md` 里那张表。简版:

**❌ 走 King 私聊,不进仓库:**
Team ID · Issuer ID · Key ID · vendorNumber · 任何 `.p8` 内容 · 任何令牌

**✅ 可以写进 comms:**
状态词(Active / Ready to Submit / TAKEN)· ASC App ID(数字,上线后本来就公开)
· Bundle ID · 产品 ID 和价格 · 报错原文(**先抹掉里面的标识符**)

判断标准:**不愿意发在推特上的,就别写进 comms。**

已确认仓库全历史目前没有任何真实凭证,我们赶在你回报之前改掉了。

### 关于 git 回信通道

不用再试了,**你按 B 方案走**:把 MSG-JA-001 全文写好交给 King,他贴给我,我推。
通道形式不重要,信息到位就行 —— 而且现在看来,你读得到、写不了,
反而正好符合上面这条安全边界:敏感标识本来就不该经过这个仓库。

等 King 那边的凭证问题理顺了再说自动化。

### 你现在可以开始 J1~J6 了

回报模板:

```
## 【JojoT】MSG-JA-001 · JA → PM · <日期>
Re: MSG-PM-001
Status: DONE

J1  Paid Apps Agreement: <状态>
    Bank Account: <状态>
    Tax Form: <状态>
    vendorNumber: 【已私发 King,不写此处】
J2  Bundle ID: <注册成功的全文,或 TAKEN>
J3  Team ID / Issuer ID: 【已私发 King,不写此处】
J4  ASC App ID: <数字>
    App 名 JojoT 是否可用: <是/否>
J5  jojot.premium.weekly:  <状态>
    jojot.premium.monthly: <状态>
    jojot.premium.yearly:  <状态>
J6  Key ID: 【已私发 King,不写此处】
    .p8 已下载并保存: <是/否>
    是否用本 app 专属 Apple 账号生成: <是/否>

卡住的地方:
<报错原文,先抹掉标识符>
```

--- 需要你回的(标 Re: MSG-PM-003):
- [ ] 确认已按新规则处理敏感标识
- [ ] J1~J6 结果(按上面模板)

---

## 【JojoT】MSG-PM-007 · PM → JA · 2026-08-10
Re: MSG-JA-002
Status: OPEN

**RevenueCat 全部配置完成,可以打包了。**

- In-App Purchase Key(J6)已上传,✅ **Valid credentials**
  反向验证确认:JojoT **没有**复用 BendyGoal / jojotalk 的旧 key
- App Store Connect API Key(J7)已上传
- Entitlement:`premium`
- Offering:weekly $7.99 / monthly $14.99 / yearly $49.99,已设为 **current**
- Public SDK Key:**King 私发给你**(以 `appl_` 开头,不在本仓库)

你 J1~J7 的成果我全核过了,没有问题。三个订阅产品的审核截图那件事抓得好 ——
原本三个全缺,缺了会卡住提交。

### 打包

```bash
git pull
npm install
cp .env.example .env.local
# 把 King 给你的那行填进去:
#   VITE_REVENUECAT_IOS_KEY=appl_...
npm run build && npx cap sync ios
open ios/App/App.xcworkspace
```

Xcode:

1. **App** target → Signing & Capabilities → 登**你自己的** Apple 账号
   工程里 `DEVELOPMENT_TEAM` 故意留空、`CODE_SIGN_STYLE = Automatic`,
   Xcode 会自动填你的 team。King 要求 PM 这台开发机不接触任何 Apple 凭证。
2. 确认 **In-App Purchase** capability 在
3. 顶部设备选 **Any iOS Device (arm64)**
4. **Product → Archive**
5. Organizer → **Distribute App → App Store Connect → Upload**

版本号已设好:`MARKETING_VERSION 1.0.0` / `CURRENT_PROJECT_VERSION 1`。**别改。**

⚠️ **上传后别信 Xcode 的成功提示。** 等 5~15 分钟去 ASC → TestFlight,
确认 build 出现且 **processingState = VALID**。
如果 Xcode 报错但 ASC 里 build 已经在了 —— **那就是传上去了,不要重传**,
重传会撞重复提交。

⚠️ `.env.local` 绝不提交(已在 `.gitignore` 里)。

### 打包成功后

按 `comms/LAUNCH-PLAYBOOK.md` 走:

| 节 | 内容 |
| --- | --- |
| 2 | 元数据全文 ⚠️ Description 末尾 EULA 链接必须保留 |
| 3 | 截图用 `store-assets/iphone-6.9/`(1290×2796)⚠️ **不要用 `shots/`** |
| 4 | Age Rating:UGC = No,Medical = None |
| 5 | App Privacy:只勾 Identifiers + Purchases,均不用于追踪、不关联身份 |
| 6 | App Review Notes:硬付费墙 sandbox 解锁说明,原文照抄 |
| 8 | 提交前自查表,逐条打勾 |

### 🛑 停

自查表全绿后,在 `comms/ja-to-pm.md` 写一条 `Status: READY`。
**Submit for Review 等 King 明确下令,不要碰那个按钮。**

--- 需要你回的(标 Re: MSG-PM-007):
- [ ] build 已上传,且 ASC 里 processingState = VALID
- [ ] 元数据 / 截图 / 问卷 / 审核备注 全部填完
- [ ] 第 8 节自查表逐条结果
