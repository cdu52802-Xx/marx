// B1 T2.2 + T2.3 + T3.3 · 搜索下拉候选浮窗
//
// T2.2 · 老 show(items) flat list（backward compat / T4 后可删）
// T2.3 · 键盘导航（↑↓ wrap / Enter / Esc / hide 后 detach）
// T3.3 · 双形态升级（DR-078 PM mockup 拍板）：
//   - showExplore(lists, onChipClick) · 空 query 时 3 段 chip list
//   - showGrouped(results, personsMap, query, conceptHit) · 已打字时按 author_id 分组 + 概念命中段
//   - 关键词紫色高亮 em.search-result-highlight（V1 仅字面 / V2 中英映射）
//
// API：
//   const api = mountResultPopover({ anchor, onSelect, onClose? });
//   api.show(items)                     // T2.2 老 flat（main.ts T4 后清掉）
//   api.showExplore(lists, onChip)      // T3.3 探索
//   api.showGrouped(results, personsMap, query, conceptHit)  // T3.3 分组
//   api.hide() / api.isOpen()

import type { PersonNode } from '../types/Node.ts';
import type { MainPerson, CoreConcept, KeyPeriod } from '../lib/search-curate.ts';
import type { SearchResult } from '../lib/search-index.ts';

export type SearchResultType = 'claim' | 'person' | 'event' | 'location';

export interface SearchResultItem {
  type: SearchResultType;
  id: string;
  label: string;
  matched?: string;
}

export interface ExploreLists {
  persons: readonly MainPerson[];
  concepts: readonly CoreConcept[];
  periods: readonly KeyPeriod[];
}

