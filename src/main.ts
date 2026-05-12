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

// 让 #app + body 允许横向 scroll (画布无限 / Engels 等长 section 不被裁)
app.style('overflow', 'auto').style('width', '100vw').style('height', '100vh');
document.documentElement.style.overflow = 'auto';
document.body.style.margin = '0';
document.body.style.background = '#fcfaf6';

const svg = app
  .append('svg')
  .attr('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`)
  .attr('width', canvasWidth) // 真实像素宽 (不再 100% fit-to-viewport)
  .attr('height', canvasHeight)
  .style('font-family', "'EB Garamond', Georgia, 'Source Serif 4', 'Noto Serif SC', serif")
  .style('background', '#fcfaf6')
  .style('display', 'block');

// 米白纸感背景 rect (spec § 4.1)
svg
  .append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', canvasWidth)
  .attr('height', canvasHeight)
  .attr('fill', '#fcfaf6');

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

svg
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

const sectionG = svg
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
    .style('cursor', 'pointer');

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

  // 点击 obs → popover 详情卡 stub（T9 实现完整版）
  obsG.on('click', (_event, claim) => {
    console.log('[Marx M4] obs clicked (T9 popover stub):', claim.id, claim.claim_text);
  });
});

console.log('[Marx M4] render complete');
