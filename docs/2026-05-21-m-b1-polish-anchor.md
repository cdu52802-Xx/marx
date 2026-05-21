# M-B1 polish 阶段进展 · 新窗口续接锚点（2026-05-21 晚 · ship 后 PM 反馈 polish）

> **状态**：B1 Stage 1-5 全 ship（HEAD 之前 db5a90b takeaway）/ ship 后 PM prod 实测反馈 "low / 没高级感" / 进入 polish 修订阶段 / **5/6 batch ship · D2 待做**
> **当前 HEAD**：`6fc4485 style(M-B1 polish B6 DR-095)`（2026-05-21 晚）
> **Git**：clean / origin/main 同步
> **Prod**：https://cdu52802-xx.github.io/marx/
> **关联**：
> - [B1 takeaway](./2026-05-21-m-b1-takeaway.md)（ship 时点 8 section / DR-078~087 落档）
> - [progress-anchor 历史档](./2026-05-20-m-b1-progress-anchor.md)（Stage 1-5 实施期 SSOT）
> - [spec § 10](../specs/2026-05-20-m-b-mainline-design.md)（DR-070~094 决策清单）

---

## 1. PM ship 后反馈 + polish 路径

### 1.1 PM 反馈（2026-05-21 晚）

ship 后 PM prod 实测："1. 搜索入场动效没看到；2. 详情卡飞入飞出消失；3. 网页 low / 没高级感 / 不留人 / 不吸引继续用。"

### 1.2 反馈分类 + 修法

| 层 | 反馈具体 | 根因 | 修法 |
|---|---|---|---|
| **regression** | 详情卡 slide 飞入飞出消失 | DR-088 加的全局 `*` `@media (prefers-reduced-motion: reduce)` 规则 / **Win10 默认 reduce-motion** / 把详情卡 inline transition 也 kill | revert DR-088（5345810）|
| **看不到 fade** | 搜索浮窗入场没看到 | 同上 + PM Win10 reduce-motion 状态 | DR-089 重做 / 去掉全局 `*` 规则 / 保留 popover entry animation 无条件激活 |
| **design ambition** | "low / 没高级感 / 不留人" | editorial-academic 风格本身静谧 / 缺细节动效 + hover 反馈 / 不像 letter-spacing 这种 "AI Slop" 套路 | PM 跟 AI 谈方向（Q1=视觉表面 / Q2=NYT 杂志风继续）→ 启 polish buffet 6 batch |

### 1.3 PM Q2 自由回答（极重要 · design ambition）

> "高级感更多是动态效果、细节部分... 政府学校网站 low 因为排版简陋字体单一像 excel / 没细节动效；
> 配色字体大方向不改 / 但细节飞入飞出、按钮变化、悬停点击要流露用心和巧思 / 不要实用主义；
> 基础 UIUX 准则（行间距 / 文字超出范围 / 紧贴边缘）你也要主动 audit / 不能只盯 PM 强调的点。"

---

## 2. polish 6 batch 累积成果（6/7 done）

### Audit · 全网页 UIUX 基础违规（PM 没提的 8 项）

D13 header link 紧贴 / D14 chip 紧贴 / D15 H2 line-height 偏挤 / D16 全局 focus-visible 缺失 / D17 Entfremdung 紧贴 H2 / D19 metadata→正文 间距 / D20 副标题 11→12px / D18 metadata 拆行（入 backlog）

### Batch 完整时间表

| Batch | DR | commit | 内容 | PM 拍 |
|---|---|---|---|---|
| **D1** | DR-089 | `08c9ffc` | search popover 180ms fade+translateY entry（无全局 reduced-motion）| ✅ 留 |
| **B5** | DR-090 | `a18e89a` | header link padding + chip padding + 全局 `:focus-visible` halo + 副标题 11→12px | ✅ 留 |
| **B2** | DR-091 | `5a429c0` | 文字类 hover letter-spacing 舒展 4 处（chip/claim-item/search-item/header-link）| ⚠ 改成 B6（PM 反馈 low + layout 抖）|
| **B3** | DR-092 | `2d7fc0f` | button 类 hover scale + glow 4 处（zoom + sidebar icon + tl-play + 详情卡 ×）| ✅ 留（PM 一开始没看到 / cache 问题 / 硬刷新后认可）|
| **B4** | DR-093 | `3c1727a` | 详情卡 hierarchy（H2 line-height 1.2→1.35 / Entfremdung 间距 2→8px / CTA hover bg 反相+letter-spacing+微浮）| ✅ 留 |
| **D9** | DR-094 | `0046c88` | obs 紫圈 spring scale 0.5→1.2→1.0 / 220ms cubic-bezier spring 缓动 / obs click + search 路径 2 处调 | ✅ 留 |
| **B6** | DR-095 | `6fc4485` | **撤 B2 letter-spacing → underline draw-in + left border slide-in**（chip ::after scaleX / claim-item ::after scaleY / header-link ::after scaleX · 28ms cubic-bezier）| ✅ 留 |

