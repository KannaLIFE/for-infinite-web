# For Infinite 委员会 · 官网前端

[For Infinite 委员会](https://kannalife.github.io/for-infinite-web/) 官网的单页应用（SPA）前端源码。纯静态构建，托管于 GitHub Pages，动态数据由「快照 + 推送」模式离线生产。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Vue 3（Composition API + `<script setup>`）+ TypeScript |
| 构建 | Vite 6，`@vitejs/plugin-vue` |
| 样式 | Tailwind CSS v4（`@tailwindcss/vite` 插件，无 postcss 配置，主题变量在 `src/style.css`） |
| 路由 | vue-router 4，**hash 模式**（`createWebHashHistory`）——Pages 无服务端重写，必须 hash 才不丢路径 |
| 国际化 | vue-i18n v11 Composition 模式（`legacy: false`），语言包 `src/locales/{zh,en}.ts` |
| Markdown | marked 渲染 + DOMPurify 消毒（博客正文） |
| 字体 | Zpix 像素字体（`src/assets/Zpix.ttf`，随构建打包） |

## 架构

```
[ 快照守护进程（本机，常驻） ]──定时抓取 GitHub / 网易云──► git push
        │ 另托管 cloudflared 隧道                            │
        ▼                                                    ▼
https://api.kannalife.asia ──► Fastify 后端（私有仓库）  public/data/*.json
        ▲ 首页 15s 轮询 /status                                    │
        └──────────► 纯静态站点（GitHub Pages） ◄── Actions 自动部署 ┘
```

- **站点本体零服务器**：前端只读静态 JSON（`public/data/{github,netease}.json`）与公开 API；
- **快照优先渲染**：贡献图 / 语言统计 / 项目页先读本地 `github.json`，读不到才回退官方 API——避开匿名限流与第三方不稳；
- **后端**（Fastify，私有仓库 `for-infinite-server`）经 Cloudflare Tunnel 提供 `api.kannalife.asia`：博客文章、后台管理、消息解锁。公网仅暴露 `/status` 与后端路径，管理面只监听 127.0.0.1。

## 环境变量

| 变量 | 含义 | CI 值 |
|---|---|---|
| `VITE_BASE` | 部署基路径（`vite.config.ts` 的 `base`） | `/for-infinite-web/` |
| `VITE_API_BASE` | 后端 API 源站 | `https://api.kannalife.asia` |

`.env.production` 已提交（只含公开域名，无密钥）；本地 `.env.*.local` 被 gitignore。

## 开发

```bash
npm install
npm run dev
```

Vite dev server 在 5173 端口，`/api`、`/media` 代理到 `http://127.0.0.1:8787`（本机后端 / 回环转发桥），前端开发无需改任何地址。

## 构建与部署

```bash
npm run build   # 产物在 dist/
```

push 到 `main` 触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：`npm install → vite build → upload-pages-artifact → deploy-pages`。`concurrency: pages` 保证并发的快照推送只保留最新一次部署。

注意：本地构建与 CI 构建产物哈希不同属预期——CI 注入 `VITE_BASE`，所有资源路径带 `/for-infinite-web/` 前缀。站点根 `public/_headers` 对 `index.html` 设 `Cache-Control: no-cache`，防止浏览器缓存旧 HTML 引用已失效的哈希资源导致白屏。

## 目录结构

```
src/
  components/   # 通用组件（GhGrid/GhStats/NeteaseCard/BootSplash/...）
  views/        # 各路由页（Home/Projects/Blog/Messages/Admin/...）
  data/         # 静态数据（profile/projects/friends/tech/...，双语平行字段）
  lib/          # api/i18n/auth/backend/time/visitor 等基础库
  locales/      # zh.ts / en.ts 语言包
public/
  data/         # 守护进程推送的快照 JSON（github.json / netease.json）
  _headers      # Pages 响应头（index.html 禁缓存）
docs/
  site-architecture.md   # 架构说明（公开脱敏版；运维细节在私有仓库 docs/server-ops.md）
```

## 国际化约定

- 界面文案用 `t('namespace.key')`；**注意 `@` 是 vue-i18n 链接语法保留字符**，消息里不能出现 `@{user}` 形式的字面量，需改用 `{user}` 并显式传参；
- 数据内容（简介 / 友链 / 项目说明）在原字段旁加 `*En` 平行字段，模板里用 `pick(zh, en)` / `pickList()` 取值；
- 语言选择存 `localStorage.fi-locale`，首访按 `navigator.language` 自动检测；`src/lib/i18n.ts` 同步维护 `<html lang>` 与 meta description。

## 安全要点

- 仓库内**不含任何密钥**：GitHub token、网易云 Cookie、后端密码等一律在本机 `.env`，从不入库；
- 后台解锁 token 只存 `sessionStorage`（关页即失效）；消息/后台的解锁逻辑由后端 HMAC 签发；
- 博客正文渲染前过 DOMPurify；访客未解锁时页面结构（标题/分区）不渲染，防内容闪现泄露。

更多细节见 [docs/site-architecture.md](docs/site-architecture.md)。
