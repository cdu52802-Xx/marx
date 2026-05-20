// B1 T1.1-T1.3 · header controls
//
// PM 2026-05-20 选 B · 沿用 M4 米白透明 header（不墨黑 bg）
//   - brand h1 + 副标题：保留 index.html `<header id="app-header">` 不动
//   - header-controls：fixed top:14 right:14 / pointer-events:auto
//     · 搜索 slot（Stage 2 填充 search input）
//     · ↔ 互换按钮 placeholder（disabled / B2 启用 / 主副互换）
//     · 关于 link（#about modal trigger / 实施期细化）
//     · 视觉灵感 denizcemonduygu（沿用 M4 footer 致谢 / 内容迁到这里）
//   - 视觉风格沿用 M4 footer：EB Garamond italic 12px #888 + dotted underline
//
// Stage 1 = scaffold + brand 不动 + link 重组 + 互换 placeholder
// Stage 2 = search UI mount 到 .header-search-slot
// Stage 4 = 主图 highlight API（不在此文件）

export interface HeaderApi {
  /** 搜索 slot · Stage 2 mount search input 用 */
  searchSlot: HTMLElement;
  /** 互换按钮 · B2 enable / dispatch swap event 用 */
  swapButton: HTMLButtonElement;
}

export function mountHeader({ container }: { container: HTMLElement }): HeaderApi {
  container.classList.add('header-controls');

  // 搜索 slot · Stage 2 填充
  const searchSlot = document.createElement('span');
  searchSlot.className = 'header-search-slot';
  container.appendChild(searchSlot);

  // 互换按钮 · placeholder · B2 启用
  const swap = document.createElement('button');
  swap.className = 'header-swap';
  swap.disabled = true;
  swap.title = 'B2 启用 · 主副互换（探索者模式 / 地理图当主画布）';
  swap.textContent = '↔ 互换';
  swap.dataset.swapState = 'default'; // B2 切换：default / swapped
  container.appendChild(swap);

  container.appendChild(makeSep());

  // 关于 link
  const about = document.createElement('a');
  about.className = 'header-about';
  about.href = '#about';
  about.textContent = '关于';
  container.appendChild(about);

  container.appendChild(makeSep());

  // 视觉灵感 link · 沿用 M4 footer 致谢
  const credit = document.createElement('a');
  credit.className = 'header-credit';
  credit.href = 'https://www.denizcemonduygu.com/philo/';
  credit.target = '_blank';
  credit.rel = 'noopener';
  credit.textContent = '视觉灵感 denizcemonduygu';
  container.appendChild(credit);

  return { searchSlot, swapButton: swap };
}

function makeSep(): HTMLSpanElement {
  const sep = document.createElement('span');
  sep.className = 'header-sep';
  sep.textContent = '·';
  return sep;
}
