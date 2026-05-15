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

// M5 T6 · timeline 新 API 测试
// vision pivot @ Stage 3 PM checkpoint 1 (DR-042 ~ DR-045): 时间轴 = 时间游标 / 不联动画布
// API: { setCursor, getCurrentYear } (updateZoomK 已删 / range bar 已删)
describe('timeline · M5 新 API', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('mountTimeline 返回 { setCursor, getCurrentYear }', () => {
    const api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    expect(typeof api.setCursor).toBe('function');
    expect(typeof api.getCurrentYear).toBe('function');
  });

  it('getCurrentYear 初始值 = initialCursor', () => {
    const api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1840 });
    expect(api.getCurrentYear()).toBe(1840);
  });

  it('setCursor(year) 改 getCurrentYear', () => {
    const api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    api.setCursor(1900);
    expect(api.getCurrentYear()).toBe(1900);
  });

  it('setCursor clamp 到 [yearMin, yearMax]', () => {
    const api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    api.setCursor(1700);
    expect(api.getCurrentYear()).toBe(1770);
    api.setCursor(2000);
    expect(api.getCurrentYear()).toBe(1950);
  });

  it('删 input range slider (HTML <input type="range">)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const slider = container.querySelector('#tl-slider');
    expect(slider).toBeNull();
  });

  it('删视觉范围条 + edge ticks (DR-045 vision pivot)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    expect(container.querySelector('.timeline-range-bar')).toBeNull();
    expect(container.querySelectorAll('.timeline-range-edge-tick').length).toBe(0);
  });

  it('cursor 视觉指示 (紫色竖线 / DR-042 让用户看到游标位置)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const cursorLine = container.querySelector('.timeline-cursor-line');
    expect(cursorLine).not.toBeNull();
    expect(cursorLine?.getAttribute('stroke')).toBe('#5b3a8c');
  });

  it('floating cursor badge 渲染 + 显示 year (DR-051 所见即所得)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const badge = container.querySelector('.timeline-cursor-badge');
    expect(badge).not.toBeNull();
    const rect = badge?.querySelector('rect');
    const text = badge?.querySelector('text');
    expect(rect?.getAttribute('fill')).toBe('#5b3a8c');
    expect(text?.textContent).toBe('1860');
  });

  it('删第二行外部 #tl-cursor-label HTML span (DR-051 单行布局)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const oldLabel = container.querySelector('#tl-cursor-label');
    expect(oldLabel).toBeNull();
  });

  it('▶ button = 单图标无文字 (DR-051 单行布局)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const btn = container.querySelector('#tl-play');
    expect(btn?.textContent).toBe('▶');
    // a11y: aria-label 仍含全文 / 屏幕阅读器友好
    expect(btn?.getAttribute('aria-label')).toBe('播放思想史');
  });

  it('整条 timeline 可拖：drag-area + cursor: ew-resize', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const dragArea = container.querySelector('.timeline-drag-area');
    expect(dragArea).not.toBeNull();
  });

  it('onCursorChange 在 setCursor 不 fire (避免初始化反向触发画布同步)', () => {
    const fn = vi.fn();
    const api = mountTimeline({
      container,
      yearMin: 1770,
      yearMax: 1950,
      initialCursor: 1860,
      onCursorChange: fn,
    });
    api.setCursor(1900);
    // setCursor 仅改内部 state / 不 fire callback（callback 只在 drag / click-to-seek / play 触发）
    expect(fn).not.toHaveBeenCalled();
  });

  it('click-to-seek: mousedown 立即把 cursor 跳到 click 位置 + fire callback (PM R2 Fix 3 / DR-048)', () => {
    const fn = vi.fn();
    const api = mountTimeline({
      container,
      yearMin: 1770,
      yearMax: 1950,
      initialCursor: 1860,
      onCursorChange: fn,
    });
    const svg = container.querySelector('#tl-svg') as SVGSVGElement;
    // mock svg.getBoundingClientRect 让 click 位置在 axis 80% 处（对应年份 ~ 1914）
    // jsdom 默认返 0 / 让 svg.getBoundingClientRect 返 { left:0, width:600 }
    svg.getBoundingClientRect = () => ({
      left: 0,
      width: 600,
      top: 0,
      height: 60,
      right: 600,
      bottom: 60,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    // mousedown 在 svg local x=480 (= 80% / axis 5%-95% 间 80% = 1770 + 180×(75/90) ≈ 1920)
    svg.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 480, clientY: 30 }));
    // cursor 立即跳到 click 位置 / fire callback
    expect(fn).toHaveBeenCalledTimes(1);
    expect(api.getCurrentYear()).toBeGreaterThan(1860);
    expect(api.getCurrentYear()).toBeLessThanOrEqual(1950);
    // cleanup
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });
});

// play button toggle (M4 closure fix #5 · qa ISSUE-001 / M5 T6 改用 getCurrentYear)
describe('timeline · play button toggle (B2 fix)', () => {
  let container: HTMLElement;
  let api: ReturnType<typeof mountTimeline>;

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
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1880 });
    const btn = getPlayBtn();
    expect(btn.textContent).toBe('▶');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('click 1 次: 切换到 "⏸ 暂停播放" + aria-pressed = true', () => {
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1880 });
    const btn = getPlayBtn();
    btn.click();
    expect(btn.textContent).toBe('⏸');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('click 2 次: 暂停 / 回到 "▶ 播放思想史" + aria-pressed = false', () => {
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1880 });
    const btn = getPlayBtn();
    btn.click();
    btn.click();
    expect(btn.textContent).toBe('▶');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('cursor 跑到 yearMax 自然停: textContent reset / aria-pressed reset', () => {
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1940 });
    const btn = getPlayBtn();
    btn.click();
    vi.advanceTimersByTime(2000);
    expect(btn.textContent).toBe('▶');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('暂停 → 重新 click: 从上次位置继续 (不 reset 到 yearMin)', () => {
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1850 });
    const btn = getPlayBtn();
    btn.click();
    vi.advanceTimersByTime(500);
    btn.click();
    const pausedYear = api.getCurrentYear();
    expect(pausedYear).toBeGreaterThan(1850);
    expect(pausedYear).toBeLessThan(1950);
    btn.click();
    vi.advanceTimersByTime(100);
    expect(api.getCurrentYear()).toBeGreaterThan(pausedYear);
  });

  it('cursor 在 yearMax 时 click: 从 yearMin 重新开始 (restart 语义)', () => {
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1950 });
    const btn = getPlayBtn();
    btn.click();
    vi.advanceTimersByTime(100);
    expect(api.getCurrentYear()).toBeGreaterThan(1770);
    expect(api.getCurrentYear()).toBeLessThan(1800);
  });
});
