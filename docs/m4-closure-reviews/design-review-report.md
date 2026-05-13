# M4 Closure · Design Review Report (report-only mode)

> **触发**：2026-05-13 M4 closure 4 件套 · 4/4 ⭐ 完结
> **工具**：gstack `/design-review` skill（Phase 1-6 audit only / 跳过 Phase 7+ fix loop / 跳过 outside voices）
> **范围**：Marx M4 demo 主图 / desktop 1280×720 baseline + mobile/tablet 参考 QA report
> **运行**：2026-05-13 (Asia/Shanghai)
> **HARD GATE**：本 report 只评论 + 文档化 / 不改源码 / 不 commit
> **DESIGN.md 状态**：项目暂无 / spec § 7 视觉风格定调充当事实 design system

---

## 1. 总评

| 指标 | 等级 | 解读 |
|---|---|---|
| **Design Score** | **B+** (84/100) | Solid fundamentals + 明确设计观点 / 编辑风站住 / 几个 a11y + responsive 短板 |
| **AI Slop Score** | **A** (95/100) | ⭐ **不是 AI slop** / 11 个 anti-pattern 全部避开 / 自定字体 / brand 鲜明 / 编辑风干净 |

**一句话总结**：M4 demo **设计观点明确**（学术编辑风 + EB Garamond + 米白 + 紫色 brand）/ **不像 vibe coding 通常产出的 AI 通用美学** / 但缺 app title + semantic heading + responsive 不熟 / B+ → A- 距离 = 修 3 个 quick win

---

## 2. Phase 1 · First Impression

**The site communicates** **"学术风思想史 demo"**。serif 字体 + 米白 + 半圆弧 + 时间轴 = 立刻让人知道是知识可视化项目（不是 SaaS / 不是 dashboard / 不是 marketing）。

**I notice**：
- 主图右半的密集弧线（Hegel 区域）形成强视觉锚点 / 视线先到这
- 7 个 person section 沿 45° 斜线下行 / 形成自然的"思想史流"感
- Marx 名字字号比其他人大 1.2x（17px vs 14px）/ 主角地位被字号视觉 encode ✓
- 紫色小圆点（obs dot）反复出现 = brand 标记 / 用户能很快认出"这是这个 demo 的视觉签名"

**前 3 个视觉抓眼点**：1. 主图右上密集弧网 / 2. 紫色 obs 圆点 / 3. 底部时间轴 1830/1850/1870/1880 标记

**预期的设计意图**（spec § 7）：用户应该先看到（1）整体思想流动 → （2）Marx 主角 → （3）时间维度。**实际命中 1+3 / Marx 主角在视觉中心略偏右 / 用户视线第一秒不一定先到他**。

**一个词**：**学术克制**

---

## 3. Page Area Test（PASS / PARTIAL / FAIL）

| 区域 | 2 秒内能命名其用途吗？|
|---|---|
| 左 sidebar (48px 收起) | ❌ 6 个 icon 没 label / 不知道是 nav / 是 filter / 还是 status |
| 主画布 (大区域) | ⚠ 知道是"思想史可视化"但**没标题告诉我** / 推测 from 上下文 |
| 底部 timeline | ✅ 时间轴 + 播放 / 用途清晰 |
| 顶部右 footer 致谢 link | ⚠ 看起来像 brand 位置但实际是致谢 / **位置歧义** |

**Score: PARTIAL** (1.5 / 4 区域明确)

---

## 4. Phase 2 · Inferred Design System（事实 vs spec § 7）

### 4.1 字体（实测 5 family / spec § 7 列 2-3）

| Stack | 用在哪 | spec § 7 对应 | 评价 |
|---|---|---|---|
| `EB Garamond, Georgia, Source Serif 4, Noto Serif SC, serif` | popover claim quote / kicker | ✅ display 字体 | 优 |
| `Source Serif 4, Noto Serif SC, Georgia, serif` | obs text 主画布观点 | ✅ body 字体 | 优 |
| `system-ui, -apple-system, "Helvetica Neue", sans-serif` | UI 组件（sidebar / button / timeline label）| ⚠ spec 未明指 | **AI Slop 嫌疑 #11** 但仅限 UI / 不破坏整体 editorial 调性 |
| `Times New Roman` | SVG `<text>` 默认（未指定 font-family 处）| ❌ leak | 浏览器默认 / 应统一指定 |
| `system-ui, -apple-system, sans-serif` | misc | 同上 |

