# 站点"实时状态"与统计功能实现说明

> 用途：给朋友解释 / 未来写博客的素材。最后更新：2026-11-25。

## 一句话总览

网站本身是**纯静态页面**（Vue3 + Vite，托管在 GitHub Pages），不跑任何服务器。
所有"活数据"（电脑活动状态、GitHub 统计、网易云听歌）由**本机常驻的一个小程序**（快照守护进程）定时生产，然后"推"到网站上去。
公网入口拆成两个独立隧道：`status` 走会关机的 Windows 电脑，`api`（博客/后台/LIFE）走常驻的 Debian 主机。

## 架构图（文字版）

```
┌─ Windows（可关机）────────────────────┐        ┌─ Debian 常驻主机 ────────────────┐
│ FI-Tray ─► 守护进程(127.0.0.1:8790)   │        │ Fastify 后端 (127.0.0.1:8787)     │
│   ├ 每5秒抓前台窗口标题                 │        │  博客 / 后台 / LIFE               │
│   ├ 定时抓 GitHub / 网易云              │        │ cloudflared（api 隧道, systemd）  │
│   ├ git push 静态 JSON 回网站仓库       │        └───────────────┬───────────────────┘
│   └ cloudflared（status 隧道）          │                        │
└──────────────┬─────────────────────────┘                        │
               │ status.kannalife.asia/status                     │ api.kannalife.asia
               ▼                                                  ▼
        ┌────────────────────── Cloudflare 边缘 ──────────────────────┐
               ▲
               │  常驻后端不依赖 Windows；Windows 关机只影响状态卡
┌─ 网站（GitHub Pages 纯静态）──────────────┐
│  首页状态卡 / 博客 / 后台 / LIFE           │
│  数据文件: public/data/*.json（电脑推送）  │
└──────────────────────────────────────────┘
```

## 三大功能实现细节

### ① 电脑活动状态（"实时状态"）

1. 本机守护进程每 5 秒调用 Win32 API `GetForegroundWindow` + `GetWindowText` 抓取**当前前台窗口的标题**（PowerShell 通过 `-EncodedCommand` 以 UTF-16LE 传参避免中文乱码）。
2. 守护进程在 `127.0.0.1:8790` 开一个 HTTP 服务，通过 Windows 侧的 cloudflared 隧道把唯一路径 `/status` 暴露到 `https://status.kannalife.asia/status`，返回 `{online, status, mode, at}`。
3. 网站首页每 15 秒 fetch 一次该 JSON（`VITE_STATUS_BASE`），渲染成"当前状态"。
4. 两种模式可切换：`window`（自动抓窗口名）/ `custom`（固定自定义文本，保护隐私）。
5. 关键点：**公网只能访问这一个只读 JSON 路径**；守护进程的管理控制台只在回环地址，公网访问不到。

### ② GitHub 统计（WakaTime 风格语言条）

1. 守护进程定时调 GitHub REST API：逐个仓库拉 `/languages`（按字节数计算语言占比）。
2. contributions 走 GraphQL API（token 只存在本机 `.env`，从不进仓库、不上公网）。
3. 结果写成本地 JSON → `git commit + push` 推回网站仓库 → GitHub Actions 自动重新构建部署。
4. 前端读取静态 JSON 渲染语言条和提交热力图。
5. 核心思想：**统计是"离线生产、推送发布"**——网站永远只读静态文件，后端不需要在线。

### ③ 网易云"最近听歌"

1. 用浏览器里的登录 Cookie（MUSIC_U，从本机 Edge 用户数据里通过 DPAPI 解出）。
2. 官方接口不稳定，采用多个公开镜像（netease-cloud-music-api 系列）做轮询兜底。
3. 同样流程：抓数据 → 写 JSON → git push → Actions 部署 → 前端渲染。

## 安全设计

- 所有敏感信息（GitHub token、网易云 Cookie、后端密钥）只存在**主机本地的 .env**，公网接触不到。
- 两条隧道各自只放行必要的路径：status 隧道只放行 `/status`，api 隧道只转发到后端。
- 管理控制台仅回环可访问。
- 后台登录用单密码换 HMAC token，前端只存 `sessionStorage`——每次打开需重新输入、关页即失效。
- 博客正文渲染前过 DOMPurify 消毒。

## 国际化（中英双语）

- **技术**：vue-i18n v11（Composition API 模式），语言包在 `src/locales/zh.ts` 与 `en.ts`，中文为兜底语言。
- **首次检测**：读 `localStorage.fi-locale` → 无则看 `navigator.language`（以 `zh` 开头显示中文，否则英文）。
- **全局持久**：顶栏 `EN/中文` 按钮切换后写入 `localStorage`，跨页面、跨刷新全程保持同一语言。
- **文案结构**：界面文案用 `t('命名空间.键')`；数据内容（profile 简介、友链、技术栈、服务）在原字段旁加 `*En` 平行字段，模板里用 `pick(zh, en)` / `pickList()` 按当前语言取值。新增翻译只改语言包两个文件。

## 贡献图 / GitHub 数据（自托管快照）

