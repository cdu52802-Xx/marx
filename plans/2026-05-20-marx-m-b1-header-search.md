# Marx M-B1 · Header 重组 + 跨图搜索 · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 header 从 M4 closure Option A 的"placeholder header"升级为 1st-class：brand 优化 + 跨图搜索框（PRD V1 必做）+ 关于/致谢 link 重组 + 互换按钮预留位（B2 启用）。

**Architecture:** header.ts 新建 component / 顶部 fixed 36px 不动 / 内部布局 brand 左 + 搜索中 + link 右。搜索 UI 浮窗 paper 风格沿用详情卡。搜索引擎 fuzzy match + debounce 200ms。主图高亮通过现有 sidebar filter pattern + 加新 search highlight API。副图 hook 预留 dom event（B2 实现 listener）。

**Tech Stack:** TypeScript + vanilla DOM + Vite + Vitest + Playwright

**Spec:** [`specs/2026-05-20-m-b-mainline-design.md`](../specs/2026-05-20-m-b-mainline-design.md) § 3 B1

---

## TL;DR Task 列表（PM 视图）

| Stage | Task | 内容 | 估时 | 依赖 |
|---|---|---|---|---|
| 0 | T0 | Pre-flight：git pull + baseline tests | 0.5h | — |
| 1 | T1.1 | `header.ts` 新建：layout scaffold + brand 字号位置 | 2-3h | T0 |
| 1 | T1.2 | 关于/致谢 link 重组到 header 右上 / 删 M4 footer | 1-2h | T1.1 |
| 1 | T1.3 | 互换按钮 placeholder（disabled / B2 启用） | 1h | T1.1 |
| 2 | T2.1 | `search.ts` 新建：输入框 + paper 风格视觉 | 2-3h | T1.1 |
| 2 | T2.2 | `search-result-popover.ts` 新建：下拉浮窗 + 候选 list 视觉 | 3-4h | T2.1 |
| 2 | T2.3 | 键盘导航（↑↓ / Enter / Esc） | 1-2h | T2.2 |
| 3 | T3.1 | `lib/search-index.ts` 新建：fuzzy match 多目标 + score | 3-4h | — |
| 3 | T3.2 | `search.ts` debounce 200ms | 1-2h | T2.2, T3.1 |
| 3 | T3.3 ⭐ | `search-result-popover.ts` 升级双形态 + 分组（DR-078 / PM mockup 拍板） | 3-4h | T3.1, T3.2 |
| 3 | T3.4 ⭐ | `lib/search-curate.ts` 新建：人物 7 / 概念 8 / 时段 4 静态 const | 1h | — |
| 4 | T4.1 | 主图 highlight API：紫圈 obs + fade 其他 | 2-3h | T3.1 |
| 4 | T4.2 | filter chip dropdown（节点类型 + 关系类型 + 人名） | 2-3h | T4.1 |
| 4 | T4.3 | 副图 highlight hook 预留（dom event） | 1h | T4.1 |
| 5 | T5.1 | E2E 新加 4 spec（搜索打字 / 候选选择 / Esc 关 / filter chip） | 2-3h | 全部 |
| 5 | T5.2 | 4 件套 baseline + ship | 1-2h | T5.1 |

**Total**：v1 ~22-32h / v2 +4-5h（T3.3 + T3.4 mockup 拍板后加）= **~26-37h / 1.1-1.5 周 / 5 stage PM checkpoint**

---

## File Structure

| File | Op | 责任 |
|---|---|---|
| `src/components/header.ts` | **新建** | header layout + brand + link + 互换按钮 placeholder |
| `src/components/search.ts` | **新建** | 搜索输入框 + 触发 fetch + debounce |
| `src/components/search-result-popover.ts` | **新建** | 下拉浮窗 + 候选 list + 键盘导航 |
| `src/lib/search-index.ts` | **新建** | fuzzy match 多目标 + score（claim text / name_zh / name_orig / keywords / person.name_zh） |
| `src/lib/search-curate.ts` | **新建 v2** | MAIN_PERSONS 7 / CORE_CONCEPTS 8 / KEY_PERIODS 4 静态 const + isExactConceptHit helper |
| `src/main.ts` | **修改** | 挂载 header + search · 接 主图 highlight hook · 删 stubSearch · 删 M4 footer |
| `src/styles.css` | **修改** | header + search + 候选 list 视觉 |
| `tests/unit/search-index.test.ts` | **新建** | 单元测 fuzzy match |
| `tests/unit/search.test.ts` | **新建** | 单元测 debounce + 输入响应 |
| `tests/unit/search-result-popover.test.ts` | **新建** | 单元测候选 list + 键盘导航 |
| `tests/unit/header.test.ts` | **新建** | 单元测 header layout + 互换按钮 |
| `e2e/m-b1-header-search.spec.ts` | **新建** | E2E 搜索打字 / 候选选择 / Esc 关 / filter chip |

