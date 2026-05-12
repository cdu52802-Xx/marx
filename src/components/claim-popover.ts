// M4 T9 (改造) · 详情右侧栏（spec § 8.2 单点深入 · 2026-05-12 PM 反馈调整）
// 形态: 右侧 fixed 滑入栏 (380px 全高) · 取代鼠标浮动小卡片
// className/函数名保留 (.claim-popover / showClaimPopover) 向后兼容 main.ts + 测试 selector
//
// 视觉约束 (hybrid · PM 拍板 Q3):
//   - 编排骨架借 editorial: kicker / h2 / orig / meta(small-caps 横线) / —— section-label / blockquote
//   - 颜色字体沿用 M4: 紫 #5b3a8c 主导 / 绿 #7a9a5a agreement / 红橘 #b8654a disagreement / EB Garamond
// 行为约束 (PM 拍板 Q2/Q4):
//   - position:fixed right:0 top:0 bottom:0 width:380px · 朋友项目 (philosophy_vis) 风格
//   - transform translateX(100% → 0) 0.35s cubic-bezier 滑入动画
//   - 关闭 3 路: × 按钮 / Esc 键 / 点击侧栏外 mousedown
//   - 关闭立即 remove DOM (滑出动画落 polish backlog)

import type { ClaimNode } from '../types/Claim.ts';

export interface ClaimPopoverContext {
  authorName: string;
  sourceWorkName?: string;
  agreementClaims: { id: string; author: string; text: string }[];
  disagreementClaims: { id: string; author: string; text: string }[];
}

