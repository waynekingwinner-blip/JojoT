# JojoT 数据字典

> Supabase 项目 `JojoT`(xpbwnritftdtrnxytuhq)· schema `public`
> **维护规则:任何 migration 改动 schema,同一个 commit 更新本文件。**
> 最后核对:2026-08-15(与线上逐字段核对)

关系一览:
`profiles 1—1 auth_links` · `profiles 1—N participations 1—N day_entries`
· `profiles N—N profiles`(经 `friendships` / `reports`)

## profiles — 用户档案

| 字段 | 类型 | 可空 | 默认值 | 约束 | 说明 |
|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | **PK** | 应用内唯一身份,自主生成(可移植铁律) |
| auth_provider | text | NO | — | UQ①-1 | 当前恒为 'apple' |
| provider_subject | text | NO | — | UQ①-2 | Apple 稳定用户标识(sub) |
| display_name | text | YES | — | — | 写入前经内容过滤 |
| created_at | timestamptz | NO | now() | — | |
| share_lists | boolean | NO | true | — | 分享开关,RLS 引用 |
| invite_code | text | YES | 触发器生成 | UNIQUE | 8 位,BEFORE INSERT 自动填充 |

UQ① = UNIQUE (auth_provider, provider_subject)

## auth_links — 身份映射(客户端零访问;全库唯一引用 Supabase 身份处)

| 字段 | 类型 | 可空 | 约束 |
|---|---|---|---|
| supabase_uid | uuid | NO | **PK** · FK → auth.users(id) CASCADE |
| profile_id | uuid | NO | FK → profiles(id) CASCADE · IDX |

## participations — 挑战参与

| 字段 | 类型 | 可空 | 默认值 | 约束 | 说明 |
|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | **PK** | |
| profile_id | uuid | NO | — | FK → profiles CASCADE | |
| challenge_key | text | NO | — | — | 'hard' / 'custom-xxx' 等 |
| challenge_name | text | NO | — | — | 展示名(冗余),经过滤 |
| total_days | integer | NO | — | CHECK 1..366 | |
| started_on | date | NO | — | — | 原始开始日期(回填保留) |
| is_active | boolean | NO | true | 部分唯一 IDX (profile_id) WHERE is_active | 每人仅一个进行中 |
| created_at | timestamptz | NO | now() | — | |

## day_entries — 每日打卡 ⚡ Realtime 推送

| 字段 | 类型 | 可空 | 默认值 | 约束 | 说明 |
|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | **PK** | |
| participation_id | uuid | NO | — | FK → participations CASCADE · UQ②-1 | |
| profile_id | uuid | NO | — | FK → profiles CASCADE · IDX (profile_id, day_no) | 冗余列,供 RLS/Realtime |
| day_no | integer | NO | — | CHECK >=1 · UQ②-2 | 挑战第 N 天 |
| tasks | jsonb | NO | '[]' | — | [{id,text,done,done_at}] |
| water_ml | integer | NO | 0 | CHECK >=0 | |
| steps | integer | NO | 0 | CHECK >=0 | |
| updated_at | timestamptz | NO | now() | — | upsert 冲突键 UQ② |

UQ② = UNIQUE (participation_id, day_no)

## friendships — 好友关系

| 字段 | 类型 | 可空 | 默认值 | 约束 | 说明 |
|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | **PK** | |
| requester | uuid | NO | — | FK → profiles CASCADE · UQ③-1 | 发起方 |
| addressee | uuid | NO | — | FK → profiles CASCADE · UQ③-2 · IDX (addressee,status) | 被邀方 |
| status | text | NO | 'pending' | CHECK IN (pending,accepted) | 仅被邀方可 accept(RLS) |
| created_at | timestamptz | NO | now() | — | |
| responded_at | timestamptz | YES | — | — | |

CHECK (requester <> addressee);UQ③ = UNIQUE (requester, addressee)

## reports — 举报(仅可写入,任何用户不可读)

| 字段 | 类型 | 可空 | 默认值 | 约束 | 说明 |
|---|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | **PK** | |
| reporter | uuid | YES | — | FK → profiles **SET NULL** | 举报人删号后记录保留 |
| reported | uuid | NO | — | FK → profiles CASCADE | |
| reason | text | NO | — | CHECK length 1..500 | |
| created_at | timestamptz | NO | now() | — | |

## 存储过程(全部 SECURITY DEFINER,仅 authenticated 可执行)

| 函数 | 用途 |
|---|---|
| ensure_profile(provider, subject, name) | 登录后建档;靠 Apple sub 认回老用户 |
| request_friend_by_code(code) | 邀请码加好友 |
| pending_requests() | 待接受请求列表(带请求者名字) |
| delete_account() | 级联删号,含 auth.users(5.1.1v) |
| current_profile_id() / is_friend(uuid) | RLS 策略内部使用 |
