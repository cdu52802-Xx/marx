// M4 T9 · 详情卡 popover 组件（spec § 8.2 单点深入）
// 点击 obs 圆点 / claim_text → 弹出含 claim 全部字段 + 关联 person / work / 影响关系
//
// 视觉硬约束（沿用 T6/T7/T8）：
//   - position: fixed + 视口坐标（event.clientX/Y + offset）→ 画布 scroll 不影响 popover
//   - 边界 clamp: Math.min(x, window.innerWidth - 320) 防止超出视口右/下
//   - 米白 #fffef8 卡片底（比画布 #fcfaf6 略浅 / 区分卡片）
//   - 紫 #5b3a8c 边框（spec § 4.2 主导色）
//   - EB Garamond / Georgia serif（与画布一致）
//   - 绿 #7a9a5a agreement 关联文字 / 红 #b8654a disagreement 关联文字
//   - 关闭交互: × 按钮 + Esc 键（点击外部关闭留 T13 polish）

import type { ClaimNode } from '../types/Claim.ts';

export interface ClaimPopoverContext {
  authorName: string;
  sourceWorkName?: string;
  agreementClaims: { id: string; author: string; text: string }[]; // claim 影响 → 哪些后续 claim
  disagreementClaims: { id: string; author: string; text: string }[]; // 反驳 → 哪些 claim
}

export function showClaimPopover(
  claim: ClaimNode,
  position: { x: number; y: number },
  ctx: ClaimPopoverContext,
) {
  hideClaimPopover(); // 先关闭已有

  const popover = document.createElement('div');
  popover.className = 'claim-popover';
  popover.style.cssText = `
    position:fixed;
    left:${Math.min(position.x, window.innerWidth - 320)}px;
    top:${Math.min(position.y, window.innerHeight - 300)}px;
    width:300px;
    background:#fffef8;
    border:1px solid #5b3a8c;
    box-shadow:2px 3px 8px rgba(0,0,0,0.15);
    padding:14px 16px;
    font-family:'EB Garamond','Georgia',serif;
    z-index:1000;
    font-size:12px;
    line-height:1.5;
  `;

  const catsLabels: Record<string, string> = {
    me: '形而上',
    ep: '认识论',
    lo: '逻辑',
    et: '伦理',
    po: '政治',
    ae: '美学',
    re: '宗教',
    mi: '心灵',
    la: '语言',
    sc: '科学',
    mp: '元哲学',
  };

  popover.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:start;border-bottom:1px solid #e8e0d0;padding-bottom:6px;margin-bottom:8px">
      <div>
        <div style="font-weight:700;color:#222;letter-spacing:0.5px;text-transform:uppercase;font-size:13px">${ctx.authorName}</div>
        ${ctx.sourceWorkName ? `<div style="color:#888;font-style:italic;font-size:10px">${ctx.sourceWorkName} · ${claim.year}</div>` : ''}
      </div>
      <div class="popover-close" style="cursor:pointer;color:#888;font-size:16px;line-height:1">×</div>
    </div>
    <div style="font-size:11px;color:#aaa;font-style:italic;margin-bottom:6px">
      ${claim.keywords ?? ''} · cats: ${claim.cats.map((c) => catsLabels[c] ?? c).join(', ')}
    </div>
    <div style="color:#222;font-style:italic;margin-bottom:10px">
      "${claim.claim_text}"
    </div>
    ${
      ctx.agreementClaims.length > 0
        ? `
      <div style="font-size:11px;color:#888;margin-bottom:4px">影响：</div>
      ${ctx.agreementClaims.map((a) => `<div style="font-size:10px;color:#7a9a5a;font-style:italic;margin-left:8px">→ ${a.author}: ${a.text.slice(0, 40)}...</div>`).join('')}
    `
        : ''
    }
    ${
      ctx.disagreementClaims.length > 0
        ? `
      <div style="font-size:11px;color:#888;margin:6px 0 4px">反驳：</div>
      ${ctx.disagreementClaims.map((d) => `<div style="font-size:10px;color:#b8654a;font-style:italic;margin-left:8px">← ${d.author}: ${d.text.slice(0, 40)}...</div>`).join('')}
    `
        : ''
    }
    ${claim.reference ? `<div style="font-size:10px;color:#888;margin-top:8px;border-top:1px dotted #d8cab0;padding-top:6px">原文：${claim.reference}</div>` : ''}
  `;

  document.body.appendChild(popover);

  // 关闭交互
  (popover.querySelector('.popover-close') as HTMLElement).addEventListener(
    'click',
    hideClaimPopover,
  );

  // Esc 关闭
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') hideClaimPopover();
  };
  (popover as unknown as { _escHandler: (e: KeyboardEvent) => void })._escHandler = escHandler;
  document.addEventListener('keydown', escHandler);
}

export function hideClaimPopover() {
  const existing = document.querySelector('.claim-popover');
  if (existing) {
    const handler = (existing as unknown as { _escHandler?: (e: KeyboardEvent) => void })
      ._escHandler;
    if (handler) document.removeEventListener('keydown', handler);
    existing.remove();
  }
}
