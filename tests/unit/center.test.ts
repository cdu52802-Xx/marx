// M5 主线 A · T4 单元测试 · viz/center.ts 居中飞行算法
// spec § 7.3 单击 obs 同时居中 + 详情卡 · DR-017
import { describe, it, expect } from 'vitest';
import { computeCenterTransform, chooseTargetK } from '../../src/viz/center.ts';

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

describe('center · Stage 2 PM checkpoint Issue 2.1 · Y 居中可见区', () => {
  it('headerHeight + timelineHeight 都传 → visibleCenterY 算可见区中点', () => {
    const t = computeCenterTransform({
      target: { x: 100, y: 200 },
      targetK: 2,
      viewport: { width: 800, height: 1000 },
      sidebarWidth: 0,
      popoverWidth: 0,
      headerHeight: 70,
      timelineHeight: 160,
    });
    // visibleCenterY = 70 + (1000 - 70 - 160) / 2 = 70 + 385 = 455
    // y = 455 - 200 * 2 = 55
    expect(t.y).toBe(55);
  });

  it('headerHeight 不传 → 默认 0 / 等同旧行为', () => {
    const t = computeCenterTransform({
      target: { x: 100, y: 200 },
      targetK: 2,
      viewport: { width: 800, height: 600 },
      sidebarWidth: 0,
      popoverWidth: 0,
    });
    // visibleCenterY = 0 + (600 - 0 - 0) / 2 = 300
    // y = 300 - 200 * 2 = -100
    expect(t.y).toBe(-100);
  });

  it('Marx 项目实际参数 (header 70 / timeline 160 / sidebar 48 / popover 380)', () => {
    const t = computeCenterTransform({
      target: { x: 1000, y: 500 },
      targetK: 3,
      viewport: { width: 1280, height: 800 },
      sidebarWidth: 48,
      popoverWidth: 380,
      headerHeight: 70,
      timelineHeight: 160,
    });
    // visibleCenterX = (1280 - 48 - 380) / 2 + 48 = 426 + 48 = 474
    // visibleCenterY = 70 + (800 - 70 - 160) / 2 = 70 + 285 = 355
    // x = 474 - 1000 * 3 = -2526
    // y = 355 - 500 * 3 = -1145
    expect(t.x).toBe(-2526);
    expect(t.y).toBe(-1145);
  });
});

describe('center · Stage 2 PM checkpoint Issue 2.2 · chooseTargetK 递进策略', () => {
  it('currentK = 1 (全景) → 6', () => {
    expect(chooseTargetK(1)).toBe(6);
  });

  it('currentK = 2 → 6', () => {
    expect(chooseTargetK(2)).toBe(6);
  });

  it('currentK = 3 → 6 (边界 / <= 3 全到 6)', () => {
    expect(chooseTargetK(3)).toBe(6);
  });

  it('currentK = 3.5 → 8 (3 < k <= 6 全到 8)', () => {
    expect(chooseTargetK(3.5)).toBe(8);
  });

  it('currentK = 6 → 8 (边界 / <= 6 到 8)', () => {
    expect(chooseTargetK(6)).toBe(8);
  });

  it('currentK = 6.5 → 6.5 (保持 currentK / 已在细节区)', () => {
    expect(chooseTargetK(6.5)).toBe(6.5);
  });

  it('currentK = 8 (max) → 8 保持', () => {
    expect(chooseTargetK(8)).toBe(8);
  });
});
