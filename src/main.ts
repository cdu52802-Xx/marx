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
import * as d3 from './lib/d3.ts';
// Phase 0 (DR-071) · Bundle 减肥 · JSON 不 import 进 bundle / 改 async fetch · 节省 ~19 KB gzip
import claimsUrl from './data/claims.json?url';
import nodesUrl from './data/nodes_skeleton.json?url';
import {
  computePersonSectionPositions,
  generateArcPath,
  getArcStyle,
  type PersonSection,
  type ClaimWithCoords,
} from './components/claim-layout.ts';
import { mountTimeline } from './components/timeline.ts';
import { mountSidebar } from './components/sidebar.ts';
import { mountHeader } from './components/header.ts';
import { mountSearchInput } from './components/search.ts';
import {
  mountResultPopover,
  type SearchResultPopoverApi,
} from './components/search-result-popover.ts';
import { search as runSearchIndex } from './lib/search-index.ts';
import {
  MAIN_PERSONS,
  CORE_CONCEPTS,
  KEY_PERIODS,
  isExactConceptHit,
} from './lib/search-curate.ts';
import { mountBreadcrumb, type BreadcrumbApi } from './components/breadcrumb.ts';
import { createZoom } from './viz/zoom.ts';
import { mountZoomControl, updateZoomDisplay } from './components/zoom-control.ts';
import {
  computeCenterTransform,
  flyToTarget,
  chooseTargetK,
  pixelToViewBox,
} from './viz/center.ts';
import { showClaimPopover } from './components/claim-popover.ts';
import { showArcPopover, hideArcPopover } from './components/arc-popover.ts';
import { applyClaimFilters } from './components/apply-claim-filters.ts';
import { mountGeographicCanvas } from './components/geographic-canvas.ts';
import type { ClaimNode, ClaimRelation } from './types/Claim.ts';
import type { PersonNode } from './types/Node.ts';

console.log('[Marx M4] entry · claim-on-timeline');

// === 1. 数据加载（async fetch · Phase 0 DR-071 / JSON 不进 bundle 节省 ~19 KB gzip） ===

const [claimsData, nodesData] = (await Promise.all([
  fetch(claimsUrl).then((r) => r.json()),
  fetch(nodesUrl).then((r) => r.json()),
])) as [
  { claims: ClaimNode[]; relations: ClaimRelation[] },
  { nodes: Array<{ id: string; type: string; [key: string]: unknown }> },
];

const claims = claimsData.claims;
const relations = claimsData.relations;
const persons = nodesData.nodes.filter((n) => n.type === 'person') as unknown as PersonNode[];

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
  .style('pointer-events', 'none') // R1 Fix 1 · 视觉层不接 click / 改 hit overlay
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

// Stage 5 R1 Fix 1 (DR-061) · 弧线 hit overlay 层
//   PM 反馈"弧线太细难选中" / 解：透明 16px stroke + non-scaling / 视觉不变 / hit area ~16 屏幕 px
//   data + d 跟 visible arc-layer 同顺序 / click 时按 index 查同位 visible path
zoomLayer
  .append('g')
  .attr('class', 'arc-hit-layer')
  .selectAll('path.arc-hit')
  .data(visibleRelations)
  .join('path')
  .attr('class', 'arc-hit')
  .attr('d', (r) => {
    const s = claimIdToCoords.get(r.source)!;
    const t = claimIdToCoords.get(r.target)!;
    return generateArcPath(s.x, s.y - 3, t.x, t.y - 3, r.type);
  })
  .attr('fill', 'none')
  .attr('stroke', 'transparent')
  .attr('stroke-width', 16)
  .attr('vector-effect', 'non-scaling-stroke') // hit 区固定 16 屏幕 px / 不跟 zoom 缩放
  .style('pointer-events', 'stroke')
  .style('cursor', 'pointer')
  .on('click', function (event: MouseEvent) {
    event.stopPropagation();
    // R3 Fix · DR-067 · 命中歧义修：用 cursor pixel 找几何最近弧 (不依赖 DOM stacking)
    const picked = pickNearestArc(event.clientX, event.clientY);
    if (!picked) return;
    handleArcClick(picked.visiblePath, picked.relation);
  })
  // R4 Fix · DR-068 · hover preview：cursor 在 hit zone 移动时实时高亮"会命中哪条弧"
  //   消除 PM "误选" surprise / preview-then-commit 模式跟 Stage 4 + R2 焦点按钮一致
  //   RAF 节流 / mousemove 高频但每帧最多算一次 / 不卡
  .on('mousemove', function (event: MouseEvent) {
    if (hoverPreviewScheduled) return;
    hoverPreviewScheduled = true;
    const ev = event;
    requestAnimationFrame(() => {
      hoverPreviewScheduled = false;
      updateArcHoverPreview(ev.clientX, ev.clientY);
    });
  })
  .on('mouseleave', () => {
    clearArcHoverPreview();
  });

// R4 Fix DR-068 · hover preview state + helpers
// R5 增强 (PM hypothesis 5) · floating label "即将选: X 关系 Y" + endpoint dot 黄边高亮
//   PM 视觉直接看到算法将选谁 / 不依赖 console / 错例可截图反馈
let hoverPreviewedPath: SVGPathElement | null = null;
let hoverPreviewScheduled = false;

