# DR-069 弧线误选 bug · 专项 spec

> 创建：2026-05-19 / M5 主线 A ship 完成（commit `0fd1869`/`d3b001b`）后
> 状态：**4 轮专攻仍未解 · backlog · B 阶段单独攻**
> 关联：
> - [M5 takeaway § 3.1 DR-069](../docs/2026-05-19-m5-linea-takeaway.md)
> - [Stage 5 lessons memory](../../Claude/.claude/projects/F--AI-projects-Marx/memory/feedback_m5_stage5_implementation_lessons.md)
> - dev 工具：`?debug=1` 启用 `[arc-debug]` console.log + `window.__arcPick(clientX, clientY)`

## 1. 问题

PM 实操弧线 click / 想选 A 弧 实际选 B 弧 / 远近都有。**同色 type 弧重叠场景重灾区**。

### 1.1 典型错例（2026-05-19 R5 attempt PM 截图）

- PM hover：路德维希 反对 卡尔·马克思（短弧 / disagreement / 红色）
- floating label 显示：黑格尔 反对 卡尔·马克思（长弧 / disagreement / 红色）
- 两条同色 disagreement / 同 target marx / 不同 source person
- PM 视觉锚 cursor 在路德维希 stroke 上 / 算法选黑格尔

## 2. 4 轮已尝试

| Round | Date | 修法 | 结果 | DR |
|---|---|---|---|---|
| R1 | 2026-05-15 | hit overlay 透明 16px non-scaling stroke | hit zone 扩大 / cross-arc 干扰 ↑ | DR-061 |
| R3 | 2026-05-18 | pickNearestArc `elementsFromPoint` candidates + 几何最近 32 点采样 | 几何择优 / 不靠 DOM stacking / PM 仍误选 | DR-067 |
| R4 | 2026-05-18 | hover preview RAF 节流 + stroke 高亮 | preview 视觉显示 / 不改算法选择 | DR-068 |
| **R5** | 2026-05-19 | 全 arc 扫描 + endpoint-aware 两阶段 picker（endpoint-mode + path-mode fallback）+ (5) floating label + endpoint dot 黄边 | endpoint 周围 8 方向 50% 变选（R3→R5 偏短弧）/ **同色 stroke 重叠场景仍误选** | （commit 0fd1869）|

## 3. RC 假设演进

- **RC1**（推翻）：`elementsFromPoint` 漏 candidates → 推翻 / click event 入口就是 hit stroke / 不会漏 event target
- **RC2**（R3~R4 尝试不解）：几何最近 ≠ 视觉认知最近 / 用户视觉锚 endpoint
- **RC11 新（R5 后）**：**同 type 弧 visible stroke 视觉重叠时 / 几何最近 vs 视觉判定边界差异**
  - PM 视觉锚 cursor 在的 visible stroke
  - 算法依据 hit overlay (16px) + 几何最近 / 可能选其他
  - 同色 stroke 重叠时 PM 视觉无法区分单独 path 但有意识选择"路德维希那条"

## 4. 候选攻法（B 阶段详化）

### 4.1 (a) visible stroke 中心距而非 hit overlay 几何最近

用 visible (1.1-1.2px) stroke 距 cursor 中心 / 而非 hit overlay (16px) 几何最近。

- **理论**：PM 视觉锚 visible stroke / 算法用 visible 距离 = 跟视觉对齐
- **风险**：同色弧 visible 也可能近距重叠 / 不完全解 RC11
- **实施**：pickNearestArc 改用 `g.arc-layer > path.arc` 几何距离 / 不用 `g.arc-hit-layer > path.arc-hit`

### 4.2 (b) 同色弧 cluster 内部 disambig 二级 UI

cluster click 弹候选 list / 让 PM 显式选 source/target。

- **理论**：彻底绕开几何 vs 视觉边界判定 / PM 主动 disambig
- **UX 复杂度高**：需新 UI 组件（候选 list）+ 视觉风格协调 + cluster 检测算法（同 cursor 16px 内有 2+ candidates）
- **根本解**：100% 避免误选 / PM 显式选

### 4.3 (c) hover sticky · 选中后锁定

用户 click 一次 / 暂锁定该弧 / cursor 微动不漂移到 popover dataset.relKey 不一致前不切换。

