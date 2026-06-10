# Marx M-B2 · m-b2-complete 分支全量完成落档（2026-06-10）

> **PM 指令**（/goal）：开分支 · 不逐项确认 · 按既有讨论/意向把网页全部完成 · 自行调用 skills · 检查优化既有代码 · 不碰 main
> **分支**：`m-b2-complete`（基于 main `f273c32`）· **不合并 main · 等 PM 实测微调后拍板**
> **范围**：T4.2 平滑过渡 + T4.3 迁徙轨迹 + B-2 中文国名 + Stage 5 副窗 + Stage 3 polish + T6.1 图例 + T3.1/T3.4 + T7.1 E2E + goal #3 代码优化
> **不碰**（按既有约束）：B-7 click bug（零 attempt）· B-8 连线 V2（等 PM 专题）· Stage 7 ship/tag（要上 main · PM 拍）

---

## 1. 分支 commit 清单（5 commit）

| commit | 内容 |
|---|---|
| `82b5c8d` | T4.2 国界平滑过渡 + T4.3 迁徙轨迹 · 7 层分层 keyed-join 渲染架构重构 · 1848 行迹空洞修复 · 年份 clamp |
| `97bfcd8` | perf 优化（审查 workflow 确认项）· hover 只刷样式 / timeHandler 双守卫 / timeline 每帧 1 次 rect 读 / 死代码清理 |
| `7d41f88` | B-2 中文国名映射 105 名全量 · Germany/奥斯曼按年代区分 |
| `543db85` | Stage 5 副窗低密度地理图 + Stage 3 正式互换按钮 + T3.1 联动 + T3.4 详情卡让位 + T6.1 图例 |
| `4d651a6` | E2E 8 spec 新增 + deploy 冒烟 spec 重写（M2 stale → 当前形态）· 全套 22/22 |

## 2. 自拍 DR 清单（goal 授权 · 全部留 PM 微调入口）

| DR | 决策 | PM 微调入口 |
|---|---|---|
| **DR-T4.2** | 国界过渡 = enter/exit fade **350ms**（anchor 250-450 取中值）· update 路径 d 即时不 morph（避免跟节点瞬移不同步 + 路径插值开销）· feature set 真变化才 fade · 信息性 motion 不加 reduce-motion guard | `borderTransitionMs` option 一处改 |
| **DR-T4.3** | 迁徙视觉：已走紫实线 opacity 0.55 / 未来紫虚线 '4 3' opacity 0.35 · 线宽 1.2 反比 zoom（min 0.7）· 无箭头（极简）· z-order borders 之上 dots 之下 | 常量在 render 迁徙段 |
| **DR-T4.3-1848** | 原 6 段行迹表 1848 年空洞（布鲁塞尔止 1848 · 伦敦起 1849）→ 球心跳回欧洲中心 1 年。按史实补科隆段（新莱茵报 1848-1849）→ 7 段 / 迁徙 6 段 | 偏离 anchor "6 段既有" · 史实正确性优先 |
| **DR-clamp** | 年份超出 cshapes 数据范围（实扫 1806-2022）时 clamp 显示最近可用年国界 · 修 timeline 初始 2030 国界全空 | — |
| **DR-B2-names** | B-2 备注估 70 名 · 实扫 105 全量做。Germany From<1919 → 德意志帝国（否则 德国）· Turkey From<1923 → 奥斯曼帝国 · Germany (Prussia) → 普鲁士 · 查不到 fallback 原文 | `lib/border-names-zh.ts` 表 |
| **DR-stage5** | V1 副窗只承载地理图缩略（list-main 时显示 380×214 低密度）· geo-main 时副窗隐藏。理由：「观点列表 380×214 缩略」M5 单实例不可双渲染 + 缩略不可读 · V2 再议 | spec § 4.3 "副窗观点列表" 部分推迟 |
| **DR-T5.2** | 低密度减法 = 人节点 + 国界 + 迁徙保留 · 关系线/国名标签/人名标签/交互（zoom/drag/click）全砍 · 国界过渡关 | `density` option |
| **DR-T3.3** | 主副切换动画拍 **B-lite**：入场画布 200ms opacity fade-in。否双画布同显 cross-fade（两 svg 同文档流 block · 同显纵向叠加跳版） | main.ts `showWithFade` |
| **DR-T3.1** | 主副联动只做 forward（obs click → geo 高亮作者紫圈 + reorient claim 年）· 反向（geo dot click → 主图）被 B-7 阻塞等专项修后接 | — |
| **DR-T3.4** | 详情卡 bottom 条件化：副窗可见 274 / 隐藏（geo-main）60 | claim-popover 一处 |
| **DR-T6.1** | 图例左下 left:60（避 48px sidebar 图标栏）bottom:76 · 5 行 · 只在 geo-main 显示 | legend-panel ROWS |
| **DR-e2e-deploy** | 原 deploy.spec（M2 星图选择器）M4 pivot 后持续 fail stale → 重写为当前形态 4 冒烟（标题/obs 规模/timeline/cshapes 资产可达） | — |