// floating label dom (one-time mount)
const previewLabel = document.createElement('div');
previewLabel.className = 'arc-preview-label';
previewLabel.style.cssText = `
  position: fixed;
  background: rgba(91, 58, 140, 0.95);
  color: #fcfaf6;
  padding: 6px 10px;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 13px;
  font-style: italic;
  pointer-events: none;
  z-index: 100;
  display: none;
  max-width: 320px;
  line-height: 1.4;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
document.body.appendChild(previewLabel);

const REL_TYPE_LABEL_CN: Record<ClaimRelation['type'], string> = {
  agreement_with: '同意',
  disagreement_with: '反对',
  extends: '延伸',
};

function setPreviewEndpointHighlight(sourceId: string | null, targetId: string | null): void {
  // 清旧 preview-endpoint highlight (selected dot r=5 不动 / 仅清 hover preview)
  d3.selectAll<SVGCircleElement, unknown>('circle.obs-dot[data-preview="1"]')
    .attr('data-preview', null)
    .attr('r', 2.3)
    .attr('stroke', null)
    .attr('stroke-width', null);

  if (sourceId === null && targetId === null) return;

  [sourceId, targetId].forEach((id) => {
    if (!id) return;
    document
      .querySelectorAll<SVGCircleElement>(`g.obs[data-claim-id="${id}"] circle.obs-dot`)
      .forEach((el) => {
        // 不覆盖 selected dot (selected stroke #fcfaf6)
        if (el.getAttribute('stroke') === '#fcfaf6') return;
        d3.select(el)
          .attr('data-preview', '1')
          .attr('r', 4)
          .attr('stroke', '#e6c200')
          .attr('stroke-width', 2);
      });
  });
}

function updateArcHoverPreview(clientX: number, clientY: number): void {
  const picked = pickNearestArc(clientX, clientY);
  const newPath = picked?.visiblePath ?? null;
  const newRel = picked?.relation ?? null;

  // floating label 始终更新位置 (即使路径没变 / 跟 cursor 走)
  if (newRel) {
    const sourceClaim = claimById.get(newRel.source);
    const targetClaim = claimById.get(newRel.target);
    if (sourceClaim && targetClaim) {
      const sourceAuthor = persons.find((p) => p.id === sourceClaim.author_id)?.name_zh ?? '?';
      const targetAuthor = persons.find((p) => p.id === targetClaim.author_id)?.name_zh ?? '?';
      const typeLabel = REL_TYPE_LABEL_CN[newRel.type] ?? newRel.type;
      previewLabel.textContent = `${sourceAuthor} ${typeLabel} ${targetAuthor}`;
      previewLabel.style.left = `${clientX + 16}px`;
      previewLabel.style.top = `${clientY + 16}px`;
      previewLabel.style.display = 'block';
    }
  } else {
    previewLabel.style.display = 'none';
  }

  if (newPath === hoverPreviewedPath) return;
  // 复原上一个 preview（如非 popover selected）
  if (hoverPreviewedPath && !isPathSelectedInPopover(hoverPreviewedPath)) {
    const datum = (hoverPreviewedPath as unknown as { __data__: ClaimRelation }).__data__;
    const style = getArcStyle(datum.type);
    d3.select(hoverPreviewedPath)
      .interrupt('hover')
      .attr('stroke-width', style.strokeWidth)
      .attr('opacity', style.opacity);
  }
  hoverPreviewedPath = newPath;
  if (!newPath || !newRel) {
    setPreviewEndpointHighlight(null, null);
    return;
  }
  // 高亮新 preview path
  d3.select(newPath)
    .raise()
    .interrupt('hover')
    .transition('hover')
    .duration(150)
    .attr('stroke-width', 2.5)
    .attr('opacity', 1.0);
  // 高亮两端 obs dot (黄边 / 视觉锚定 endpoint pair)
  setPreviewEndpointHighlight(newRel.source, newRel.target);
}

function clearArcHoverPreview(): void {
  previewLabel.style.display = 'none';
  setPreviewEndpointHighlight(null, null);
  if (!hoverPreviewedPath) return;
  if (!isPathSelectedInPopover(hoverPreviewedPath)) {
    const datum = (hoverPreviewedPath as unknown as { __data__: ClaimRelation }).__data__;
    const style = getArcStyle(datum.type);
    d3.select(hoverPreviewedPath)
      .interrupt('hover')
      .transition('hover')
      .duration(150)
      .attr('stroke-width', style.strokeWidth)
      .attr('opacity', style.opacity);
  }
  hoverPreviewedPath = null;
}

// arc-popover 打开时不复原 selected arc 的高亮（hover preview vs selected 视觉一致 / 但状态优先级 selected > hover）
function isPathSelectedInPopover(pathEl: SVGPathElement): boolean {
  const popover = document.querySelector<HTMLElement>('.arc-popover');
  if (!popover || popover.dataset.state === 'closing') return false;
  const datum = (pathEl as unknown as { __data__: ClaimRelation }).__data__;
  if (!datum) return false;
  const relKey = `${datum.source}|${datum.target}|${datum.type}`;
  return popover.dataset.relKey === relKey;
}

// R5 Fix · DR-069 endpoint-aware 两阶段 picker
//   Root cause (RC2 only · RC1 推翻 — click event 入口就是 stroke / elementsFromPoint 不会漏 event target)：
//     用户视觉认知锚定 endpoint pair (语义 = "X 关系 Y") / 几何均布 path 各点 / apex 近的赢
//     31 arcs 实测 386 confusion pair (preview_eval) / 多 arc 共享 endpoint dot 极普遍 / RC2 触发频繁
//   Fix：全 arc 扫描 + 两阶段
//     阶段 A · cursor 距任 arc endpoint ≤ ENDPOINT_DETECT_PX (14px 屏幕) → endpoint-mode
//              选 endpoint 出发 ENDPOINT_LOCAL_LEN VB 长度子段内距 cursor 最近的弧
//     阶段 B · 否则 / fallback path-mode → 全 path 32 点采样最近 + hit radius cutoff
//   debug · URL ?debug 启用 console log / 显示算法决策路径
const DR069_DEBUG = new URLSearchParams(window.location.search).has('debug');

function pickNearestArc(
  clientX: number,
  clientY: number,
): { visiblePath: SVGPathElement; relation: ClaimRelation } | null {
  const svgNode = svg.node();
  if (!svgNode) return null;
  const ctm = svgNode.getScreenCTM();
  if (!ctm) return null;

  // cursor pixel → SVG viewBox 坐标
  const pt = svgNode.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const cursorVB = pt.matrixTransform(ctm.inverse());

  // 全 arc 扫描 (不限 elementsFromPoint / 处理 focus mode 切换边界 + 极端 stroke 覆盖)
  // focus mode display:none 的 hit path 排除 (跟 visible 同步)
  const allHitPaths = Array.from(
    document.querySelectorAll<SVGPathElement>('g.arc-hit-layer > path.arc-hit'),
  ).filter((el) => getComputedStyle(el).display !== 'none');
  if (allHitPaths.length === 0) return null;

  // 屏幕 px → VB 单位 (考虑 viewBox meet scale + d3.zoom k / 命中半径感知一致)
  const rect = svgNode.getBoundingClientRect();
  const vb = svgNode.viewBox.baseVal;
  if (vb.width === 0 || vb.height === 0) return null;
  const meetScale = Math.min(rect.width / vb.width, rect.height / vb.height);
  const k = zoomCtrl.getCurrentTransform().k;
  const ENDPOINT_DETECT_PX = 14; // endpoint 视觉锚定半径 (略大于 stroke 半宽 8)
  const HIT_RADIUS_PX = 16; // path-mode 整 path 命中半径 (跟 stroke 16 看齐)
  const ENDPOINT_LOCAL_LENGTH_VB = 30; // endpoint 出发子段长度 (VB 单位)
  const endpointDetectVB = ENDPOINT_DETECT_PX / meetScale / k;
  const hitRadiusVB = HIT_RADIUS_PX / meetScale / k;

  interface ArcCandidate {
    el: SVGPathElement;
    relKey: string;
    startDist: number;
    endDist: number;
    pathMinDist: number;
    endpointLocalMinDist: number;
  }

  const candidates: ArcCandidate[] = [];
  for (const hitPath of allHitPaths) {
    const totalLen = hitPath.getTotalLength();
    if (totalLen === 0) continue;
    const startPt = hitPath.getPointAtLength(0);
    const endPt = hitPath.getPointAtLength(totalLen);
    const startD2 = (startPt.x - cursorVB.x) ** 2 + (startPt.y - cursorVB.y) ** 2;
    const endD2 = (endPt.x - cursorVB.x) ** 2 + (endPt.y - cursorVB.y) ** 2;

    // path 整段 32 点采样最近
    let pathMinD2 = Math.min(startD2, endD2);
    const samples = 32;
    for (let i = 1; i < samples; i++) {
      const p = hitPath.getPointAtLength((totalLen * i) / samples);
      const d2 = (p.x - cursorVB.x) ** 2 + (p.y - cursorVB.y) ** 2;
      if (d2 < pathMinD2) pathMinD2 = d2;
    }

    // endpoint-local 子段 (start 端 + end 端各 16 点采样 / 短弧自动减半)
    let endpointLocalMinD2 = Math.min(startD2, endD2);
    const localLen = Math.min(ENDPOINT_LOCAL_LENGTH_VB, totalLen / 2);
    const localSamples = 16;
    for (let i = 1; i <= localSamples; i++) {
      const offsetFromStart = (localLen * i) / localSamples;
      const p1 = hitPath.getPointAtLength(offsetFromStart);
      const d1 = (p1.x - cursorVB.x) ** 2 + (p1.y - cursorVB.y) ** 2;
      if (d1 < endpointLocalMinD2) endpointLocalMinD2 = d1;
      const p2 = hitPath.getPointAtLength(totalLen - offsetFromStart);
      const d2 = (p2.x - cursorVB.x) ** 2 + (p2.y - cursorVB.y) ** 2;
      if (d2 < endpointLocalMinD2) endpointLocalMinD2 = d2;
    }

    const datum = (hitPath as unknown as { __data__: ClaimRelation }).__data__;
    candidates.push({
      el: hitPath,
      relKey: `${datum.source}|${datum.target}|${datum.type}`,
      startDist: Math.sqrt(startD2),
      endDist: Math.sqrt(endD2),
      pathMinDist: Math.sqrt(pathMinD2),
      endpointLocalMinDist: Math.sqrt(endpointLocalMinD2),
    });
  }

  // 阶段 A · endpoint-mode
  const endpointCands = candidates.filter(
    (c) => Math.min(c.startDist, c.endDist) <= endpointDetectVB,
  );
  let chosen: ArcCandidate | null = null;
  let mode: 'endpoint' | 'path' | 'none' = 'none';
  if (endpointCands.length > 0) {
    endpointCands.sort((a, b) => a.endpointLocalMinDist - b.endpointLocalMinDist);
    chosen = endpointCands[0];
    mode = 'endpoint';
  } else {
    // 阶段 B · path-mode (hit radius cutoff)
    const pathCands = candidates.filter((c) => c.pathMinDist <= hitRadiusVB);
    if (pathCands.length > 0) {
      pathCands.sort((a, b) => a.pathMinDist - b.pathMinDist);
      chosen = pathCands[0];
      mode = 'path';
    }
  }

  if (DR069_DEBUG) {
    console.group(
      `[arc-debug] click pixel (${clientX}, ${clientY}) · VB (${cursorVB.x.toFixed(1)}, ${cursorVB.y.toFixed(1)}) · k=${k.toFixed(2)}`,
    );
    console.log(
      `radii VB: endpoint-detect=${endpointDetectVB.toFixed(1)} · hit=${hitRadiusVB.toFixed(1)}`,
    );
    console.log(`MODE: ${mode.toUpperCase()} · chosen: ${chosen?.relKey ?? 'NONE'}`);
    const sortKey: keyof ArcCandidate =
      mode === 'endpoint' ? 'endpointLocalMinDist' : 'pathMinDist';
    candidates
      .slice()
      .sort((a, b) => (a[sortKey] as number) - (b[sortKey] as number))
      .slice(0, 5)
      .forEach((c, i) => {
        const marker = i === 0 ? '🎯' : '  ';
        console.log(
          `${marker} #${i + 1} ${c.relKey} · ep-local=${c.endpointLocalMinDist.toFixed(1)} · path-min=${c.pathMinDist.toFixed(1)} · start=${c.startDist.toFixed(1)} · end=${c.endDist.toFixed(1)}`,
        );
      });
    console.groupEnd();
  }

  if (!chosen) return null;

  // hit path index → 对应 visible path
  const hitParent = chosen.el.parentElement;
  if (!hitParent) return null;
  const idx = Array.prototype.indexOf.call(hitParent.children, chosen.el);
  const visiblePath = document.querySelectorAll<SVGPathElement>('g.arc-layer > path.arc')[idx];
  if (!visiblePath) return null;

  const relation = (chosen.el as unknown as { __data__: ClaimRelation }).__data__;
  return { visiblePath, relation };
}

