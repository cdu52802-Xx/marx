// B1 T2.1 · 搜索输入框
//
// 责任：仅渲染输入框 + 暴露 onInput callback。
// 视觉风格走 CSS（.search-input class / styles.css 收口）/ 不在 JS 里 inline style。
// 不做 debounce（T3.2 由调用方包 / 保持本组件纯 view）。
// 不做候选 list（T2.2 search-result-popover 单独 component）。
//
// API：
//   const api = mountSearchInput({ container, onInput, placeholder? });
//   api.input  → HTMLInputElement（T2.2 popover 定位 anchor 用）

export interface SearchInputApi {
  input: HTMLInputElement;
}

export function mountSearchInput({
  container,
  onInput,
  placeholder,
  debounceMs,
}: {
  container: HTMLElement;
  onInput: (query: string) => void;
  placeholder?: string;
  /** debounce ms · default 0（立即触发 / 测试 / backward compat）/ prod 用 200 不卡 */
  debounceMs?: number;
}): SearchInputApi {
  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'search-input';
  input.placeholder = placeholder ?? '搜索 · 主张 / 人物 / 地点';
  input.autocomplete = 'off';
  input.spellcheck = false;

  let timer: ReturnType<typeof setTimeout> | null = null;
  input.addEventListener('input', () => {
    if (debounceMs && debounceMs > 0) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        onInput(input.value);
        timer = null;
      }, debounceMs);
    } else {
      // debounceMs 未传 / 0 → 立即触发（backward compat）
      onInput(input.value);
    }
  });

  container.appendChild(input);

  return { input };
}
