import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // GitHub Pages 子路径：用户主页 '/'，项目页 '/<repo>/'（由 VITE_BASE 控制）
  base: process.env.VITE_BASE || '/',
  server: {
    port: 5173,
    // 中文用户名路径会被 Vite 的 fs 检查误判，关闭严格检查（仅影响本地 dev）
    fs: { strict: false },
    proxy: {
      // 本地开发时把 /api 与 /media 代理到后端，避免跨域
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
      '/media': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
});