// DR-069 dev · ?debug 启用时 expose 到 window 便于 preview_eval 批量测试
if (DR069_DEBUG) {
  (window as unknown as { __arcPick: typeof pickNearestArc }).__arcPick = pickNearestArc;
}

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

    // Stage 5 R2 · 点 obs → 关 arc-popover + 复原弧线选中（清 selectedArcRelation）
    hideArcPopover();
    restoreArcOpacity();

    // DR-087 · obs click 选中 visual indicator（PM 反馈 / 用户视线回画布能定位当前选定）
    //   紫圈 stroke (米白 #fcfaf6 sw=2 r=5) + obs-text font-weight 加粗 700
    //   不淡显其他 obs（跟 search 选定区别：search 还有 fade · click 仅紫圈+加粗）
    //   restoreArcOpacity 已清旧 stroke + 加粗 / 此处给新选中加
    document
      .querySelectorAll<SVGCircleElement>(`g.obs[data-claim-id="${c.id}"] circle.obs-dot`)
      .forEach((el) => {
        d3.select(el).attr('r', 5).attr('stroke', '#fcfaf6').attr('stroke-width', 2);
      });
    document
      .querySelectorAll<SVGTextElement>(`g.obs[data-claim-id="${c.id}"] text.obs-text`)
      .forEach((el) => {
        d3.select(el).attr('font-weight', '700');
      });
    // D9 · 紫圈 spring 弹出（obs click 路径）
    triggerObsSpring(c.id);

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
      // Stage 4 焦点模式 (DR-053~057) · popover「查看关联」3 event 接到 main.ts
      onHoverFocusPreview: (cid) => applyHoverPreviewFiltering(computeFocusSet(cid)),
      onLeaveFocusPreview: () => clearHoverPreviewFiltering(),
      onEnterFocus: (cid) => enterFocusMode(cid),
      // DR-087 · 详情卡关时清主图选中 visual indicator（紫圈 + 加粗）
      onClose: () => restoreArcOpacity(),
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

  // B1 polish DR-085 · obs hover 双层状态机
  //   状态 0 + hover B1 → B1 focusSet（B1 + 提出者 + 关联 obs/arc）normal · 其他 fade
  //   状态 1 + hover B1 → searchSet(A1) ∪ hoverSet(B1) normal · 其他 fade（A1 紫圈 / B1 无圈）
  //   leave → searchFocus 还在 → 回 search 状态；否则回 timeline default
  //   focus mode（仅相关）下不触发 hover
  obsG.on('mouseenter', (_event, c) => {
    if (inFocusMode) return;
    const hoverSet = computeFocusSet(c.id);
    let combinedSet: FocusSet = hoverSet;
    if (searchFocusClaimId !== null && searchFocusClaimId !== c.id) {
      const searchSet = computeFocusSet(searchFocusClaimId);
      combinedSet = {
        obsIds: new Set([...searchSet.obsIds, ...hoverSet.obsIds]),
        personIds: new Set([...searchSet.personIds, ...hoverSet.personIds]),
      };
    }
    applyHoverPreviewFiltering(combinedSet);
  });
  obsG.on('mouseleave', () => {
    if (inFocusMode) return;
    if (searchFocusClaimId !== null) {
      // 回 search 选定状态
      applyHoverPreviewFiltering(computeFocusSet(searchFocusClaimId));
    } else {
      // 回 timeline default
      const cy = timelineApi?.getCurrentYear() ?? INITIAL_CURSOR_YEAR;
      applyTimelineFiltering(cy);
    }
  });
});

