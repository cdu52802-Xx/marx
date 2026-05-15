// M4 T6 主入口 · claim-on-timeline 主 view
// 重写自 M2 简版 21 行 renderRelations · 落地 spec § 4-5 视觉风格 + layout 规范
// M3 阶段末状态已存档到 public/m3-archive/ + git tag m3-final，无 backup 需要
//
// 数据流：
//   claims.json (92 claim + 31 relation) + nodes_skeleton.json (34 person)
//   → filter 有 claim 的 person (≈ 27 个)
//   → computePersonSectionPositions (斜向流坐标)
//   → SVG 渲染（弧线层 + person section 标题 + obs 行）
//
// 视觉硬约束（spec § 4 / § 5.4）：
//   - 米白 #fcfaf6 暖底
//   - EB Garamond / Georgia serif 字体（claim_text italic）
//   - person 标题 sans-serif bold uppercase + letter-spacing 0.6
//   - 紫 #5b3a8c 主导色（Marx 主节点强化）
//   - 绿弧 agreement 左下 / 红弧 disagreement 右上 / 灰弧 extends 微弯右

import './styles.css';
import * as d3 from 'd3';
import claimsData from './data/claims.json';
import nodesData from './data/nodes_skeleton.json';
import {
  computePersonSectionPositions,
  generateArcPath,
  getArcStyle,
  type PersonSection,
  type ClaimWithCoords,
} from './components/claim-layout.ts';
import { mountTimeline } from './components/timeline.ts';
import { mountSidebar } from './components/sidebar.ts';
import { createZoom } from './viz/zoom.ts';
import { mountZoomControl, updateZoomDisplay } from './components/zoom-control.ts';
import {
  computeCenterTransform,
  flyToTarget,
  chooseTargetK,
  pixelToViewBox,
} from './viz/center.ts';
import { showClaimPopover } from './components/claim-popover.ts';
import { applyClaimFilters } from './components/apply-claim-filters.ts';
import type { ClaimNode, ClaimRelation } from './types/Claim.ts';
import type { PersonNode } from './types/Node.ts';

console.log('[Marx M4] entry · claim-on-timeline');

// === 1. 数据加载 ===

const claims = claimsData.claims as ClaimNode[];
const relations = claimsData.relations as ClaimRelation[];
const persons = nodesData.nodes.filter(
  (n: { type: string }) => n.type === 'person',
) as PersonNode[];

console.log(
  `[Marx M4] loaded ${claims.length} claims / ${relations.length} relations / ${persons.length} persons total`,
);

// === 2. 按 person 分组 claim ===

const claimsByAuthor = new Map<string, ClaimNode[]>();
for (const c of claims) {
  if (!claimsByAuthor.has(c.author_id)) claimsByAuthor.set(c.author_id, []);
  claimsByAuthor.get(c.author_id)!.push(c);
}

// claim id 索引 (filter / 详情栏 lookup 用)
const claimById = new Map<string, ClaimNode>(claims.map((c) => [c.id, c]));

// === 3. 构建 person section input（只显示有 claim 的 person） ===

const personInputs = persons
  .filter((p) => claimsByAuthor.has(p.id))
  .map((p) => ({
    id: p.id,
    name_zh: p.name_zh,
    name_orig: p.name_orig,
    birth_year: p.birth_year,
    death_year: p.death_year,
    claims: claimsByAuthor.get(p.id)!,
  }));

const sections = computePersonSectionPositions(personInputs);

console.log(`[Marx M4] rendering ${sections.length} person sections`);

// === 4. 计算画布尺寸（动态: 根据所有 obs 坐标 + 估算 claim_text 像素长度 / "无限画布"雏形）===
// 2026-05-12 PM 反馈: 画布要无限, 不能限制宽度导致 Engels 等 section 视觉换行
// 当前实现 = 动态算最大像素宽 + 浏览器横向 scroll (真无限画布 = T7+ 用 d3.zoom pan 实现)

const lastSection = sections[sections.length - 1];