---

## Task 0: Pre-flight

**Files:** none (验证 baseline)

- [ ] **Step 1: git pull + status clean**

```bash
git pull origin main
git status  # nothing to commit
```

- [ ] **Step 2: baseline tests + bundle gzip 数字**

```bash
npm test 2>&1 | tail -10  # 166/169 baseline
npm run build 2>&1 | tail -10  # gzip 30.83 KB
```

记下数字（B1 ship 时对比）。

---

## Stage 1 · Header layout 重组（1 天）

### Task 1.1: `header.ts` scaffold + brand

**Files:**
- Create: `src/components/header.ts`
- Modify: `src/main.ts` (挂载 header)
- Modify: `src/styles.css` (header CSS)
- Create: `tests/unit/header.test.ts`

- [ ] **Step 1: 写测试（TDD red）**

```ts
// tests/unit/header.test.ts
import { mountHeader } from '../../src/components/header';
describe('mountHeader', () => {
  it('brand 文字 = "Marx · 思想史可视化"', () => {
    const container = document.createElement('div');
    mountHeader({ container });
    expect(container.querySelector('.header-brand')?.textContent).toBe('Marx · 思想史可视化');
  });
  it('header fixed top 36px', () => { ... });
  it('brand 左对齐 / link 右对齐', () => { ... });
});
```

- [ ] **Step 2: impl `header.ts`（minimal pass tests）**

```ts
export function mountHeader({ container }: { container: HTMLElement }) {
  const header = document.createElement('div');
  header.className = 'header-fixed';
  header.innerHTML = `
    <div class="header-brand">Marx · 思想史可视化</div>
    <div class="header-search-slot"></div>
    <div class="header-links">
      <button class="header-swap" disabled>↔ 互换</button>
      <a href="#about">关于</a>
    </div>
  `;
  container.appendChild(header);
}
```

- [ ] **Step 3: CSS 视觉沿用 spec § 3.2**

```css
.header-fixed {
  position: fixed; top: 0; left: 0; right: 0; height: 36px;
  background: #1a1a1a;
  display: flex; align-items: center; padding: 0 20px;
  z-index: 100;
}
.header-brand {
  font-family: 'Playfair Display', serif;
  font-style: italic; font-size: 15px; color: #fcfaf6;
}
.header-search-slot { flex: 1; padding: 0 24px; }
.header-links { display: flex; gap: 16px; align-items: center; }
.header-links a, .header-swap {
  font-family: 'EB Garamond', Georgia, serif;
  font-style: italic; font-size: 12px;
  color: #fcfaf6; opacity: 0.7; text-decoration: none;
  background: none; border: none; cursor: pointer; letter-spacing: 0.04em;
}
.header-swap:disabled { opacity: 0.3; cursor: not-allowed; }
```

- [ ] **Step 4: main.ts 挂载**

```ts
import { mountHeader } from './components/header.ts';
const headerContainer = document.createElement('div');
document.body.appendChild(headerContainer);
mountHeader({ container: headerContainer });
```

- [ ] **Step 5: 删 M4 placeholder header**（main.ts 找 M4 closure Option A 的 header 代码删掉）

- [ ] **Step 6: npm test + lint + 浏览器验证**

Expected: tests pass + 视觉对 + 0 lint warning

### Task 1.2: 关于/致谢 link 重组

**Files:**
- Modify: `src/components/header.ts` (link 内容)
- Modify: `src/main.ts` (删 M4 footer 右上致谢)

- [ ] **Step 1: 找 M4 footer 致谢代码**

```bash
grep -n "footer\|致谢" src/main.ts
```

- [ ] **Step 2: 删 footer / 内容迁到 header link**

- [ ] **Step 3: link 列表（关于 / 致谢 / GitHub）**

具体 link 列 PM Stage 1 checkpoint 拍。

### Task 1.3: 互换按钮 placeholder

**Files:**
- Modify: `src/components/header.ts`

- [ ] **Step 1: 加 `.header-swap` button(disabled / hover hint "B2 启用")**

- [ ] **Step 2: data-attribute 预留 hook**：`data-swap-state="default"` / `data-swap-state="swapped"`

### Stage 1 PM checkpoint

- header 视觉跟 M5 主线 A 沿用一致
- brand 字号 / 位置 OK
- link 重组 OK / 删 M4 footer
- 互换按钮显示 disabled / hover 看到提示

---

## Stage 2 · 搜索 UI（1.5 天）

### Task 2.1: `search.ts` 输入框