// Stage 2 R3 · disable d3 默认 dblclick zoom（默认是 k*2 / 跟我们 chooseTargetK 策略冲突）
svg.on('dblclick.zoom', null);

// Stage 5 R2 · 点画布空白 → 关 arc-popover + 复原弧线高亮
//   d3.zoom 监听 mousedown / mousewheel / dblclick / 不监听 click → 不冲突
//   obs 和 arc hit overlay 自身 .on('click') 都 stopPropagation / 仅空白区域 click bubble 到 svg
svg.on('click', () => {
  hideArcPopover();
  restoreArcOpacity();
});

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

// Stage 4 焦点模式 state（先声明 / 函数闭包引用）
let timelineApi: { getCurrentYear: () => number } | null = null;
let breadcrumbApi: BreadcrumbApi | null = null;
let inFocusMode = false;

// B1 polish DR-085 · 双层状态机
//   search commit（持久）+ hover transient（临时）共存
//   null = 无 search 选定 / 非 null = 当前 search 选定 claim id
//   highlightObs 设此 state · clearSearchHighlight / restoreArcOpacity 清此 state
//   obs mouseenter/leave + clearHoverPreviewFiltering 据此决定回什么状态
let searchFocusClaimId: string | null = null;

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

timelineApi = mountTimeline({
  container: timelineContainer,
  yearMin: TIMELINE_YEAR_MIN,
  yearMax: TIMELINE_YEAR_MAX,
  initialCursor: INITIAL_CURSOR_YEAR,
  onCursorChange: applyTimelineFiltering,
});
// 初始 fading apply 一次（1950 = 全显示 / 但保持模式一致性）
applyTimelineFiltering(INITIAL_CURSOR_YEAR);

// === Stage 4 · 顶部面包屑 mount（焦点模式时显示）===
const breadcrumbContainer = document.createElement('div');
breadcrumbContainer.id = 'breadcrumb-fixed';
breadcrumbContainer.style.cssText =
  'position:fixed;top:54px;left:48px;right:0;z-index:11;pointer-events:auto';
document.body.appendChild(breadcrumbContainer);
breadcrumbApi = mountBreadcrumb({ container: breadcrumbContainer, onExitFocus: exitFocusMode });

// === Stage 4 焦点模式 / Focus Mode (DR-053 ~ DR-057 + spec § 14) ===
//   触发：详情卡「查看关联」按钮 hover preview + click 切换
//   两态 + 全画布默认 = 3 state machine
//   保留 person section 头像 + 名字 (DR-055) / 沿用 claim-layout

interface FocusSet {
  obsIds: Set<string>;
  personIds: Set<string>;
}

function computeFocusSet(c0Id: string): FocusSet {
  const obsIds = new Set<string>([c0Id]);
  for (const r of relations) {
    if (r.source === c0Id || r.target === c0Id) {
      obsIds.add(r.source);
      obsIds.add(r.target);
    }
  }
  const personIds = new Set<string>();
  for (const id of obsIds) {
    const c = claimById.get(id);
    if (c) personIds.add(c.author_id);
  }
  return { obsIds, personIds };
}

// 进焦点 / 退焦点要保留时间游标 filtering 的相互作用：
//   - hover preview: opacity 仅作用于"非焦点 + 时间游标内"的元素
//   - focus mode: display:none 非焦点 / 焦点内 opacity 仍受时间游标控制
//   - 退焦点: 重新调 applyTimelineFiltering(currentCursor) 恢复
//   inFocusMode 在文件顶部已声明（state hoisting）

function applyHoverPreviewFiltering(fs: FocusSet): void {
  // hover 预览：非焦点 obs opacity 0.15 / 焦点 obs opacity 1
  d3.selectAll<SVGGElement, ClaimWithCoords>('g.obs').attr('opacity', (c) =>
    fs.obsIds.has(c.id) ? NORMAL_OPACITY : FADED_OPACITY,
  );
  d3.selectAll<SVGPathElement, ClaimRelation>('path.arc').attr('opacity', (r) =>
    fs.obsIds.has(r.source) && fs.obsIds.has(r.target) ? NORMAL_OPACITY : FADED_OPACITY,
  );
  d3.selectAll<SVGGElement, PersonSection>('g.person-section').attr('opacity', (s) =>
    fs.personIds.has(s.id) ? NORMAL_OPACITY : FADED_OPACITY,
  );
}

function clearHoverPreviewFiltering(): void {
  if (inFocusMode) return; // 焦点模式下 leave 不恢复（保持 focus）
  // B1 polish DR-085 坑 2 · 详情卡按钮 hover leave 时如有 search 选定 → 回 search 状态而非清空
  //   原 bug：search 选 A1 → hover 详情卡「查看关联」按钮 → leave → 全画面 normal / search 状态丢失
  if (searchFocusClaimId !== null) {
    applyHoverPreviewFiltering(computeFocusSet(searchFocusClaimId));
    return;
  }
  // 否则恢复时间游标 filtering
  const cy = timelineApi?.getCurrentYear() ?? INITIAL_CURSOR_YEAR;
  applyTimelineFiltering(cy);
}

