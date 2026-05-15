// M5 Stage 5 T8 · 点弧线 tooltip 关系类型 + 引用源
// spec § 7.4 · 单击半圆弧 → 两端 obs 进 viewport + 弧线高亮 + tooltip
//
// 行为约束：
//   - mount 幂等 / 重复调 mount 不堆叠
//   - show 自动 mount（懒挂）
//   - position:fixed pixel 坐标 / 屏幕坐标系 / 不跟 zoom 飞行
//   - pointer-events:none 不挡画布点击
//   - 关闭 = 调 hideArcTooltip / 或点画布空白 (main.ts 接 svg.on('click'))
//
// 视觉：米白底 + 紫色 label + 灰 italic reference / EB Garamond serif

const REL_LABEL: Record<string, string> = {
  agreement_with: '同意（agreement）',
  disagreement_with: '反对（disagreement）',
  extends: '延伸（extends）',
};

let tooltipEl: HTMLDivElement | null = null;

export function mountArcTooltip(): HTMLDivElement {
  // 幂等：已挂直接返回 / 检查 DOM 防 module reload 残留
  if (tooltipEl && document.body.contains(tooltipEl)) return tooltipEl;
  // DOM 防御 cleanup（防多个并存 / 比如 test reset 后 module 仍持引用）
  document.querySelectorAll('.arc-tooltip').forEach((el) => el.remove());

  tooltipEl = document.createElement('div');
  tooltipEl.className = 'arc-tooltip';
  tooltipEl.style.cssText = `
    position: fixed;
    display: none;
    background: #fcfaf6;
    border: 1px solid #1a1a1a;
    padding: 6px 10px;
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 12px;
    color: #1a1a1a;
    z-index: 12;
    pointer-events: none;
    max-width: 280px;
    box-shadow: 2px 4px 12px rgba(58, 35, 96, 0.12);
  `;
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

export interface ShowArcTooltipParams {
  x: number;
  y: number;
  relationType: string;
  reference?: string;
}

export function showArcTooltip(p: ShowArcTooltipParams): void {
  if (!tooltipEl || !document.body.contains(tooltipEl)) {
    mountArcTooltip();
  }
  const label = REL_LABEL[p.relationType] ?? p.relationType;
  const refHtml = p.reference
    ? `<div style="font-style:italic;color:#888;margin-top:2px;font-size:11px;">${escapeHtml(p.reference)}</div>`
    : '';
  tooltipEl!.innerHTML = `
    <div style="font-weight:600;color:#5b3a8c;">${escapeHtml(label)}</div>
    ${refHtml}
  `;
  tooltipEl!.style.left = `${p.x}px`;
  tooltipEl!.style.top = `${p.y}px`;
  tooltipEl!.style.display = 'block';
}

export function hideArcTooltip(): void {
  if (tooltipEl && document.body.contains(tooltipEl)) {
    tooltipEl.style.display = 'none';
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
