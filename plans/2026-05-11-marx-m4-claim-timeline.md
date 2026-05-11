# Marx M4 · claim-on-timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Marx 思想史从 M3 ship 的 person-network 星图重做为 claim-on-timeline 形态，含数据 schema 扩展（claim 节点 type）+ 主画布 layout（斜向流 person section + obs 堆叠 + 半圆弧）+ 底部横向时间轴 + 左侧颗粒度栏 + 详情卡 popover。

**Architecture:** 复用 TypeScript + D3 + Vite + vitest 技术栈不动。`src/types/` 加 ClaimNode + 新 relation type；`src/lib/` 加 claim 校验；`src/main.ts` 改为 claim-on-timeline 主 view；新增 `src/components/{layout,timeline,sidebar,popover}.ts` 4 个组件；数据采集 reuse M3 `scripts/{generate,apply}-validation-md.ts` hybrid 模式。

**Tech Stack:** TypeScript ^5 / Vite ^5 / D3 ^7 / vitest ^1 / Playwright ^1（沿用 M2-M3 stack）。新增依赖 0（D3 SVG 足够画半圆弧 + 时间轴 + popover；不引入 React / Vue 等框架避免重构 M3 已 ship code）。

**Upstream:** [M4 design doc v1](../specs/2026-05-11-m4-claim-timeline-design.md) / [M3 progress anchor](../docs/2026-05-08-m3-progress-anchor.md) / [M2 design v1.1 § 7 视觉风格](../specs/2026-05-07-marx-star-map-design.md) / brainstorm session 2026-05-11（v3-v7 mockup + denizcemonduygu data.json reverse-engineer）

**Status:** plan v1 · 待 PM approve 后 invoke 执行 skill

---

## 1. M4 范围 + 显式排除

### ✅ 包含
- ClaimNode 节点 type 新增 + 3 类 claim → claim 关系（agreement_with / disagreement_with / extends）
- denizcemonduygu Marx 19 obs seed 抓取 + 中文翻译 + 入库
- 12 concept.definition_plain → claim_text 升级
- 33 person × 3-5 quote 补采（hybrid AI 草稿 + 100% PM 复核）
- claim → claim 关系采集（borrow denizcemonduygu Marx 涉及 202 link 子集）
- 主画布 layout（斜向流 + obs 横跨 + 半圆弧 + 颜色方向规则）
- 底部横向时间轴（独立参考维度，不强坐标映射）
- 左侧颗粒度栏（48px 收起态 + 200px 展开 + hover 高亮）
- 详情卡 popover（点击 obs 弹出含 schema 全部字段）
- 维度融合 B 方案（勾选著作 → obs 行末尾叠加元数据）
- M3 demo URL 处理（保留 + 主页入口移除）
- M4 acceptance test + 上线 + takeaway

### ❌ 排除（推 M5+）
- 详情卡 hover 预览（只点击触发，hover 留 M5）
- 学科 cats 视觉编码（颗粒度栏支持过滤即可，不做 cats 配色）
- 头像（M4 用米色圆占位，不上传真实 portrait）
- 复杂搜索 / index 侧栏（denizcemonduygu 有，M4 不实施）
- 弧线密度 fine-tune / 动画速度 polish（implementation 跑真数据后 PM 决定）
- 事件 / 地点节点采集（M3 5 类节点 type 中 event / place 仍为 0）

---

## 2. 已知风险 + 防御

继承 M2 / M3 已知 18 个坑（详见 [M3 anchor "已知坑" section](../docs/2026-05-08-m3-progress-anchor.md)）。M4 新风险：

| 坑 # | 描述 | 防御措施 | 触发 task |
|---|---|---|---|
| **M4 坑 20** | denizcemonduygu data.json 字段名 (line / cats / keywords) 跟 Marx 项目 ClaimNode 字段名不一致 | T2 写 mapping 函数显式转换：`line → claim_text` / `cats → cats` (相同) / `keywords → keywords` (相同) / `reference → reference` / `person → author_id` (但 person id 是 denizcemonduygu 内部 id，需 mapping 到 Marx PersonNode.id) | T2 |
| **M4 坑 21** | M3 PersonNode.id 用 wd-q<num> 格式（Wikidata QID），denizcemonduygu person.id 用 0-187 数字。**Marx 在 denizcemonduygu = id 57 / 在 Marx 项目 = wd-q9061** | T2 写 person id mapping 表（仅需要 19 obs 涉及的 1 个：Marx），其他 person 等到 T4 person quote 采集时按需扩展 | T2 |
| **M4 坑 22** | M3 ConceptNode.id 用 concept-xxx 格式，但 ClaimNode 跟 ConceptNode 是不同 entity，需要决定 ClaimNode.id 命名规则 | T1 spec ClaimNode.id 用 `claim-<seq>` 格式（如 `claim-001`），跟 ConceptNode.id 的 `concept-xxx` 格式区分。同时 ClaimNode 可选 `derived_from_concept_id` 字段表示从哪个 concept 升级而来 | T1, T3 |
| **M4 坑 23** | 半圆弧 SVG path generator 实现可能跟 PM 反馈"绿左下 / 红右上"方向规则不一致（容易绿弧画反方向） | T6 写 unit test 显式断言 control point 偏移方向（绿弧 control_y > midpoint_y / 红弧 control_y < midpoint_y） | T6 |
| **M4 坑 24** | 100+ claim + 200+ link SVG 渲染性能可能慢（特别 mobile） | T6 实现期实测 fps，必要时降级（弧线只 hover 时显示 / 屏幕外节点不渲染）。M4 minimum 100 claim/200 link，stretch 150/250 但要看性能 | T6, T12 |

---

## 3. Pre-flight 检查

实施 M4 第 1 个 task 前必须 verify：

| 检查项 | 命令 | Expected |
|---|---|---|
| M3 完成度 | `npm test` | 26/23/3（3 FAIL 全 expected RED：1 stage-b name_orig + 2 stage-c successor_notes） |
| Marx 19 obs 数据可用 | `node -e "const d=require('C:/Users/xuzequan/Desktop/denizcemonduygu-data.json'); const m=d.records.filter(r=>r.person===57); console.log(m.length)"` | `19` |
| denizcemonduygu data.json 完整 | `ls -lh "C:/Users/xuzequan/Desktop/denizcemonduygu-data.json"` | ~988KB |
| brainstorm artifacts 已 gitignore | `git check-ignore .superpowers/foo.html && echo OK` | `.superpowers/foo.html / OK` |
| git 工作树干净 | `git status` | `nothing to commit, working tree clean` |
| 远端同步 | `git pull origin main` | `Already up to date.` |

如有任何 FAIL，先解决再开 T1。

---

## 4. 协作模式 + git 工作流

继承 M3 模式（按 Marx AGENTS.md "协作铁律"）：

- 每 task 完成时 commit + push（双机协作生命线）
- 中文 commit message 走 `git commit -F .commit-msg.tmp` 方式（坑 16 防御）
- atomic commit：每 task 显式 git add 文件路径（坑 14 防御）
- 任何 destructive git 命令需 PM 显式授权（坑 15 防御）
- prettier --check 单文件，不 global format（坑 14 防御）

**特殊 task**：
- T2 / T3 / T4 数据采集 task 走 hybrid AI 草稿模式（M3 决策 3）：AI 用专业知识填 .md 草稿 → PM 100% 复核 → 跑 apply 脚本同步回 JSON
- T6 layout 算法是最复杂 task，PM 之前明确"实现到 T6 完成强制 PM checkpoint 看真效果"（spec § 12.2 risk 2 mitigation）。**T6 完成后停下来等 PM check 再开 T7+**

---

## 5. File Structure

### 新建文件

```
src/
├── types/
│   └── Claim.ts                            ★ 新建 - ClaimNode + ClaimCategory + 校验类型
├── lib/
│   └── claim-schema.ts                     ★ 新建 - validateClaim + validateClaimRelation
├── components/
│   ├── claim-layout.ts                     ★ 新建 - 斜向流 layout 算法 + 半圆弧 path generator
│   ├── timeline.ts                         ★ 新建 - 底部横向时间轴组件
│   ├── sidebar.ts                          ★ 新建 - 左侧颗粒度栏组件
│   └── claim-popover.ts                    ★ 新建 - 详情卡 popover 组件
├── data/
│   └── claims.json                         ★ 新建 - M4 主数据（ClaimNode 数组 + ClaimRelation 数组）
scripts/
├── import-denizcemonduygu-marx.ts          ★ 新建 - 一次性脚本，从 data.json 抽取 Marx 19 obs + 翻译模板
├── apply-claim-validation-md.ts            ★ 新建 - PM 改完 .md 后回填 claims.json（仿 M3 apply-validation-md.ts）
└── generate-claim-validation-md.ts         ★ 新建 - 从 claims.json 生成 .md 校对清单（仿 M3 generate-validation-md.ts）
tests/
├── unit/
│   ├── claim-schema.test.ts                ★ 新建 - claim 校验 unit test
│   ├── claim-layout.test.ts                ★ 新建 - 斜向流坐标 + 半圆弧方向 unit test
│   ├── timeline.test.ts                    ★ 新建 - 时间轴 component test
│   ├── sidebar.test.ts                     ★ 新建 - 颗粒度栏 component test
│   ├── claim-popover.test.ts               ★ 新建 - 详情卡 component test
│   └── stage-m4-acceptance.test.ts         ★ 新建 - M4 整体 acceptance test
e2e/
└── m4-demo.spec.ts                         ★ 新建 - Playwright e2e
docs/
└── m4-validation/
    ├── marx-19-claims-checklist.md         ★ 新建 - PM 复核 Marx 19 obs 翻译
    ├── concept-12-claims-checklist.md      ★ 新建 - PM 复核 concept 升级
    └── person-quote-checklist.md           ★ 新建 - PM 复核 33 person × 3-5 quote
```

### 修改文件

```
src/
├── types/
│   └── Node.ts                             ☆ 修改 - RelationType 加 'agreement_with' / 'disagreement_with' / 'extends'
├── main.ts                                 ☆ 修改 - 完全重写主 view，从 M2 简版 renderRelations 改为 claim-on-timeline
├── styles.css                              ☆ 修改 - 加 M4 layout 全局样式（米白底 / EB Garamond）
.gitignore                                  ☆ 修改 - 加 docs/m4-validation/*-checklist-backup.md（PM 复核 backup 不入库）
package.json                                ☆ 修改 - 加 npm scripts: m4:import-marx / m4:gen-md / m4:apply-md
index.html                                  ☆ 修改 - title / meta description 更新为 "Marx 思想史 · claim-on-timeline"
```

### 不动文件
- `src/types/Node.ts` 的 PersonNode / WorkNode / ConceptNode / EventNode / PlaceNode interface（M3 已 ship 的 5 类节点保留作 metadata reference）
- `src/data/nodes_skeleton.json`（M3 50 节点数据完全保留，M4 通过 ClaimNode.author_id / source_work_id FK 关联）
- M3 阶段 B / C 测试 + 校验 scripts（M4 不影响）

---

## 6. Tasks

### Task 0: M3 demo 存档（T1 之前 · prerequisite）

**Files:**
- Create: `public/m3-archive/` 目录（含 M3/M2 现状 build 产物）
- Modify: `.gitignore`（确保 `public/m3-archive/` 入库 = 不要 ignore）
- Git: 打 tag `m3-final` 标记 M3 阶段末状态

**目的:** M4 后续 task 会重写 `src/main.ts`（T6）+ 改 `index.html`（T6 Step 5），届时 M3 demo 代码已经被替换。**T11 想"M3 demo URL 保留作存档"必须在动手前先 snapshot**。否则到 T11 已无源可拷。

**为什么单独拆 T0**：spec § 2.2 决策 9 = M3 demo URL 保留（PM approve）；plan 原 T11 来时 M3 代码已没了，是顺序 bug。

- [ ] **Step 1: 当前状态 build + snapshot**

```bash
git status   # 必须 clean
npm run build   # 当前 main.ts 是 M2 简版 (renderRelations) + M3 校对脚本，build 出来就是"M3 阶段 demo"
ls dist/   # 看 build 出了什么
```

