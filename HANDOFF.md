# HANDOFF — JojoT

更新:2026-08-17 深夜(交班)

## 当前最重要的事实

- **1.0 已重新提交审核(2026-08-17 9:57 PM),这次带上了三个订阅**
  - Submission ID `d94ca59b-…`,五项条目:iOS App 1.0.0 + JojoT Premium 组 + weekly/monthly/yearly
  - 版本和三个订阅全部 `WAITING_FOR_REVIEW`(API 已终验)
  - 背景:8/12 那次全 API 提交**静默漏掉了订阅**(API 无法挂订阅,只能网页 Add for Review),
    排了 5 天队后发现,撤单重提。教训已写进 `~/.claude/skills/ios-ship`
  - 过审后 King 手动点 Release(设置的是手动发布);**过审后立刻把 MARKETING_VERSION 升上去**
- **TestFlight 当前最新 build 13**(1.1.0),beta 审核大概率已过
  - build 13 = 一小时令牌过期修复(visibilitychange 重启 supabase auto-refresh + Friends 页回前台重拉 + 取码失败显示 Retry 卡)
  - King 验证方法:开 App 看到邀请码 → 退后台 1 小时+ → 回来码应该还在
- 邀请码流:Friends 页顶部卡片 + Add 弹窗内显示 + "Invite a friend" 系统分享(带 App Store 链接 id6799851593 + 码)
  - King 账号的码:W9PNXA6A(profile "Ja")
  - ⚠️ App Store 链接要 1.0 上架后才有效;测试期朋友装 App 用 TestFlight 公共链接

## 本轮做完的(build 6→13)

- 35 姿势剪影库:按 King 提供的带格线大图逐格切割(投影探测格线),第 3 行整行重切(轮子/脚被行漂移切掉过)
- 挑战卡 7×4 全部填图、瓷砖图形垂直+水平居中(原来底部对齐导致宽姿势沉底)
- 付费墙第 4 格(舞者)、开场 3 屏 12 格、You 页三个灵感板 18 格全部填满 —— **King 明确要求:不留空白格**
- 真机去掉假 9:41 状态栏(网页预览/商店截图仍保留)
- 邀请码三连修:位置(顶部)+ 会话竞态重试 + 令牌过期自愈

## 待办(优先级序)

- ✅ Small Business Program 已办(King 2026-08-17 确认)—— 抽成 15%
- ✅ build 13 令牌过期修复验证通过(退后台 1h+ 邀请码仍在)

1. 等 1.0 审核结果(队列从 8/17 晚起算);过审 → King 点 Release;被拒 → 拒审正文只能网页看(Messages 区),让 King 截图
2. 两台设备真机跑通好友请求/接受/实时同步(任务 #3 收尾,King + 朋友)
3. v1.1 提交闸门(notes/V1_1-COMPLIANCE.md):部署新隐私政策(docs/ 已改好未部署)、
   商店描述加好友卖点、隐私问卷重答(User Content / Health&Fitness)、年龄分级 UGC 重答、
   新截图(1290×2796 含 Friends 屏)、**提交包必须去掉 VITE_BETA_UNLOCK**
4. v1.1 提交时:订阅那时应已随 1.0 过审,无需再挂;但要跑 ios-ship 新增的"提交后订阅状态必查"

## v1.2+ 构想

- **Superwall 付费墙实验**(King 2026-08-18 拍板记录):
  - 费用:月归因收入 <$10k 免费,超后只对付费墙归因收入收 1%;与 RevenueCat 官方支持共存(SW 管墙面实验,RC 管订阅记账)
  - 门槛:Capacitor 版插件(Capawesome 社区维护)要求 **Cap ≥8**,我们锁在 Cap 6 → 需先做全家升级(purchases-capacitor、apple-sign-in、全部 @capacitor/* 插件 + iOS 工程对齐,约一天 + 全量回归)
  - 触发时机:有稳定流量后(参考:日装 50+)再做,现在接了没有实验对象
- 暖色摄影风视觉方向(King 的照片风格参考图留作营销素材)

## 关键坐标

- ASC App ID 6799851593 · beta 组 c9d65841-e28d-4cae-8571-83f6ae854685 · key 5USM77X8HV(Admin)
- asc.py 在 scratchpad(会被清理,丢了按 ios-ship 手册重建,openssl 签 ES256)
- 流水线:npm build → e2e 27 项 + check:mono → cap sync → xcodebuild archive/export(Team BU7JA5XVUH 命令行注入)→ altool → VALID 轮询 → 加密豁免 → 挂组 → betaAppReviewSubmissions
- Supabase 项目 xpbwnritftdtrnxytuhq;my_invite_code() RPC 已上线(migrations 已镜像)
