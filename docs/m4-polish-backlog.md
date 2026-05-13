# M4 Polish Backlog

> **何时处理**：T13 M4 整体上线 + takeaway 阶段批量调（spec § 12 polish 节奏 / 不在 T7-T12 每个 task 后单独 polish 死循环）
> **决策来源**：PM 资深产品视角 "vision-level 错才立即改，细节攒着批量处理"（2026-05-12 T6 checkpoint）
> **状态**：M4 进行中收集 / 完整 list 见下

---

## T7 时间轴反馈（2026-05-12 PM）

- **播放速度略快**：当前 100ms / 5 年 = 180 年跑完 3.6 秒
  - 候选调整：调 100ms → 200-300ms 或 5 年/步 → 2-3 年/步 / 跑完 6-12 秒
  - 真正方案：加速度曲线（开始慢中间快结尾慢 / easeInOutCubic），让"思想史展开"有节奏
- **淡出效果略生硬**：游标拖动时 person section 直接 opacity 1 → 0.4 突变
  - 候选调整：CSS transition opacity 0.3s ease（slider 拖动时同步过渡）/ 或 D3 .transition().duration(200)
- **紫色 ticks 视觉对比度低**：当前 1830/1850/1870 紫色 vs 其他灰色，目测区分度小
  - 候选调整：Marx 活跃年 tick 加长（14 → 18px）+ 加 letter-spacing / 或加 label 副标题（"早期" / "成熟期" / "晚期"）

## T6 主画布字体反馈（2026-05-12 PM）

- 字体目前可用（EB Garamond / Georgia serif 大方向不动），后续微调字号 / letter-spacing / 行高
  - 候选调整：claim_text 11px → 12px / person 标题 letter-spacing 0.6 → 0.8-1.0 / obs tag 9px → 10px italic

## T7 通用反馈

- timeline 高度 ~140px (border-top + axis 50 + slider 行 + padding) 是否合适 / 待 PM 用过几次后判断
- ▶ 播放按钮位置 / 样式（当前左对齐 / 紫色 border + 米白底）

## T9 详情右侧栏反馈（2026-05-12 PM · 改造版）

> **状态**：vision-level 已通过（PM 原话 "效果基本满意"）· 配色 / 样式 / 内容 / 排版 4 维度细节 PM 暂无具体方向 / 慢慢磨
> **改造前**：浮动小卡片（鼠标旁 300×300）· 改造后：380px 右侧 fixed 滑入栏（PM Q1 A / Q2 A 朋友项目风格 / Q3 hybrid / Q4 三路关闭 + 0.35s 滑入滑出）
> **何时调**：T13 跑 dev server 沿 backlog 顺序实验 / 每条 5-15 min / PM 决定接受 / 改 / 跳过

### A · 配色

- **sidebar 底色 #fcfaf6**：跟主画布同色 / 用户视觉上"延续画布"是否要换成略浅 (#fffef8) 或略深 (#f7f0e0) 区分？
- **kicker 紫 #5b3a8c**：饱和度跟画布 obs 圆点同 / 是否调浅成"副信息"感（如 #8a7aa6）
- **successor 卡背景叠加 6% (rgba 0.06)**：绿 / 红橘色块淡到几乎看不出 / 是否调浓 (10-12%) 让"agreement / disagreement"两路视觉对比更强
- **blockquote 紫 4px 左边线**：宽度 / 颜色饱和度
- **reference footer 灰虚线**：是否改实线 / 颜色

### B · 样式

- **blockquote 装饰**：当前无装饰 / 是否加 " " 引号字符（左上 / 右下大字 italic 灰）
- **kicker 编号**：当前 `§ Claim · Karl Marx` / editorial 用 `§IV 核心概念` 罗马数字 / 是否每个 claim 按 author 编号
- **successor 卡 hover 反馈**：当前无 / 是否加 background 加深 0.02
- **× 关闭按钮**：当前绝对定位 right:18 top:14 / 是否加 hover 圈背景 / 跟 sidebar 头部对齐

### C · 内容

- **person 头像占位**：当前无 / 是否在 kicker 旁加圆形头像（r=20 紫填充 + 灰边）/ Marx 主角是否特殊样式
- **keywords tag**：当前没单独显示（只藏在 cats 后） / 是否单独一行展示
- **derived_from_concept_id 标记**：concept-12 升级来的 claim 是否标"概念升级自 X"
- **agreement / disagreement 列表跳转**：点 successor 卡是否触发对方 claim 的 sidebar（chain navigation）
- **claim_text 太长截断**：当前不截断完整显示 / 极长 claim 是否加 "展开全文"

### D · 排版

- **sidebar 宽度 380px**：候选 360 / 380 / 400 / 420 / 跟 T8 左 sidebar 展开宽度（200px）对比关系
- **header sticky**：当前滚动时 kicker + h2 + meta 跟着滚走 / 是否 sticky top 始终可见
- **close 按钮 sticky**：当前固定 absolute / 长内容滚动到底时按钮看不见 / 是否 sticky
- **顶底 fade-mask**：长内容滚动时是否加 linear-gradient 顶底 8% 渐隐
- **section 间距 22-24px gap**：紧凑度 / 学术编辑风密度

### 处理顺序建议（T13 时按价值 / 风险排序）

1. 先调 A 配色（不改 DOM 结构 / 风险最低 / 视觉冲击最大）
2. 再调 D 排版宽度 + sticky（PM 浏览器看几次再判断）
3. 然后 C 内容（加头像 / 链接跳转 = 加新功能 / 留 T13 看时间）
4. 最后 B 样式装饰（引号 / 罗马数字 / hover = nice-to-have）

