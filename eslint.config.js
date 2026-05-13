import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  prettierConfig,
  {
    ignores: [
      'dist/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'coverage/',
      // M4 T0: M3 demo 存档是 vite build 产物 (minified JS / map),不应被 lint
      'public/m3-archive/',
      // M4 closure fix #1 (2026-05-13): gstack 装在 .claude/skills/ 时自动创建
      // .claude/worktrees/<name>/ 含独立 tsconfig.json,typescript-eslint 不知道
      // 用哪个 root tsconfig → 70 个 "No tsconfigRootDir set" parsing errors.
      // 不属于 Marx 代码 / 不需要 lint。
      '.claude/',
    ],
  },
];
