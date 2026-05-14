// M5 主线 A · T4 单元测试 · viz/center.ts 居中飞行算法
// spec § 7.3 单击 obs 同时居中 + 详情卡 · DR-017
import { describe, it, expect } from 'vitest';
import { computeCenterTransform } from '../../src/viz/center.ts';

describe('center · computeCenterTransform', () => {
  it('居中 obs 到屏幕中点 (无详情卡 + 无 sidebar)', () => {
    const t = computeCenterTransform({
      target: { x: 100, y: 200 },
      targetK: 3,
      viewport: { width: 800, height: 600 },
      sidebarWidth: 0,
      popoverWidth: 0,
    });
    // visibleCenterX = (800 - 0 - 0) / 2 + 0 = 400
    // visibleCenterY = 600 / 2 = 300
    // x = 400 - 100 * 3 = 100
    // y = 300 - 200 * 3 = -300
    expect(t.k).toBe(3);
    expect(t.x).toBe(100);
    expect(t.y).toBe(-300);
  });

  it('居中时 offset 详情卡宽度 (400) + sidebar (32)', () => {
    const t = computeCenterTransform({
      target: { x: 1000, y: 500 },
      targetK: 2,
      viewport: { width: 1280, height: 720 },
      sidebarWidth: 32,
      popoverWidth: 400,
    });
    // visibleCenterX = (1280 - 32 - 400) / 2 + 32 = 424 + 32 = 456
    // visibleCenterY = 720 / 2 = 360
    // x = 456 - 1000 * 2 = -1544
    // y = 360 - 500 * 2 = -640
    expect(t.k).toBe(2);
    expect(t.x).toBe(-1544);
    expect(t.y).toBe(-640);
  });

  it('targetK < currentK 不缩小（取 max）', () => {
    const t = computeCenterTransform({
      target: { x: 100, y: 100 },
      targetK: 3,
      currentK: 5,
      viewport: { width: 800, height: 600 },
      sidebarWidth: 0,
      popoverWidth: 0,
    });
    // 当前已经 5× / target 是 3× → 保持 5×
    expect(t.k).toBe(5);
  });

  it('currentK 不传 = targetK 直接用', () => {
    const t = computeCenterTransform({
      target: { x: 50, y: 50 },
      targetK: 2.5,
      viewport: { width: 800, height: 600 },
      sidebarWidth: 0,
      popoverWidth: 0,
    });
    expect(t.k).toBe(2.5);
  });

  it('currentK = targetK 保持 targetK', () => {
    const t = computeCenterTransform({
      target: { x: 50, y: 50 },
      targetK: 3,
      currentK: 3,
      viewport: { width: 800, height: 600 },
      sidebarWidth: 0,
      popoverWidth: 0,
    });
    expect(t.k).toBe(3);
  });

  it('居中算法在不同 viewport 大小一致', () => {
    // 同一 target / targetK / 不同 viewport → x/y 不同但 k 相同
    const t1 = computeCenterTransform({
      target: { x: 500, y: 300 },
      targetK: 2,
      viewport: { width: 1000, height: 800 },
      sidebarWidth: 0,
      popoverWidth: 0,
    });
    const t2 = computeCenterTransform({
      target: { x: 500, y: 300 },
      targetK: 2,
      viewport: { width: 1280, height: 720 },
      sidebarWidth: 0,
      popoverWidth: 0,
    });
    expect(t1.k).toBe(t2.k);
    expect(t1.x).not.toBe(t2.x); // viewport 不同 / 中心点不同 / x 不同
  });
});
