# Marx M-B2 · Stage 1 prototype 收尾 takeaway（2026-05-22）

> **状态**：B2 Stage 0 + Stage 1 完成 · PM 实测验收通过 · 等 `go Stage 2` 启动 86 节点全渲染 brainstorm
> **当前 HEAD**：`56874b9`（revert distance 1.5 / 回 distance=2 · PM 妥协接受）
> **Git**：clean / origin/main 同步 / deploy run 26272989896 success
> **Prod**：https://cdu52802-xx.github.io/marx/ → 主画面右上 300×200 prototype 浮窗
> **关联**：
> - [spec § 4 B2](../specs/2026-05-20-m-b-mainline-design.md#4-b2--副窗地理图phase-3--5-6-周--7-stage)
> - [plan B2 8 stage](../plans/2026-05-21-marx-m-b2-geomap.md)
> - [Stage 0 recon SSOT](./2026-05-21-b2-data-source-recon.md)
> - [Stage 1 PM checkpoint](./2026-05-22-b2-stage1-checkpoint.md)
> - [Stage 1 中段 anchor](./2026-05-22-b2-stage1-progress-anchor.md)（切窗口前续接 SSOT）

---

## 1. 累积成果时间表（Stage 0 + Stage 1 · 19 commit · 2026-05-21~22）

### Stage 0 · 数据可达性验证（DR-097 路径 · 0.5 天）

| commit | 内容 |
|---|---|
| `0ffd410` | T0.1 数据可达性矩阵 · 4 候选 GeoJSON 源（Euratlas / HGIS / OSM / Naturalearthdata）· DR-098 草案（world-atlas 38 KB 当代国界占位）|
| `8e64b3b` | T0.1+ cshapes spike · ETH Zurich CShapes-Europe 4.36 MB 1816-2023 · DR-099 草案（V1 升级用真历史国界）|
| `4a25b29` | spec § 4.7 升级 · DR-099 final · V1 = CShapes-Europe · DR-098 被取代 |

### Stage 1 · prototype 实施（T1.1-T1.5 · 1.5 天）

| commit | Task | 内容 | tests |
|---|---|---|---|
| `712d329` | T1.1 | `lib/projection.ts` · D3 投影工厂（orthographic + mercator + ZOOM_THRESHOLDS 占位）| 6/6 |
| `840c2b5` | T1.2 | `lib/great-circle.ts` · 大圆弧 geoInterpolate 50 sample | 3/3 |
| `2fffac5` | T1.3 | `geographic-canvas.ts` prototype scaffold + 5 测试节点 + 临时挂主画面右上 300×200 | 3/3 |
| `d5e4988` | T1.4 | zoom 整合 + projection mode 切换（k 阈值 sphere ≤2.5 / plane ≥4.5）| 5/5 |
| `eb696c0` | T1.5 | 球面默认中心 follow Marx 当前年地点 + drag 旋转 + `marx:time-change` event listener | 7/7 |
| `2fbe6d2` | T1.6 doc | PM checkpoint 实测指引 doc | — |

### Stage 1 · PM 实测 hotfix 6 轮（T1.6+ ~ T1.6++++++ · 1 天）

| commit | Hotfix 轮 | 内容 |
|---|---|---|
| `3fa9a64` | T1.6+ A | drag bug · zoomBehavior.filter 屏蔽 mousedown · d3-drag 独占旋转 |
| `e090b5b` | T1.6+ B | 滚轮 zoom 真线性内插 scale 200→800 · 兑现 spec § 4.6 平滑过渡 |
| `f042fb9` | T1.6+ C | cshapes-Europe 4.5 MB geojson + `lib/historical-borders.ts` + canvas 渲染 1843 静态底图 |
| `7af47f9` | T1.6++ A | plane drag pan · zoomBehavior.filter mode-aware（球面屏蔽 / 平面+transition 放行）|
| `73f03ce` | T1.6++ B | satellite projection 真丝滑过渡 · 加 `d3-geo-projection` dep · 兑现 spec § 4.6 100% |
| `23fbaa4` | T1.6+++ | plane 回 mercator（PM 反馈 satellite distance→1.1 "球更鼓"）· plane mode g.transform translate |
| `d0899a6` | docs | 切窗口前 anchor SSOT · 14 commit + 2 待修 bug 完整诊断 |
| `ad75468` | T1.6++++ | 解耦 zoom 跟 pan · 修 Bug 1 (滚 11 下消失) + Bug 2 (transition 拖动死) · drag 改 projection.center · projection.invert 反算 Δlon/Δlat |
| `b5cdce1` | T1.6+++++ | 全程 satellite distance 50→2 单参数内插 · 拦 wheel 不累加 x/y · 修 Issue 1 (k=4.5 生硬 jump) + Issue 2 (race · 缩回 sphere 不能拖 + 偶发底图消失) |
| `8b4a843` | T1.6++++++ | plane 端 distance 2→1.5 · PM 反馈球面感稍弱 · **但引入新 bug "放大不能拖"** |
| `56874b9` | revert | 撤销 8b4a843 · 回 distance=2 · PM 妥协接受球面感稍强 |

**累计**：19 commit · 334 tests · 28 new tests for B2（projection 12 + great-circle 3 + historical-borders 5 + canvas 8）· 全 lint 0 warning · 全 deploy success（除 revert 是 docs 不改代码）

**Bundle 终态**（HEAD `56874b9`）：JS **46.08 KB gzip** · CSS 持平 · safe ≤80 KB · 余量 33.92 KB
**Tests 终态**：331/334 pass · 3 pre-existing M3 fail（Stage B/C person `name_orig` / concept `successor_notes`）持平 baseline
**新依赖**：`d3-geo-projection ^4.0.0`（T1.6++ B 引入 · satellite projection · 后续 Stage 2+ 沿用）
**新文件**：
- `src/lib/projection.ts`（全程 satellite distance 50→2 + clipAngle 自适应 + ProjectionMode 分 dispatch）
- `src/lib/great-circle.ts`（geoInterpolate 50 sample · SVG path d · Stage 2 关系连线用）
- `src/lib/historical-borders.ts`（loadBorders + filterBordersAtYear · vite ?url asset）
- `src/components/geographic-canvas.ts`（mountGeographicCanvas · TEST_NODES · MARX_LOCATIONS · marxLocationAtYear · zoom + drag + time event listener · borders + graticule + nodes render · panCenter · 拦 wheel）
- `src/types/d3-geo-projection.d.ts`（ambient · 社区缺 @types）
- `public/geo/cshapes-europe.geojson`（4.5 MB · CC BY-NC-SA 4.0）
- `docs/CITATIONS.md`（Schvitz 2022 + Cederman 2025 署名）
- `docs/2026-05-21-b2-data-source-recon.md`（Stage 0 recon SSOT）
- `docs/2026-05-22-b2-stage1-checkpoint.md`（PM 实测指引）
- `docs/2026-05-22-b2-stage1-progress-anchor.md`（中段 anchor SSOT）
- 6 个新 test 文件

---

## 2. 决策清单（DR-097~099 + Stage 1 期间新增 DR-100~105）

| DR | 日期 | 决策 | 状态 |
|---|---|---|---|
| DR-097 | 2026-05-21 | B2 启动 (A+) 路径 · 直接进 writing-plans + 加 Stage 0 数据可达性验证 | spec § 10 final |
| DR-098 | 2026-05-21 | Stage 0 推荐 V1 用 world-atlas 当代国界（被 DR-099 取代）| 历史 |
| DR-099 | 2026-05-22 | V1 历史国界 = CShapes-Europe 1816-2023 / 70 Marx-era states · CC BY-NC-SA 4.0 | spec § 4.7 + § 10 final |
| **DR-100** | 2026-05-22 | **临界 zoom 阈值 lock** = sphereMax 2.5 / planeMin 4.5（PM 实测无微调需求 · spec § 4.6 / projection.ts:38 ZOOM_THRESHOLDS）| 本 takeaway final |
| **DR-101** | 2026-05-22 | **球面默认中心 = Marx follow**（DR-074 复用 · PM 实测确认 default OK）| 本 takeaway final |
| **DR-102** | 2026-05-22 | **drag 旋转手势 = 0.5°/px**（PM 实测接受 default · 不调）| 本 takeaway final |
| **DR-103** | 2026-05-22 | **全程 geoSatellite distance 单参数内插**（拒 mercator 切换 · 跨界 jump 不可解）· distance 50 (k=1) → 2 (k=8) · clipAngle = acos(1/distance) 自适应 88.85°→60° | 本 takeaway final · spec § 4.6 升级 |
| **DR-104** | 2026-05-22 | **拦 wheel 不累加 x/y**（svg.on('wheel.zoom', null) detach d3-zoom 默认 + 自挂 custom wheel + zoomBehavior.transform(svg, scale(newK))）· 解 race + 杜绝 anchor 偏移 | 本 takeaway final |
| **DR-105** | 2026-05-22 | **distance plane 端值 = 2**（PM 实测 distance=1.5 引入"放大不能拖" bug · revert · 妥协接受球面感稍强）· 未来若想再降需先 root cause 1.5 bug | 本 takeaway final |

---

## 3. 4 件套 baseline 对比

### 跟 M-B1 ship 对比（HEAD `fd8b545` tag `m-b1-final`）

| 指标 | M-B1 ship | B2 Stage 1 收尾 | Δ | 评估 |
|---|---|---|---|---|
| Bundle JS gzip | 34.58 KB | 46.08 KB | +11.50 KB (+33%) | ✓ safe（≤80 KB · 余 33.92 KB）/ B2 加 satellite projection + cshapes 加载逻辑 + 自挂 wheel 是合理增长 |
| Tests | 276+4 E2E / 279 | 331/334 (+55 / +51 pass) | +28 new B2 tests | ✓ 覆盖 projection / great-circle / borders / canvas |
| Lint | 0/0 | 0/0 | 0 | ✓ |
| pre-existing fail | 3 (M3 baseline) | 3 (持平) | 0 | ✓ 不退化 |
| Asset 加载 | 87 KB JSON (nodes + claims) | + 4.5 MB GeoJSON（按需 fetch · 不进 bundle）| 新增 | ✓ 副窗打开才加载 · 首屏 0 影响 |

**结论**：4 件套 baseline 全 safe · B2 Stage 1 prototype 不破坏 M-B1 已 ship 功能。

### Bundle 增长拆解（Stage 1 期间）

| 节点 | Bundle JS gzip | 增量来源 |
|---|---|---|
| B1 ship (m-b1-final) | 34.58 KB | baseline |
| T1.1 D3 projection | ~36 KB | + projection.ts 工厂 |
| T1.4 zoom 整合 | ~38 KB | + zoom event handler + interpolate |
| T1.6+ C cshapes 渲染 | ~45 KB | + historical-borders.ts loader + filterBordersAtYear |
| T1.6++ B satellite | ~46 KB | + d3-geo-projection dep |
| T1.6+++++ 全程 satellite | 46.54 KB | + clipAngleForDistance + 拦 wheel handler |
| **56874b9 (Stage 1 final)** | **46.08 KB** | revert 后删 distance 1.5 部分（-0.46 KB） |

---

## 4. Lessons（B2 Stage 1 期间新增 9 条 · 累积全 lessons）

### 4.1 ⚠⚠⚠ d3-zoom transform.x/y 不是简单 pan offset **新案例 / 关键**

T1.6+++ 用 `g.attr('transform', translate(x,y))` 把 zoom event 的 x/y apply 到 svg g 层 / 跟 `projection.scale` 双重作用 → 元素整体平移到 viewport 外（PM Bug 1 "滚 11 下底图消失"）。

**根因**：d3-zoom transform `(k, x, y)` 是 affine 一部分 · 不能跟 projection.scale 共存。
**修法**：T1.6++++ 解耦 zoom 跟 pan · drag 改 projection.center 用 projection.invert 反算精确 Δlon/Δlat / g.transform 始终 null。

### 4.2 ⚠⚠⚠ satellite distance 越小越鼓不越平 **新案例 / 反直觉**

T1.6++ B 把 plane mode 改 satellite distance→1.1 / PM 反馈 "球更鼓"（不是 PM 期望的 "平面"）。

**根因**：geoSatellite 是透视相机模型 / distance → 1 = 相机贴地表 = 强 fisheye / 不是平面投影。
- distance → ∞ = orthographic 球（远距视角）
- distance → 1 = perspective camera 在球面上（数学奇点 · 强 fisheye）
- **无论 distance 多小 / 仍是球面 / 不会变平面**

**修法**：T1.6+++ 切回 mercator 真平面 / 但跨 k=4.5 mercator vs satellite 不同族 jump（PM 反馈第 11 下生硬）/ T1.6+++++ 拍板全程 satellite distance 50→2（PM 妥协接受球面感稍强）。

### 4.3 ⚠⚠ mercator vs satellite 跨界 jump 不可解 **新案例 / 数学约束**

mercator 是圆柱投影（经纬度对齐 viewport）/ satellite 是方位投影（球心垂直视图 + perspective）· 数学完全不同族 · 跨界 (x, y) 坐标必不重合 · jump 不可解（除非双 projection morph · 工程复杂）。

**结论**：在 D3 标准 projection 集合内 / **全程同一 projection 是唯一真丝滑路径**。

### 4.4 ⚠⚠ d3-zoom 自带 wheel anchor 在 reset 后偶发 race **新案例**

T1.6++++ 用 `zoomBehavior.transform(svg, zoomIdentity.scale(k))` 在 zoom event handler 内同步 reset transform.x/y → 触发二次 zoom event · `resettingZoom` flag 防递归 · 但 d3-zoom 内部 `svg.__zoom` 在两次 event 之间瞬间 inconsistent · 跟 d3-drag mousedown handler 偶发 race（PM 报告"缩回 sphere 那一下又不能拖" + 偶发底图消失不稳定复现）。

**修法**：T1.6+++++ 完全 detach d3-zoom 默认 wheel handler（`svg.on('wheel.zoom', null)`）· 自挂 `svg.on('wheel', custom)` · `preventDefault` + 算 newK + `zoomBehavior.transform(svg, scale(newK))` · 直接 set (newK, 0, 0) · 完全跳过 d3-zoom 内部 wheel anchor 算法 · transform.x/y 永远 0 · 无 race。

### 4.5 ⚠ revert > force push（Marx 项目硬约束沿用）**新案例**

T1.6++++++ (8b4a843) PM 反馈 "放大不能拖" 新 bug 要求回退一步。两选项：

| 方案 | 操作 | 历史 | 风险 |
|---|---|---|---|
| revert（选） | `git revert 8b4a843` + push | HEAD = 新 revert commit / 8b4a843 留 history | 0 · 非 destructive |
| reset --hard | `git reset --hard b5cdce1` + force push | 8b4a843 丢弃 | destructive · 需 force push |

**选 revert**：符合 Marx 项目硬约束 "NEVER 用 destructive git command unless explicit" · 保留 PM "妥协接受 distance=2" 语境 · 后续若想再试 distance=1.5 可 cherry-pick 8b4a843（但需先 root cause 1.5 引入 "放大不能拖" bug）。

### 4.6 ⚠ PM 视觉反馈 = ground truth · 不靠数学计算预估 **lesson 复用 + 新案例**

我推荐 distance=1.5 时给 PM 看 viewport 数学分析（21°×14° viewport vs 48° clipAngle / 边缘 fisheye 不在视野）/ PM 实测仍引入新 bug。**数学正确 ≠ 实际效果 OK** · 实测优先 · 不靠纸面推理替 PM 拍板。

### 4.7 ⚠⚠ 第一性原理：从用户需求倒推技术方案 · 不被框架便利绑架 **新案例 / 关键 process lesson**

Issue 1 视觉不丝滑时 / 我列了 A (distance 30→1.5) / B (50→2) / C (mercator+fade) 三方案。PM 让我"作为资深开发 · 第一性原理思考 · 推荐方案"。

**第一性思考过程**：
1. 用户真问题：要"从太空看地球渐变成平面"的**视觉叙事** / 不是数学严格
2. 数学约束：mercator vs satellite 数学不同族 / 跨界 jump 不可解
3. 推论：全程 satellite 是唯一真丝滑路径
4. trade-off：B (50→2) 比 A (30→1.5) 在 plane 端 fisheye 更安全
5. 结论：推荐 B

**反思**：如果用框架便利思考（"distance 调小看着更平"）会推 A / 但 A 仍有 PM 之前 "球更鼓" 反弹风险。第一性原理逼自己用根本约束推 / 推出更稳的方案。

### 4.8 ⚠ classifier 对 gh 只读命令误判 **lesson 复用**

已落 memory `feedback_classifier_overreach_on_gh_read.md` · workaround `gh run view <id> --json status,conclusion` 拆两步（或 `until [ "$(gh run view <id> --json status -q .status)" = "completed" ]; do sleep 10; done` 包在 bash 里）。

### 4.9 ⚠ 资深 UIUX 视角 sub-pixel race vs frame batch 区别 **新案例**

T1.6++++ reset 路径在 jsdom 跑不出 race（unit test pass）/ 但 prod 偶发不稳定复现。这是 **jsdom 跟 prod browser RAF/event loop 差异** · jsdom 不模拟 wheel + mousedown 的 race · unit test 不能 catch / 必须 PM 实测发现。

**lesson**：jsdom 限制要标 `it.skip` + comment / 不要硬写假 pass · PM 实测 = E2E 路径补 jsdom 漏。

### 累积应用既有 lesson

- `feedback_skill_score_vs_pm_truth.md`：PM 主观 = ground truth · 不跑 auto reviewer 替 PM checkpoint（本 Stage 1 全过程沿用）
- `feedback_ai_self_judge_skills.md`：Stage 1 prototype 期不超调 skill（frontend-design / ui-ux-pro-max 留 Stage 6 polish）· **本 Stage 完全无 skill 召唤** · 修 bug 用直接调试
- `workflow_manual_download_via_other_machine.md`：cshapes 本机国内可达 · 不需用三机协作
- `feedback_deploy_verification_gap.md`：每次 push 都 `until [ status=completed ]; do sleep 10; done` watch deploy success / 不靠"push 完就 ship" 假设
- `feedback_inline_self_audit_stage_checkpoint.md`：3 层 review（TDD task 内 + stage 间 + PM checkpoint）/ Stage 1 prototype 期重 PM checkpoint 轻自审（设计未稳定）
- `feedback_auto_mode_chain_push.md`：git add / commit / push 全程分开跑 / 无 chain push 撞 classifier
- `feedback_qa_dom_visibility_methodology.md`：本 Stage 不涉及 visual 可见性 test

---

## 5. Backlog（Stage 1 累积 / 给 Stage 2+）

### 立即修候选（Stage 2 第一件事）
1. **删 `src/main.ts` 末尾临时 prototype mount（~19 行）** · T1.3 reviewer 已 reminder · Stage 2 接真数据后必删

### 后续 Stage 决策点
2. **Stage 2 T2.1**：86 节点完整渲染（紫人 50 + 橙事件 30 + 灰地点 6 · 接 `persons.json` / `claims.json`）· 节点 size + 名字标签策略（DR-106）
3. **Stage 2 T2.3**：关系连线 6 候选 → PM 实测拍板 3-5 类（DR-107）· great-circle 已 ship（T1.2）/ 直接用
4. **Stage 3 T3.x**：详情卡 + 主副联动 + 互换 + 状态切换动画
5. **Stage 4 T4.x**：时间轴动态国界 build-time filter（Marx 1818-1883 子集 ~480 KB）+ 迁徙轨迹
6. **Stage 5 T5.x**：副窗（地理图当副 380×214 信息密度低版）
7. **Stage 6 T6.x**：图例 panel + tooltip + 球面旋转手势 polish + frontend-design / ui-ux-pro-max skill 召唤
8. **Stage 7 T7.x**：E2E + benchmark + 4 件套 baseline + ship

### Stage 1 未解但 backlog（不阻 Stage 2）
9. **plane 端 distance 仍可再试调（保留 1.5 的 fishbone 视觉 + 修 "放大不能拖" 根因）**：未来如果 PM 仍嫌球面感 / 需先 root cause distance=1.5 引入的 bug · 备案方案 B mercator + 250ms d3-transition cross-fade（工程 ~1-2h）
10. **Marx 1843 国界静态 sample → 动态切片**：当前 `historical-borders.ts:filterBordersAtYear(1843)` hardcode · Stage 4 接 timeline year 动态切换

---

## 6. PM 验收阀值 vs 实际

| 项 | 阀值 | 实际 | 状态 |
|---|---|---|---|
| 球面拖旋转 | 响应 ≤ 100ms | 实测响应 | ✅ |
| 滚轮 zoom 真丝滑 | 任意 k 跨界 Δ < 1px | k=4.49 → k=4.51 巴黎 Δ < 1px（test 验）+ PM 实测确认 | ✅ |
| 缩回 sphere 拖动 | drag 始终响应 | PM 实测确认（修 Bug 2 后）| ✅ |
| 底图 + 节点稳定 | 反复滚轮不消失 | PM 实测确认 | ✅ |
| transition mode pan | projection.center 移 | PM 实测确认 | ✅ |
| plane 端视觉接近平面 | "看起来像平面" | PM 妥协接受 distance=2 球面感稍强（distance=1.5 引入新 bug 已 revert）| ⚠ 妥协 OK |
| time-change reorient | 球面 reorient 到 Marx 当年地点 | console 测未做（PM 跳过 · Stage 4 接 timeline 后实测）| ⏸ 延后 |
| 4 件套 baseline 不退化 | Bundle ≤ 80 KB / lint 0 / tests 不退化 | 46.08 KB / 0/0 / 3 M3 持平 | ✅ |

---

## 7. Stage 2 启动 checklist

PM 拍 `go Stage 2` 后立即做：

1. **删 `src/main.ts` 末尾临时 prototype mount**（Stage 1 backlog #1）· 1 commit atomic
2. **读 [plan B2 Stage 2](../plans/2026-05-21-marx-m-b2-geomap.md#task-21-86-节点完整渲染紫人-50--橙事件-30--灰地点-6)** 完整 Task 2.1~2.4
3. **brainstorm T2.2 节点 size + 名字标签策略**（PM checkpoint · DR-106）
   - mockup 候选 3-5 个 / 沿用 [feedback_brainstorm_mockup_directness](../../../../D:/AI/Claude/.claude/projects/F--AI-projects-Marx/memory/feedback_brainstorm_mockup_directness.md) before/after 对比风格
4. **brainstorm T2.3 关系连线 6 候选**（PM checkpoint · DR-107）
   - 6 候选：师承 / 反驳 / 引用 / 影响 / 合作 / 同代
   - 跨地理坐标 great-circle 大圆弧（lib/great-circle.ts T1.2 已 ship）
5. **加 `src/lib/geographic-data.ts`** · person/event/location join · 接 `persons.json` + `claims.json`
6. **8 stage 卡 PM checkpoint 节奏不变** · 每 stage 完成 PM 实测 + 落 DR

---

## 8. 续接简单确认句（新窗口续接 / 给自己看）

> "我在续接 Marx M-B2 Stage 1 收尾后 · HEAD `56874b9` · Stage 0 + Stage 1 全 ship · 19 commit / 6 轮 PM hotfix + 1 revert · 9 lessons 落档 · DR-097~105 lock · PM 实测验收通过 distance=2 球面感稍强妥协 · Bundle 46.08 KB safe / Tests 331/334 / Lint 0/0 / Deploy success · 等 PM 拍 `go Stage 2` 启动 86 节点全渲染 brainstorm（删 main.ts 临时 mount → T2.1 → T2.2 mockup → DR-106 节点 size + 标签 → T2.3 关系连线 6 候选 → DR-107 3-5 类拍板）"
