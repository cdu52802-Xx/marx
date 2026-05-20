// B1 T1.1-T1.3 · header controls (search slot + 互换按钮 placeholder + 关于 + 视觉灵感)
// PM 选 B · 沿用 M4 米白透明 / brand h1 + 副标题 保留 index.html / 仅 mount controls

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mountHeader } from '../../src/components/header.ts';

describe('mountHeader', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('挂载 4 元素：搜索 slot + 互换按钮 + 关于 + 视觉灵感', () => {
    mountHeader({ container });
    expect(container.querySelector('.header-search-slot')).toBeTruthy();
    expect(container.querySelector('.header-swap')).toBeTruthy();
    expect(container.querySelector('.header-about')).toBeTruthy();
    expect(container.querySelector('.header-credit')).toBeTruthy();
  });

  it('互换按钮默认 disabled（B2 启用）+ title 提示', () => {
    mountHeader({ container });
    const swap = container.querySelector('.header-swap') as HTMLButtonElement;
    expect(swap.disabled).toBe(true);
    expect(swap.title).toContain('B2');
    expect(swap.textContent).toContain('↔');
    expect(swap.textContent).toContain('互换');
  });

  it('视觉灵感 link 指向 denizcemonduygu.com/philo', () => {
    mountHeader({ container });
    const credit = container.querySelector('.header-credit') as HTMLAnchorElement;
    expect(credit.href).toContain('denizcemonduygu.com/philo');
    expect(credit.target).toBe('_blank');
    expect(credit.rel).toContain('noopener');
  });

  it('关于 link 默认 anchor #about（about modal trigger / 实施期细化）', () => {
    mountHeader({ container });
    const about = container.querySelector('.header-about') as HTMLAnchorElement;
    expect(about.getAttribute('href')).toBe('#about');
    expect(about.textContent).toBe('关于');
  });

  it('container 加 .header-controls class', () => {
    mountHeader({ container });
    expect(container.classList.contains('header-controls')).toBe(true);
  });

  it('inline 分隔符 .header-sep 出现 2 次（互换-关于 / 关于-视觉灵感）', () => {
    mountHeader({ container });
    const seps = container.querySelectorAll('.header-sep');
    expect(seps.length).toBe(2);
  });

  it('搜索 slot 默认 empty（Stage 2 填充）', () => {
    mountHeader({ container });
    const slot = container.querySelector('.header-search-slot') as HTMLElement;
    expect(slot.children.length).toBe(0);
  });
});
