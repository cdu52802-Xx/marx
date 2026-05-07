# Marx 星图 V1 MVP · Milestone 1 · 项目骨架 + Hello World deploy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 Marx 星图项目骨架（Vite + TS + D3）+ 跑通 GitHub Pages 自动部署链路 + 在线 URL 能看到 2 节点（Marx + Engels）+ 1 连线，证明 vibe coding 工作流（init → data → render → test → deploy）整链跑通。

**Architecture:** Vite + TypeScript + D3.js + 原生 DOM 静态网页（无前端框架，跟朋友 [philosophy_vis](https://github.com/Sia12345678/philosophy_vis) 同栈）。M1 数据**硬编码 2 节点**（M2 替换为 SPARQL 拉的 JSON）。测试 vitest（单元）+ Playwright（e2e）。部署 GitHub Actions → GitHub Pages。

**Tech Stack:** Vite ^5.0 / TypeScript ^5.4 / D3.js ^7.9 / vitest ^1.5 / Playwright ^1.43 / ESLint ^8 / Prettier ^3 / GitHub Actions

**Upstream（产品决议）:** [Design doc](../specs/2026-05-07-marx-star-map-design.md) / [PRD v0.3](../docs/PRD.md) / [PRD § 8 DR-007 静态网页技术栈](../docs/PRD.md)

**Downstream:** M2 plan（数据 schema + SPARQL 阶段 A）等 M1 完成后再写

**Out of scope · M1 不做**：实际节点数据（M2/M3）/ 5 色编码 + 节点筛选（M4）/ 时间轴（M4）/ 详情卡 panel（M4）/ 后来者旁注（M4）/ 地理图（M5）/ UI/UX 视觉细节（M6）

---

## 执行前 · 0 代码 PM 准备工作 checklist

> 这一节给 vibe coding 模式下 0 代码基础的 PM 看，列出执行 M1 plan 之前**必须先准备好的环境 + 最低必备知识**。仅列概述，每条详细操作另开窗口问，不占用主项目上下文。

### 1. 必装软件（如已装跳过）

| 软件 | 用途 | 怎么验证已装 | 推荐版本 |
|---|---|---|---|
| **Git** | 版本管理 + push 到 GitHub | `git --version` | 2.30+ |
| **Node.js** | JS 运行时 + npm（Task 1 起必需） | `node --version` | 20 LTS（推荐 nvm 管理多版本） |
| **GitHub CLI（gh）** | 命令行操作 GitHub | `gh --version` | 项目已配置 cdu52802-Xx |
| **VS Code 或 Cursor** | 写代码 / 跑 vibe coding agent | 桌面看到图标 | 最新 |
| **Chrome 或 Edge** | 前端调试 + 看在线 URL | 浏览器已开 | 最新 |

**可选但推荐**：GitHub Desktop（图形化 git）/ Windows Terminal（多 tab 终端）。

### 2. 必备最低操作技能（不会就先学，再回来执行 M1）

| 技能 | 用途 | 学习时长 |
|---|---|---|
| 命令行 `cd` / `ls` / `mkdir` | 切目录、看目录、建目录 | ≤ 30 min |
| `npm install` / `npm run X` | 装依赖 / 跑脚本 | ≤ 30 min |
| `git status` / `add` / `commit` / `push` / `pull` | 版本管理 5 个核心动作 | ≤ 1 hour |
| GitHub 网页找 repo 的 Settings / Actions / Pages | 改配置 + 看 workflow 跑 | ≤ 30 min |
| 浏览器 DevTools 看 Console + Network | 前端调试基本盘 | ≤ 30 min |

### 3. Vibe coding 工作模式（agent 视角）

| 场景 | 怎么做 |
|---|---|
| **执行 M1 plan** | 在 Claude Code / Cursor / Codex CLI 里说"按 `plans/2026-05-07-marx-star-map-m1-project-skeleton.md` 执行 Task N"，agent 按 step 跑 |
| **跨 session 续接** | 新 session 第一句让 agent 先读 `AGENTS.md` + 最新 takeaway + 当前 plan 文件 |
| **Plan 跟踪** | plan 里 `- [ ]` checkbox，agent 完成 step 会勾 `- [x]`，你看 checkbox 进度判断完成度 |
| **代码看不懂** | 让 agent 用「0 代码 PM」沟通基线（类比 + 白话）讲清楚每行代码 / 每个 config / 每个报错 |
| **遇到坑** | 让 agent 先解释问题 + 给 2-3 个方案 + 推荐一个；**不要直接让 agent 删文件 / 强制重启** |

### 4. 手动必做的事（agent 做不了，必须用户亲手）

- **Task 7 Step 2** · GitHub repo Settings > Pages > Source 选 "GitHub Actions"（一次性手动设置）
- **Task 8 Step 3** · 部署完手动开浏览器访问在线 URL 验视觉效果
- **Task 9 Step 5** · 把在线 URL 发给 3-5 个访谈对象，收 mockup 形态校验反馈（提醒系统节点 ②）

> **重要**：详细操作流程（怎么装 Node.js / 怎么用 git / 怎么用 Claude Code 跟 plan / 怎么看 GitHub Actions log 等）请去**其他窗口**问，不在本项目主对话里展开，节省主项目上下文空间。

---

## File Structure（M1 范围内创建/修改的文件）

```
marx/
├── .github/workflows/
│   └── deploy-pages.yml          ★ 新建 - GitHub Pages 自动部署
├── src/
│   ├── main.ts                   ★ 新建 - 入口，调用 renderRelations()
│   ├── types/
│   │   └── Node.ts               ★ 新建 - M1 最小节点类型（M4 扩展为 5 类）
│   ├── data/
│   │   └── m1-skeleton.ts        ★ 新建 - 硬编码 2 节点 + 1 关系（M2 替换为 JSON loader）
│   └── viz/
│       └── relations.ts          ★ 新建 - M1 简单 D3 force 渲染（M4 扩展）
├── tests/
│   └── unit/
│       └── relations.test.ts     ★ 新建 - vitest 单元测试
├── e2e/
│   └── deploy.spec.ts            ★ 新建 - Playwright e2e 测试
├── index.html                    ★ 新建 - Vite 入口
├── package.json                  ★ 新建
├── tsconfig.json                 ★ 新建
├── vite.config.ts                ★ 新建
├── vitest.config.ts              ★ 新建
├── playwright.config.ts          ★ 新建
├── eslint.config.js              ★ 新建（flat config，ESLint 9+ 风格）
├── .prettierrc                   ★ 新建
└── README.md                     ☆ 修改 - 加 M1 节描述
```

**.gitignore 已经覆盖** `node_modules/` `dist/` `build/`，无需修改。

---

## Task 1: Vite + TypeScript 项目骨架

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`

- [ ] **Step 1: npm init**

```bash
npm init -y
```

然后用 Edit 工具修改 `package.json` 加 `"type": "module"` + scripts：

```json
{
  "name": "marx-star-map",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 4173"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
npm install --save-dev vite typescript @types/node
```

Expected：node_modules 创建，package-lock.json 创建，无错误。

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2022", "DOM"],
    "types": ["vite/client", "node"],
    "noEmit": true,
    "allowImportingTsExtensions": false
  },
  "include": ["src", "tests", "e2e", "*.ts", "*.config.ts"]
}
```

- [ ] **Step 4: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/marx/', // GitHub Pages 子路径：cdu52802-Xx.github.io/marx/
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

- [ ] **Step 5: 创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Marx 星图 · M1</title>
  </head>
  <body>
    <main>
      <h1>Marx 星图 · M1 项目骨架原型</h1>
      <svg id="relations-svg" width="600" height="400" data-testid="relations-svg"></svg>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: 创建 src/main.ts（M1 占位入口）**

```typescript
console.log('[Marx M1] entry');
```

- [ ] **Step 7: 跑 dev server 验证**

```bash
npm run dev
```

Expected: 控制台显示 `Local: http://localhost:5173/marx/`，浏览器打开后看到 H1 标题 + 一个空 SVG，DevTools console 打印 `[Marx M1] entry`。

按 Ctrl+C 停 dev server。

- [ ] **Step 8: 跑 build 验证**

```bash
npm run build
```

Expected: `dist/` 目录创建，含 `index.html`（base 路径 `/marx/`）+ `assets/`。

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src/main.ts
git commit -m "feat(M1): Vite + TypeScript 项目骨架"
```

---

## Task 2: 节点类型 + 硬编码 2 节点数据

**Files:**
- Create: `src/types/Node.ts`
- Create: `src/data/m1-skeleton.ts`

- [ ] **Step 1: 创建 src/types/Node.ts（M1 最小节点类型）**

```typescript
// M1 最小节点类型 - M4 会扩展为 5 类节点（人/著作/事件/概念/地点）
// 当前仅含 M1 demo 必需字段

export type NodeType = 'person'; // M4 扩展为 'person' | 'work' | 'event' | 'concept' | 'place'

export interface Node {
  id: string;
  type: NodeType;
  name_zh: string;
  name_orig: string;
  birth_year?: number;
  death_year?: number;
}

export type RelationType = 'friend_collaborator'; // M4 扩展为 8 类关系

export interface Relation {
  source: string;
  target: string;
  type: RelationType;
}

export interface Dataset {
  nodes: Node[];
  relations: Relation[];
}
```

- [ ] **Step 2: 创建 src/data/m1-skeleton.ts（硬编码 Marx + Engels）**

```typescript
import type { Dataset } from '../types/Node.ts';

export const m1Dataset: Dataset = {
  nodes: [
    {
      id: 'marx',
      type: 'person',
      name_zh: '卡尔·马克思',
      name_orig: 'Karl Marx',
      birth_year: 1818,
      death_year: 1883,
    },
    {
      id: 'engels',
      type: 'person',
      name_zh: '弗里德里希·恩格斯',
      name_orig: 'Friedrich Engels',
      birth_year: 1820,
      death_year: 1895,
    },
  ],
  relations: [
    {
      source: 'marx',
      target: 'engels',
      type: 'friend_collaborator',
    },
  ],
};
```

- [ ] **Step 3: Commit**

```bash
git add src/types/ src/data/
git commit -m "feat(M1): 节点类型 + 硬编码 Marx+Engels 2 节点数据"
```

---

## Task 3: D3 force-directed 关系图渲染

**Files:**
- Create: `src/viz/relations.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: 安装 D3.js**

```bash
npm install d3
npm install --save-dev @types/d3
```

- [ ] **Step 2: 创建 src/viz/relations.ts**

```typescript
import * as d3 from 'd3';
import type { Dataset, Node, Relation } from '../types/Node.ts';

interface SimNode extends d3.SimulationNodeDatum, Node {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  type: Relation['type'];
}

export function renderRelations(svgSelector: string, dataset: Dataset): void {
  const svg = d3.select<SVGSVGElement, unknown>(svgSelector);
  if (svg.empty()) {
    throw new Error(`renderRelations: SVG not found at "${svgSelector}"`);
  }

  const width = +(svg.attr('width') ?? 600);
  const height = +(svg.attr('height') ?? 400);

  // 清空已有内容（M2+ 重新渲染时需要）
  svg.selectAll('*').remove();

  const simNodes: SimNode[] = dataset.nodes.map((n) => ({ ...n }));
  const simLinks: SimLink[] = dataset.relations.map((r) => ({
    source: r.source,
    target: r.target,
    type: r.type,
  }));

  const simulation = d3
    .forceSimulation<SimNode>(simNodes)
    .force(
      'link',
      d3
        .forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance(150),
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const linkGroup = svg
    .append('g')
    .attr('class', 'links')
    .selectAll<SVGLineElement, SimLink>('line')
    .data(simLinks)
    .join('line')
    .attr('stroke', '#888')
    .attr('stroke-width', 2)
    .attr('data-testid', 'relation-line');

  const nodeGroup = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll<SVGCircleElement, SimNode>('circle')
    .data(simNodes)
    .join('circle')
    .attr('r', 20)
    .attr('fill', '#7c5dbe') // M4 会替换为 5 色编码（M1 暂用单一紫色）
    .attr('data-testid', 'node-circle')
    .attr('data-node-id', (d) => d.id);

  const labelGroup = svg
    .append('g')
    .attr('class', 'labels')
    .selectAll<SVGTextElement, SimNode>('text')
    .data(simNodes)
    .join('text')
    .text((d) => d.name_zh)
    .attr('font-size', 12)
    .attr('text-anchor', 'middle')
    .attr('dy', 35)
    .attr('data-testid', 'node-label');

  simulation.on('tick', () => {
    linkGroup
      .attr('x1', (d) => (d.source as SimNode).x ?? 0)
      .attr('y1', (d) => (d.source as SimNode).y ?? 0)
      .attr('x2', (d) => (d.target as SimNode).x ?? 0)
      .attr('y2', (d) => (d.target as SimNode).y ?? 0);
    nodeGroup.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0);
    labelGroup.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);
  });
}
```

- [ ] **Step 3: 修改 src/main.ts（连接渲染 + 数据）**

```typescript
import { renderRelations } from './viz/relations.ts';
import { m1Dataset } from './data/m1-skeleton.ts';

console.log('[Marx M1] entry');
renderRelations('#relations-svg', m1Dataset);
```

- [ ] **Step 4: 跑 dev server 验证**

```bash
npm run dev
```

Expected: 浏览器 localhost:5173/marx/ 显示 SVG 里 2 个紫色圆（Marx + Engels）+ 1 条灰色连线，每个圆下面有中文名 label。Force-directed 布局让 2 节点稳定在合理距离。

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/viz/ src/main.ts
git commit -m "feat(M1): D3 force-directed 渲染 2 节点 + 1 连线"
```

---

## Task 4: vitest 单元测试

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/unit/relations.test.ts`
- Modify: `package.json`（加 `test` script）

- [ ] **Step 1: 安装 vitest + jsdom**

```bash
npm install --save-dev vitest @vitest/ui jsdom
```

- [ ] **Step 2: 创建 vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: 修改 package.json 加 test script**

修改 scripts，加：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 4173",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: 写失败测试 tests/unit/relations.test.ts**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import * as d3 from 'd3';
import { renderRelations } from '../../src/viz/relations.ts';
import { m1Dataset } from '../../src/data/m1-skeleton.ts';

describe('renderRelations · M1', () => {
  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="600" height="400"></svg>';
  });

  it('throws when svg selector not found', () => {
    expect(() => renderRelations('#nonexistent', m1Dataset)).toThrow(/SVG not found/);
  });

  it('renders 2 node circles for M1 dataset', () => {
    renderRelations('#test-svg', m1Dataset);
    const circles = document.querySelectorAll('[data-testid="node-circle"]');
    expect(circles.length).toBe(2);
  });

  it('renders 1 relation line for M1 dataset', () => {
    renderRelations('#test-svg', m1Dataset);
    const lines = document.querySelectorAll('[data-testid="relation-line"]');
    expect(lines.length).toBe(1);
  });

  it('attaches data-node-id matching dataset ids', () => {
    renderRelations('#test-svg', m1Dataset);
    const circles = Array.from(document.querySelectorAll('[data-testid="node-circle"]'));
    const ids = circles.map((c) => c.getAttribute('data-node-id')).sort();
    expect(ids).toEqual(['engels', 'marx']);
  });

  it('renders Chinese name labels', () => {
    renderRelations('#test-svg', m1Dataset);
    const labels = Array.from(document.querySelectorAll('[data-testid="node-label"]'));
    const names = labels.map((l) => l.textContent).sort();
    expect(names).toEqual(['卡尔·马克思', '弗里德里希·恩格斯']);
  });
});
```

- [ ] **Step 5: 跑测试 → 应该全部 pass（因为 Task 3 已实现）**

```bash
npm test
```

Expected: 5/5 测试 pass。如果有 fail，回 Task 3 检查 `renderRelations` 实现里 `data-testid` 属性 / 渲染逻辑。

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/
git commit -m "test(M1): vitest 单元测试覆盖 renderRelations"
```

