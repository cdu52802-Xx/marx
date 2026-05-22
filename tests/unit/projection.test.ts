import { describe, it, expect } from 'vitest';
import {
  createProjection,
  interpolateProjection,
  scaleAtZoom,
  ZOOM_THRESHOLDS,
} from '../../src/lib/projection.ts';

describe('createProjection · M-B2 T1.1', () => {
  it('mode=sphere → geoOrthographic（巴黎在 sphere 上有 pixel）', () => {
    const proj = createProjection('sphere', {
      width: 600,
      height: 400,
      center: [10, 50],
      scale: 200,
    });
    expect(proj([2.35, 48.86])).toBeTruthy();
  });

  it('mode=plane → geoMercator（巴黎在 plane 上有 pixel）', () => {
    const proj = createProjection('plane', {
      width: 600,
      height: 400,
      center: [10, 50],
      scale: 800,
    });
    expect(proj([2.35, 48.86])).toBeTruthy();
  });
});

describe('interpolateProjection · M-B2 T1.1', () => {
  it('k=1 → sphere mode', () => {
    const { mode } = interpolateProjection(1, {
      width: 600,
      height: 400,
      center: [10, 50],
      scale: 200,
    });
    expect(mode).toBe('sphere');
  });

  it('k=8 → plane mode', () => {
    const { mode } = interpolateProjection(8, {
      width: 600,
      height: 400,
      center: [10, 50],
      scale: 200,
    });
    expect(mode).toBe('plane');
  });

  it('k=3.5 → transition mode', () => {
    const { mode } = interpolateProjection(3.5, {
      width: 600,
      height: 400,
      center: [10, 50],
      scale: 200,
    });
    expect(mode).toBe('transition');
  });
});

describe('ZOOM_THRESHOLDS · M-B2 T1.1', () => {
  it('default sphereMax=2.5 / planeMin=4.5（Stage 1 placeholder）', () => {
    expect(ZOOM_THRESHOLDS.sphereMax).toBe(2.5);
    expect(ZOOM_THRESHOLDS.planeMin).toBe(4.5);
  });
});

describe('scaleAtZoom · M-B2 T1.6+ B（真线性内插）', () => {
  it('k=1 → scale 200（球面 base）', () => {
    expect(scaleAtZoom(1)).toBeCloseTo(200, 5);
  });

  it('k=8 → scale 800（平面 base）', () => {
    expect(scaleAtZoom(8)).toBeCloseTo(800, 5);
  });

  it('k=4.5 → scale ≈ 500（中点附近线性内插）', () => {
    // (4.5 - 1) / (8 - 1) = 0.5 → 200 + 600 * 0.5 = 500
    expect(scaleAtZoom(4.5)).toBeCloseTo(500, 5);
  });

  it('k=2.5 → scale ≈ 328.57（sphere→transition 阈值线性内插）', () => {
    // (2.5 - 1) / 7 = 0.2143 → 200 + 600 * 0.2143 ≈ 328.57
    expect(scaleAtZoom(2.5)).toBeCloseTo(328.57, 1);
  });

  it('k < 1 → clamp 到 200（防越界）', () => {
    expect(scaleAtZoom(0.5)).toBe(200);
  });

  it('k > 8 → clamp 到 800（防越界）', () => {
    expect(scaleAtZoom(10)).toBe(800);
  });
});