**Files:**
- Create: `src/components/search.ts`
- Create: `tests/unit/search.test.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: 测试 + impl 输入框（paper 风格 / EB Garamond）**

- [ ] **Step 2: 输入触发 onInput callback**

- [ ] **Step 3: 视觉规范** (spec § 3.2)

### Task 2.2: `search-result-popover.ts` 下拉浮窗

**Files:**
- Create: `src/components/search-result-popover.ts`
- Create: `tests/unit/search-result-popover.test.ts`

- [ ] **Step 1: paper 风格 popover（border + paper-shadow）**

- [ ] **Step 2: 候选 list 渲染（max 8 个）**

- [ ] **Step 3: 每候选 click → onSelect callback**

### Task 2.3: 键盘导航

- [ ] **Step 1: ↑↓ 选 / Enter 确认 / Esc 关**

### Stage 2 PM checkpoint

- 搜索框打字看到下拉浮窗
- 候选 list paper 风格沿用详情卡
- 键盘导航 OK

---

## Stage 3 · 搜索逻辑 v2（1.5 天 · PM 2026-05-20 mockup 拍板双形态 + 分组）

v2 调整原因：PM Stage 2 checkpoint mockup 反馈 / 落 DR-078 / 工程量 1d → 1.5d。
参考 `public/m-b1-search-ux-mockup.html` 3 panel 对比 + spec § 3.3 v2。

### Task 3.1: `lib/search-index.ts` fuzzy match

**Files:**
- Create: `src/lib/search-index.ts`
- Create: `tests/unit/search-index.test.ts`

- [ ] **Step 1: fuzzy match algorithm（exact + prefix + substring + Levenshtein 简化版）**

- [ ] **Step 2: 多目标 indexing（claim.claim_text / claim.name_zh / claim.name_orig / claim.keywords / person.name_zh）**

- [ ] **Step 3: 返回候选 list（含 type + matched substring + score + author_id + year）**

```ts
interface SearchResult {
  type: 'claim' | 'person' | 'event' | 'location' | 'concept';
  id: string;
  label: string; // 显示文字
  matched?: string; // 匹配片段（高亮区间用）
  score: number; // 排序用：exact > prefix > substring > Levenshtein
  author_id?: string; // T3.3 popover 分组用
  year?: number; // claim 年份显示用
}
```

- [ ] **Step 4: 替换 main.ts stubSearch / 同时删 stubSearch function**

### Task 3.2: `search.ts` debounce 200ms

**Files:**
- Modify: `src/components/search.ts`
- Modify: `tests/unit/search.test.ts`（加 debounce test · fake timers）

- [ ] **Step 1: debounce wrapper（200ms · trailing edge）**

- [ ] **Step 2: input → debounced onInput callback**

- [ ] **Step 3: 测 rapid type 只触发最后一次 fake timers**

### Task 3.3: popover 升级双形态 + 分组渲染 ⭐（v2 新增）

**Files:**
- Modify: `src/components/search-result-popover.ts`
- Modify: `tests/unit/search-result-popover.test.ts`
- Modify: `src/styles.css`（加 .search-result-section / .search-result-group / .search-result-highlight）

**AGENTS.md 三件套硬约束**：实施前调 `frontend-design` + `ui-ux-pro-max` skill / 不能跳过。

- [ ] **Step 1: API 扩展 · renderExplore(curateLists) + renderGrouped(searchResults)**

```ts
export interface SearchResultPopoverApi {
  showExplore: (lists: { persons; concepts; periods }) => void; // 探索形态
  showGrouped: (results: SearchResult[], conceptHit?: ConceptMeta) => void; // 已知形态
  hide: () => void;
  isOpen: () => boolean;
}
```

- [ ] **Step 2: renderExplore 实现 · § 主要人物 + § 核心概念 + § 关键时段 · chip click → onSelect 填搜索框**

- [ ] **Step 3: renderGrouped 实现 · 按 author_id group / 一级 § 人物名 N 条 / 二级 claim item · 关键词紫高亮**

- [ ] **Step 4: § 概念命中段（精确匹配 8 chip · DR-080）**

- [ ] **Step 5: 键盘导航跨 section wrap（最后人物 → 第一人物）**

- [ ] **Step 6: max 4 组人物 + "查看全部" 折叠（实施期 PM checkpoint 验证 / 数据 5 人物可能不超）**

### Task 3.4: `lib/search-curate.ts` curate lists ⭐（v2 新增）

**Files:**
- Create: `src/lib/search-curate.ts`
- Create: `tests/unit/search-curate.test.ts`

- [ ] **Step 1: MAIN_PERSONS = 7 个**（按数据库真实 person.id 映射）

```ts
export const MAIN_PERSONS = [
  { id: 'wd-q9061', name: '马克思' },
  { id: '<恩格斯 id>', name: '恩格斯' },
  // ... 5 more
];
```

- [ ] **Step 2: CORE_CONCEPTS = 8 个（含元信息：提出者 / 年份 / 出处）**

```ts
export const CORE_CONCEPTS = [
  { label: '异化', proposedBy: 'wd-q9061', year: 1844, source: '1844 经济学哲学手稿' },
  // ... 7 more
];
```

- [ ] **Step 3: KEY_PERIODS = 4 段（含 year range）**

```ts
export const KEY_PERIODS = [
  { label: '1840s 青年', range: [1840, 1849] },
  { label: '1848 革命', range: [1848, 1848] },
  { label: '1864 第一国际', range: [1864, 1864] },
  { label: '1871 巴黎公社', range: [1871, 1871] },
];
```

- [ ] **Step 4: helper · isExactConceptHit(query): ConceptMeta | null（DR-080 精确匹配）**

### Stage 3 PM checkpoint（v2 · PM 实测 5 点）

- 空搜索 → popover 探索形态 OK（3 段 chip）
- 打字 "马克思" → popover 分组形态 OK（一级人物 / 二级 claim）
- 打字 "异化" → § 概念段命中 + Marx 4 条 + 费尔巴哈 2 条
- 键盘导航跨 section wrap
- **PM 美观度反馈**（字体 / 间距 / 配色 / 微动效 / DR-079 处理）

---

## Stage 4 · 主图高亮 + filter chip（1 天）

### Task 4.1: 主图 highlight API

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: 加 `highlightObs(claimId)` function**：紫圈高亮 selected obs + opacity fade 其他

- [ ] **Step 2: 加 `clearHighlight()` function**

- [ ] **Step 3: search-result-popover onSelect → highlightObs**

### Task 4.2: filter chip dropdown

**Files:**
- Modify: `src/components/search.ts`
- Modify: `src/components/search-result-popover.ts`

- [ ] **Step 1: 搜索框右侧 dropdown UI（节点类型 / 关系类型 / 人名 chip）**

- [ ] **Step 2: chip 选中 → filter search results**

- [ ] **Step 3: 沿用 sidebar filter pattern**

### Task 4.3: 副图 highlight hook 预留

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: 触发 custom event `marx:search-highlight` { type, id }**

- [ ] **Step 2: B2 期间 listener 接收（B1 期间无 listener / dispatch 但无 effect）**

### Stage 4 PM checkpoint

- 选中候选 → 主图 obs 紫圈 + fade 其他
- filter chip 工作正常
- 副图 hook 预留（dispatch event console.log 看到）

---

## Stage 5 · E2E + ship（0.5 天）

### Task 5.1: E2E 新加 4 spec

**Files:**
- Create: `e2e/m-b1-header-search.spec.ts`

- [ ] **Step 1: 搜索打字 → 候选 list 显示**

- [ ] **Step 2: 候选 click → 主图高亮**

- [ ] **Step 3: Esc → 浮窗关**

- [ ] **Step 4: filter chip 切换 → 候选 list 过滤**

### Task 5.2: 4 件套 baseline + ship

- [ ] **Step 1: npm test + npm run lint + npm run build**（baseline 保持）

- [ ] **Step 2: 4 件套 gstack 跑（health + benchmark + qa + design-review）**

- [ ] **Step 3: B1 takeaway 写 docs/2026-05-XX-m-b1-takeaway.md**

- [ ] **Step 4: commit + push + tag m-b1-final**

```bash
git tag m-b1-final
git push origin main --tags
```

### Stage 5 PM checkpoint = ship

- B1 prod 部署 OK
- 6 个 user journey 验收（在 spec § 3.6 Acceptance）
- 4 件套 baseline 不退化
- PM 实测验收 → ship

---

## Acceptance（B1 ship 验收 / spec § 3.6）

- [ ] header 视觉沿用 M5 主线 A 一致
- [ ] 搜索框打字 < 200ms debounce 响应
- [ ] 选中候选 → 主图 obs 紫圈高亮
- [ ] 搜索 + 候选 list 跟 zoom 解耦
- [ ] 4 件套 baseline 不退化
- [ ] Bundle gzip ≤ 35 KB（Phase 0 baseline 30.83 + B1 ≤ 5 KB 预算）
- [ ] E2E 4 spec pass

---

## 实施期可能的细化（Stage PM checkpoint 决）

- Stage 1：link 列表具体内容（关于 / 致谢 / GitHub link / 其他）
- Stage 2：搜索框 placeholder 文字 / 候选 list max 数量
- Stage 3：fuzzy match algorithm（exact 优先 vs Levenshtein vs 自建）
- Stage 4：filter chip 默认选哪些（节点类型 全选 vs 默认人/事件）/ 高亮 fade 数值
- Stage 5：B1 takeaway 内容 + 是否需要 prod 部署 verify

---

## DR placeholder（B1 实施期累积）

| 编号 | 待累积 |
|---|---|
| DR-078~ | B1 实施期 PM checkpoint 决策 |
