import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  computeTickPositions,
  yearToPercent,
  computeRangeBarWidth,
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

// M5 T6 · 视觉范围条宽度计算 (Q2 样式 B / DR-039)
// 公式：rangeWidth = timelineWidth / zoomK
// 推导：SVG viewBox + preserveAspectRatio="xMidYMid meet" + fit-to-content default
//   k=1 → 全 viewBox 可见 → 范围条 = 全 timeline 宽
//   k=2 → 可见画布段 = 1/2 → 可见年份段 = 全长/2 → 范围条 = timelineWidth/2
//   k=8 → timelineWidth/8
describe('timeline · M5 视觉范围条宽度 (DR-039)', () => {
  it('zoom k=1 → 范围条宽度 = 全 timelineWidth (180 年全可见)', () => {
    const width = computeRangeBarWidth({ zoomK: 1, timelineWidth: 600 });
    expect(width).toBeCloseTo(600, 0);
  });

  it('zoom k=2 → 范围条宽度 = 1/2 timelineWidth', () => {
    const width = computeRangeBarWidth({ zoomK: 2, timelineWidth: 600 });
    expect(width).toBeCloseTo(300, 0);
  });

  it('zoom k=4 → 范围条宽度 = 1/4 timelineWidth', () => {
    const width = computeRangeBarWidth({ zoomK: 4, timelineWidth: 600 });
    expect(width).toBeCloseTo(150, 0);
  });

  it('zoom k=8 → 范围条宽度 = 1/8 timelineWidth (最大 zoom)', () => {
    const width = computeRangeBarWidth({ zoomK: 8, timelineWidth: 600 });
    expect(width).toBeCloseTo(75, 0);
  });
});

// M5 T6 · timeline 新 API 测试 (DR-038 + DR-039)
// 整条线可拖（不画 thumb circle marker）/ 范围条样式 B（rect + 2 edge ticks）
// API: { setCursor, getCurrentYear, updateZoomK, getCursorPxX }
describe('timeline · M5 新 API', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('mountTimeline 返回 { setCursor, getCurrentYear, updateZoomK }', () => {
    const api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    expect(typeof api.setCursor).toBe('function');
    expect(typeof api.getCurrentYear).toBe('function');
    expect(typeof api.updateZoomK).toBe('function');
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
    api.setCursor(1700); // < yearMin
    expect(api.getCurrentYear()).toBe(1770);
    api.setCursor(2000); // > yearMax
    expect(api.getCurrentYear()).toBe(1950);
  });

  it('SVG 范围条 rect 渲染（class timeline-range-bar）', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const rangeBar = container.querySelector('.timeline-range-bar');
    expect(rangeBar).not.toBeNull();
    expect(rangeBar?.getAttribute('fill')).toBe('#5b3a8c');
  });

  it('SVG 范围条两端 tick 渲染 (样式 B / DR-039)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const edgeTicks = container.querySelectorAll('.timeline-range-edge-tick');
    expect(edgeTicks.length).toBe(2); // 左右两端
  });

  it('updateZoomK(2) 范围条宽度变 1/2', () => {
    const api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const rangeBar = container.querySelector('.timeline-range-bar') as SVGRectElement;
    const initWidth = parseFloat(rangeBar.getAttribute('width') ?? '0');
    expect(initWidth).toBeGreaterThan(0);
    api.updateZoomK(2);
    const newWidth = parseFloat(rangeBar.getAttribute('width') ?? '0');
    expect(newWidth).toBeCloseTo(initWidth / 2, 0);
  });

  it('删 input range slider (HTML <input type="range">)', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const slider = container.querySelector('#tl-slider');
    expect(slider).toBeNull();
  });

  it('整条 timeline 可拖：axis container cursor: ew-resize', () => {
    mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1860 });
    const dragArea = container.querySelector('.timeline-drag-area') as HTMLElement | SVGElement;
    expect(dragArea).not.toBeNull();
  });
});

// M4 closure fix #5 · qa ISSUE-001: timeline play button toggle pause
// M5 T6 改造：原测试用 slider.value / 改用 api.getCurrentYear()
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
    expect(btn.textContent).toBe('▶ 播放思想史');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('click 1 次: 切换到 "⏸ 暂停播放" + aria-pressed = true (B2 修复核心)', () => {
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1880 });
    const btn = getPlayBtn();
    btn.click();
    expect(btn.textContent).toBe('⏸ 暂停播放');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('click 2 次: 暂停 / 回到 "▶ 播放思想史" + aria-pressed = false', () => {
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1880 });
    const btn = getPlayBtn();
    btn.click(); // play
    btn.click(); // pause
    expect(btn.textContent).toBe('▶ 播放思想史');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('cursor 跑到 yearMax 自然停: textContent reset / aria-pressed reset', () => {
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1940 });
    const btn = getPlayBtn();
    btn.click(); // 从 1940 起步
    // T7 改 20s 跑完 180 年 / 9 年/秒 / 24 fps → 0.375 年/step / 50 ms 间隔
    // 1940→1950 = 10 年 / 10/0.375 = ~27 steps × 50ms = 1350ms 跑完
    vi.advanceTimersByTime(2000); // 充够跑完到 yearMax
    expect(btn.textContent).toBe('▶ 播放思想史');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  it('暂停 → 重新 click: 从上次位置继续 (不 reset 到 yearMin)', () => {
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1850 });
    const btn = getPlayBtn();
    btn.click(); // play 从 1850
    vi.advanceTimersByTime(500); // 起跑 500ms
    btn.click(); // pause
    const pausedYear = api.getCurrentYear();
    expect(pausedYear).toBeGreaterThan(1850);
    expect(pausedYear).toBeLessThan(1950);
    btn.click(); // resume
    vi.advanceTimersByTime(100); // 继续跑 100ms
    expect(api.getCurrentYear()).toBeGreaterThan(pausedYear);
  });

  it('cursor 在 yearMax 时 click: 从 yearMin 重新开始 (restart 语义)', () => {
    api = mountTimeline({ container, yearMin: 1770, yearMax: 1950, initialCursor: 1950 });
    const btn = getPlayBtn();
    btn.click(); // restart from yearMin
    vi.advanceTimersByTime(100); // 起跑 100ms
    expect(api.getCurrentYear()).toBeGreaterThan(1770);
    expect(api.getCurrentYear()).toBeLessThan(1800); // 未跑远
  });
});
