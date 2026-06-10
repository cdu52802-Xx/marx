# Marx M-B2 · Stage 4 实施期 SSOT · 新窗口续接锚点（2026-05-25）

> **状态**：Stage 4.1 动态历史国界 ship（commit `f0c9b26` · deploy run `26379559838` success）· **PM 尚未实测 Stage 4.1 prod 效果** · 等 PM 实测 + 拍 T4.2（平滑过渡）vs T4.3（迁徙轨迹）开工顺序
> **当前 HEAD**：`f0c9b26`（Stage 4.1 timeline dispatch + geo-canvas re-filter）
> **Git**：clean / origin/main 同步 / tag `m-b2-stage2-final` → `9d89991`（Stage 2 + 阶段 A/B 收尾）已 push
> **Prod**：https://cdu52802-xx.github.io/marx/ → 左上紫边 swap toggle 切 list/geo · Geo 大窗主画布
> **关联**：
> - [Stage 2 + 阶段 A/B 收尾 takeaway](./2026-05-24-b2-stage2-plus-ab-takeaway.md)（8 section · § 3 翻 plan 顺序 case study · § 7 Stage 4 checklist）
> - [spec § 4 B2](../specs/2026-05-20-m-b-mainline-design.md)（§ 4.7 历史国界 · § 10 DR 清单）
> - [plan B2](../plans/2026-05-21-marx-m-b2-geomap.md) Task 4.1~4.3
> - [Stage 2 anchor（frozen · trace history）](./2026-05-22-b2-stage2-progress-anchor.md)

---

## 1. ⚠⚠⚠ 新窗口 step 1 · 当前等什么

**等 PM 两件事**（新窗口开场就问 / 或 PM 开场白直接给）：

1. **PM 实测 Stage 4.1**（拖时间轴 → 国界跳变 1820 神圣同盟 / 1848 革命 / 1871 德意志统一 / 1883 当代雏形 · 球面中心 follow Marx 行迹）
2. **拍下一步**：
   - **A · T4.2 平滑过渡**（推荐 · 国界 250-450ms d3-transition 渐变不跳变 · ~1.5d · PM checkpoint 拍 timing）
   - **B · 直接 T4.3 迁徙轨迹**（紫线 Marx 6 段行迹 · 已走实线/未来虚线 · ~1.5d）
   - **C · V1 跳变不能接受急修 T4.2**
   - **D · 其他新发现**

PM 拍了就直接 TDD 开工 · **不需要 brainstorm**（plan 已细 · 实施期不召 brainstorming skill · memory `feedback_ai_self_judge_skills`）。

## 2. Stage 4.1 已 ship 内容（新窗口不要重做）

| 文件 | 改动 |
|---|---|
| `src/components/timeline.ts` | 加 `dispatchTimeChange(year)` helper（mountTimeline closure 内 · window dispatch CustomEvent `marx:time-change` detail.year）· 3 触发点：click-to-seek onMouseDown / drag onMouseMove / playback interval 每步 · **setCursor external API 不 dispatch**（跟 onCursorChange callback 一致 · 避免初始化反向触发）|
| `src/components/geographic-canvas.ts` | timeHandler 升级：新增 closure var `bordersFullGeojson`（cache 322 features 全量）+ `currentYear`（初始 1843）· loadBorders().then 内存 full + initial filter · timeHandler 内 year change → `filterBordersAtYear(full, year)` re-filter + render |
| `tests/unit/timeline.test.ts` | +5 case（click dispatch / drag dispatch / playback dispatch / setCursor 不 dispatch / CustomEvent 类型）|

数据指标：Lint 0/0 · Tests 455/458（3 M3 pre-existing 持平）· Bundle 50.17 KB（余 29.83 KB safe）

## 3. T4.2 / T4.3 实施修法（plan 已细 · 直接 implement）

### T4.2 国界平滑过渡（如 PM 拍 A/C）

- 当前跳变根因：timeHandler re-filter 后直接 render() · path d 属性瞬间替换
- 修法方向：borders path join 用 d3-transition · `.transition().duration(250-450).attr('d', ...)`
- ⚠ 注意点：
  - cshapes feature 跨年增减（1871 普鲁士 23 邦 → 德意志帝国 1 块）· enter/exit fade in/out + update transition
  - drag 时间轴高频触发 → transition interrupt 自然处理（d3 同名 transition 自动 cancel）· 实测看是否需要 throttle
  - Win10 reduce-motion 陷阱（memory `feedback_win10_reduce_motion_trap`）· 装饰性 motion 才 guard / 国界过渡是信息性 motion 不 guard