**建议**：所有 SVG `<text>` 显式设 `font-family: "Source Serif 4", ...`（避免 leak Times New Roman）；UI 层面 system-ui 可保留 / 但**改用 Source Serif 4 也能贯通**。

### 4.2 配色（实测 8 主色 / 8 ≤ 12 阈值 ✓ palette coherent）

| 颜色 | 用途 | spec § 7 |
|---|---|---|
| `#fcfaf6` 米白 | 全局背景 + sidebar 底 | ✅ 主导色 |
| `#5b3a8c` 紫 | kicker 强调 + obs dot + Marx popover edge | ✅ 强调色 1 |
| `#3a2360` 深紫 | hover / pressed | 衍生 |
| `#7a9a5a` 中绿 | agreement 弧 | ✅ 强调色 2 |
| `#b8654a` 红橘 | disagreement 弧 | ✅ 强调色 3 |
| `#a8987a` 米褐 | obs dot 装饰 | 中性 |
| `#2a2a2a` 深炭 | 主文字 + person 名 | 中性 |
| `#888 / #aaa` 灰系 | 次级文字 + tick | 中性 |

**评价**：
- 色彩**温暖一致** (warm dominant + 1 cool 绿 + 中性 灰) ✓
- 紫色 #5b3a8c **不是 default indigo / 是定制 brand 色** → **避开 AI slop #1** ⭐
- agreement 绿 + disagreement 红橘 = 语义色清晰 / 不依赖红/绿单一编码（有 ● dot + 方向区分）✓

**未测**: 对比度（紫色 #5b3a8c on #fcfaf6 米白 ≈ 7.3:1 / 远超 AA 4.5 ✓ 凭经验估算）

### 4.3 字号 scale（6 size）

`9px` / `10px` / `11px` / `14px` / `16px` / `17px`

- ⚠ 9px / 10px 偏小 / skill rule "caption >= 12px"
- 17px 是 Marx 主角专属 / **特殊处理** ⭐ 视觉 encode 主角地位
- 14px 是 person 名字标准
- 16px body / 11px obs text / 9-10px obs-tag italic

**评价**：scale 不严格 perfect-fourth 比例 / 但**编辑风刊物常用 small italic caption** / 9-10px 在 desktop OK / mobile 挑战

### 4.4 Heading hierarchy（**❌ EMPTY**）

`document.querySelectorAll('h1-h6')` → **[]** 0 个 semantic heading

**问题**：
- person name (麦克斯·施蒂纳 / 卡尔·马克思 / ...) 都用 SVG `<text>` 渲染 / 视觉上是"标题"但 DOM 是普通文字
- 屏幕阅读器看 page 没有结构 / 用户跳读"按 H 跳标题"失效
- SEO / 静态 crawler 也读不到内容

**严重度**: HIGH (a11y + structure 双失)

### 4.5 Border-radius

**完全没用 border-radius** ✓ → **避开 AI slop #5 "uniform bubbly radius"** ⭐ 编辑风干净

### 4.6 Touch targets（**全 3 个 fail 44px**）

| 元素 | 实测尺寸 | 44px 标准 |
|---|---|---|
| 致谢 link (denizcemonduygu) | 149×**13** | ❌ height fail |
| 播放按钮 ▶ | 103×**26** | ❌ height fail |
| 时间轴 slider | 971×**16** | ❌ height fail |

**评价**: desktop OK (鼠标精准) / **mobile 用户体验差** / 跟 QA ISSUE-002+005 一致（mobile 整体待优化）

---

## 5. Phase 3 · Design Audit Checklist（10 类）

### 5.1 Visual Hierarchy & Composition · **B**

✅ 主图聚焦清晰 / 7 个 person section 视觉分层
✅ 视线左上→右下流动 ✓ 跟 spec § 6.1 斜向流匹配
✅ Marx 主角字号 emphasis ✓
✅ 时间轴底部 fixed = 独立维度 ✓
⚠ **首屏缺 app title / brand position** = 用户第一眼不知道这是什么
⚠ Page Area Test PARTIAL（1.5/4）

