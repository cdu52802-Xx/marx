// M-B2 阶段 A · swap-button.ts unit test
// 复用 plan T3.2 设计 · STORAGE_KEY 'marx:canvas-role' · 默认 'list-main' · toggle 切 'geo-main'
//   dev 期当 dev toggle 按钮 · Stage 3 升级为正式互换按钮（mount 位置改 header / 视觉 polish）
//   函数签名 mountSwapButton(container) 不变 · 直接复用 Stage 3 工程

import { describe, it, expect, beforeEach } from 'vitest';
import { mountSwapButton, type CanvasRole } from '../../src/components/swap-button.ts';

describe('mountSwapButton · M-B2 阶段 A', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('默认 localStorage 无值 · getCurrent() === "list-main"（B1 ship 后既有体验）', () => {
    const api = mountSwapButton(container);
    expect(api.getCurrent()).toBe('list-main');
  });

  it('localStorage 已有 "geo-main" · 启动后 getCurrent() === "geo-main"（持久化恢复）', () => {
    localStorage.setItem('marx:canvas-role', 'geo-main');
    const api = mountSwapButton(container);
    expect(api.getCurrent()).toBe('geo-main');
  });

  it('toggle() · "list-main" → "geo-main" → "list-main"（双向切换）', () => {
    const api = mountSwapButton(container);
    expect(api.getCurrent()).toBe('list-main');
    api.toggle();
    expect(api.getCurrent()).toBe('geo-main');
    api.toggle();
    expect(api.getCurrent()).toBe('list-main');
  });

  it('toggle() · 切后 localStorage 持久化到 "marx:canvas-role"', () => {
    const api = mountSwapButton(container);
    api.toggle();
    expect(localStorage.getItem('marx:canvas-role')).toBe('geo-main');
    api.toggle();
    expect(localStorage.getItem('marx:canvas-role')).toBe('list-main');
  });

  it('onChange callback · toggle 时触发 · 拿到新 role', () => {
    const api = mountSwapButton(container);
    const calls: CanvasRole[] = [];
    api.onChange((role) => calls.push(role));
    api.toggle();
    api.toggle();
    api.toggle();
    expect(calls).toEqual(['geo-main', 'list-main', 'geo-main']);
  });

  it('点击按钮 · 等价 toggle()（DOM click event → 切换 + onChange 触发）', () => {
    const api = mountSwapButton(container);
    const calls: CanvasRole[] = [];
    api.onChange((role) => calls.push(role));
    const btn = container.querySelector('button.swap-button') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    expect(api.getCurrent()).toBe('geo-main');
    expect(calls).toEqual(['geo-main']);
  });
});