---

## Task 5: Playwright e2e 测试

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/deploy.spec.ts`
- Modify: `package.json`（加 `e2e` script + `e2e:install`）
- Modify: `.gitignore`（加 `playwright-report/` `test-results/`）

- [ ] **Step 1: 安装 Playwright**

```bash
npm install --save-dev @playwright/test
```

- [ ] **Step 2: 安装 Playwright 浏览器二进制（首次必须）**

```bash
npx playwright install chromium
```

Expected: 下载 Chromium 浏览器（~170MB）。

- [ ] **Step 3: 创建 playwright.config.ts**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/marx/',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/marx/',
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
```

- [ ] **Step 4: 修改 package.json 加 e2e scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 4173",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "e2e:install": "playwright install chromium"
  }
}
```

- [ ] **Step 5: 修改 .gitignore 加 playwright artifacts**

在末尾追加：

```
# === Playwright ===
playwright-report/
test-results/
```

- [ ] **Step 6: 写 e2e 测试 e2e/deploy.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Marx 星图 M1 · 在线部署形态校验', () => {
  test('页面标题正确', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Marx 星图/);
  });

  test('SVG 容器存在', async ({ page }) => {
    await page.goto('/');
    const svg = page.getByTestId('relations-svg');
    await expect(svg).toBeVisible();
  });

  test('渲染 2 个节点圆', async ({ page }) => {
    await page.goto('/');
    // 等 force-directed 模拟稳定
    await page.waitForTimeout(500);
    const circles = page.getByTestId('node-circle');
    await expect(circles).toHaveCount(2);
  });

  test('渲染 1 条关系连线', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const lines = page.getByTestId('relation-line');
    await expect(lines).toHaveCount(1);
  });

  test('显示中文标签', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const labels = page.getByTestId('node-label');
    await expect(labels.filter({ hasText: '卡尔·马克思' })).toHaveCount(1);
    await expect(labels.filter({ hasText: '弗里德里希·恩格斯' })).toHaveCount(1);
  });
});
```