- PM checkpoint：timing 250 vs 450 vs 自适应 · 拍板落 DR

### T4.3 迁徙轨迹（如 PM 拍 B）

- 数据既有：`geographic-canvas.ts` MARX_LOCATIONS 6 段（特里尔/波恩柏林/科隆/巴黎/布鲁塞尔/伦敦 · yearStart/yearEnd/loc）
- 修法方向：render() 内加 path 层（z-order 在 borders 之上 · dots 之下）
  - 已走段（yearEnd <= currentYear）：紫实线 great-circle arc（复用 `greatCircleArc` lib）
  - 当前段（yearStart <= currentYear < yearEnd）：实线到当前位置
  - 未来段：紫虚线 `stroke-dasharray`
  - currentYear 来自 timeHandler（Stage 4.1 已有 closure var）
- PM checkpoint：视觉拍板（线宽/虚线 pattern/是否加箭头）

### T4.4 · 大窗实测验收（T4.2+T4.3 都 ship 后）

## 4. Marx 项目硬约束 7 条（必守 · 沿用）

1. lint 0 warning 0 error（`npm run lint -- --max-warnings=0`）才能 push
2. 中文 commit message 用 `git commit -F -` HEREDOC（Windows 编码 · 英文可 `-m`）
3. atomic commit
4. chain push 拒（git add / commit / push 分开跑 · 不 `&&` 链）
5. push 后 `gh run list --limit 1` 拿 id + `gh run watch <id> --exit-status` 等 success（PowerShell 跑避 classifier 误判）· **deploy success 才报 ship done**
6. 不动 M5 主图逻辑 / B1 header / claim-popover（swap toggle 只 hide/show）
7. PM 主观感受 = ground truth · interactive event 必须 PM 实测（jsdom pass ≠ prod 工作 · lesson 4.8）

⚠ CI 3 个 pre-existing fail（stage-b-validated ×1 + stage-c-successor-notes ×2 · M3 数据期遗留）· CI workflow 容忍 · **不是新 fail 不要去修**

## 5. backlog 现状

| # | 项 | 状态 |
|---|---|---|
| B-1 | 国名/人名/标签密度（"显示"模块） | 后期统一调 |
| B-2 | 中文国名映射 70 states | Stage 4 期间可顺做 / 或 polish |
| ~~B-3~~ | K_MAX 64 | ✅ 阶段 B.1 done |
| B-4 | philosophy_vis pattern 参考 | low |
| B-5 | plane 端 distance 调 | low |
| ~~B-6~~ | 1843 静态 → 动态切片 | ✅ **Stage 4.1 done** |
| B-7 ⚠ | click bug（v1+v2 fail · 大窗 h2 排除 · h1/h3-h6 待验）| 后期专项 polish R · **不要顺手 attempt v3** |
| B-8 | 关系连线 V2 多维度（时间/地理/颜色/淡显）| 等 PM 专题讨论 |

## 6. 翻 plan 顺序后的 sequence（DR-stage-A）

```
✅ 阶段 A 主画布切换 → ✅ 阶段 B.1 大窗 polish → 🚧 Stage 4 历史国界（4.1 done / 4.2+4.3+4.4 待）
→ Stage 5 副窗减法 → Stage 3 互换按钮 polish → Stage 7 ship + tag m-b2-final
```

## 7. 续接简单确认句（新窗口 AI 自报）

> "我在续接 Marx M-B2 Stage 4 实施期 · HEAD `f0c9b26`（Stage 4.1 动态历史国界 ship · deploy success）· tag `m-b2-stage2-final` 已 push · 翻 plan 顺序 sequence 阶段 A/B done · 等 PM 实测 Stage 4.1（拖时间轴看国界变化）+ 拍 T4.2 平滑过渡 vs T4.3 迁徙轨迹顺序 · 读 docs/2026-05-25-b2-stage4-progress-anchor.md 完整 7 section · backlog B-6 done / B-7 click bug 不碰 / B-8 连线专题等 PM"

## 8. 切窗口 handover checklist

- ✅ Stage 4.1 ship（f0c9b26）+ deploy success（26379559838）
- ✅ Stage 2 + 阶段 A/B takeaway 完整（2026-05-24 · 8 section）
- ✅ tag m-b2-stage2-final → 9d89991 push
- ✅ 本 anchor 落档
- ✅ memory 更新（m-b2-stage4-1-dynamic-borders entry）
- ⏳ PM 实测 Stage 4.1 + 拍 T4.2/T4.3 顺序（新窗口第一件事）