// PM Stage 4 R1 反馈 (DR-058)：focus mode 不能在原 layout 紧凑 / 要重排
//   原 layout 焦点 obs 隔得远（A 左上 / B 中 / C 右下 / 中间几十条无关 obs）
//   PM 要 "AB AC 紧挨在一起 / 中间无空" / 像 CAD zoom-selected 但内容也紧凑重排
//   方案：focus 时调 computePersonSectionPositions(focusPersonInputs) 算紧凑斜向流坐标
//        SVG g.person-section / g.obs / path.arc transform 飞到新坐标
//        退 focus 时所有元素 transform 恢复原 datum 坐标
function reflowFocusLayout(fs: FocusSet): {
  obsCoordsMap: Map<string, { x: number; y: number }>;
  sectionCoordsMap: Map<string, { x: number; y: number }>;
} {
  // 用焦点 person + 仅焦点 obs 作为 input
  const focusPersonInputs = persons
    .filter((p) => fs.personIds.has(p.id))
    .map((p) => ({
      id: p.id,
      name_zh: p.name_zh,
      name_orig: p.name_orig,
      birth_year: p.birth_year,
      death_year: p.death_year,
      claims: (claimsByAuthor.get(p.id) ?? []).filter((c) => fs.obsIds.has(c.id)),
    }));

  // 复用主画布 layout 算法 / 3 person + 6 obs 自然比 27 person 紧凑得多
  const focusSections = computePersonSectionPositions(focusPersonInputs);

  const obsCoordsMap = new Map<string, { x: number; y: number }>();
  const sectionCoordsMap = new Map<string, { x: number; y: number }>();
  for (const s of focusSections) {
    sectionCoordsMap.set(s.id, { x: s.x, y: s.y });
    for (const c of s.claims) {
      obsCoordsMap.set(c.id, { x: c.x, y: c.y });
    }
  }
  return { obsCoordsMap, sectionCoordsMap };
}

function applyFocusLayout(fs: FocusSet): void {
  const { obsCoordsMap, sectionCoordsMap } = reflowFocusLayout(fs);

  // section transform 飞到紧凑新坐标
  d3.selectAll<SVGGElement, PersonSection>('g.person-section').each(function (section) {
    if (!fs.personIds.has(section.id)) return;
    const newSec = sectionCoordsMap.get(section.id);
    if (!newSec) return;
    d3.select(this).attr('transform', `translate(${newSec.x},${newSec.y})`);

    // 该 section 下焦点 obs transform 也飞到 new coords（相对 section 偏移）
    d3.select(this)
      .selectAll<SVGGElement, ClaimWithCoords>('g.obs')
      .each(function (c) {
        if (!fs.obsIds.has(c.id)) return;
        const newObs = obsCoordsMap.get(c.id);
        if (!newObs) return;
        d3.select(this).attr(
          'transform',
          `translate(${newObs.x - newSec.x},${newObs.y - newSec.y})`,
        );
      });
  });

  // arc 用新坐标重画 d / R1 Fix 1 · visible + hit overlay 同步
  d3.selectAll<SVGPathElement, ClaimRelation>('path.arc, path.arc-hit').each(function (r) {
    if (!fs.obsIds.has(r.source) || !fs.obsIds.has(r.target)) return;
    const s = obsCoordsMap.get(r.source);
    const t = obsCoordsMap.get(r.target);
    if (!s || !t) return;
    d3.select(this).attr('d', generateArcPath(s.x, s.y - 3, t.x, t.y - 3, r.type));
  });

  // zoom-fit 用新 bbox（紧凑后 bbox 小很多 / zoom 更舒服）
  zoomFitToFocusCoords(obsCoordsMap);
}

function restoreOriginalLayout(): void {
  // section transform 恢复原 datum 坐标
  d3.selectAll<SVGGElement, PersonSection>('g.person-section').each(function (section) {
    d3.select(this).attr('transform', `translate(${section.x},${section.y})`);

    // 该 section 下所有 obs transform 也恢复
    d3.select(this)
      .selectAll<SVGGElement, ClaimWithCoords>('g.obs')
      .each(function (c) {
        d3.select(this).attr('transform', `translate(${c.x - section.x},${c.y - section.y})`);
      });
  });

  // arc 用原 datum 坐标重画 d / R1 Fix 1 · visible + hit overlay 同步
  d3.selectAll<SVGPathElement, ClaimRelation>('path.arc, path.arc-hit').each(function (r) {
    const s = claimIdToCoords.get(r.source);
    const t = claimIdToCoords.get(r.target);
    if (!s || !t) return;
    d3.select(this).attr('d', generateArcPath(s.x, s.y - 3, t.x, t.y - 3, r.type));
  });
}

function enterFocusMode(c0Id: string): void {
  const fs = computeFocusSet(c0Id);
  inFocusMode = true;

  // 非焦点元素 display:none
  d3.selectAll<SVGGElement, ClaimWithCoords>('g.obs').style('display', (c) =>
    fs.obsIds.has(c.id) ? null : 'none',
  );
  // R1 Fix 1 · visible + hit overlay 同步隐藏 / 非焦点 arc 不响应 click
  d3.selectAll<SVGPathElement, ClaimRelation>('path.arc, path.arc-hit').style('display', (r) =>
    fs.obsIds.has(r.source) && fs.obsIds.has(r.target) ? null : 'none',
  );
  d3.selectAll<SVGGElement, PersonSection>('g.person-section').style('display', (s) =>
    fs.personIds.has(s.id) ? null : 'none',
  );
  // 强制 normal opacity 进焦点（避免 hover leave 后残留 0.15）
  d3.selectAll<SVGGElement, ClaimWithCoords>('g.obs').attr('opacity', NORMAL_OPACITY);
  d3.selectAll<SVGPathElement, ClaimRelation>('path.arc').attr('opacity', NORMAL_OPACITY);
  d3.selectAll<SVGGElement, PersonSection>('g.person-section').attr('opacity', NORMAL_OPACITY);

  // DR-058 紧密重排 + zoom-fit
  applyFocusLayout(fs);

  // 显示顶部面包屑
  const c0 = claimById.get(c0Id);
  const prefix = c0
    ? c0.claim_text.length > 20
      ? c0.claim_text.slice(0, 20) + '…'
      : c0.claim_text
    : c0Id;
  breadcrumbApi?.showFocus(prefix);
}

function exitFocusMode(): void {
  if (!inFocusMode) return;
  inFocusMode = false;

  // 恢复 display
  d3.selectAll<SVGGElement, ClaimWithCoords>('g.obs').style('display', null);
  // R1 Fix 1 · visible + hit overlay 同步恢复
  d3.selectAll<SVGPathElement, ClaimRelation>('path.arc, path.arc-hit').style('display', null);
  d3.selectAll<SVGGElement, PersonSection>('g.person-section').style('display', null);

  // DR-058 · 焦点紧凑 layout 恢复原 datum 坐标（section + obs transform + arc d）
  restoreOriginalLayout();

  // 恢复时间游标 filtering
  const cy = timelineApi?.getCurrentYear() ?? INITIAL_CURSOR_YEAR;
  applyTimelineFiltering(cy);

  // zoom reset 全景
  zoomCtrl.reset(800);

  // 隐藏面包屑
  breadcrumbApi?.hideFocus();
}

