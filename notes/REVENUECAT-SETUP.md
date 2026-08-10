# RevenueCat 注册与配置(JojoT)

给 King 的操作手册。**从上往下做**,标了 ⚠️ 的地方是踩过坑的,别跳。

有些步骤依赖 Devin 那边的产出(见 `DEVIN.md`),我在每步标了依赖。

---

## 为什么要用 RevenueCat

苹果原生 StoreKit 你得自己处理收据校验、订阅状态、跨设备恢复、续订/退款事件。
RevenueCat 把这些收进一个 SDK + 后台,免费额度到 **月流水 $2,500** 才开始收费
(超出部分抽 1%)。对刚上线的 App 等于免费。

---

## 第 1 步 — 注册账号(现在就能做,无依赖)

1. 打开 https://app.revenuecat.com/signup
2. 用邮箱注册。**建议用你的主邮箱,不要用 Apple 开发者账号那个邮箱** ——
   那个是苹果开发者账号,混在一起以后转让或授权会麻烦。
3. 邮箱验证。
4. 首次登录会让你建一个 **Project**:
   - Project name: `JojoT`
   - 建完记住这个项目,后面所有配置都在里面

---

## 第 2 步 — 添加 iOS App(依赖:Devin 的 **D2** 确认 bundle id)

左侧 **Project Settings → Apps → + New App**

| 字段 | 填什么 |
| --- | --- |
| Platform | **App Store** |
| App name | `JojoT` |
| Bundle ID | `com.jojot.app`(以 Devin D2 回报的为准) |

⚠️ **Bundle ID 必须和 Xcode 里的完全一致,一个字符都不能差。**
现在代码里是 `com.jojot.app`(见 `capacitor.config.ts`)。
如果 Devin 回报说这个 id 被占了,**先等我改代码,别自己在 RevenueCat 里编一个**。

---

## 第 3 步 — 配 In-App Purchase Key ⚠️ 最容易出事的一步

**依赖:Devin 的 D6**(他会给你 Key ID,并把 `.p8` 文件存好)

这一步做错的症状极其阴险:RevenueCat 后台一堆 customer 连进来,但
**Active Subscriptions / MRR 全是 0**,而苹果那边**真的在扣钱**。
付费用户付了钱进不去 App,你还以为没人买。

根因:`react-native-purchases` / `purchases-capacitor` 新版走 **StoreKit 2**,
**没有有效的 In-App Purchase Key,交易根本不会被记录**。

### 操作

1. RevenueCat → **Apps → 点 JojoT 这个 app 名字**
2. 找到 **In-app purchase key configuration**
3. 点 **Add new key** —— ⚠️ **不是 `Select existing key`**
   (复用别的项目的 key 是最经典的坑,界面会显示 `⚠️ Credentials need attention`,
   交易照样全丢)
4. 上传 Devin 给你的 `.p8` 文件,填 **Key ID** 和 **Issuer ID**
   (Issuer ID 也在 Devin 的 D3 回报里)
5. ⚠️ **保存按钮在整页最底部,要滚到底**,很多人没看见以为存了
6. 确认状态变成 **✅ Valid credentials**
7. **刷新页面再看一次** —— 确认真的存住了

### 怎么验证真的对了

点 `Select existing key` 下拉,看旧 key 的 "Used by ..." 列表 ——
**JojoT 应该不在里面**。如果一个 key 显示 "Used by A, B, JojoT",那是危险信号,
每个 App 必须用**自己账号生成的专属 key**。

---

## 第 4 步 — 建 Entitlement

左侧 **Product catalog → Entitlements → + New**

| 字段 | 填什么 |
| --- | --- |
| Identifier | `premium` |
| Description | `Full access to JojoT` |

⚠️ **`premium` 这个名字必须和代码里写的完全一致。**
我会在 `src/lib/purchases.ts` 里用 `premium`。
(踩过的坑:代码写 `pro`、后台建的是 `premium`,结果所有付费用户都解锁不了。)

---

## 第 5 步 — 建 Products(依赖:Devin 的 **D5**)

左侧 **Product catalog → Products → + New Product**,建三个。
Product ID 必须和 App Store Connect 里的**逐字一致**:

| Product ID | 说明 |
| --- | --- |
| `jojot.premium.weekly` | 周订阅 $7.99 |
| `jojot.premium.monthly` | 月订阅 $14.99 |
| `jojot.premium.yearly` | 年订阅 $49.99 |

建完,**每一个都要 attach 到 `premium` 这个 entitlement 上**。
没挂上 = 用户买了但拿不到权限。

> 小提示:ASC 里产品状态还是 `Missing Metadata` 也没关系,
> RevenueCat 这边可以先按 ID 建好。

---

## 第 6 步 — 建 Offering

左侧 **Product catalog → Offerings → + New Offering**

| 字段 | 填什么 |
| --- | --- |
| Identifier | `default` |
| Description | `JojoT paywall` |

进去以后加三个 **Package**,用 RevenueCat 的标准标识符:

| Package | 挂哪个 product |
| --- | --- |
| `$rc_weekly` | `jojot.premium.weekly` |
| `$rc_monthly` | `jojot.premium.monthly` |
| `$rc_annual` | `jojot.premium.yearly` |

⚠️ **最后把这个 Offering 设为 `Current`**(列表页有个 "Make current" 的动作)。
不设 current,App 里 `getOfferings()` 拿回来的是空的,付费墙会没有价格。

---

## 第 7 步 — 把 Public SDK Key 给我

左侧 **Project Settings → API Keys**

复制 **App Store** 那一行的 **Public SDK Key**(以 `appl_` 开头)。

把它贴给我,我写进代码。

> ✅ 这个 key 是**公开**的,设计上就是要打进客户端的,泄露不影响安全。
> ❌ 但 **Secret API Key**(以 `sk_` 开头)绝对不能给我、不能进代码、不能进 git。

---

## 做完自查

- [ ] Project `JojoT` 建好
- [ ] App 加好,bundle id 与 Xcode 一致
- [ ] In-App Purchase Key 显示 **✅ Valid credentials**,且刷新后仍在
- [ ] 这个 key 是本 app 专属 Apple 账号生成的,没和别的项目共用
- [ ] Entitlement `premium` 存在
- [ ] 三个 product 都建好,且都挂在 `premium` 上
- [ ] Offering `default` 是 **current**,三个 package 都挂好
- [ ] Public SDK Key(`appl_...`)已经给我

---

## 上线后必须做的对账

上线 48 小时后,**别信 RevenueCat 的仪表盘,去查苹果的账**:

ASC → Sales and Trends,或用 App Store Connect API 的 `salesReports`
(需要 vendorNumber,Devin 的 D1 会回报)。

两边数字对不上 = In-App Purchase Key 有问题,回第 3 步。
这不是杞人忧天 —— 真实案例是 RevenueCat 显示 $0、苹果实际收了 $97。