- [ ] **Step 7: 跑 e2e 测试**

```bash
npm run e2e
```

Expected: Playwright 自动 build → 启 preview server → 跑 5 个 test 全部 pass。

如果有 fail，常见原因：
- preview server 端口冲突（修 playwright.config.ts 里 port）
- force simulation 还没稳定（增加 waitForTimeout）
- base path 不对（验证 vite.config.ts `base: '/marx/'` 跟 Playwright `baseURL` 一致）

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json playwright.config.ts e2e/ .gitignore
git commit -m "test(M1): Playwright e2e 覆盖部署形态校验"
```

---

## Task 6: ESLint + Prettier

**Files:**
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Modify: `package.json`（加 `lint` `format` scripts）

- [ ] **Step 1: 安装 ESLint + Prettier 相关包**

```bash
npm install --save-dev eslint @eslint/js typescript-eslint prettier eslint-config-prettier eslint-plugin-prettier
```

- [ ] **Step 2: 创建 eslint.config.js（ESLint 9+ flat config）**

```javascript
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
    ignores: ['dist/', 'node_modules/', 'playwright-report/', 'test-results/', 'coverage/'],
  },
];
```

- [ ] **Step 3: 创建 .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

- [ ] **Step 4: 修改 package.json 加 lint + format scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 4173",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "e2e:install": "playwright install chromium",
    "lint": "eslint . --max-warnings=0",
    "format": "prettier --write ."
  }
}
```

