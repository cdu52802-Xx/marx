// B1 T2.2 + T2.3 · 搜索下拉候选浮窗
//
// 责任：show(items) → 紧贴 anchor 下方渲染候选 list / click → onSelect(item)。
//   - 视觉风格 paper 风格走 CSS（.search-result-popover + .search-result-item / styles.css）。
//   - T2.3 键盘导航：↑↓ wrap 选择 / Enter 提交 / Esc 关。UX 遵循 VS Code / Chrome 搜索栏习惯。
//   - 不做真 search engine（T3.1 search-index.ts 单独）/ 本组件接收 items 数组渲染就够。
//
// API：
//   const api = mountResultPopover({ anchor, onSelect, onClose? });
//   api.show(items)  // 替换不堆叠
//   api.hide()
//   api.isOpen()

export type SearchResultType = 'claim' | 'person' | 'event' | 'location';

export interface SearchResultItem {
  type: SearchResultType;
  id: string;
  label: string;
  /** T3.1 fuzzy match 用 · T2.2 暂未使用（高亮匹配片段视觉留 backlog） */
  matched?: string;
}

export interface SearchResultPopoverApi {
  show: (items: SearchResultItem[]) => void;
  hide: () => void;
  isOpen: () => boolean;
}

/** spec § 3.3 max 8 候选 */
const MAX_RESULTS = 8;

const TYPE_LABEL: Record<SearchResultType, string> = {
  claim: '主张',
  person: '人物',
  event: '事件',
  location: '地点',
};

export function mountResultPopover({
  anchor,
  onSelect,
  onClose,
}: {
  anchor: HTMLElement;
  onSelect: (item: SearchResultItem) => void;
  onClose?: () => void;
}): SearchResultPopoverApi {
  let currentPopover: HTMLElement | null = null;
  let currentItems: SearchResultItem[] = [];
  let itemEls: HTMLElement[] = [];
  let selectedIndex = -1;
  let keyHandler: ((e: KeyboardEvent) => void) | null = null;

  function updateSelectedVisual(): void {
    itemEls.forEach((el, i) => {
      el.dataset.selected = i === selectedIndex ? 'true' : 'false';
    });
  }

  function wrap(idx: number, total: number): number {
    if (total === 0) return -1;
    return ((idx % total) + total) % total;
  }

  function hide(): void {
    if (currentPopover) {
      currentPopover.remove();
      currentPopover = null;
    }
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
      keyHandler = null;
    }
    currentItems = [];
    itemEls = [];
    selectedIndex = -1;
  }

  function show(items: SearchResultItem[]): void {
    hide(); // 替换不堆叠 / 旧 listener detach

    if (items.length === 0) return;

    const visible = items.slice(0, MAX_RESULTS);
    currentItems = visible;
    selectedIndex = -1;

    const popover = document.createElement('div');
    popover.className = 'search-result-popover';
    popover.setAttribute('role', 'listbox');

    itemEls = visible.map((item) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'search-result-item';
      itemEl.setAttribute('role', 'option');
      itemEl.dataset.resultType = item.type;
      itemEl.dataset.resultId = item.id;
      itemEl.dataset.selected = 'false';

      const kicker = document.createElement('span');
      kicker.className = 'search-result-kicker';
      kicker.textContent = `§ ${TYPE_LABEL[item.type]}`;

      const label = document.createElement('span');
      label.className = 'search-result-label';
      label.textContent = item.label;

      itemEl.appendChild(kicker);
      itemEl.appendChild(label);

      itemEl.addEventListener('click', () => {
        onSelect(item);
      });

      popover.appendChild(itemEl);
      return itemEl;
    });

    // 紧贴 anchor 下方 / fixed 定位（CSS 控视觉细节）
    const rect = anchor.getBoundingClientRect();
    popover.style.position = 'fixed';
    popover.style.top = `${rect.bottom + 4}px`;
    popover.style.left = `${rect.left}px`;
    popover.style.minWidth = `${Math.max(rect.width, 240)}px`;
    popover.style.zIndex = '20';

    document.body.appendChild(popover);
    currentPopover = popover;

    // T2.3 键盘导航：document keydown / show 时 attach / hide 时 detach
    keyHandler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          // 无选中 → 0 / 否则下移 wrap
          selectedIndex = selectedIndex < 0 ? 0 : wrap(selectedIndex + 1, currentItems.length);
          updateSelectedVisual();
          break;
        case 'ArrowUp':
          e.preventDefault();
          // 无选中 → last / 否则上移 wrap
          selectedIndex =
            selectedIndex < 0
              ? currentItems.length - 1
              : wrap(selectedIndex - 1, currentItems.length);
          updateSelectedVisual();
          break;
        case 'Enter': {
          e.preventDefault();
          // Enter 无选中 → 选第 1 个候选（VS Code / Chrome 搜索习惯）
          const idx = selectedIndex < 0 ? 0 : selectedIndex;
          const item = currentItems[idx];
          if (item) {
            onSelect(item);
            hide(); // 选中后关浮窗 / UX 标准
          }
          break;
        }
        case 'Escape':
          e.preventDefault();
          hide();
          onClose?.();
          break;
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  function isOpen(): boolean {
    return currentPopover !== null;
  }

  return { show, hide, isOpen };
}
