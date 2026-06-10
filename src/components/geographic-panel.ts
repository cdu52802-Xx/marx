// M-B2 Stage 5 T5.1 · geographic-panel 副窗 paper 风格容器
// spec § 4.2（v3 mockup 拍板）·
//   - position fixed right:0 bottom:60（跟 timeline 顶对齐 / 详情卡 + sidebar bottom 60 全栏对齐）
//   - 380×214（16:9 · DR-073 · 跟详情卡同宽 · 不抢详情卡空间）
//   - 视觉框：米白 #fcfaf6 + border-left #d8cab0 + paper-shadow（跟详情卡完全一致）
//   - 标题栏 "§ 地理图 · YYYY 地名"（EB Garamond italic 13px 紫）+ ↔ 互换按钮（12px 灰）
//   - 不画副图内时间游标（用户只在外部主 timeline 操作）
//   - 标题自己监听 marx:time-change（年份 + marxPlaceAtYear 地名 · 自包含不靠 main.ts 转发）
// 内容（地理图低密度版）由 main.ts 把 getCanvasContainer() 喂给 mountGeographicCanvas(density:'low')
//
// DR-stage5 · geo-main 模式下副窗隐藏（V1 副窗只承载地理图缩略 ·
//   "观点列表 380×214 缩略"M5 单实例不可双渲染且缩略不可读 · V2 再议）· main.ts setVisible 控制

import { marxPlaceAtYear } from '../lib/marx-itinerary.ts';

export interface GeographicPanelOptions {
  /** ↔ 互换按钮 callback（main.ts wire swapApi.toggle） */
  onSwap?: () => void;
}

export interface GeographicPanelApi {
  /** 内容 svg（main.ts mount 低密度地理图用）· viewBox 380×178（214 - 标题栏 36） */
  getCanvasContainer(): SVGSVGElement;
  setVisible(visible: boolean): void;
  destroy(): void;
}

const PANEL_W = 380;
const PANEL_H = 214;
const HEADER_H = 36;

export function mountGeographicPanel(opts: GeographicPanelOptions): GeographicPanelApi {
  const panel = document.createElement('aside');
  panel.className = 'geographic-panel';
  panel.style.cssText = `
    position: fixed;
    right: 0;
    bottom: 60px;
    width: ${PANEL_W}px;
    height: ${PANEL_H}px;
    background: #fcfaf6;
    border-left: 1px solid #d8cab0;
    border-top: 1px solid #d8cab0;
    box-shadow: -4px 0 18px rgba(58, 35, 96, 0.1);
    z-index: 8;
    font-family: 'EB Garamond', Georgia, serif;
  `;

  // 标题栏（spec § 4.2 · padding 16px 20px 8px 视觉等效压缩到 36px 高单行）
  const header = document.createElement('div');
  header.className = 'geographic-panel-header';
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: ${HEADER_H}px;
    box-sizing: border-box;
    padding: 0 12px 0 16px;
    border-bottom: 1px solid #d8cab0;
  `;

  const title = document.createElement('span');
  title.className = 'geographic-panel-title';
  title.style.cssText = `
    font-style: italic;
    font-size: 13px;
    color: #5b3a8c;
    letter-spacing: 0.04em;
  `;
  title.textContent = '§ 地理图';
  header.appendChild(title);

  const swapBtn = document.createElement('button');
  swapBtn.className = 'geographic-panel-swap';
  swapBtn.type = 'button';
  swapBtn.textContent = '↔ 互换';
  swapBtn.title = '把地理图换到主画布';
  swapBtn.style.cssText = `
    font-family: inherit;
    font-style: italic;
    font-size: 12px;
    color: #888;
    background: transparent;
    border: 1px dotted #d8cab0;
    padding: 2px 8px;
    cursor: pointer;
  `;
  swapBtn.addEventListener('click', () => opts.onSwap?.());
  header.appendChild(swapBtn);

  panel.appendChild(header);

  // 内容 svg（低密度地理图 mount 目标）
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'geographic-panel-canvas');
  svg.setAttribute('viewBox', `0 0 ${PANEL_W} ${PANEL_H - HEADER_H}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', String(PANEL_H - HEADER_H));
  svg.style.display = 'block';
  panel.appendChild(svg);

  document.body.appendChild(panel);

  // 标题跟 marx:time-change 走（"§ 地理图 · YYYY 地名" · 行迹范围外只显年份）
  const timeHandler = (e: Event): void => {
    const detail = (e as CustomEvent).detail as { year?: number } | undefined;
    if (typeof detail?.year !== 'number') return;
    const year = Math.round(detail.year);
    const place = marxPlaceAtYear(detail.year);
    title.textContent = place ? `§ 地理图 · ${year} ${place}` : `§ 地理图 · ${year}`;
  };
  window.addEventListener('marx:time-change', timeHandler);

  return {
    getCanvasContainer: () => svg,
    setVisible(visible: boolean): void {
      panel.style.display = visible ? 'block' : 'none';
      // 内容 svg 同步 display · 让 geographic-canvas 隐藏画布守卫（isContainerHidden）生效
      //   （守卫只读自身 container.style.display · 父级 panel 隐藏时 svg 自身也要标 none）
      svg.style.display = visible ? 'block' : 'none';
    },
    destroy(): void {
      window.removeEventListener('marx:time-change', timeHandler);
      panel.remove();
    },
  };
}