- [ ] **Step 5: 跑 format（让现有代码统一风格）**

```bash
npm run format
```

Expected: prettier 重新格式化 src / tests / e2e / *.config.ts 文件，输出格式化后的文件列表。

- [ ] **Step 6: 跑 lint 验证**

```bash
npm run lint
```

Expected: 0 error 0 warning。如果有 warning（unused vars / etc），修掉。

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json eslint.config.js .prettierrc src/ tests/ e2e/
git commit -m "chore(M1): ESLint flat config + Prettier 统一代码风格"
```

---

## Task 7: GitHub Pages 部署 workflow

**Files:**
- Create: `.github/workflows/deploy-pages.yml`

- [ ] **Step 1: 创建 .github/workflows/deploy-pages.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: GitHub 仓库设置（一次性，手动）**

打开浏览器到 `https://github.com/cdu52802-Xx/marx/settings/pages`：

1. 在 **Build and deployment** 节里
2. **Source** 选 `GitHub Actions`（不是 Deploy from a branch）
3. 不需要选 branch（Actions 会接管）

> 这一步必须手动做，agent 没办法操作 GitHub repo 设置。

- [ ] **Step 3: Commit workflow**

```bash
git add .github/
git commit -m "ci(M1): GitHub Pages 自动部署 workflow"
```