const CATS_LABELS: Record<string, string> = {
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

export function showClaimPopover(claim: ClaimNode, ctx: ClaimPopoverContext) {
  hideClaimPopover();

  const sidebar = document.createElement('aside');
  sidebar.className = 'claim-popover';
  sidebar.style.cssText = `
    position:fixed;
    top:0;
    right:0;
    bottom:0;
    width:380px;
    background:#fcfaf6;
    border-left:1px solid #d8cab0;
    box-shadow:-4px 0 18px rgba(58,35,96,0.10);
    padding:28px 32px 36px;
    overflow-y:auto;
    transform:translateX(100%);
    transition:transform 0.35s cubic-bezier(0.2,0.8,0.2,1);
    z-index:1000;
    font-family:'EB Garamond','Georgia',serif;
    color:#2a2a2a;
    box-sizing:border-box;
  `;

  const catsText = claim.cats.map((c) => CATS_LABELS[c] ?? c).join(' · ');
  const metaParts = [`${claim.year}`];
  if (ctx.sourceWorkName) metaParts.push(ctx.sourceWorkName);
  if (catsText) metaParts.push(catsText);

  sidebar.innerHTML = `
    <button class="popover-close" aria-label="关闭" style="
      position:absolute;
      top:14px;
      right:18px;
      background:none;
      border:none;
      font-size:22px;
      line-height:1;
      color:#888;
      cursor:pointer;
      padding:4px 8px;
      font-family:inherit;
    ">×</button>

    <div class="kicker" style="
      font-family:'EB Garamond',Georgia,serif;
      font-style:italic;
      font-size:13px;
      color:#5b3a8c;
      letter-spacing:0.06em;
      margin-bottom:6px;
    ">§ Claim · ${ctx.authorName}</div>

    <h2 style="
      font-family:'EB Garamond',Georgia,serif;
      font-size:28px;
      font-weight:600;
      margin:0 0 4px;
      line-height:1.2;
      color:#2a2a2a;
    ">${escapeHtml(claim.name_zh ?? claim.keywords ?? '观点')}</h2>
    ${
      claim.name_orig
        ? `<div style="
            font-family:'EB Garamond',Georgia,serif;
            font-style:italic;
            font-size:15px;
            color:#888;
            letter-spacing:0.02em;
            margin-top:2px;
          ">${escapeHtml(claim.name_orig)}</div>`
        : ''
    }

    <div class="meta" style="
      font-family:'EB Garamond',Georgia,serif;
      font-size:12px;
      color:#888;
      border-top:1px solid #d8cab0;
      border-bottom:1px solid #d8cab0;
      padding:8px 0;
      margin:16px 0 22px;
      font-variant:small-caps;
      letter-spacing:0.08em;
    ">${metaParts.join(' · ')}</div>

    <div class="section-label" style="
      font-family:'EB Garamond',Georgia,serif;
      font-style:italic;
      color:#5b3a8c;
      font-size:14px;
      letter-spacing:0.04em;
      display:flex;
      align-items:center;
      gap:10px;
      margin:22px 0 10px;
    ">
      <span style="flex:0 0 24px;height:1px;background:#5b3a8c;"></span>
      <span>主张</span>
    </div>
    <blockquote style="
      margin:0;
      padding:4px 0 4px 14px;
      border-left:4px solid #5b3a8c;
      font-family:'EB Garamond',Georgia,serif;
      font-style:italic;
      font-size:15px;
      line-height:1.7;
      color:#2a2a2a;
    ">${escapeHtml(claim.claim_text)}</blockquote>

    ${
      ctx.agreementClaims.length > 0
        ? `
      <div class="section-label" style="
        font-family:'EB Garamond',Georgia,serif;
        font-style:italic;
        color:#5b3a8c;
        font-size:14px;
        letter-spacing:0.04em;
        display:flex;
        align-items:center;
        gap:10px;
        margin:24px 0 8px;
      ">
        <span style="flex:0 0 24px;height:1px;background:#5b3a8c;"></span>
        <span>影响</span>
        <span style="font-size:11px;color:#aaa;font-style:normal;">${ctx.agreementClaims.length} 条</span>
      </div>
      ${ctx.agreementClaims
        .map(
          (a) => `
        <div class="successor" style="
          margin:10px 0;
          padding:10px 12px;
          background:rgba(122,154,90,0.06);
          border-left:2px solid #7a9a5a;
        ">
          <h4 style="
            margin:0 0 4px;
            font-family:'EB Garamond',Georgia,serif;
            font-size:14px;
            font-weight:600;
            color:#2a2a2a;
          ">→ ${escapeHtml(a.author)} <em style="color:#7a9a5a;font-weight:400;font-size:12px;">· 同意</em></h4>
          <p style="
            margin:0;
            font-family:'EB Garamond',Georgia,serif;
            font-size:13px;
            line-height:1.65;
            color:#4a4a4a;
            font-style:italic;
          ">${escapeHtml(a.text)}</p>
        </div>`,
        )
        .join('')}
    `
        : ''
    }

    ${
      ctx.disagreementClaims.length > 0
        ? `
      <div class="section-label" style="
        font-family:'EB Garamond',Georgia,serif;
        font-style:italic;
        color:#5b3a8c;
        font-size:14px;
        letter-spacing:0.04em;
        display:flex;
        align-items:center;
        gap:10px;
        margin:24px 0 8px;
      ">
        <span style="flex:0 0 24px;height:1px;background:#5b3a8c;"></span>
        <span>反驳</span>
        <span style="font-size:11px;color:#aaa;font-style:normal;">${ctx.disagreementClaims.length} 条</span>
      </div>
      ${ctx.disagreementClaims
        .map(
          (d) => `
        <div class="successor" style="
          margin:10px 0;
          padding:10px 12px;
          background:rgba(184,101,74,0.06);
          border-left:2px solid #b8654a;
        ">
          <h4 style="
            margin:0 0 4px;
            font-family:'EB Garamond',Georgia,serif;
            font-size:14px;
            font-weight:600;
            color:#2a2a2a;
          ">← ${escapeHtml(d.author)} <em style="color:#b8654a;font-weight:400;font-size:12px;">· 反驳</em></h4>
          <p style="
            margin:0;
            font-family:'EB Garamond',Georgia,serif;
            font-size:13px;
            line-height:1.65;
            color:#4a4a4a;
            font-style:italic;
          ">${escapeHtml(d.text)}</p>
        </div>`,
        )
        .join('')}
    `
        : ''
    }

    ${
      claim.reference
        ? `<div style="
            font-family:'EB Garamond',Georgia,serif;
            font-size:11px;
            color:#888;
            margin-top:28px;
            padding-top:12px;
            border-top:1px dotted #d8cab0;
            font-style:italic;
            word-break:break-all;
          ">出处: ${escapeHtml(claim.reference)}</div>`
        : ''
    }
  `;

  document.body.appendChild(sidebar);

  // 强制 reflow 触发 translateX(100% → 0) 滑入动画
  void sidebar.offsetWidth;
  sidebar.style.transform = 'translateX(0)';

  // × 按钮关闭
  (sidebar.querySelector('.popover-close') as HTMLElement).addEventListener(
    'click',
    hideClaimPopover,
  );

  // Esc 键关闭
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') hideClaimPopover();
  };
  document.addEventListener('keydown', escHandler);
  (sidebar as unknown as { _escHandler: (e: KeyboardEvent) => void })._escHandler = escHandler;

  // 点击侧栏外关闭 (mousedown · delay 1 tick 防止"打开本次点击"立即被识别为外部关闭)
  // 用 cancellable timer + flag: 如果 sidebar 在 timer 触发前已 hide (e.g. Esc 立即关闭),
  // clearTimeout 取消注册, 避免残留 listener 污染后续 (jsdom 测试环境必修)
  const outsideHandler = (e: MouseEvent) => {
    if (!sidebar.contains(e.target as Node)) hideClaimPopover();
  };
  const outsideTimer = setTimeout(
    () => document.addEventListener('mousedown', outsideHandler),
    0,
  );
  const sidebarAny = sidebar as unknown as {
    _outsideHandler: (e: MouseEvent) => void;
    _outsideTimer: ReturnType<typeof setTimeout>;
  };
  sidebarAny._outsideHandler = outsideHandler;
  sidebarAny._outsideTimer = outsideTimer;
}

export function hideClaimPopover() {
  const existing = document.querySelector('.claim-popover') as HTMLElement | null;
  if (!existing) return;
  if (existing.dataset.state === 'closing') return; // 已在关闭流程, idempotent

  existing.dataset.state = 'closing';

  // 立即清掉 listeners (滑出 350ms 期间不再响应任何点击 / 键盘)
  const meta = existing as unknown as {
    _escHandler?: (e: KeyboardEvent) => void;
    _outsideHandler?: (e: MouseEvent) => void;
    _outsideTimer?: ReturnType<typeof setTimeout>;
  };
  if (meta._escHandler) document.removeEventListener('keydown', meta._escHandler);
  if (meta._outsideHandler) document.removeEventListener('mousedown', meta._outsideHandler);
  if (meta._outsideTimer) clearTimeout(meta._outsideTimer);

  // 触发滑出动画 (transform translateX(0) → 100%, 沿用 show 时的 0.35s cubic-bezier transition)
  existing.style.transform = 'translateX(100%)';

  // 350ms 后 remove DOM (匹配 transition duration)
  setTimeout(() => existing.remove(), 350);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
