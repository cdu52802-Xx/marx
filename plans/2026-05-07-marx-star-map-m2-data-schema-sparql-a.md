# Marx 星图 V1 MVP · Milestone 2 · 数据 schema + SPARQL 阶段 A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Marx 关系骨架数据从 Wikidata SPARQL 拉下来落到 `src/data/nodes_skeleton.json`（~30-50 人 + ~10-20 著作 + 关系连线），完成产品 5 类节点 + 8 类关系的 TypeScript 类型一次到位定义，并把 M1 硬编码 2 节点替换为 JSON 加载，让线上呈现实际数据规模的关系骨架（~30-50 紫圆 + 关系连线）。

**Architecture:** 数据生成与产品代码分离。`scripts/sparql/*.sparql` 存独立 SPARQL 查询模板（可重读 / 可重跑 / 可在 Wikidata Query Service 里调试），`scripts/fetch-skeleton.ts` 用 Node fetch 调 Wikidata endpoint、合并去重、规范化为产品 schema 后写出 JSON。`src/types/Node.ts` 按 design doc § 3.1 / § 4.1 一次到位扩展为 5 类节点 + 8 类关系全集（M2 数据只填 person + work 两类节点 + 4 类关系，但类型留好 M3/M4 直接复用）。`src/data/nodes_skeleton.json` 作为静态资产被 Vite 在 build 时打入。`src/main.ts` 改为 import JSON 调用现有 `renderRelations()`，渲染逻辑保持 M1 的单色单线（5 色编码 / 详情卡留给 M4）。

**Tech Stack:** 新增依赖：`tsx ^4`（用于本地跑 TypeScript 脚本，不影响产品 build）。复用：Node 内置 fetch（v18+）、TypeScript ^5、Vite ^5、D3 ^7、vitest ^1、Playwright ^1。

**Upstream（产品决议）:** [Design doc § 3 节点系统](../specs/2026-05-07-marx-star-map-design.md) / [§ 4 关系系统](../specs/2026-05-07-marx-star-map-design.md) / [§ 6.1-6.3 数据采集流程 + 阶段 A](../specs/2026-05-07-marx-star-map-design.md) / [PRD v0.3](../docs/PRD.md) / [M1 plan](2026-05-07-marx-star-map-m1-project-skeleton.md) / [M1 takeaway 5 个已知坑](../docs/2026-05-07-m1-takeaway.md)

**Downstream:** M3 plan（数据采集阶段 B 人工校对 + C 后来者旁注采编，按 design doc § 6.1）等 M2 完成 + 形态目测后再写

**Out of scope · M2 不做**：
- 阶段 B / C / D 数据采集（M3 范围 —— 人工校对、后来者旁注 300-500 字、JSON 整合 + 校验脚本完整化）
- 5 色节点编码（M4 关系图主视图任务）
- 8 类关系视觉差异化（颜色 / 实/虚线 / 单/双向箭头）（M4）
- 详情卡 panel / 时间轴 / 跨图搜索（M4）
- 地理图副视图（M5）
- UI/UX 视觉细节（M6）
- 触发提醒系统节点 ②（mockup 校验访谈）—— **M2 形态依然简陋，不到访谈门槛**，等 M4-M5 视觉骨架完成后再评估

---

## 执行前 · 前置检查 + 0 代码 PM 准备工作

> M1 takeaway「下次可以更快」第 1 条教训：plan 顶部加前置检查节，所有阻塞性条件一次列清。

### 1. 阻塞性前置条件 checklist

| 检查项 | 怎么验证（命令 / 操作） | Expected | 失败处理 |
|---|---|---|---|
| 仓库 public 状态 | `gh repo view cdu52802-Xx/marx --json visibility` | `"visibility": "PUBLIC"` | M1 已改 public，应该已通过；若否，参考 M1 takeaway 坑 1 |
| Node 版本本机 ≥ 20 | `node --version` | v20+ 或 v24（M1 已确认 v24 OK） | 装 nvm 切到 20 LTS |
| npm 在 PATH 里 | `npm --version` | 任意版本号 | 重装 Node |
| Wikidata SPARQL 网络可达 | `curl -I https://query.wikidata.org/sparql` | HTTP 200 或 405（GET without query 405 也算 OK） | 中国大陆偶尔被墙——挂代理 / 换 wikidata mirror（如有）/ 改用本地缓存 |
| Git 远程 sync | `git fetch origin && git status` | `Your branch is up to date with 'origin/main'` | 先 `git pull` |
| 工作区干净 | `git status --short` | 空输出 | 先 commit / stash 现有变更 |
| `npm test` M1 5/5 通过 | `npm test` | 5/5 pass | M1 测试不过先修 M1，别带病开 M2 |

### 2. 公开仓库的影响范围（M2 输入决策）

- Wikidata 数据是公开的（CC0 协议），所有 SPARQL 拉到的字段都是公开知识，**不会引入 PII**
- 但 commit JSON 数据前依然要扫一遍：
  - 无 token / API key（脚本里硬编码的 endpoint URL 是公开 URL，不是 secret）
  - 无内部链接（如果未来加公司内网链接，要排除）
  - 无访谈对象 PII（访谈数据是 M3 阶段 C 的范围，跟 M2 无交集）
- 如果未来要拉非 Wikidata 数据源（如 SEP 词条文本爬虫），要单独评估版权 / robots.txt——但 M2 范围内不涉及

### 3. 数据采集脚本落处约定（M2 输入决策）

| 路径 | 用途 | 是否参与产品 build |
|---|---|---|
| `scripts/`（顶层） | 可重跑的数据生成 / 校验工具（TS 脚本） | 否（不在 vite build 范围） |
| `scripts/sparql/` | 纯 `.sparql` 查询模板（可在 Wikidata Query Service 里独立调试） | 否 |
| `src/data/` | 产品 import 的数据资产（生成的 JSON） | **是**（vite build 时打入 dist） |
| `src/types/` | 产品 + 脚本共用的 TypeScript 类型 | 是（脚本通过相对路径 import） |

**决策依据**（第一性）：数据采集脚本是"可重跑的工具"，不是产品代码也不是文档。Marx 项目结构惯例 `src/` = 产品代码，`docs/` = 给人读的文档，`scripts/` 是 M2 引入的第三类——工具。脚本输出（JSON）放进 `src/data/` 因为产品要 import。

### 4. 必备最低操作技能（M1 已覆盖，M2 新增）

| 技能 | 用途 | M2 新增 |
|---|---|---|
| 跑 SPARQL 查询（Wikidata Query Service 网页） | 本地调试 SPARQL 查询正确性，不必每次都跑脚本 | ⭐ 新 |
| 看 JSON 文件 / 用 jq 简单 query | 校验生成的 JSON 内容 | ⭐ 新 |
| 其他（命令行 / git / npm） | M1 已具备 | — |

> 详细 SPARQL 入门 + Wikidata Query Service 用法，请去**其他窗口**问，不在主对话里展开。

### 5. 手动必做的事（agent 做不了）

- **Task 6 Step 4**：浏览器目测 https://cdu52802-xx.github.io/marx/ 看 ~30-50 紫圆是否真的渲染出来，关系连线是否合理
- **Task 9 Step 5**：评估 M2 形态是否到 mockup 门槛 → **预期：还不到**（依然只是密集紫圆 + 灰线，没颜色没详情卡），所以不触发提醒系统节点 ②，记录到 takeaway 等 M4-M5 后再评估

---

## File Structure（M2 范围内创建/修改的文件）

```
marx/
├── scripts/                        ★ 新建顶层目录（M2 引入）
│   ├── sparql/
│   │   ├── 01-marx-influences.sparql      ★ 新建 - Marx 受影响于谁 (P737)
│   │   ├── 02-marx-influenced.sparql      ★ 新建 - Marx 影响了谁 (P737 反向 + 年代过滤)
│   │   ├── 03-marx-collaborators.sparql   ★ 新建 - Marx 合作者 (P1327)
│   │   ├── 04-marx-students-teachers.sparql ★ 新建 - 师承 (P802 student / P1066 student of)
│   │   └── 05-marx-works.sparql           ★ 新建 - Marx 著名作品 (P800)
│   ├── fetch-skeleton.ts           ★ 新建 - 跑 SPARQL 拉数据合并去重写 JSON
│   └── README.md                   ★ 新建 - 解释 scripts/ 目录用途 + 怎么跑
├── src/
│   ├── types/
│   │   └── Node.ts                 ☆ 重构 - 扩展为 5 类节点 + 8 类关系全集
│   ├── data/
│   │   ├── m1-skeleton.ts          ★ 删除 - M1 硬编码已被替代
│   │   └── nodes_skeleton.json     ★ 新建 - M2 SPARQL 输出（产品资产）
│   ├── viz/
│   │   └── relations.ts            ☆ 修改 - 适配新 Node / Relation 类型
│   └── main.ts                     ☆ 修改 - import JSON 替代 m1-skeleton.ts
├── tests/
│   └── unit/
│       ├── relations.test.ts       ☆ 修改 - 适配新数据规模 + 新类型
│       └── schema.test.ts          ★ 新建 - 测试 schema 校验函数
├── e2e/
│   └── deploy.spec.ts              ☆ 修改 - 节点数 expected 从 2 改 >=20
├── src/
│   └── lib/
│       └── schema.ts               ★ 新建 - schema 校验函数（产品 + 脚本共用）
├── package.json                    ☆ 修改 - 加 tsx devDep + fetch-skeleton script
├── README.md                       ☆ 修改 - 加 M2 节 + milestone 进度勾选
└── docs/
    └── 2026-05-XX-m2-takeaway.md   ★ 新建 - M2 完成后落 takeaway（XX = 完成日）
```

