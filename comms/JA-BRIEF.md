# JA 复活简报 —— JojoT

> JA 如果失忆了,读这一份就能恢复上下文。**PM 负责维护本文件的准确性。**
> 最后更新:2026-08-08 by PM

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

## 当前进度(2026-08-08)

✅ 已完成
- iOS 平台已加,`xcodebuild` 模拟器编译通过
- 真实相机拍进度照(照片只存本机,不上传)
- 分享卡片(1080×1350,含 75 天点阵)
- 每日本地提醒
- 清掉了竞品 Her 75 的文案

❌ 未完成 —— **这些没做完之前不许提审**
- **内购还是 mock**:`src/lib/purchases.ts` 里 `buy()` 假装成功。现在提审 = 3.1.1 拒
- **付费墙有 2 条卖点是假的**:「实时看朋友清单」「社群聊天」目前是硬编码假数据,
  需要 Supabase 后端。现在提审 = **2.3.1 元数据不实**拒
- App 图标没做(现在是 Capacitor 默认占位图)
- 隐私政策 / 支持页没托管
- 截图要按新文案重出

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