- **来源**：守护进程用 GITHUB_TOKEN 调 GitHub GraphQL 拉取 `contributionCalendar.weeks`（每日贡献格子），同时抓用户/仓库/语言统计，全部写入 `public/data/github.json`（`grid`=365 天格子、`reposList`=项目列表、`langs`=语言统计、`contributions`=总数）。
- **前端策略**：`GhGrid`（贡献图）、`GhStats`（统计条）、`ProjectsView`（项目页）都是**快照优先**——先读本站 `github.json`，读不到才回退到第三方/官方 API。这样不受 GitHub 公开 API 被屏蔽、第三方限流的影响。
- **刷新周期**：默认 600 分钟自动抓取一次；控制台 `检测` 按钮或 `POST /api/detect` 可手动触发（抓完自动 git 推送快照 → Actions 重新部署）。
- **修复记录**：GitHub REST 请求全部带 token（匿名 60 次/小时限流曾导致语言统计只剩"1 语言"）。

## 博客后端（Debian 托管 · 2026-11 新架构）

> 说明：本节刻意**不写具体 IP / 主机名 / 端口**——完整运维细节（含网络地址与命令）保存在**私有仓库 `for-infinite-server` 的 docs 里**，不在公开仓库出现。

- **部署位置**：后端（Fastify）clone 到局域网内一台无头 Debian 主机，systemd 常驻，Node 22，监听回环地址（由同机的 cloudflared 转发）。
- **域名链路**：`api.kannalife.asia` 由 **Debian 主机上的 cloudflared 服务**承载（systemd），入口直接指向**同机回环端口**——因此不需要任何端口转发桥，也不受局域网 IP 变化影响；`/status` 则单独走 Windows 侧的隧道（见 ①）。
- **为什么拆成两条隧道**：api 的宿主（博客/LIFE/后台）在常驻的 Debian 上，Windows 关机不该影响它；而状态卡反映的就是 Windows 电脑本身，关机时显示离线是合理语义。两条隧道各自独立，互不牵连。
- **sharp 兼容**：老 CPU 与 sharp 预编译二进制不兼容（加载即 SIGILL）。已改为可选加载：默认不加载、不压缩图片；兼容机器设 `COMPRESS_MEDIA=1` 才启用 WebP 压缩。
- **后台登录**：单密码（后端 `.env` 的 `MASTER_KEY`）→ `POST /api/auth/login` 签发全权限 HMAC token；前端把 token 存 **sessionStorage**——每次打开页面需重新输入密码、关闭页面即失效。
- **文件管理**：`/api/admin/files`（列表/读取/上传/删除，仅 .md），目录 = `content/blog/`——上传的 .md 直接成为博客文章；"快速创建文章"复用 `/api/admin/articles`（自动生成 frontmatter）。未解锁访客看不到任何页面结构（标题/分区均在解锁分支内）。
- **两个仓库分工**：
  - **公开仓库 `for-infinite-web`**：前端 + 快照数据（守护进程把 `public/data/github.json`、`netease.json` 提交推送到这里，推送后 Actions 自动重新部署）；
  - **私有仓库 `for-infinite-server`**：后端代码 + 文章内容（`content/`，git 跟踪）+ 运维细节文档。

## 稳定性：自愈机制

- **看门狗**：守护进程每 30 秒端到端探测 `https://status.kannalife.asia/status`，连续失败且距上次重启超 2 分钟 → 自动重启 Windows 侧隧道进程。
- **进程守护**：cloudflared 异常退出 → 5 秒自动拉起；Debian 侧隧道由 systemd `Restart=on-failure` 兜底。
- **日志落盘**：守护进程 events.log + 隧道 cf.log，故障可回溯。
- 国内网络直连 Cloudflare 边缘（QUIC/UDP）不稳：Windows 侧隧道经本机代理出墙；Debian 侧用 `http2` 传输（QUIC 在此网络下会超时）。

## 文件清单

| 位置 | 作用 |
|---|---|
| `fi-runtime\snapshot\daemon.mjs` | 守护进程本体（抓取/上传/状态服务/看门狗） |
| `fi-runtime\snapshot\FI-Tray.exe` | 托盘控制程序 |
| `fi-runtime\snapshot\daemon.vbs` | 启动脚本（计划任务调用） |
| `fi-runtime\cloudflared\config.yml` | Windows 侧 status 隧道入口规则 |
| Debian `/etc/cloudflared/config.yml` | Debian 侧 api 隧道入口规则（systemd `cloudflared` 服务） |
| 网站 `public\data\github.json` / `netease.json` | 推送上去的静态数据 |
| 网站 `src\lib\i18n.ts` | 语言检测 / 持久化 / `t()` / `pick()` |
| 网站 `src\lib\api.ts` | `API_BASE` / `STATUS_BASE` 两个入口常量 |
| 网站 `src\locales\zh.ts` / `en.ts` | 中英文语言包 |
| 网站 `public\_headers` | index.html 禁止缓存（防止旧哈希资源 404 导致白屏） |
| 本机部署脚本目录 | Debian 后端部署/探针脚本（scp + ssh 执行） |
| Debian 主机后端目录 | Fastify 后端（博客/后台/文件管理，systemd 常驻） |
