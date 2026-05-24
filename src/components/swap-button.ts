// M-B2 阶段 A · swap-button.ts · dev 期 M5/Geo 切换 + Stage 3 互换按钮雏形
// PM 2026-05-24 拍板翻 plan 顺序 + dev toggle 按钮（避 300×200 浮窗滤镜污染 PM checkpoint）
//
// 设计（plan T3.2 + dev 期需求）·
//   CanvasRole = 'list-main' | 'geo-main'
//     - 'list-main'（默认）：M5 列表星图占主画布 · Geo 地理图副（dev 期 hide）· B1 ship 后既有体验
//     - 'geo-main'：Geo 地理图占主画布 · M5 列表星图副（dev 期 hide）· PM 大窗实测视角
//   持久化：localStorage 'marx:canvas-role'
//   API：mountSwapButton(container) → { toggle, getCurrent, onChange }
//
// dev 期视觉（左上角 fixed mount）·
//   紫边米白底 · 按钮文案 "↔ 列表 ⇄ 地图" · z-index 顶层
// Stage 3 polish 时升级为正式 ↔ 互换样式 / 移到 header.ts 容器（mount 函数签名不变）

export type CanvasRole = 'list-main' | 'geo-main';

export interface SwapApi {
  toggle(): void;
  getCurrent(): CanvasRole;
  onChange(cb: (role: CanvasRole) => void): void;
}

const STORAGE_KEY = 'marx:canvas-role';
const DEFAULT_ROLE: CanvasRole = 'list-main';

function readStoredRole(): CanvasRole {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'list-main' || stored === 'geo-main') return stored;
  return DEFAULT_ROLE;
}

export function mountSwapButton(container: HTMLElement): SwapApi {
  let current: CanvasRole = readStoredRole();
  const listeners: Array<(role: CanvasRole) => void> = [];

  const btn = document.createElement('button');
  btn.className = 'swap-button';
  btn.type = 'button';
  btn.textContent = '↔ 列表 ⇄ 地图';
  btn.title = '切换主画布（dev 期 · Stage 3 升级为正式互换按钮）';
  container.appendChild(btn);

  function notify(): void {
    for (const cb of listeners) cb(current);
  }

  function toggle(): void {
    current = current === 'list-main' ? 'geo-main' : 'list-main';
    localStorage.setItem(STORAGE_KEY, current);
    notify();
  }

  btn.addEventListener('click', toggle);

  return {
    toggle,
    getCurrent: () => current,
    onChange: (cb) => {
      listeners.push(cb);
    },
  };
}
