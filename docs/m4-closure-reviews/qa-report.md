# M4 Closure · QA Report (qa-only mode)

> **触发**：2026-05-13 M4 closure 4 件套 · 3/4
> **工具**：gstack `/qa-only` skill（`browse.exe` Windows native · localhost dev mode）
> **范围**：M4 demo 全功能 + 4 viewport (mobile/tablet/desktop)
> **运行**：2026-05-13 (Asia/Shanghai)
> **HARD GATE**：本 report 只发现 + 文档化 / 不修代码 / 不读源码

---

## 1. Health Score

| 维度 | 分 | 权重 | 加权分 |
|---|---|---|---|
| Console | 100 | 15% | 15.0 |
| Links | 100 | 10% | 10.0 |
| Visual | 100 | 10% | 10.0 |
| Functional | 75 | 20% | 15.0 |
| UX | 74 | 15% | 11.1 |
| Performance | 100 | 10% | 10.0 |
| Content | 97 | 5% | 4.85 |
| Accessibility | 92 | 15% | 13.8 |
| **Total** | | | **89.75 ≈ 90/100** |

**Status**: 🟢 **GOOD**（B 等级 / app 主流程 work / 3 个已知 polish + 3 个新发现）

---

## 2. Top 3 Things to Fix（按影响）

1. **🔴 B2 timeline play 无暂停 race** — 用户无法暂停播放 / 必须等到 1950 才能再交互 / 第 2 次 click 直接 restart 从 1815（已在 backlog / 立即修候选）
2. **🟠 B3 mobile popover 100% viewport 覆盖** — 移动端无法同时看主图 + 详情（已在 backlog / PM 已表态"暂不升 A"）
3. **🟠 NEW · sidebar icon accessibility** — 收起态 6 icon (⟩ ● 👤 ↝ ⇋ ⋯) 不在 ARIA tree / 无 aria-label / 键盘 + 屏幕阅读器用户访问不到

---

## 3. 详细 findings

### ISSUE-001 · 🔴 **B2 timeline play 按钮无暂停 / 重复 click race**（HIGH · confirmed）

**Reproduce**:
1. 打开 demo / sidebar 已收起 / slider 在 1880
2. 点 ▶ 播放思想史 → slider 开始跑（1880 → 1850 → 1900 → 1950）
3. 期间观察：**button text 始终是 "▶ 播放思想史"**（无 ⏸ 状态切换）
4. 第 2 次 click → slider **重置到 1815**（不是暂停 / 是重新开始）
5. 第 3 次 click + 等 1.5s → slider 在 1815（被卡住或又重启）

**Evidence**:
- 第 1 击后 800ms：`{slider: "1850", btn_text: "▶ 播放思想史"}`
- 第 1 击后 3s：`{slider: "1950", btn_text: "▶ 播放思想史"}` (跑到底)
- 第 2 击立即：`{slider: "1815", btn_text: "▶ 播放思想史"}` (restart)

**Impact**: 用户启动播放后**无法暂停**也**无法 cancel**。如果想停下来读某个时间点的 claim 必须等播放到 1950 自然结束（或拖游标）。用户体验 backlog 已正确描述为"无暂停 + race interval"。