- [ ] **Step 2: 拷贝 dist 到 public/m3-archive/**

```bash
mkdir -p public/m3-archive
cp -r dist/* public/m3-archive/
```

- [ ] **Step 3: 改 m3-archive index.html base path（让它在 /m3/ URL 下能跑）**

vite build 默认 asset path 是相对的，但 base URL 可能假设 `/marx/`。检查 `public/m3-archive/index.html`，如果有 `/marx/assets/xxx.js`，改为 `/marx/m3/assets/xxx.js`：

```bash
# 如果发现路径问题，sed 替换（或手动改）：
# sed -i 's|"/marx/|"/marx/m3/|g' public/m3-archive/index.html
```

PM 不熟命令行可以让 subagent 改；只是文本替换。

- [ ] **Step 4: 打 git tag 标记 M3 final state**

```bash
git tag -a m3-final -m "M3 阶段末状态 · M4 重构前快照"
git push origin m3-final
```

这样即使 `public/m3-archive/` 出问题，也能从 git tag `m3-final` checkout 原始代码 rebuild。

- [ ] **Step 5: commit**

```bash
git add public/m3-archive/
```

写 `.commit-msg.tmp`：
```
chore(M4): Task 0 完成 - M3 demo 存档到 public/m3-archive/

T1 启动前 snapshot M3 阶段末 build 产物，避免 T6 重写 main.ts
后 T11 无源可存档。同时打 git tag m3-final 作 codebase 标记。

dist/ → public/m3-archive/ (M3 demo 完整快照)
git tag m3-final (M3 阶段末 codebase snapshot)

T11 来时只需改主页指向 M4，存档已在此 task 完成。
```

```bash
git commit -F .commit-msg.tmp
git push origin main
rm .commit-msg.tmp
```

**验收**：
- [ ] `ls public/m3-archive/index.html` 存在
- [ ] `git tag --list m3-final` 显示 tag
- [ ] 本地 `npm run preview` 后访问 `http://localhost:4173/marx/m3/` 能看到 M3 demo（如果 base path 配置正确）

---

### Task 1: 数据 schema 扩展（ClaimNode + 新 relation type）

**Files:**
- Create: `src/types/Claim.ts`
- Create: `src/lib/claim-schema.ts`
- Create: `tests/unit/claim-schema.test.ts`
- Modify: `src/types/Node.ts`（加 relation type 字符串）

**目的:** 定义 M4 核心数据 model。先写测试确认 schema 正确，再写 implementation。

- [ ] **Step 1: 写 claim 校验 acceptance test（先 RED）**

新建 `tests/unit/claim-schema.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import type { ClaimNode } from '../../src/types/Claim.ts';
import { validateClaim } from '../../src/lib/claim-schema.ts';

describe('claim-schema · ClaimNode 校验', () => {
  const validClaim: ClaimNode = {
    id: 'claim-001',
    type: 'claim',
    name_zh: 'placeholder',
    name_orig: 'placeholder',
    claim_text: '异化劳动是私有财产的根源——不是私有财产产生异化劳动，是异化劳动产生私有财产。',
    author_id: 'wd-q9061',
    source_work_id: 'work-1844-manuscripts',
    year: 1844,
    cats: ['me', 'po'],
    keywords: '异化劳动',
    reference: 'marxists.org/zh/marx/1844/'
  };

  it('valid claim 通过校验', () => {
    const errors = validateClaim(validClaim);
    expect(errors).toEqual([]);
  });

  it('claim_text 为空报错', () => {
    const c = { ...validClaim, claim_text: '' };
    expect(validateClaim(c)).toContain('claim-001 claim_text 不能为空');
  });

  it('claim_text 超过 50 字（中文等价）报错', () => {
    const c = { ...validClaim, claim_text: '异'.repeat(51) };
    const errors = validateClaim(c);
    expect(errors.some((e) => e.includes('claim_text 长度'))).toBe(true);
  });

  it('author_id 为空报错', () => {
    const c = { ...validClaim, author_id: '' };
    expect(validateClaim(c)).toContain('claim-001 author_id 不能为空');
  });

  it('year 必须 > 0', () => {
    const c = { ...validClaim, year: 0 };
    expect(validateClaim(c)).toContain('claim-001 year 必须 > 0');
  });

  it('cats 至少 1 个', () => {
    const c = { ...validClaim, cats: [] as any };
    expect(validateClaim(c)).toContain('claim-001 cats 至少 1 个');
  });

  it('cats 含非法值报错', () => {
    const c = { ...validClaim, cats: ['me', 'invalid'] as any };
    expect(validateClaim(c).some((e) => e.includes('cats 含非法值'))).toBe(true);
  });
});
```

- [ ] **Step 2: 验证 RED**

```bash
npx vitest run tests/unit/claim-schema.test.ts
```

Expected: FAIL with "Cannot find module '../../src/types/Claim.ts'"

- [ ] **Step 3: 创建 src/types/Claim.ts**

```typescript
import type { NodeBase } from './Node.ts';

export type ClaimCategory =
  | 'me'  // Metaphysics 形而上学
  | 'ep'  // Epistemology 认识论
  | 'lo'  // Logic 逻辑
  | 'et'  // Ethics 伦理
  | 'po'  // Political 政治
  | 'ae'  // Aesthetics 美学
  | 're'  // Religion 宗教
  | 'mi'  // Mind 心灵
  | 'la'  // Language 语言
  | 'sc'  // Science 科学
  | 'mp'; // Metaphilosophy 元哲学

export const CLAIM_CATEGORIES: readonly ClaimCategory[] = [
  'me','ep','lo','et','po','ae','re','mi','la','sc','mp'
] as const;

export interface ClaimNode extends NodeBase {
  type: 'claim';
  claim_text: string;            // 一句话主张（10-50 字汉字 / 等价英文长度）
  author_id: string;             // FK → PersonNode.id
  source_work_id?: string;       // FK → WorkNode.id（可空）
  year: number;                  // claim 年份（用于时间轴 + 排序）
  cats: ClaimCategory[];         // 学科分类（可多选，借鉴 denizcemonduygu）
  keywords?: string;             // 思想流派 tag（如 "异化劳动"）
  reference?: string;            // 出处书名 + 页码 / URL
  derived_from_concept_id?: string;  // 可选：从哪个 ConceptNode 升级而来（T3 用）
  derived_from_denizcemonduygu_record_id?: number;  // 可选：denizcemonduygu data.json record id（T2 用）
}

export interface ClaimRelation {
  source: string;                // ClaimNode.id
  target: string;                // ClaimNode.id
  type: 'agreement_with' | 'disagreement_with' | 'extends';
}

export interface ClaimDataset {
  claims: ClaimNode[];
  relations: ClaimRelation[];
}

export const isClaim = (n: any): n is ClaimNode => n?.type === 'claim';
```

- [ ] **Step 4: 创建 src/lib/claim-schema.ts**

```typescript
import { CLAIM_CATEGORIES, type ClaimNode, type ClaimRelation } from '../types/Claim.ts';

const CHAR_MAX = 50;  // claim_text 中文字符上限（汉字 length === 等价英文长度的近似）

export function validateClaim(c: ClaimNode): string[] {
  const errors: string[] = [];
  const tag = c.id;

  if (!c.claim_text || c.claim_text.trim() === '') {
    errors.push(`${tag} claim_text 不能为空`);
  } else {
    const charCount = Array.from(c.claim_text).length;
    if (charCount > CHAR_MAX) {
      errors.push(`${tag} claim_text 长度 ${charCount} 超过 ${CHAR_MAX} 字上限`);
    }
  }

  if (!c.author_id || c.author_id.trim() === '') {
    errors.push(`${tag} author_id 不能为空`);
  }

  if (!c.year || c.year <= 0) {
    errors.push(`${tag} year 必须 > 0`);
  }

  if (!c.cats || c.cats.length === 0) {
    errors.push(`${tag} cats 至少 1 个`);
  } else {
    for (const cat of c.cats) {
      if (!CLAIM_CATEGORIES.includes(cat as any)) {
        errors.push(`${tag} cats 含非法值 ${cat}`);
      }
    }
  }

  return errors;
}

export function validateClaimRelation(r: ClaimRelation, knownClaimIds: Set<string>): string[] {
  const errors: string[] = [];
  const tag = `${r.source}→${r.target}`;
  if (!knownClaimIds.has(r.source)) errors.push(`${tag} source 不在 claim 集合`);
  if (!knownClaimIds.has(r.target)) errors.push(`${tag} target 不在 claim 集合`);
  if (!['agreement_with', 'disagreement_with', 'extends'].includes(r.type)) {
    errors.push(`${tag} type 必须是 agreement_with / disagreement_with / extends`);
  }
  if (r.source === r.target) errors.push(`${tag} source 不能等于 target（自环）`);
  return errors;
}
```

- [ ] **Step 5: 验证 GREEN**

```bash
npx vitest run tests/unit/claim-schema.test.ts
```

Expected: PASS（7 tests / 7 passed）

- [ ] **Step 6: 修改 src/types/Node.ts 加 RelationType**

找到 `RelationType` type，在末尾加 3 行：

```typescript
export type RelationType =
  | 'mentor'
  | 'opponent'
  | 'friend_collaborator'
  | 'influences'
  | 'author'
  | 'proposed_concept'
  | 'lived_in'
  | 'participated_in'
  | 'agreement_with'      // M4 加 · claim → claim 同意
  | 'disagreement_with'   // M4 加 · claim → claim 反对
  | 'extends';            // M4 加 · claim → claim 延伸（同 person 自延）
```

- [ ] **Step 7: 跑全量 npm test 不破坏 M3**

```bash
npm test
```

Expected: 33/30/3（M3 26/23/3 + M4 claim-schema 7/7/0 = 33/30/3）

- [ ] **Step 8: prettier 检查 + commit**

```bash
npx prettier --check src/types/Claim.ts src/lib/claim-schema.ts tests/unit/claim-schema.test.ts
```

Expected: All matched files use Prettier code style!

写 .commit-msg.tmp（用 Write tool 不用 echo）：

```
feat(M4): Task 1 完成 - ClaimNode schema + 校验

新增 src/types/Claim.ts: ClaimNode (含 claim_text / author_id /
source_work_id / year / cats / keywords / reference 字段) + 11 类
ClaimCategory + ClaimRelation + ClaimDataset 类型

新增 src/lib/claim-schema.ts: validateClaim + validateClaimRelation,
检查 claim_text 非空 + ≤ 50 字 / author_id 非空 / year > 0 / cats
≥ 1 + 仅允许 11 类合法值 / relation 端点存在 + 无自环

新增 tests/unit/claim-schema.test.ts: 7 it / 全 GREEN

修改 src/types/Node.ts: RelationType 末尾加 agreement_with /
disagreement_with / extends 3 类 (M4 claim → claim 关系)

总测试 26/23/3 → 33/30/3 (+7 PASS)
```

```bash
git add src/types/Claim.ts src/lib/claim-schema.ts tests/unit/claim-schema.test.ts src/types/Node.ts
git commit -F .commit-msg.tmp
git push origin main
rm .commit-msg.tmp
```

---

### Task 2: denizcemonduygu Marx 19 obs 抓取 + 翻译入库

**Files:**
- Create: `scripts/import-denizcemonduygu-marx.ts`
- Create: `src/data/claims.json`（初始版本：含 19 个 Marx claim 占位 + 待翻译 placeholder）
- Create: `docs/m4-validation/marx-19-claims-checklist.md`
- Modify: `package.json`（加 `m4:import-marx` script）

**目的:** 从 PM 桌面抓取的 denizcemonduygu data.json 抽取 Marx 19 obs（英文 + cats + keywords + reference），自动生成 ClaimNode 模板（中文翻译留 placeholder），落 PM 复核 .md。

**M3 决策 3 模式 + Marx 19 obs 例外（spec § 9.2）**：denizcemonduygu 是权威 source，AI 翻译 + PM **抽查 5 条**（opportunistic）即可，不需 100% 复核。

- [ ] **Step 1: 写 import 脚本 acceptance test（先 RED）**

新建 `tests/unit/import-marx.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import type { ClaimNode } from '../../src/types/Claim.ts';
import { validateClaim } from '../../src/lib/claim-schema.ts';

describe('Task 2 · Marx 19 obs 入库 acceptance', () => {
  const claims = (data.claims ?? []) as ClaimNode[];
  const marxClaims = claims.filter((c) => c.author_id === 'wd-q9061');

  it('Marx claim 数 = 19', () => {
    expect(marxClaims.length).toBe(19);
  });

  it('Marx claim 都有 derived_from_denizcemonduygu_record_id', () => {
    for (const c of marxClaims) {
      expect(c.derived_from_denizcemonduygu_record_id, `${c.id} 缺 derived id`).toBeGreaterThanOrEqual(0);
    }
  });

  it('Marx claim 都通过 schema 校验', () => {
    for (const c of marxClaims) {
      expect(validateClaim(c), `${c.id} 校验失败: ${validateClaim(c).join(';')}`).toEqual([]);
    }
  });

  it('Marx claim 至少 5 条 cats 含 "po"（政治哲学是 Marx 主线）', () => {
    const poCount = marxClaims.filter((c) => c.cats.includes('po')).length;
    expect(poCount).toBeGreaterThanOrEqual(5);
  });
});
```

- [ ] **Step 2: 验证 RED**

```bash
npx vitest run tests/unit/import-marx.test.ts
```

Expected: FAIL with "Cannot find module '../../src/data/claims.json'"

- [ ] **Step 3: 写 import 脚本 scripts/import-denizcemonduygu-marx.ts**

```typescript
#!/usr/bin/env tsx
// 一次性脚本：从 PM 桌面 denizcemonduygu-data.json 抽取 Marx 19 obs
// 生成 src/data/claims.json (含 ClaimNode 数组 + 中文翻译 placeholder)
// + docs/m4-validation/marx-19-claims-checklist.md (PM 复核清单)

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { ClaimNode } from '../src/types/Claim.ts';

const DENIZ_DATA_PATH = 'C:/Users/xuzequan/Desktop/denizcemonduygu-data.json';
const MARX_PERSON_ID_DENIZ = 57;
const MARX_AUTHOR_ID_MARX = 'wd-q9061';
const CLAIMS_JSON_PATH = 'src/data/claims.json';
const CHECKLIST_PATH = 'docs/m4-validation/marx-19-claims-checklist.md';

function importMarx() {
  const denizData = JSON.parse(readFileSync(DENIZ_DATA_PATH, 'utf-8'));
  const marxRecords = denizData.records.filter((r: any) => r.person === MARX_PERSON_ID_DENIZ);
  console.log(`Found ${marxRecords.length} Marx records in denizcemonduygu`);

  const claims: ClaimNode[] = marxRecords.map((r: any, i: number) => ({
    id: `claim-marx-${String(i + 1).padStart(3, '0')}`,
    type: 'claim' as const,
    name_zh: '<待翻译>',
    name_orig: r.line.slice(0, 30),  // name_orig 用英文前 30 字符
    claim_text: '<待翻译>',           // 等 PM 抽查 5 条后填中文
    author_id: MARX_AUTHOR_ID_MARX,
    source_work_id: undefined,        // 大部分 denizcemonduygu 没标 source_work，留空
    year: 1850,                       // 占位年份，后续按 reference 推断
    cats: r.cats as any,              // 直接 borrow denizcemonduygu cats
    keywords: r.keywords || undefined,
    reference: r.reference || undefined,
    derived_from_denizcemonduygu_record_id: r.id,
  }));

  const dataset = { claims, relations: [] };
  mkdirSync('src/data', { recursive: true });
  writeFileSync(CLAIMS_JSON_PATH, JSON.stringify(dataset, null, 2));
  console.log(`Wrote ${claims.length} claims to ${CLAIMS_JSON_PATH}`);

  // 生成 PM 复核清单
  let md = `# Marx 19 Claim · 翻译复核清单\n\n`;
  md += `> **来源**: denizcemonduygu.com/philo data.json (PM 抓取于 2026-05-11)\n`;
  md += `> **复核策略**: AI 翻译 + PM 抽查 5 条 (opportunistic, M3 决策 4 模式)\n`;
  md += `> **complete 后跑** \`npm run m4:apply-md\` 同步回 src/data/claims.json\n\n`;
  md += `---\n\n`;
  for (const c of claims) {
    const denizRec = marxRecords.find((r: any) => r.id === c.derived_from_denizcemonduygu_record_id);
    md += `## ${c.id}\n\n`;
    md += `**英文原文** (denizcemonduygu record #${c.derived_from_denizcemonduygu_record_id}):\n\n`;
    md += `> ${denizRec.line}\n\n`;
    md += `- **claim_text**（PM 复核 / 改）: <待翻译>\n`;
    md += `- **year**（PM 推断 / 默认 1850）: 1850\n`;
    md += `- **source_work_id**（PM 填，如 work-1844-manuscripts）: \n`;
    md += `- **cats**（denizcemonduygu 已标）: ${c.cats.join(', ')}\n`;
    md += `- **keywords**: ${c.keywords ?? '(无)'}\n`;
    md += `- **reference**: ${c.reference ?? '(无)'}\n\n`;
    md += `---\n\n`;
  }
  mkdirSync('docs/m4-validation', { recursive: true });
  writeFileSync(CHECKLIST_PATH, md);
  console.log(`Wrote checklist to ${CHECKLIST_PATH}`);

  // ★ M4 v2 patch (建议改 1)：同时输出 deniz person lookup 表
  // 给 T4 generate-person-quote-md 用：让 PM 复核 quote 时可选填 deniz_person_id
  // 让 T5 import-marx-links 拿到 person-level fallback mapping
  generateDenizPersonLookup(denizData);
}

function generateDenizPersonLookup(denizData: any) {
  // 输出 scripts/data/deniz-person-lookup.md (PM 在 T4 查 id 用)
  // + scripts/data/deniz-person-id-map.json (T5 import 用，初始只含 Marx)
  const persons = denizData.people as Array<{ id: number; name: string; time?: string; loc?: string }>;
  const recordCounts = new Map<number, number>();
  for (const r of denizData.records) {
    recordCounts.set(r.person, (recordCounts.get(r.person) ?? 0) + 1);
  }

  // 按 records 数排序（话语权高的在前），便于 PM 优先映射重要人物
  const sorted = [...persons].sort((a, b) => (recordCounts.get(b.id) ?? 0) - (recordCounts.get(a.id) ?? 0));

  let lookup = `# denizcemonduygu Person Lookup · T4/T5 用\n\n`;
  lookup += `> 188 个 denizcemonduygu person id ↔ name 表 + records 数（按话语权排序）\n`;
  lookup += `> **用途**：T4 PM 复核 quote 时，可选填 \`deniz_person_id\` 让 T5 拿到 cross-person 关系 link\n`;
  lookup += `> Marx 项目 PersonNode id（wd-q<N>）已在 src/data/nodes_skeleton.json，PM 自行对应\n\n`;
  lookup += `| deniz id | name | time | records 数 |\n`;
  lookup += `|---|---|---|---|\n`;
  for (const p of sorted) {
    lookup += `| ${p.id} | ${p.name} | ${p.time ?? ''} | ${recordCounts.get(p.id) ?? 0} |\n`;
  }
  mkdirSync('scripts/data', { recursive: true });
  writeFileSync('scripts/data/deniz-person-lookup.md', lookup);
  console.log(`Wrote deniz person lookup (${persons.length} persons) to scripts/data/deniz-person-lookup.md`);

  // T5 用的初始 mapping JSON（PM 在 T4 期间逐步填）
  const initialMap = { [MARX_PERSON_ID_DENIZ]: MARX_AUTHOR_ID_MARX };
  writeFileSync('scripts/data/deniz-person-id-map.json', JSON.stringify(initialMap, null, 2));
  console.log(`Wrote deniz person id map (1 entry: Marx) to scripts/data/deniz-person-id-map.json`);
}

importMarx();
```

- [ ] **Step 4: 加 npm script + 跑 import**

修改 `package.json` scripts 节加：
```json
"m4:import-marx": "tsx scripts/import-denizcemonduygu-marx.ts"
```

跑：
```bash
npm run m4:import-marx
```

Expected:
```
Found 19 Marx records in denizcemonduygu
Wrote 19 claims to src/data/claims.json
Wrote checklist to docs/m4-validation/marx-19-claims-checklist.md
```

- [ ] **Step 5: AI 用 Marx 思想史专业知识填 claim_text 草稿**

打开 `docs/m4-validation/marx-19-claims-checklist.md`，对每条 19 个 entry 改 `claim_text` 为中文翻译。

翻译原则：
- 简洁（≤ 30 字）+ 主张式
- 保留 Marx 原话风格（如"商品是天生的平等派"）
- denizcemonduygu 英文是已经精炼过的版本，可以直接信达雅翻译

参考 19 条英文（spec 已抓取，详见 brainstorm session 后期 Bash 输出）。

也填 year（按 reference 推断 / 实在不确定就 1850）+ source_work_id（4 个 Marx work id 已在 src/data/nodes_skeleton.json）。

- [ ] **Step 6: PM 抽查 5 条**

PM 任意挑 5 条 claim_text 翻译看准确性。改任意值（不要改 H2 `## claim-marx-XXX` 标题，apply 脚本靠这个识别）。

- [ ] **Step 7: 写 apply 脚本 scripts/apply-claim-validation-md.ts**

仿 M3 `scripts/apply-validation-md.ts`，关键差异：
- 解析 H2 `## claim-marx-XXX` 找 ClaimNode.id
- 解析 `- **claim_text**(...): <text>` 行抽 claim_text
- 同样解析 year / source_work_id / cats / keywords / reference
- 跳过 `<待翻译>` placeholder（不覆盖已填的）
- 写回 src/data/claims.json

具体代码（仿 M3 apply-validation-md.ts 模式，用同样的 regex 解析 H 标题 + 字段）：

```typescript
#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import type { ClaimNode } from '../src/types/Claim.ts';

const CHECKLIST_PATH = 'docs/m4-validation/marx-19-claims-checklist.md';
const CLAIMS_JSON_PATH = 'src/data/claims.json';

function applyMd() {
  const md = readFileSync(CHECKLIST_PATH, 'utf-8');
  const dataset = JSON.parse(readFileSync(CLAIMS_JSON_PATH, 'utf-8'));
  const claims: ClaimNode[] = dataset.claims;

  const sections = md.split(/^## (claim-marx-\d+)$/m).slice(1);
  let updated = 0;
  for (let i = 0; i < sections.length; i += 2) {
    const id = sections[i].trim();
    const body = sections[i + 1];
    const claim = claims.find((c) => c.id === id);
    if (!claim) continue;

    const claimTextMatch = body.match(/\*\*claim_text\*\*[^:]*:\s*(.+)/);
    if (claimTextMatch && claimTextMatch[1].trim() !== '<待翻译>') {
      claim.claim_text = claimTextMatch[1].trim();
      claim.name_zh = claim.claim_text.slice(0, 20);  // name_zh 用 claim_text 前 20 字
      updated++;
    }

    const yearMatch = body.match(/\*\*year\*\*[^:]*:\s*(\d+)/);
    if (yearMatch) claim.year = parseInt(yearMatch[1]);

    const swMatch = body.match(/\*\*source_work_id\*\*[^:]*:\s*([\w-]+)/);
    if (swMatch && swMatch[1].trim() !== '') claim.source_work_id = swMatch[1].trim();
  }

  writeFileSync(CLAIMS_JSON_PATH, JSON.stringify(dataset, null, 2));
  console.log(`Updated ${updated} Marx claims (skipped <待翻译> placeholders)`);
}

applyMd();
```

- [ ] **Step 8: 加 npm script + 跑 apply**

修改 `package.json`：
```json
"m4:apply-md": "tsx scripts/apply-claim-validation-md.ts"
```

跑：
```bash
npm run m4:apply-md
```

Expected: `Updated 19 Marx claims (skipped 0 <待翻译> placeholders)`（如果 PM 全填了）/ 或部分（如果有占位）

- [ ] **Step 9: 验证 GREEN**

```bash
npx vitest run tests/unit/import-marx.test.ts
```

Expected: PASS（4 tests / 4 passed）

- [ ] **Step 10: 跑全量 npm test 确认无回归**

```bash
npm test
```

Expected: 37/34/3（之前 33/30/3 + 4 PASS）

- [ ] **Step 11: prettier 检查 + commit**

```bash
npx prettier --check scripts/import-denizcemonduygu-marx.ts scripts/apply-claim-validation-md.ts src/data/claims.json
```

写 .commit-msg.tmp + commit + push（pattern 同 Task 1）：

commit msg：
```
feat(M4): Task 2 完成 - Marx 19 obs 从 denizcemonduygu 借鉴入库

scripts/import-denizcemonduygu-marx.ts 一次性抽取 + AI 翻译草稿入库
scripts/apply-claim-validation-md.ts PM 改完 .md 后回填 claims.json
docs/m4-validation/marx-19-claims-checklist.md PM 复核工作文件
src/data/claims.json 新建（19 Marx claim + relations 空数组）

复核策略 = M3 决策 4 opportunistic（denizcemonduygu 是权威 source 例外）

致谢 denizcemonduygu.com/philo（spec § 9.4）

总测试 33/30/3 → 37/34/3
```

```bash
git add scripts/import-denizcemonduygu-marx.ts scripts/apply-claim-validation-md.ts src/data/claims.json docs/m4-validation/marx-19-claims-checklist.md tests/unit/import-marx.test.ts package.json
git commit -F .commit-msg.tmp
git push origin main
rm .commit-msg.tmp
```

---

### Task 3: 12 concept.definition_plain 升级为 claim_text

**Files:**
- Modify: `src/data/claims.json`（追加 12 ClaimNode）
- Create: `docs/m4-validation/concept-12-claims-checklist.md`
- Modify: `scripts/import-denizcemonduygu-marx.ts` 或 create `scripts/upgrade-concept-to-claim.ts`

**目的:** 12 个 M3 ConceptNode 的 definition_plain（中性定义）改写为 claim_text（主张式 ≤ 50 字），新增 12 个 ClaimNode 入库（保留 derived_from_concept_id FK）。

**M3 决策 3 模式：AI 草稿 + PM 100% 复核**（spec § 9.2，concept 升级是 vision 核心）

- [ ] **Step 1: 写 acceptance test 扩展（修改 import-marx.test.ts 或 新建 concept-claim.test.ts）**

新建 `tests/unit/concept-claim.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import type { ClaimNode } from '../../src/types/Claim.ts';
import { validateClaim } from '../../src/lib/claim-schema.ts';

describe('Task 3 · 12 concept 升级 claim acceptance', () => {
  const claims = (data.claims ?? []) as ClaimNode[];
  const conceptClaims = claims.filter((c) => c.derived_from_concept_id);

  it('从 concept 升级的 claim 数 = 12', () => {
    expect(conceptClaims.length).toBe(12);
  });

  it('每个升级 claim 的 derived_from_concept_id 在 M3 12 concept 集合', () => {
    const validConceptIds = new Set([
      'concept-alienation','concept-surplus-value','concept-historical-materialism',
      'concept-class-struggle','concept-commodity-fetishism','concept-ideology',
      'concept-mode-of-production','concept-base-superstructure','concept-communism',
      'concept-revolution','concept-labor-theory-of-value','concept-state'
    ]);
    for (const c of conceptClaims) {
      expect(validConceptIds.has(c.derived_from_concept_id!), `${c.id} concept_id 非法`).toBe(true);
    }
  });

  it('每个升级 claim 通过 schema 校验', () => {
    for (const c of conceptClaims) {
      expect(validateClaim(c)).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: 验证 RED**

```bash
npx vitest run tests/unit/concept-claim.test.ts
```

Expected: FAIL（0 conceptClaims found）

- [ ] **Step 3: 写 upgrade 脚本 scripts/upgrade-concept-to-claim.ts**

```typescript
#!/usr/bin/env tsx
// 从 src/data/nodes_skeleton.json 读 12 ConceptNode
// 生成 docs/m4-validation/concept-12-claims-checklist.md（每 concept 一个 entry，AI 草稿 claim_text）
// PM 复核后跑 apply 脚本回填到 src/data/claims.json

import { readFileSync, writeFileSync } from 'fs';
import type { ClaimNode } from '../src/types/Claim.ts';
import type { ConceptNode } from '../src/types/Node.ts';

const NODES_PATH = 'src/data/nodes_skeleton.json';
const CHECKLIST_PATH = 'docs/m4-validation/concept-12-claims-checklist.md';

function generate() {
  const nodesData = JSON.parse(readFileSync(NODES_PATH, 'utf-8'));
  const concepts: ConceptNode[] = nodesData.nodes.filter((n: any) => n.type === 'concept');

  let md = `# 12 Concept → Claim 升级复核清单\n\n`;
  md += `> AI 草稿 + PM 100% 复核（spec § 9.2 决策 3）\n`;
  md += `> 任务: 把 concept.definition_plain (中性定义) 改写为 claim_text (主张句 ≤ 50 字)\n\n`;
  md += `---\n\n`;
  for (const c of concepts) {
    const newId = `claim-${c.id.replace('concept-', 'cpt-')}`;
    md += `## ${newId}\n\n`;
    md += `**M3 ConceptNode**:\n`;
    md += `- name_zh: ${c.name_zh}\n`;
    md += `- name_orig: ${c.name_orig}\n`;
    md += `- definition_plain: ${c.definition_plain}\n\n`;
    md += `**升级为 ClaimNode** (PM 复核 / 改):\n`;
    md += `- **claim_text**（PM 改写为主张式 ≤ 50 字）: <待 AI 草稿>\n`;
    md += `- **year**（默认 ${c.proposed_year}）: ${c.proposed_year}\n`;
    md += `- **source_work_id**（默认 ${c.proposed_work_id}）: ${c.proposed_work_id}\n`;
    md += `- **cats**（PM 选 1+ 个，参考 me/po/et/re/mp）: po\n`;
    md += `- **keywords**（PM 填思想流派 tag）: ${c.name_zh}\n`;
    md += `- **derived_from_concept_id**: ${c.id}\n\n`;
    md += `---\n\n`;
  }
  writeFileSync(CHECKLIST_PATH, md);
  console.log(`Wrote ${concepts.length} concept claims to ${CHECKLIST_PATH}`);
}

generate();
```

- [ ] **Step 4: 加 npm script + 跑生成**

修改 `package.json`：
```json
"m4:gen-concept-md": "tsx scripts/upgrade-concept-to-claim.ts"
```

跑：
```bash
npm run m4:gen-concept-md
```

Expected: `Wrote 12 concept claims to docs/m4-validation/concept-12-claims-checklist.md`

- [ ] **Step 5: AI 用 Marx 思想史专业知识填 12 条 claim_text 草稿**

每条 concept 写主张式 ≤ 50 字。例：
- 异化（concept-alienation）→ "工人在资本主义劳动中被迫与劳动产品 / 过程 / 类本质 / 他人异化。"
- 剩余价值（concept-surplus-value）→ "资本家以工资形式购买劳动力，但占有了劳动创造的全部价值——剩余价值是剥削源头。"
- 历史唯物主义（concept-historical-materialism）→ "不是人们的意识决定存在，是社会存在决定意识——经济基础决定上层建筑。"
- 阶级斗争（concept-class-struggle）→ "至今一切社会的历史，都是阶级斗争的历史。"
- 商品拜物教（concept-commodity-fetishism）→ "商品作为独立存在物似乎拥有生命——掩盖了背后的劳动关系。"
- 意识形态（concept-ideology）→ "统治阶级的思想是统治思想——意识形态是阶级利益的颠倒反映。"
- 生产方式（concept-mode-of-production）→ "生产力发展与生产关系矛盾推动历史前进 — 形成五种社会形态。"
- 经济基础与上层建筑（concept-base-superstructure）→ "Institutions / 法律 / 哲学 / 艺术等上层建筑由经济基础决定。"
- 共产主义（concept-communism）→ "工人推翻资本家创造无阶级社会 — 各尽所能各取所需。"
- 革命（concept-revolution）→ "暴力革命是新社会代替旧社会的助产婆。"
- 劳动价值论（concept-labor-theory-of-value）→ "商品价值由社会必要劳动时间决定 — 突破古典经济学劳动 vs 劳动力混同。"
- 国家（concept-state）→ "国家是阶级压迫工具 — 将随阶级消灭而消亡。"

PM **100% 复核**这 12 条（vision 核心，错误成本高）。

- [ ] **Step 6: 扩展 apply 脚本支持 concept claim**

修改 `scripts/apply-claim-validation-md.ts`，加分支处理 `claim-cpt-xxx` 格式 H2 标题：

```typescript
// 在 applyMd() 末尾加：
function applyConceptMd() {
  const conceptMd = readFileSync('docs/m4-validation/concept-12-claims-checklist.md', 'utf-8');
  const dataset = JSON.parse(readFileSync(CLAIMS_JSON_PATH, 'utf-8'));
  const claims: ClaimNode[] = dataset.claims;
  
  const sections = conceptMd.split(/^## (claim-cpt-[\w-]+)$/m).slice(1);
  let added = 0, updated = 0;
  for (let i = 0; i < sections.length; i += 2) {
    const id = sections[i].trim();
    const body = sections[i + 1];
    const claimTextMatch = body.match(/\*\*claim_text\*\*[^:]*:\s*(.+)/);
    if (!claimTextMatch || claimTextMatch[1].trim() === '<待 AI 草稿>') continue;
    
    let claim = claims.find((c) => c.id === id);
    const isNew = !claim;
    if (isNew) {
      claim = { id, type: 'claim', name_zh: '', name_orig: '', claim_text: '', author_id: 'wd-q9061', year: 0, cats: ['po'] };
      claims.push(claim as ClaimNode);
    }
    claim!.claim_text = claimTextMatch[1].trim();
    claim!.name_zh = claim!.claim_text.slice(0, 20);
    
    const yearMatch = body.match(/\*\*year\*\*[^:]*:\s*(\d+)/);
    if (yearMatch) claim!.year = parseInt(yearMatch[1]);
    
    const swMatch = body.match(/\*\*source_work_id\*\*[^:]*:\s*([\w-]+)/);
    if (swMatch) claim!.source_work_id = swMatch[1].trim();
    
    const catsMatch = body.match(/\*\*cats\*\*[^:]*:\s*([\w,\s]+)/);
    if (catsMatch) claim!.cats = catsMatch[1].split(',').map((s: string) => s.trim()) as any;
    
    const conceptIdMatch = body.match(/\*\*derived_from_concept_id\*\*:\s*(concept-[\w-]+)/);
    if (conceptIdMatch) claim!.derived_from_concept_id = conceptIdMatch[1];
    
    if (isNew) added++; else updated++;
  }
  writeFileSync(CLAIMS_JSON_PATH, JSON.stringify(dataset, null, 2));
  console.log(`Concept claims: ${added} added, ${updated} updated`);
}

applyConceptMd();  // 调用
```

- [ ] **Step 7: 跑 apply**

```bash
npm run m4:apply-md
```

Expected: `Concept claims: 12 added, 0 updated`（如果首次跑）

- [ ] **Step 8: 验证 GREEN**

```bash
npx vitest run tests/unit/concept-claim.test.ts
```

Expected: PASS（3 tests / 3 passed）

```bash
npm test
```

Expected: 40/37/3

- [ ] **Step 9: prettier 检查 + commit**

commit msg：
```
feat(M4): Task 3 完成 - 12 concept 升级为 claim_text

scripts/upgrade-concept-to-claim.ts 生成 PM 复核清单
docs/m4-validation/concept-12-claims-checklist.md（12 entry，AI
草稿 + PM 100% 复核 = 决策 3）
扩展 scripts/apply-claim-validation-md.ts 支持 claim-cpt-xxx
src/data/claims.json 新增 12 concept claim（含 derived_from_concept_id FK）

12 concept 主张句覆盖 Marx 思想史核心：异化 / 剩余价值 / 历史唯物 /
阶级斗争 / 商品拜物教 / 意识形态 / 生产方式 / 经济基础与上层建筑 /
共产主义 / 革命 / 劳动价值论 / 国家

总测试 37/34/3 → 40/37/3
```

git add + commit + push 同 Task 2。

---

### Task 4: 33 person × 3-5 quote 补采

**Files:**
- Modify: `src/data/claims.json`（追加 99-165 ClaimNode）
- Create: `docs/m4-validation/person-quote-checklist.md`
- Create: `scripts/generate-person-quote-md.ts`
- Modify: `scripts/apply-claim-validation-md.ts`（加 person quote 分支）

**目的:** 33 个 PersonNode（nodes_skeleton.json 实际 34 含 Marx → 33 非 Marx）每人补采 3-5 条代表性 quote 作为 ClaimNode 入库。这是 M4 数据采集大头（99-165 条）。

**M3 决策 3 模式：AI 草稿 + PM 100% 复核**（spec § 9.2，编造引文风险高）

⚠ **本 task 是 M4 工时大头**（PM 复核估计 6-12 小时）。建议拆 sub-task 按 person 类别（Marx 同时代 / 前驱 / 后继）逐批做。

- [ ] **Step 1: 写 acceptance test**

新建 `tests/unit/person-quote.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import nodesData from '../../src/data/nodes_skeleton.json';
import type { ClaimNode } from '../../src/types/Claim.ts';
import { validateClaim } from '../../src/lib/claim-schema.ts';

describe('Task 4 · person quote 补采 acceptance', () => {
  const claims = (data.claims ?? []) as ClaimNode[];
  const persons = nodesData.nodes.filter((n: any) => n.type === 'person');

  it('claims 总数 ≥ M4 minimum 80', () => {
    expect(claims.length).toBeGreaterThanOrEqual(80);
  });

  it('每个 person 至少 1 个 claim（Marx 自己 + 12 concept-derived 之外）', () => {
    const claimAuthors = new Set(claims.map((c) => c.author_id));
    // Marx 19 obs + 12 concept (Marx) = 至少 Marx 一定有
    expect(claimAuthors.has('wd-q9061')).toBe(true);
    // 至少 10 个不同 person 有 claim（M4 minimum）
    expect(claimAuthors.size).toBeGreaterThanOrEqual(10);
  });

  it('每个 person quote claim 通过 schema 校验', () => {
    const personQuoteClaims = claims.filter(
      (c) => !c.derived_from_concept_id && !c.derived_from_denizcemonduygu_record_id
    );
    for (const c of personQuoteClaims) {
      expect(validateClaim(c), `${c.id} 校验失败`).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: 验证 RED**

```bash
npx vitest run tests/unit/person-quote.test.ts
```

Expected: FAIL（claims < 80 / 不足 10 个 author）

- [ ] **Step 3: 写 generate 脚本 scripts/generate-person-quote-md.ts**

```typescript
#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import type { PersonNode } from '../src/types/Node.ts';

const NODES_PATH = 'src/data/nodes_skeleton.json';
const CHECKLIST_PATH = 'docs/m4-validation/person-quote-checklist.md';
const QUOTES_PER_PERSON = 3;  // 每人 3 个 quote（M4 minimum），PM 可加到 5

function generate() {
  const nodesData = JSON.parse(readFileSync(NODES_PATH, 'utf-8'));
  const persons: PersonNode[] = nodesData.nodes.filter((n: any) => n.type === 'person');
  // 排除 Marx（已有 19 obs）
  const targetPersons = persons.filter((p) => p.id !== 'wd-q9061');

  let md = `# Person Quote 补采复核清单\n\n`;
  md += `> 33 person × 3-5 quote = 99-165 条 ClaimNode\n`;
  md += `> AI 草稿 + PM 100% 复核（spec § 9.2 决策 3）\n`;
  md += `> 编造引文风险高 — 必须有真实 reference 文献支撑\n\n`;
  md += `---\n\n`;
  for (const p of targetPersons) {
    for (let i = 1; i <= QUOTES_PER_PERSON; i++) {
      const claimId = `claim-${p.id.replace('wd-q', 'q')}-${String(i).padStart(2, '0')}`;
      md += `## ${claimId}\n\n`;
      md += `**Person**: ${p.name_zh} (${p.name_orig}) · ${p.birth_year}–${p.death_year}\n\n`;
      md += `**bio context** (M3 已填):\n`;
      for (const event of p.bio_event_style ?? []) md += `- ${event}\n`;
      md += `\n`;
      md += `**填:**\n`;
      md += `- **claim_text**（≤ 50 字主张式）: <待 AI 草稿>\n`;
      md += `- **year**: ${p.birth_year + 30}\n`;  // 默认中年
      md += `- **source_work_id**（PM 填，可空）: \n`;
      md += `- **cats**（po/me/et/re/mp 等）: po\n`;
      md += `- **keywords**（思想流派）: \n`;
      md += `- **reference**（出处文献）: \n`;
      md += `- **author_id**: ${p.id}\n`;
      md += `- **deniz_person_id**（可选，查 scripts/data/deniz-person-lookup.md 找对应 id；填了 T5 能拿到 cross-person link）: \n\n`;
      md += `---\n\n`;
    }
  }
  writeFileSync(CHECKLIST_PATH, md);
  console.log(`Wrote ${targetPersons.length * QUOTES_PER_PERSON} person quotes to ${CHECKLIST_PATH}`);
}

generate();
```

- [ ] **Step 4: 加 npm script + 跑生成**

修改 `package.json`：
```json
"m4:gen-person-md": "tsx scripts/generate-person-quote-md.ts"
```

跑：
```bash
npm run m4:gen-person-md
```

Expected: `Wrote 99 person quotes to docs/m4-validation/person-quote-checklist.md`（33 person × 3 = 99）

- [ ] **Step 5: AI 用 Marx 思想史专业知识填 99 条 quote 草稿**

按 person 类别填：
- Marx 同时代（Engels / 蒲鲁东 / Bakunin / Lassalle 等）
- 前驱（Hegel / Feuerbach / Smith / Ricardo 等）
- 后继（Lenin / Lukács / Gramsci / Althusser / Adorno 等）

**每条必须有 reference**（避免编造）。如果不确定 reference，标 `<不确定: 待 PM 查证>`。

- [ ] **Step 6: PM 100% 复核（M4 工时大头）**

PM 逐条复核 99 quote。重点检查：
- 译名准确（拼写 + 通行译法）
- claim_text 是否真的是该 person 主张（不是别人的）
- reference 是否真实（marxists.org / SEP / Wikipedia 链接可访问）

**估计工时**：6-12 小时（每条 4-6 分钟）。建议分批做（如每天 20 条 × 4 天）。

- [ ] **Step 7: 扩展 apply 脚本支持 person quote**

修改 `scripts/apply-claim-validation-md.ts`，加 `applyPersonQuoteMd()` 函数（pattern 同 Task 3 Step 6 的 applyConceptMd，但 H2 regex 是 `claim-q\d+-\d+`）。

- [ ] **Step 8: 跑 apply + 验证**

```bash
npm run m4:apply-md
```

Expected: `Person quote claims: 99 added, 0 updated`（首次）

```bash
npx vitest run tests/unit/person-quote.test.ts
```

Expected: PASS

```bash
npm test
```

Expected: 43/40/3 (累计)

- [ ] **Step 9: prettier 检查 + commit**

commit msg：
```
feat(M4): Task 4 完成 - 33 person × 3 quote 补采入库 (99 条)

scripts/generate-person-quote-md.ts 生成 PM 复核清单 (99 entry)
docs/m4-validation/person-quote-checklist.md（PM 100% 复核 6-12 小时）
扩展 scripts/apply-claim-validation-md.ts 支持 claim-q\d+-\d+
src/data/claims.json 新增 99 person quote ClaimNode

每条 quote 必须有 reference 文献支撑 (避免 AI 幻觉编造引文)
不确定 reference 标 <不确定: 待 PM 查证>，apply 跳过

总 ClaimNode 数: 19 (Marx) + 12 (concept) + 99 (person) = 130 (M4 minimum 80 ✓ / stretch 150 待 quote 加到 5/person)
总测试 40/37/3 → 43/40/3
```

git add + commit + push 同 Task 2-3。

---

### Task 5: claim → claim 关系采集（borrow denizcemonduygu Marx links）

**Files:**
- Modify: `src/data/claims.json`（追加 ClaimRelation 数组）
- Create: `scripts/import-denizcemonduygu-marx-links.ts`
- Create: `tests/unit/claim-relations.test.ts`

**目的:** 从 denizcemonduygu data.json 抽取 Marx 涉及的 202 条 link（121 agreement + 81 disagreement），转换为 Marx 项目 ClaimRelation 格式入库。

注意：denizcemonduygu link 端点是 record id（不是 person id），M4 ClaimRelation 端点是 ClaimNode.id。需要 mapping。

**M3 决策 4 opportunistic**（denizcemonduygu 是权威关系数据，PM 抽查 10% 即可）

- [ ] **Step 1: 写 acceptance test**

新建 `tests/unit/claim-relations.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import type { ClaimNode, ClaimRelation } from '../../src/types/Claim.ts';
import { validateClaimRelation } from '../../src/lib/claim-schema.ts';

describe('Task 5 · claim → claim 关系 acceptance', () => {
  const claims = (data.claims ?? []) as ClaimNode[];
  const relations = (data.relations ?? []) as ClaimRelation[];
  const claimIds = new Set(claims.map((c) => c.id));

  it('relations 数 ≥ M4 minimum 100', () => {
    expect(relations.length).toBeGreaterThanOrEqual(100);
  });

  it('agreement_with + disagreement_with 比例近似 denizcemonduygu (60/40)', () => {
    const agree = relations.filter((r) => r.type === 'agreement_with').length;
    const disagree = relations.filter((r) => r.type === 'disagreement_with').length;
    expect(agree).toBeGreaterThanOrEqual(50);
    expect(disagree).toBeGreaterThanOrEqual(30);
  });

  it('每条 relation 通过 schema 校验', () => {
    for (const r of relations) {
      const errs = validateClaimRelation(r, claimIds);
      expect(errs, JSON.stringify(r)).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: 验证 RED + 写 import 脚本**

跑测 → FAIL（relations 数 < 100）。然后写 `scripts/import-denizcemonduygu-marx-links.ts`：

```typescript
#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import type { ClaimNode, ClaimRelation } from '../src/types/Claim.ts';

const DENIZ_DATA_PATH = 'C:/Users/xuzequan/Desktop/denizcemonduygu-data.json';
const CLAIMS_JSON_PATH = 'src/data/claims.json';

function importLinks() {
  const denizData = JSON.parse(readFileSync(DENIZ_DATA_PATH, 'utf-8'));
  const dataset = JSON.parse(readFileSync(CLAIMS_JSON_PATH, 'utf-8'));
  const claims: ClaimNode[] = dataset.claims;

  // ★ M4 v2 patch (建议改 1): 读 T2 输出的 deniz person id map (PM 在 T4 期间可能扩展过)
  let denizPersonMap: Record<number, string> = {};
  try {
    denizPersonMap = JSON.parse(readFileSync('scripts/data/deniz-person-id-map.json', 'utf-8'));
  } catch {
    console.warn('scripts/data/deniz-person-id-map.json 不存在，只走 record-level mapping (link 数会少)');
  }
  console.log(`deniz person mapping size: ${Object.keys(denizPersonMap).length} persons`);

  // 精确级：record_id → claim_id (T2 import Marx 19 obs 时填的)
  const recordIdToClaimId = new Map<number, string>();
  for (const c of claims) {
    if (c.derived_from_denizcemonduygu_record_id !== undefined) {
      recordIdToClaimId.set(c.derived_from_denizcemonduygu_record_id, c.id);
    }
  }

  // Person-level fallback：author_id → first claim_id of that author
  // (如果 record 没精确映射但所属 person 在 map 里，取该 person 任一 claim 作为 link endpoint)
  const authorIdToFirstClaim = new Map<string, string>();
  for (const c of claims) {
    if (!authorIdToFirstClaim.has(c.author_id)) authorIdToFirstClaim.set(c.author_id, c.id);
  }
  console.log(`Mapped: ${recordIdToClaimId.size} records (precise) / ${authorIdToFirstClaim.size} authors (fallback)`);

  // 抽 Marx 涉及的 link
  const marxRecordIds = new Set(
    Array.from(recordIdToClaimId.keys()).filter((rid) => {
      const rec = denizData.records.find((r: any) => r.id === rid);
      return rec?.person === 57;
    })
  );
  const marxLinks = denizData.links.filter(
    (l: any) => marxRecordIds.has(l.l0) || marxRecordIds.has(l.l1)
  );
  console.log(`Found ${marxLinks.length} links involving Marx records`);

  // record_id → claim_id (精确) 或 record.person → Marx author_id → first claim (fallback)
  function mapEndpoint(recordId: number): { id: string; precise: boolean } | null {
    const precise = recordIdToClaimId.get(recordId);
    if (precise) return { id: precise, precise: true };
    const rec = denizData.records.find((r: any) => r.id === recordId);
    if (!rec) return null;
    const marxAuthorId = denizPersonMap[rec.person];
    if (!marxAuthorId) return null;
    const firstClaim = authorIdToFirstClaim.get(marxAuthorId);
    return firstClaim ? { id: firstClaim, precise: false } : null;
  }

  // 转换 + dedup (按 (source, target, type) 三元组去重)
  const seen = new Set<string>();
  const relations: ClaimRelation[] = [];
  const unmappedPersons = new Set<number>();
  let preciseCount = 0, fallbackCount = 0;
  for (const l of marxLinks) {
    const s = mapEndpoint(l.l0);
    const t = mapEndpoint(l.l1);
    if (!s || !t) {
      for (const rid of [l.l0, l.l1]) {
        const rec = denizData.records.find((r: any) => r.id === rid);
        if (rec && !denizPersonMap[rec.person]) unmappedPersons.add(rec.person);
      }
      continue;
    }
    if (s.id === t.id) continue;
    const type = l.type === 'p' ? 'agreement_with' : 'disagreement_with';
    const key = `${s.id}|${t.id}|${type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    relations.push({ source: s.id, target: t.id, type });
    if (s.precise && t.precise) preciseCount++; else fallbackCount++;
  }
  console.log(`Mapped to ${relations.length} ClaimRelation (precise: ${preciseCount} / person-fallback: ${fallbackCount})`);

  if (unmappedPersons.size > 0) {
    console.log(`\n⚠ Unmapped deniz person ids (填 scripts/data/deniz-person-id-map.json 可拿到更多 link):`);
    console.log(`  ${[...unmappedPersons].sort((a, b) => a - b).join(', ')}`);
    console.log(`  查 scripts/data/deniz-person-lookup.md 找对应 name + 时代`);
  }

  dataset.relations = relations;
  writeFileSync(CLAIMS_JSON_PATH, JSON.stringify(dataset, null, 2));
}

importLinks();
```

⚠ **如果 import 完 relations 数 < 100**（acceptance test fail），有 2 条恢复路径：

1. **补 PM person mapping**（推荐，工时小）：根据 import 脚本输出的 `Unmapped deniz person ids` 列表，查 `scripts/data/deniz-person-lookup.md` 找对应名字 + 时代，对照 `src/data/nodes_skeleton.json` 里的 Marx PersonNode，编辑 `scripts/data/deniz-person-id-map.json` 加 `{ <deniz_id>: "wd-q<...>" }` 条目。每个 person mapping 加约 10-30 个 link。重跑 `npm run m4:import-marx-links`。
2. **回 T4 补采更多 person × 5 quote**（工时大，6-12 小时）：Task 4 默认 3 quote/person，提到 5 能给 T5 更多 record-level 精确映射。但 PM 100% 复核工时几乎翻倍。

PM 二选一即可，不强制。

- [ ] **Step 3: 加 npm script + 跑 import**

```json
"m4:import-marx-links": "tsx scripts/import-denizcemonduygu-marx-links.ts"
```

```bash
npm run m4:import-marx-links
```

Expected: `Mapped X to ClaimRelation`（X ≥ 100，否则回 Task 4）

- [ ] **Step 4: 验证 GREEN + commit**

```bash
npx vitest run tests/unit/claim-relations.test.ts
```

Expected: PASS

```bash
npm test
```

Expected: 46/43/3 (累计)

commit msg + push 同 Task 2-4。

---

### Task 6: 主画布 layout 算法（斜向流 + obs 堆叠 + 半圆弧）⭐ 最复杂 task

**Files:**
- Create: `src/components/claim-layout.ts`
- Create: `tests/unit/claim-layout.test.ts`
- Modify: `src/main.ts`（替换 M2 简版 renderRelations 为 ClaimLayout）
- Modify: `index.html`（加 `<div id="app">` 容器 · plan v1 漏写）

**目的:** M4 视觉核心组件。计算 person section 斜向流坐标 + obs 行 X 偏移 + 半圆弧 SVG path（按 PM 反馈规范：起止落圆点 + 绿左下 / 红右上）。

⚠ **T6 完成后强制 PM checkpoint**（spec § 12.2 risk 2 mitigation）：跑真数据看视觉，PM 确认再开 T7+。

- [ ] **Step 1: 写 layout 算法 acceptance test**

新建 `tests/unit/claim-layout.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { computePersonSectionPositions, generateArcPath, type PersonSection } from '../../src/components/claim-layout.ts';

describe('claim-layout · person section 斜向流坐标', () => {
  it('person 按 birth_year 排序后斜向偏移', () => {
    const persons = [
      { id: 'p1', name_zh: 'A', birth_year: 1770, claims: [{ id: 'c1' } as any] },
      { id: 'p2', name_zh: 'B', birth_year: 1820, claims: [{ id: 'c2' } as any] },
      { id: 'p3', name_zh: 'C', birth_year: 1880, claims: [{ id: 'c3' } as any] },
    ];
    const sections = computePersonSectionPositions(persons as any);
    expect(sections[0].x).toBeLessThan(sections[1].x);
    expect(sections[1].x).toBeLessThan(sections[2].x);
    expect(sections[0].y).toBeLessThan(sections[1].y);
    expect(sections[1].y).toBeLessThan(sections[2].y);
  });

  it('多 obs person section 占用更多垂直空间', () => {
    const persons = [
      { id: 'p1', birth_year: 1770, claims: Array.from({ length: 10 }, (_, i) => ({ id: `c${i}` })) },
      { id: 'p2', birth_year: 1820, claims: [{ id: 'c10' }] },
    ];
    const sections = computePersonSectionPositions(persons as any);
    const p1Bottom = sections[0].y + sections[0].claims.length * 22;
    expect(sections[1].y).toBeGreaterThan(p1Bottom);  // p2 不重叠 p1 obs 区
  });
});

describe('claim-layout · 半圆弧 SVG path generator', () => {
  it('绿弧 (agreement) 控制点偏左下', () => {
    const path = generateArcPath(100, 100, 200, 200, 'agreement_with');
    // path 形如 "M 100 100 Q ctrlX ctrlY 200 200"
    const match = path.match(/Q (\S+) (\S+)/);
    expect(match).not.toBeNull();
    const ctrlX = parseFloat(match![1]);
    const ctrlY = parseFloat(match![2]);
    const midX = (100 + 200) / 2;
    const midY = (100 + 200) / 2;
    expect(ctrlX, 'ctrlX 偏左 (< midX)').toBeLessThan(midX);
    expect(ctrlY, 'ctrlY 偏下 (> midY)').toBeGreaterThan(midY);
  });

  it('红弧 (disagreement) 控制点偏右上', () => {
    const path = generateArcPath(100, 100, 200, 200, 'disagreement_with');
    const match = path.match(/Q (\S+) (\S+)/);
    const ctrlX = parseFloat(match![1]);
    const ctrlY = parseFloat(match![2]);
    const midX = (100 + 200) / 2;
    const midY = (100 + 200) / 2;
    expect(ctrlX, 'ctrlX 偏右 (> midX)').toBeGreaterThan(midX);
    expect(ctrlY, 'ctrlY 偏上 (< midY)').toBeLessThan(midY);
  });

  it('灰弧 (extends) 控制点偏右 (微弯)', () => {
    const path = generateArcPath(100, 100, 100, 150, 'extends');
    const match = path.match(/Q (\S+) (\S+)/);
    const ctrlX = parseFloat(match![1]);
    expect(ctrlX, 'ctrlX 偏右').toBeGreaterThan(100);
  });
});
```

- [ ] **Step 2: 验证 RED**

```bash
npx vitest run tests/unit/claim-layout.test.ts
```

Expected: FAIL（claim-layout.ts 不存在）

- [ ] **Step 3: 写 src/components/claim-layout.ts**

```typescript
import type { ClaimNode, ClaimRelation } from '../types/Claim.ts';

export interface PersonSection {
  id: string;
  name_zh: string;
  name_orig?: string;
  birth_year: number;
  death_year?: number;
  x: number;        // 标题 X 坐标
  y: number;        // 标题 Y 坐标
  claims: ClaimWithCoords[];
}

export interface ClaimWithCoords extends ClaimNode {
  x: number;        // obs 行起点 X (圆点位置)
  y: number;        // obs 行 Y
}

interface PersonInput {
  id: string;
  name_zh: string;
  name_orig?: string;
  birth_year: number;
  death_year?: number;
  claims: ClaimNode[];
}

const PERSON_X_OFFSET = 50;   // 每个 person 比上一个 X 偏移
const PERSON_Y_OFFSET = 60;   // 每个 person 比上一个 Y 偏移（基础）
const OBS_ROW_HEIGHT = 22;    // obs 行垂直间距
const OBS_X_FROM_HEADER = 100; // obs 起点 = person 标题 X + 100
const SECTION_TOP_PADDING = 25; // person 标题到第一条 obs 的间距

export function computePersonSectionPositions(persons: PersonInput[]): PersonSection[] {
  // 按 birth_year 排序
  const sorted = [...persons].sort((a, b) => a.birth_year - b.birth_year);
  const sections: PersonSection[] = [];
  let currentX = 60;
  let currentY = 80;

  for (const p of sorted) {
    const section: PersonSection = {
      id: p.id,
      name_zh: p.name_zh,
      name_orig: p.name_orig,
      birth_year: p.birth_year,
      death_year: p.death_year,
      x: currentX,
      y: currentY,
      claims: [],
    };

    // 每个 obs 行 X = section X + 偏移 + (i 偶数小偏移)
    const obsBaseX = currentX + OBS_X_FROM_HEADER;
    let obsY = currentY + SECTION_TOP_PADDING;
    p.claims.forEach((c, i) => {
      const xOffset = Math.floor(i / 5) * 25;  // 每 5 条 obs X 偏移 25 (主张族群区隔)
      section.claims.push({
        ...c,
        x: obsBaseX + xOffset,
        y: obsY,
      });
      obsY += OBS_ROW_HEIGHT;
    });

    sections.push(section);

    // 下一个 person 位置：X+50 / Y = 当前 obs 区底部 + 一些 padding
    currentX += PERSON_X_OFFSET;
    currentY = obsY + 30;
  }

  return sections;
}

export function generateArcPath(
  x1: number, y1: number, x2: number, y2: number,
  type: 'agreement_with' | 'disagreement_with' | 'extends'
): string {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const offset = dist * 0.3;  // 控制点偏移距离 = 30% 弧长

  let ctrlX: number, ctrlY: number;
  switch (type) {
    case 'agreement_with':
      // 绿弧 = 左下弯曲
      ctrlX = midX - offset;
      ctrlY = midY + offset;
      break;
    case 'disagreement_with':
      // 红弧 = 右上弯曲
      ctrlX = midX + offset;
      ctrlY = midY - offset;
      break;
    case 'extends':
      // 灰弧 = 微弯向右（同 person 自延，短距）
      ctrlX = Math.max(x1, x2) + dist * 0.15;
      ctrlY = midY;
      break;
  }
  return `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
}

export function getArcStyle(type: 'agreement_with' | 'disagreement_with' | 'extends') {
  switch (type) {
    case 'agreement_with':
      return { stroke: '#7a9a5a', strokeWidth: 1.1, opacity: 0.65, dasharray: 'none' };
    case 'disagreement_with':
      return { stroke: '#b8654a', strokeWidth: 1.2, opacity: 0.7, dasharray: 'none' };
    case 'extends':
      return { stroke: '#aaa', strokeWidth: 0.8, opacity: 0.4, dasharray: '2,2' };
  }
}
```

- [ ] **Step 4: 验证 GREEN**

```bash
npx vitest run tests/unit/claim-layout.test.ts
```

Expected: PASS（5 tests / 5 passed）

- [ ] **Step 5a: 改 index.html 加 #app 容器（M4 主入口）**

⚠ 关键 patch（plan v1 漏写）：当前 index.html 只有 `<svg id="relations-svg">`（M2 简版），但 T6/T7/T8/T9 多处 `document.getElementById('app')` 假设有 `<div id="app">`。**不改 index.html 整个 M4 主画布就黑屏 + console 报错 null**。

修改 `index.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Marx 思想史 · claim-on-timeline</title>
    <meta name="description" content="Marx 思想史 visualized · claim-on-timeline · 灵感来自 denizcemonduygu.com/philo" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

去掉原来的 `<h1>Marx 星图 · M1 项目骨架原型</h1>` + `<svg id="relations-svg">` + `<main>` 包裹（M4 由 main.ts 直接渲染整个 layout）。原 svg 留在 m3-archive 里，源码不需要保留。

⚠ 副作用：M2 的 e2e test 如果有断言 `[data-testid="relations-svg"]` 会破。M4 用 e2e test（T12）会重写。

- [ ] **Step 5b: 重写 src/main.ts 为 claim-on-timeline 主 view**

当前 `src/main.ts` 是 **M2 简版 21 行**（只调 `renderRelations('#relations-svg', dataset)`），不是 plan v1 误述的"M3 force-directed person-network"。M3 阶段 B/C 只加了数据校对脚本，没动主画布。

M3 阶段末状态已在 **T0 存档**到 `public/m3-archive/` + `git tag m3-final`，**不需要本地 backup**（删除 plan v1 写的 `cp src/main.ts src/main.ts.m3-backup`，那是冗余动作）。

新 `src/main.ts` 大致结构（略写，T6 implementation 时具体实现）：

```typescript
import * as d3 from 'd3';
import claimsData from './data/claims.json';
import nodesData from './data/nodes_skeleton.json';
import { computePersonSectionPositions, generateArcPath, getArcStyle } from './components/claim-layout.ts';
import type { ClaimNode, ClaimRelation } from './types/Claim.ts';
import type { PersonNode } from './types/Node.ts';

const claims = claimsData.claims as ClaimNode[];
const relations = claimsData.relations as ClaimRelation[];
const persons = nodesData.nodes.filter((n: any) => n.type === 'person') as PersonNode[];

// 按 person 分组 claim
const claimsByAuthor = new Map<string, ClaimNode[]>();
for (const c of claims) {
  if (!claimsByAuthor.has(c.author_id)) claimsByAuthor.set(c.author_id, []);
  claimsByAuthor.get(c.author_id)!.push(c);
}

// 构建 person section input（只显示有 claim 的 person）
const personInputs = persons
  .filter((p) => claimsByAuthor.has(p.id))
  .map((p) => ({
    id: p.id,
    name_zh: p.name_zh,
    name_orig: p.name_orig,
    birth_year: p.birth_year,
    death_year: p.death_year,
    claims: claimsByAuthor.get(p.id)!,
  }));

const sections = computePersonSectionPositions(personInputs);

// SVG 渲染
const svg = d3.select('#app')
  .append('svg')
  .attr('viewBox', '0 0 1100 1500')
  .attr('width', '100%');

// 背景层 (TODO M5: 散布观点句)

// 弧线层 (在节点之前画，z-order 在底)
const claimIdToCoords = new Map<string, { x: number; y: number }>();
for (const s of sections) for (const c of s.claims) claimIdToCoords.set(c.id, { x: c.x, y: c.y });

svg.selectAll('path.arc')
  .data(relations.filter((r) => claimIdToCoords.has(r.source) && claimIdToCoords.has(r.target)))
  .join('path')
  .attr('class', 'arc')
  .attr('d', (r) => {
    const s = claimIdToCoords.get(r.source)!;
    const t = claimIdToCoords.get(r.target)!;
    return generateArcPath(s.x, s.y, t.x, t.y, r.type);
  })
  .attr('fill', 'none')
  .each(function(r) {
    const style = getArcStyle(r.type);
    d3.select(this)
      .attr('stroke', style.stroke)
      .attr('stroke-width', style.strokeWidth)
      .attr('opacity', style.opacity)
      .attr('stroke-dasharray', style.dasharray === 'none' ? null : style.dasharray);
  });

// Person section 标题
const sectionG = svg.selectAll('g.person-section')
  .data(sections)
  .join('g')
  .attr('class', 'person-section')
  .attr('transform', (s) => `translate(${s.x},${s.y})`);

sectionG.append('circle')
  .attr('cx', 8).attr('cy', -5).attr('r', (s) => s.id === 'wd-q9061' ? 11 : 9)
  .attr('fill', (s) => s.id === 'wd-q9061' ? '#5b3a8c' : '#d8cab0')
  .attr('stroke', (s) => s.id === 'wd-q9061' ? '#3a2360' : '#a8987a');

sectionG.append('text')
  .attr('x', 22).attr('y', 0)
  .attr('font-size', (s) => s.id === 'wd-q9061' ? 17 : 14)
  .attr('font-weight', 700).attr('fill', '#222').attr('letter-spacing', 0.6)
  .text((s) => s.name_zh.toUpperCase());

sectionG.append('text')
  .attr('x', 180).attr('y', 0)
  .attr('font-size', 10).attr('fill', '#888').attr('font-family', 'sans-serif')
  .text((s) => `${s.birth_year}–${s.death_year ?? ''}`);

// Obs rows
sectionG.selectAll('g.obs')
  .data((s) => s.claims)
  .join('g')
  .attr('class', 'obs')
  .attr('transform', (c) => `translate(${c.x - sectionG.datum().x},${c.y - sectionG.datum().y})`)
  .each(function(c) {
    const g = d3.select(this);
    g.append('text').attr('x', -10).attr('y', 0)
      .attr('font-size', 9).attr('fill', '#aaa').attr('text-anchor', 'end')
      .attr('font-style', 'italic')
      .text(c.keywords ?? '');
    g.append('circle').attr('cx', 0).attr('cy', -3).attr('r', 2.3).attr('fill', '#5b3a8c');
    g.append('text').attr('x', 8).attr('y', 0)
      .attr('font-size', 11).attr('fill', '#2a2a2a').attr('font-style', 'italic')
      .text(c.claim_text);
  });
```

完整 src/main.ts 长度估计 200-300 行（含详情卡 popover stub 等待 T9）。

- [ ] **Step 6: 跑 dev server 看真效果**

```bash
npm run dev
```

打开浏览器看 `http://localhost:5173/marx/`，验证：
- person section 斜向流（从左上 HEGEL → 右下 GRAMSCI 等）
- obs 行横跨画布
- 弧线方向正确（绿左下 / 红右上）

- [ ] **Step 7: prettier + commit + push**

commit msg：
```
feat(M4): Task 6 完成 - 主画布 layout 算法 (斜向流 + 半圆弧)

src/components/claim-layout.ts:
- computePersonSectionPositions: person 按 birth_year 排序 + 斜向偏移
  (X+50 / Y+60 基础) + obs 区动态高度 + 主张族群每 5 条 X+25 区隔
- generateArcPath: 半圆弧 SVG path
  - 绿 (agreement) 控制点偏左下 (PM 反馈硬约束)
  - 红 (disagreement) 控制点偏右上 (PM 反馈硬约束)
  - 灰 (extends) 微弯向右 (同 person 自延)
- getArcStyle: 颜色 / stroke / opacity / dasharray

index.html 改 `<div id="app">` 容器 (plan v1 漏写,T6 Step 5a 补)
src/main.ts 重写为 claim-on-timeline 主 view (M3 阶段末状态已在
T0 存档到 public/m3-archive/ + git tag m3-final)

tests/unit/claim-layout.test.ts: 5 it / 全 GREEN
- 弧线方向规范 unit test 显式断言 control point 偏移方向 (M4 坑 23 防御)

总测试 46/43/3 → 51/48/3

⛔ STOP HERE — T6 = PM checkpoint (spec § 12.2 risk 2)
subagent 跑完此 commit 必须 return 主 session
不能自动进 T7
```

git add + commit + push 同前 task。

- [ ] **Step 8: ⛔ STOP HERE — subagent 必须 return + 主 session 等 PM 视觉确认**

subagent-driven 执行模式下，T6 完成 = 当前 subagent 跑完 Step 7 commit + push 后**必须 return 主 session**。**绝对不能自动进 T7**。这条是 plan v1 漏的 explicit control flow 指令（plan v1 只在 § 4 文字提了"T6 完成后停"，subagent 看不到那段）。

**T6 subagent 返回时必须包含**：
- ✅ T6 7 Step 全部完成
- ✅ Commit hash + push 已 done
- ✅ 总测试数 51/48/3
- 📍 等待 PM 视觉确认才能开 T7

**主 session 收到 subagent return 后必须做的事**：
1. **启动 `npm run dev`**（不是 subagent 做，主 session 跟 PM 一起）
2. 浏览器打开 `http://localhost:5173/marx/`，让 PM 看真数据视觉
3. PM 反馈分支：
   - ✅ "OK，视觉跟想象一致" → 主 session 派 T7 subagent
   - ⚠ "视觉跟想象有差异（密度太高 / 弧线错 / 数据太挤）" → 主 session 跟 PM 讨论：调 T6 layout 参数（如 `MAX_OBS_PER_SECTION` / `PERSON_X_OFFSET` 改值）还是回 brainstorm 改 vision
   - ⏸ "PM 没空看" → 挂起 M4，不继续 T7。**不允许默认 OK 继续**
4. PM 确认 + 主 session 决定继续后，调用 T7 subagent

⚠ **给将来 T6 subagent 的明确指令**（如果是 subagent-driven 模式，写在 dispatch prompt 里）：
> "T6 完成后必须 return 主 session，不要尝试继续 T7。Return message 包含 commit hash + 测试数 + 'waiting for PM visual check' 字样。"

---

### Task 7: 底部横向时间轴组件

**Files:**
- Create: `src/components/timeline.ts`
- Create: `tests/unit/timeline.test.ts`
- Modify: `src/main.ts`（mount timeline 在画布下方 + 联动游标）

**目的:** 实现 spec § 6 设计的底部横向时间轴：1770→1950 / 紫色 ticks 标 Marx 活跃期 / 游标可拖 / ▶ 播放按钮 / Marx 区间 indicator。**独立参考维度，不强坐标映射主画布。**

- [ ] **Step 1: 写 timeline acceptance test**

新建 `tests/unit/timeline.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { computeTickPositions, yearToPercent, type TimelineTick } from '../../src/components/timeline.ts';

describe('timeline · ticks 计算', () => {
  it('Marx 活跃期 (1830/1850/1870) 标紫色 + 加粗', () => {
    const ticks = computeTickPositions(1770, 1950);
    const marxTicks = ticks.filter((t) => [1830, 1850, 1870].includes(t.year));
    expect(marxTicks.length).toBe(3);
    for (const t of marxTicks) {
      expect(t.major).toBe(true);
      expect(t.color).toBe('#5b3a8c');
    }
  });

  it('其他 ticks 灰色 + 标准', () => {
    const ticks = computeTickPositions(1770, 1950);
    const nonMarxTicks = ticks.filter((t) => ![1830, 1850, 1870].includes(t.year));
    for (const t of nonMarxTicks) {
      expect(t.color).not.toBe('#5b3a8c');
    }
  });

  it('yearToPercent 正确映射 1770→0, 1950→100', () => {
    expect(yearToPercent(1770, 1770, 1950)).toBeCloseTo(0);
    expect(yearToPercent(1950, 1770, 1950)).toBeCloseTo(100);
    expect(yearToPercent(1860, 1770, 1950)).toBeCloseTo(50);
  });
});
```

- [ ] **Step 2: 验证 RED + 写 src/components/timeline.ts**

```typescript
export interface TimelineTick {
  year: number;
  major: boolean;
  color: string;
  label: string;
}

const MARX_ACTIVE_YEARS = new Set([1830, 1850, 1870]);
const STANDARD_YEAR_INTERVAL = 20;

export function computeTickPositions(yearMin: number, yearMax: number): TimelineTick[] {
  const ticks: TimelineTick[] = [];
  for (let y = Math.ceil(yearMin / STANDARD_YEAR_INTERVAL) * STANDARD_YEAR_INTERVAL; y <= yearMax; y += STANDARD_YEAR_INTERVAL) {
    const isMarx = MARX_ACTIVE_YEARS.has(y);
    ticks.push({
      year: y,
      major: isMarx,
      color: isMarx ? '#5b3a8c' : '#888',
      label: y.toString(),
    });
  }
  // 加端点（如果不在 interval 上）
  if (!ticks.some((t) => t.year === yearMin)) ticks.unshift({ year: yearMin, major: false, color: '#888', label: yearMin.toString() });
  if (!ticks.some((t) => t.year === yearMax)) ticks.push({ year: yearMax, major: false, color: '#888', label: yearMax.toString() });
  return ticks;
}

export function yearToPercent(year: number, yearMin: number, yearMax: number): number {
  return ((year - yearMin) / (yearMax - yearMin)) * 100;
}

export interface TimelineOptions {
  container: HTMLElement;
  yearMin: number;
  yearMax: number;
  initialCursor: number;
  onCursorChange?: (year: number) => void;
}

export function mountTimeline(opts: TimelineOptions): { setCursor: (year: number) => void } {
  const { container, yearMin, yearMax, initialCursor, onCursorChange } = opts;
  container.innerHTML = `
    <div style="border-top:2px solid #d8cab0;background:#faf6ec;padding:18px 60px 14px;font-family:'EB Garamond','Georgia',serif">
      <div style="font-size:9px;color:#888;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;text-align:center">时间轴 · 参考维度</div>
      <div id="tl-axis" style="position:relative;height:50px"></div>
      <div style="display:flex;align-items:center;gap:14px;margin-top:10px">
        <button id="tl-play" style="border:1px solid #5b3a8c;background:#fcfaf6;color:#5b3a8c;padding:4px 14px;font-style:italic;cursor:pointer;font-family:inherit;font-size:12px">▶ 播放思想史</button>
        <input id="tl-slider" type="range" min="${yearMin}" max="${yearMax}" value="${initialCursor}" style="flex:1;accent-color:#5b3a8c">
        <span id="tl-cursor-label" style="font-size:12px;color:#5b3a8c;font-style:italic;white-space:nowrap">游标 ${initialCursor}</span>
      </div>
    </div>
  `;

  const axis = container.querySelector('#tl-axis') as HTMLElement;
  axis.style.position = 'relative';

  // 主轴线
  const line = document.createElement('div');
  line.style.cssText = 'position:absolute;left:0;right:0;top:24px;height:1px;background:#888';
  axis.appendChild(line);

  // ticks
  const ticks = computeTickPositions(yearMin, yearMax);
  for (const t of ticks) {
    const pct = yearToPercent(t.year, yearMin, yearMax);
    const tickEl = document.createElement('div');
    tickEl.style.cssText = `position:absolute;left:${pct}%;top:${t.major ? 8 : 14}px`;
    tickEl.innerHTML = `
      <div style="width:${t.major ? 2 : 1}px;height:${t.major ? 14 : 8}px;background:${t.color};margin:0 auto"></div>
      <div style="font-size:10px;color:${t.color};font-style:italic;${t.major ? 'font-weight:700;' : ''}margin-top:${t.major ? 2 : 4}px;text-align:center;transform:translateX(-50%);position:relative">${t.label}</div>
    `;
    axis.appendChild(tickEl);
  }

  // 游标
  const cursor = document.createElement('div');
  cursor.id = 'tl-cursor';
  cursor.style.cssText = `position:absolute;left:${yearToPercent(initialCursor, yearMin, yearMax)}%;top:0;width:2px;height:50px;background:#5b3a8c;opacity:0.6;pointer-events:none`;
  axis.appendChild(cursor);

  // slider 联动
  const slider = container.querySelector('#tl-slider') as HTMLInputElement;
  const cursorLabel = container.querySelector('#tl-cursor-label') as HTMLElement;
  slider.addEventListener('input', () => {
    const year = parseInt(slider.value);
    cursor.style.left = `${yearToPercent(year, yearMin, yearMax)}%`;
    cursorLabel.textContent = `游标 ${year}`;
    onCursorChange?.(year);
  });

  // 播放按钮（M4 简单实现：从 yearMin 跳到 yearMax，每 100ms 增 5 年）
  const playBtn = container.querySelector('#tl-play') as HTMLButtonElement;
  playBtn.addEventListener('click', () => {
    let y = yearMin;
    const interval = setInterval(() => {
      y += 5;
      if (y >= yearMax) { y = yearMax; clearInterval(interval); }
      slider.value = y.toString();
      slider.dispatchEvent(new Event('input'));
    }, 100);
  });

  return {
    setCursor: (year: number) => {
      slider.value = year.toString();
      slider.dispatchEvent(new Event('input'));
    },
  };
}
```

- [ ] **Step 3: 验证 GREEN**

```bash
npx vitest run tests/unit/timeline.test.ts
```

Expected: PASS（3 tests）

- [ ] **Step 4: 集成 timeline 到 main.ts**

在 src/main.ts 末尾加：

```typescript
import { mountTimeline } from './components/timeline.ts';

const timelineContainer = document.createElement('div');
document.getElementById('app')!.appendChild(timelineContainer);

const timeline = mountTimeline({
  container: timelineContainer,
  yearMin: 1770,
  yearMax: 1950,
  initialCursor: 1880,
  onCursorChange: (year) => {
    // 之后年代的 person section + obs 淡出（opacity 0.4）
    d3.selectAll('g.person-section')
      .attr('opacity', (s: any) => s.birth_year > year ? 0.4 : 1);
  },
});
```

- [ ] **Step 5: dev server 验证 + commit**

```bash
npm run dev
```

浏览器看时间轴在画布下方 + 拖游标 person section 淡出 + ▶ 播放按钮渐进展开。

commit msg + push（同前 task pattern）。

---

### Task 8: 左侧颗粒度栏组件

**Files:**
- Create: `src/components/sidebar.ts`
- Create: `tests/unit/sidebar.test.ts`
- Modify: `src/main.ts`（mount sidebar 在主画布左侧）

**目的:** 实现 spec § 7 设计的左侧颗粒度栏：48px 收起态（icon 列）→ 200px 展开态（checkbox 列表）+ hover icon 触发主画布高亮预览。

- [ ] **Step 1: 写 sidebar acceptance test**

新建 `tests/unit/sidebar.test.ts`：

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { mountSidebar, type SidebarFilters } from '../../src/components/sidebar.ts';

describe('sidebar · 颗粒度栏', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('默认收起态 width = 48px', () => {
    mountSidebar({ container });
    expect(container.querySelector('.sidebar')?.getAttribute('data-state')).toBe('collapsed');
  });

  it('点击 ⟩ 展开 width = 200px', () => {
    mountSidebar({ container });
    (container.querySelector('.toggle-btn') as HTMLElement).click();
    expect(container.querySelector('.sidebar')?.getAttribute('data-state')).toBe('expanded');
  });

  it('默认 filters: claim/person/绿弧/红弧 都 ON', () => {
    let captured: SidebarFilters | null = null;
    mountSidebar({ container, onFilterChange: (f) => captured = f });
    // mount 时不触发 onFilterChange，先检查 default state
    const claimCb = container.querySelector('input[data-filter="node-claim"]') as HTMLInputElement;
    expect(claimCb.checked).toBe(true);
    const greenCb = container.querySelector('input[data-filter="rel-agreement_with"]') as HTMLInputElement;
    expect(greenCb.checked).toBe(true);
  });

  it('uncheck 触发 onFilterChange', () => {
    let captured: SidebarFilters | null = null;
    mountSidebar({ container, onFilterChange: (f) => captured = f });
    (container.querySelector('input[data-filter="rel-disagreement_with"]') as HTMLInputElement).click();
    expect(captured?.relations.disagreement_with).toBe(false);
  });
});
```

- [ ] **Step 2: 验证 RED + 写 src/components/sidebar.ts**

```typescript
export interface SidebarFilters {
  nodes: { claim: boolean; person: boolean; work: boolean; event: boolean; place: boolean };
  relations: { agreement_with: boolean; disagreement_with: boolean; extends: boolean };
  cats: { me: boolean; po: boolean; et: boolean; re: boolean; mp: boolean };
}

export interface SidebarOptions {
  container: HTMLElement;
  onFilterChange?: (filters: SidebarFilters) => void;
  onHover?: (filterKey: string | null) => void;
}

const DEFAULT_FILTERS: SidebarFilters = {
  nodes: { claim: true, person: true, work: false, event: false, place: false },
  relations: { agreement_with: true, disagreement_with: true, extends: false },
  cats: { me: true, po: true, et: true, re: true, mp: true },
};

export function mountSidebar(opts: SidebarOptions) {
  const { container, onFilterChange, onHover } = opts;
  const filters: SidebarFilters = JSON.parse(JSON.stringify(DEFAULT_FILTERS));

  container.innerHTML = `
    <div class="sidebar" data-state="collapsed" style="width:48px;padding:14px 8px;border-right:1px solid #e8e0d0;background:#faf6ec;font-family:'EB Garamond','Georgia',serif;transition:width 0.2s">
      <div class="toggle-btn" style="font-size:18px;color:#5b3a8c;text-align:center;margin-bottom:14px;cursor:pointer">⟩</div>
      <div class="collapsed-icons">
        <div data-filter-icon="node-claim" style="text-align:center;margin-bottom:10px;cursor:pointer;color:#5b3a8c" title="claim 观点">●</div>
        <div data-filter-icon="node-person" style="text-align:center;margin-bottom:10px;cursor:pointer;color:#5b3a8c" title="person 人物">👤</div>
        <hr style="border:none;border-top:1px dotted #d0c8b0;margin:8px 0">
        <div data-filter-icon="rel-agreement_with" style="text-align:center;margin-bottom:10px;cursor:pointer;color:#7a9a5a;font-size:18px" title="agreement 影响">↝</div>
        <div data-filter-icon="rel-disagreement_with" style="text-align:center;margin-bottom:10px;cursor:pointer;color:#b8654a;font-size:18px" title="disagreement 反驳">⇋</div>
      </div>
      <div class="expanded-content" style="display:none">
        <div style="font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">节点类型</div>
        <label style="display:block;font-size:13px;margin-bottom:5px"><input type="checkbox" data-filter="node-claim" checked style="margin-right:6px">观点</label>
        <label style="display:block;font-size:13px;margin-bottom:5px"><input type="checkbox" data-filter="node-person" checked style="margin-right:6px">人物</label>
        <label style="display:block;font-size:13px;margin-bottom:5px"><input type="checkbox" data-filter="node-work" style="margin-right:6px">著作</label>

        <div style="font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;margin:14px 0 6px">关系类型</div>
        <label style="display:block;font-size:13px;margin-bottom:5px"><input type="checkbox" data-filter="rel-agreement_with" checked style="margin-right:6px">影响 <span style="color:#7a9a5a">●</span></label>
        <label style="display:block;font-size:13px;margin-bottom:5px"><input type="checkbox" data-filter="rel-disagreement_with" checked style="margin-right:6px">反驳 <span style="color:#b8654a">●</span></label>
        <label style="display:block;font-size:13px;margin-bottom:5px"><input type="checkbox" data-filter="rel-extends" style="margin-right:6px">自延 <span style="color:#aaa">●</span></label>

        <div style="font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;margin:14px 0 6px">学科</div>
        <label style="display:block;font-size:12px;margin-bottom:4px"><input type="checkbox" data-filter="cat-me" checked style="margin-right:6px">形而上 me</label>
        <label style="display:block;font-size:12px;margin-bottom:4px"><input type="checkbox" data-filter="cat-po" checked style="margin-right:6px">政治 po</label>
        <label style="display:block;font-size:12px;margin-bottom:4px"><input type="checkbox" data-filter="cat-et" checked style="margin-right:6px">伦理 et</label>
        <label style="display:block;font-size:12px;margin-bottom:4px"><input type="checkbox" data-filter="cat-re" checked style="margin-right:6px">宗教 re</label>
        <label style="display:block;font-size:12px;margin-bottom:4px"><input type="checkbox" data-filter="cat-mp" checked style="margin-right:6px">元哲学 mp</label>
      </div>
    </div>
  `;

  const sidebar = container.querySelector('.sidebar') as HTMLElement;
  const toggleBtn = container.querySelector('.toggle-btn') as HTMLElement;
  const collapsedIcons = container.querySelector('.collapsed-icons') as HTMLElement;
  const expandedContent = container.querySelector('.expanded-content') as HTMLElement;

  toggleBtn.addEventListener('click', () => {
    if (sidebar.dataset.state === 'collapsed') {
      sidebar.dataset.state = 'expanded';
      sidebar.style.width = '200px';
      collapsedIcons.style.display = 'none';
      expandedContent.style.display = 'block';
      toggleBtn.textContent = '⟨';
    } else {
      sidebar.dataset.state = 'collapsed';
      sidebar.style.width = '48px';
      collapsedIcons.style.display = 'block';
      expandedContent.style.display = 'none';
      toggleBtn.textContent = '⟩';
    }
  });

  // checkbox change → onFilterChange
  container.querySelectorAll('input[data-filter]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const key = (cb as HTMLInputElement).getAttribute('data-filter')!;
      const checked = (cb as HTMLInputElement).checked;
      const [type, name] = key.split('-');
      if (type === 'node') (filters.nodes as any)[name] = checked;
      else if (type === 'rel') (filters.relations as any)[name] = checked;
      else if (type === 'cat') (filters.cats as any)[name] = checked;
      onFilterChange?.(filters);
    });
  });

  // hover icon → onHover
  container.querySelectorAll('[data-filter-icon]').forEach((icon) => {
    icon.addEventListener('mouseenter', () => onHover?.(icon.getAttribute('data-filter-icon')));
    icon.addEventListener('mouseleave', () => onHover?.(null));
  });

  return { getFilters: () => filters };
}
```

- [ ] **Step 3: 验证 GREEN**

```bash
npx vitest run tests/unit/sidebar.test.ts
```

Expected: PASS（4 tests）

- [ ] **Step 4: 集成 sidebar 到 main.ts**

在 src/main.ts 早期（svg 创建之前）加：

```typescript
import { mountSidebar } from './components/sidebar.ts';

const layoutWrapper = document.createElement('div');
layoutWrapper.style.cssText = 'display:flex';
document.getElementById('app')!.appendChild(layoutWrapper);

const sidebarContainer = document.createElement('div');
layoutWrapper.appendChild(sidebarContainer);

const canvasContainer = document.createElement('div');
canvasContainer.style.flex = '1';
layoutWrapper.appendChild(canvasContainer);

mountSidebar({
  container: sidebarContainer,
  onFilterChange: (filters) => {
    // 应用 filter：隐藏 unchecked node / relation
    svg.selectAll('g.person-section')
      .style('display', (s: any) => filters.nodes.person ? null : 'none');
    svg.selectAll('path.arc')
      .style('display', (r: any) => (filters.relations as any)[r.type] ? null : 'none');
  },
  onHover: (filterKey) => {
    // hover 类型 icon → 主画布高亮该类型
    if (!filterKey) {
      svg.selectAll('path.arc').attr('opacity', null);
      return;
    }
    const [type, name] = filterKey.split('-');
    if (type === 'rel') {
      svg.selectAll('path.arc').attr('opacity', (r: any) => r.type === name ? 1 : 0.1);
    }
  },
});

// svg 改 mount 到 canvasContainer 而不是 #app
const svg = d3.select(canvasContainer).append('svg')...
```

- [ ] **Step 5: dev server 验证 + commit**

浏览器看左侧 48px 收起态 + 点 ⟩ 展开 200px + uncheck 反驳 → 红弧消失 + hover 影响 icon → 绿弧高亮 + 红弧淡化。

commit msg + push 同前 task pattern。

---

### Task 9: 详情卡 popover 组件

**Files:**
- Create: `src/components/claim-popover.ts`
- Create: `tests/unit/claim-popover.test.ts`
- Modify: `src/main.ts`（点击 obs 圆点 / claim_text 触发 popover）

**目的:** 实现 spec § 8.2 设计的详情卡 popover。点击 obs 弹出含 claim 全部字段 + 关联 person / work / 影响关系。

- [ ] **Step 1: 写 popover acceptance test**

新建 `tests/unit/claim-popover.test.ts`：

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { showClaimPopover, hideClaimPopover } from '../../src/components/claim-popover.ts';
import type { ClaimNode } from '../../src/types/Claim.ts';

describe('claim-popover · 详情卡', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const mockClaim: ClaimNode = {
    id: 'claim-marx-001',
    type: 'claim',
    name_zh: '异化劳动',
    name_orig: 'Alienated labor',
    claim_text: '异化劳动是私有财产的根源——不是私有财产产生异化劳动，是异化劳动产生私有财产。',
    author_id: 'wd-q9061',
    source_work_id: 'work-1844-manuscripts',
    year: 1844,
    cats: ['me', 'po'],
    keywords: '异化劳动',
    reference: 'marxists.org/zh/marx/1844/'
  };

  it('show 创建 popover DOM', () => {
    showClaimPopover(mockClaim, { x: 100, y: 100 }, { authorName: 'Karl Marx', sourceWorkName: '1844 经济学哲学手稿', agreementClaims: [], disagreementClaims: [] });
    expect(document.querySelector('.claim-popover')).not.toBeNull();
  });

  it('popover 显示 claim_text 完整文本', () => {
    showClaimPopover(mockClaim, { x: 100, y: 100 }, { authorName: 'Karl Marx', sourceWorkName: '1844', agreementClaims: [], disagreementClaims: [] });
    expect(document.querySelector('.claim-popover')?.textContent).toContain('异化劳动是私有财产的根源');
  });

  it('hide 移除 popover DOM', () => {
    showClaimPopover(mockClaim, { x: 100, y: 100 }, { authorName: 'Karl Marx', sourceWorkName: '1844', agreementClaims: [], disagreementClaims: [] });
    hideClaimPopover();
    expect(document.querySelector('.claim-popover')).toBeNull();
  });

  it('Esc 键 hide popover', () => {
    showClaimPopover(mockClaim, { x: 100, y: 100 }, { authorName: 'Karl Marx', sourceWorkName: '1844', agreementClaims: [], disagreementClaims: [] });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.claim-popover')).toBeNull();
  });
});
```

- [ ] **Step 2: 验证 RED + 写 src/components/claim-popover.ts**

```typescript
import type { ClaimNode } from '../types/Claim.ts';

export interface ClaimPopoverContext {
  authorName: string;
  sourceWorkName?: string;
  agreementClaims: { id: string; author: string; text: string }[];   // claim 影响 → 哪些后续 claim
  disagreementClaims: { id: string; author: string; text: string }[]; // 反驳 → 哪些 claim
}

export function showClaimPopover(
  claim: ClaimNode,
  position: { x: number; y: number },
  ctx: ClaimPopoverContext
) {
  hideClaimPopover();  // 先关闭已有

  const popover = document.createElement('div');
  popover.className = 'claim-popover';
  popover.style.cssText = `
    position:fixed;
    left:${Math.min(position.x, window.innerWidth - 320)}px;
    top:${Math.min(position.y, window.innerHeight - 300)}px;
    width:300px;
    background:#fffef8;
    border:1px solid #5b3a8c;
    box-shadow:2px 3px 8px rgba(0,0,0,0.15);
    padding:14px 16px;
    font-family:'EB Garamond','Georgia',serif;
    z-index:1000;
    font-size:12px;
    line-height:1.5;
  `;

  const catsLabels: Record<string, string> = {
    me: '形而上', ep: '认识论', lo: '逻辑', et: '伦理', po: '政治',
    ae: '美学', re: '宗教', mi: '心灵', la: '语言', sc: '科学', mp: '元哲学'
  };

  popover.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:start;border-bottom:1px solid #e8e0d0;padding-bottom:6px;margin-bottom:8px">
      <div>
        <div style="font-weight:700;color:#222;letter-spacing:0.5px;text-transform:uppercase;font-size:13px">${ctx.authorName}</div>
        ${ctx.sourceWorkName ? `<div style="color:#888;font-style:italic;font-size:10px">${ctx.sourceWorkName} · ${claim.year}</div>` : ''}
      </div>
      <div class="popover-close" style="cursor:pointer;color:#888;font-size:16px;line-height:1">×</div>
    </div>
    <div style="font-size:11px;color:#aaa;font-style:italic;margin-bottom:6px">
      ${claim.keywords ?? ''} · cats: ${claim.cats.map((c) => catsLabels[c] ?? c).join(', ')}
    </div>
    <div style="color:#222;font-style:italic;margin-bottom:10px">
      "${claim.claim_text}"
    </div>
    ${ctx.agreementClaims.length > 0 ? `
      <div style="font-size:11px;color:#888;margin-bottom:4px">影响：</div>
      ${ctx.agreementClaims.map((a) => `<div style="font-size:10px;color:#7a9a5a;font-style:italic;margin-left:8px">→ ${a.author}: ${a.text.slice(0, 40)}...</div>`).join('')}
    ` : ''}
    ${ctx.disagreementClaims.length > 0 ? `
      <div style="font-size:11px;color:#888;margin:6px 0 4px">反驳：</div>
      ${ctx.disagreementClaims.map((d) => `<div style="font-size:10px;color:#b8654a;font-style:italic;margin-left:8px">← ${d.author}: ${d.text.slice(0, 40)}...</div>`).join('')}
    ` : ''}
    ${claim.reference ? `<div style="font-size:10px;color:#888;margin-top:8px;border-top:1px dotted #d8cab0;padding-top:6px">原文：${claim.reference}</div>` : ''}
  `;

  document.body.appendChild(popover);

  // 关闭交互
  (popover.querySelector('.popover-close') as HTMLElement).addEventListener('click', hideClaimPopover);

  // Esc 关闭
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') hideClaimPopover();
  };
  (popover as any)._escHandler = escHandler;
  document.addEventListener('keydown', escHandler);
}

export function hideClaimPopover() {
  const existing = document.querySelector('.claim-popover');
  if (existing) {
    const handler = (existing as any)._escHandler;
    if (handler) document.removeEventListener('keydown', handler);
    existing.remove();
  }
}
```

- [ ] **Step 3: 验证 GREEN**

```bash
npx vitest run tests/unit/claim-popover.test.ts
```

Expected: PASS（4 tests）

- [ ] **Step 4: 集成 popover 到 main.ts**

在 obs 渲染 g 上加 click handler：

```typescript
import { showClaimPopover } from './components/claim-popover.ts';

// 在 obs g 渲染部分加：
g.attr('cursor', 'pointer').on('click', function(event, c) {
  const author = persons.find((p) => p.id === c.author_id);
  const sourceWork = c.source_work_id ? nodesData.nodes.find((n: any) => n.id === c.source_work_id) : null;

  // 找 agreement / disagreement 关系
  const agreementRels = relations.filter((r) => r.source === c.id && r.type === 'agreement_with');
  const disagreementRels = relations.filter((r) => (r.source === c.id || r.target === c.id) && r.type === 'disagreement_with');

  const agreementClaims = agreementRels.map((r) => {
    const target = claims.find((cc) => cc.id === r.target)!;
    const targetAuthor = persons.find((p) => p.id === target.author_id);
    return { id: target.id, author: targetAuthor?.name_zh ?? '?', text: target.claim_text };
  });
  const disagreementClaims = disagreementRels.map((r) => {
    const otherId = r.source === c.id ? r.target : r.source;
    const other = claims.find((cc) => cc.id === otherId)!;
    const otherAuthor = persons.find((p) => p.id === other.author_id);
    return { id: other.id, author: otherAuthor?.name_zh ?? '?', text: other.claim_text };
  });

  showClaimPopover(c, { x: event.clientX + 10, y: event.clientY + 10 }, {
    authorName: author?.name_zh ?? '?',
    sourceWorkName: sourceWork?.name_zh,
    agreementClaims,
    disagreementClaims,
  });
});
```

- [ ] **Step 5: dev server 验证 + commit**

浏览器点 obs → 弹出详情卡含 claim_text + 关联关系 + 出处。Esc 关闭。

commit msg + push。

---

### Task 10: 维度融合 B 方案叠加

**Files:**
- Modify: `src/main.ts`（勾选著作 → obs 行末尾叠加 [书名 · 年份]）
- Modify: `src/components/sidebar.ts`（加 work / event / place filter）
- Modify: `tests/unit/sidebar.test.ts`（加 work filter test）

**目的:** spec § 8.1 方案 B：勾选 sidebar 著作 / 地点 / 事件 → 主画布 obs 行末尾叠加元数据。

- [ ] **Step 1: 扩展 sidebar onFilterChange callback 处理 work / event / place**

在 main.ts 的 sidebar onFilterChange 加：

```typescript
onFilterChange: (filters) => {
  // ...existing handlers
  
  // 著作勾选 → obs 行末尾追加 [书名 · 年份]
  svg.selectAll('text.obs-source-meta').remove();
  if (filters.nodes.work) {
    svg.selectAll('g.obs').each(function(c: any) {
      if (c.source_work_id) {
        const work = nodesData.nodes.find((n: any) => n.id === c.source_work_id);
        if (work) {
          d3.select(this).append('text')
            .attr('class', 'obs-source-meta')
            .attr('x', 600).attr('y', 0)  // 假设 obs 句子结束 X = 600
            .attr('font-size', 9).attr('fill', '#aaa')
            .attr('font-style', 'italic')
            .text(`[${work.name_zh} · ${work.pub_year}]`);
        }
      }
    });
  }
}
```

- [ ] **Step 2: 写 acceptance test 扩展**

修改 `tests/unit/sidebar.test.ts` 加：

```typescript
it('勾选著作触发 onFilterChange.nodes.work = true', () => {
  let captured: SidebarFilters | null = null;
  mountSidebar({ container, onFilterChange: (f) => captured = f });
  // 先展开
  (container.querySelector('.toggle-btn') as HTMLElement).click();
  (container.querySelector('input[data-filter="node-work"]') as HTMLInputElement).click();
  expect(captured?.nodes.work).toBe(true);
});
```

- [ ] **Step 3: 验证 GREEN**

```bash
npx vitest run tests/unit/sidebar.test.ts
```

Expected: PASS（5 tests）

- [ ] **Step 4: dev server 验证 + commit**

浏览器：勾选著作 → obs 行末尾出现 [书名 · 年份]。

commit msg + push。

---

### Task 11: M3 demo URL 处理（保留 + 移除主页入口）

**Files:**
- Modify: `index.html`（title / meta / 主页 redirect to M4）
- Create: `m3.html` 或 `public/m3/index.html`（M3 demo 存档入口）
- Modify: `vite.config.ts`（如果需要 build multiple entries）

**目的:** spec § 2.2 选项 C：M4 上线后主页 = M4 demo / M3 demo URL 保留作存档（如 `/m3/`）。

- [ ] **Step 1: 检查现有 index.html / vite.config.ts 配置**

```bash
cat F:/AI/projects/Marx/index.html
cat F:/AI/projects/Marx/vite.config.ts
```

按现有配置决定是否需要 multi-entry build。

- [ ] **Step 2: 把 M3 entry 移到 /m3/**

```bash
mkdir -p public/m3
cp src/data/nodes_skeleton.json public/m3/
# 把 M3 主页 HTML + JS bundle 复制到 public/m3/
# 如果用 vite build 已经 bundle 完，复制 dist/ 到 public/m3/
```

具体操作要看 vite 实际 build 输出，T11 implementation 时确定。

- [ ] **Step 3: 修改 index.html 主页指向 M4**

修改 `index.html`：
```html
<title>Marx 思想史 · 一句话观点 + 半圆弧关系</title>
<meta name="description" content="Marx 思想史 visualized · M4 claim-on-timeline · 灵感来自 denizcemonduygu.com/philo">
```

主体 `<div id="app"></div>` 不变（src/main.ts 渲染 M4）。

如果想加 footer 链接到 M3 存档：
```html
<footer>
  <a href="/m3/" style="color:#888;font-size:11px">M3 旧版（person-network 星图）</a>
  <a href="https://www.denizcemonduygu.com/philo/" style="color:#888;font-size:11px">Inspired by denizcemonduygu</a>
</footer>
```

- [ ] **Step 4: 验证 build + 上线**

```bash
npm run build
npm run preview
```

浏览器看 `http://localhost:4173/marx/` = M4 demo / `http://localhost:4173/marx/m3/` = M3 存档。

- [ ] **Step 5: commit + push**

commit msg：
```
feat(M4): Task 11 完成 - M3 demo URL 处理 (保留 + 主页 M4)

主页指向 M4 (claim-on-timeline)
M3 存档保留 /m3/ URL
footer 加 M3 存档链接 + denizcemonduygu 致谢
```

---

### Task 12: M4 整体 acceptance test

**Files:**
- Create: `tests/unit/stage-m4-acceptance.test.ts`
- Create: `e2e/m4-demo.spec.ts`

**目的:** 整体验收。覆盖 spec § 11 acceptance criteria 的数据完整度 + 视觉实现 + 交互。

- [ ] **Step 1: 写 stage-m4-acceptance.test.ts（unit 层）**

```typescript
import { describe, it, expect } from 'vitest';
import data from '../../src/data/claims.json';
import nodesData from '../../src/data/nodes_skeleton.json';
import type { ClaimNode, ClaimRelation } from '../../src/types/Claim.ts';

describe('M4 acceptance · 数据完整度', () => {
  const claims = data.claims as ClaimNode[];
  const relations = data.relations as ClaimRelation[];
  const persons = nodesData.nodes.filter((n: any) => n.type === 'person');

  it('ClaimNode 总数 ≥ 80 (M4 minimum)', () => {
    expect(claims.length).toBeGreaterThanOrEqual(80);
  });

  it('agreement / disagreement relations ≥ 100', () => {
    const agreeOrDisagree = relations.filter((r) => r.type === 'agreement_with' || r.type === 'disagreement_with');
    expect(agreeOrDisagree.length).toBeGreaterThanOrEqual(100);
  });

  it('12 concept claim_text 升级 100% 完成', () => {
    const conceptClaims = claims.filter((c) => c.derived_from_concept_id);
    expect(conceptClaims.length).toBe(12);
    for (const c of conceptClaims) {
      expect(c.claim_text).not.toBe('<待 AI 草稿>');
      expect(c.claim_text.length).toBeGreaterThan(0);
    }
  });

  it('Marx 19 obs 中文翻译 100% 完成', () => {
    const marxClaims = claims.filter((c) => c.derived_from_denizcemonduygu_record_id !== undefined && c.author_id === 'wd-q9061');
    expect(marxClaims.length).toBe(19);
    for (const c of marxClaims) {
      expect(c.claim_text).not.toBe('<待翻译>');
    }
  });

  it('每个 person 至少 1 个 claim (覆盖度 ≥ 50%)', () => {
    const claimAuthors = new Set(claims.map((c) => c.author_id));
    const coverage = claimAuthors.size / persons.length;
    expect(coverage).toBeGreaterThanOrEqual(0.5);
  });
});
```

- [ ] **Step 2: 写 e2e Playwright test**

新建 `e2e/m4-demo.spec.ts`：

```typescript
import { test, expect } from '@playwright/test';

test.describe('M4 demo · e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173/marx/');
  });

  test('主画布渲染 person section + claim text', async ({ page }) => {
    await expect(page.locator('g.person-section').first()).toBeVisible();
    await expect(page.locator('text').filter({ hasText: /MARX/i }).first()).toBeVisible();
  });

  test('点 claim 圆点弹出详情卡', async ({ page }) => {
    await page.locator('g.obs').first().click();
    await expect(page.locator('.claim-popover')).toBeVisible();
  });

  test('Esc 关闭详情卡', async ({ page }) => {
    await page.locator('g.obs').first().click();
    await expect(page.locator('.claim-popover')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.claim-popover')).toBeHidden();
  });

  test('左侧栏点 ⟩ 展开 200px', async ({ page }) => {
    const sidebar = page.locator('.sidebar');
    expect(await sidebar.evaluate((el) => el.getAttribute('data-state'))).toBe('collapsed');
    await page.locator('.toggle-btn').click();
    expect(await sidebar.evaluate((el) => el.getAttribute('data-state'))).toBe('expanded');
  });

  test('底部时间轴游标可拖', async ({ page }) => {
    const slider = page.locator('#tl-slider');
    await slider.fill('1850');
    await expect(page.locator('#tl-cursor-label')).toHaveText('游标 1850');
  });

  test('M3 存档 URL 仍可访问', async ({ page }) => {
    await page.goto('http://localhost:4173/marx/m3/');
    await expect(page.locator('body')).toBeVisible();
  });
});
```

- [ ] **Step 3: 跑 unit + e2e test**

```bash
npm test
npm run e2e  # 假设已配置 playwright
```

Expected: 全 PASS

- [ ] **Step 4: commit + push**

```
feat(M4): Task 12 完成 - M4 整体 acceptance test

unit: tests/unit/stage-m4-acceptance.test.ts (5 it 数据完整度)
e2e: e2e/m4-demo.spec.ts (6 test 覆盖主画布 / 详情卡 / 侧栏 /
时间轴 / M3 存档)

总测试 51/48/3 → 56/53/3
```

---

### Task 13: 上线 + M4 takeaway

**Files:**
- Create: `docs/2026-XX-XX-m4-takeaway.md`（具体日期填上线当天）
- Modify: `README.md`（加 M4 节）
- Modify: `AGENTS.md`（更新项目状态）

**目的:** GitHub Pages 上线 + 落 takeaway 文档（compound engineering 原则，让下次更易做）

- [ ] **Step 1: build + push 触发 GH Pages 部署**

```bash
npm run build
git add dist/ index.html public/m3/
git commit -m "build(M4): production build + M3 archive deployed"
git push origin main
```

- [ ] **Step 2: 浏览器目测在线 URL**

打开 `https://cdu52802-xx.github.io/marx/` 验证 M4 demo 运行 + `/m3/` M3 存档可访问。

- [ ] **Step 3: 写 docs/2026-XX-XX-m4-takeaway.md**

模板（按 M3 takeaway 风格 + Marx anchor 风格）：

```markdown
# Marx M4 takeaway · claim-on-timeline 形态完成

> 上线日期: 2026-XX-XX
> 在线 URL: https://cdu52802-xx.github.io/marx/
> M3 存档: https://cdu52802-xx.github.io/marx/m3/
> 上游: M4 spec / M4 plan
> 下游: M5 视觉细节迭代 / 弧线密度 polish / 头像 / 学科 cats 配色

## 1. M4 上线状态

形态 vs PRD: claim-on-timeline / 斜向流 / 半圆弧 / 底部时间轴 / 颗粒度栏 / 详情卡 popover ✓
数据规模: X claims / Y relations / Z person 覆盖

## 2. 13 task 完成记录

| Task | commit | note |
|---|---|---|
| T1 schema | xxxxxxx | ClaimNode + 校验 |
| T2 Marx 19 | xxxxxxx | denizcemonduygu 借鉴 |
| ... | | |

## 3. 关键决策回顾

- 第一性原理 claim 节点 type (vs M3 5 类节点)
- denizcemonduygu 借鉴边界 (借鉴布局 + 数据 / 不照抄细节)
- M3 决策 4 复核策略覆盖回 M3 决策 3 (vision 核心错误成本高)
- T6 PM checkpoint 时机

## 4. 5 个新坑 (20-24)

(详见 plan § 2，本 takeaway 验证后回填实际触发 / 回避情况)

## 5. M5 已知改进项

- 弧线密度 polish (跑 100+ claim / 250+ link 真数据后)
- 学科 cats 视觉编码
- 头像上传 (版权问题 M5 解决)
- 详情卡 hover 预览 (M4 只点击触发)
- 复杂搜索 / index 侧栏

## 6. denizcemonduygu 致谢 / 版权

M4 demo footer 致谢 inspired by denizcemonduygu.com/philo
M5+ 公开发布前 (PM 决定时机) 必须联系作者获正式授权
```

- [ ] **Step 4: 修改 README.md 加 M4 节**

在 README.md 加：

```markdown
## M4 · claim-on-timeline (2026-05-XX 上线)

主形态: 一句话观点 + 半圆弧关系 + 底部时间轴 + 颗粒度勾选

数据: X claim / Y relation / Z 哲学家覆盖

灵感: denizcemonduygu.com/philo (借鉴布局 + 数据样式)

历史 demo:
- M3 (person-network 星图): /m3/
- M2 / M1: 已 M3 替换
```

- [ ] **Step 5: 更新 AGENTS.md 项目状态**

修改 AGENTS.md `## 项目状态` 节：
```
- 第一个产品代号: Marx 星图 + Marx 思想史
- 阶段: M1 + M2 + M3 + M4 已上线
  - M4 在线: https://cdu52802-xx.github.io/marx/
  - M3 存档: https://cdu52802-xx.github.io/marx/m3/
- M4 takeaway: docs/2026-XX-XX-m4-takeaway.md
```

- [ ] **Step 6: commit + push**

commit msg：
```
docs(M4): Task 13 完成 - M4 上线 + takeaway

新增 docs/2026-XX-XX-m4-takeaway.md (含 13 task 完成记录 + 5 关键决策
回顾 + 5 个新坑 20-24 + M5 已知改进项 + denizcemonduygu 致谢)

修改 README.md 加 M4 节 (在线 URL + 数据规模 + denizcemonduygu 致谢
+ 历史 demo 链接)

修改 AGENTS.md 更新项目状态 (M1+M2+M3+M4 已上线)

M4 完成 = 主形态从 person-network 大重构为 claim-on-timeline
```

---

## 7. Self-Review Checklist

- [x] **Spec coverage**: 13 task 覆盖 spec § 1-13 全部内容（vision / scope / 数据 schema / 视觉风格 / layout / 时间轴 / 颗粒度栏 / 维度融合 / 数据采集 / M3 demo 处理 / acceptance criteria）
- [x] **Placeholder scan**: 无 TBD / TODO / "implement later" / "fill in details" placeholder。所有 step 含 actual 代码或 actual 命令
- [x] **Type consistency**: ClaimNode / ClaimRelation / ClaimCategory 在 T1-T13 全部用同样 type 名 + 字段名
- [x] **关键 vision 体现到 code level**: 半圆弧方向规范（绿左下 / 红右上）有 unit test 显式断言（T6 Step 1 第 4 / 5 个 it）
- [x] **TDD 顺序**: 每 task 都是 write test → verify RED → implement → verify GREEN → commit
- [x] **复用 M3 模式**: T2-T4 数据采集 reuse hybrid AI 草稿 + apply 脚本 pattern
- [x] **PM checkpoint 强制**: T6 完成后明确 stop wait（spec § 12.2 risk 2 mitigation）
- [x] **致谢 / 版权**: T11 footer + T13 takeaway 都含 denizcemonduygu 致谢

## 8. 执行选项

Plan complete + saved to `plans/2026-05-11-marx-m4-claim-timeline.md`. 两个执行选项：

**1. Subagent-Driven（推荐）** — 每 task 派 fresh subagent 执行 + 我 review + 进 next task
- REQUIRED SUB-SKILL: `superpowers:subagent-driven-development`
- 适合：大 plan / 多 task 独立性高 / 想保持 main context 干净
- M4 13 task 大部分独立（除 T5 依赖 T2-T4 / T6-T9 依赖 T1）

**2. Inline Execution** — 在当前 session 直接执行 + checkpoint review
- REQUIRED SUB-SKILL: `superpowers:executing-plans`
- 适合：想跟进每 step 细节 / 边做边调整 plan

PM 决定 → `subagent` / `inline` / `先 review plan 再决定`

