# Marx M-B2 · Stage 1 prototype 实施期 SSOT · 新窗口续接锚点（2026-05-22）

> **状态**：Stage 1 prototype T0.1-T1.5 全 ship + T1.6+ ABC + T1.6++ AB + T1.6+++ ship · **2 个新 bug 待修**（PM 实测发现）/ 切窗口前完整交接
> **当前 HEAD**：`23fbaa4` （T1.6+++ plane mercator + plane mode pan g.transform · deploy run 26266361861 success 56s）
> **Git**：clean / origin/main 同步
> **Prod**：https://cdu52802-xx.github.io/marx/ → 主画面右上 300×200 prototype 浮窗
> **关联**：
> - [spec § 4 B2](../specs/2026-05-20-m-b-mainline-design.md#4-b2--副窗地理图phase-3--5-6-周--7-stage)
> - [plan B2 8 stage](../plans/2026-05-21-marx-m-b2-geomap.md)
> - [Stage 0 recon SSOT](./2026-05-21-b2-data-source-recon.md)（DR-098/099 草案 · cshapes-Europe 4.36 MB 数据源）
> - [Stage 1 checkpoint doc](./2026-05-22-b2-stage1-checkpoint.md)（PM 实测指引）

---

## 1. ⚠⚠⚠ 新窗口 step 1 · 立即修的 2 个 bug（PM 实测 T1.6+++ 反馈 · 2026-05-22）

### Bug 1（关键）：滚轮放大 11 次后底图 + 5 紫点全消失 · 只剩 graticule 网格

**PM 实测描述**：
> "我鼠标滚轮滚动 11 下之后，地图上的底图和紫色圆点就都消失了，只剩下横平竖直的网格。"

**根因诊断**：

zoom event handler 当前实现（src/components/geographic-canvas.ts T1.6+++ 修改）：
```typescript
.on('zoom', (event) => {
  currentZoomK = event.transform.k;
  if (currentMode === 'plane') {
    g.attr('transform', `translate(${event.transform.x},${event.transform.y})`);
  } else {
    g.attr('transform', null);
  }
  // ...
});
```

**双重 scale 冲突**：
- projection.scale 跟 k 走（scaleAtZoom · 200 → 800 内插）→ 节点 + 底图 + graticule 都重 projection
- d3-zoom 默认 wheel zoom 时累加 x/y（"zoom in 鼠标位置点"行为）→ apply 到 g.transform translate
- d3-zoom 的 x/y **不是简单 pan offset** · 是 affine transform 一部分 · 跟 scale 配对使用
- 现在我们只用 transform.x/y 不用 transform.k（k 走 projection）→ x/y 单独 apply → **元素整体偏移到 viewport 外**
- graticule 由 geoGraticule() 生成全地球网格 / 仍有部分覆盖 viewport / 看着仍在
- borders + 5 nodes 是稀疏 features / pan offset 后全跑出 viewport / 看着消失

**滚 11 下计算**：
- d3-zoom 默认 wheel delta 0.002 / 每 wheel event k *= e^0.002 ≈ 1.002 / 但实测每 wheel 大幅 zoom 表明 wheelDelta 更大
- 11 下从 k=1 滚到约 k=7-8（plane mode）/ d3-zoom 内部 x/y 累加大量 pixel offset
- transform.x/y 可能累计到 -500~-1000 px / g 整体平移到 viewport 外

**推荐修法**（fresh window 立即做）：

**方案 A · 最小修改**（推荐 · ~30 min）
- zoom event 时调 `zoomBehavior.transform(svg, d3.zoomIdentity.scale(k))` 重置 x/y 为 0 / 保留 k
- 但这会破坏 plane mode drag pan（drag 时 transform.x/y 累加是 pan 视觉来源）

**方案 B · 解耦 zoom 跟 pan**（推荐 · ~1h · 真正修）
- wheel zoom 时只更新 k / x/y reset 为 0（防偏移）
- plane mode drag pan 时单独 track Δx/Δy / 转 lon/lat 改 projection.center / 不动 g.transform
- 球面 mode drag 保留既有 d3-drag rotate
- transition mode drag 同 plane mode（projection.center 移）

**方案 C · 完全用 d3-zoom 标准**（不推荐 · 大改）
- projection scale 固定 / 不跟 k 走 / g.attr('transform', event.transform) 一刀切
- 放弃 transition zone satellite distance 内插（之前 T1.6++ B 工程量浪费）

**推荐 fresh window 选 B**。

### Bug 2（关键）：transition zone（滚轮 7-11 下之间）拖动不响应

**PM 实测描述**：
> "初始球面状态能拖动，滚轮滚到第 7 下就不能拖动了，到第 11 下之后又能拖动了"

**根因诊断**：

mode-aware filter 当前（src/components/geographic-canvas.ts T1.6++ A）：
```typescript
.filter((event) => {
  if (event.type === 'mousedown') {
    return currentMode !== 'sphere';  // 球面屏蔽 / 平面+transition 放行
  }
  return true;
})
```

- 球面 mode：d3-drag rotate ✓
- transition mode：filter 放行 mousedown / 但 zoom event handler **只在 plane mode set g.transform** / transition mode 清空 g.transform → 用户拖看不到视觉变化 = "不响应"
- plane mode：filter 放行 + g.transform translate ✓（但有 Bug 1 双重偏移问题）

**修法**（跟 Bug 1 方案 B 配合）：
- transition mode 也走 d3-drag 自定义 pan（不依赖 zoom 自带 pan）
- 或者：transition mode pan 改 projection.center（跟 plane 同行为）

### Bug 3（PM 待 backlog）：plane mode pan offset 持久化

PM 反馈："暂按默认执行，后续再细化"。记 backlog：plane mode pan 后切回 transition / 再放大回 plane / pan offset 仍在。

---

## 2. Stage 1 完整时间表（已 ship · 修复 bug 前 baseline）

| Task | 内容 | commit | tests |
|---|---|---|---|
| T0.1 | 数据可达性 + DR-098 | `0ffd410` | — |
| T0.1+ | cshapes spike + DR-099 草案 | `8e64b3b` | — |
| spec § 4.7 升级 | V1 用 cshapes-Europe + DR-099 final | `4a25b29` | — |
| **T1.1** | `lib/projection.ts` D3 投影工厂 | `712d329` | 6/6 |
| **T1.2** | `lib/great-circle.ts` 大圆弧 | `840c2b5` | 3/3 |
| **T1.3** | `geographic-canvas.ts` prototype + 5 测试节点 + 临时挂主画面右上 300×200 | `2fffac5` | 3/3 |
| **T1.4** | zoom 整合 + projection mode 切换 | `d5e4988` | 5/5 |
| **T1.5** | Marx follow + drag 旋转 + marx:time-change event listener | `eb696c0` | 7/7 |
| T1.6 doc | PM checkpoint 实测指引 doc | `2fbe6d2` | — |
| **T1.6+ A** | drag bug fix · zoomBehavior.filter 屏蔽 mousedown · drag 接管 | `3fa9a64` | — |
| **T1.6+ B** | 滚轮真线性内插 scale 200→800 | `e090b5b` | +6 |
| **T1.6+ C** | cshapes 底图 + lib/historical-borders.ts + 1843 静态 sample | `f042fb9` | +5 |
| **T1.6++ A** | plane drag pan · filter mode-aware | `7af47f9` | +1 |
| **T1.6++ B** | satellite projection 真丝滑过渡 · 加 d3-geo-projection dep | `73f03ce` | +12 |
| **T1.6+++** | plane 回 mercator 真平面 + g.transform translate | **`23fbaa4`** | +2 |

**累计**：14 commit · 304+ unit tests · 19 new tests for B2 · 全 lint 0 warning · 全 deploy success

**Bundle**（HEAD `23fbaa4`）：JS 46.04 KB gzip · CSS 持平 · safe ≤80 KB · 余量 33.96 KB

**Tests**：319/322 pass · 3 pre-existing M3 fail（Stage B/C person `name_orig` / concept `successor_notes`）持平 baseline

**新依赖**：`d3-geo-projection ^4.0.0`（T1.6++ B 引入 · satellite projection）

**新文件**（Stage 1 累计）：
- `src/lib/projection.ts`（D3 投影工厂 · ZOOM_THRESHOLDS · scaleAtZoom · satelliteDistanceAtZoom · createProjection 三 mode · interpolateProjection）
- `src/lib/great-circle.ts`（geoInterpolate 50 sample · SVG path d）
- `src/lib/historical-borders.ts`（loadBorders · filterBordersAtYear · vite ?url asset）
- `src/components/geographic-canvas.ts`（mountGeographicCanvas · TEST_NODES · MARX_LOCATIONS · marxLocationAtYear · zoom + drag + time event listener · borders + graticule + nodes render）
- `src/types/d3-geo-projection.d.ts`（ambient · 社区缺 @types）
- `public/geo/cshapes-europe.geojson`（4.5 MB · CC BY-NC-SA 4.0）
- `docs/CITATIONS.md`（Schvitz 2022 + Cederman 2025 署名）
- `docs/2026-05-21-b2-data-source-recon.md`（Stage 0 recon SSOT · DR-098/099 草案）
- `docs/2026-05-22-b2-stage1-checkpoint.md`（PM 实测指引）
- 6 个新 test 文件（projection / great-circle / historical-borders / geographic-canvas）

**修改文件**：
- `src/main.ts`（末尾加 ~19 行临时 prototype mount · **Stage 2 第一件事删除**）
- `package.json` + `package-lock.json`（加 d3-geo-projection）

---

## 3. 决策记录（DR-073~099 完整 · Stage 1 期间新增）

| DR | 决策 | 状态 |
|---|---|---|
| DR-073~077 | B2 副窗 16:9 / 球面默认中心 / 国界全连续 / Stage 1 prototype 先 / 主副互换 | spec § 10 (2026-05-20 brainstorm) |
| DR-097 | B2 启动 (A+) 路径 · 直接进 writing-plans + 加 Stage 0 | spec § 10 (2026-05-21 PM 拍) |
| DR-098 | Stage 0 推荐 V1 用 world-atlas 当代国界 | **被 DR-099 取代** |
| DR-099 | V1 历史国界 = CShapes-Europe 1816-2023 / 70 Marx-era states | spec § 4.7 + § 10 final (2026-05-22) |
| DR-099+ 草案 | Stage 1 临界 zoom 阈值 sphere ≤2.5 / plane ≥4.5 · Marx follow default · 0.5°/px drag | 待 PM 拍板 final · 修 bug 后 lock |

---

## 4. ⚠ 修 bug 后续 sequence（新窗口 step-by-step）

### Step 1：开窗口立即操作

```bash
cd F:\AI\projects\Marx
git pull origin main  # 应 HEAD = 23fbaa4
git status  # clean
```

### Step 2：读续接 SSOT（30 秒）

按顺序读：
1. **本文件**（`docs/2026-05-22-b2-stage1-progress-anchor.md`）/ 你正在读
2. `docs/2026-05-22-b2-stage1-checkpoint.md`（实测指引 · PM 反馈链路）
3. `docs/2026-05-21-b2-data-source-recon.md`（数据源 / DR-098/099）
4. 跳读 `specs/2026-05-20-m-b-mainline-design.md` § 4 + § 10（DR 清单）
5. 跳读 `plans/2026-05-21-marx-m-b2-geomap.md` Task 1.6 + 后续 stage

### Step 3：dispatch 修 Bug 1 + Bug 2 implementer subagent

**严守**：
- subagent prompt 含 plan T1.6++++ 段（本文件 § 1）完整诊断 + 推荐方案 B（解耦 zoom 跟 pan）
- TDD：先写 fail test（jsdom 模拟 wheel + drag · 间接验路径）→ impl → pass
- 修法方案 B 实施细节（fresh window 自己设计具体 code · 不照搬本 doc · 但守约束）：
  - wheel zoom 时调 `zoomBehavior.transform(svg, d3.zoomIdentity.scale(k))` reset x/y
  - drag pan 时（plane / transition mode）改 projection.center / 不动 g.transform
  - 球面 drag rotate 保留 d3-drag 既有
- atomic commit / 中文 commit -F 或英文 -m / push 拆开跑（chain push 拒）
- push 后 `gh run list --limit 1` + `gh run view <id> --json conclusion` 拆两步等 deploy success（classifier 拒 `gh run watch` workaround）

### Step 4：PM 实测拍板修 bug 效果

PM 实测：
- 球面拖旋转 ✓
- 球面 → transition → plane 中底图 + 5 紫点 + graticule **始终可见**（不消失）
- transition mode 拖 → projection center 移（pan 视觉）
- plane mode 拖 → projection center 移（pan 视觉）+ 真平面 mercator
- 滚轮平滑（半丝滑 PM 接受）/ k=2.5 + k=4.5 临界仍有小 jump（PM 接受）

### Step 5：Stage 1 收尾

bug 修完 PM 拍 `go Stage 1 收尾`：
1. 落 DR-099+ final（4 决策点 lock · 临界 zoom / 中心 / 旋转 / Marx follow）
2. 写 `docs/2026-05-22-b2-stage1-takeaway.md`（8 section · 沿用 B1 takeaway 风格 / 含 14 commit / 全 lessons）
3. archive `docs/2026-05-22-b2-stage1-checkpoint.md` + 本 anchor doc（可选）
4. **删 main.ts 末尾临时 prototype mount**（reviewer T1.3 已 reminder · Stage 2 第一件事）

### Step 6：进 Stage 2 brainstorm（按 plan）

PM 拍 `go Stage 2` 后：
- T2.1 86 节点完整渲染（紫人 50 + 橙事件 30 + 灰地点 6 · 接 persons.json / claims.json 真数据）
- T2.2 节点 size + 名字标签策略 PM checkpoint（DR-100）
- T2.3 关系连线 6 候选 → PM 实测拍板 3-5 类（DR-101）
- T2.4 节点聚合 / 重叠处理

---

## 5. Marx 项目级硬约束（沿用 · 修 bug 期间守住）

1. **lint 0 warning 0 error**（`npm run lint --max-warnings=0` 严格 · prettier `Delete ⏎` warning 也算 fail）
2. **中文 commit message 用 `git commit -F`**（Windows 编码 · 英文 commit 可 `-m`）
3. **atomic commit**（单一职责 / 不混改 / 一个 bug 一个 commit · 或一个修法一个 commit）
4. **chain push 拒**（`git add` / `git commit` / `git push` 分开跑 · 不要 `&&` 串）
5. **push 后等 deploy success**（`gh run list --limit 1` + `gh run view <id> --json conclusion` 拆两步 · 避 classifier 误判 `gh run watch`）
6. **不动 M5 主图 / B1 header / claim-popover**（B2 是 additive · 不破现有 ship 功能）
7. **PM 主观感受 = ground truth**（不要为 lint pass 而 sacrifice PM 视觉体验）

---

## 6. Lessons 累积（B2 Stage 1 期间）

### 新增 lesson 候选（Stage 1 收尾时落 memory）

1. **D3 zoom + drag 同 svg event 顺序冲突**（concern #1 真 bug）/ 修法：mode-aware filter / 但仍要解 plane mode 拖动 pan 视觉
2. **d3-zoom transform.x/y 不是简单 pan offset**（Stage 1 prototype Bug 1 根因）/ 不能单独 apply 到 g.transform translate / 否则跟 projection scale 双重偏移
3. **satellite projection distance 不是越小越平**（Stage 1 第二轮 B 误用 · PM 反馈"球更鼓"）/ distance → 1 时 perspective 更夸张 / 反直觉 / plane mode 应该用真 mercator
4. **classifier 对 gh 只读命令误判**（已落 memory `feedback_classifier_overreach_on_gh_read.md`）/ workaround `gh run view --json` 拆两步

### 应用既有 lesson

- `feedback_skill_score_vs_pm_truth.md`：PM 主观 = ground truth · 不跑 auto reviewer 替 PM checkpoint
- `feedback_ai_self_judge_skills.md`：Stage 1 prototype 期不超调 skill（frontend-design / ui-ux-pro-max 留 Stage 6 polish）
- `workflow_manual_download_via_other_machine.md`：cshapes spike 本机国内可达 · 不需用
- `feedback_deploy_verification_gap.md`：每次 push 都 watch deploy success
- `feedback_inline_self_audit_stage_checkpoint.md`：3 层 review（TDD task 内 + stage 间 + PM checkpoint）

---

## 7. 续接简单确认句（新窗口 AI 自报）

> "我在续接 Marx M-B2 Stage 1 prototype · HEAD 23fbaa4 · 已 ship T0.1-T1.6+++ · **2 个新 bug 待修**（PM 实测发现）：滚轮 11 下底图+节点全消失 + transition zone 拖动无响应。读 docs/2026-05-22-b2-stage1-progress-anchor.md § 1 完整诊断 / dispatch implementer 跑修法方案 B（解耦 zoom 跟 pan）/ TDD + atomic commit + push 拆开 + watch deploy。修完 PM 实测 → Stage 1 收尾 takeaway → 进 Stage 2 brainstorm。"
