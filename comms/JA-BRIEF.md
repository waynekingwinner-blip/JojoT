# JA 复活简报 —— JojoT

> JA 如果失忆了,读这一份就能恢复上下文。**PM 负责维护本文件的准确性。**
> 最后更新:2026-08-09 by PM

## 这是什么 app

**JojoT** —— 75 天挑战打卡 App。选一个挑战(75 Hard / 75 Medium / 75 Soft /
Glow Within / Better Me / Sugar Free / Mental Wellness,或自建),每天勾完一张
待办清单,追踪喝水、步数、每日进度照片,并能看到朋友的清单。

技术栈:**React + Vite + Capacitor 6**(不是 Expo,**没有 EAS**)。
出包走 **Xcode Archive**,不是 `eas build`。

## 账号与标识

| 项 | 值 |
| --- | --- |
| Apple 开发者账号 | `wangjyca@gmail.com`(已付 $99,Active) |
| Bundle ID(拟) | `com.jojot.app` |
| ASC App ID | **未创建**(见 MSG-PM-001 的 J4) |
| Team ID | 未知,待 JA 回报 |
| Issuer ID | 未知,待 JA 回报 |
| vendorNumber | 未知,待 JA 回报 |
| GitHub 仓库 | `villacojerjp-byte/JojoT`,工作分支 `main` |

## 订阅产品(硬付费墙,无免费层)

| Product ID | 周期 | 价格 |
| --- | --- | --- |
| `jojot.premium.weekly` | 1 周 | $7.99 |
| `jojot.premium.monthly` | 1 月 | $14.99 |
| `jojot.premium.yearly` | 1 年 | $49.99 |

订阅由 **Apple IAP + RevenueCat** 处理,entitlement 名 `premium`。

## 当前进度(2026-08-09)

✅ 代码侧已完成
- iOS 平台,`xcodebuild` 模拟器编译通过
- 真实相机拍进度照(照片只存本机,不上传)
- 分享卡片(1080×1350,含 75 天点阵)
- 每日本地提醒
- App 图标(点阵,已验证无 alpha 通道)
- 字体本地打包(不再依赖 Google CDN)
- 隐私政策 + 支持页(已写好在 `docs/`,**尚未托管**)
- **真实内购:RevenueCat + StoreKit 2 已接入**,mock 已移除
- 付费墙每一条卖点都对应真实功能(砍掉了社群聊天和好友实时清单)

⚠️ 范围变更(重要)
- **社群聊天已移除** —— 开放群聊属于 UGC,触发 Guideline 1.2
  (发布前过滤 / 举报入口 / 拉黑 / 公开联系方式 / 及时处理举报),
  是持续运营义务,v1.0 不做
- **好友实时清单已移除** —— 原本是硬编码假数据,留着就是 2.3.1。
  等 Supabase 后端做完,v1.1 再上

❌ 还缺(不是 JA 的活,但影响提审时机)
- RevenueCat 后台配置 + Public SDK Key(King 在弄,手册 `notes/REVENUECAT-SETUP.md`)
- 隐私/支持页托管上线(GitHub Pages),且必须 **curl 无登录态验证返回 200**
- App Store 截图:仓库里 `shots/` 是 860×1760 的预览图,
  **不是商店资产**。商店要 iPhone 6.9″ **精确 1290×2796**,尺寸差一点就拒
- `MARKETING_VERSION` 定版

## PM 这边的构建约定(2026-08-09 确认)

King 出于账号风险隔离的考虑,**PM 这台机器不接触任何 Apple 账号/证书/私钥**。

- 工程里 `DEVELOPMENT_TEAM` 故意不设,`CODE_SIGN_STYLE = Automatic`,全仓库零 Team ID
- **JA 在自己机器上 clone(仓库是公开的,不需要登录)、登自己的 Apple 账号、
  Xcode 自动签名、Archive、上传**
- 构建命令:
  ```bash
  npm install
  cp .env.example .env.local   # 填入 RevenueCat 的 appl_ key
  npm run build && npx cap sync ios
  open ios/App/App.xcworkspace
  ```
- ⚠️ **`.env.local` 绝不提交**。没填 key 的话付费墙会显示
  "Subscriptions unavailable" —— 这是刻意的:宁可显示不可用,
  也不能白送 app 或者显示编造的价格

## 版本号纪律

⚠️ **某个版本号一旦过审,那条 pre-release train 永久关闭**,之后同版本号的包
上传会被苹果**静默丢弃**(报 90062 / 90186)。
规矩:**每次过审后立刻把 `MARKETING_VERSION` 升上去**。

Capacitor 项目里版本号在 `ios/App/App.xcodeproj/project.pbxproj` 的
`MARKETING_VERSION` 和 `CURRENT_PROJECT_VERSION`,由 **PM 负责改**。

## 收不到钱的头号原因

RevenueCat 的 **In-App Purchase Key 必须是 `wangjyca@gmail.com` 这个账号生成的**。
用了别的账号的 key,StoreKit 2 下**交易根本不会被记录** —— RevenueCat 显示 $0,
苹果实际在扣钱,付费用户进不去 app。详见 `docs/REVENUECAT-SETUP.md` 第 3 步。
