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

  it('mode=plane → satellite distance=2 ≈ mercator-like（巴黎在 plane 上有 pixel）', () => {
    const proj = createProjection('plane', {
      width: 600,
      height: 400,
      center: [10, 50],
      scale: 800,
    });
    expect(proj([2.35, 48.86])).toBeTruthy();
  });

  it('mode=plane (T1.6+++++) · satellite distance=2 · center 投到 viewport 中心附近', () => {
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

describe('scaleAtZoom · M-B2 T2.1.hotfix（K_MAX 8→16 · Issue 3 PM 看清欧洲国家）', () => {
  it('k=1 → scale 200（球面 base · 起点）', () => {
    expect(scaleAtZoom(1)).toBeCloseTo(200, 5);
  });

  it('k=16 → scale 1600（细节 max · 新 K_MAX）', () => {
    expect(scaleAtZoom(16)).toBeCloseTo(1600, 5);
  });

  it('k=8 → scale ≈ 853.33（distance plateau 起点 · linear lerp(200,1600,(8-1)/15)）', () => {
    // (8 - 1) / 15 = 0.4667 → 200 + 1400 * 0.4667 ≈ 853.33
    expect(scaleAtZoom(8)).toBeCloseTo(853.33, 1);
  });

  it('k=4.5 → scale ≈ 526.67（中段线性内插）', () => {
    // (4.5 - 1) / 15 = 0.2333 → 200 + 1400 * 0.2333 ≈ 526.67
    expect(scaleAtZoom(4.5)).toBeCloseTo(526.67, 1);
  });

  it('k=2.5 → scale = 340（sphere→transition 边界）', () => {
    // (2.5 - 1) / 15 = 0.1 → 200 + 1400 * 0.1 = 340
    expect(scaleAtZoom(2.5)).toBeCloseTo(340, 1);
  });

  it('k < 1 → clamp 到 200（防越界）', () => {
    expect(scaleAtZoom(0.5)).toBe(200);
  });

  it('k > 16 → clamp 到 1600（防越界）', () => {
    expect(scaleAtZoom(20)).toBe(1600);
  });
});

describe('satelliteDistanceAtZoom · M-B2 T1.6+++++（全程线性内插 50→2 · Issue 1 拍板）', () => {
  it('k=1 (sphere 视觉起点) → distance 50（≈ orthographic / clipAngle ≈ 88.85°）', () => {
    expect(satelliteDistanceAtZoom(1)).toBeCloseTo(SAT_DISTANCE_AT_K_MIN, 5);
    expect(SAT_DISTANCE_AT_K_MIN).toBe(50);
  });

  it('k=8 (plane 视觉终点) → distance 2（≈ mercator-like / clipAngle = 60°）', () => {
    expect(satelliteDistanceAtZoom(8)).toBeCloseTo(SAT_DISTANCE_AT_K_MAX, 5);
    expect(SAT_DISTANCE_AT_K_MAX).toBe(2);
  });

  it('k=4.5 (中间值) → distance ≈ 26（线性 lerp(50,2,(4.5-1)/7)）', () => {
    // (4.5 - 1) / 7 = 0.5 → 50 - 48 * 0.5 = 26
    expect(satelliteDistanceAtZoom(4.5)).toBeCloseTo(26, 5);
  });

  it('k=2.5 → distance ≈ 39.71（sphere/transition 边界）', () => {
    // (2.5 - 1) / 7 = 0.2143 → 50 - 48 * 0.2143 ≈ 39.71
    expect(satelliteDistanceAtZoom(2.5)).toBeCloseTo(39.71, 1);
  });

  it('k < 1 → clamp 到 50', () => {
    expect(satelliteDistanceAtZoom(0.5)).toBe(50);
  });

  it('k > 8 → clamp 到 2', () => {
    expect(satelliteDistanceAtZoom(10)).toBe(2);
  });
});

describe('全程 satellite projection · M-B2 T1.6+++++（Issue 1 修法 B · 真丝滑）', () => {
  const baseOpts = { width: 600, height: 400, center: [10, 50] as [number, number], scale: 200 };

  it('k=1 sphere mode · 巴黎 pixel 非 null（distance=50 ≈ orthographic）', () => {
    const { mode, projection } = interpolateProjection(1, baseOpts);
    expect(mode).toBe('sphere');
    expect(projection([2.35, 48.86])).toBeTruthy();
  });

  it('k=8 plane mode · 巴黎 pixel 非 null（distance=2 ≈ mercator-like）', () => {
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