**新增依赖**：`tsx ^4`（devDep，本地跑 TS 脚本用，不进 vite build）。

**.gitignore 已覆盖** `node_modules/` `dist/`，无需修改。`scripts/` 和 `src/data/*.json` 都要入库。

---

## Task 1: 前置检查 + 环境准备

**Files:** 无新建（全部为验证步骤）

- [ ] **Step 1: 跑 4 条阻塞性前置检查命令**

```bash
gh repo view cdu52802-Xx/marx --json visibility
node --version
npm --version
git fetch origin && git status
```

Expected：
- `"visibility": "PUBLIC"`
- node 版本 ≥ 20
- npm 任意版本号
- `Your branch is up to date with 'origin/main'`，工作区干净

如果有任何一条不通过，回顶部前置检查表照着失败处理。

- [ ] **Step 2: 测 Wikidata SPARQL endpoint 网络可达性**

```bash
curl -I https://query.wikidata.org/sparql
```

Expected: HTTP 200 或 405（GET without query 405 也算 endpoint 在线）。如果连接超时 / DNS 解析失败，可能被网络环境限制——挂代理或换时段重试。

- [ ] **Step 3: 跑一条 SPARQL 测试查询确认 endpoint 工作正常**

```bash
curl -G "https://query.wikidata.org/sparql" \
  --data-urlencode "query=SELECT ?personLabel WHERE { wd:Q9061 wdt:P735 ?firstName . SERVICE wikibase:label { bd:serviceParam wikibase:language \"zh,en\" } } LIMIT 1" \
  -H "Accept: application/sparql-results+json"
```

Expected: 返回 JSON，含 `"personLabel": { "type": "literal", "value": "卡尔" }` 或类似（Marx 的名字 first name）。

如果返回 HTML 错误页或 429 too many requests，停一下重试，或换个时段。

- [ ] **Step 4: 跑 M1 全套测试确认 baseline 健康**

```bash
npm run lint && npm test && npm run build
```

Expected: 全绿。如果不绿，先修 M1 不带病开 M2。

- [ ] **Step 5: 装 tsx（M2 新增 dev 依赖）**

```bash
npm install --save-dev tsx
```

Expected: `package.json` devDependencies 加 `"tsx": "^4.x"`，`package-lock.json` 更新。

- [ ] **Step 6: Commit 前置准备**

```bash
git add package.json package-lock.json
git commit -m "chore(M2): 装 tsx 用于本地跑 TS 数据采集脚本"
```

---

## Task 2: 类型重构 - 5 类节点 + 8 类关系全集

**Files:**
- Modify: `src/types/Node.ts`（M1 简版 → M2 全集）
- Test: `tests/unit/types.test.ts`（M2 新建，仅类型推断 smoke test）

> 来源：design doc § 3.1（5 类节点 spec 表）+ § 4.1（8 类关系连线表）。M2 一次到位定义，M3-M5 直接复用，避免类型反复改。

- [ ] **Step 1: 重构 src/types/Node.ts（5 类节点 + 8 类关系全集）**

完整覆盖 design doc § 3.1 必填 + 选填字段，但所有 V1 字段标 required，V2+ 字段标 `?` 选填。

```typescript
// Marx 星图节点 + 关系类型定义
// 一次到位覆盖 design doc § 3.1 5 类节点 + § 4.1 8 类关系
// M2 数据只填 person + work 两类节点 + influences/collaborator/author 三类关系
// M3 阶段 B-C 扩展剩余 3 类节点（event / concept / place）+ 5 类关系
// M4 渲染层启用 5 色编码 + 8 类关系视觉差异化

// === 节点类型 ===

export type NodeType = 'person' | 'work' | 'event' | 'concept' | 'place';

// 经纬度坐标对（地理图用），[lat, lng] 格式
export type LatLng = [number, number];

// 共同字段
interface NodeBase {
  id: string;
  type: NodeType;
  name_zh: string;
  name_orig: string; // 原文（德 / 英 / 法等）
}

// 人 · 紫色，~50 个
export interface PersonNode extends NodeBase {
  type: 'person';
  birth_year: number;
  death_year: number;
  main_location_lat_lng: LatLng;
  bio_event_style: string[]; // 事件式简明 bio，每行 ≤ 30 字，总长度 ≤ 5 行
  citation_urls: string[];
  // V1 录入但 M2-M3 阶段先不填的选填字段
  aliases?: string[];
  portrait_url?: string;
  relation_to_marx?: string;
}

// 著作 · 蓝色，~20 个
export interface WorkNode extends NodeBase {
  type: 'work';
  pub_year: number;
  author_id: string; // 指向 PersonNode.id
  writing_period: string; // 例 "1857-1858"
  summary: string; // ≤ 3 行，事件式简明
  citation_urls: string[];
  // V2+ 渲染地理图用
  version?: string;
  writing_location_lat_lng?: LatLng;
}

// 事件 · 橙色，~30 个（M3 阶段 B 起填）
export interface EventNode extends NodeBase {
  type: 'event';
  start_date: string; // ISO 8601 例 "1848-02"
  end_date: string;
  location_lat_lng: LatLng;
  description_event_style: string; // ≤ 3 行
  participants_ids: string[]; // 指向 PersonNode.id 数组
  triggered_works_ids?: string[]; // 引发的著作
}

// 概念 · 绿色，~15 个（M3 阶段 B-C 起填）
export interface ConceptNode extends NodeBase {
  type: 'concept';
  proposed_year: number;
  proposed_work_id: string; // 指向 WorkNode.id
  definition_plain: string; // 白话定义 ≤ 3 行
  citation_urls: string[];
  successor_notes: SuccessorNote[]; // 后来者旁注，仅核心概念有
  // V2+ 渲染选填
  related_concepts_ids?: string[];
  evolution_path?: string;
  first_proposed_location_lat_lng?: LatLng;
}

// 后来者旁注（concept.successor_notes 数组项）
export interface SuccessorNote {
  successor_name_zh: string;
  successor_name_orig: string;
  year: number;
  source_work: string; // 后来者的代表作
  note_text: string; // 300-500 字 旁注内容
  citation_urls: string[];
}

// 地点 · 灰色，~6 个（M3 阶段 B 起填）
export interface PlaceNode extends NodeBase {
  type: 'place';
  lat_lng: LatLng;
  marx_activity_description: string;
  related_persons_ids?: string[];
  related_events_ids?: string[];
}

export type Node = PersonNode | WorkNode | EventNode | ConceptNode | PlaceNode;

// === 关系类型 ===

export type RelationType =
  | 'mentor' // 师承，紫色实线 + 箭头，单向 例：黑格尔 → Marx
  | 'opponent' // 论敌，红色虚线，双向 例：Marx ↔ 蒲鲁东
  | 'friend_collaborator' // 朋友/合作，绿色实线，双向 例：Marx ↔ 恩格斯
  | 'influences' // 影响，浅紫虚线 + 箭头，单向 例：费尔巴哈 → Marx
  | 'author' // 作者，蓝色实线，单向 例：Marx → 资本论
  | 'proposed_concept' // 提出概念，深绿实线，单向 例：Marx → 异化
  | 'lived_in' // 居住，灰色虚线，单向 例：Marx → 伦敦
  | 'participated_in'; // 参与事件，橙色实线，单向 例：Marx → 第一国际

export interface Relation {
  source: string; // 节点 id
  target: string; // 节点 id
  type: RelationType;
}

// === Dataset ===

export interface Dataset {
  nodes: Node[];
  relations: Relation[];
}

// === 类型 narrow helper（产品 + 脚本共用） ===

export const isPerson = (n: Node): n is PersonNode => n.type === 'person';
export const isWork = (n: Node): n is WorkNode => n.type === 'work';
export const isEvent = (n: Node): n is EventNode => n.type === 'event';
export const isConcept = (n: Node): n is ConceptNode => n.type === 'concept';
export const isPlace = (n: Node): n is PlaceNode => n.type === 'place';
```

