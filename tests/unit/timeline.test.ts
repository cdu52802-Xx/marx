import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  computeTickPositions,
  yearToPercent,
  mountTimeline,
  type TimelineTick,
} from '../../src/components/timeline.ts';

describe('timeline · ticks 计算', () => {
  it('Marx 活跃期 (1830/1850/1870) 标紫色 + 加粗', () => {
    const ticks = computeTickPositions(1770, 1950);
    const marxTicks = ticks.filter((t: TimelineTick) => [1830, 1850, 1870].includes(t.year));
    expect(marxTicks.length).toBe(3);
    for (const t of marxTicks) {
      expect(t.major).toBe(true);
      expect(t.color).toBe('#5b3a8c');
    }
  });

  it('其他 ticks 灰色 + 标准', () => {
    const ticks = computeTickPositions(1770, 1950);
    const nonMarxTicks = ticks.filter((t: TimelineTick) => ![1830, 1850, 1870].includes(t.year));
    for (const t of nonMarxTicks) {
      expect(t.color).not.toBe('#5b3a8c');
    }
  });

  it('yearToPercent 正确映射 1770→0, 1950→100', () => {
    expect(yearToPercent(1770, 1770, 1950)).toBeCloseTo(0);
    expect(yearToPercent(1950, 1770, 1950)).toBeCloseTo(100);
    expect(yearToPercent(1860, 1770, 1950)).toBeCloseTo(50);
  });
});

// M4 closure fix #5 · qa ISSUE-001: timeline play button toggle pause
describe('timeline · play button toggle (B2 fix)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function getPlayBtn() {
    return container.querySelector('#tl-play') as HTMLButtonElement;
  }

  it('初始态: textContent 显示 "▶ 播放思想史" / aria-pressed = false', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1880 });
    const btn = getPlayBtn();
    expect(btn.textContent).toBe('▶ 播放思想史');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('click 1 次: 切换到 "⏸ 暂停播放" + aria-pressed = true (B2 修复核心)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1880 });
    const btn = getPlayBtn();
    btn.click();
    expect(btn.textContent).toBe('⏸ 暂停播放');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('click 2 次: 暂停 / 回到 "▶ 播放思想史" + aria-pressed = false', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1880 });
    const btn = getPlayBtn();
    btn.click(); // play
    btn.click(); // pause
    expect(btn.textContent).toBe('▶ 播放思想史');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('cursor 跑到 yearMax 自然停: textContent reset / aria-pressed reset', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1940 });
    const btn = getPlayBtn();
    btn.click(); // 从 1940 起步 / +5 = 1945 / +5 = 1950 触发 stop
    vi.advanceTimersByTime(300); // 100ms × 3 跑完到 yearMax
    expect(btn.textContent).toBe('▶ 播放思想史');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('暂停 → 重新 click: 从上次位置继续 (不 reset 到 yearMin)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1850 });
    const slider = container.querySelector('#tl-slider') as HTMLInputElement;
    const btn = getPlayBtn();
    btn.click(); // play 从 1850
    vi.advanceTimersByTime(300); // 1850 → 1865
    btn.click(); // pause
    const pausedYear = parseInt(slider.value, 10);
    expect(pausedYear).toBeGreaterThan(1850);
    expect(pausedYear).toBeLessThan(1950);
    btn.click(); // resume
    vi.advanceTimersByTime(100); // +5 年
    expect(parseInt(slider.value, 10)).toBeGreaterThan(pausedYear);
  });

  it('cursor 在 yearMax 时 click: 从 yearMin 重新开始 (restart 语义)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1950 });
    const slider = container.querySelector('#tl-slider') as HTMLInputElement;
    const btn = getPlayBtn();
    btn.click(); // 应该 restart 从 yearMin
    vi.advanceTimersByTime(100); // +5 年 (从 1770)
    expect(parseInt(slider.value, 10)).toBe(1775);
  });
});