### 5.2 Typography · **A-**

✅ EB Garamond + Source Serif 4 = **editorial 字体明确不 generic** ⭐
✅ Noto Serif SC = CJK 支持 ✓
✅ 字重对比 (700 person + regular obs) ✓
✅ Marx 17px 特殊 emphasis
⚠ **0 semantic h1-h6** → HIGH 影响
⚠ 9-10px obs-tag 偏小 / mobile 挑战
⚠ Times New Roman leak（未指定 font-family 的 SVG text）
⚠ system-ui 是 UI 层主字体 = AI slop #11 嫌疑（但 main canvas 用 serif 救回来）

### 5.3 Color & Contrast · **A-**

✅ Palette coherent (8 colors)
✅ Brand 紫 #5b3a8c 自定 / 避开 default indigo ⭐
✅ 语义色清晰 (绿/红橘 agreement/disagreement)
✅ Warm dominant / 不混搭 
⚠ 未实测对比度（凭经验估 紫 on 米白 ~7:1 / AA ✓）
⚠ 9px obs-tag 在 #aaa 灰底色对比度 borderline

### 5.4 Spacing & Layout · **B+**

✅ Sidebar 48 / 200 / Timeline 140 / 主画布 inset = 系统化
✅ Marx section X 累加沿斜线连续 ✓ spec § 6.1
✅ Sidebar / Timeline / Popover 都 `position:fixed` 独立栏 ✓
⚠ Sidebar 200px 在 mobile 占 53% viewport（QA ISSUE-005 / 应自动 collapse）
⚠ 弧线密集区（Hegel）overlap 重 / 视觉噪音偏高

### 5.5 Interaction States · **B**

✅ Popover 0.35s 滑入滑出（spec § 6.1）✓
✅ Esc / × / 点空白三路关闭
⚠ Hover state 未实测 / 可能 missing 在 obs 上
⚠ Focus-visible ring 未实测 / sidebar 全部不在 ARIA tree (ISSUE-003) → keyboard 用户无 focus
⚠ Touch target 全 < 44px（mobile a11y）
✅ 无 `outline: none` 不做替代的明显问题（凭外观）

### 5.6 Responsive · **D**

❌ Mobile sidebar 不自动 collapse / 占 53% viewport（ISSUE-005）
❌ Mobile popover 380 > 375 viewport / 横向 overflow + 完全遮主图（ISSUE-002）
⚠ Tablet 768 sidebar/timeline bottom 视觉撞色（ISSUE-004）
✅ Viewport meta 标准 `width=device-width`
✅ 主图 SVG 横向 scroll 在 mobile work（虽然不理想）

### 5.7 Content & Microcopy · **B**

✅ Utility language ✓ (没 happy talk / 没 "welcome to..." / 没 marketing fluff)
✅ Button label 具体（▶ 播放思想史 / 不是 "提交"）
✅ 致谢 footer 明确 source
⚠ **App title 缺失** = brand 不在 viewport
⚠ Empty state 未测（filter 全 uncheck 后画面是什么）

### 5.8 AI Slop Detection · **A** ⭐⭐

| Anti-pattern | M4 表现 |
|---|---|
| 1 · 紫色渐变 | ❌ 没用 / brand 紫 #5b3a8c 是 solid 色 |
| 2 · 3-column feature grid | ❌ 没用 / 7 section 是垂直 person |
| 3 · 彩色圆里图标 | ❌ 没用 |
| 4 · 全部 center | ❌ 没用 / 左对齐 + 斜流 |
| 5 · 统一 bubbly radius | ❌ 没用 / 0 border-radius ⭐ |
| 6 · 装饰 blob/wavy SVG | ❌ 没用 |
| 7 · emoji 作为设计元素 | ⚠ ▶ 是功能符 / 不算 emoji 装饰 |
| 8 · 卡片左色边 | ❌ 没用 / popover 紫色边是 blockquote 引用框（不是装饰 card）|
| 9 · "Welcome to..." 套话 | ❌ 没用 |
| 10 · 套路 section rhythm | ❌ 没用 / 独特斜流 layout |
| 11 · system-ui as primary | ⚠ UI 层用 / 但 main canvas EB Garamond 救回 |

