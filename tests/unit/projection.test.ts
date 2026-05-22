import { describe, it, expect } from 'vitest';
import {
  createProjection,
  interpolateProjection,
  scaleAtZoom,
  satelliteDistanceAtZoom,
  SAT_DISTANCE_AT_K_MIN,
  SAT_DISTANCE_AT_K_MAX,
  ZOOM_THRESHOLDS,
  K_MAX,
  SCALE_AT_K_MAX,
  K_DISTANCE_PLATEAU,
  dotRadiusAtZoom,
  shouldShowBorderLabels,
  borderLabelFontSize,
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

describe('K_MAX / SCALE_AT_K_MAX const · M-B2 T2.1.hotfix2-A（PM 拍 · 学 Google Maps 极深 zoom）', () => {
  it('K_MAX = 32（从 16 扩到 32 · viewport k=32 显示约 5°×3.5° 比利时单国级别）', () => {
    expect(K_MAX).toBe(32);
  });

  it('SCALE_AT_K_MAX = 3200（从 1600 翻倍 · k=32 时 scale 3200）', () => {
    expect(SCALE_AT_K_MAX).toBe(3200);
  });

  it('K_DISTANCE_PLATEAU = 8 不变（distance 在 k>=8 plateau at 2 / 已稳定 / 不动）', () => {
    expect(K_DISTANCE_PLATEAU).toBe(8);
  });
});

describe('scaleAtZoom · M-B2 T2.1.hotfix2-A（K_MAX 16→32 · scale 1600→3200）', () => {
  it('k=1 → scale 200（球面 base · 起点）', () => {
    expect(scaleAtZoom(1)).toBeCloseTo(200, 5);
  });

  it('k=32 → scale 3200（细节 max · 新 K_MAX）', () => {
    expect(scaleAtZoom(32)).toBeCloseTo(3200, 5);
  });

  it('k=16 → scale ≈ 1651.6（旧 K_MAX 节点 · 新公式中段 linear lerp(200,3200,(16-1)/31)）', () => {
    // (16 - 1) / 31 = 0.4839 → 200 + 3000 * 0.4839 ≈ 1651.6
    expect(scaleAtZoom(16)).toBeCloseTo(1651.6, 1);
  });

  it('k=8 → scale ≈ 877.4（distance plateau 起点 · linear lerp(200,3200,(8-1)/31)）', () => {
    // (8 - 1) / 31 = 0.2258 → 200 + 3000 * 0.2258 ≈ 877.4
    expect(scaleAtZoom(8)).toBeCloseTo(877.4, 1);
  });

  it('k=4.5 → scale ≈ 538.7（中段线性内插）', () => {
    // (4.5 - 1) / 31 = 0.1129 → 200 + 3000 * 0.1129 ≈ 538.7
    expect(scaleAtZoom(4.5)).toBeCloseTo(538.7, 1);
  });

  it('k=2.5 → scale ≈ 345.2（sphere→transition 边界）', () => {
    // (2.5 - 1) / 31 = 0.0484 → 200 + 3000 * 0.0484 ≈ 345.2
    expect(scaleAtZoom(2.5)).toBeCloseTo(345.2, 1);
  });

  it('k < 1 → clamp 到 200（防越界）', () => {
    expect(scaleAtZoom(0.5)).toBe(200);
  });

  it('k > 32 → clamp 到 3200（防越界 · 新 K_MAX）', () => {
    expect(scaleAtZoom(40)).toBe(3200);
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

  it('T2.1.hotfix2-A · k=32 (新 K_MAX) → distance 2（plateau · K_DISTANCE_PLATEAU=8 在新 K_MAX 仍生效）', () => {
    expect(satelliteDistanceAtZoom(32)).toBe(2);
  });
});

describe('dotRadiusAtZoom · M-B2 T2.1.hotfix2-B（反比 zoom · 治本 PM "圆点比国家大" 痛点）', () => {
  it('k=1 → r=5（plateau · clamp k<2 / 球面 mode 节点醒目）', () => {
    expect(dotRadiusAtZoom(1, 5)).toBe(5);
  });

  it('k=2 → r=5（基准 · plateau 起点 · 5/sqrt(2/2)=5）', () => {
    expect(dotRadiusAtZoom(2, 5)).toBe(5);
  });

  it('k=4 → r ≈ 3.54（中段缩小 · 5/sqrt(4/2)=5/sqrt(2)）', () => {
    expect(dotRadiusAtZoom(4, 5)).toBeCloseTo(3.5355, 3);
  });

  it('k=8 → r=2.5（plane mode · 5/sqrt(8/2)=5/2）', () => {
    expect(dotRadiusAtZoom(8, 5)).toBe(2.5);
  });

  it('k=16 → r ≈ 1.77（中深 zoom · 5/sqrt(16/2)=5/sqrt(8)）', () => {
    expect(dotRadiusAtZoom(16, 5)).toBeCloseTo(1.7678, 3);
  });

  it('k=32 → r=1.25（极深 · 5/sqrt(32/2)=5/4）', () => {
    expect(dotRadiusAtZoom(32, 5)).toBe(1.25);
  });

  it('baseR=4 (event 节点) k=8 → r=2（公式与 baseR 线性）', () => {
    expect(dotRadiusAtZoom(8, 4)).toBe(2);
  });

  it('baseR=3 (location 节点) k=8 → r=1.5', () => {
    expect(dotRadiusAtZoom(8, 3)).toBe(1.5);
  });

  it('baseR=0.5 (border stroke-width) k=8 → 0.25（同公式 / stroke 反比 zoom）', () => {
    expect(dotRadiusAtZoom(8, 0.5)).toBe(0.25);
  });
});

describe('shouldShowBorderLabels · M-B2 T2.1.hotfix2-C（国名标签 zoom threshold=4）', () => {
  it('k=1 (sphere) → false（球面阶段不显标签）', () => {
    expect(shouldShowBorderLabels(1)).toBe(false);
  });

  it('k=3.99 → false（threshold 边界下侧）', () => {
    expect(shouldShowBorderLabels(3.99)).toBe(false);
  });

  it('k=4 → true（threshold 起点 inclusive）', () => {
    expect(shouldShowBorderLabels(4)).toBe(true);
  });

  it('k=8 → true（plane mode 信息密度真增）', () => {
    expect(shouldShowBorderLabels(8)).toBe(true);
  });

  it('k=32 → true（极深 zoom 仍显）', () => {
    expect(shouldShowBorderLabels(32)).toBe(true);
  });
});

describe('borderLabelFontSize · M-B2 T2.1.hotfix2-C（字体跟 zoom 走 · 8→12 lerp）', () => {
  it('k<4 → 0（caller 应先 check shouldShowBorderLabels · 防误用）', () => {
    expect(borderLabelFontSize(1)).toBe(0);
    expect(borderLabelFontSize(3.99)).toBe(0);
  });

  it('k=4 → 8（threshold 起点 · 不喧宾夺主）', () => {
    expect(borderLabelFontSize(4)).toBe(8);
  });

  it('k=6 → 10（中段 lerp · 8 + 4*0.5）', () => {
    expect(borderLabelFontSize(6)).toBe(10);
  });

  it('k=8 → 12（plane mode 信息密度 max）', () => {
    expect(borderLabelFontSize(8)).toBe(12);
  });

  it('k=16 → 12（clamp · 字体不再涨防视觉过载）', () => {
    expect(borderLabelFontSize(16)).toBe(12);
  });

  it('k=32 → 12（clamp · 极深 zoom 字体仍 12px）', () => {
    expect(borderLabelFontSize(32)).toBe(12);
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
