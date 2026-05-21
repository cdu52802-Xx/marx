// M5 Stage 5 R2 · arc-popover · 上下分栏 source/target 详情
// PM brainstorm 拍板 (Q1=B / Q2=两侧折叠 / Q3=X' / Q4=1):
//   - 单击弧线 → 触发 / 上下两 slot 默认折叠 / 顶部按钮 [fit | → 焦点 | ×]
//   - click obs-slot → 该侧展开 / 另侧折叠 / 画布该 obs 高亮联动 (回调)
//   - fit 按钮：仅当装不下时显示（PM Q1 B / currentK > fit targetK）
//   - 焦点按钮：hover → 画布预览淡显 / click commit 跳 Stage 4
//     · 默认 disabled / 用户展开一侧后 enable / hover/click 用展开侧 obs 为根
//
// 视觉延续 M4 编辑学术风 (claim-popover.ts § 4 / 紫色 #5b3a8c + 米白 #fcfaf6 + EB Garamond)
// 关闭：× 按钮 / Esc 键 / 点空白
// 切换 popover 时：旧滑出 200ms → 新滑入 450ms (跟 claim-popover 一致出快入慢)

import type { ClaimNode, ClaimRelation } from '../types/Claim.ts';

const SHOW_DURATION_MS = 450;
const HIDE_DURATION_MS = 200;
const SHOW_TRANSITION = `transform ${SHOW_DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
const HIDE_TRANSITION = `transform ${HIDE_DURATION_MS}ms cubic-bezier(0.55, 0.06, 0.68, 0.19)`;

const REL_LABEL: Record<ClaimRelation['type'], string> = {
  agreement_with: '同意',
  disagreement_with: '反对',
  extends: '延伸',
};

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

export interface ArcPopoverParams {
  relation: ClaimRelation;
  source: ClaimNode;
  target: ClaimNode;
  sourceAuthor: string;
  targetAuthor: string;
  /** 当前 viewport 已能完整看到弧 + 两端 / 不需 fit 按钮（PM Q1 B） */
  isFitNow: boolean;
  /** fit 按钮 click（仅 !isFitNow 时显示） */
  onFitClick?: () => void;
  /** obs-slot 展开 / 传展开侧 obs id（用于画布高亮联动） */
  onObsExpand?: (obsId: string) => void;
  /** 所有 slot 折叠 / 高亮恢复"两端都亮" */
  onObsCollapse?: () => void;
  /** 焦点按钮 hover preview（传当前展开侧 obs id） */
  onFocusPreview?: (obsId: string) => void;
  /** 焦点按钮 leave 预览 */
  onFocusLeavePreview?: () => void;
  /** 焦点按钮 click commit / 跳 Stage 4 焦点模式 */
  onEnterFocus?: (obsId: string) => void;
  /** popover 关闭（× / Esc / 外点） */
  onClose?: () => void;
}

export function showArcPopover(p: ArcPopoverParams): void {
  // same relation guard：同 relation 重点击 early return
  const existing = document.querySelector<HTMLElement>('.arc-popover');
  const relKey = `${p.relation.source}|${p.relation.target}|${p.relation.type}`;
  if (existing && existing.dataset.relKey === relKey && existing.dataset.state !== 'closing') {
    return;
  }

  // 不同 relation 已显示 / 先 hide + 等 200ms 再 show
  if (existing && existing.dataset.state !== 'closing') {
    hideArcPopover();
    setTimeout(() => {
      document.querySelectorAll('.arc-popover').forEach((el) => el.remove());
      _doShow(p, relKey);
    }, HIDE_DURATION_MS);
    return;
  }

  document.querySelectorAll('.arc-popover').forEach((el) => el.remove());
  _doShow(p, relKey);
}

function _doShow(p: ArcPopoverParams, relKey: string): void {
  const aside = document.createElement('aside');
  aside.className = 'arc-popover';
  aside.dataset.relKey = relKey;
  // 已展开侧（'source' / 'target' / null）→ 用 dataset 持久 + DOM class
  aside.dataset.expandedSide = '';
  // top:54px · B1 bug fix 2026-05-21 (DR-084) · 同 claim-popover 让出 header
  aside.style.cssText = `
    position:fixed;
    top:54px;
    right:0;
    bottom:60px;
    width:380px;
    background:#fcfaf6;
    border-left:1px solid #d8cab0;
    box-shadow:-4px 0 18px rgba(58,35,96,0.10);
    overflow-y:auto;
    transform:translateX(100%);
    transition:${SHOW_TRANSITION};
    z-index:1000;
    font-family:'EB Garamond','Georgia',serif;
    color:#2a2a2a;
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
  `;

  const label = REL_LABEL[p.relation.type] ?? p.relation.type;

  aside.innerHTML = `
    <div class="arc-popover-header" style="
      padding:14px 18px;
      border-bottom:1px solid #d8cab0;
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
      background:#fcfaf6;
    ">
      <span class="kicker" style="
        font-family:'EB Garamond',Georgia,serif;
        font-style:italic;
        font-size:13px;
        color:#5b3a8c;
        letter-spacing:0.06em;
        flex:1;
      ">§ ${escapeHtml(label)} · 关系</span>
      ${
        !p.isFitNow
          ? `<button class="arc-popover-fit-btn" title="飞行 fit 居中" style="
              padding:5px 9px;
              border:1px solid #5b3a8c;
              background:#fcfaf6;
              color:#5b3a8c;
              cursor:pointer;
              font-family:inherit;
              font-size:11px;
              font-style:italic;
            ">📍 fit 居中</button>`
          : ''
      }
      <button class="arc-popover-focus-btn" title="先选展开一侧 / 再点跳焦点模式" disabled style="
        padding:5px 9px;
        border:1px solid #aaa;
        background:#fcfaf6;
        color:#aaa;
        cursor:not-allowed;
        font-family:inherit;
        font-size:11px;
        font-style:italic;
      ">→ 焦点</button>
      <button class="arc-popover-close-btn" aria-label="关闭" style="
        border:none;
        background:none;
        font-size:22px;
        line-height:1;
        color:#888;
        cursor:pointer;
        padding:0 4px;
      ">×</button>
    </div>
    ${_renderSlot('source', p.source, p.sourceAuthor)}
    ${_renderSlot('target', p.target, p.targetAuthor)}
  `;

  document.body.appendChild(aside);

  // 强制 reflow 触发滑入
  void aside.offsetWidth;
  aside.style.transform = 'translateX(0)';

  // === wire 按钮 ===
  const fitBtn = aside.querySelector<HTMLButtonElement>('.arc-popover-fit-btn');
  fitBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    p.onFitClick?.();
  });

  const focusBtn = aside.querySelector<HTMLButtonElement>('.arc-popover-focus-btn');
  focusBtn?.addEventListener('mouseenter', () => {
    const expandedSide = aside.dataset.expandedSide;
    if (!expandedSide) return;
    const obsId = expandedSide === 'source' ? p.source.id : p.target.id;
    p.onFocusPreview?.(obsId);
  });
  focusBtn?.addEventListener('mouseleave', () => {
    p.onFocusLeavePreview?.();
  });
  focusBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const expandedSide = aside.dataset.expandedSide;
    if (!expandedSide) return;
    const obsId = expandedSide === 'source' ? p.source.id : p.target.id;
    p.onEnterFocus?.(obsId);
  });

  const closeBtn = aside.querySelector<HTMLButtonElement>('.arc-popover-close-btn');
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    p.onClose?.();
    hideArcPopover();
  });

  // === obs-slot click toggle ===
  aside.querySelectorAll<HTMLElement>('.obs-slot').forEach((slot) => {
    slot.addEventListener('click', (e) => {
      e.stopPropagation();
      const side = slot.dataset.side as 'source' | 'target';
      const wasExpanded = slot.classList.contains('expanded');
      // 折叠所有
      aside.querySelectorAll('.obs-slot').forEach((s) => s.classList.remove('expanded'));
      if (wasExpanded) {
        // toggle off
        aside.dataset.expandedSide = '';
        _updateFocusBtnEnabled(aside, false);
        p.onObsCollapse?.();
      } else {
        slot.classList.add('expanded');
        aside.dataset.expandedSide = side;
        _updateFocusBtnEnabled(aside, true);
        const obsId = side === 'source' ? p.source.id : p.target.id;
        p.onObsExpand?.(obsId);
      }
    });
  });

  // === Esc 键关闭 ===
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      p.onClose?.();
      hideArcPopover();
    }
  };
  document.addEventListener('keydown', escHandler);
  (aside as unknown as { _escHandler: (e: KeyboardEvent) => void })._escHandler = escHandler;

  // === 外点 click 关闭（同 claim-popover 工具栏白名单）===
  //   B1 bug fix 2026-05-21 (DR-084 派生)：补 header-controls + header-brand + search popover 白名单
  const outsideHandler = (e: MouseEvent) => {
    if (aside.contains(e.target as Node)) return;
    const target = e.target as Element;
    if (
      target.closest('.sidebar') ||
      target.closest('.zoom-control') ||
      target.closest('#timeline-fixed') ||
      target.closest('.breadcrumb-top') ||
      target.closest('.header-controls') || // 顶部工具栏 (搜索 + 互换 + 关于)
      target.closest('.header-brand') || // 顶部 brand 标题区
      target.closest('.search-result-popover') // 搜索下拉浮窗
    ) {
      return;
    }
    p.onClose?.();
    hideArcPopover();
  };
  const outsideTimer = setTimeout(() => document.addEventListener('click', outsideHandler), 0);
  const asideAny = aside as unknown as {
    _outsideHandler: (e: MouseEvent) => void;
    _outsideTimer: ReturnType<typeof setTimeout>;
  };
  asideAny._outsideHandler = outsideHandler;
  asideAny._outsideTimer = outsideTimer;
}

function _renderSlot(side: 'source' | 'target', claim: ClaimNode, author: string): string {
  const sideLabel = side === 'source' ? 'SOURCE' : 'TARGET';
  const catsText = (claim.cats ?? []).map((c) => CATS_LABELS[c] ?? c).join(' · ');
  const metaParts = [`${claim.year}`];
  if (catsText) metaParts.push(catsText);

  return `
    <div class="obs-slot" data-side="${side}" data-obs-id="${claim.id}" style="
      border-bottom:${side === 'source' ? '1px solid #d8cab0' : 'none'};
      padding:14px 18px;
      cursor:pointer;
      transition:background 0.2s;
    " onmouseover="this.style.background='rgba(91,58,140,0.04)'" onmouseout="this.style.background=this.classList.contains('expanded')?'rgba(91,58,140,0.06)':'transparent'">
      <div class="slot-kicker" style="
        font-family:'EB Garamond',Georgia,serif;
        font-style:italic;
        font-size:11px;
        color:#5b3a8c;
        letter-spacing:0.06em;
        margin-bottom:4px;
      ">${sideLabel} · ${escapeHtml(author)}</div>
      <h3 style="
        font-family:'EB Garamond',Georgia,serif;
        font-size:16px;
        font-weight:600;
        margin:4px 0;
        color:#2a2a2a;
        line-height:1.4;
        word-break:break-word;
        overflow-wrap:anywhere;
      ">${escapeHtml(claim.name_zh ?? claim.claim_text)}</h3>
      <div class="meta" style="
        font-family:'EB Garamond',Georgia,serif;
        font-size:11px;
        color:#888;
        font-variant:small-caps;
        letter-spacing:0.08em;
        margin-top:4px;
      ">${metaParts.join(' · ')}</div>
      <div class="detail-body" style="display:none;margin-top:12px;font-size:13px;line-height:1.7;color:#4a4a4a;">
        <blockquote style="margin:0;padding:4px 0 4px 12px;border-left:3px solid #5b3a8c;font-style:italic;color:#2a2a2a;">${escapeHtml(claim.claim_text)}</blockquote>
        ${
          claim.reference
            ? `<div style="margin-top:8px;padding-top:8px;border-top:1px dotted #d8cab0;color:#888;font-style:italic;font-size:11px;word-break:break-all;">出处：${escapeHtml(claim.reference)}</div>`
            : ''
        }
      </div>
      <div class="collapse-hint" style="font-size:10px;color:#888;font-style:italic;margin-top:4px;">↓ 点击展开</div>
    </div>
  `;
}

function _updateFocusBtnEnabled(aside: HTMLElement, enabled: boolean): void {
  const btn = aside.querySelector<HTMLButtonElement>('.arc-popover-focus-btn');
  if (!btn) return;
  btn.disabled = !enabled;
  btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
  btn.style.color = enabled ? '#5b3a8c' : '#aaa';
  btn.style.borderColor = enabled ? '#5b3a8c' : '#aaa';
  btn.title = enabled
    ? '进入 Stage 4 焦点模式（以展开侧 obs 为根）'
    : '先选展开一侧 / 再点跳焦点模式';
}

// 同 detail-body display 切换：用 CSS class .expanded
// 注入 stylesheet 处理 expanded → detail-body 显示 + collapse-hint 隐藏
const STYLESHEET_ID = 'arc-popover-stylesheet';
function _injectStylesheet(): void {
  if (document.getElementById(STYLESHEET_ID)) return;
  const style = document.createElement('style');
  style.id = STYLESHEET_ID;
  style.textContent = `
    .arc-popover .obs-slot.expanded .detail-body { display:block !important; }
    .arc-popover .obs-slot.expanded .collapse-hint { display:none; }
    .arc-popover .obs-slot.expanded { background: rgba(91,58,140,0.06); cursor:default; }
  `;
  document.head.appendChild(style);
}
_injectStylesheet();

export function hideArcPopover(): void {
  const existings = document.querySelectorAll<HTMLElement>('.arc-popover');
  existings.forEach((el) => {
    if (el.dataset.state === 'closing') return;
    el.dataset.state = 'closing';

    // 清 listeners
    const meta = el as unknown as {
      _escHandler?: (e: KeyboardEvent) => void;
      _outsideHandler?: (e: MouseEvent) => void;
      _outsideTimer?: ReturnType<typeof setTimeout>;
    };
    if (meta._escHandler) document.removeEventListener('keydown', meta._escHandler);
    if (meta._outsideHandler) document.removeEventListener('click', meta._outsideHandler);
    if (meta._outsideTimer) clearTimeout(meta._outsideTimer);

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