**总评**：10.5 / 11 通过 = **明显不像 AI slop / 设计观点明确** ⭐

### 5.9 Motion · **B**

✅ Popover 0.35s 滑入滑出 = intentional
✅ Timeline cursor 跟 slider 同步
⚠ Filter toggle 没 transition / display:none 突变（可加 opacity transition / polish backlog 已记）
⚠ `prefers-reduced-motion` **未检测**（QA 测 `matchMedia` returns false / 但代码层是否 respect 未知）
⚠ Timeline play 期间无 ⏸ button state transition（QA ISSUE-001）

### 5.10 Performance Feel · **B**

✅ Local dev 主图 0.5s 渲染（benchmark report）
⚠ Prod FCP 4.4s（中国 → GH Pages 网络 + Google Fonts 拖累 / 不全 app 责任）
⚠ 无 skeleton loading state（首屏白屏直到 JS 跑完 / domInteractive 1.6s）
✅ App bundle 38KB transfer = 极轻

---

## 6. 6 个关键 findings（按 impact 排序）

### D-001 · 🔴 **首屏缺 app title / brand position**（HIGH）

**Observation**: 用户打开 demo 后 viewport 顶部 = 空（左 sidebar 48px + 右上致谢 link）/ **没有"Marx 思想史"或品牌标题告诉用户这是什么**

**I wonder**: 朋友点开 demo 第一眼如果不读 README / 直接看主图 / 几秒钟内能确定这是"19 世纪 Marxism 思想史可视化"还是"哲学网络图"还是"随便什么"？

**What if**: 顶部加 30-40px 高 header 含 `<h1>Marx · 思想史可视化</h1>` + 副标题 `1818-1883 · 92 条主张 · 31 条思想关系`

**修复**: 5-15 min CSS + HTML / 也 fix D-003 的 h1 缺失

**Impact**: 立竿见影 / 第一秒解决 trunk test "what site is this" / 朋友看 demo 印象分 ↑

---

### D-002 · 🔴 **缺 semantic h1-h6 / 0 heading 在 DOM**（HIGH · a11y + SEO）

**Observation**: `document.querySelectorAll('h1, h2, h3, h4, h5, h6')` 返回 **[]**

**Impact**:
- 屏幕阅读器用户跳读"按 H 跳标题"失效
- person name 视觉上是标题但 DOM 是 SVG text / 不被识别
- 静态爬虫读不到 Marx / Hegel 等关键词

**I think**: 这是 SVG-based 可视化的常见问题 / 不修不影响视觉但损 a11y + SEO

**What if**:
- 选项 A · 加 invisible h1（CSS `visually-hidden`）给 SR 用 + UI 加显式 h1（跟 D-001 一起做）
- 选项 B · person `<g>` 加 `role="heading" aria-level="2"` + SVG `<text>` 标 `aria-label`

**修复**: 跟 D-001 一起 10-15 min

---

### D-003 · 🟠 **Page Area Test PARTIAL (1.5/4)**（MEDIUM-HIGH · UX）

**Observation**: 4 区域只 1 个（timeline）能 2 秒内 nameable / sidebar / 主画布 / footer 都歧义

**Impact**: 新用户第一次 onboarding cost 高 / "学术编辑风"被"不知道是什么"抵消

**I wonder**: 朋友是不是常在 demo 前 30 秒"啊这是什么"然后才理解 / 这本应该 0 秒

**What if**:
- 配 D-001 加 app title
- sidebar 收起态加 hover tooltip 显示 "节点 / 关系 / 学科" 三组
- 主画布顶部 / 底部加 caption "Marx 思想史 · 1818-1883 · 7 哲学家 92 主张"

**修复**: 10-30 min

---

### D-004 · 🟠 **Sidebar collapsed icons 无 ARIA / 无 label**（MEDIUM-HIGH · 与 QA ISSUE-003 重叠）