**Status**: 已在 [polish backlog B2](../m4-polish-backlog.md#b2-·-timeline-播放按钮无暂停--重复-click-race) / spec § 6.1（10 min fix · 闭包 activeInterval + toggle textContent）

---

### ISSUE-002 · 🟠 **B3 mobile popover 380px > 375 viewport（overflow）**（HIGH · confirmed）

**Reproduce**:
1. 设 viewport 375×812（iPhone 标准）
2. 点任意 obs → popover 从右滑入
3. 测量：`popover_w: 380, viewport_w: 375` → **横向 overflow 5px** + popover_h: 812 = **垂直 100% 覆盖**

**Evidence**: [12-mobile-popover.png](../../.gstack/qa-reports/screenshots/12-mobile-popover.png) — popover 全屏 / 主图完全看不见 / timeline 也被遮

**Impact**: 移动端用户点 obs 后**完全失去主图 context** / × 关闭按钮在右上角靠近边缘易误触

**Status**: 已在 [polish backlog B3](../m4-polish-backlog.md#b3-·-mobile-≤-380px-viewport-详情栏几乎全屏) / PM 2026-05-13 表态"暂不升 A"（朋友看 demo 暂不计划 mobile）/ 修复方向 `width: min(380px, calc(100vw - 16px))` + `@media (max-width: 480px) → height: calc(100vh - 150px)`

---

### ISSUE-003 · 🟠 **NEW · Sidebar collapsed icons not in ARIA tree**（MEDIUM-HIGH · NEW finding）

**Reproduce**:
1. 默认收起态 sidebar
2. `browse snapshot -i` 输出：6 个 cursor-interactive icon (⟩ ● 👤 ↝ ⇋ ⋯) **不在 ARIA 树**
3. 仅 3 个元素 ARIA-accessible: `@e1 link` (footer) / `@e2 button "▶ 播放思想史"` / `@e3 slider`

**Impact**:
- 屏幕阅读器用户：sidebar 完全不可达
- 键盘用户：Tab 跳过 sidebar / 无法激活
- 自动化 QA / E2E：用 `@e<N>` ref 无法触达 sidebar 收起态
- 学术 demo 用户群可能含视障 / 老师 / 残障研究者

**Modal/Status**: NEW / 不在 polish backlog
**修复方向**（10 min）: sidebar collapsed div 加 `role="button"` + `aria-label="展开筛选栏"` / 6 icon 加 `aria-label` 分别命名 / 可 Tab 聚焦

---

### ISSUE-004 · 🟠 **B4 Tablet sidebar bottom 与 timeline 视觉冲突**（MEDIUM · partial confirmed）

**Reproduce**:
1. viewport 768×1024（iPad）
2. 默认收起态：sidebar 48px 宽 / bottom 到 1024 / timeline fixed bottom 占 140px → sidebar 底部 icon 与 timeline 顶部 border-line 撞色 + 视觉重叠
3. 展开态：sidebar 200px 宽 / 同样底部重叠 + 主图被挤更厉害

**Evidence**: [13-tablet-initial.png](../../.gstack/qa-reports/screenshots/13-tablet-initial.png) — 收起态视觉问题不那么明显 / 但 sidebar bottom 与 timeline 顶部依然撞

**Impact**: tablet 用户视觉糊 / 不阻塞功能（icon 可点 + timeline 可拖）

**Status**: 已在 [polish backlog B4](../m4-polish-backlog.md#b4-·-tablet-768-sidebar-底部与-timeline-视觉重叠) / 5 min fix

---

### ISSUE-005 · 🟡 **NEW · Mobile sidebar 默认不 collapsed / 占 53% viewport**（LOW · NEW finding）

**Reproduce**:
1. viewport 375×812（mobile）
2. **sidebar 默认展开**（应该自动 collapsed）/ 主图被挤到右半 / 横向 scroll 才能看到 Marx 后面 person section

**Evidence**: [11-mobile-initial.png](../../.gstack/qa-reports/screenshots/11-mobile-initial.png) — sidebar 200px + 主图被挤右侧 / 显示 53% viewport 被 sidebar 占

**Impact**: 移动端首屏体验差 / 用户得先点 ⟨ 收起 sidebar 才能看主图

**Modal/Status**: NEW / 跟 B3 一起 mobile responsive polish 一并改

**修复方向**: `@media (max-width: 768px) → sidebar 默认 collapsed`

---

### ISSUE-006 · 🟡 **NEW · Sidebar 学科 cats 仅 5/11 显示**（LOW · NEW finding）

**Reproduce**:
1. 展开 sidebar
2. "学科" section 仅 5 项: 形而上 me / 政治 po / 伦理 et / 宗教 re / 元哲学 mp

**预期**: M4 spec § 7.2 + M3 anchor mentions 11 cats（me/ep/lo/et/po/ae/re/mi/la/sc/mp + ba）

**Impact**:
- 用户从 sidebar 看不到全部学科分类
- 如果 Marx 19 obs 用到其他 cats（如 ep epistemology 认识论）→ 无法 filter
- 用户可能怀疑 filter 设计不完整

**实际可能解释**（需 PM 确认）:
- A · Marx 19 obs 确实只用到 5 cats / 其他 6 cats 无 data 不显示（按需渲染）
- B · sidebar 写死 5 cats 是 spec 偏差

**Modal/Status**: NEW / 性质未明 / 需要 PM 决定（spec 修订 vs sidebar 加全 11 cats）

---

### ISSUE-007 · 🟢 **POSITIVE · Popover 视觉 + 配色 + 排版完整**（NOT A BUG）

**Observation**: [10-popover-open.png](../../.gstack/qa-reports/screenshots/10-popover-open.png) + [12-mobile-popover.png](../../.gstack/qa-reports/screenshots/12-mobile-popover.png)

- 学术编辑风 ✓
- 紫色 kicker `§ Claim · 格奥尔格·威廉·弗里德里希·黑格尔`
- EB Garamond 主张 quote + 紫边
- 卡片化 "影响 6 条" 列表 ✓
- × 关闭按钮显眼
- 配色 / 字体 / 间距 在 desktop + mobile 都立得住

**Note**: 之前 polish backlog T9 的 4 维度 polish 仍是 nice-to-have / 当前 baseline 已是 GOOD 等级

---

## 4. 验证 backlog 4 issue 现状

| Backlog # | 描述 | QA 验证结果 |
|---|---|---|
| B1 | sidebar cats + claim filter 实现遗漏 | ✅ **commit 2eae1db 真生效** (uncheck 形而上 me → 5/92 obs `display:none` · uncheck 影响 → 31 arcs 减到 11 visible · 三类 filter 都对) |
| B2 | timeline 播放无暂停 + race | ⚠ **仍在 / 已 reproduce** (本 report ISSUE-001) |
| B3 | mobile 详情栏几乎全屏 | ⚠ **仍在 / 已 reproduce** (本 report ISSUE-002) |
| B4 | tablet sidebar / timeline 视觉重叠 | ⚠ **仍在 / partial reproduce** (本 report ISSUE-004) |

⭐ **关键修正**：之前 smoke test 的 B1 fix 在本 QA 中**完整 verified**。我中途用错 `.obs-tag` selector 误判过 cats filter 没生效 / 重测后 `g.obs` selector 显示 filter 真的 work。详见 § 5。

---

## 5. 测试方法学反思（lesson for future QA）

⚠ 测试 SVG 渲染的可见性时，**直接用 d3 实际挂载的 class** (`g.obs` / `.arc-layer path`)，**不用** 视觉派生的 class (`.obs-tag` = cat label / `.obs-text` = 内容字段)

错误测法：
```js
document.querySelectorAll('.obs-tag').length  // 92 个 cat label，永不 hide
```

正确测法：
```js
document.querySelectorAll('g.obs').length  // 92 个 obs 容器
Array.from(document.querySelectorAll('g.obs')).filter(e => getComputedStyle(e).display === 'none')  // hide 的数量
```

⭐ Lesson: SVG filter 用 `display:none` 实现 / 不是 opacity / 测试时要对 + 要确认实际 DOM mount class

---

## 6. Console + Network Health

| Check | Status |
|---|---|
| Initial load console errors | ✅ 0 errors |
| After interactions (filter / play / popover) | ✅ 0 new errors |
| Network requests | ✅ 所有 200 OK |
| Failed network requests | ✅ 0 |

**Caveat · 大量 font subset 请求**：dev mode 加载 119+ 个 `notoserifsc/...v35/...woff2` subset 文件 / 全部 200 / 不是 error / 是 Google Fonts CJK 字体 unicode 分片机制 / prod 同模式但被 service worker 缓存（如有）/ 已在 benchmark-report § 3 标记为次要性能 cost

---

## 7. 测试覆盖率

| 功能 | 测试结果 |
|---|---|
| Sidebar collapse / expand toggle | ✅ work |
| Node type filter (claim/person/work/event/place 5 个) | ✅ click 响应 + DOM 生效 |
| Relation type filter (影响/反驳/自延 3 个) | ✅ click 响应 + 实测 agreement 砍 20 弧 |
| Cats filter (5 学科) | ✅ click 响应 + DOM display:none |
| Timeline scrubber | ✅ 拖动 + 双向 |
| Timeline play button (第一次) | ✅ 启动 + slider 跑 |
| Timeline play button (暂停) | ❌ **bug** ISSUE-001 |
| Click obs → popover open | ✅ work |
| Esc 关闭 popover | ✅ work |
| × 关闭按钮 | ⚠ 未直接测 / popover 闭包内可见 |
| 点空白关闭 popover | ⚠ 未测 |
| Popover 配色 / 排版 / 字体 | ✅ 学术编辑风 + 紫色 + EB Garamond |
| Desktop 1280×720 | ✅ |
| Mobile 375×812 | ⚠ ISSUE-002 + ISSUE-005 |
| Tablet 768×1024 | ⚠ ISSUE-004 |

**未覆盖 / future QA 可挖**:
- 拖游标过程中是否有 transition 突变（B 类 polish backlog）
- 长 claim_text 截断 / 展开
- 多 popover 切换（点 obs A → 点 obs B）
- agreement / disagreement 卡片点击是否 chain navigate
- person header / work tag 是否可点（spec 提及）
- 浏览器 back/forward / refresh state 保留

---

## 8. baseline.json（regression mode 用）

```json
{
  "date": "2026-05-13",
  "url": "http://localhost:5175/marx/",
  "milestone": "M4 closure",
  "healthScore": 90,
  "issues": [
    {"id": "ISSUE-001", "title": "B2 timeline play no pause + restart race", "severity": "high", "category": "functional"},
    {"id": "ISSUE-002", "title": "B3 mobile popover 380>375 overflow", "severity": "high", "category": "ux"},
    {"id": "ISSUE-003", "title": "Sidebar icons not in ARIA tree", "severity": "medium-high", "category": "accessibility", "new": true},
    {"id": "ISSUE-004", "title": "B4 tablet sidebar/timeline conflict", "severity": "medium", "category": "ux"},
    {"id": "ISSUE-005", "title": "Mobile sidebar not auto-collapsed", "severity": "low", "category": "ux", "new": true},
    {"id": "ISSUE-006", "title": "Sidebar cats shows 5/11", "severity": "low", "category": "content", "new": true},
    {"id": "ISSUE-007", "title": "Popover visual is excellent (positive)", "severity": "n/a", "category": "visual"}
  ],
  "categoryScores": {
    "console": 100,
    "links": 100,
    "visual": 100,
    "functional": 75,
    "ux": 74,
    "performance": 100,
    "content": 97,
    "accessibility": 92
  }
}
```

---

## 9. Recommendations

| # | 操作 | 类别 | 时间 | 时机 |
|---|---|---|---|---|
| 1 | 修 ISSUE-001 (B2 play pause) | functional | 10 min | ⭐ 立即（go M5 前）|
| 2 | 修 ISSUE-003 (sidebar ARIA) | a11y | 10 min | ⭐ 立即（也是 NEW catch）|
| 3 | 修 ISSUE-005 (mobile sidebar auto-collapse) | ux | 5 min | M5 polish batch |
| 4 | 修 ISSUE-002 (B3 mobile popover) | ux | 10 min | M5 polish batch / PM 决定时机 |
| 5 | 决策 ISSUE-006 (cats 5 vs 11) | content / spec | 5 min PM 决策 | M5 brainstorm 期 |
| 6 | 修 ISSUE-004 (B4 tablet) | ux | 5 min | M5 polish batch |

**ROI 排序**：1 (B2) > 2 (ARIA) > 5 (mobile sidebar) > 3 (mobile popover) > 4 (tablet) > 6 (cats decision)

---

## 10. 跟 health/benchmark 交叉

- **health report § 4** 推荐立即修 F1+F2（lint config + tsconfig 一致性）= 10 min → 现在加上 ISSUE-001 + ISSUE-003 共 **~30 min go M5 前可修** 全部
- **benchmark report § 3 F2** 提到 Google Fonts 2.3s 加载 → 跟本报告 § 6 caveat 一致 / 都是同一个 root cause（CJK font subset）

---

**STATUS**: DONE
**REASON**: 完成 desktop + mobile + tablet 三个 viewport 系统 QA / 7 个 issue 文档化（4 个 backlog 复现 + 3 个新发现）/ B1 fix verified
**ATTEMPTED**: gstack browse.exe interactive testing / DOM 验证 + 视觉截图
**RECOMMENDATION**: PM 决定 30 min go M5 前修 vs 推到 M5 batch