- [ ] **Step 2: 创建 tests/unit/types.test.ts（类型 narrow smoke test）**

```typescript
import { describe, it, expect } from 'vitest';
import type { Node, PersonNode, WorkNode } from '../../src/types/Node.ts';
import { isPerson, isWork } from '../../src/types/Node.ts';

describe('Node type narrowing · M2', () => {
  it('isPerson narrows to PersonNode', () => {
    const node: Node = {
      id: 'marx',
      type: 'person',
      name_zh: '卡尔·马克思',
      name_orig: 'Karl Marx',
      birth_year: 1818,
      death_year: 1883,
      main_location_lat_lng: [51.5074, -0.1278],
      bio_event_style: ['1818年5月 - 生于普鲁士特里尔'],
      citation_urls: ['https://www.marxists.org/archive/marx/'],
    };
    expect(isPerson(node)).toBe(true);
    if (isPerson(node)) {
      // 类型 narrow 后能访问 PersonNode 专有字段
      expect(node.birth_year).toBe(1818);
    }
  });

  it('isWork narrows to WorkNode', () => {
    const node: Node = {
      id: 'das-kapital',
      type: 'work',
      name_zh: '资本论',
      name_orig: 'Das Kapital',
      pub_year: 1867,
      author_id: 'marx',
      writing_period: '1857-1867',
      summary: '资本主义生产方式批判，第一卷 1867 出版',
      citation_urls: ['https://www.marxists.org/archive/marx/works/1867-c1/'],
    };
    expect(isWork(node)).toBe(true);
    if (isWork(node)) {
      expect(node.pub_year).toBe(1867);
    }
  });
});
```

- [ ] **Step 3: 跑测试验证类型 narrow 正确**

```bash
npm test
```

Expected: 7/7 pass（5 个原 relations.test.ts + 2 个新 types.test.ts）。如果原 relations.test.ts fail，是因为它依赖旧 `m1Dataset` 和旧 Node 接口——下个 task 会修。

> 注：M1 的 relations.test.ts 这一步可能 fail，因为新 PersonNode 字段比旧 Node 多。下个 Task 会修复。本 Step 容忍部分 fail，只要新 types.test.ts 2/2 pass 就 OK。

- [ ] **Step 4: 跑 lint 验证类型文件**

```bash
npm run lint
```

Expected: 0 error 0 warning。

- [ ] **Step 5: Commit**

```bash
git add src/types/Node.ts tests/unit/types.test.ts
git commit -m "feat(M2): 类型扩展为 5 类节点 + 8 类关系全集"
```

---

## Task 3: schema 校验函数（TDD）

**Files:**
- Create: `src/lib/schema.ts`
- Create: `tests/unit/schema.test.ts`

> 校验函数用途：(a) 脚本生成 JSON 后跑校验，发现字段缺失 / 类型错；(b) 产品启动时跑校验，避免 JSON 格式不对静默渲染失败。脚本和产品都 import 这一份。TDD 写：先写测试再写实现。

- [ ] **Step 1: 写失败测试 tests/unit/schema.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { validateNode, validateRelation, validateDataset } from '../../src/lib/schema.ts';
import type { PersonNode, WorkNode, Relation, Dataset } from '../../src/types/Node.ts';

describe('validateNode · M2', () => {
  it('accepts valid PersonNode', () => {
    const node: PersonNode = {
      id: 'marx',
      type: 'person',
      name_zh: '卡尔·马克思',
      name_orig: 'Karl Marx',
      birth_year: 1818,
      death_year: 1883,
      main_location_lat_lng: [51.5074, -0.1278],
      bio_event_style: ['1818年5月 - 生于普鲁士特里尔'],
      citation_urls: ['https://example.org/marx'],
    };
    expect(() => validateNode(node)).not.toThrow();
  });

  it('throws when PersonNode missing birth_year', () => {
    const broken = {
      id: 'marx',
      type: 'person',
      name_zh: '卡尔·马克思',
      name_orig: 'Karl Marx',
      // birth_year 缺
      death_year: 1883,
      main_location_lat_lng: [51.5074, -0.1278],
      bio_event_style: [],
      citation_urls: [],
    };
    expect(() => validateNode(broken as unknown as PersonNode)).toThrow(/birth_year/);
  });

  it('throws when type is unknown', () => {
    const broken = {
      id: 'x',
      type: 'alien',
      name_zh: 'x',
      name_orig: 'x',
    };
    expect(() => validateNode(broken as unknown as PersonNode)).toThrow(/unknown node type/);
  });

  it('accepts valid WorkNode', () => {
    const node: WorkNode = {
      id: 'das-kapital',
      type: 'work',
      name_zh: '资本论',
      name_orig: 'Das Kapital',
      pub_year: 1867,
      author_id: 'marx',
      writing_period: '1857-1867',
      summary: '资本主义生产方式批判',
      citation_urls: [],
    };
    expect(() => validateNode(node)).not.toThrow();
  });
});

describe('validateRelation · M2', () => {
  it('accepts valid Relation', () => {
    const rel: Relation = { source: 'marx', target: 'engels', type: 'friend_collaborator' };
    expect(() => validateRelation(rel)).not.toThrow();
  });

  it('throws on unknown relation type', () => {
    const broken = { source: 'a', target: 'b', type: 'wormhole' };
    expect(() => validateRelation(broken as unknown as Relation)).toThrow(/unknown relation type/);
  });
});

describe('validateDataset · M2', () => {
  it('accepts dataset with valid nodes + relations', () => {
    const dataset: Dataset = {
      nodes: [
        {
          id: 'marx',
          type: 'person',
          name_zh: '卡尔·马克思',
          name_orig: 'Karl Marx',
          birth_year: 1818,
          death_year: 1883,
          main_location_lat_lng: [51.5074, -0.1278],
          bio_event_style: [],
          citation_urls: [],
        },
      ],
      relations: [],
    };
    expect(() => validateDataset(dataset)).not.toThrow();
  });

  it('throws when relation references unknown node id', () => {
    const dataset: Dataset = {
      nodes: [
        {
          id: 'marx',
          type: 'person',
          name_zh: '卡尔·马克思',
          name_orig: 'Karl Marx',
          birth_year: 1818,
          death_year: 1883,
          main_location_lat_lng: [51.5074, -0.1278],
          bio_event_style: [],
          citation_urls: [],
        },
      ],
      relations: [{ source: 'marx', target: 'ghost', type: 'friend_collaborator' }],
    };
    expect(() => validateDataset(dataset)).toThrow(/relation target.*not in nodes/);
  });

  it('throws when node ids have duplicates', () => {
    const dataset: Dataset = {
      nodes: [
        {
          id: 'marx',
          type: 'person',
          name_zh: 'A',
          name_orig: 'A',
          birth_year: 1818,
          death_year: 1883,
          main_location_lat_lng: [0, 0],
          bio_event_style: [],
          citation_urls: [],
        },
        {
          id: 'marx', // 重复 id
          type: 'person',
          name_zh: 'B',
          name_orig: 'B',
          birth_year: 1820,
          death_year: 1900,
          main_location_lat_lng: [0, 0],
          bio_event_style: [],
          citation_urls: [],
        },
      ],
      relations: [],
    };
    expect(() => validateDataset(dataset)).toThrow(/duplicate node id/);
  });
});
```

- [ ] **Step 2: 跑测试验证全部 fail（实现还没写）**

```bash
npm test
```

Expected: tests/unit/schema.test.ts 全部 fail，错误信息含 "Cannot find module '../../src/lib/schema.ts'"。

- [ ] **Step 3: 写实现 src/lib/schema.ts**

```typescript
import type {
  Node,
  PersonNode,
  WorkNode,
  EventNode,
  ConceptNode,
  PlaceNode,
  Relation,
  Dataset,
  RelationType,
} from '../types/Node.ts';

const VALID_RELATION_TYPES: ReadonlySet<RelationType> = new Set([
  'mentor',
  'opponent',
  'friend_collaborator',
  'influences',
  'author',
  'proposed_concept',
  'lived_in',
  'participated_in',
]);

function requireField(obj: unknown, field: string, contextId: string): void {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error(`schema: ${contextId} is not an object`);
  }
  if (!(field in obj) || (obj as Record<string, unknown>)[field] === undefined) {
    throw new Error(`schema: ${contextId} missing required field "${field}"`);
  }
}