---

## Task 8: 第一次部署 + 在线验证

**Files:** 无新建（push 触发部署）

- [ ] **Step 1: push 到 origin/main 触发 workflow**

```bash
git push origin main
```

Expected: GitHub Actions 在 `https://github.com/cdu52802-Xx/marx/actions` 显示 workflow run 启动。

- [ ] **Step 2: 等 workflow 跑完（约 2-3 分钟）**

打开 `https://github.com/cdu52802-Xx/marx/actions` 看最新一次 run 是否绿色 ✓。

如果 fail，常见原因：
- npm ci 失败 → 检查 package-lock.json 是否提交
- lint fail → 本地先 `npm run lint` fix
- test fail → 本地先 `npm test` fix
- pages 设置没设成 Actions（Task 7 Step 2）

- [ ] **Step 3: 访问在线 URL 验证**

打开浏览器到 `https://cdu52802-xx.github.io/marx/`（注意 GitHub Pages URL 大小写不敏感，但路径要带尾部 `/`）。

Expected: 浏览器显示 H1 「Marx 星图 · M1 项目骨架原型」+ SVG 里 2 个紫色圆（Marx + Engels）+ 1 条灰色连线 + 中文标签。

- [ ] **Step 4: 跑在线 e2e 验证**

修改 `playwright.config.ts` 临时把 `baseURL` 改成 `https://cdu52802-xx.github.io/marx/` 并注释掉 `webServer`，跑：

