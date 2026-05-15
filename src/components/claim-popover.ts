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

// Stage 2 R4 PM checkpoint 改造（4 issue 一起修）：
//   Issue #1 · 工具栏点击不关详情卡 → outsideHandler 加白名单
//   Issue #2 · 同 claim 不重复动画 → showClaim 加 same-claim guard
//   Issue #3 · 多 popover 堆叠 → hideClaim 改 querySelectorAll + 防御 cleanup
//   Issue #4 · 动画稍慢 → 滑入 450ms easeOutQuart / 滑出 200ms easeInQuart（出快入慢）
//
// 行为约束 (PM 拍板 Q2/Q4 + R4 修订):
//   - 关闭 3 路: × 按钮 / Esc 键 / 点击 svg 画布空白 (工具栏点击不关)
//   - 切换 claim 时：旧 popover 200ms 滑出 → 等结束 → 新 popover 450ms 滑入（sequence）
//   - 同 claim 重点击：early return / 无动画

const SHOW_DURATION_MS = 450;
const HIDE_DURATION_MS = 200;
const SHOW_TRANSITION = `transform ${SHOW_DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`; // easeOutQuart
const HIDE_TRANSITION = `transform ${HIDE_DURATION_MS}ms cubic-bezier(0.55, 0.06, 0.68, 0.19)`; // easeInQuart

// Stage 2 R4 Issue #3 · pending show cancellation（防 rapid click race condition）
let _pendingShowTimer: ReturnType<typeof setTimeout> | null = null;

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
  // Stage 2 R4 Issue #2 · same-claim guard: 同 claim 重点击 early return
  const existing = document.querySelector<HTMLElement>('.claim-popover');
  if (existing && existing.dataset.claimId === claim.id && existing.dataset.state !== 'closing') {
    return; // 已显示同 claim / 跳过 hide+show
  }

  // Stage 2 R4 Issue #3 · cancel pending show（rapid click 防 race）
  if (_pendingShowTimer) {
    clearTimeout(_pendingShowTimer);
    _pendingShowTimer = null;
  }

  // 不同 claim 已显示中 → 先 hide / 等 HIDE_DURATION_MS sequence
  if (existing && existing.dataset.state !== 'closing') {
    hideClaimPopover(); // 触发 200ms 滑出
    _pendingShowTimer = setTimeout(() => {
      _pendingShowTimer = null;
      // 防御性 cleanup（rapid click 残留）
      document.querySelectorAll('.claim-popover').forEach((el) => el.remove());
      _doShowClaim(claim, ctx);
    }, HIDE_DURATION_MS);
    return;
  }

  // 无 existing 或 existing 已 closing → 立即 show + 防御性 cleanup
  document.querySelectorAll('.claim-popover').forEach((el) => el.remove());
  _doShowClaim(claim, ctx);
}

function _doShowClaim(claim: ClaimNode, ctx: ClaimPopoverContext) {
  const sidebar = document.createElement('aside');
  sidebar.className = 'claim-popover';
  sidebar.dataset.claimId = claim.id; // Issue #2 · same-claim guard 用
  // PM R2 Fix 2 · 详情卡 bottom 0 → 160px (DR-047)
  // PM R3 Fix 2 · 160 → 100px (DR-050 timeline 瘦身后同步)
  //   bottom:100px 跟 main.ts padding-bottom:100px 一致 / 跟 TIMELINE_PX 同步
  //   详情卡只占屏幕中部 → timeline 底部完全可见可拖
  sidebar.style.cssText = `
    position:fixed;
    top:0;
    right:0;
    bottom:100px;
    width:380px;
    background:#fcfaf6;
    border-left:1px solid #d8cab0;
    box-shadow:-4px 0 18px rgba(58,35,96,0.10);
    padding:28px 32px 36px;
    overflow-y:auto;
    transform:translateX(100%);
    transition:${SHOW_TRANSITION};
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
      word-break:break-word;
      overflow-wrap:anywhere;
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

  // Stage 2 PM checkpoint Issue 2.3 修：用 click 不用 mousedown
  // 原因：d3.zoom 在 SVG 上 `mousedown.zoom` 调 nopropagation(event) = stopImmediatePropagation()
  // 阻止 document 层 mousedown listener 触发 / outsideHandler 永不 fire
  // click 事件 d3.zoom 不监听 / 正常 bubble 到 document
  // setTimeout 0 trick 仍然必要（防"打开本次 click"立即被识别为外部关闭）
  // Stage 2 R4 Issue #1 修：工具栏点击不关详情卡（人在看内容时点工具栏 / 不应关）
  //   工具栏 = 左 sidebar 筛选 / 左下 zoom-control / 底部 timeline
  //   只在点 svg 画布空白时关 / 点 popover 自己也不关
  const outsideHandler = (e: MouseEvent) => {
    if (sidebar.contains(e.target as Node)) return;
    const target = e.target as Element;
    if (
      target.closest('.sidebar') || // 左侧筛选 sidebar
      target.closest('.zoom-control') || // 左下缩放控件
      target.closest('#timeline-fixed') // 底部时间轴
    ) {
      return; // 工具栏点击不关
    }
    hideClaimPopover();
  };
  const outsideTimer = setTimeout(() => document.addEventListener('click', outsideHandler), 0);
  const sidebarAny = sidebar as unknown as {
    _outsideHandler: (e: MouseEvent) => void;
    _outsideTimer: ReturnType<typeof setTimeout>;
  };
  sidebarAny._outsideHandler = outsideHandler;
  sidebarAny._outsideTimer = outsideTimer;
}

export function hideClaimPopover() {
  // Stage 2 R4 Issue #3 修：querySelector → querySelectorAll
  // 原因：之前只关 first .claim-popover / 多个堆叠时其他不动 / 多次 click 累积
  // 现在遍历全部 / 每个独立 close
  const existings = document.querySelectorAll<HTMLElement>('.claim-popover');
  existings.forEach((el) => {
    if (el.dataset.state === 'closing') return; // idempotent

    el.dataset.state = 'closing';

    // 立即清掉 listeners (滑出期间不再响应任何点击 / 键盘)
    const meta = el as unknown as {
      _escHandler?: (e: KeyboardEvent) => void;
      _outsideHandler?: (e: MouseEvent) => void;
      _outsideTimer?: ReturnType<typeof setTimeout>;
    };
    if (meta._escHandler) document.removeEventListener('keydown', meta._escHandler);
    if (meta._outsideHandler) document.removeEventListener('click', meta._outsideHandler);
    if (meta._outsideTimer) clearTimeout(meta._outsideTimer);

    // Stage 2 R4 Issue #4 · 滑出用快 transition (200ms easeInQuart / 出快入慢)
    el.style.transition = HIDE_TRANSITION;
    el.style.transform = 'translateX(100%)';

    setTimeout(() => el.remove(), HIDE_DURATION_MS);
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