### Bundle 累积变化

| commit | JS gzip | CSS gzip | 备注 |
|---|---|---|---|
| c42eee8 baseline | 34.42 KB | 1.72 KB | DR-088 前 |
| 097d91b DR-088 | 34.42 KB | 1.78 KB | 引入全局 reduced-motion 规则 / regression |
| 5345810 revert | 34.42 KB | 1.72 KB | 撤 DR-088 |
| 08c9ffc D1 | 34.42 KB | 1.78 KB | DR-089 重做 / 不加全局规则 |
| a18e89a B5 | 34.42 KB | 1.83 KB | padding + focus + 字号 |
| 5a429c0 B2 | 34.42 KB | 1.85 KB | letter-spacing hover（后撤）|
| 2d7fc0f B3 | 34.42 KB | 2.03 KB | button hover scale + glow |
| 3c1727a B4 | 34.43 KB | 2.05 KB | 详情卡 hierarchy + CTA |
| 0046c88 D9 | 34.50 KB | 2.15 KB | obs spring · JS +0.08 |
| **6fc4485 B6** | **34.50 KB** | **2.29 KB** | letter-spacing → underline draw-in |

**Bundle 状态**：JS 34.50 KB / ≤35 KB 预算 · **剩 0.5 KB**（D2 实施前注意）

---

## 3. D2 待做（最后 1 项 polish buffet）

### 3.1 任务

**D2 · search popover 退场动效**

- 当前：popover hide() 直接 remove element / "啪"消失
- 提议：120ms fade + translateY(-2px) up exit · 出快入慢（M5 DR-046 lesson 复用 / 入 180ms / 出 120ms）

### 3.2 风险

- 必须改 JS（`src/components/search-result-popover.ts` hide() 函数）/ 不是纯 CSS
- 风险点：race condition / `_createPopover` 内同步 hide() 创建新 popover 时 / exit 动画 + 新 popover create 同帧 / 双 popover 短暂同时存在 → 影响 e2e spec 4 expect concept count = 1 测试
- Bundle 预算：JS 当前 34.50 KB / 剩 0.5 KB / D2 估 +0.05-0.1 KB / 应 OK

### 3.3 推荐实施方案

**两路径分流**：
- `_hideImmediate()`（同步立即 remove · 内部 _createPopover 用 / 不动画）
- `hide()`（外部 Esc / outside click / onSelect 调 · 走 exit 动画 path）

```typescript
// search-result-popover.ts
function hide(opts?: { immediate?: boolean }): void {
  if (!currentPopover) return;
  const popoverToRemove = currentPopover;
  currentPopover = null;
  // ...detach listeners

  if (opts?.immediate) {
    popoverToRemove.remove();
    return;
  }
  // exit 动画
  popoverToRemove.classList.add('popover-closing');
  setTimeout(() => popoverToRemove.remove(), 140); // 120ms + 20 buffer
}

function _createPopover(): HTMLElement {
  hide({ immediate: true }); // 同步立即清旧 popover
  ...
}
```

CSS:
```css
@keyframes search-popover-exit {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-2px); }
}
.search-result-popover.popover-closing {
  animation: search-popover-exit 120ms ease-in forwards;
  pointer-events: none;  /* 退场期间不接受 click */
}
```

### 3.4 PM checkpoint

- AI commit + push
- PM Ctrl+F5 → 实测 search popover 关闭时 fade out + slide up（Esc 关 / 点候选关 / 点空白关）
- PM 拍板 留 / 调 / 撤

### 3.5 D2 done 后 → ship 流程

