// M5 主线 A · T4 + Stage 2 R3 单元测试 · viz/center.ts 居中飞行算法
// spec § 7.3 单击 obs 同时居中 + 详情卡 · DR-017
import { describe, it, expect } from 'vitest';
import { computeCenterTransform, chooseTargetK, pixelToViewBox } from '../../src/viz/center.ts';

describe('center · computeCenterTransform (pure math · viewBox coords)', () => {
  it('居中：visibleCenter - target * k', () => {
    const t = computeCenterTransform({
      target: { x: 100, y: 200 },
      targetK: 3,
      visibleCenter: { x: 400, y: 300 },
    });
    // x = 400 - 100 * 3 = 100
    // y = 300 - 200 * 3 = -300
    expect(t.k).toBe(3);
    expect(t.x).toBe(100);
    expect(t.y).toBe(-300);
  });

  it('居中：不同 visibleCenter 给不同 transform', () => {
    const t = computeCenterTransform({
      target: { x: 1000, y: 500 },
      targetK: 2,
      visibleCenter: { x: 456, y: 360 }, // offset 详情卡 + sidebar 后的中点
    });
    expect(t.x).toBe(456 - 1000 * 2);
    expect(t.y).toBe(360 - 500 * 2);
  });

  it('targetK < currentK 不缩小（取 max）', () => {
    const t = computeCenterTransform({
      target: { x: 100, y: 100 },
      targetK: 3,
      currentK: 5,
      visibleCenter: { x: 400, y: 300 },
    });
    expect(t.k).toBe(5);
  });

  it('currentK 不传 = targetK 直接用', () => {
    const t = computeCenterTransform({
      target: { x: 50, y: 50 },
      targetK: 2.5,
      visibleCenter: { x: 400, y: 300 },
    });
    expect(t.k).toBe(2.5);
  });
});

describe('center · pixelToViewBox (SVG-aware 坐标转换)', () => {
  function mockSvg(opts: {
    rectLeft: number;
    rectTop: number;
    rectWidth: number;
    rectHeight: number;
    vbWidth: number;
    vbHeight: number;
  }): SVGSVGElement {
    // 构造一个 mock SVGSVGElement / 仅实现需要的方法 + 属性
    const fakeSvg = {
      getBoundingClientRect: () => ({
        left: opts.rectLeft,
        top: opts.rectTop,
        right: opts.rectLeft + opts.rectWidth,
        bottom: opts.rectTop + opts.rectHeight,
        width: opts.rectWidth,
        height: opts.rectHeight,
        x: opts.rectLeft,
        y: opts.rectTop,
        toJSON: () => ({}),
      }),
      viewBox: {
        baseVal: {
          width: opts.vbWidth,
          height: opts.vbHeight,
        },
      },
    } as unknown as SVGSVGElement;
    return fakeSvg;
  }

  it('1:1 aspect / no letterbox：pixel = viewBox', () => {
    const svg = mockSvg({
      rectLeft: 0,
      rectTop: 0,
      rectWidth: 1000,
      rectHeight: 1000,
      vbWidth: 1000,
      vbHeight: 1000,
    });
    const vb = pixelToViewBox(svg, 500, 500);
    expect(vb.x).toBe(500);
    expect(vb.y).toBe(500);
  });

  it('SVG 元素小 + viewBox 大 / 等比缩放（s < 1）', () => {
    // viewBox 2000 wide / SVG 1000 wide → s = 0.5 / pixel→viewBox = pixel * 2
    const svg = mockSvg({
      rectLeft: 0,
      rectTop: 0,
      rectWidth: 1000,
      rectHeight: 1000,
      vbWidth: 2000,
      vbHeight: 2000,
    });
    const vb = pixelToViewBox(svg, 500, 500);
    // 500 pixel - 0 - 0 letterbox / 0.5 = 1000 viewBox
    expect(vb.x).toBe(1000);
    expect(vb.y).toBe(1000);
  });

  it('width 限制 + 上下 letterbox（viewBox aspect 比 SVG 元素更宽）', () => {
    // viewBox 2000 × 1000 (aspect 2) / SVG 1000 × 1000 (aspect 1) → width 限制
    // s = 1000/2000 = 0.5
    // letterboxY = (1000 - 1000*0.5) / 2 = 250
    // letterboxX = 0
    const svg = mockSvg({
      rectLeft: 0,
      rectTop: 0,
      rectWidth: 1000,
      rectHeight: 1000,
      vbWidth: 2000,
      vbHeight: 1000,
    });
    // pixel center (500, 500) 应该映射到 viewBox 中点 (1000, 500)
    const vb = pixelToViewBox(svg, 500, 500);
    // x = (500 - 0 - 0) / 0.5 = 1000 ✓
    // y = (500 - 0 - 250) / 0.5 = 500 ✓
    expect(vb.x).toBe(1000);
    expect(vb.y).toBe(500);
  });

  it('height 限制 + 左右 letterbox（viewBox aspect 比 SVG 元素更窄）', () => {
    // viewBox 1000 × 2000 (aspect 0.5) / SVG 1000 × 1000 (aspect 1) → height 限制
    // s = 1000/2000 = 0.5
    // letterboxX = (1000 - 1000*0.5) / 2 = 250
    const svg = mockSvg({
      rectLeft: 0,
      rectTop: 0,
      rectWidth: 1000,
      rectHeight: 1000,
      vbWidth: 1000,
      vbHeight: 2000,
    });
    const vb = pixelToViewBox(svg, 500, 500);
    // x = (500 - 0 - 250) / 0.5 = 500 ✓
    // y = (500 - 0 - 0) / 0.5 = 1000 ✓
    expect(vb.x).toBe(500);
    expect(vb.y).toBe(1000);
  });

  it('SVG 元素带 left/top offset（#app padding 模拟）', () => {
    // Marx 项目 #app padding-left: 48 / padding-top: 70
    const svg = mockSvg({
      rectLeft: 48,
      rectTop: 70,
      rectWidth: 1232,
      rectHeight: 570,
      vbWidth: 1232,
      vbHeight: 570,
    });
    // pixel (100, 100) 即 window 100 / SVG element 内部 (52, 30) / viewBox (52, 30)
    const vb = pixelToViewBox(svg, 100, 100);
    expect(vb.x).toBe(52);
    expect(vb.y).toBe(30);
  });

  it('viewBox 空 / 兜底为 1:1 不抛错', () => {
    const svg = mockSvg({
      rectLeft: 0,
      rectTop: 0,
      rectWidth: 1000,
      rectHeight: 1000,
      vbWidth: 0,
      vbHeight: 0,
    });
    const vb = pixelToViewBox(svg, 500, 500);
    expect(vb.x).toBe(500);
    expect(vb.y).toBe(500);
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