详见 [QA report ISSUE-003](qa-report.md#issue-003)。本 report 视觉角度补充：

**Visual issue**: ⟩ ● 👤 ↝ ⇋ ⋯ 6 icon 不一致语义
- ⟩ = 展开（OK，方向符号）
- ● = 节点类型？还是 dot？
- 👤 = 人物（OK，但太通用 / 也可能指 user account）
- ↝ ⇋ ⋯ = 关系类型？学科？unclear

**What if**: 收起态保留 icon + 加 `<title>` SVG / `aria-label` "展开筛选栏" / hover tooltip

---

### D-005 · 🟡 **Times New Roman leak 在 SVG text**（MEDIUM · 一致性）

**Observation**: 实测 5 个 font-family / `Times New Roman` 出现 = 浏览器默认 / 哪个元素没显式 font-family 就 fall back 到 Times

**Impact**: 编辑风一致性受损 / 个别 SVG text 用 Times 而不是 EB Garamond / Source Serif 4

**What if**: 全局 CSS `svg text { font-family: "Source Serif 4", "Noto Serif SC", Georgia, serif; }` 兜底

**修复**: 1-2 行 CSS

---

### D-006 · 🟡 **Responsive design failure (D 等级)**（MEDIUM · 与 QA 重叠）

详见 [QA report ISSUE-002 + 004 + 005](qa-report.md)。本 report 视觉角度补充：

**Responsive 设计意图不明确**：
- desktop 极佳（编辑风站住）
- mobile **没设计** / 不是"design failed mobile" 是"未触达 mobile"
- 应该决定：A · desktop-only demo（明示朋友用大屏看）/ B · mobile 重设计

**What if**:
- 选项 A · viewport meta + landing 注明 "推荐桌面端 / 最佳浏览体验" + mobile UX 不投入
- 选项 B · M5 主线 B（页面框架）重设计 mobile responsive layout

---

## 7. Quick Wins（< 30 min 每个 / impact 最大）

| # | 操作 | 时间 | 解决的 finding | 影响 |
|---|---|---|---|---|
| 1 | 加 `<header><h1>Marx · 思想史可视化</h1><p>1818-1883 · 92 主张 · 31 关系</p></header>` | 15 min | D-001 + D-002 | first impression ⭐⭐⭐ + a11y |
| 2 | sidebar icons 加 `aria-label` + `<title>` SVG | 10 min | D-004 (= QA ISSUE-003) | a11y ⭐⭐ |
| 3 | 全局 SVG text font-family 兜底 CSS | 2 min | D-005 | 一致性 ⭐ |

**3 个 quick win 共 ~30 min → Design Score B+ → A-（90+）**

---

## 8. 优点 / 应该保留（don't fix what's working）

⭐ **AI Slop A 级 / 不像 vibe coding 通常产出**
- 自定 brand 紫 #5b3a8c（不是 default indigo / 不是渐变）
- EB Garamond + Source Serif 4 + Noto Serif SC 字体明确（不用 Inter / Roboto）
- 0 border-radius（不 bubbly）
- 左对齐 + 斜流 layout（不 centered everything）
- 无 happy talk / 无 marketing fluff（utility 语言）
- 无 3-column feature grid / 无装饰 blob

⭐ **设计观点明确**
- 学术编辑风一致从 brainstorm v7 mockup 贯穿到 T9 popover
- Marx 17px 主角字号 = 视觉 encode 历史人物分量
- 半圆弧绿/红橘 brand 标记 + 起止圆点 = denizcemonduygu 借鉴 + 自定颜色 = 视觉签名

⭐ **三件套（AGENTS.md）的工程化实战**
- brainstorming + spec 视觉风格定调 + 实现期双 skill 召唤
- M4 没有犯 generic AI slop 的痕迹

---

## 9. baseline (regression mode 用)

`design-baseline.json`:

```json
{
  "date": "2026-05-13",
  "url": "http://localhost:5175/marx/",
  "milestone": "M4 closure",
  "designScore": "B+",
  "designScoreNumber": 84,
  "aiSlopScore": "A",
  "aiSlopScoreNumber": 95,
  "categoryGrades": {
    "visualHierarchy": "B",
    "typography": "A-",
    "color": "A-",
    "spacing": "B+",
    "interaction": "B",
    "responsive": "D",
    "content": "B",
    "aiSlop": "A",
    "motion": "B",
    "performance": "B"
  },
  "findings": [
    {"id": "D-001", "title": "缺 app title / brand", "impact": "high", "category": "visual-hierarchy"},
    {"id": "D-002", "title": "缺 semantic h1-h6", "impact": "high", "category": "accessibility"},
    {"id": "D-003", "title": "Page Area Test PARTIAL", "impact": "medium-high", "category": "ux"},
    {"id": "D-004", "title": "Sidebar icons no ARIA (= QA-003)", "impact": "medium-high", "category": "accessibility"},
    {"id": "D-005", "title": "Times New Roman leak in SVG", "impact": "medium", "category": "typography"},
    {"id": "D-006", "title": "Responsive D grade (= QA mobile/tablet)", "impact": "medium", "category": "responsive"}
  ],
  "trunkTest": "PARTIAL (1.5/4)",
  "antiPatternsPassed": "10.5/11",
  "designSystemReference": "spec § 7 (M2) 视觉风格定调 + AGENTS.md 三件套"
}
```

---

## 10. 跟 health/benchmark/qa 交叉

- D-002 (h1-h6 missing) **跟 QA ISSUE-003 (sidebar a11y) 共同主题 = a11y 总体短板** / 跟 PM 0 代码受众无关但跟"学术 demo 给老师/研究者看"目标关键
- D-006 (responsive) **跟 QA ISSUE-002+004+005 共同主题 = mobile/tablet 未触达**
- D-005 (Times New Roman leak) **跟 benchmark report § 3 F2 Google Fonts 复杂性 联动 / 都是字体管理问题**
- D-001 (app title) 不在 QA report / 这是 design-review 专属 catch ⭐

---

## 11. M5 启动期视角推荐

### M5 主线 A (zoom + 可探索)：
- 加 zoom 时 D-001 app title 是否随 zoom 一起 / 还是 fixed header / 决定 design system 走向

### M5 主线 B (页面框架 + 地理图副视图)：
- header 加完 (D-001) 后 / 副窗口 mini-map 怎么和 header 并存 / 这是设计大决策

### M5 主线 C (多类型详情页)：
- 现 popover 是 ClaimNode 专用 / person/work 详情页要保持 hybrid 配色一致 / D-005 (字体 leak) 提前修

### M5 brainstorm 时 design review 必带 3 个 input：
1. **decide responsive strategy** (D-006 选项 A vs B = desktop-only 还是 mobile 重设计)
2. **app title 加在哪 layer** (header 内？画布上方？SVG 内文字？)
3. **trunk test FAIL 接不接受** (academic prototype 容忍 / 公开发布前必须解决)

---

## 12. DESIGN.md 创建建议

⚠ Marx 项目暂无 DESIGN.md / 当前 design system 散落在：
- `specs/2026-05-07-marx-star-map-design.md § 7` 视觉风格定调
- `AGENTS.md` 三件套 + 万能打底提示词
- 实现层 `src/main.ts` CSS variables + 颜色硬编码

**recommendation**: M5 启动期由 `gstack /design-consultation` 生成正式 `DESIGN.md` 合并以上三处 / 锁住 brand 紫 #5b3a8c + EB Garamond + 米白 + 0 border-radius + 编辑风 4 类规则 / 防 M5 后续 polish 时风格漂移

---

**STATUS**: DONE
**REASON**: Phase 1-6 audit 完成 / Phase 7+ fix loop 按 report-only 模式跳过 / 6 个 finding + 3 个 quick win 文档化 / Design B+ / AI Slop A（明显不像 AI slop）/ 跟 QA / health / benchmark 交叉印证
**ATTEMPTED**: gstack `/design-review` Phase 1-6 / 字体颜色 heading 触摸目标 4 维 extract / SVG 实测配色 / desktop screenshot first impression
**RECOMMENDATION**: 3 个 quick win 共 30 min → Design A- / 跟 health + qa 推荐合并 = go M5 前总 60 min 修整 cycle / PM 拍板时机