// Stage 5 R2 · 弧线 click handler 主逻辑（PM brainstorm 重写 Q1=B / Q3=X' / Q4=1）
//   1. 取弧 endpoints + apex (getPointAtLength) / 算 fit targetK (fit factor 0.55)
//   2. 装得下 = currentK <= targetK / 单击自动飞 fit (PM Q1 B)
//   3. 装不下 = currentK > targetK / 仅弹 popover 不飞 / popover 内 fit 按钮主动飞
//   4. 总是弹 arc-popover（source/target 上下分栏 / 默认两侧折叠 / Q2）
//   5. 选中弧 + 两端 obs 高亮（Q4 1）/ 用户展开一侧 → 仅该 obs 亮
//   6. ROOT CAUSE FIX: 不再用 computeCenterTransform / 该函数 currentK > targetK 时锁定 currentK
//      直接构造 { k: targetK, x: tx, y: ty } / 弧 click 总是允许降 k 到 fit 值
function handleArcClick(pathEl: SVGPathElement, r: ClaimRelation): void {
  const totalLen = pathEl.getTotalLength();
  if (totalLen === 0) return;
  const sPt = pathEl.getPointAtLength(0);
  const tPt = pathEl.getPointAtLength(totalLen);
  const midPt = pathEl.getPointAtLength(totalLen / 2);

  const bboxMinX = Math.min(sPt.x, tPt.x, midPt.x);
  const bboxMaxX = Math.max(sPt.x, tPt.x, midPt.x);
  const bboxMinY = Math.min(sPt.y, tPt.y, midPt.y);
  const bboxMaxY = Math.max(sPt.y, tPt.y, midPt.y);
  const bboxW = Math.max(bboxMaxX - bboxMinX, 50);
  const bboxH = Math.max(bboxMaxY - bboxMinY, 50);
  const bboxCenterX = (bboxMinX + bboxMaxX) / 2;
  const bboxCenterY = (bboxMinY + bboxMaxY) / 2;

  const SIDEBAR_PX = 48;
  const POPOVER_PX = 380; // R2 · arc-popover 占右 380px / 飞行 visCenter 要 offset
  const HEADER_PX = 70;
  const TIMELINE_PX = 60;
  const visPxW = window.innerWidth - SIDEBAR_PX - POPOVER_PX;
  const visPxH = window.innerHeight - HEADER_PX - TIMELINE_PX;
  const visPxX = SIDEBAR_PX + visPxW / 2;
  const visPxY = HEADER_PX + visPxH / 2;
  const svgNode = svg.node();
  if (!svgNode) return;
  const visCenterVB = pixelToViewBox(svgNode, visPxX, visPxY);

  const rect = svgNode.getBoundingClientRect();
  const vb = svgNode.viewBox.baseVal;
  if (vb.width === 0 || vb.height === 0) return;
  const meetScale = Math.min(rect.width / vb.width, rect.height / vb.height);

  const padFactor = 0.55;
  const kFitX = (visPxW * padFactor) / (bboxW * meetScale);
  const kFitY = (visPxH * padFactor) / (bboxH * meetScale);
  const targetK = Math.max(1, Math.min(kFitX, kFitY, 8));

  // Q1 B · 装得下判断（currentK <= fit targetK → 飞 / 否则不飞）
  const currentK = zoomCtrl.getCurrentTransform().k;
  const isFitNow = currentK <= targetK + 0.01;

  // 直接构造 transform / bypass computeCenterTransform 的 currentK 锁
  const tx = visCenterVB.x - bboxCenterX * targetK;
  const ty = visCenterVB.y - bboxCenterY * targetK;
  const ct = { k: targetK, x: tx, y: ty };

  // 选中高亮（Q4 1：两端 obs + 弧都亮 / 默认无展开 / 状态在 popover DOM）
  applyArcSelection(pathEl, r, null);

  // 装得下 → 单击自动飞 / 装不下 → 不飞（用户自己导航或点 popover fit 按钮）
  if (isFitNow) {
    flyToTarget(svg, zoomCtrl.zoomBehavior, ct, 600);
  }

  // 总是弹 arc-popover
  const sourceClaim = claimById.get(r.source);
  const targetClaim = claimById.get(r.target);
  if (!sourceClaim || !targetClaim) return;
  const sourceAuthor = persons.find((p) => p.id === sourceClaim.author_id)?.name_zh ?? '?';
  const targetAuthor = persons.find((p) => p.id === targetClaim.author_id)?.name_zh ?? '?';

  showArcPopover({
    relation: r,
    source: sourceClaim,
    target: targetClaim,
    sourceAuthor,
    targetAuthor,
    isFitNow,
    onFitClick: () => {
      // 强制飞行（装不下情况用户主动触发）
      flyToTarget(svg, zoomCtrl.zoomBehavior, ct, 600);
    },
    onObsExpand: (obsId) => {
      applyArcSelection(pathEl, r, obsId);
    },
    onObsCollapse: () => {
      applyArcSelection(pathEl, r, null);
    },
    onFocusPreview: (obsId) => {
      applyHoverPreviewFiltering(computeFocusSet(obsId));
    },
    onFocusLeavePreview: () => {
      clearHoverPreviewFiltering();
    },
    onEnterFocus: (obsId) => {
      // 退出 arc 选中 + 进 Stage 4 焦点模式（以展开侧 obs 为根）
      restoreArcOpacity();
      hideArcPopover();
      enterFocusMode(obsId);
    },
    onClose: () => {
      restoreArcOpacity();
    },
  });
}

// R2 · arc 选中视觉应用（Q4 1：选中弧 stroke-width 2.5 / 选中 obs 圆点 r=6 +紫描边）
//   展开侧规则：obsId=null → source + target 都亮 / obsId='xxx' → 仅该 obs 亮
function applyArcSelection(
  pathEl: SVGPathElement,
  r: ClaimRelation,
  expandedObsId: string | null,
): void {
  // 1. 复原其他弧
  d3.selectAll<SVGPathElement, ClaimRelation>('path.arc').each(function (rel) {
    if (this === pathEl) return;
    const style = getArcStyle(rel.type);
    d3.select(this)
      .interrupt()
      .attr('stroke-width', style.strokeWidth)
      .attr('opacity', style.opacity);
  });
  // 2. 高亮选中弧
  d3.select(pathEl)
    .raise()
    .interrupt()
    .transition()
    .duration(300)
    .attr('stroke-width', 2.5)
    .attr('opacity', 1.0);
  // 3. obs 圆点高亮
  d3.selectAll<SVGCircleElement, unknown>('circle.obs-dot').attr('r', 2.3).attr('stroke', null);
  const obsIdsToHighlight = expandedObsId !== null ? [expandedObsId] : [r.source, r.target];
  obsIdsToHighlight.forEach((id) => {
    document
      .querySelectorAll<SVGGElement>(`g.obs[data-claim-id="${id}"] circle.obs-dot`)
      .forEach((el) => {
        d3.select(el).attr('r', 5).attr('stroke', '#fcfaf6').attr('stroke-width', 2);
      });
  });
}

