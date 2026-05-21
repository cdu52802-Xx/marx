# B2 Stage 1 PM Checkpoint · prototype 实测（2026-05-22）

> **状态**：Stage 1 prototype T1.1-T1.5 全 ship · 等 PM 实测 + 拍板临界 zoom 阈值 / 中心策略 / 旋转灵敏度 / 进 Stage 2 OR 继续 prototype 调优
> **HEAD**：`eb696c0` （T1.5 球面 Marx follow + drag · deploy run 26242612388 success）
> **Prod 入口**：https://cdu52802-xx.github.io/marx/ → **主画面右上 300×200 prototype 浮窗**
> **关联**：[spec § 4](../specs/2026-05-20-m-b-mainline-design.md#4-b2--副窗地理图phase-3--5-6-周--7-stage) · [plan Stage 1](../plans/2026-05-21-marx-m-b2-geomap.md)

---

## Stage 1 已完成清单

| Task | 内容 | commit |
|---|---|---|
| **T0.1** | 数据可达性验证 + DR-098 | `0ffd410` |
| **T0.1+** | cshapes spike + DR-099 | `8e64b3b` |
| **DR-099 final** | spec § 4.7 升级 V1 用 cshapes-Europe | `4a25b29` |
| **T1.1** | `lib/projection.ts` D3 投影工厂（orthographic + mercator + ZOOM_THRESHOLDS） | `712d329` |
| **T1.2** | `lib/great-circle.ts` great circle arc 计算（geoInterpolate 50 sample） | `840c2b5` |
| **T1.3** | `components/geographic-canvas.ts` prototype scaffold + 5 测试节点 + 主画面右上临时挂载 | `2fffac5` |
| **T1.4** | zoom 整合 + projection 平滑过渡（k 阈值 sphere≤2.5 / plane≥4.5） | `d5e4988` |
| **T1.5** | 球面默认中心 follow Marx 当前年地点 + drag 旋转 + 接 timeline event | `eb696c0` |

**Bundle 当前**：JS 45.62 KB gzip（B1 ship 34.58 KB + B2 Stage 1 +11.04 KB）/ 上限 80 KB / **safe 余 34.38 KB**
**Tests 当前**：292/295（3 pre-existing M3 fail · 持平 B1 ship baseline 276/279）
**Lint**：0 warning 0 error

---

## PM 实测路径 · 6 件事

> **前提**：Ctrl+F5 强刷 https://cdu52802-xx.github.io/marx/ · 等 5 分钟 GH Pages CDN 刷新

### 1. 球面 view 见 5 紫点 ✓
- 主画面右上 **300×200 浮窗**（米白底 + 沙石灰金 border）
- 应见 **半球弧线（graticule 经纬网）** + **5 个紫点**（默认 sphere mode 中心 [10, 50] 欧洲）
- 5 紫点对应 Marx 行迹关键城市：
  - 特里尔（[6.64, 49.75] · Marx 出生地）
  - 波恩/柏林（[13.40, 52.52]）
  - 巴黎（[2.35, 48.86]）
  - 伦敦（[-0.13, 51.51]）
  - + 1 个测试点

**你要拍板**：5 紫点位置跟你印象的欧洲城市相对位置一致吗？球面视觉效果如何？

### 2. 滚轮 zoom → 球面/平面切换 ✓
- 鼠标移到 prototype svg 浮窗里 / **滚轮上下** → 应触发 zoom 切换
- k ≤ 2.5（小 zoom）→ **球面 sphere mode**（geoOrthographic）
- 2.5 < k < 4.5（中 zoom）→ **transition mode**（暂用 sphere 占位 / 平滑内插留 V1+）
- k ≥ 4.5（大 zoom）→ **平面 plane mode**（geoMercator）
- **临界 zoom 阈值** = ZOOM_THRESHOLDS 在 src/lib/projection.ts:18 hardcoded（spec § 7 placeholder · 此 checkpoint 拍板）

**你要拍板**：临界阈值 sphere ≤ 2.5 / plane ≥ 4.5 感觉自然吗？太快/太慢切换？想调整哪个数值？

### 3. 球面拖动 → 旋转 ✓
- 在 sphere mode 下（k ≤ 2.5）/ **mouse 在 svg 内按住拖动**
- 球面应跟着旋转（dx/dy * 0.5° per pixel）
- 平面 mode（k ≥ 4.5）drag 不响应旋转（让位给 zoom 的 pan）

**你要拍板**：旋转手势灵敏度合适？太快/太慢？是否需要 inertia 自由旋转（drag 后继续微转）？

### 4. 拖时间轴游标 → 球面 follow Marx ⏸
- **Stage 1 不接 timeline**（要 T4.x 改造 timeline.ts dispatch event 才有）
- 现在用 **浏览器 console 手动 dispatch** 模拟：
  - F12 打开 DevTools Console
  - 跑：`window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1843 } }))`
  - 球面应 reorient → 巴黎 [2.35, 48.86] 在中心
- 试其他年：
  - 1820 → 特里尔
  - 1843 → 巴黎
  - 1849 → 伦敦
  - 1871 → 伦敦（1849-1883 都 伦敦）

**你要拍板**：球面 follow Marx 当前年地点这个策略 OK 吗？还是希望欧洲固定中心（不 follow）？

### 5. 整体视觉感受
- 米白底 + 紫圈 + 沙石灰金 graticule + 沙石灰金 border
- 跟主图（M5 半圆弧 + B1 header search）同视觉风格？
- editorial-academic 风沿用？

**你要拍板**：视觉方向 OK 进 Stage 2 / 还是要 polish？

### 6. console 调试 hook
- prototype 暴露了 `window.protoApi` 给你调
- 可以试：
  - `protoApi.setMode('plane')` → 切平面（不用滚轮）
  - `protoApi.setMode('sphere')` → 切球面
  - `protoApi.setMarxLocation([2.35, 48.86])` → 巴黎中心
  - `protoApi.rotate([-10, -50, 0])` → 手动设旋转角

---

## 4 个拍板项（PM 决策点）

| 决策 | 选项 | 备注 |
|---|---|---|
| **DR-099+ 临界 zoom 阈值** | (A) 默认 2.5/4.5 / (B) 调更宽 1.5/6 / (C) 调更窄 3/4 / (D) PM 自定 | spec § 7 placeholder 落档 |
| **DR-099+ 球面默认中心** | (A) Marx follow / (B) 欧洲固定 / (C) 用户手动 | 默认 (A) · 跟 spec § 4.6 一致 |
| **DR-099+ 旋转手势** | (A) 默认 0.5° / 像素 / (B) 调更快 1.0 / (C) 调更慢 0.3 / (D) 加 inertia | implementer 已实施 (A) |
| **进 Stage 2** OR 继续 prototype 调优 | go / 调 X / 调 Y / 调 Z | Stage 2 = 86 节点完整渲染 + 关系连线 6→3-5 拍板 |

---

## 2 个 implementer 已 flagged concern（PM 实测时观察）

1. **d3-zoom + d3-drag 同 svg event 顺序冲突**（jsdom 不可验）：如果你 PM 实测时发现球面 drag 失灵或卡顿 / 我后续 Stage 2 加 `zoomBehavior.filter()` 或 `dragBehavior.filter()` 显式 demux。如果实测 OK / 不需修。

2. **drag rotate 累加无重置入口**：你不停 drag 旋转 / currentRotate 会累加（dx*0.5 / dy*0.5）/ time-change event 会 reset / 但如果你想"reset 球面到默认中心" 没有手动按钮。如果你觉得需要 / 我加个 `protoApi.resetRotate()` API。

---

## 实测后回报模板

复制以下贴 chat：

```
Stage 1 prototype 实测反馈：

1. 5 紫点 + 球面 graticule：[OK / 太挤 / 太疏 / 颜色调 / 其他...]

2. 滚轮 zoom 切换：[临界 OK / sphere 阈值太大太小 / plane 阈值太大太小 / 想要 ...]

3. drag 旋转：[OK / 太快 / 太慢 / 不需要 / 加 inertia / 其他...]

4. console dispatch marx:time-change：[OK / Marx follow 策略 OK / 想欧洲固定 / 其他...]

5. 整体视觉：[OK 沿用主图 / 还可以 / 不喜欢 X / 想 polish X / 其他...]

6. 是否进 Stage 2：[go Stage 2 / 先调 X / 先调 Y / 等 ...]

7. d3-zoom + d3-drag 冲突：[OK 无冲突 / drag 失灵 / 卡顿]

8. drag 累加 reset：[OK 不需要 / 想加 reset 按钮]
```

我等你拍板 · 落 DR-099+ · 进 Stage 2 OR 继续调 prototype。
