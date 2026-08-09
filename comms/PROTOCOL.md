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
- **密钥绝不进 comms。** `.p8` / RevenueCat secret key / API private key 一律不许贴。Key **ID** 可以,key **内容**不行。
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