```bash
npm run e2e
```

Expected: 5/5 e2e 测试 pass（在生产环境上，不是本地 preview）。

> 这一步是临时验证，做完**记得改回**本地 `http://localhost:4173/marx/` 配置（不要 commit 临时改动）。

如果不想动 config，**可以人工目测**确认上面 Step 3 的视觉结果通过即可。

---

## Task 9: README 扩充 + M1 收尾 commit

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 修改 README.md 加 M1 节**

在原 README.md 现有内容后追加：

```markdown
## M1 项目骨架（已上线）

线上：https://cdu52802-xx.github.io/marx/

### 本地开发命令

\`\`\`bash
npm install              # 首次
npx playwright install chromium  # 首次（e2e 需要）

npm run dev              # 本地开发 server (localhost:5173/marx/)
npm run build            # 生产构建到 dist/
npm run preview          # 本地预览 build 产物 (localhost:4173/marx/)

npm test                 # vitest 单元测试
npm run e2e              # Playwright e2e 测试
npm run lint             # ESLint
npm run format           # Prettier 格式化
\`\`\`

### 文件路径约定（项目级，跟 AGENTS.md 一致）

| 路径 | 用途 |
|---|---|
| `docs/` | 需求 / PRD / 决策记录 / 阶段 takeaway |
| `specs/` | spec-first 工作流的 design doc |
| `plans/` | implementation plans（implementation 子任务清单） |
| `src/` | TypeScript 源码 |
| `tests/` | vitest 单元测试 |
| `e2e/` | Playwright e2e 测试 |
| `.github/workflows/` | GitHub Actions CI/CD |

### 当前 milestone 进度

- [x] **M1** 项目骨架 + Hello World deploy（2026-05-07）
- [ ] **M2** 数据 schema + SPARQL 阶段 A（plan 待写）
- [ ] **M3** 数据采集阶段 B + C（plan 待写）
- [ ] **M4** 关系图主视图 + 共享元素（plan 待写）
- [ ] **M5** 地理图画中画副视图（plan 待写）
- [ ] **M6** UI/UX 优化 + 验证 + ship（plan 待写）

详见 [`specs/2026-05-07-marx-star-map-design.md`](specs/2026-05-07-marx-star-map-design.md)
```

> 注意：README 里的代码块用 \\\` 转义（实际写时去掉转义）。

- [ ] **Step 2: 跑全套校验**

```bash
npm run lint && npm test && npm run build
```

Expected: 全部绿色 ✓。

- [ ] **Step 3: M1 收尾 commit**

```bash
git add README.md
git commit -m "docs(M1): README 加 M1 上线说明 + milestone 进度"
git push origin main
```

Expected: 触发又一次 GitHub Pages workflow run；几分钟后线上 URL 仍正常。

- [ ] **Step 4: 落 M1 takeaway 到 docs/**

按 AGENTS.md「Compound Engineering：每个特性完成后把 takeaway 落到 docs/」原则，新建 `docs/2026-05-XX-m1-takeaway.md`（XX = 实际完成日期），写：

```markdown
# Marx M1 takeaway · 项目骨架 + Hello World deploy