## 3. goal #3 代码优化（geo-module-audit workflow · 4 维度并行审查 + 对抗验证）

### 已落地（确认 finding）

1. **hover/click 全量重投影**（high · 实测冗余 ~26ms/帧）→ `renderFocusStyles` + `lastGeom` 几何缓存 · hover 只刷 relation/dot/label focus 样式
2. **timeHandler 无变化检测 + 隐藏画布照跑**（high）→ 双守卫：整数年粒度 skip + display:none 时只更新状态（`refresh()` API 补渲染 · swap 接线）
3. **geoCentroid 每帧每 feature 3 次**（high · 占每帧几何成本 ~43%）→ per-feature WeakMap cache
4. **timeline renderAll 70+ 次 rect 读/帧**（low）→ 每帧 1 次宽度读 + tick 元素引用缓存
5. **渲染架构 remove+rebuild → keyed join**（T4.2 重构附带）· node handler 只 enter 挂一次
6. 死代码：`projection.createProjection` / `timeline.yearToPercent`（仅自身测试在用 · src 零调用）删除
7. 低风险采纳：destroy 对仗补全（.zoom/.drag detach）· swap-button localStorage try/catch · MARX_LOCATIONS 1848 空洞（见 DR-T4.3-1848）

### 未采纳 / 未验证池

- 一批 verify agent 撞 session 限额未完成对抗验证（drag 纬度无 clamp / timeline 无 destroy API / greatCircleArc 不做地平线裁剪等）→ 低置信不盲改 · 留后续 polish 按需验证
- timeline updateTicks 移出每帧路径：验证者警告需配 resize listener 否则引入 regression → 保守只做引用缓存 + 单次宽度读

## 4. 验证证据

| 维度 | 值 |
|---|---|
| Unit tests | **490/493**（+37 新 · 3 fail = M3 pre-existing 持平 · 不碰） |
| E2E | **22/22** 真 Chromium（b2 新 8 + b1 4 + m5 6 + deploy 重写 4）· M5/B1 流程零回归 |
| Lint | 0 error / 0 warning（--max-warnings=0） |
| Build | ✓ · Bundle JS gzip **54.50 KB**（main 50.17 → +4.33 · ≤80 上限 · 余 25.5 safe） |
| 新依赖 | 0（d3-transition 在既有 d3 包内） |

lesson 4.8 兑现：互换/seek/联动/让位全部真浏览器 E2E 验证 · 不拿 jsdom 当证据。
（B-7 dot click 本身不在验证范围 · 按约束未碰）

## 5. PM 实测指引（本地预览 · 分支未上 prod）

浏览器打开 **http://localhost:4173/marx/**（我已在你机器上起好预览服务 · 如打不开喊我重启）：

1. **右上角 header**：搜索框旁出现正式「↔ 互换」按钮（原灰色不可点的占位已激活）
2. **右下角副窗**：380×214 小地图（米白纸面风格 · 标题 "§ 地理图"）· 拖底部时间轴 → 副窗标题变 "§ 地理图 · 1844 巴黎" 这样的年份地名 · 小地图国界跟着年代变
3. **点「↔ 互换」**：主画布淡入切成大地图 · 副窗收起 · 左下角出现「§ 图例」小卡
4. **大地图拖时间轴**：1820 → 1848 → **1871（普鲁士诸邦淡出 · 德意志帝国淡入 · 350ms 渐变不跳变）** → 1883 · 国名显示中文（放大后看 普鲁士/奥地利/法国…）
5. **迁徙轨迹**：紫线连特里尔→柏林→科隆→巴黎→布鲁塞尔→科隆→伦敦 · 游标之前的实线 / 之后的虚线 · 拖时间轴看实线延长
6. **切回列表 · 点任意观点**：详情卡升高让出副窗 · 副窗小地图上该作者圆点出现紫圈
7. **刷新页面**：停留在你上次选的主画布形态（记忆了互换状态）

## 6. backlog 现状（分支后）

| # | 项 | 状态 |
|---|---|---|
| B-1 | 标签密度统一调 | 未动（"显示"模块 · 等 PM 微调轮统一拍） |
| ~~B-2~~ | 中文国名 | ✅ 本分支 done（105 全量） |
| B-7 ⚠ | dot click bug | **未碰**（约束 · 零 attempt v3）· 副作用：T3.1 反向联动同被阻塞 |
| B-8 | 连线 V2 多维度 | 未碰（等 PM 专题） |
| NEW | 未验证 perf 假设池（§ 3） | 后续 polish 按需 |

## 7. 没做的 + 原因

- **Stage 7 ship 流程**（merge main / tag m-b2-final / watch deploy / 4 件套 baseline）：要动 main · PM 实测微调后拍板才走
- **副窗"观点列表"形态**（spec § 4.3 一项）：DR-stage5 推迟 V2
- **B-7 / B-8**：既有约束

---

**下一步**：PM 实测（§ 5 七步）→ 微调反馈 → 改完拍板 → 合 main + Stage 7 ship 流程。
