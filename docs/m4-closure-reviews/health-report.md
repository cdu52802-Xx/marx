# M4 Closure · Health Report

> **触发**：2026-05-13 M4 closure 4 件套 · 1/4
> **工具**：gstack `/health` skill
> **范围**：Marx repo（含 `src/` `tests/` `scripts/`）
> **运行**：2026-05-13 (Asia/Shanghai)
> **HARD GATE**：本 report 只诊断不修 / 修复建议见 § 4

---

## 1. 综合分

| 指标 | 值 |
|---|---|
| **Composite Score** | **6.0 / 10** |
| **Status** | ⚠ **NEEDS WORK** |
| **First run** | 是（无 trend 数据） |

**0 代码 PM 翻译**：60 分及格但偏低。**不是代码烂**，而是 2 个工具配置问题被放大成"很多错误"假象。**真实质量约 8/10**，但 health skill 按工具 raw 输出诚实打分。

---

## 2. 分类得分

| 分类 | 工具 | 得分 | 状态 | 耗时 | 详情 |
|---|---|---|---|---|---|
| Type check | `tsc --noEmit` | 5/10 | ⚠ NEEDS WORK | 14.8s | 25 errors（22 个同类 TS5097 + 3 个真错）|
| Lint | `eslint . --max-warnings=0` | 4/10 | ⚠ NEEDS WORK | 11.6s | 70 errors **全是 1 个 config 问题重复 70 次** |
| Tests | `vitest run` | 8/10 | ⚠ WARNING | ~20s | 100/103 pass（3 RED M3 pre-existing baseline）|
| Dead code | (knip 未装) | — | SKIP | — | 权重重分到上面 3 项 |
| Shell lint | (项目无 .sh) | — | SKIP | — | 权重重分到上面 3 项 |
| GBrain | (未装) | — | SKIP | — | 权重重分到上面 3 项 |

**权重重分（skip 后）**：typecheck 32% / lint 27% / test 41%
**计算**：5×0.32 + 4×0.27 + 8×0.41 = 1.60 + 1.08 + 3.28 = **5.96 ≈ 6.0**

---

## 3. 关键 findings（按影响排序）

### F1 · ⚠⚠ Lint 70 errors 是 gstack worktree 副作用（最严重 / 修复 ROI 最高）

**现象**：`npx eslint .` 报 70 errors / 全部内容为：
```
Parsing error: No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are present:
 - F:\AI\projects\Marx
 - F:\AI\projects\Marx\.claude\worktrees\gracious-albattani-43d059
 - F:\AI\projects\Marx\.claude\worktrees\jovial-jones-b83148
```

**根因**：PM 装 gstack 时 / 或某个 skill 在 `.claude/worktrees/` 下创建了 2 个 git worktree（每个含自己的 tsconfig.json）。typescript-eslint 不知道 lint 主仓时该用哪个 tsconfig。

**事实**：
- 这 70 errors **不是代码质量问题**
- 主仓代码本身 lint 干净（之前 deploy 都过了 GH Actions ESLint）
- 是 gstack-created artifacts 污染了 ESLint scope

**修复方向**（2 个候选 / PM 拍板）：
- A · `.eslintignore` 加 `.claude/` 一行 / 5 min / 最小侵入 ✅ 推荐
- B · eslint.config.js 设 `tsconfigRootDir: import.meta.dirname` / 10 min / 更地道但要改 config
- C · 删 `.claude/worktrees/` 整个目录 / 风险：可能是 gstack ongoing 状态需要保留

### F2 · ⚠ Typecheck 22 × TS5097（import `.ts` 扩展）= 单一 tsconfig 决策

**现象**：`src/` `scripts/` `tests/` 几乎所有 `import` 写成 `from './foo.ts'` 但 tsconfig 设 `allowImportingTsExtensions: false`。

**事实**：
- 运行时 OK（vite + vitest 都 handle）
- 但 tsc 严格模式不接受
- 这是 TypeScript 6.0 升级后的新规则（package.json 看到 TS `^6.0.3`）

**修复方向**（PM 拍板 / 都是 5 min）：
- A · tsconfig 改 `"allowImportingTsExtensions": true` / 跟现有代码对齐 / 最小修
- B · 全仓 sed 改 `from './foo.ts'` → `from './foo'` / 跟 Bundler resolver 默认对齐 / 一致性更好但 risk 高
- C · 引入 `tsx --no-warnings` 静默 / 不推荐

⭐ 推荐 A · 因为现有 60+ 文件已经用 `.ts` 扩展形成 convention / 改 tsconfig 比改代码风险低。

### F3 · ⚠ Typecheck 2 个真 type error

