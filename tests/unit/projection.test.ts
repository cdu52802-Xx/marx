import { describe, it, expect } from 'vitest';
import {
  createProjection,
  interpolateProjection,
  scaleAtZoom,
  satelliteDistanceAtZoom,
  SAT_DISTANCE_AT_K_TRANSITION_START,
  SAT_DISTANCE_AT_K_TRANSITION_END,
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

  it('mode=plane → 真 geoMercator · center 投到 viewport 中心（T1.6+++ 修复"球更鼓"）', () => {
    const proj = createProjection('plane', {
      width: 600,
      height: 400,
      center: [10, 50],
      scale: 800,
    });
    const centerPixel = proj([10, 50]);
    expect(centerPixel).toBeTruthy();
    if (centerPixel) {
      // mercator center → viewport 中心 [300, 200]
      expect(Math.abs(centerPixel[0] - 300)).toBeLessThan(5);
      expect(Math.abs(centerPixel[1] - 200)).toBeLessThan(5);
    }
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

describe('satelliteDistanceAtZoom · M-B2 T1.6+++（transition zone 内插 · plane 走 mercator）', () => {
  it('k=2.5 (sphere 边界) → distance 10（近 orthographic）', () => {
    expect(satelliteDistanceAtZoom(2.5)).toBeCloseTo(SAT_DISTANCE_AT_K_TRANSITION_START, 5);
  });

  it('k=4.5 (plane 边界) → distance 2（近 mercator-like）', () => {
    expect(satelliteDistanceAtZoom(4.5)).toBeCloseTo(SAT_DISTANCE_AT_K_TRANSITION_END, 5);
  });

  it('k=3.5 (transition 中点) → distance 6（线性中点）', () => {
    // (3.5 - 2.5) / (4.5 - 2.5) = 0.5 → 10 - (10 - 2) * 0.5 = 6
    expect(satelliteDistanceAtZoom(3.5)).toBeCloseTo(6, 5);
  });

  it('k < 2.5 → clamp 到 10', () => {
    expect(satelliteDistanceAtZoom(1)).toBe(10);
  });

  it('k > 4.5 → clamp 到 2（不真用 · plane mode 走 mercator）', () => {
    expect(satelliteDistanceAtZoom(8)).toBeCloseTo(2, 5);
  });
});

describe('三段式 projection · M-B2 T1.6+++（plane 回 mercator）', () => {
  const baseOpts = { width: 600, height: 400, center: [10, 50] as [number, number], scale: 200 };

  it('k=3 → transition mode · paris pixel 非 null', () => {
    const { mode, projection } = interpolateProjection(3, baseOpts);
    expect(mode).toBe('transition');
    expect(projection([2.35, 48.86])).toBeTruthy();
  });

  it('k=5 → plane mode（≥ planeMin=4.5）· paris pixel 非 null', () => {
    const { mode, projection } = interpolateProjection(5, baseOpts);
    expect(mode).toBe('plane');
    expect(projection([2.35, 48.86])).toBeTruthy();
  });

  it('k=2.5 → sphere mode（边界 inclusive 球面侧）', () => {
    const { mode } = interpolateProjection(2.5, baseOpts);
    expect(mode).toBe('sphere');
  });

  it('k=2.5 (sphere) → k=2.51 (transition) pixel 连续 · 巴黎 Δ < 1 px', () => {
    const a = interpolateProjection(2.5, baseOpts).projection([2.35, 48.86]);
    const b = interpolateProjection(2.51, baseOpts).projection([2.35, 48.86]);
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    if (a && b) {
      expect(Math.abs(a[0] - b[0])).toBeLessThan(1);
      expect(Math.abs(a[1] - b[1])).toBeLessThan(1);
    }
  });

  it('k=4.5 (transition→plane 边界) 有 jump · 跨投影切换（satellite→mercator）· PM 接受', () => {
    // T1.6+++ · plane 回 geoMercator · 跨 k=4.5 satellite→mercator 数学不连续
    // PM 接受半丝滑（plane 视觉正确优先 · 反正 mercator 真平面是 ground truth）
    // 测试目标：两端 pixel 都非 null（projection 本身工作）/ 不强行验连续
    const parisA = interpolateProjection(4.49, baseOpts).projection([2.35, 48.86]);
    const parisB = interpolateProjection(4.51, baseOpts).projection([2.35, 48.86]);
    expect(parisA).toBeTruthy();
    expect(parisB).toBeTruthy();
  });

  it('k=8 plane mode · 真 geoMercator（center 巴黎在中心附近）', () => {
    // mercator 中心 = baseOpts.center [10, 50]
    // 巴黎 [2.35, 48.86] 跟 center 偏差 ~7° lon / ~1° lat / pixel 应近 viewport 中心
    const { mode, projection } = interpolateProjection(8, baseOpts);
    expect(mode).toBe('plane');
    const center = projection([10, 50]);
    expect(center).toBeTruthy();
    if (center) {
      // center [10, 50] 应该投到 viewport 中心 [300, 200]
      expect(Math.abs(center[0] - 300)).toBeLessThan(5);
      expect(Math.abs(center[1] - 200)).toBeLessThan(5);
    }
  });

  it('k=2.5 sphere vs k=2.51 transition · 巴黎 / 奥斯陆 / 莫斯科 都 < 1 px（边界数学连续）', () => {
    const points: [number, number][] = [
      [2.35, 48.86], // 巴黎
      [10.75, 59.91], // 奥斯陆
      [37.62, 55.75], // 莫斯科
    ];
    for (const p of points) {
      const a = interpolateProjection(2.5, baseOpts).projection(p);
      const b = interpolateProjection(2.51, baseOpts).projection(p);
      if (a && b) {
        expect(Math.abs(a[0] - b[0])).toBeLessThan(1);
        expect(Math.abs(a[1] - b[1])).toBeLessThan(1);
      }
    }
  });
});