---

## 2026-05-13 smoke test 一轮反馈（PM 接受 B1 立即修 / B2-B4 入 backlog）

> **来源**：A 类 smoke test report 2026-05-13 · PM 反馈"修 B1，其他 3 个进 backlog"
> **B1 已修**：commit 2eae1db（abstract 出 applyClaimFilters helper / 7 个 unit test / preview 验证 sidebar 5 学科 + claim checkbox 真生效）
> **本节为 M5 完成后 polish 批量处理范围**

### B2 · Timeline 播放按钮无暂停 + 重复 click race

- **现状**：[timeline.ts:157-169](../src/components/timeline.ts) 点 ▶ 起一个 setInterval / 不记 id / 不 toggle 文字 / 跑完 yearMax 才 clearInterval
- **触发问题**：用户点 ▶ 再点 ▶ = 第 2 个 interval 并发 / cursor 加速 / 用户无法暂停 / 视觉上看 cursor 跳得诡异
- **候选修复**（≈ 10 min）：
  1. mountTimeline 闭包加 `let activeInterval: number | null = null;`
  2. playBtn.click → 检查 activeInterval：null = 起新 interval + 改 textContent="⏸ 暂停"；非 null = clearInterval + 改 textContent="▶ 播放思想史"
  3. 跑完到 yearMax 时也 reset textContent + activeInterval = null
- **联动**：跟原 polish backlog "100ms / 5 年略快" 一起调，因为修改同一函数
- **风险**：低（单文件 / 不动 DOM 结构）

### B3 · Mobile (≤ 380px viewport) 详情栏几乎全屏

- **现状**：[claim-popover.ts:47](../src/components/claim-popover.ts) `width:380px` 硬编码 / 在 viewport 375 时几乎全覆盖 / 把 timeline 也遮（panel z-index:1000 > timeline z-index:10）
- **触发问题**：mobile 用户点 obs → 详情栏覆盖 101% viewport → 没办法同时看主画布 + 详情 / 关闭按钮太靠近边缘容易误触
- **候选修复**（≈ 10 min）：
  1. width 改 `min(380px, calc(100vw - 16px))` —— 让 mobile 留 16px 给用户感知"右侧有内容"
  2. 加 mobile @media (max-width: 480px) → `height: calc(100vh - 150px); bottom: auto;` 让 timeline 仍可见
- **PM 决策**：2026-05-13 反馈"暂不升 A"（基于"暂不计划朋友 mobile 看"）
- **何时升 A**：PM 计划 mobile 分享 demo 前
- **风险**：低-中（CSS 调 / 多 viewport 实测）

### B4 · Tablet (768) sidebar 底部与 timeline 视觉重叠

- **现状**：[main.ts:339-343](../src/main.ts) sidebar 高 100vh / timeline 高 143 顶上 / 底部 143×48 区域 z-index 都 10 / DOM 顺序后挂的 sidebar 在上 → sidebar 底部 icon "⋯ extends" 跟 timeline top-border 撞色
- **触发问题**：tablet / 短 viewport 下 sidebar 底部最后 1-2 个 icon 视觉糊 / 但不阻塞功能（icon 可点）
- **候选修复**（≈ 5 min）：
  1. 简单版：sidebar 加 `bottom: 143px` 硬编码 → 给 timeline 让位
  2. 动态版：mount 后读 timeline.offsetHeight 设 sidebar.bottom（适配 timeline 高度变化 / 比如 B2 加 ⏸ 按钮高度变 / 比如 mobile B3 timeline 高度变）
- **联动**：跟 B2 / B3 一起 polish（timeline 高度可能改 / sidebar bottom 跟随）
- **风险**：极低（CSS 调）

### B2/B3/B4 批量处理建议顺序

跟 T9 4 维度 + T7 速度 + T6 字体一起 polish session（M5 完成后批量）：

1. 先 B4 (5 min / 视觉小修)
2. B3 (10 min / mobile CSS / PM 浏览器实测过)
3. B2 (10 min / interval + toggle / PM 实测播放节奏)
4. 然后 T7 速度 / T6 字体 / T9 4 维度 慢磨

总计 ≈ 30-40 min B2-B4 + 1-2 hr T7/T6/T9 = 单次 polish session ≈ 2-3 hr.

---

## 其他 task 可能收集到的 polish item（占位）

- T8 sidebar：48px 收起态 icon 大小 / 200px 展开态 hover 反馈
- T10 维度融合：勾选著作时叠加 `[书名 · 年份]` 文字大小 / 位置
- arc-cats 联动：cats filter 隐藏 obs 后弧线两端"半挂虚空"问题（弧线还画 / 用户视觉不一致）—— 见 [apply-claim-filters.ts](../src/components/apply-claim-filters.ts) 第 18 行注释
- ...

## 处理原则

- **每个反馈条目要含**：现状描述 + 候选调整方向（不一定执行 / 给 T13 自由空间）
- **T13 批量处理**：跑 dev server 沿 backlog 顺序调，每条目 5-15 min 实验，PM 看效果决定接受 / 改 / 跳过
- **不在 T7-T12 推进期间单独修 polish item**（避免 polish 死循环 / 时间不够推主 task）
- **例外**：M4 minimum 80 claim 这种关键数据 / vision-level 硬约束（如弧线方向反 / 字体用了 Inter 违反三件套）= 立即修，不进 backlog