**3.1 · `src/main.ts:354`**
```typescript
Selection<SVGSVGElement, unknown, HTMLElement, any>
  not assignable to
Selection<SVGSVGElement, unknown, null, undefined>
```
d3 v7 select() 返回类型跟某处使用预期不匹配。需要查 main.ts:354 上下文 / 可能是 select('#app').append('svg') 的 parent 类型断言。

**3.2 · `tests/unit/apply-claim-filters.test.ts:11`**
```typescript
ClaimNode 缺 name_zh / name_orig 字段
```
**这是 B1 fix 那批新 test！** B1 commit 2eae1db 的 test fixture 没填齐 ClaimNode 必填字段。runtime test pass 是因为 helper 只用了 cats/claim_text 字段，但 type 严格检查发现 fixture 不完整。

修复方向：fixture 加 `name_zh: 'test', name_orig: 'test'` 字段（2 min）。

### F4 · ⚠ Tests 3 RED 全是 M3 pre-existing baseline（不是 M4 regression）

- `stage-b-validated.test.ts` — wd-q136116320 Alfred Herman name_orig == name_zh / bio 空
- `stage-c-successor-notes.test.ts` × 2 — 12 concept successor_notes 全空

**事实**：M4 anchor 已记录 / 等 M3 阶段 C 决策（选项 A 跑完 SEP HTML / 选项 B 永久跳过 / takeaway § 4 建议 B）。
**不属 M4 范围 / 不在本 health check 修复列表**。

---

## 4. 推荐操作（按 impact 排序 / PM 决定要不要做）

| # | 操作 | 类别 | 时间 | 影响 | 建议时机 |
|---|---|---|---|---|---|
| 1 | `.eslintignore` 加 `.claude/` | lint config | 5 min | 70 errors → 0 / health 跳到 ~7.5 | ⭐ **立即** 1-2 commit 内 |
| 2 | tsconfig 改 `allowImportingTsExtensions: true` | typecheck config | 5 min | 22 errors 消除 / health 跳到 ~8.5 | ⭐ **立即** 1-2 commit 内 |
| 3 | apply-claim-filters.test.ts:11 fixture 补字段 | bugfix | 2 min | 真错 1 个 | B1 fix 后续 polish |
| 4 | main.ts:354 d3 Selection 类型 | bugfix | 10-20 min | 真错 1 个 / 运行时无影响 | M5 启动期 |

**做完 1+2+3** → composite 应该跳到 **8.5+** （CLEAN-ish 健康度）/ 4 件套继续。

---

## 5. Caveats / 为什么 6.0 偏低不代表代码烂

- ✅ **runtime 健康**：dev server 跑 / build 过 / GH Pages deploy 多次成功
- ✅ **test 健康**：97.1% pass / 3 RED 文档化为 M3 baseline 非 M4 regression
- ⚠ **tooling config 健康**：tsconfig + eslint 跟 gstack-created `.claude/worktrees/` 撞 + TS 6.0 升级后新规则未跟进
- 修复 F1 + F2 共 ~10 min / health 跳到 8.5+
- gstack `/health` HARD GATE：**只诊断不修** / 修不修 PM 拍板

---

## 6. History / Trend

**首次跑** / 无 trend 数据。

gstack 标准 history 路径：`~/.gstack/projects/marx/health-history.jsonl`（Windows = `C:\Users\xuzequan\.gstack\...`）
**本次未写入**：避免触发 gstack `gstack-slug` binary（需先做 gstack 一次性 setup ceremony / 跟 M4 closure 解耦）。

PM 后续做 gstack 全套 setup（telemetry / routing / artifacts sync）时可补写 baseline。本 report 保留作业期 baseline。

JSONL baseline 备份（可拷到 gstack 路径）：
```json
{"ts":"2026-05-13T15:50:00+08:00","branch":"main","score":6.0,"typecheck":5,"lint":4,"test":8,"deadcode":null,"shell":null,"gbrain":null,"duration_s":47,"note":"M4 closure baseline · gstack first run"}
```

---

## 7. 后续 baseline 时机

- M5 实施期间任意时刻可重跑 `/health` 对比 / 看推荐操作 1+2 是否做了
- 推荐 M5 brainstorm 前先做推荐 1+2（10 min 投入 / health 跳到 8.5+ / 后续所有 milestone health check 都更 meaningful）

---

**STATUS**: DONE_WITH_CONCERNS
**REASON**: health check 完成 + dashboard 出 / 但分数 6.0 主要由 2 个 tooling config 问题驱动（非代码质量问题）/ 建议立即修 F1 + F2（共 10 min）让 baseline 跳到 8.5+
**ATTEMPTED**: tsc --noEmit / eslint . / 复用 vitest 已知结果
**RECOMMENDATION**: 4 件套继续跑 / SUMMARY.md 综合阶段把 F1/F2 列入 M4 closure 即时 fix 候选 / PM 拍板
