import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages 项目站点部署在子路径 /car-drive/ 下，构建时 base 需与之匹配；
// 本地 dev 仍用 '/'，避免 localhost 带前缀。
// 用 GITHUB_PAGES 环境变量区分：deploy 脚本会设置 GITHUB_PAGES=1 后再 build。
const base = process.env.GITHUB_PAGES ? '/car-drive/' : '/';

export default defineConfig({
  root: '.',
  base,
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
  plugins: [
    VitePWA({
      // 子路径部署：SW 与 manifest 的 scope/start_url 都基于 base 自动推导
      registerType: 'autoUpdate',
      injectRegister: 'auto', // 自动注入 SW 注册，无需改 main.js
      manifest: {
        name: '岚图知音 · 驾考练习模拟器',
        short_name: '驾考练习',
        description: '基于真实车辆参数的 90° 俯视驾考练习模拟器',
        theme_color: '#0c1018',
        background_color: '#0c1018',
        display: 'standalone',
        orientation: 'any',
        scope: base,
        start_url: base,
        icons: [
          { src: `${base}icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: `${base}maskable.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 缓存全部构建产物（JS/CSS/SVG/HTML）
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: 'index.html',
      },
      devOptions: {
        enabled: false, // dev 不启用 SW，避免缓存干扰调试
      },
    }),
  ],
});