function validatePerson(n: PersonNode): void {
  const ctx = `person "${n.id}"`;
  requireField(n, 'birth_year', ctx);
  requireField(n, 'death_year', ctx);
  requireField(n, 'main_location_lat_lng', ctx);
  requireField(n, 'bio_event_style', ctx);
  requireField(n, 'citation_urls', ctx);
  if (!Array.isArray(n.bio_event_style)) {
    throw new Error(`schema: ${ctx} bio_event_style must be array`);
  }
  if (!Array.isArray(n.citation_urls)) {
    throw new Error(`schema: ${ctx} citation_urls must be array`);
  }
  if (!Array.isArray(n.main_location_lat_lng) || n.main_location_lat_lng.length !== 2) {
    throw new Error(`schema: ${ctx} main_location_lat_lng must be [lat, lng] tuple`);
  }
}

function validateWork(n: WorkNode): void {
  const ctx = `work "${n.id}"`;
  requireField(n, 'pub_year', ctx);
  requireField(n, 'author_id', ctx);
  requireField(n, 'writing_period', ctx);
  requireField(n, 'summary', ctx);
  requireField(n, 'citation_urls', ctx);
}

function validateEvent(n: EventNode): void {
  const ctx = `event "${n.id}"`;
  requireField(n, 'start_date', ctx);
  requireField(n, 'end_date', ctx);
  requireField(n, 'location_lat_lng', ctx);
  requireField(n, 'description_event_style', ctx);
  requireField(n, 'participants_ids', ctx);
}

function validateConcept(n: ConceptNode): void {
  const ctx = `concept "${n.id}"`;
  requireField(n, 'proposed_year', ctx);
  requireField(n, 'proposed_work_id', ctx);
  requireField(n, 'definition_plain', ctx);
  requireField(n, 'citation_urls', ctx);
  requireField(n, 'successor_notes', ctx);
}

function validatePlace(n: PlaceNode): void {
  const ctx = `place "${n.id}"`;
  requireField(n, 'lat_lng', ctx);
  requireField(n, 'marx_activity_description', ctx);
}

export function validateNode(n: Node): void {
  if (!n || typeof n !== 'object') {
    throw new Error('schema: node is not an object');
  }
  requireField(n, 'id', 'node');
  requireField(n, 'type', `node "${(n as Node).id}"`);
  requireField(n, 'name_zh', `node "${(n as Node).id}"`);
  requireField(n, 'name_orig', `node "${(n as Node).id}"`);

  switch (n.type) {
    case 'person':
      return validatePerson(n);
    case 'work':
      return validateWork(n);
    case 'event':
      return validateEvent(n);
    case 'concept':
      return validateConcept(n);
    case 'place':
      return validatePlace(n);
    default:
      throw new Error(`schema: unknown node type "${(n as { type: string }).type}"`);
  }
}

export function validateRelation(r: Relation): void {
  if (!r || typeof r !== 'object') {
    throw new Error('schema: relation is not an object');
  }
  requireField(r, 'source', 'relation');
  requireField(r, 'target', 'relation');
  requireField(r, 'type', 'relation');
  if (!VALID_RELATION_TYPES.has(r.type)) {
    throw new Error(`schema: unknown relation type "${r.type}"`);
  }
}

