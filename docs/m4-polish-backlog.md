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

## 后续 task 可能收集到的 polish item（占位）

- T8 sidebar：48px 收起态 icon 大小 / 200px 展开态 hover 反馈
- T9 popover：弹出位置 / 阴影深度 / 关闭按钮位置
- T10 维度融合：勾选著作时叠加 `[书名 · 年份]` 文字大小 / 位置
- ...

## 处理原则

- **每个反馈条目要含**：现状描述 + 候选调整方向（不一定执行 / 给 T13 自由空间）
- **T13 批量处理**：跑 dev server 沿 backlog 顺序调，每条目 5-15 min 实验，PM 看效果决定接受 / 改 / 跳过
- **不在 T7-T12 推进期间单独修 polish item**（避免 polish 死循环 / 时间不够推主 task）
- **例外**：M4 minimum 80 claim 这种关键数据 / vision-level 硬约束（如弧线方向反 / 字体用了 Inter 违反三件套）= 立即修，不进 backlog
