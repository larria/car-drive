import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: '.',
  // 相对路径，使产物可从 file:// 直接打开
  base: './',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    // 将 JS/CSS 内联进单个 index.html，避免 file:// 下 ESM CORS 限制
    // 配合 viteSingleFile 插件生成单一可离线打开的文件
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [viteSingleFile()],
});
