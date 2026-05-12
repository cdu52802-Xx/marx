import { describe, it, expect } from 'vitest';
import {
  computeTickPositions,
  yearToPercent,
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