> 完成日期：YYYY-MM-DD
> 关联：[plans/2026-05-07-marx-star-map-m1-project-skeleton.md](../plans/2026-05-07-marx-star-map-m1-project-skeleton.md)

## 实际花了多久？

[填实际工时 vs plan 估的 3-5 天]

## 哪些坑值得记下来？

- [遇到的坑 1，未来 M2/M3/M4 怎么避]
- [遇到的坑 2]

## 哪些下次可以更快？

- [改进点 1]
- [改进点 2]

## 下一个 milestone（M2）入口

调 superpowers:writing-plans skill，写 M2 plan（数据 schema + SPARQL 阶段 A）。
建议带上 M1 takeaway 给 Claude 看，让它知道哪些坑要避。
```

- [ ] **Step 5: 提醒系统节点 ② 触发**

按用户访谈包提醒系统：M1 完成后**第一版 mockup 草图**已经出来（在线 URL 就是最简版 mockup）。可以拿这个 URL 给同一批访谈对象做形态校验访谈。

具体动作（手动）：
- 把 https://cdu52802-xx.github.io/marx/ 发给 3-5 个访谈对象
- 问 3 题：(a) 第一眼直观感受？(b) 后续真实场景里你会怎么用？(c) 跟你的预期相比有什么 gap？
- 把回答落到 `docs/2026-05-XX-mockup-访谈反馈.md`

- [ ] **Step 6: M1 takeaway commit**

```bash
git add docs/2026-05-XX-m1-takeaway.md
git commit -m "docs(M1): 落 M1 完成 takeaway"
git push
```

---

## M1 验证 / 完成判定

**M1 算完成的判定**（每条都要 ✓）：

- [ ] `npm run lint` 0 error 0 warning
- [ ] `npm test` 5/5 pass（vitest 单元测试）
- [ ] `npm run e2e` 5/5 pass（Playwright e2e 本地）
- [ ] `npm run build` 成功生成 dist/
- [ ] GitHub Actions workflow 最近一次 run 绿色 ✓
- [ ] https://cdu52802-xx.github.io/marx/ 可访问，肉眼看到 2 节点 + 1 连线 + 中文标签
- [ ] README 含 M1 节描述
- [ ] `docs/2026-05-XX-m1-takeaway.md` 已落
- [ ] 提醒系统节点 ② 已触发（mockup 校验访谈已发出 / 已收回反馈）

---

## 常见问题排查

**Q1: `npm run dev` 显示 "Cannot find module 'd3'"**
A: 重跑 `npm install`，确认 package.json 含 `d3` + `@types/d3`。

**Q2: Playwright e2e 跑超时**
A: 检查 `playwright.config.ts` 里 `webServer.timeout` 调到 60s 以上；确认本地能 `npm run preview` 启动。

**Q3: GitHub Actions deploy 失败 "Pages site not found"**
A: 仓库 Settings > Pages > Source 必须选 "GitHub Actions"（不是 Deploy from a branch）。Task 7 Step 2 必须手动设置一次。

**Q4: 在线 URL 显示 404**
A: GitHub Pages base path 跟 vite.config.ts `base: '/marx/'` 必须一致，URL 必须带尾部 `/`。

**Q5: 中文标签变成乱码**
A: 检查 index.html `<meta charset="UTF-8" />` 在 `<head>` 第一个 meta；检查所有源文件保存为 UTF-8（不带 BOM）。

---

## 下一个 milestone

M1 完成后，调 superpowers:writing-plans skill 写 M2 plan：

> "上次 M1 已完成（README 已记进度），takeaway 在 `docs/2026-05-XX-m1-takeaway.md`。M2 范围是数据 schema + SPARQL 阶段 A，按 design doc § 6.1 阶段 A 描述。请写 M2 plan。"
