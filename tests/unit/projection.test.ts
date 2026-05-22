import { describe, it, expect } from 'vitest';
import {
  createProjection,
  interpolateProjection,
  scaleAtZoom,
  satelliteDistanceAtZoom,
  SAT_DISTANCE_AT_K_MIN,
  SAT_DISTANCE_AT_K_MAX,
  ZOOM_THRESHOLDS,
} from '../../src/lib/projection.ts';

describe('createProjection · M-B2 T1.1', () => {
  it('mode=sphere → satellite distance=50 ≈ orthographic（巴黎在 sphere 上有 pixel）', () => {
    const proj = createProjection('sphere', {
      width: 600,
      height: 400,
      center: [10, 50],
      scale: 200,
    });
    expect(proj([2.35, 48.86])).toBeTruthy();
  });

  it('mode=plane → satellite distance=1.5 ≈ 近平面（巴黎在 plane 上有 pixel）', () => {
    const proj = createProjection('plane', {
      width: 600,
      height: 400,
      center: [10, 50],
      scale: 800,
    });
    expect(proj([2.35, 48.86])).toBeTruthy();
  });

  it('mode=plane (T1.6++++++) · satellite distance=1.5 · center 投到 viewport 中心附近', () => {
    const proj = createProjection('plane', {
      width: 600,
      height: 400,
      center: [10, 50],
      scale: 800,
    });
    const centerPixel = proj([10, 50]);
    expect(centerPixel).toBeTruthy();
    if (centerPixel) {
      // satellite center → viewport 中心 [300, 200]（绕中心很小 sub-pixel 误差）
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
  it('default sphereMax=2.5 / planeMin=4.5（仍保留于 component 层 dispatch · projection 全程 satellite）', () => {
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

describe('satelliteDistanceAtZoom · M-B2 T1.6++++++（全程线性内插 50→1.5 · PM 实测 plane 端调更近）', () => {
  it('k=1 (sphere 视觉起点) → distance 50（≈ orthographic / clipAngle ≈ 88.85°）', () => {
    expect(satelliteDistanceAtZoom(1)).toBeCloseTo(SAT_DISTANCE_AT_K_MIN, 5);
    expect(SAT_DISTANCE_AT_K_MIN).toBe(50);
  });

  it('k=8 (plane 视觉终点) → distance 1.5（更近视角 · 球面感弱 · clipAngle ≈ 48°）', () => {
    expect(satelliteDistanceAtZoom(8)).toBeCloseTo(SAT_DISTANCE_AT_K_MAX, 5);
    expect(SAT_DISTANCE_AT_K_MAX).toBe(1.5);
  });

  it('k=4.5 (中间值) → distance ≈ 25.75（线性 lerp(50, 1.5, (4.5-1)/7)）', () => {
    // (4.5 - 1) / 7 = 0.5 → 50 - 48.5 * 0.5 = 25.75
    expect(satelliteDistanceAtZoom(4.5)).toBeCloseTo(25.75, 5);
  });

  it('k=2.5 → distance ≈ 39.61（sphere/transition 边界）', () => {
    // (2.5 - 1) / 7 = 0.2143 → 50 - 48.5 * 0.2143 ≈ 39.61
    expect(satelliteDistanceAtZoom(2.5)).toBeCloseTo(39.61, 1);
  });

  it('k < 1 → clamp 到 50', () => {
    expect(satelliteDistanceAtZoom(0.5)).toBe(50);
  });

  it('k > 8 → clamp 到 1.5', () => {
    expect(satelliteDistanceAtZoom(10)).toBe(1.5);
  });
});

describe('全程 satellite projection · M-B2 T1.6+++++（Issue 1 修法 B · 真丝滑）', () => {
  const baseOpts = { width: 600, height: 400, center: [10, 50] as [number, number], scale: 200 };

  it('k=1 sphere mode · 巴黎 pixel 非 null（distance=50 ≈ orthographic）', () => {
    const { mode, projection } = interpolateProjection(1, baseOpts);
    expect(mode).toBe('sphere');
    expect(projection([2.35, 48.86])).toBeTruthy();
  });

  it('k=8 plane mode · 巴黎 pixel 非 null（distance=1.5 · 近平面视角）', () => {
    const { mode, projection } = interpolateProjection(8, baseOpts);
    expect(mode).toBe('plane');
    expect(projection([2.35, 48.86])).toBeTruthy();
  });

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

  it('k=2.5 → sphere mode（边界 inclusive 球面侧 · 仅 mode label 给 component 用）', () => {
    const { mode } = interpolateProjection(2.5, baseOpts);
    expect(mode).toBe('sphere');
  });

  it('k=2.5 → k=2.51 · 巴黎 Δ < 1 px（同 projection 内插 · 真连续）', () => {
    const a = interpolateProjection(2.5, baseOpts).projection([2.35, 48.86]);
    const b = interpolateProjection(2.51, baseOpts).projection([2.35, 48.86]);
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    if (a && b) {
      expect(Math.abs(a[0] - b[0])).toBeLessThan(1);
      expect(Math.abs(a[1] - b[1])).toBeLessThan(1);
    }
  });

  it('k=4.5 (transition→plane 边界) · 巴黎 Δ < 1 px（同一 satellite · 不再有 jump · Issue 1 修法 B 核心验证）', () => {
    // T1.6+++++ · 全程同一 geoSatellite projection · distance 线性内插
    // 跨 k=4.5 不再 satellite→mercator 切换 · 完全平滑 · 真丝滑
    const parisA = interpolateProjection(4.49, baseOpts).projection([2.35, 48.86]);
    const parisB = interpolateProjection(4.51, baseOpts).projection([2.35, 48.86]);
    expect(parisA).toBeTruthy();
    expect(parisB).toBeTruthy();
    if (parisA && parisB) {
      expect(Math.abs(parisA[0] - parisB[0])).toBeLessThan(1);
      expect(Math.abs(parisA[1] - parisB[1])).toBeLessThan(1);
    }
  });

  it('k=4.5 (问题 PM 报告的 11 下临界附近) · 跨界三点 Δ < 1.5 px（巴黎/奥斯陆/莫斯科 同 projection 全连续）', () => {
    // T1.6+++++ · PM 实测 "第 11 下从球形一下子变到平面" 根因 fix
    // 同一 geoSatellite · distance lerp · 任意两个相邻 k 都连续
    const points: [number, number][] = [
      [2.35, 48.86], // 巴黎
      [10.75, 59.91], // 奥斯陆
      [37.62, 55.75], // 莫斯科
    ];
    for (const p of points) {
      const a = interpolateProjection(4.49, baseOpts).projection(p);
      const b = interpolateProjection(4.51, baseOpts).projection(p);
      if (a && b) {
        expect(Math.abs(a[0] - b[0])).toBeLessThan(1.5);
        expect(Math.abs(a[1] - b[1])).toBeLessThan(1.5);
      }
    }
  });

  it('k=8 plane mode · satellite center 投到 viewport 中心附近', () => {
    // T1.6+++++ · 全程 satellite · plane 端 center 跟随 rotate([-lon, -lat]) 推到 viewport center
    const { mode, projection } = interpolateProjection(8, baseOpts);
    expect(mode).toBe('plane');
    const center = projection([10, 50]);
    expect(center).toBeTruthy();
    if (center) {
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