// claim_text 最长估算: 50 汉字 × 12px ≈ 600px + tag 60px + 头像 30px buffer
const MAX_CLAIM_TEXT_PX = 700;
let maxObsX = 0;
for (const s of sections) {
  for (const c of s.claims) {
    if (c.x > maxObsX) maxObsX = c.x;
  }
}
const canvasWidth = Math.max(1400, maxObsX + MAX_CLAIM_TEXT_PX);
const canvasHeight = lastSection ? lastSection.y + lastSection.claims.length * 22 + 120 : 1500;

console.log(`[Marx M4] canvas ${canvasWidth} × ${canvasHeight} px (maxObsX = ${maxObsX})`);

// === 5. SVG 容器 ===

const app = d3.select<HTMLDivElement, unknown>('#app');
if (app.empty()) {
  console.error('[Marx M4] #app 容器未找到，渲染中止');
  throw new Error('#app missing');
}

// M5 Stage 1 PM checkpoint Issue #1 + #5 修：fit-to-content 默认
// 改造：#app overflow auto → hidden / SVG 100% fill #app / viewBox 保 content 范围 / preserveAspectRatio fit
// 结果：k=1 等价 fit-to-content（SVG viewBox auto-fit 到 element）/ user 看到全部观点 + 连线
// 屏幕坐标 padding 保留（给 fixed sidebar / header / timeline 留视觉空间）
app
  .style('overflow', 'hidden') // 不再用浏览器 scroll / d3.zoom 唯一负责 pan/zoom
  .style('width', '100vw')
  .style('height', '100vh')
  .style('padding-top', '70px')
  // PM R4 Fix · DR-051 · timeline 再瘦身（单行 + floating badge）100px → 60px (新 timeline 高 ~48px + 12px buffer)
  .style('padding-bottom', '60px')
  .style('padding-left', '48px')
  .style('box-sizing', 'border-box');
document.documentElement.style.overflow = 'hidden';
document.body.style.margin = '0';
document.body.style.background = '#fcfaf6';

