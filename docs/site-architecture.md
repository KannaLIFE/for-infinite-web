# 站点"实时状态"与统计功能实现说明

> 用途：给朋友解释 / 未来写博客的素材。最后更新：2026-10-13。

## 一句话总览

网站本身是**纯静态页面**（Vue3 + Vite，托管在 GitHub Pages），不跑任何服务器。
所有"活数据"（电脑活动状态、GitHub 统计、网易云听歌）由**本机常驻的一个小程序**（快照守护进程）定时生产，然后"推"到网站上去。
公网只暴露一个极小的状态接口。

## 架构图（文字版）

```
┌─ 你的电脑 ────────────────────────────────┐
│                                          │
│  FI-Tray（托盘小图标）─控制─► 守护进程(8790)│
│        ▲                │                │
│        │                ├─ 每5秒: Win32 API 抓前台窗口标题
│        │                ├─ 定时: GitHub REST/GraphQL
│        │                ├─ 定时: 网易云接口（浏览器Cookie）
│        │                ├─ git push 静态 JSON 回网站仓库
│        │                └─ 启动 cloudflared 隧道
│                                          │
│  cloudflared ──(TUN 代理出墙)──► Cloudflare 边缘
└──────────────────────────┬───────────────┘
                           │ 隧道（公网只放行 /status 一个路径）
                           ▼
        https://api.kannalife.asia/status  ← JSON: {online,status,mode,at}
                           ▲
                           │ 每15秒轮询
┌─ 网站（GitHub Pages 纯静态）──────────────┐
│  首页实时状态卡片 / GitHub语言条 / 听歌卡  │
│  数据文件: public/data/*.json（由电脑推送）│
└──────────────────────────────────────────┘
```

## 三大功能实现细节

### ① 电脑活动状态（"实时状态"）

1. 本机守护进程每 5 秒调用 Win32 API `GetForegroundWindow` + `GetWindowText` 抓取**当前前台窗口的标题**（PowerShell 通过 `-EncodedCommand` 以 UTF-16LE 传参避免中文乱码）。
2. 守护进程在本机 127.0.0.1:8790 开一个 HTTP 服务，通过 Cloudflare 隧道把唯一路径 `/status` 暴露到公网，返回 `{online, status, mode, at}`。
3. 网站首页每 15 秒 fetch 一次该 JSON，渲染成"当前状态"。
4. 两种模式可切换：`window`（自动抓窗口名）/ `custom`（固定自定义文本，保护隐私）。
5. 关键点：**公网只有一个只读 JSON 端点**；守护进程的管理控制台只监听 127.0.0.1，公网访问不到。

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

- 所有敏感信息（GitHub token、网易云 Cookie、密钥）只存在**本机 .env**，公网永远接触不到。
- 隧道入口做了精确收窄：公网只能访问 `/status`；模糊路径（如 `/foo/status`）一律 404。
- 管理控制台仅 127.0.0.1 可开。
- 网页上的解锁（消息/后台）采用 HMAC 签名的临时 token，由后端按日签发，前端无法伪造。

## 稳定性：自愈机制

- **看门狗**：守护进程每 30 秒端到端探测公网 `/status`，连续失败且距上次重启超 2 分钟 → 自动重启隧道进程。
- **进程守护**：cloudflared 异常退出 → 5 秒自动拉起。
- **日志落盘**：守护进程 events.log + 隧道 cf.log，故障可回溯。
- 国内网络直连 Cloudflare 边缘（QUIC/UDP 7844）不稳，隧道经本机 Clash TUN 模式出墙；`hosts` 固定了边缘真实 IP 以绕开 fake-ip DNS；Windows 路由表收窄为只让边缘 IP 段进 TUN，避免拖慢其他流量。

## 文件清单

| 位置 | 作用 |
|---|---|
| `fi-runtime\snapshot\daemon.mjs` | 守护进程本体（抓取/上传/状态服务/看门狗） |
| `fi-runtime\snapshot\FI-Tray.exe` | 托盘控制程序 |
| `fi-runtime\snapshot\daemon.vbs` | 启动脚本（计划任务调用） |
| `fi-runtime\cloudflared\config.yml` | 隧道入口规则 |
| `fi-runtime\server\` | Fastify 后端（消息/后台/文章，按需开启，平时关机） |
| 网站 `public\data\github.json` / `netease.json` | 推送上去的静态数据 |