// Stage 5 R2 · 复原所有弧线 + obs 圆点 + 清 selectedArc state（点其他弧线 / 点 obs / 点空白时调）
// B1 polish DR-085 Issue 3 fix · 追加清 search 选定 + 复原全画布 opacity
//   原 bug：search highlight 状态下点 obs → arc 复原 ✓ / obs-dot stroke 复原 ✓ /
//          但 g.obs opacity（search 设的 fade 0.15）残留 ✗
//   根因：M5 时代写时 g.obs opacity 唯一源头是 timeline filter / B1 highlightObs 多动了这维度
//   修法：restoreArcOpacity 末尾调 applyTimelineFiltering 重设全画布 opacity / focus mode 下不动
function restoreArcOpacity(): void {
  d3.selectAll<SVGPathElement, ClaimRelation>('path.arc').each(function (r) {
    const style = getArcStyle(r.type);
    d3.select(this)
      .interrupt()
      .attr('stroke-width', style.strokeWidth)
      .attr('opacity', style.opacity);
  });
  // R2 · obs 圆点恢复 r=2.3 + 无 stroke
  d3.selectAll<SVGCircleElement, unknown>('circle.obs-dot').attr('r', 2.3).attr('stroke', null);
  // DR-087 · 清 obs-text 加粗（systematic 复原）
  d3.selectAll<SVGTextElement, unknown>('text.obs-text').attr('font-weight', null);
  // B1 polish DR-085 · 清 search 选定 + 复原全画布 opacity（focus mode 下不动）
  if (inFocusMode) return;
  searchFocusClaimId = null;
  const cy = timelineApi?.getCurrentYear() ?? INITIAL_CURSOR_YEAR;
  applyTimelineFiltering(cy);
}

// ============================================================
// B1 polish D9 DR-094 · obs 紫圈 spring 弹出动效
//   obs click 选中 + search onSelect 选中 / 紫圈出场 220ms spring scale 0.5→1.2→1.0
//   CSS @keyframes obs-spring 在 styles.css / 这里只做 class toggle + force reflow restart
// ============================================================
function triggerObsSpring(claimId: string): void {
  const obsGroups = document.querySelectorAll<SVGGElement>(`g.obs[data-claim-id="${claimId}"]`);
  obsGroups.forEach((g) => {
    // remove + force reflow + re-add · 让 animation 每次 highlight 都重新跑
    g.classList.remove('obs-spring-enter');
    void g.getBoundingClientRect();
    g.classList.add('obs-spring-enter');
    g.addEventListener('animationend', () => g.classList.remove('obs-spring-enter'), {
      once: true,
    });
  });
}

// ============================================================
// B1 T4.1 + polish DR-085 · 搜索结果高亮 API（spec § 3.3.3）
//   highlightObs(claimId)：set searchFocusClaimId state + 紫圈 obs-dot stroke + applyHoverPreviewFiltering(focusSet)
//     - 复用 focusSet · 含 obs + 关联 obs + 提出者 person section（坑 1 一致性 · 跟 hover 同 visual）
//     - obs-dot 紫圈 = search commit 标记 / 区分 hover transient 无圈
//   clearSearchHighlight()：清 state + 复原 obs-dot + 恢复 timeline filtering（focus mode 下不动）
//   视觉沿用既有 highlightArcAndDots pattern（米白 #fcfaf6 stroke / r=5 / width=2）
// ============================================================
function highlightObs(claimId: string): void {
  searchFocusClaimId = claimId;
  // 1. 复原所有 obs-dot stroke + obs-text 加粗（防多次调累积）
  d3.selectAll<SVGCircleElement, unknown>('circle.obs-dot').attr('r', 2.3).attr('stroke', null);
  d3.selectAll<SVGTextElement, unknown>('text.obs-text').attr('font-weight', null);
  // 2. 选中 obs · 紫圈 + obs-text 加粗（DR-087 visual indicator · search 跟 click 视觉一致）
  document
    .querySelectorAll<SVGCircleElement>(`g.obs[data-claim-id="${claimId}"] circle.obs-dot`)
    .forEach((el) => {
      d3.select(el).attr('r', 5).attr('stroke', '#fcfaf6').attr('stroke-width', 2);
    });
  document
    .querySelectorAll<SVGTextElement>(`g.obs[data-claim-id="${claimId}"] text.obs-text`)
    .forEach((el) => {
      d3.select(el).attr('font-weight', '700');
    });
  // 3. 复用 focusSet visual · 含 obs + 关联 obs + 提出者 person（DR-085 坑 1 一致性）
  applyHoverPreviewFiltering(computeFocusSet(claimId));
  // 4. D9 spring 弹出（search highlight 路径）
  triggerObsSpring(claimId);
}

function clearSearchHighlight(): void {
  searchFocusClaimId = null;
  // 1. 复原 obs-dot 默认 r + 无 stroke + obs-text 加粗（DR-087）
  d3.selectAll<SVGCircleElement, unknown>('circle.obs-dot').attr('r', 2.3).attr('stroke', null);
  d3.selectAll<SVGTextElement, unknown>('text.obs-text').attr('font-weight', null);
  // 2. focus mode 下不破坏 focus state · 否则恢复到当前 timeline state
  if (inFocusMode) return;
  const cy = timelineApi?.getCurrentYear() ?? INITIAL_CURSOR_YEAR;
  applyTimelineFiltering(cy);
}

// B1 polish DR-085 · 全局 Esc 清 search 状态
//   场景：state1 时 popover 已 hide（onSelect 后 popover hide / Esc 监听已 detach）
//   补全局 listener 让 Esc 在 state1 任何时候都能清搜索高亮 + 退出搜索选择模式
//   跟既有 popover Esc listener 并存安全（clearSearchHighlight 幂等）
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && searchFocusClaimId !== null) {
    clearSearchHighlight();
  }
});

