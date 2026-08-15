# v1.1 社交功能 · 苹果合规清单

> King 2026-08-14 拍板:v1.1 引入社交(好友互看清单),必须符合苹果规矩。
> 本清单是 v1.1 提审前的硬门槛 —— 任何一条没打勾就不能提交。

## 范围声明(决定了义务边界)

✅ 有:好友互看清单(双向确认)· 邀请码 · 分享开关(RLS 强制)
❌ 无:开放聊天 · 陌生人发现 · 公开内容 · 评论点赞私信

聊天若未来要加,回看 1.0 时砍掉它的原因:Guideline 1.2 全套 + 持续运营义务。

## 必须新建的功能

- [x] **App 内删除账号**(5.1.1v,强制)—— You → Account → Delete account,delete_account() 级联清 + 删 auth 用户,权限已实测
      设置 → Delete account:删 profile(级联清 participations/day_entries/
      friendships/auth_links)+ supabase.auth 注销 + 本地状态清空。
      不许做成"发邮件申请"。
- [x] **移除好友** UI —— 好友卡片 → Manage → Remove friend
- [x] **举报好友**:reports 表已建,举报即自动断开好友;
      承诺 24h 内处理(1.2 的"及时移除"义务)
- [x] **文字过滤**:contentFilter.ts,出口全覆盖(display_name / 任务文本 / 挑战名)
      过基础脏词表,提交侧拦截
- [x] 登录:仅 Sign in with Apple,登录可选,nonce 流程已实现

## 必须修改的 1.0 文案(否则全是 2.3.1)

- [x] **隐私政策已重写**(仓库中;⚠️ **v1.1 提审当天才执行 vercel deploy** —— 线上必须继续如实描述 1.0):
      现在写"no accounts, no server, never uploaded" —— v1.1 后不成立。
      要如实写:账号(Apple 登录)、上传的数据(名字/清单勾选/水/步数)、
      好友可见范围、删除方式。
      **保留**:进度照片只存本机、无 analytics、无广告(这些仍为真)。
- [ ] **商店描述**改 "YOUR PICTURES STAY YOURS" 一段(照片不上传仍为真,
      但"no account and no server"要删)
- [ ] **App Privacy 隐私问卷重答**:
      新增 = User Content(清单文字)· Health & Fitness(水/步数)·
      Identifiers(不变)· 名字(display name)
      各项:App Functionality / 不追踪;"Linked to you"要重新评估
      (有账号后,数据是关联到用户的 → 大概率变 "Data Linked to You")
- [ ] **年龄分级重答**:User-Generated Content 1.0 答的是 No,
      v1.1 有好友可见的用户文字 → 如实改答,分级可能变化
- [ ] 支持页 FAQ 增补:如何删账号、如何举报/移除好友

## 提审时

- [ ] 审核备注更新:说明社交为好友双向确认制、无公开内容、
      举报/拉黑/删除账号的入口路径(审核员会找)
- [ ] 版本号先升(1.0.0 过审后 train 关闭)

## 数据库侧(已完成/待补)

- [x] RLS:分享开关是数据库强制,不是 UI 隐藏
- [x] 好友删除策略
- [x] reports 表 + RLS
- [x] delete_account() 函数(含 auth.users 删除,权限实测通过)

## 老用户数据迁移(King 2026-08-14 确认的行为)

- 升级不动本地数据:localStorage + 照片全保留,不登录 = 和 1.0 完全一样
- **登录可选**:只有用好友功能才需要账号,不强迫老用户开户
- 首次登录跑回填:本地 logs → day_entries(逐天,含历史)、
  挑战 → participations(started_on 用**原始**开始日期,进度不清零)、
  名字 → display_name
- 照片永不上传(卖点 + 政策承诺)
- 登录后服务器兼作备份:重装 → 再登录 → ensure_profile 靠 Apple sub
  认回原档案 → 历史从服务器恢复
- [x] 开发项:backfill 模块已实现(src/lib/sync.ts)。幂等;冲突规则
      定为【只填空缺】—— 1.0 本地数据无时间戳,按天比新旧不可实现,
      服务器已有的天绝不覆盖,当天数据靠日常 pushDay 收敛