export function validateDataset(d: Dataset): void {
  if (!d || typeof d !== 'object') {
    throw new Error('schema: dataset is not an object');
  }
  if (!Array.isArray(d.nodes)) {
    throw new Error('schema: dataset.nodes must be array');
  }
  if (!Array.isArray(d.relations)) {
    throw new Error('schema: dataset.relations must be array');
  }

  const seenIds = new Set<string>();
  for (const node of d.nodes) {
    validateNode(node);
    if (seenIds.has(node.id)) {
      throw new Error(`schema: duplicate node id "${node.id}"`);
    }
    seenIds.add(node.id);
  }

  for (const rel of d.relations) {
    validateRelation(rel);
    if (!seenIds.has(rel.source)) {
      throw new Error(`schema: relation source "${rel.source}" not in nodes`);
    }
    if (!seenIds.has(rel.target)) {
      throw new Error(`schema: relation target "${rel.target}" not in nodes`);
    }
  }
}
```

- [ ] **Step 4: 跑测试验证全部 pass**

```bash
npm test -- tests/unit/schema.test.ts
```

Expected: 7/7 schema 测试 pass。

- [ ] **Step 5: Commit**

```bash
git add src/lib/ tests/unit/schema.test.ts
git commit -m "feat(M2): schema 校验函数 + 单元测试 7/7"
```

---

## Task 4: SPARQL 查询模板设计

**Files:**
- Create: `scripts/sparql/01-marx-influences.sparql`
- Create: `scripts/sparql/02-marx-influenced.sparql`
- Create: `scripts/sparql/03-marx-collaborators.sparql`
- Create: `scripts/sparql/04-marx-students-teachers.sparql`
- Create: `scripts/sparql/05-marx-works.sparql`
- Create: `scripts/README.md`

> 每个查询独立成文件，可在 https://query.wikidata.org/ 网页 UI 里直接粘贴运行调试。Marx 的 Wikidata QID 是 **Q9061**。

- [ ] **Step 1: 创建 scripts/sparql/01-marx-influences.sparql（Marx 受影响于谁）**

```sparql
# Q9061 = Karl Marx
# P737 = influenced by
# 拉所有 Marx 直接受影响于的人，含生卒年用于年代过滤
SELECT ?person ?personLabel ?birthYear ?deathYear WHERE {
  wd:Q9061 wdt:P737 ?person .
  OPTIONAL { ?person wdt:P569 ?birthDate . BIND(YEAR(?birthDate) AS ?birthYear) }
  OPTIONAL { ?person wdt:P570 ?deathDate . BIND(YEAR(?deathDate) AS ?deathYear) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en,de,fr" }
}
ORDER BY ?birthYear
```

预期结果：约 10-20 人（黑格尔、费尔巴哈、亚当斯密、李嘉图、圣西门、傅立叶、青年黑格尔派成员等）。

- [ ] **Step 2: 创建 scripts/sparql/02-marx-influenced.sparql（Marx 影响了谁）**

```sparql
# Q9061 = Karl Marx, P737 = influenced by
# 拉所有声明 Marx 影响了自己的人，限制 1900 年前出生避免后世 Marxist 大爆炸
# (后世马克思主义者属于 M2 阶段 C 后来者旁注范围，不在 M2 关系骨架里)
SELECT ?person ?personLabel ?birthYear ?deathYear WHERE {
  ?person wdt:P737 wd:Q9061 .
  ?person wdt:P569 ?birthDate .
  BIND(YEAR(?birthDate) AS ?birthYear)
  OPTIONAL { ?person wdt:P570 ?deathDate . BIND(YEAR(?deathDate) AS ?deathYear) }
  FILTER (?birthYear < 1900)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en,de,fr,ru" }
}
ORDER BY ?birthYear
LIMIT 50
```

预期结果：约 20-40 人（恩格斯、考茨基、伯恩施坦、列宁、卢森堡、第二国际成员等）。

- [ ] **Step 3: 创建 scripts/sparql/03-marx-collaborators.sparql（合作者）**

```sparql
# P1327 = professional or sporting partner / collaborator
SELECT ?person ?personLabel ?birthYear ?deathYear WHERE {
  wd:Q9061 wdt:P1327 ?person .
  OPTIONAL { ?person wdt:P569 ?birthDate . BIND(YEAR(?birthDate) AS ?birthYear) }
  OPTIONAL { ?person wdt:P570 ?deathDate . BIND(YEAR(?deathDate) AS ?deathYear) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en,de" }
}
```

预期结果：通常 1-3 人（恩格斯主要，也可能含合著作者）。

- [ ] **Step 4: 创建 scripts/sparql/04-marx-students-teachers.sparql（师承）**

```sparql
# P802 = student（Marx 的学生）
# P1066 = student of（Marx 的老师）
# 用 UNION 合并查询
SELECT ?person ?personLabel ?birthYear ?deathYear ?relation WHERE {
  {
    wd:Q9061 wdt:P802 ?person .
    BIND("student_of_marx" AS ?relation)
  } UNION {
    wd:Q9061 wdt:P1066 ?person .
    BIND("teacher_of_marx" AS ?relation)
  }
  OPTIONAL { ?person wdt:P569 ?birthDate . BIND(YEAR(?birthDate) AS ?birthYear) }
  OPTIONAL { ?person wdt:P570 ?deathDate . BIND(YEAR(?deathDate) AS ?deathYear) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en,de" }
}
```

预期结果：通常 1-5 人（黑格尔以 teacher 身份可能也在这里命中）。

- [ ] **Step 5: 创建 scripts/sparql/05-marx-works.sparql（著作）**

```sparql
# P800 = notable work
SELECT ?work ?workLabel ?pubYear WHERE {
  wd:Q9061 wdt:P800 ?work .
  OPTIONAL { ?work wdt:P577 ?pubDate . BIND(YEAR(?pubDate) AS ?pubYear) }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,en,de" }
}
ORDER BY ?pubYear
```

预期结果：5-15 个著作（资本论 / 共产党宣言 / 1844 手稿 / 政治经济学批判等）。

- [ ] **Step 6: 创建 scripts/README.md（解释 scripts/ 目录用途）**

```markdown
# scripts/ · 数据采集与校验脚本

> 项目工具脚本目录，**不参与产品 build**（vite 不打包这里的内容）。

## 目录结构

- `sparql/` · SPARQL 查询模板（`.sparql` 纯文本，可在 https://query.wikidata.org/ 直接粘贴调试）
- `fetch-skeleton.ts` · 跑全部 SPARQL 查询、合并去重、规范化为产品 schema、写出 `src/data/nodes_skeleton.json`

## 怎么跑

确保已经装 `tsx`（M2 引入的 dev 依赖）：

\`\`\`bash
npm install
\`\`\`

跑 M2 数据采集：

\`\`\`bash
npm run fetch:skeleton
\`\`\`

输出：`src/data/nodes_skeleton.json`（覆盖式写）。

## 调试 SPARQL 单查询

打开 https://query.wikidata.org/，粘贴 `sparql/<NN>-*.sparql` 文件内容，点 ▶ Run。Wikidata 的 Web UI 比脚本好调试。

## 重要约定

- 一份 `.sparql` 一个查询，不在脚本里拼字符串（拼字符串难调试）
- Marx 的 Wikidata QID = `Q9061`
- 所有查询通过 `wikibase:label` 服务拿中文 label，回退英 / 德 / 法
- Wikidata SPARQL endpoint rate limit 5 query/s 非登录用户，脚本里 sleep 一下避免被 throttle
```

- [ ] **Step 7: 调试 SPARQL（手动）—— 在 Wikidata Query Service 网页跑一次每个查询**

打开 https://query.wikidata.org/，依次粘贴 5 个 `.sparql` 文件内容，点 ▶ Run。每个查询应该返回非空结果。

如果某个查询超时 / 返回空 / 报语法错，**先在网页 UI 里调通再写脚本**。常见问题：
- 返回空：Wikidata 的 P737/P800 等数据本来就稀疏，确认 Q9061 的 P737 在 https://www.wikidata.org/wiki/Q9061 上有声明
- 超时：加 LIMIT，或拆查询
- 中文 label 出英文：检查 `wikibase:language` 排序，"zh" 在最前

- [ ] **Step 8: Commit SPARQL 模板**

```bash
git add scripts/sparql/ scripts/README.md
git commit -m "feat(M2): SPARQL 查询模板 5 个 + scripts README"
```

---

## Task 5: fetch-skeleton.ts 脚本

**Files:**
- Create: `scripts/fetch-skeleton.ts`
- Modify: `package.json`（加 `fetch:skeleton` script）

> 脚本职责：(1) 读 5 个 .sparql 文件 (2) 顺序调 Wikidata endpoint（带 1s sleep 避 rate limit）(3) 解析 SPARQL JSON 结果 → 规范化为 PersonNode / WorkNode (4) 合并去重（按 Wikidata QID）(5) 跑 schema 校验 (6) 写 `src/data/nodes_skeleton.json`。

- [ ] **Step 1: 创建 scripts/fetch-skeleton.ts**

```typescript
// Marx 星图 M2 数据采集脚本
// 跑：npm run fetch:skeleton
// 输出：src/data/nodes_skeleton.json

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDataset } from '../src/lib/schema.ts';
import type {
  Dataset,
  PersonNode,
  WorkNode,
  Relation,
  RelationType,
} from '../src/types/Node.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPARQL_DIR = resolve(__dirname, 'sparql');
const OUTPUT_PATH = resolve(__dirname, '..', 'src', 'data', 'nodes_skeleton.json');
const ENDPOINT = 'https://query.wikidata.org/sparql';
const RATE_LIMIT_SLEEP_MS = 1000; // 5 query/s 上限的安全距离

// === Wikidata SPARQL 结果格式 ===
interface SparqlBinding {
  [key: string]: { type: string; value: string; 'xml:lang'?: string };
}
interface SparqlResult {
  results: { bindings: SparqlBinding[] };
}

async function runQuery(sparqlFile: string): Promise<SparqlBinding[]> {
  const sparql = readFileSync(resolve(SPARQL_DIR, sparqlFile), 'utf-8');
  const url = `${ENDPOINT}?query=${encodeURIComponent(sparql)}`;
  console.log(`[fetch] ${sparqlFile}`);

  const res = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'marx-star-map-m2/0.1 (https://github.com/cdu52802-Xx/marx)',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SPARQL ${sparqlFile} failed: HTTP ${res.status}\n${body.slice(0, 500)}`);
  }

  const json = (await res.json()) as SparqlResult;
  console.log(`  ← ${json.results.bindings.length} rows`);
  return json.results.bindings;
}

// 从 Wikidata URI 抽 QID，如 http://www.wikidata.org/entity/Q9061 → marx-q9061
function qidFromUri(uri: string): string {
  const match = uri.match(/Q\d+$/);
  if (!match) {
    throw new Error(`fetch-skeleton: cannot extract QID from "${uri}"`);
  }
  return `wd-${match[0].toLowerCase()}`;
}

function pickInt(b: SparqlBinding, key: string): number | undefined {
  const v = b[key]?.value;
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? undefined : n;
}

function pickStr(b: SparqlBinding, key: string): string {
  return b[key]?.value ?? '';
}

// 已知 Marx 自己的 fixed entry
const MARX_NODE: PersonNode = {
  id: 'wd-q9061',
  type: 'person',
  name_zh: '卡尔·马克思',
  name_orig: 'Karl Marx',
  birth_year: 1818,
  death_year: 1883,
  main_location_lat_lng: [51.5074, -0.1278], // 伦敦
  bio_event_style: [
    '1818年5月 - 生于普鲁士特里尔',
    '1841年 - 耶拿大学博士论文',
    '1844年8月 - 巴黎遇恩格斯，思想合流',
    '1849年8月 - 流亡伦敦，余生 34 年',
    '1867年9月 - 《资本论》第一卷出版',
  ],
  citation_urls: [
    'https://www.marxists.org/archive/marx/',
    'https://plato.stanford.edu/entries/marx/',
  ],
};

async function fetchPersons(): Promise<{ persons: PersonNode[]; relations: Relation[] }> {
  const personMap = new Map<string, PersonNode>();
  const relations: Relation[] = [];
  personMap.set(MARX_NODE.id, MARX_NODE);

  // 1. influences (P737) Marx 受影响于
  const influences = await runQuery('01-marx-influences.sparql');
  await sleep(RATE_LIMIT_SLEEP_MS);
  for (const b of influences) {
    const id = qidFromUri(b.person.value);
    if (!personMap.has(id)) {
      personMap.set(id, makeMinimalPerson(id, b));
    }
    relations.push({ source: id, target: MARX_NODE.id, type: 'influences' });
  }

  // 2. influenced (P737 反向) Marx 影响了
  const influenced = await runQuery('02-marx-influenced.sparql');
  await sleep(RATE_LIMIT_SLEEP_MS);
  for (const b of influenced) {
    const id = qidFromUri(b.person.value);
    if (!personMap.has(id)) {
      personMap.set(id, makeMinimalPerson(id, b));
    }
    relations.push({ source: MARX_NODE.id, target: id, type: 'influences' });
  }

  // 3. collaborators (P1327)
  const collaborators = await runQuery('03-marx-collaborators.sparql');
  await sleep(RATE_LIMIT_SLEEP_MS);
  for (const b of collaborators) {
    const id = qidFromUri(b.person.value);
    if (!personMap.has(id)) {
      personMap.set(id, makeMinimalPerson(id, b));
    }
    relations.push({ source: MARX_NODE.id, target: id, type: 'friend_collaborator' });
  }

  // 4. students/teachers (P802 / P1066)
  const studentsTeachers = await runQuery('04-marx-students-teachers.sparql');
  await sleep(RATE_LIMIT_SLEEP_MS);
  for (const b of studentsTeachers) {
    const id = qidFromUri(b.person.value);
    if (!personMap.has(id)) {
      personMap.set(id, makeMinimalPerson(id, b));
    }
    const rel = b.relation?.value;
    if (rel === 'teacher_of_marx') {
      relations.push({ source: id, target: MARX_NODE.id, type: 'mentor' });
    } else {
      relations.push({ source: MARX_NODE.id, target: id, type: 'mentor' });
    }
  }

  return { persons: Array.from(personMap.values()), relations };
}

