# comms 协议 —— JojoT

两台电脑上的两个 agent 通过这个文件夹协作上线。

## 角色

| 代号 | 机器 | 职责 |
| --- | --- | --- |
| **PM** | 开发机 | 写代码、`npm run build`、`cap sync`、Xcode Archive、上传 build、用 ASC API 亲验 |
| **JA** | 账号机 | Apple Developer / App Store Connect:建 App、订阅产品、密钥、版本、截图、元数据、审核备注、Submit for Review |

## 规矩

- **PM 只写 `pm-to-ja.md`;JA 只写 `ja-to-pm.md`。** 各自**只在文件末尾追加**,不改对方的文件,不改历史消息。
- 写前 `git pull --rebase --autostash`,写后**只 commit + push 自己那个文件**。这样永不冲突。
- **每条消息标题必须标 app 名**:`【JojoT】MSG-PM-001 …`。JA 同时管 King 的多个 app,不标会搞混。
### ⚠️ 这是一个**公开仓库** —— 写进 comms = 公开发布

> 2026-08-09 JA 指出:PM 原先要求把 Team ID / Issuer ID / vendorNumber
> 写进 `ja-to-pm.md`,而本仓库是 public,那等于公开这些标识。PM 的错,已修正。
> 规则从「密钥不进 comms」扩大为下面这张表。

**❌ 绝不进 comms —— 走 King 私聊转交:**

| 字段 | 为什么 |
| --- | --- |
| `.p8` 文件内容 | 私钥,等同账号万能钥匙 |
| RevenueCat secret key(`sk_`) | 同上 |
| GitHub PAT | 同上 |
| **Team ID** | **账号关联标识。King 的整个隔离策略就是不让多个 Apple 账号被关联,公开它等于自己把线连上** |
| **Issuer ID** | ASC API 凭证的一半 |
| **Key ID** | 与 Issuer ID 组合起来就是 2/3 个凭证 |
| **vendorNumber** | 财务报表标识 |

**✅ 可以进 comms:**

- 状态词:`Active` / `Ready to Submit` / `Missing Metadata` / `TAKEN`
- **ASC App ID**(app 上线后本来就在 App Store 链接里,不是秘密)
- **Bundle ID**(会打进每个包,不是秘密)
- 产品 ID、价格、周期(这些本来就要在商店公开)
- 问题描述和报错原文 —— 但**先把里面的标识符抹掉**

**判断标准:如果你不愿意把它发在推特上,就别写进 comms。**

RevenueCat 的 **public SDK key(`appl_` 开头)**是个例外 —— 它设计上就要打进客户端,
不是秘密。但也没必要写进 comms,`.env.local` 里放着就行。
- 每条消息末尾给对方一个可勾选的「需要你回的」清单,回复时标 `Re: <消息 id>`。
- 编号各自递增:PM 发的用 `MSG-PM-NNN`,JA 回的用 `MSG-JA-NNN`。
- **最终 Submit for Review 永远等 King 当面点头**,agent 不自作主张。

## 消息格式

```
## 【JojoT】MSG-<SENDER>-<NNN> · <Sender> → <Receiver> · <date>
Re: <上一条 id 或 —>
Status: OPEN | DONE | INFO

<正文>

--- 需要你回的(标 Re: <id>):
- [ ] …
```

## 失忆了怎么办

JA 读 `comms/JA-BRIEF.md` 恢复上下文(app 名、账号、ASC App ID、当前进度)。
PM 读仓库根目录的 `README.md` + `comms/pm-to-ja.md` 自己发过的最后几条。