export interface SearchResultPopoverApi {
  /** @deprecated T2 老 API · backward compat（T4 后可清） */
  show: (items: SearchResultItem[]) => void;
  /** T3.3 探索形态（空 query · 3 段 chip list） */
  showExplore: (lists: ExploreLists, onChipClick: (chipText: string) => void) => void;
  /** T3.3 结果形态（已打字 · 按 author_id 分组 + 概念命中段） */
  showGrouped: (
    results: SearchResult[],
    personsMap: Map<string, PersonNode>,
    query: string,
    conceptHit: CoreConcept | null,
  ) => void;
  hide: () => void;
  isOpen: () => boolean;
}

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
  /** D2 · 正在 exit 动画但未 remove 的旧 popover（防 race · 出快入慢 / 120ms exit + 重建 path 同帧）*/
  let closingPopover: HTMLElement | null = null;
  let closingTimer: ReturnType<typeof setTimeout> | null = null;
  /** 当前可被键盘选择的 element list（统一 T2/T3 两种形态） */
  let selectableEls: HTMLElement[] = [];
  /** 每 element 对应 Enter / click 时调的 action */
  let selectableActions: (() => void)[] = [];
  let selectedIndex = -1;
  let keyHandler: ((e: KeyboardEvent) => void) | null = null;
  /** PM checkpoint feedback · 点空白关闭（PM A · 不豁免工具栏）*/
  let outsideClickHandler: ((e: MouseEvent) => void) | null = null;
  let outsideClickTimer: ReturnType<typeof setTimeout> | null = null;

  function _wrap(idx: number, total: number): number {
    if (total === 0) return -1;
    return ((idx % total) + total) % total;
  }

  function _updateVisual(): void {
    selectableEls.forEach((el, i) => {
      el.dataset.selected = i === selectedIndex ? 'true' : 'false';
    });
  }

  function _attachKeys(): void {
    keyHandler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectedIndex = selectedIndex < 0 ? 0 : _wrap(selectedIndex + 1, selectableEls.length);
          _updateVisual();
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectedIndex =
            selectedIndex < 0
              ? selectableEls.length - 1
              : _wrap(selectedIndex - 1, selectableEls.length);
          _updateVisual();
          break;
        case 'Enter': {
          e.preventDefault();
          const idx = selectedIndex < 0 ? 0 : selectedIndex;
          const action = selectableActions[idx];
          if (action) action();
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

  /**
   * PM checkpoint feedback · 点空白关闭（PM A · 2026-05-21）
   * 不关：popover 自己 + anchor 输入框自己
   * 关：其他任意 click（含工具栏 sidebar / zoom-control / timeline · 不豁免）
   *
   * ⚠ 用 capture phase 而非 bubble phase 监听（DR-082 / 2026-05-21 修）
   *   原因：主画布 obs / arc click handler 都 stopPropagation（src/main.ts line 273/754/816 防关详情卡）
   *   bubble phase 的 listener 收不到这些 click event / popover 不关。
   *   capture phase 在 target 阶段之前 / 不受 stopPropagation 影响 / 100% 命中。
   *
   * setTimeout(0) trick 防"打开本次 click"立即被识别为外部关闭。
   */
  function _attachOutsideClick(): void {
    outsideClickHandler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (currentPopover?.contains(target)) return;
      if (anchor.contains(target)) return;
      hide();
      onClose?.();
    };
    outsideClickTimer = setTimeout(() => {
      if (outsideClickHandler) {
        // capture phase = true · 不受主画布 stopPropagation 影响
        document.addEventListener('click', outsideClickHandler, true);
      }
    }, 0);
  }

  /**
   * D2 · 关闭浮窗（DR-096 / 2026-05-21）
   *
   * 默认走 120ms exit 动画（opacity 1→0 + translateY 0→-2px / ease-in / forwards）
   *   - 给 popover 加 `.popover-closing` class · CSS 动画自驱
   *   - setTimeout 140ms 后 remove element（120 动画 + 20 buffer）
   *
   * `opts.immediate = true` 同步立即 remove · 内部重建 path 用（_createPopover / show* 开头）
   *   - 防双 popover 同帧（e2e spec 4 chip 切换 race / showGrouped 期望 count = 1）
   *
   * 防累积 race：每次 hide 进入先清掉前一个 closing popover（如有）/ 防多次连续 hide 残留
   */
  function hide(opts?: { immediate?: boolean }): void {
    if (closingPopover) {
      closingPopover.remove();
      closingPopover = null;
    }
    if (closingTimer) {
      clearTimeout(closingTimer);
      closingTimer = null;
    }

    if (!currentPopover) return;
    const popoverToHide = currentPopover;

    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
      keyHandler = null;
    }
    if (outsideClickHandler) {
      // capture phase 同步 attach 时 / 移除也要 capture=true
      document.removeEventListener('click', outsideClickHandler, true);
      outsideClickHandler = null;
    }
    if (outsideClickTimer) {
      clearTimeout(outsideClickTimer);
      outsideClickTimer = null;
    }
    selectableEls = [];
    selectableActions = [];
    selectedIndex = -1;
    currentPopover = null;

    if (opts?.immediate) {
      popoverToHide.remove();
      return;
    }

    // exit 动画 path
    popoverToHide.classList.add('popover-closing');
    closingPopover = popoverToHide;
    closingTimer = setTimeout(() => {
      if (closingPopover === popoverToHide) {
        popoverToHide.remove();
        closingPopover = null;
      }
      closingTimer = null;
    }, 140);
  }

  function _createPopover(): HTMLElement {
    hide({ immediate: true });
    const popover = document.createElement('div');
    popover.className = 'search-result-popover';
    popover.setAttribute('role', 'listbox');
    const rect = anchor.getBoundingClientRect();
    popover.style.position = 'fixed';
    popover.style.top = `${rect.bottom + 4}px`;
    popover.style.left = `${rect.left}px`;
    popover.style.minWidth = `${Math.max(rect.width, 240)}px`;
    popover.style.maxWidth = '480px';
    // B1 polish fix DR-085 · 2026-05-21
    //   z:20 → 1100（高于详情卡 z:1000）/ 搜索浮窗作为 transient overlay 应永远在最上层
    //   原 z:20 在窄屏（viewport ≤ 1614）时被详情卡盖右半部分
    popover.style.zIndex = '1100';
    return popover;
  }

  function _registerSelectable(el: HTMLElement, action: () => void): void {
    selectableEls.push(el);
    selectableActions.push(action);
    el.addEventListener('click', action);
  }

  // ============================================================
  // 老 API · T2.2 flat list show(items)（backward compat）
  // ============================================================
  function show(items: SearchResultItem[]): void {
    hide({ immediate: true });
    if (items.length === 0) return;
    const visible = items.slice(0, MAX_RESULTS);
    const popover = _createPopover();

    visible.forEach((item) => {
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
      popover.appendChild(itemEl);

      _registerSelectable(itemEl, () => {
        onSelect(item);
        hide();
      });
    });

    document.body.appendChild(popover);
    currentPopover = popover;
    _attachKeys();
    _attachOutsideClick();
  }

  // ============================================================
  // T3.3 · 探索形态 showExplore(lists, onChipClick)
  // ============================================================
  function showExplore(lists: ExploreLists, onChipClick: (text: string) => void): void {
    hide({ immediate: true });
    const popover = _createPopover();

    const hint = document.createElement('div');
    hint.className = 'search-result-hint';
    hint.textContent = '§ 探索 · 不知道搜什么？从这里开始';
    popover.appendChild(hint);

    _addChipSection(
      popover,
      'persons',
      '§ 主要人物',
      lists.persons.length,
      '位',
      lists.persons.map((p) => p.name),
      onChipClick,
    );
    _addChipSection(
      popover,
      'concepts',
      '§ 核心概念',
      lists.concepts.length,
      '个',
      lists.concepts.map((c) => c.label),
      onChipClick,
    );
    _addChipSection(
      popover,
      'periods',
      '§ 关键时段',
      lists.periods.length,
      '段',
      lists.periods.map((p) => p.label),
      onChipClick,
    );

    document.body.appendChild(popover);
    currentPopover = popover;
    _attachKeys();
    _attachOutsideClick();
  }

  function _addChipSection(
    popover: HTMLElement,
    dataSection: string,
    headText: string,
    count: number,
    countLabel: string,
    chipTexts: string[],
    onChipClick: (text: string) => void,
  ): void {
    const section = document.createElement('div');
    section.className = 'search-result-section';
    section.dataset.section = dataSection;

    const head = document.createElement('div');
    head.className = 'search-result-section-head';
    const headSpan = document.createElement('span');
    headSpan.textContent = headText;
    const countEl = document.createElement('span');
    countEl.className = 'search-result-section-count';
    countEl.textContent = `${count} ${countLabel}`;
    head.appendChild(headSpan);
    head.appendChild(countEl);
    section.appendChild(head);

    const chipsWrap = document.createElement('div');
    chipsWrap.className = 'search-result-chips';
    chipTexts.forEach((text) => {
      const chipEl = document.createElement('span');
      chipEl.className = 'search-result-chip';
      chipEl.setAttribute('role', 'option');
      chipEl.dataset.chipText = text;
      chipEl.dataset.selected = 'false';
      chipEl.textContent = text;
      chipsWrap.appendChild(chipEl);
      _registerSelectable(chipEl, () => onChipClick(text));
    });
    section.appendChild(chipsWrap);
    popover.appendChild(section);
  }

  // ============================================================
  // T3.3 · 分组形态 showGrouped(results, personsMap, query, conceptHit)
  // ============================================================
  function showGrouped(
    results: SearchResult[],
    personsMap: Map<string, PersonNode>,
    query: string,
    conceptHit: CoreConcept | null,
  ): void {
    hide({ immediate: true });
    if (results.length === 0 && !conceptHit) return;

    const popover = _createPopover();

    // § 概念命中段（可选）
    if (conceptHit) {
      _addConceptSection(popover, conceptHit);
    }

    // person 命中（如搜"马克思"matches person.name_zh）单独段
    const personResults = results.filter((r) => r.type === 'person');
    for (const pr of personResults) {
      _addPersonSection(popover, pr, personsMap, query);
    }

    // claim 按 author_id 分组（保留 score 排序的 Map insertion order）
    const groupedByAuthor = new Map<string, SearchResult[]>();
    for (const r of results) {
      if (r.type !== 'claim' || !r.author_id) continue;
      const arr = groupedByAuthor.get(r.author_id) ?? [];
      arr.push(r);
      groupedByAuthor.set(r.author_id, arr);
    }

    for (const [authorId, claims] of groupedByAuthor) {
      _addClaimGroupSection(popover, authorId, claims, personsMap, query);
    }

    document.body.appendChild(popover);
    currentPopover = popover;
    _attachKeys();
    _attachOutsideClick();
  }

  function _addConceptSection(popover: HTMLElement, conceptHit: CoreConcept): void {
    const section = document.createElement('div');
    section.className = 'search-result-section';
    section.dataset.section = 'concept';

    const head = document.createElement('div');
    head.className = 'search-result-section-head';
    const headSpan = document.createElement('span');
    headSpan.textContent = '§ 概念';
    const countEl = document.createElement('span');
    countEl.className = 'search-result-section-count';
    countEl.textContent = '1 个';
    head.appendChild(headSpan);
    head.appendChild(countEl);
    section.appendChild(head);

    const chipsWrap = document.createElement('div');
    chipsWrap.className = 'search-result-chips';
    const chipEl = document.createElement('span');
    chipEl.className = 'search-result-chip search-result-chip-concept';
    chipEl.setAttribute('role', 'option');
    chipEl.dataset.selected = 'false';
    chipEl.textContent = `${conceptHit.label} · ${conceptHit.proposedByName} 核心 / ${conceptHit.year} ${conceptHit.source}`;
    chipsWrap.appendChild(chipEl);
    section.appendChild(chipsWrap);
    popover.appendChild(section);

    _registerSelectable(chipEl, () => {
      // 概念 chip · V1 暂以 claim type + concept-{label} id 占位（T4.x 真接概念高亮）
      onSelect({
        type: 'claim',
        id: `concept-${conceptHit.label}`,
        label: conceptHit.label,
      });
      hide();
    });
  }

  function _addPersonSection(
    popover: HTMLElement,
    pr: SearchResult,
    personsMap: Map<string, PersonNode>,
    query: string,
  ): void {
    const personName = personsMap.get(pr.id)?.name_zh ?? pr.label;
    const section = document.createElement('div');
    section.className = 'search-result-section';
    section.dataset.section = 'group';
    section.dataset.authorId = pr.id;

    const head = document.createElement('div');
    head.className = 'search-result-section-head';
    head.innerHTML = `<span>§ ${_escapeHtml(personName)}</span><span class="search-result-section-count">人物</span>`;
    section.appendChild(head);

    const itemEl = document.createElement('div');
    itemEl.className = 'search-result-claim-item';
    itemEl.setAttribute('role', 'option');
    itemEl.dataset.resultType = 'person';
    itemEl.dataset.resultId = pr.id;
    itemEl.dataset.selected = 'false';

    const text = document.createElement('span');
    text.className = 'search-result-claim-text';
    text.innerHTML = _highlightHtml(personName, query);
    itemEl.appendChild(text);

    section.appendChild(itemEl);
    popover.appendChild(section);

    _registerSelectable(itemEl, () => {
      onSelect({ type: 'person', id: pr.id, label: personName });
      hide();
    });
  }

  function _addClaimGroupSection(
    popover: HTMLElement,
    authorId: string,
    claims: SearchResult[],
    personsMap: Map<string, PersonNode>,
    query: string,
  ): void {
    const personName = personsMap.get(authorId)?.name_zh ?? `(未知 ${authorId})`;
    const section = document.createElement('div');
    section.className = 'search-result-section';
    section.dataset.section = 'group';
    section.dataset.authorId = authorId;

    const head = document.createElement('div');
    head.className = 'search-result-section-head';
    head.innerHTML = `<span>§ ${_escapeHtml(personName)}</span><span class="search-result-section-count">${claims.length} 条主张</span>`;
    section.appendChild(head);

    const list = document.createElement('div');
    list.className = 'search-result-claim-list';

    claims.forEach((c) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'search-result-claim-item';
      itemEl.setAttribute('role', 'option');
      itemEl.dataset.resultType = 'claim';
      itemEl.dataset.resultId = c.id;
      itemEl.dataset.selected = 'false';

      const text = document.createElement('span');
      text.className = 'search-result-claim-text';
      text.innerHTML = _highlightHtml(c.label, query);
      itemEl.appendChild(text);

      if (c.year != null) {
        const year = document.createElement('span');
        year.className = 'search-result-claim-year';
        year.textContent = String(c.year);
        itemEl.appendChild(year);
      }

      list.appendChild(itemEl);
      _registerSelectable(itemEl, () => {
        onSelect({ type: 'claim', id: c.id, label: c.label, matched: c.matched });
        hide();
      });
    });

    section.appendChild(list);
    popover.appendChild(section);
  }

  function isOpen(): boolean {
    return currentPopover !== null;
  }

  return { show, showExplore, showGrouped, hide, isOpen };
}

/**
 * 关键词高亮（V1 仅字面）· em.search-result-highlight 包裹 query substring
 */
function _highlightHtml(text: string, query: string): string {
  const q = query.trim();
  if (!q) return _escapeHtml(text);
  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const parts: string[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lowerText.indexOf(lowerQ, i);
    if (idx < 0) {
      parts.push(_escapeHtml(text.slice(i)));
      break;
    }
    if (idx > i) parts.push(_escapeHtml(text.slice(i, idx)));
    parts.push(
      `<em class="search-result-highlight">${_escapeHtml(text.slice(idx, idx + q.length))}</em>`,
    );
    i = idx + q.length;
  }
  return parts.join('');
}

function _escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