const svg = app
  .append('svg')
  .attr('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`)
  .attr('width', '100%') // 自适应 #app 容器 / fit-to-viewport
  .attr('height', '100%')
  .attr('preserveAspectRatio', 'xMidYMid meet') // 内容居中 + letterbox / fit-to-content default
  .style('font-family', "'EB Garamond', Georgia, 'Source Serif 4', 'Noto Serif SC', serif")
  .style('background', '#fcfaf6')
  .style('display', 'block');

// M5 T1 · zoom-layer 包裹所有画布内容（弧线 + person + obs + 米白纸 rect）
// spec § 5.2 屏幕坐标 vs 画布坐标分层：zoomLayer 内部 = 画布坐标（跟 zoom 一起变）
// 屏幕固定元素（sidebar / 详情卡 / 缩放控件 / 时间轴）保持在 svg 外或 svg 根下不进 zoomLayer
const zoomLayer = svg.append('g').attr('class', 'zoom-layer');

// 米白纸感背景 rect (spec § 4.1) · 进 zoomLayer 跟 zoom 一起缩放
zoomLayer
  .append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', canvasWidth)
  .attr('height', canvasHeight)
  .attr('fill', '#fcfaf6');

// M5 T1 · 注册 D3 zoom behavior 到 svg root
// scaleExtent [1, 8] PRD V1 设定
// T2 会加 contentBBox option → translateExtent pan clamp
// onZoom 回调给 T3 zoom-control + T6 timeline 范围条同步用
// T3 · zoomControlEl 先声明 / onZoom callback 闭包引用 / 在 createZoom 后 mount 赋值
let zoomControlEl: HTMLElement | null = null;

const zoomCtrl = createZoom(svg, {
  scaleExtent: [1, 8],
  // T2 · pan boundary clamp 到 content + 5% padding（user 不能拖到全空白）
  contentBBox: { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
  onZoom: (t) => {
    // T3 · 同步缩放控件比例 display
    if (zoomControlEl) updateZoomDisplay(zoomControlEl, t.k);
    // M5 Stage 3 R1 vision pivot (DR-042)：时间轴 ≠ 画布 viewport navigator
    //   不再反向同步 timeline.setCursor / 画布跟时间轴解耦
    //   onZoom 仅更新 zoom-control 比例 display
  },
});

// T3 · mount 左下缩放控件 + 接到 zoomCtrl
// Stage 2 R3 Issue #1 修：删 onPanModeChange + 小手 button + setOutsideClickGuard
//   原因：PM 实测后反馈光标 drag 已能 pan / explicit pan mode 多余
//   d3.zoom drag = pan / click = mouse 不移动时触发 / 天然分离
//   单击空白 → click 触发 → popover outside listener 关详情卡
//   拖动空白 → mouseup 后 click 不触发（因为 mouse moved）→ 不关详情卡
// PM R4 DR-051 · timeline 单行后 ~48px / zoom-control 默认 bottom 180px 离 timeline 太远
//   改 bottom 70px (timeline 48 + 22px gap) / 跟 timeline 顶端贴近
zoomControlEl = mountZoomControl({ zoomController: zoomCtrl, position: { left: 60, bottom: 70 } });

// === 6. 弧线层（在节点之前画，z-order 在底）===

const claimIdToCoords = new Map<string, { x: number; y: number }>();
for (const s of sections) {
  for (const c of s.claims) {
    claimIdToCoords.set(c.id, { x: c.x, y: c.y });
  }
}

// 只画 source / target 都在画布上的 relation
const visibleRelations = relations.filter(
  (r) => claimIdToCoords.has(r.source) && claimIdToCoords.has(r.target),
);

console.log(
  `[Marx M4] rendering ${visibleRelations.length} / ${relations.length} arcs (both ends visible)`,
);

zoomLayer
  .append('g')
  .attr('class', 'arc-layer')
  .selectAll('path.arc')
  .data(visibleRelations)
  .join('path')
  .attr('class', (r) => `arc arc-${r.type}`)
  .attr('d', (r) => {
    const s = claimIdToCoords.get(r.source)!;
    const t = claimIdToCoords.get(r.target)!;
    // 圆点中心微调：obs 圆点 cy=-3，弧线连接到圆点位置
    return generateArcPath(s.x, s.y - 3, t.x, t.y - 3, r.type);
  })
  .attr('fill', 'none')
  .each(function (r) {
    const style = getArcStyle(r.type);
    const sel = d3.select(this);
    sel
      .attr('stroke', style.stroke)
      .attr('stroke-width', style.strokeWidth)
      .attr('opacity', style.opacity);
    if (style.dasharray !== 'none') {
      sel.attr('stroke-dasharray', style.dasharray);
    }
  });

// === 7. Person section 标题 + obs 行 ===

const sectionG = zoomLayer
  .selectAll<SVGGElement, PersonSection>('g.person-section')
  .data(sections)
  .join('g')
  .attr('class', 'person-section')
  .attr('transform', (s) => `translate(${s.x},${s.y})`);

// 7.1 person 圆形头像占位
sectionG
  .append('circle')
  .attr('class', 'person-avatar')
  .attr('cx', 8)
  .attr('cy', -5)
  .attr('r', (s) => (s.id === 'wd-q9061' ? 11 : 9))
  .attr('fill', (s) => (s.id === 'wd-q9061' ? '#5b3a8c' : '#d8cab0'))
  .attr('stroke', (s) => (s.id === 'wd-q9061' ? '#3a2360' : '#a8987a'))
  .attr('stroke-width', 1);

// 7.2 person 标题（中文名 uppercase + sans-serif bold）
sectionG
  .append('text')
  .attr('class', 'person-name-zh')
  .attr('x', 28)
  .attr('y', 0)
  .attr('font-family', "system-ui, -apple-system, 'Helvetica Neue', sans-serif")
  .attr('font-size', (s) => (s.id === 'wd-q9061' ? 17 : 14))
  .attr('font-weight', 700)
  .attr('fill', '#2a2a2a')
  .attr('letter-spacing', 0.6)
  .text((s) => s.name_zh.toUpperCase());

// 7.3 原文名 + 生卒年（次要 sans-serif 灰）
sectionG
  .append('text')
  .attr('class', 'person-meta')
  .attr('x', 28)
  .attr('y', 14)
  .attr('font-family', 'system-ui, -apple-system, sans-serif')
  .attr('font-size', 10)
  .attr('fill', '#888')
  .text((s) => `${s.name_orig ?? ''} · ${s.birth_year}–${s.death_year ?? ''}`.trim());

// 7.4 obs 行（每条 claim 一行）
sectionG.each(function (section) {
  const g = d3.select(this);
  const obsG = g
    .selectAll<SVGGElement, ClaimWithCoords>('g.obs')
    .data(section.claims)
    .join('g')
    .attr('class', 'obs')
    .attr('data-claim-id', (c) => c.id)
    // 相对 section 坐标（section 已 translate 到 section.x/y，obs 相对偏移）
    .attr('transform', (c) => `translate(${c.x - section.x},${c.y - section.y})`)
    // Stage 2 R3 Issue #2 · cursor zoom-in 视觉暗示双击可放大
    .style('cursor', 'zoom-in');

  // tag (keywords，右对齐到圆点前)
  obsG
    .append('text')
    .attr('class', 'obs-tag')
    .attr('x', -8)
    .attr('y', 0)
    .attr('text-anchor', 'end')
    .attr('font-size', 9)
    .attr('fill', '#aaa')
    .attr('font-style', 'italic')
    .text((c) => (c.keywords ?? '').slice(0, 12));

  // 紫色圆点 dot
  obsG
    .append('circle')
    .attr('class', 'obs-dot')
    .attr('cx', 0)
    .attr('cy', -3)
    .attr('r', 2.3)
    .attr('fill', '#5b3a8c');

  // claim_text (serif italic)
  obsG
    .append('text')
    .attr('class', 'obs-text')
    .attr('x', 8)
    .attr('y', 0)
    .attr('font-size', 11)
    .attr('fill', '#2a2a2a')
    .attr('font-style', 'italic')
    .text((c) => c.claim_text);

  // Stage 2 R3 · obs 单击 + 双击行为（PM resident product 设计）
  //   单击 obs：始终更新详情卡
  //     · k <= 1.001（全景）→ 附加 flyto + chooseTargetK(1)=6（首次进入探索模式）
  //     · k > 1（已 zoom in）→ 仅切详情 / 画布不动（保留用户 pan/zoom 探索 context）
  //   双击 obs：flyto + chooseTargetK(currentK) + 居中（1→6 / <=6→8 / >6 保持）
  //     · 用户主动决定升级 zoom 级别（cursor:zoom-in 视觉暗示）
  //   event.stopPropagation() 防止 bubble 到 document outsideHandler 关详情卡
  // 居中算法（Issue 2.3 X 偏移修）：
  //   pixel screen visible center → pixelToViewBox 转 viewBox 坐标 → computeCenterTransform
  //   correct viewBox + preserveAspectRatio="xMidYMid meet" 的 meet scale + letterbox
  const SIDEBAR_PX = 48;
  const POPOVER_PX = 380;
  const HEADER_PX = 70;
  // PM R4 Fix · DR-051 · timeline 单行后 100 → 60
  const TIMELINE_PX = 60;

  // Stage 2 R5 PM checkpoint · 居中策略升级（句子整体 vs 圆点）
  //   default：句子中点 居中（不是圆点）→ 用 getBBox() 测 claim_text 实际宽度
  //   clamp：如果句子很长 / 中心居中会让起点跑出可见区左 → 强制让起点在 visLeft + 24px margin
  //   理由：用户读句子从头读 / 起点必须可见 / 长句末端可后续 pan 查看
  //   fallback：getBBox 失败或无 obsElement → 回退到圆点居中
  function computeFlyTransform(
    c: ClaimWithCoords,
    targetK: number,
    currentK: number,
    obsElement?: SVGGElement,
  ) {
    const visPxX = (window.innerWidth - SIDEBAR_PX - POPOVER_PX) / 2 + SIDEBAR_PX;
    const visPxY = HEADER_PX + (window.innerHeight - HEADER_PX - TIMELINE_PX) / 2;
    const svgNode = svg.node()!;
    const visCenterVB = pixelToViewBox(svgNode, visPxX, visPxY);

    // 尝试测 claim_text 实际 width 让 sentence 居中
    let sentenceStartCanvasX: number | null = null;
    let sentenceCenterCanvasX: number | null = null;
    if (obsElement) {
      const textEl = obsElement.querySelector('.obs-text') as SVGGraphicsElement | null;
      if (textEl) {
        try {
          const tb = textEl.getBBox();
          // textBBox.x 是 text 元素 local x（应是 8）/ textBBox.width 是 text 实际宽度
          // obs row 的世界 X 起点 = c.x（obs row transform translate to c.x）
          sentenceStartCanvasX = c.x + tb.x;
          sentenceCenterCanvasX = sentenceStartCanvasX + tb.width / 2;
        } catch {
          // getBBox 失败（jsdom / 未挂载）→ fallback
        }
      }
    }

    const targetCanvasX = sentenceCenterCanvasX ?? c.x; // sentence center 或圆点
    const ct = computeCenterTransform({
      target: { x: targetCanvasX, y: c.y },
      targetK,
      currentK,
      visibleCenter: visCenterVB,
    });

    // Stage 2 R5 · clamp sentence start 在可见区（如果句子长到起点跑出左边）
    if (sentenceStartCanvasX !== null) {
      const visLeftPx = SIDEBAR_PX + 24; // sidebar 右边 + 24px 阅读 margin
      const visLeftVB = pixelToViewBox(svgNode, visLeftPx, visPxY).x;
      // 飞行后 sentence start 的 viewBox X = sentenceStartCanvasX * k + tx
      const sentenceStartAfterX = sentenceStartCanvasX * ct.k + ct.x;
      if (sentenceStartAfterX < visLeftVB) {
        // 句子起点会跑出可见区左 → clamp tx 让起点对齐 visLeftVB
        ct.x = visLeftVB - sentenceStartCanvasX * ct.k;
      }
    }

    return ct;
  }

  obsG.on('click', (event, c) => {
    event.stopPropagation(); // 防止 bubble 到 document outsideHandler

    const currentK = zoomCtrl.getCurrentTransform().k;
    const obsElement = event.currentTarget as SVGGElement;
    // 仅 k=1 全景态触发 flyto（首次进入探索）/ k>1 时只切详情卡
    if (currentK <= 1.001) {
      const targetK = chooseTargetK(currentK); // = 6 at k=1
      const ct = computeFlyTransform(c, targetK, currentK, obsElement);
      flyToTarget(svg, zoomCtrl.zoomBehavior, ct, 600);
    }
    // 否则画布不动 / 详情卡更新即可（保留 pan/zoom 探索 context）

    // 详情卡同时滑入（350ms slide-in 跟 600ms 飞行重叠）
    const author = persons.find((p) => p.id === c.author_id);
    const sourceWork = c.source_work_id
      ? nodesData.nodes.find((n: { id: string }) => n.id === c.source_work_id)
      : null;

    // 找 agreement / disagreement 关系
    const agreementRels = relations.filter((r) => r.source === c.id && r.type === 'agreement_with');
    const disagreementRels = relations.filter(
      (r) => (r.source === c.id || r.target === c.id) && r.type === 'disagreement_with',
    );

    const agreementClaims = agreementRels
      .map((r) => {
        const target = claims.find((cc) => cc.id === r.target);
        if (!target) return null;
        const targetAuthor = persons.find((p) => p.id === target.author_id);
        return { id: target.id, author: targetAuthor?.name_zh ?? '?', text: target.claim_text };
      })
      .filter((x): x is { id: string; author: string; text: string } => x !== null);

    const disagreementClaims = disagreementRels
      .map((r) => {
        const otherId = r.source === c.id ? r.target : r.source;
        const other = claims.find((cc) => cc.id === otherId);
        if (!other) return null;
        const otherAuthor = persons.find((p) => p.id === other.author_id);
        return { id: other.id, author: otherAuthor?.name_zh ?? '?', text: other.claim_text };
      })
      .filter((x): x is { id: string; author: string; text: string } => x !== null);

    showClaimPopover(c, {
      authorName: author?.name_zh ?? '?',
      sourceWorkName: (sourceWork as { name_zh?: string } | null | undefined)?.name_zh,
      agreementClaims,
      disagreementClaims,
    });
  });

  // Stage 2 R3 Issue #2 · 双击 obs → 跳到下一档 zoom + 居中
  // Stage 2 R5 · sentence-aware centering（同 click）
  obsG.on('dblclick', (event, c) => {
    event.stopPropagation();
    const currentK = zoomCtrl.getCurrentTransform().k;
    const targetK = chooseTargetK(currentK);
    if (targetK > currentK + 0.01) {
      const obsElement = event.currentTarget as SVGGElement;
      const ct = computeFlyTransform(c, targetK, currentK, obsElement);
      flyToTarget(svg, zoomCtrl.zoomBehavior, ct, 600);
    }
    // 已在 >= chooseTargetK 不再 flyto / 详情卡已在 click handler 更新
  });
});

// Stage 2 R3 · disable d3 默认 dblclick zoom（默认是 k*2 / 跟我们 chooseTargetK 策略冲突）
svg.on('dblclick.zoom', null);

// === 8. T7 · 底部横向时间轴（spec § 6 / 独立参考维度）===
// PM 视觉期待: timeline 是 "独立栏" 始终可见，不能 scroll 到画布底才看到
// 实现: position: fixed bottom: 0 mount 到 document.body，跨 #app scroll 始终在视口底部
// 若 PM 反馈 "timeline 应跟画布一起 scroll" → 切回 mount 到 #app 末尾（5 分钟改回）

const timelineContainer = document.createElement('div');
timelineContainer.id = 'timeline-fixed';
timelineContainer.style.cssText =
  'position:fixed;bottom:0;left:0;right:0;z-index:10;box-shadow:0 -4px 12px rgba(58,35,96,0.08)';
document.body.appendChild(timelineContainer);

// M5 Stage 3 R1 vision pivot (DR-042 ~ DR-045)：时间轴 = 时间游标 / 时间滤镜
//   - 拖游标 / ▶ 播放 → 更新画布上观点 + 弧线的 opacity
//     · claim.year > cursor → opacity 0.15（未提出 / 淡显）
//     · claim.year ≤ cursor → opacity 1（已提出 / 正常）
//     · arc source/target 任一 year > cursor → opacity 0.15 / 否则 1
//   - 画布 pan/zoom 跟时间轴解耦（滚轮 zoom + 拖空白 pan 仍可用 / 但不被时间轴控制）
//   - 初始游标 = yearMax 全显（DR-043 / PM 拍 避免首访"页面坏了"）
//   - PM R3 Fix 1 · DR-049 · yearMax 1950 → 2030（含 1950 后的 Marx 学派 + 21 世纪 buffer）
const TIMELINE_YEAR_MIN = 1770;
const TIMELINE_YEAR_MAX = 2030;
const INITIAL_CURSOR_YEAR = TIMELINE_YEAR_MAX;
const FADED_OPACITY = 0.15;
const NORMAL_OPACITY = 1;

function applyTimelineFiltering(cursorYear: number): void {
  // 观点（紫圆点 + claim_text 行）淡显
  d3.selectAll<SVGGElement, ClaimWithCoords>('g.obs').attr('opacity', (c) =>
    c.year > cursorYear ? FADED_OPACITY : NORMAL_OPACITY,
  );
  // 弧线：两端 claim 都已提出才正常 / 否则淡显
  d3.selectAll<SVGPathElement, ClaimRelation>('path.arc').attr('opacity', (r) => {
    const sourceClaim = claimById.get(r.source);
    const targetClaim = claimById.get(r.target);
    if (!sourceClaim || !targetClaim) return FADED_OPACITY;
    const bothEmitted = sourceClaim.year <= cursorYear && targetClaim.year <= cursorYear;
    return bothEmitted ? NORMAL_OPACITY : FADED_OPACITY;
  });
  // 沿用 M4: person section（整组淡显）/ birth_year > cursor 还未出生
  d3.selectAll<SVGGElement, PersonSection>('g.person-section').attr('opacity', (s) =>
    s.birth_year > cursorYear ? FADED_OPACITY : NORMAL_OPACITY,
  );
}

mountTimeline({
  container: timelineContainer,
  yearMin: TIMELINE_YEAR_MIN,
  yearMax: TIMELINE_YEAR_MAX,
  initialCursor: INITIAL_CURSOR_YEAR,
  onCursorChange: applyTimelineFiltering,
});
// 初始 fading apply 一次（1950 = 全显示 / 但保持模式一致性）
applyTimelineFiltering(INITIAL_CURSOR_YEAR);

// === 9. T8 · 左侧颗粒度过滤栏（spec § 7 / 独立栏）===
// PM 视觉期待: sidebar 是 "独立栏" 始终可见，hover icon 触发主画布高亮预览语义需要 sidebar 在视口
// 实现: position: fixed left: 0 mount 到 document.body，跨 #app scroll 始终在视口左侧
// 跟 T7 timeline (bottom: 0) 同思路 / z-index 同级 / 物理位置不重叠
// #app padding-left: 48px 避免 SVG 被遮挡（前面已设）
// 若 PM 反馈 "sidebar 应跟画布一起 scroll" → 切回 flex layout 内部方案（5 分钟改回）

// PM R5 Fix · DR-052 · sidebar bottom 0 → 60px 让出 timeline
//   原 sidebar fixed top:0 bottom:0 / 跟 timeline (fixed bottom:0 left:0 right:0) 在底部重叠
//   sidebar 后挂 DOM / 同 z-index 10 / 覆盖 timeline 最左 48px (含 ▶ 按钮)
//   PM 反馈 "左侧边栏把时间轴最左侧挡住了 / 播放按钮也挡住了"
//   修法：sidebar 不延伸到 timeline 区（bottom:60 跟 main.ts padding-bottom + popover bottom 同步）
//   6 个 filter icon 仅占 sidebar 上方 ~270px / 远短于 viewport / 60px 留底不影响功能
const sidebarContainer = document.createElement('div');
sidebarContainer.id = 'sidebar-fixed';
sidebarContainer.style.cssText =
  'position:fixed;left:0;top:0;bottom:60px;z-index:10;box-shadow:2px 0 8px rgba(58,35,96,0.06)';
document.body.appendChild(sidebarContainer);

mountSidebar({
  container: sidebarContainer,
  onFilterChange: (filters) => {
    // B1 fix (2026-05-13 smoke test 后): 抽到 applyClaimFilters helper
    // 原实现只接 person + relation, 5 学科 cats + 观点 claim checkbox 显示但不生效 (spec § 7.2 漏实现)
    applyClaimFilters({ svg, claimById }, filters);
  },
  onHover: (filterKey) => {
    // hover 类型 icon → 主画布高亮该类型（仅 rel-* 联动弧线 opacity）
    if (!filterKey) {
      // mouseleave: 恢复所有弧线 opacity
      svg.selectAll('path.arc').attr('opacity', null);
      return;
    }
    // filterKey 格式 "<type>-<name>"，name 可能含 underscore（agreement_with）
    const dashIdx = filterKey.indexOf('-');
    const type = filterKey.substring(0, dashIdx);
    const name = filterKey.substring(dashIdx + 1);
    if (type === 'rel') {
      svg
        .selectAll<SVGPathElement, ClaimRelation>('path.arc')
        .attr('opacity', (r) => (r.type === name ? 1 : 0.1));
    }
  },
});

console.log(
  '[Marx M4] render complete · timeline + sidebar mounted (position:fixed bottom:0 / left:0)',
);
