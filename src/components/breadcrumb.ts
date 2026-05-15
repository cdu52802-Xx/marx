// M5 Stage 4 焦点模式 · 顶部面包屑组件 (DR-056)
//
// 行为:
//   - 仅在焦点模式下显示 / 默认全画布隐藏
//   - 显示"全部 → 焦点：<claim_text 前 20 字符>"
//   - 点「全部」触发 onExitFocus / 主画布恢复
//
// 视觉:
//   - position:fixed top:0 left:48px right:0 z-index:11
//   - 米白底 + 紫色边 / EB Garamond italic
//   - 高度 32px / 不重压 header

export interface BreadcrumbApi {
  showFocus: (claimTextPrefix: string) => void;
  hideFocus: () => void;
}

export interface BreadcrumbOptions {
  container: HTMLElement;
  onExitFocus: () => void;
}

export function mountBreadcrumb(opts: BreadcrumbOptions): BreadcrumbApi {
  const { container, onExitFocus } = opts;

  container.innerHTML = `
    <div class="breadcrumb-bar" style="
      display:none;
      position:relative;
      width:100%;
      height:32px;
      background:#faf6ec;
      border-bottom:1px solid #d8cab0;
      font-family:'EB Garamond','Georgia',serif;
      font-size:13px;
      font-style:italic;
      color:#5b3a8c;
      padding:0 24px;
      align-items:center;
      gap:8px;
      letter-spacing:0.02em;
      box-sizing:border-box;
      box-shadow:0 2px 6px rgba(58,35,96,0.06);
    ">
      <button class="breadcrumb-all" style="
        background:none;
        border:none;
        color:#5b3a8c;
        font-family:inherit;
        font-size:inherit;
        font-style:inherit;
        cursor:pointer;
        padding:0;
        text-decoration:underline;
        text-underline-offset:3px;
      " aria-label="返回全部观点">全部</button>
      <span style="color:#888;font-style:normal">→</span>
      <span class="breadcrumb-focus-label" style="color:#2a2a2a;font-weight:600;font-style:normal">焦点</span>
    </div>
  `;

  const bar = container.querySelector('.breadcrumb-bar') as HTMLElement;
  const allBtn = container.querySelector('.breadcrumb-all') as HTMLButtonElement;
  const focusLabel = container.querySelector('.breadcrumb-focus-label') as HTMLElement;

  allBtn.addEventListener('click', () => {
    onExitFocus();
  });

  return {
    showFocus: (claimTextPrefix: string) => {
      focusLabel.textContent = `焦点：${claimTextPrefix}`;
      bar.style.display = 'flex';
    },
    hideFocus: () => {
      bar.style.display = 'none';
    },
  };
}
