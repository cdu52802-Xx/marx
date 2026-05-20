// B1 T2.1 · 搜索输入框 unit test
// API 期望：mountSearchInput({ container, onInput, placeholder? }): { input }
//   - 渲染 <input type="search" class="search-input"> 到 container
//   - input event → onInput(value) callback
//   - placeholder 默认含 "搜索" / 可 override
//   - paper 风格视觉走 CSS（不在 JS 里 inline style / styles.css 收口）

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mountSearchInput } from '../../src/components/search.ts';

describe('mountSearchInput', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('挂载 <input class="search-input"> 到 container', () => {
    mountSearchInput({ container, onInput: () => {} });
    const input = container.querySelector('input.search-input');
    expect(input).toBeTruthy();
    expect(input?.tagName).toBe('INPUT');
  });

  it('input type 是 "search"（语义 + 浏览器原生 clear button）', () => {
    mountSearchInput({ container, onInput: () => {} });
    const input = container.querySelector('input.search-input') as HTMLInputElement;
    expect(input.type).toBe('search');
  });

  it('打字触发 onInput callback 携带当前 value', () => {
    let captured = '';
    mountSearchInput({
      container,
      onInput: (q) => {
        captured = q;
      },
    });
    const input = container.querySelector('input.search-input') as HTMLInputElement;
    input.value = '马克思';
    input.dispatchEvent(new Event('input'));
    expect(captured).toBe('马克思');
  });

  it('多次打字 onInput 都会触发 / 不 debounce（debounce T3.2 加）', () => {
    const captured: string[] = [];
    mountSearchInput({
      container,
      onInput: (q) => {
        captured.push(q);
      },
    });
    const input = container.querySelector('input.search-input') as HTMLInputElement;

    input.value = '马';
    input.dispatchEvent(new Event('input'));
    input.value = '马克';
    input.dispatchEvent(new Event('input'));
    input.value = '马克思';
    input.dispatchEvent(new Event('input'));

    expect(captured).toEqual(['马', '马克', '马克思']);
  });

  it('返回 api.input = 输入框 DOM ref（T2.2 popover 定位用）', () => {
    const api = mountSearchInput({ container, onInput: () => {} });
    expect(api.input).toBeInstanceOf(HTMLInputElement);
    expect(api.input.classList.contains('search-input')).toBe(true);
  });

  it('placeholder 默认含 "搜索"（中文 / 提示用户用途）', () => {
    mountSearchInput({ container, onInput: () => {} });
    const input = container.querySelector('input.search-input') as HTMLInputElement;
    expect(input.placeholder).toContain('搜索');
  });

  it('placeholder 可通过参数 override', () => {
    mountSearchInput({ container, onInput: () => {}, placeholder: '自定义占位' });
    const input = container.querySelector('input.search-input') as HTMLInputElement;
    expect(input.placeholder).toBe('自定义占位');
  });

  // T3.2 · debounce 200ms（fake timers）
  it('debounceMs=200 · rapid type 200ms 内只触发最后 1 次', () => {
    vi.useFakeTimers();
    try {
      const captured: string[] = [];
      mountSearchInput({
        container,
        onInput: (q) => captured.push(q),
        debounceMs: 200,
      });
      const input = container.querySelector('input.search-input') as HTMLInputElement;

      input.value = '马';
      input.dispatchEvent(new Event('input'));
      input.value = '马克';
      input.dispatchEvent(new Event('input'));
      input.value = '马克思';
      input.dispatchEvent(new Event('input'));

      // debounce 内未触发
      expect(captured).toEqual([]);
      vi.advanceTimersByTime(199);
      expect(captured).toEqual([]);

      // 跨过 200ms → 仅最后 1 次
      vi.advanceTimersByTime(2);
      expect(captured).toEqual(['马克思']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('debounceMs=200 · 间隔 > 200ms 的多次 type → 每次都触发', () => {
    vi.useFakeTimers();
    try {
      const captured: string[] = [];
      mountSearchInput({
        container,
        onInput: (q) => captured.push(q),
        debounceMs: 200,
      });
      const input = container.querySelector('input.search-input') as HTMLInputElement;

      input.value = '马';
      input.dispatchEvent(new Event('input'));
      vi.advanceTimersByTime(250);

      input.value = '马克';
      input.dispatchEvent(new Event('input'));
      vi.advanceTimersByTime(250);

      expect(captured).toEqual(['马', '马克']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('未传 debounceMs → 立即触发（backward compat）', () => {
    const captured: string[] = [];
    mountSearchInput({ container, onInput: (q) => captured.push(q) });
    const input = container.querySelector('input.search-input') as HTMLInputElement;
    input.value = '马克思';
    input.dispatchEvent(new Event('input'));
    expect(captured).toEqual(['马克思']);
  });
});