async function fetchWorks(authorMarxId: string): Promise<{ works: WorkNode[]; relations: Relation[] }> {
  const works: WorkNode[] = [];
  const relations: Relation[] = [];
  const rows = await runQuery('05-marx-works.sparql');
  for (const b of rows) {
    const id = qidFromUri(b.work.value);
    works.push({
      id,
      type: 'work',
      name_zh: pickStr(b, 'workLabel'),
      name_orig: pickStr(b, 'workLabel'), // M2 简化：原文同 label，M3 阶段 B 人工补
      pub_year: pickInt(b, 'pubYear') ?? 0,
      author_id: authorMarxId,
      writing_period: pickInt(b, 'pubYear') ? String(pickInt(b, 'pubYear')) : 'unknown',
      summary: 'M3 阶段 B 人工补充', // M2 占位，M3 校对
      citation_urls: [],
    });
    relations.push({ source: authorMarxId, target: id, type: 'author' });
  }
  return { works, relations };
}

// 用 SPARQL 行造一个 minimum PersonNode（M2 字段尽量填，缺的占位等 M3 校对）
function makeMinimalPerson(id: string, b: SparqlBinding): PersonNode {
  return {
    id,
    type: 'person',
    name_zh: pickStr(b, 'personLabel'),
    name_orig: pickStr(b, 'personLabel'), // M3 阶段 B 人工补原文
    birth_year: pickInt(b, 'birthYear') ?? 0,
    death_year: pickInt(b, 'deathYear') ?? 0,
    main_location_lat_lng: [0, 0], // M3 阶段 B 人工补
    bio_event_style: [], // M3 阶段 B 人工补
    citation_urls: [],
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  console.log('[fetch-skeleton] Marx 星图 M2 数据采集开始');
  console.log(`endpoint = ${ENDPOINT}`);
  console.log(`output = ${OUTPUT_PATH}\n`);

  const { persons, relations: personRels } = await fetchPersons();
  console.log(`\npersons: ${persons.length} (含 Marx 自己)`);

  const { works, relations: workRels } = await fetchWorks(MARX_NODE.id);
  console.log(`works: ${works.length}`);

  const dataset: Dataset = {
    nodes: [...persons, ...works],
    relations: [...personRels, ...workRels],
  };

  console.log(`\ntotal: ${dataset.nodes.length} nodes / ${dataset.relations.length} relations`);

  console.log('[validate] 跑 schema 校验...');
  validateDataset(dataset);
  console.log('[validate] OK\n');

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(dataset, null, 2), 'utf-8');
  console.log(`[fetch-skeleton] wrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('[fetch-skeleton] FAILED:', err);
  process.exit(1);
});
```

- [ ] **Step 2: 修改 package.json 加 fetch:skeleton script**

在 scripts 节添加 `"fetch:skeleton": "tsx scripts/fetch-skeleton.ts"`，最终 scripts 节：

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
    "format": "prettier --write .",
    "fetch:skeleton": "tsx scripts/fetch-skeleton.ts"
  }
}
```

- [ ] **Step 3: 跑 lint 验证脚本无类型错**

```bash
npm run lint
```

Expected: 0 error 0 warning。如果 lint 报 scripts/ 不在 ignore 列表（fetch-skeleton.ts 命中规则），会有真实报错——修。

> 注：`scripts/` 现在会被 lint 默认 include（eslint.config.js 没排除）。这正常，脚本也该 lint。

- [ ] **Step 4: Commit 脚本（先不跑）**

```bash
git add scripts/fetch-skeleton.ts package.json package-lock.json
git commit -m "feat(M2): fetch-skeleton.ts 数据采集脚本（含合并去重 + schema 校验）"
```

---

## Task 6: 跑脚本拉真实数据 + 输出校验

**Files:**
- Create: `src/data/nodes_skeleton.json`（脚本生成）

> 这步真去调 Wikidata，会产生网络请求 + 实际数据写入。如果 Wikidata 暂时不可达，等等再跑。

- [ ] **Step 1: 跑 fetch-skeleton 脚本**

```bash
npm run fetch:skeleton
```

Expected 输出（数字会有出入）：
```
[fetch-skeleton] Marx 星图 M2 数据采集开始
endpoint = https://query.wikidata.org/sparql
output = ...src/data/nodes_skeleton.json

[fetch] 01-marx-influences.sparql
  ← 12 rows
[fetch] 02-marx-influenced.sparql
  ← 35 rows
[fetch] 03-marx-collaborators.sparql
  ← 2 rows
[fetch] 04-marx-students-teachers.sparql
  ← 4 rows

persons: 38 (含 Marx 自己)
[fetch] 05-marx-works.sparql
  ← 8 rows
works: 8

total: 46 nodes / 53 relations
[validate] 跑 schema 校验...
[validate] OK

[fetch-skeleton] wrote .../src/data/nodes_skeleton.json
```

如果失败：
- HTTP 429 too many requests：调大 `RATE_LIMIT_SLEEP_MS` 重跑
- HTTP 500 server error：Wikidata 间歇故障，等一下重试
- schema 校验失败：脚本里规范化逻辑漏字段——根据错误信息修 makeMinimalPerson / fetchWorks
- 中文 label 部分缺失：`wikibase:label` 服务回退到英文了，可接受（M3 阶段 B 人工补）

- [ ] **Step 2: 检查输出 JSON 大小 + 节点数合理**

```bash
ls -lh src/data/nodes_skeleton.json
node -e "const d = require('./src/data/nodes_skeleton.json'); console.log('nodes', d.nodes.length, 'relations', d.relations.length); console.log('node types', [...new Set(d.nodes.map(n => n.type))]);"
```

Expected：
- 文件大小 5-50 KB
- nodes 30-60 之间，relations 30-80 之间
- node types 只含 `['person', 'work']`

如果 nodes < 20 或 relations < 10，可能 SPARQL 没拉到足够数据——回 Task 4 网页 UI 调试。

- [ ] **Step 3: 抽样人工 sanity check（PM 视角）**

打开 `src/data/nodes_skeleton.json`，找 5-10 个 person 看：
- 黑格尔（Hegel）应该在（Marx 受影响于）
- 恩格斯（Engels）应该在（合作者）
- 列宁（Lenin）应该在（受 Marx 影响，1870 年生 < 1900 过滤通过）
- 资本论 / 共产党宣言 应该在 works 里

如果重要人物缺失，可能 Wikidata 上 Q9061 的 P737 / P800 声明不全——记下来，M3 阶段 B 人工补。

- [ ] **Step 4: Commit 数据**

```bash
git add src/data/nodes_skeleton.json
git commit -m "data(M2): SPARQL 阶段 A 拉取 ~46 节点 + ~53 关系骨架"
```

> 注意：commit hash 数字以实际生成为准。

---

## Task 7: main.ts 切换到 load JSON

**Files:**
- Modify: `src/main.ts`
- Delete: `src/data/m1-skeleton.ts`
- Modify: `src/viz/relations.ts`（适配新 Node 类型联合）

- [ ] **Step 1: 修改 src/viz/relations.ts 适配新 Node 类型**

旧 relations.ts 的 `SimNode extends d3.SimulationNodeDatum, Node` 在新 Node 是 union 类型时仍然合法，但 d3 types 跟 union 不太友好——把 SimNode 简化为只关心 id + name_zh：

```typescript
import * as d3 from 'd3';
import type { Dataset, Node, Relation } from '../types/Node.ts';

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name_zh: string;
  type: Node['type'];
}
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

  svg.selectAll('*').remove();

  const simNodes: SimNode[] = dataset.nodes.map((n) => ({
    id: n.id,
    name_zh: n.name_zh,
    type: n.type,
  }));
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
        .distance(80), // 节点变多，连线缩短
    )
    .force('charge', d3.forceManyBody().strength(-150)) // 节点变多，斥力减小避免炸开
    .force('center', d3.forceCenter(width / 2, height / 2));

  const linkGroup = svg
    .append('g')
    .attr('class', 'links')
    .selectAll<SVGLineElement, SimLink>('line')
    .data(simLinks)
    .join('line')
    .attr('stroke', '#888')
    .attr('stroke-width', 1) // 节点变多，连线变细避免视觉混乱
    .attr('data-testid', 'relation-line');

  const nodeGroup = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll<SVGCircleElement, SimNode>('circle')
    .data(simNodes)
    .join('circle')
    .attr('r', 8) // 节点变多，半径减小
    .attr('fill', '#7c5dbe') // M4 替换为 5 色编码
    .attr('data-testid', 'node-circle')
    .attr('data-node-id', (d) => d.id);

  const labelGroup = svg
    .append('g')
    .attr('class', 'labels')
    .selectAll<SVGTextElement, SimNode>('text')
    .data(simNodes)
    .join('text')
    .text((d) => d.name_zh)
    .attr('font-size', 10) // 节点变多，字号减小
    .attr('text-anchor', 'middle')
    .attr('dy', 18)
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

