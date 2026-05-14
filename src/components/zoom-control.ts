// M5 主线 A · T3 + Stage 1 PM checkpoint Issue #4 · 左下缩放控件
// spec § 8.3 + DR-020 位置左下 / 5 button 竖排（PM 反馈加小手 = pan mode）
//
// 设计：
//   - mount 到 body / position: fixed / 左下角 (default left=60 bottom=180)
//   - 5 元素竖排（button + 比例 display div + button + button + button）
//     · zoom-in 放大 1.5× step / max 8×
//     · zoom-display 当前比例（"2.5×"）/ 紫色背景半透明强调
//     · zoom-out 缩小 0.667× step / min 1×
//     · zoom-reset 重置到 fit-to-content (zoomIdentity) 800ms 飞行
//     · zoom-pan-toggle 小手 ✋ toggle pan mode（Stage 1 Issue #4）
//   - 每 button 28px × 28px / 米白底 + 1px 墨黑边 / EB Garamond
//   - aria-label 中文 / aria-pressed (小手 toggle)
//
// pan mode 语义（main.ts 接 onPanModeChange + isPanMode getter）：
//   - active：cursor 'grab' / 单击空白 不关详情卡（Issue #3 防误关）
//   - inactive：cursor default / 单击空白 关详情卡
//   - d3.zoom drag-to-pan 行为两 mode 都启用 / 区别只在 cursor + 单击空白逻辑
//
// 接线（main.ts 负责）：
//   - createZoom 的 onZoom 回调里调 updateZoomDisplay 同步比例
//   - opts.onPanModeChange 切换时调（main.ts 改 cursor / claim-popover guard）
import type { ZoomController } from '../viz/zoom.ts';

export interface ZoomControlOptions {
  zoomController: ZoomController;
  position?: { left: number; bottom: number };
  /** Stage 1 Issue #4 · 小手 toggle 切换时调（main.ts 改 cursor / popover guard）*/
  onPanModeChange?: (isPanMode: boolean) => void;
}

const ZOOM_STEP_IN = 1.5;
const ZOOM_STEP_OUT = 0.667;
const ZOOM_MIN = 1;
const ZOOM_MAX = 8;
const RESET_DURATION_MS = 800;

// Stage 1 Issue #4 · 模块级 pan mode state（main.ts + claim-popover 都能查询）
let _isPanMode = false;
export function isPanMode(): boolean {
  return _isPanMode;
}

export function mountZoomControl(opts: ZoomControlOptions): HTMLElement {
  const pos = opts.position ?? { left: 60, bottom: 180 };
  const root = document.createElement('div');
  root.className = 'zoom-control';
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', '画布缩放控件');
  root.style.cssText = `
    position: fixed;
    left: ${pos.left}px;
    bottom: ${pos.bottom}px;
    z-index: 11;
    display: flex;
    flex-direction: column;
    background: #fcfaf6;
    border: 1px solid #1a1a1a;
    font-family: 'EB Garamond', Georgia, 'Source Serif 4', 'Noto Serif SC', serif;
    user-select: none;
    box-shadow: 0 1px 4px rgba(26, 26, 26, 0.08);
  `;

  const mkBtn = (
    cls: string,
    label: string,
    ariaLabel: string,
    onClick: () => void,
    isLast = false,
  ) => {
    const btn = document.createElement('button');
    btn.className = `zoom-control-btn ${cls}`;
    btn.setAttribute('aria-label', ariaLabel);
    btn.type = 'button';
    btn.textContent = label;
    btn.style.cssText = `
      width: 32px;
      height: 32px;
      border: 0;
      background: transparent;
      font-family: inherit;
      font-size: 18px;
      color: #1a1a1a;
      cursor: pointer;
      padding: 0;
      ${isLast ? '' : 'border-bottom: 1px solid #d8ccb8;'}
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(91, 58, 140, 0.08)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
    });
    btn.onclick = onClick;
    return btn;
  };

  const plus = mkBtn('zoom-in', '+', '放大', () => {
    const t = opts.zoomController.getCurrentTransform();
    opts.zoomController.programmaticZoom(Math.min(t.k * ZOOM_STEP_IN, ZOOM_MAX));
  });

  const display = document.createElement('div');
  display.className = 'zoom-display';
  display.setAttribute('aria-live', 'polite');
  display.setAttribute('aria-label', '当前缩放比例');
  display.style.cssText = `
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(91, 58, 140, 0.15);
    font-size: 11px;
    font-style: italic;
    font-weight: 600;
    color: #5b3a8c;
    border-bottom: 1px solid #d8ccb8;
  `;
  display.textContent = '1.0×';

  const minus = mkBtn('zoom-out', '−', '缩小', () => {
    const t = opts.zoomController.getCurrentTransform();
    opts.zoomController.programmaticZoom(Math.max(t.k * ZOOM_STEP_OUT, ZOOM_MIN));
  });

  // Stage 1 Issue #5 修：⌂ 用 reset() / 飞回 fit-to-content (zoomIdentity) 不是 scaleTo
  const home = mkBtn('zoom-reset', '⌂', '重置到全景视图', () => {
    opts.zoomController.reset(RESET_DURATION_MS);
  });

  // Stage 1 Issue #4 新增 · 小手 ✋ toggle pan mode
  const handBtn = mkBtn(
    'zoom-pan-toggle',
    '✋',
    '切换 pan 模式（按住小手后单击画布空白不关详情卡）',
    () => {
      _isPanMode = !_isPanMode;
      handBtn.setAttribute('aria-pressed', String(_isPanMode));
      handBtn.style.background = _isPanMode ? 'rgba(91, 58, 140, 0.18)' : 'transparent';
      if (opts.onPanModeChange) opts.onPanModeChange(_isPanMode);
    },
    true, // last
  );
  handBtn.setAttribute('aria-pressed', 'false');

  root.appendChild(plus);
  root.appendChild(display);
  root.appendChild(minus);
  root.appendChild(home);
  root.appendChild(handBtn);
  document.body.appendChild(root);

  return root;
}

export function updateZoomDisplay(root: HTMLElement, k: number): void {
  const display = root.querySelector('.zoom-display') as HTMLElement | null;
  if (display) display.textContent = `${k.toFixed(1)}×`;
}