1. D2 ship 后 prod 部署完
2. PM prod 实测 polish buffet 全验收（D1+B5+B3+B4+D9+B6+D2）
3. PM 拍 `go tag` → AI 打 tag `m-b1-final` + push --tags
4. 更新 takeaway 加 § "polish 7 batch lessons + DR-088 教训" 段
5. archive M-B1 plan / spec 可选
6. 等 PM 拍 `go B2` 启动副图地理图

---

## 4. 新窗口续接 step（按顺序 · 30 秒重建）

```bash
1. cd F:\AI\projects\Marx
2. git pull origin main           # 应 HEAD = 6fc4485
3. 读 docs/2026-05-21-m-b1-polish-anchor.md   # 你正在读
4. 读 AGENTS.md                   # 项目级 agent context
5. 跳读 spec § 10 DR-088~095（决策追溯 / 最新 DR-095）
6. memory 自动加载（含 m-b1-polish-completion ⭐⭐⭐ + 新 lessons）
7. PM 已说 "B6 留" → 立即启 D2 实施
   · D2 用 § 3.3 推荐方案 · `_hideImmediate()` 分流 + 120ms exit
   · 不破 Bundle ≤35 KB（剩 0.5 KB · 估 +0.05-0.1 KB）
   · 不破 e2e 4 spec（特别 spec 4 chip 切换 / 用 _hideImmediate）
   · atomic commit + push + PM Ctrl+F5 看 → 拍 留/调/撤
8. D2 ship 后 PM 拍 `go tag` → 打 m-b1-final tag
```

---

## 5. 重要教训 + lessons（这次 polish 阶段累积）

### 5.1 ⚠ DR-088 Windows 10 默认 reduce-motion 教训

**事件**：DR-088 加全局 `@media (prefers-reduced-motion: reduce) * { transition-duration: 0.01ms !important }` 顺手修 design-review Finding 3 / 但 **Win10 系统默认开启"减少动画效果"** / Chrome/Edge 检测后 `prefers-reduced-motion: reduce` 返回 true / 全局规则激活 / 把详情卡 inline transition / 所有 hover transition 都 kill / 用户体验崩溃。

**教训**：
1. **检测平台默认值**：Windows 10/11 默认 prefers-reduced-motion: reduce (与 macOS 默认 no-preference 不同) / 在 Windows 用户做 motion polish 前必须先测
2. **不用全局 `*` 规则**：reduced-motion 应针对装饰性动画（如 search popover fade）/ 不包装"essential motion"（如详情卡 slide / hover 反馈）
3. **PM 优先于 WCAG AAA**：PM 自由意志想看动效 / 严格 WCAG 让 reduce-motion 用户看不到 fade-in / 应让 PM 决定 trade-off

### 5.2 ⚠ design-review skill 评分 ≠ PM 主观感受

**事件**：B1 ship 前 design-review 跑出 **A-** + AI Slop **A** / 我认为是 ship-ready / PM 实测后说 "low / 没高级感"。

**教训**：
1. **skill rubric 是参考 / 不是绝对**：design-review 用 weighted rubric（visual hierarchy 15% / typography 15% / ...） / 不 capture "细节用心 / 高级感 / 留人" 这种主观感受
2. **PM 主观感受 = ground truth**：再高的 letter-grade 都没 PM 一句"low"分量重
3. **审视风格根本假设**：editorial-academic 风是 PM 早期 brainstorm 时选的 / 但实际用过后 PM 觉得"静谧 ≠ 高级感" / 应在 ship 前 PM 实测时 question 这个假设

### 5.3 ⚠ letter-spacing hover 在紧凑元素上看着 low + 撑 layout

**事件**：B2 给 chip / claim-item / search-item / header-link 加 letter-spacing 0.02 → 0.04-0.06em hover 展开。
PM 反馈 "弹得 low / 没设计感 / 搜索浮窗跟着加宽别扭"。

**教训**：
1. **letter-spacing 在紧凑 inline 元素上视觉是"被推开"** / 不优雅 / 偏 SaaS 套路（"AI Slop"中容易出现的微动效）
2. **任何影响 layout 字段的 hover effect 都会撑 container** / popover 这种 dynamic width 容器会跟着抖
3. **editorial 杂志风的优雅 hover = underline draw-in + left border slide-in**（B6 修订方向）
   - `::after` absolute 定位 + scaleX/scaleY transform / 不破 layout
   - 走 GPU 合成 / 28ms cubic-bezier(0.4, 0, 0.2, 1) "标准 material" 优雅曲线
   - 视觉是"画出来"的动效 / 不是"被推开"

