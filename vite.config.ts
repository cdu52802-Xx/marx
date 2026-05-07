import { defineConfig } from 'vite';

export default defineConfig({
  base: '/marx/', // GitHub Pages 子路径：cdu52802-Xx.github.io/marx/
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