- [ ] **Step 2: 修改 src/main.ts 改为 import JSON + 跑 schema 校验**

```typescript
import { renderRelations } from './viz/relations.ts';
import { validateDataset } from './lib/schema.ts';
import datasetJson from './data/nodes_skeleton.json';
import type { Dataset } from './types/Node.ts';

console.log('[Marx M2] entry');

const dataset = datasetJson as Dataset;

try {
  validateDataset(dataset);
  console.log(`[Marx M2] dataset validated: ${dataset.nodes.length} nodes / ${dataset.relations.length} relations`);
} catch (err) {
  console.error('[Marx M2] dataset 校验失败，渲染将中止:', err);
  throw err;
}

renderRelations('#relations-svg', dataset);
```

- [ ] **Step 3: 删除 src/data/m1-skeleton.ts（已不再使用）**

```bash
git rm src/data/m1-skeleton.ts
```

- [ ] **Step 4: 调整 vite/tsconfig 允许 import JSON**

检查 `tsconfig.json` 是否含 `"resolveJsonModule": true`。M1 没显式开启但 TS 默认。如果 `npm run build` 报 "Cannot find module './data/nodes_skeleton.json'"，加上：

```json
{
  "compilerOptions": {
    // ... 现有配置
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 5: 跑 dev server 视觉验证**

```bash
npm run dev
```

打开 http://localhost:5173/marx/，Expected：
- 浏览器看到 ~30-50 个紫色小圆 + 力导向布局动画
- 每个圆下面有中文人名 / 著作名 label
- 圆之间有灰色连线（关系骨架）
- DevTools console 打印 `[Marx M2] dataset validated: X nodes / Y relations`

如果浏览器空白：
- Console 看错误信息
- 最常见：JSON import 类型不匹配 → 看 schema 校验错误

按 Ctrl+C 停 dev server。

- [ ] **Step 6: Commit 渲染切换**

```bash
git add src/main.ts src/viz/relations.ts tsconfig.json
git commit -m "feat(M2): main.ts 切到 load JSON skeleton + 适配密集节点渲染参数"
```

---

## Task 8: 测试更新（unit + e2e 适配新数据规模）

**Files:**
- Modify: `tests/unit/relations.test.ts`（替代旧 m1Dataset，构造新测试 fixture）
- Modify: `e2e/deploy.spec.ts`（节点数 expected 从 2 改为 >= 20）

> M1 的 relations.test.ts 依赖 `m1Dataset`（已删），必须改。e2e 的 expected 节点数也要从 "= 2" 放宽到 ">= 20"（数据从 SPARQL 拉，会有小幅波动）。

- [ ] **Step 1: 修改 tests/unit/relations.test.ts 用 inline fixture**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderRelations } from '../../src/viz/relations.ts';
import type { Dataset } from '../../src/types/Node.ts';

const m2TestFixture: Dataset = {
  nodes: [
    {
      id: 'wd-q9061',
      type: 'person',
      name_zh: '卡尔·马克思',
      name_orig: 'Karl Marx',
      birth_year: 1818,
      death_year: 1883,
      main_location_lat_lng: [51.5074, -0.1278],
      bio_event_style: [],
      citation_urls: [],
    },
    {
      id: 'wd-q33760',
      type: 'person',
      name_zh: '弗里德里希·恩格斯',
      name_orig: 'Friedrich Engels',
      birth_year: 1820,
      death_year: 1895,
      main_location_lat_lng: [53.4808, -2.2426],
      bio_event_style: [],
      citation_urls: [],
    },
    {
      id: 'wd-q183242',
      type: 'work',
      name_zh: '资本论',
      name_orig: 'Das Kapital',
      pub_year: 1867,
      author_id: 'wd-q9061',
      writing_period: '1857-1867',
      summary: '资本主义生产方式批判',
      citation_urls: [],
    },
  ],
  relations: [
    { source: 'wd-q9061', target: 'wd-q33760', type: 'friend_collaborator' },
    { source: 'wd-q9061', target: 'wd-q183242', type: 'author' },
  ],
};

describe('renderRelations · M2', () => {
  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="600" height="400"></svg>';
  });

  it('throws when svg selector not found', () => {
    expect(() => renderRelations('#nonexistent', m2TestFixture)).toThrow(/SVG not found/);
  });

  it('renders one circle per node', () => {
    renderRelations('#test-svg', m2TestFixture);
    const circles = document.querySelectorAll('[data-testid="node-circle"]');
    expect(circles.length).toBe(3);
  });

  it('renders one line per relation', () => {
    renderRelations('#test-svg', m2TestFixture);
    const lines = document.querySelectorAll('[data-testid="relation-line"]');
    expect(lines.length).toBe(2);
  });

  it('attaches data-node-id matching dataset ids', () => {
    renderRelations('#test-svg', m2TestFixture);
    const circles = Array.from(document.querySelectorAll('[data-testid="node-circle"]'));
    const ids = circles.map((c) => c.getAttribute('data-node-id')).sort();
    expect(ids).toEqual(['wd-q183242', 'wd-q33760', 'wd-q9061']);
  });

  it('renders person + work labels in Chinese', () => {
    renderRelations('#test-svg', m2TestFixture);
    const labels = Array.from(document.querySelectorAll('[data-testid="node-label"]'));
    const names = labels.map((l) => l.textContent).sort();
    expect(names).toContain('卡尔·马克思');
    expect(names).toContain('弗里德里希·恩格斯');
    expect(names).toContain('资本论');
  });
});
```

- [ ] **Step 2: 跑 unit 测试**

```bash
npm test
```

Expected: 14 测试 pass（5 relations + 7 schema + 2 types）。如果 fail，按错误调。

- [ ] **Step 3: 修改 e2e/deploy.spec.ts 适配新规模**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Marx 星图 M2 · 在线部署形态校验', () => {
  test('页面标题正确', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Marx 星图/);
  });

  test('SVG 容器存在', async ({ page }) => {
    await page.goto('/');
    const svg = page.getByTestId('relations-svg');
    await expect(svg).toBeVisible();
  });

  test('渲染至少 20 个节点圆（M2 SPARQL 骨架规模）', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800); // 节点变多，等 force simulation 稳定时间加长
    const circles = page.getByTestId('node-circle');
    const count = await circles.count();
    expect(count).toBeGreaterThanOrEqual(20);
  });

  test('渲染至少 20 条关系连线', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800);
    const lines = page.getByTestId('relation-line');
    const count = await lines.count();
    expect(count).toBeGreaterThanOrEqual(20);
  });

  test('Marx 自己的节点 + 中文标签存在', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800);
    const labels = page.getByTestId('node-label');
    await expect(labels.filter({ hasText: '卡尔·马克思' })).toHaveCount(1);
  });
});
```

- [ ] **Step 4: 跑 e2e 测试**

```bash
npm run e2e
```

Expected: 5/5 pass。

- [ ] **Step 5: 跑全套校验**

```bash
npm run lint && npm test && npm run build
```

Expected: 全绿。

- [ ] **Step 6: Commit 测试更新**

```bash
git add tests/unit/relations.test.ts e2e/deploy.spec.ts
git commit -m "test(M2): 适配新 schema + e2e 节点数 expected >= 20"
```

---

## Task 9: 部署 + 在线验证 + README + M2 takeaway

**Files:**
- Modify: `README.md`
- Create: `docs/2026-05-XX-m2-takeaway.md`（XX = 实际完成日）

- [ ] **Step 1: 推到 origin/main 触发部署**

```bash
git push origin main
```

Expected: GitHub Actions 在 https://github.com/cdu52802-Xx/marx/actions 显示 workflow run 启动。

- [ ] **Step 2: 等 workflow 跑完（约 2-3 分钟）**

打开 https://github.com/cdu52802-Xx/marx/actions 看最新一次 run 是否绿色 ✓。

如果 fail，可能：
- npm ci 失败 → 检查 package-lock.json 提交
- lint fail → 本地 `npm run lint` 看哪个 file
- test fail → 本地 `npm test` 复现
- build fail with JSON import → 看 Step 4 tsconfig 是否含 `resolveJsonModule`

- [ ] **Step 3: 访问在线 URL 视觉验证**

浏览器打开 https://cdu52802-xx.github.io/marx/。

Expected：
- 看到 ~30-50 个紫色小圆 + 中文 label 散布在 SVG 区域
- 圆之间有灰色连线，构成关系网络
- Force-directed 布局让节点稳定到合理位置
- DevTools Console 打印 `[Marx M2] dataset validated: X nodes / Y relations` 无报错

- [ ] **Step 4: 修改 README.md 加 M2 节 + 进度更新**

在 README 现有 "## M1" 节后面追加 M2 节，并把 "## 当前 milestone 进度" 表里的 M2 行改成 `[x]`：

```markdown
## M2 数据 schema + SPARQL 阶段 A（已上线）