### 5.4 polish buffet 7 batch atomic 顺序 B 流程（lessons）

**事件**：PM 选 "全部做 + 顺序 B 一个个" / 我列 5 batch 后实施 / 又 hotfix B6（PM 不喜欢 B2）。

**教训**：
1. **CSS-only batch 低 risk 一波多 D**（B5 4 项 / B3 4 项）/ 每 batch 1 commit / PM 1 次实测拍板 / 节省 PM 时间
2. **JS 改动单 D 单 commit**（D1 entry / D9 spring 各 1 commit）/ 风险隔离 / 易 revert
3. **GH Pages CDN cache 5-10 分钟刷新** + Win10 浏览器 cache 顽固 / 教 PM Ctrl+F5 + DevTools Network "Disable cache" + Application Storage clear
4. **PM "看不到效果" 不等于 CSS 没生效**：先用 browse hover + css 命令查 computed style 验证 / 数据说话 / 然后让 PM 排查 cache

### 5.5 主动 audit ≠ 等 PM 列违规

**事件**：PM 补丁说 "基础 UIUX 准则你也要主动 audit / 行间距 / 紧贴边缘 / 不能只盯 PM 强调的点"。

**教训**：
1. **PM 列的是 D-buffet 12 项**（飞入飞出 / hover 等显式动效）/ 我用 browse JS audit 出 8 项 PM 没提的基础违规（D13-D20）
2. **audit 工具链**：browse + JS 测 text overflow / line-height ratio / padding 紧贴 / focus-visible rules
3. **作为资深 UIUX 视角**：不只做 PM 强调的 / 主动查 PM 视野盲区

---

## 6. spec § 10 决策清单（DR-088~095 这次新增）

| DR | 决策 | 状态 |
|---|---|---|
| **DR-088** | DR-079 polish 落地方案 A · search popover 180ms fade + 全局 `*` reduced-motion 兜底 | **❌ revert** (5345810) |
| **DR-089** | DR-088 重做 / 不加全局 reduced-motion · 只 search popover entry animation | ✅ ship 08c9ffc |
| **DR-090** | B5 基础修正 · header link padding + chip padding + 全局 :focus-visible halo + 副标题 11→12px | ✅ ship a18e89a |
| **DR-091** | B2 letter-spacing hover 4 处 | ⚠ 后撤 / B6 修 |
| **DR-092** | B3 button hover scale + glow 4 处 | ✅ ship 2d7fc0f |
| **DR-093** | B4 详情卡 hierarchy + CTA hover | ✅ ship 3c1727a |
| **DR-094** | D9 obs 紫圈 spring 220ms | ✅ ship 0046c88 |
| **DR-095** | B6 撤 B2 letter-spacing · 改 underline draw-in + left border slide-in | ✅ ship 6fc4485 |
| DR-096 | D2 search popover exit 120ms fade + translateY up | ⏸ 待做（D2 实施期落档）|

---

## 7. backlog（B1 累积 / 给 B2）

| 来源 | 内容 | 处理 |
|---|---|---|
| 已有（pre-polish）| Stage 1 PM #2 ↔ 互换按钮设计感 / Stage 1 PM #3 关于 link modal 内容 / Stage 3 PM max 4 组人物 / Stage 3 PM keywords 命中不高亮 / Stage 4 challenge filter chip DR-083 / DR-085 focus mode + search corner case | 沿用既有 backlog |
| **新增** | D18 metadata 拆行重设计（risky · 改信息层级）| 入 backlog · 单独 mockup checkpoint |
| **新增** | `e2e/deploy.spec.ts` M2 obsolete 5 fail | B2 cleanup（PM Q3 B 拍板 backlog 不动）|
| **新增** | M5 backlog 残留 · DR-069 弧线误选 / B3 mobile popover / B4 tablet sidebar / Focus popover 焦点回中心 | B2/B3 整合 |

---

## 8. 跨窗口续接简单确认句

> "M-B1 polish 阶段 6/7 batch ship · HEAD 6fc4485 · D1+B5+B3+B4+D9+B6 全 PM 留 · 等做 D2 search popover exit 动效 · 不破 Bundle ≤35 KB（剩 0.5 KB）· D2 done 后 PM 实测 + 拍 `go tag` → m-b1-final"