- **当前实现已有 same relation guard**：[arc-popover.ts:68](../src/components/arc-popover.ts:68) `if (existing && existing.dataset.relKey === relKey)` 不重 show
- 已含 sticky / 但仅 popover 重复 click 防抖 / 不解首次选错

### 4.4 (d) endpoint-priority hit zone 几何

hit overlay 不用 stroke 16px / 而用 endpoint 周围 16px 圆 + path 中段 8px stroke。

- **理论**：endpoint 周围加权 / 跟 PM 视觉认知锚 endpoint 一致
- **R5 endpoint-aware 算法本质类似 / 没完全解**

### 4.5 dev 工具（M5 commit 0fd1869 已加）

- URL `?debug=1` 启用 `[arc-debug]` console.log
- `window.__arcPick(clientX, clientY)` 直接调 picker
- `g.arc-hit-layer > path.arc-hit` 元素结构稳定 / 测试 + debug 用

## 5. 暂存 dev (5) UX fallback（已 prod ship）

(5) hover preview label + endpoint dot 黄边高亮已 ship（commit `0fd1869`）：
- floating label 跟 cursor 显示 "X 同意/反对 Y"
- 两端 obs dot 黄边 r=4（区分 selected r=5 紫白边）
- preview-then-commit 心智延续 Stage 4 / R2

即使根因没解 / PM 实战 hover 看 label 显示错可移开避免误 commit。

## 6. B 阶段启动 acceptance criteria

待 B brainstorm 时拍板 / 至少：
- PM 实测同色 stroke 重叠场景（路德维希 vs 黑格尔 disagreement）
- floating label 显示对的 source/target / 错例 < 1/10 hover
- 不破坏现有 (5) hover preview UX

## 7. 攻法决策建议（B 阶段决策点）

| 攻法 | 难度 | 解 RC11 程度 | UX 影响 |
|---|---|---|---|
| 4.1 visible stroke 距 | 小 | 部分 | 0 |
| 4.2 cluster disambig UI | 大 | 完全 | + 新组件 |
| 4.3 hover sticky | 已有部分 | 不解 | 0 |
| 4.4 endpoint-priority hit zone | 中 | 类似 R5 | 0 |

**B 阶段推荐路径**：4.1 + 4.2 组合 — 默认用 visible stroke 距（解 80% 场景）+ 同色 cluster 触发 disambig UI（解剩余 20%）。

## 8. PM 决策（2026-05-20）· A + D 不强攻 / 推 B 主线统筹

**重新评估发现** spec § 4.1 算法上无效：

- visible arc-layer (src/main.ts:204-229) 跟 hit arc-hit-layer (src/main.ts:234-244) path 形状 1:1 完全相同（同 generateArcPath / 同 source/target/y-3 偏移）
- 几何距离基于 path 形状（SVGPathElement.getPointAtLength）/ 跟 stroke 粗细无关
- 改 querySelector 从 `g.arc-hit-layer > path.arc-hit` 换成 `g.arc-layer > path.arc` / 算法结果**完全相同** / 等于不改

**RC11 真根因**：同色弧 visible stroke 视觉重叠 → 用户视觉自己分不清 → 算法只能猜（50% 概率选错）。不是算法 bug 是信息歧义本质问题。

**PM 决策 A + D**：

| 攻法 | 选择 | 理由 |
|---|---|---|
| A · 接受现状（R5 hover label + endpoint 黄边 ship 兜底） | ✅ | 用户 hover 看错可移开避免 commit · 实战 UX 已 fallback |
| D · 推 B 主线统筹 | ✅ | B 主线 5-6 周内可能弧线整体改设计（球面/平面/great circle 大圆弧）· 现在 1-2 天修可能白做 |
| B · 4.2 cluster disambig UI 真解 | ❌ | 工程 1-2 天 / 但跟 B 主线 layout 改动会冲突 / 边际 ROI 低 |
| C · hover sticky 加强 | ❌ | 部分解 / 先碰到可能就是错的 / 不彻底 |

**Phase 0（2026-05-20）DR-069 不实施修法** · DR-069 backlog 转入 B 主线待办 · B2 副窗实施期重新审视弧线视觉（含球面 great circle 大圆弧 / 可能重设计 hit 模型）。

关联：
- [B 主线 brainstorm 决策落档 § 14 Phase 0](../docs/2026-05-20-b-mainline-brainstorm-decisions.md)
- [M5 takeaway § 3.1 DR-069 状态升级](../docs/2026-05-19-m5-linea-takeaway.md)
