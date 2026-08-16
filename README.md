# For Infinite Web（前端）

Vue 3 + Vite + TypeScript + Tailwind CSS，部署到 **GitHub Pages**（公开）。

> 后端在另一个**私有仓库** `for-infinite-server`，不要放在这里。

## 开发

```bash
npm install
npm run dev        # 本地开发，/api、/media 自动代理到 http://127.0.0.1:8787
```

## 构建与部署

GitHub Actions 会在 push 到 `main` 时自动构建并部署到 Pages。

- API 基地址在 `.env.production`（`VITE_API_BASE=https://api.kannalife.asia`）
- 仓库 Settings → Pages → Source 选 **GitHub Actions**

## 目录

```
src/
  main.ts / App.vue / router.ts
  lib/          # api、auth(密钥)、visitor(匿名身份)、time(世界观年换算)
  data/profile.ts   # 个人主页内容（技术栈/学习/兴趣/联系方式/友链/banner）
  components/    # BootSplash 开场、TopBar、LifeWidget(LIFE)
  views/         # 首页、博客、个人文章(钟表)、消息、后台
```
