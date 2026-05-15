// M5 主线 A · T3 · 左下缩放控件
// spec § 8.3 + DR-020 位置左下 / 4 button 竖排
//
// Stage 2 round 3 PM checkpoint Issue #1 修：删小手 ✋ pan-toggle button
//   PM 实测后反馈：光标 drag 已能 pan / explicit pan mode 多余
//   d3.zoom 默认按住空白拖动 = pan / click event 仅 mouse 不移动时触发
//   = drag pan 不关详情卡 / click 关详情卡 / 天然分离
//
// 设计：
//   - mount 到 body / position: fixed / 左下角 (default left=60 bottom=180)
//   - 4 元素竖排（button + 比例 display div + button + button）
//     · zoom-in 放大 1.5× step / max 8×
//     · zoom-display 当前比例（"2.5×"）/ 紫色背景半透明强调
//     · zoom-out 缩小 0.667× step / min 1×
//     · zoom-reset 重置到 fit-to-content (zoomIdentity) 800ms 飞行
//   - 每 button 28px × 28px / 米白底 + 1px 墨黑边 / EB Garamond
//   - aria-label 中文
//
// 接线（main.ts 负责）：
//   - createZoom 的 onZoom 回调里调 updateZoomDisplay 同步比例
import type { ZoomController } from '../viz/zoom.ts';

export interface ZoomControlOptions {
  zoomController: ZoomController;
  position?: { left: number; bottom: number };
}

const ZOOM_STEP_IN = 1.5;
const ZOOM_STEP_OUT = 0.667;
const ZOOM_MIN = 1;
const ZOOM_MAX = 8;
const RESET_DURATION_MS = 800;

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
  // Stage 2 R3：⌂ 现在是最后一个 button (Issue #1 删 ✋)
  const home = mkBtn(
    'zoom-reset',
    '⌂',
    '重置到全景视图',
    () => {
      opts.zoomController.reset(RESET_DURATION_MS);
    },
    true, // last
  );

  root.appendChild(plus);
  root.appendChild(display);
  root.appendChild(minus);
  root.appendChild(home);
  document.body.appendChild(root);

  return root;
}

export function updateZoomDisplay(root: HTMLElement, k: number): void {
  const display = root.querySelector('.zoom-display') as HTMLElement | null;
  if (display) display.textContent = `${k.toFixed(1)}×`;
}