// DR-058 · zoom-fit 接受紧凑后的新坐标 Map（不再用原 claimIdToCoords）
// Stage 5 R2 polish · bbox center 飞到 visCenterVB 而非 viewBox center
//   原 bug：bbox center 飞到 canvasWidth/2,canvasHeight/2 (viewBox 中心) / 焦点元素显示在屏幕中
//   focus 模式后用户大概率点 focus obs 弹 popover（380px 占右）/ 屏幕中心元素被遮挡
//   修法：visCenterVB = popover-offset 后可见区中心 / 焦点元素天然在可见区中心 / 后续开 popover 不再抖动
//   tradeoff：focus 模式 popover 关时元素偏左 (PM 反馈 "关详情卡再调回" 留 polish 二期 hook hideClaimPopover)
function zoomFitToFocusCoords(obsCoordsMap: Map<string, { x: number; y: number }>): void {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const coords of obsCoordsMap.values()) {
    if (coords.x < minX) minX = coords.x;
    if (coords.y < minY) minY = coords.y;
    if (coords.x > maxX) maxX = coords.x;
    if (coords.y > maxY) maxY = coords.y;
  }
  if (!isFinite(minX)) return;

  const padX = 200;
  const padY = 80;
  const bboxW = maxX - minX + 2 * padX;
  const bboxH = maxY - minY + 2 * padY;
  const bboxCenterX = (minX + maxX) / 2;
  const bboxCenterY = (minY + maxY) / 2;

  // R2 polish · 算可见区中心 + 可见区 viewBox 尺寸
  const SIDEBAR_PX = 48;
  const POPOVER_PX = 380; // focus 模式预留 popover (用户大概率立即开 popover 看 obs)
  const HEADER_PX = 70;
  const TIMELINE_PX = 60;
  const visPxW = window.innerWidth - SIDEBAR_PX - POPOVER_PX;
  const visPxH = window.innerHeight - HEADER_PX - TIMELINE_PX;
  const visPxX = SIDEBAR_PX + visPxW / 2;
  const visPxY = HEADER_PX + visPxH / 2;
  const svgNode = svg.node();

  let targetK: number;
  let visCenter: { x: number; y: number };
  const rect = svgNode?.getBoundingClientRect();
  const vb = svgNode?.viewBox.baseVal;
  if (svgNode && rect && vb && vb.width > 0 && vb.height > 0 && rect.width > 0 && rect.height > 0) {
    const meetScale = Math.min(rect.width / vb.width, rect.height / vb.height);
    const visibleVBWidth = visPxW / meetScale;
    const visibleVBHeight = visPxH / meetScale;
    targetK = Math.min(visibleVBWidth / bboxW, visibleVBHeight / bboxH, 8);
    visCenter = pixelToViewBox(svgNode, visPxX, visPxY);
  } else {
    // fallback (test/jsdom / SVG 未挂)：回退到 viewBox 中心 + canvas 全宽算 fit
    targetK = Math.min(canvasWidth / bboxW, canvasHeight / bboxH, 8);
    visCenter = { x: canvasWidth / 2, y: canvasHeight / 2 };
  }

  const tx = visCenter.x - bboxCenterX * targetK;
  const ty = visCenter.y - bboxCenterY * targetK;

  svg
    .transition()
    .duration(600)
    .call(zoomCtrl.zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(targetK));
}

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

// === 10. B1 T1.1-T1.3 · header controls（互换 + 关于 + 视觉灵感 + Stage 2 search slot）===
// PM 2026-05-20 选 B · 沿用 M4 米白透明 / brand h1 + 副标题 保留 index.html
const headerContainer = document.createElement('div');
headerContainer.id = 'header-controls-fixed';
document.body.appendChild(headerContainer);
const headerApi = mountHeader({ container: headerContainer });

// === 10.1 B1 T2.1 · search input mount 到 header search slot ===
// === 10.2 B1 T3.1 + T3.3 + T3.4 · 双形态 popover wire up（DR-078 PM mockup 拍板）===
//   空 query → showExplore（3 段 chip · 主要人物/核心概念/关键时段）
//   非空 query → showGrouped（按 author_id 分组 + § 概念命中段）
//   chip click → 填搜索框 + 切结果形态
//   T3.2 后加 debounce 200ms · T4.1 接真主图 highlight
let popoverApi: SearchResultPopoverApi | null = null;

// persons Map for showGrouped 人物名 lookup
const personsMap = new Map(persons.map((p) => [p.id, p]));

const exploreLists = {
  persons: MAIN_PERSONS,
  concepts: CORE_CONCEPTS,
  periods: KEY_PERIODS,
};

function handleSearch(q: string): void {
  if (!q.trim()) {
    popoverApi?.showExplore(exploreLists, handleChipClick);
    return;
  }
  const results = runSearchIndex({ claims, persons }, q, 50);
  const conceptHit = isExactConceptHit(q);
  if (results.length === 0 && !conceptHit) {
    popoverApi?.hide();
    return;
  }
  popoverApi?.showGrouped(results, personsMap, q, conceptHit);
}

function handleChipClick(text: string): void {
  searchApi.input.value = text;
  searchApi.input.focus();
  handleSearch(text);
}

const searchApi = mountSearchInput({
  container: headerApi.searchSlot,
  onInput: handleSearch,
  debounceMs: 200,
});

popoverApi = mountResultPopover({
  anchor: searchApi.input,
  onSelect: (item) => {
    // T4.1 + DR-086 · 主图高亮 + 详情卡直达
    //   claim type（非 concept 占位 id）→
    //     1. dispatch obs click event 复用既有 obs click handler 完整流程（flyTo + showClaimPopover）
    //     2. 既有 obs click 内调 restoreArcOpacity 会清 search 状态 → 立即 highlightObs 重新设
    //   注：computeFlyTransform 是 obsG sectionG.each 闭包局部 / 外部不可用 / dispatch event 复用最干净
    if (item.type === 'claim' && !item.id.startsWith('concept-')) {
      const obsElement = document.querySelector<SVGGElement>(`g.obs[data-claim-id="${item.id}"]`);
      if (obsElement) {
        obsElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
      // obs click 内 restoreArcOpacity 清了 search state · 立即 re-apply 紫圈 + fade
      highlightObs(item.id);
    }
    // T4.3 · 副图高亮 hook（B1 期间无 listener / B2 副图按 type 选择性 listen）
    //   所有 type 都 dispatch（含 claim · 让 B2 副图地理图也能高亮选中 obs 对应的地理位置）
    window.dispatchEvent(
      new CustomEvent('marx:search-highlight', {
        detail: { type: item.type, id: item.id },
      }),
    );
  },
  // T4.1 · Esc / 点空白关浮窗时清搜索高亮（选中 candidate 后 hide 不走 onClose · 高亮保留）
  onClose: clearSearchHighlight,
});

// 搜索框 focus + click → 统一走 handleSearch（PM bug 修 2026-05-21 R2）
//   - 用 click 而非 focus / 因为关闭浮窗时 input 仍保持 focus state / 再次 click 不触发 focus event
//   - focus event 仍监听 / 兼顾键盘 tab 切到 input 场景
//   - reopen guard · 已 open 不重复 mount（避免 1 帧 flicker）
//   - empty value → handleSearch 内自动 showExplore
//   - 非 empty value → handleSearch 内自动 showGrouped
function reopenSearchPopover(): void {
  if (popoverApi?.isOpen()) return;
  handleSearch(searchApi.input.value);
}
searchApi.input.addEventListener('focus', reopenSearchPopover);
searchApi.input.addEventListener('click', reopenSearchPopover);

console.log(
  '[Marx M-B1] render complete · timeline + sidebar + header-controls + search + popover mounted',
);

// === M-B2 T1.3 · Stage 1 prototype 临时挂载（主画面右上 300×200 浮窗） ===
// 不删 M5 主图 / 不动 B1 header + claim-popover 主流程
// Stage 2 接真 obs 数据 + great circle 关系连线 + timeline 联动后下线临时浮窗
const protoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
protoSvg.setAttribute('width', '300');
protoSvg.setAttribute('height', '200');
protoSvg.style.cssText =
  'position:fixed;right:10px;top:50px;background:#fcfaf6;border:1px solid #d8cab0;z-index:1000';
document.body.appendChild(protoSvg);
const protoApi = mountGeographicCanvas({
  container: protoSvg,
  width: 300,
  height: 200,
  initialMode: 'sphere',
  marxCurrentLocation: [10, 50],
});
(window as unknown as { protoApi: typeof protoApi }).protoApi = protoApi; // PM console 调
