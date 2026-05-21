import { describe, it, expect } from 'vitest';
import { geoOrthographic, geoMercator } from 'd3-geo';
import { greatCircleArc } from '../../src/lib/great-circle.ts';

describe('greatCircleArc', () => {
  it('球面上巴黎→伦敦 path 非 null', () => {
    const proj = geoOrthographic().scale(200).translate([300, 200]);
    const paris: [number, number] = [2.35, 48.86];
    const london: [number, number] = [-0.13, 51.51];
    const path = greatCircleArc(paris, london, proj);
    expect(path).toMatch(/^M[\d.]+,[\d.]+/); // SVG path 以 M 开始
    expect(path.length).toBeGreaterThan(50); // 不止 1 个点
  });

  it('平面上巴黎→伦敦 path 也非 null', () => {
    const proj = geoMercator().scale(800).translate([300, 200]);
    const path = greatCircleArc([2.35, 48.86], [-0.13, 51.51], proj);
    expect(path).toMatch(/^M/);
  });

  it('default samples = 50', () => {
    const proj = geoOrthographic().scale(200).translate([300, 200]);
    const path = greatCircleArc([2.35, 48.86], [-0.13, 51.51], proj);
    // 50 sample points → 50 个 L 段（M 起点 + 49 L 段近似）
    const lCount = (path.match(/L/g) ?? []).length;
    expect(lCount).toBeGreaterThan(40);
  });
});