线上数据从 Wikidata 拉的关系骨架，约 30-50 节点（人 + 著作）。

### 数据采集

\`\`\`bash
npm run fetch:skeleton    # 重跑 SPARQL 拉数据，覆盖 src/data/nodes_skeleton.json
\`\`\`

详见 [scripts/README.md](scripts/README.md)。

### 当前 milestone 进度

- [x] **M1** 项目骨架 + Hello World deploy（2026-05-07）
- [x] **M2** 数据 schema + SPARQL 阶段 A（2026-05-XX）
- [ ] **M3** 数据采集阶段 B + C（plan 待写）
- [ ] **M4** 关系图主视图 + 共享元素（plan 待写）
- [ ] **M5** 地理图画中画副视图（plan 待写）
- [ ] **M6** UI/UX 优化 + 验证 + ship（plan 待写）
```

> 注意：实际 commit 时把 XX 替换为完成日。

- [ ] **Step 5: 形态评估（PM 决策点，agent 不做）**

打开线上 URL，自己看 30-50 紫圆的形态，判断：

- [ ] 是否到"基本认得出是什么"的 mockup 门槛？
- [ ] 是否要触发提醒系统节点 ②（mockup 校验访谈）？

**预期回答**：还**不**到门槛（依然只是密集紫圆 + 灰线，没有 5 色编码 / 没有详情卡 / 没有时间轴），按 memory feedback 规则**不触发**节点 ②，留到 M4-M5 完成后再评估。

把判断结果落到 takeaway 里。

- [ ] **Step 6: 落 M2 takeaway 到 docs/**

新建 `docs/2026-05-XX-m2-takeaway.md`（XX = 实际完成日）：

```markdown
# Marx M2 takeaway · 数据 schema + SPARQL 阶段 A

> 完成日期：2026-05-XX
> 关联：[plans/2026-05-07-marx-star-map-m2-data-schema-sparql-a.md](../plans/2026-05-07-marx-star-map-m2-data-schema-sparql-a.md)
> 在线：https://cdu52802-xx.github.io/marx/

## 实际花了多久？

[填实际工时 vs plan 估的范围]

每个 task 的 commit hash：

| Task | Commit | 内容 |
|---|---|---|
| 1 | xxx | 前置检查 + tsx 装 |
| 2 | xxx | 类型扩展 5 + 8 |
| 3 | xxx | schema 校验 + 单测 7/7 |
| 4 | xxx | SPARQL 5 模板 |
| 5 | xxx | fetch-skeleton 脚本 |
| 6 | xxx | 拉 ~46 节点真实数据 |
| 7 | xxx | main.ts 切 JSON |
| 8 | xxx | 测试适配 |
| 9 | xxx | README + 部署 |

## 哪些坑值得记下来？

- [实际遇到的坑 1，未来 M3 怎么避]
- ...

## 哪些下次可以更快？

- [改进点 1]
- ...

## 当前 M2 验证状态

| 判定项 | 状态 |
|---|---|
| `npm run lint` 0 warning | |
| `npm test` 14 pass | |
| `npm run e2e` 5 pass | |
| `npm run fetch:skeleton` 跑通 | |
| `npm run build` 成功 | |
| GitHub Actions 绿色 | |
| 在线 URL 显示 ≥20 节点 | |
| 形态门槛评估 | 未到 mockup 门槛，不触发节点 ② |

## 下一个 milestone（M3）入口

调 `superpowers:writing-plans` skill 写 M3 plan（数据采集阶段 B 人工校对 + C 后来者旁注，按 design doc § 6.1 阶段 B + C）。

**建议开场白**：
> "M2 已完成 + 已上线（在线 URL https://cdu52802-xx.github.io/marx/，takeaway 在 docs/2026-05-XX-m2-takeaway.md）。M3 范围是 design doc § 6.1 阶段 B（人工校对 SPARQL 骨架，补 50 人 + 20 著作的字段缺失：原文名 / 经纬度 / 事件式 bio）+ 阶段 C（12 核心概念 × 3-5 后来者旁注 300-500 字）。请基于 M2 takeaway 已知坑写 M3 plan。"
```

- [ ] **Step 7: M2 收尾 commit + push**

```bash
git add README.md docs/2026-05-XX-m2-takeaway.md
git commit -m "docs(M2): README 加 M2 节 + 落 M2 takeaway"
git push origin main
```

Expected: 触发又一次 workflow run；几分钟后线上 URL 仍正常。

---

## M2 验证 / 完成判定

每条都要 ✓：

- [ ] `npm run lint` 0 error 0 warning
- [ ] `npm test` ≥ 14 pass（5 relations + 7 schema + 2 types）
- [ ] `npm run e2e` 5/5 pass
- [ ] `npm run fetch:skeleton` 跑通无报错
- [ ] `src/data/nodes_skeleton.json` 含 ≥20 节点 + ≥20 关系
- [ ] schema 校验通过（脚本 + 产品启动都要过）
- [ ] `npm run build` 成功
- [ ] GitHub Actions workflow 最近一次绿色
- [ ] https://cdu52802-xx.github.io/marx/ 浏览器看到 30+ 紫圆 + 关系连线 + 中文标签
- [ ] README M2 节已加，进度勾 M2 = `[x]`
- [ ] `docs/2026-05-XX-m2-takeaway.md` 已落
- [ ] 形态门槛评估已记录（预期：未到，不触发节点 ②）

---

## 常见问题排查

**Q1: SPARQL 查询超时（504 / 524）**
A: Wikidata 间歇故障，等 30s-2min 重试。或在 https://query.wikidata.org/ 网页 UI 单独跑那个查询确认是 endpoint 问题还是脚本问题。

**Q2: SPARQL 返回 429 too many requests**
A: 调大 `RATE_LIMIT_SLEEP_MS`（如 2000），重跑。

**Q3: 中文 label 部分缺失（显示英文）**
A: `wikibase:label` 服务有些 entity 没中文 label，回退英文。可接受，M3 阶段 B 人工补。

**Q4: schema 校验在 fetch-skeleton 里失败**
A: 看具体报错信息：
- `missing required field` → makeMinimalPerson / fetchWorks 漏字段
- `relation source/target not in nodes` → 关系引用了不在 nodes 池里的 id
- `duplicate node id` → 多个 SPARQL 查询返回了同一个 QID 但脚本没去重

**Q5: vite build 报 "Cannot find module './data/nodes_skeleton.json'"**
A: tsconfig.json 加 `"resolveJsonModule": true`。

**Q6: 浏览器线上空白，DevTools 说 schema 校验错**
A: 跟 Q4 同源——脚本生成的 JSON 不符合 schema。回 Task 6 重跑脚本。

**Q7: 节点太密看不清**
A: 这是预期形态——M2 范围内不优化视觉。M4 加 5 色编码 / 节点筛选 / 详情卡之后会改善。**这个判断要进 takeaway**：M2 形态不到 mockup 门槛，不触发节点 ② 访谈。

**Q8: tsx 在 Windows 上跑脚本编码乱码**
A: 命令行先 `chcp 65001`（切 UTF-8 codepage）再跑 `npm run fetch:skeleton`。

---

## 下一个 milestone

M2 完成后：

1. **不触发**提醒系统节点 ②（按 user research threshold memory）
2. 评估当前形态是否给 M3 的范围带来调整（如 SPARQL 拉到的人物如果跟 design doc § 5.2 「12 核心概念 × 10 后来者池」名单严重不匹配，要在 M3 阶段 B 调整）
3. 调 `superpowers:writing-plans` skill 写 M3 plan（数据采集阶段 B 人工校对 + C 后来者旁注）
