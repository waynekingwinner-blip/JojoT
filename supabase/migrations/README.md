# Migrations

数据库:Supabase 项目 `JojoT`(org: JojoT App)

| 文件 | 库内版本号 | 怎么应用的 |
| --- | --- | --- |
| `20260813_identity_foundation.sql` | (不在 migration 历史里 —— King 经 SQL Editor 手工执行) | 2026-08-13 |
| `20260814_social_schema.sql` | `20260814134207` | PM 经 MCP apply_migration |
| `20260814_security_hardening.sql` | `20260814134300` | 同上 |

规则(notes/ARCHITECTURE-auth.md):业务表只外键 `profiles.id`,
`auth.users.id` 只出现在 `auth_links`。换后端时业务数据一行不动。
