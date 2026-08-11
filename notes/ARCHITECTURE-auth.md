# 身份与后端可移植性 —— 建表之前必须先定死的约束

> 决定日期:2026-08-11 · 决定人:King · 记录:PM
> **这条约束必须在写第一张表之前落实。事后再改就是全量数据迁移。**

---

## King 的要求(原话意思)

> 可以用 Supabase 原生的授权登录,**但不能依赖它的原生 ID** ——
> 以后要能换到别的平台,而不需要它那个 ID。

## 结论

**Supabase 的 `auth.users.id` 是实现细节,不是我们的身份。**

业务数据永远不外键到它。

---

## Schema

```sql
-- 我们自己的身份。主键由我们生成,可移植。
create table profiles (
  id               uuid primary key default gen_random_uuid(),
  auth_provider    text not null,      -- 'apple' | 'google' | ...
  provider_subject text not null,      -- Apple 的 sub,换后端也不变
  display_name     text,
  created_at       timestamptz default now(),
  unique (auth_provider, provider_subject)
);

-- 全项目【唯一】出现 Supabase auth id 的地方
create table auth_links (
  supabase_uid uuid primary key references auth.users(id) on delete cascade,
  profile_id   uuid not null references profiles(id) on delete cascade
);

create index on auth_links (profile_id);
```

**所有业务表只外键到 `profiles.id`。**

```sql
-- ✅ 对
create table day_entries (
  profile_id uuid not null references profiles(id) on delete cascade,
  ...
);

-- ❌ 错 —— 这样就被 Supabase 锁死了
create table day_entries (
  user_id uuid not null references auth.users(id),
  ...
);
```

---

## 两个身份锚点,都不在 Supabase 手里

| 锚点 | 来源 | 换后端后是否还在 |
| --- | --- | --- |
| `profiles.id` | **我们自己生成的 UUID** | ✅ 在,它就是我们的数据 |
| `provider_subject` | Apple 的 `sub`,**绑 Apple Team 而非后端** | ✅ 在,只要 Team ID 不变 |

所以就算 `auth_links` 整张表丢了,也能靠 Apple 的 `sub` 把每个用户重新认回来。

## 迁移时要做什么

1. 把 `profiles` 和所有业务表导出(它们本来就不依赖 Supabase)
2. 在新平台重新做登录,拿到新的 auth id
3. 用 `(auth_provider, provider_subject)` 重新匹配到 `profiles.id`
4. 重建映射表

**业务数据一行都不用改。**

---

## 代价(要认)

Supabase 的 RLS 默认用 `auth.uid()`。走了这层间接之后要加一个辅助函数:

```sql
create function current_profile_id() returns uuid
language sql stable security definer as $$
  select profile_id from auth_links where supabase_uid = auth.uid()
$$;
```

RLS 策略写成:

```sql
create policy "own rows" on day_entries
  using (profile_id = current_profile_id());
```

**代价:每次策略求值多一次索引查询,策略稍微复杂一点。**
换来的是随时能搬家。King 明确要这个,值得。

> ⚠️ 别把 `current_profile_id()` 写成 `volatile`,否则每行都会重算。
> 用 `stable` 让 Postgres 在一次查询里只算一次。

---

## 顺带定下的两条

**进度照片不进 Supabase Storage。** 继续只存设备本地 —— 既是隐私卖点
(隐私政策里已经写死"从不上传"),也少一堆要迁移的东西。

**Supabase 一家够用。** Auth + Postgres + Realtime + Edge Functions 覆盖了
v1.1 好友同步的全部需求。推送(朋友完成任务时通知)要走 APNs,
可以用 Edge Function 触发,但那是 v1.1 之后的事。
