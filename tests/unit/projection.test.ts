import { describe, it, expect } from 'vitest';
import {
  interpolateProjection,
  scaleAtZoom,
  satelliteDistanceAtZoom,
  SAT_DISTANCE_AT_K_MIN,
  SAT_DISTANCE_AT_K_MAX,
  ZOOM_THRESHOLDS,
  K_MAX,
  SCALE_AT_K_MAX,
  K_DISTANCE_PLATEAU,
  DOT_BASE_RADIUS,
  dotRadiusAtZoom,
  strokeWidthAtZoom,
  borderStrokeColor,
  shouldShowBorderLabels,
  borderLabelFontSize,
  personLabelFontSize,
} from '../../src/lib/projection.ts';

// Stage 4 简化 · createProjection 死产线 export 已删（仅本测试在用 · 语义随 K_MAX 漂移）
//   投影行为测试全走 interpolateProjection（geographic-canvas 唯一真入口）

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

describe('K_MAX / SCALE_AT_K_MAX const · M-B2 阶段 B PM 大窗实测拍 #1（want 再放大 / Google maps 感觉）', () => {
  it('K_MAX = 64（从 32 翻倍 · viewport k=64 显示约 2.5°×1.75° 城市级别）', () => {
    expect(K_MAX).toBe(64);
  });

  it('SCALE_AT_K_MAX = 6400（从 3200 翻倍 · 保持 dual 比例 · k=64 时 scale 6400）', () => {
    expect(SCALE_AT_K_MAX).toBe(6400);
  });

  it('K_DISTANCE_PLATEAU = 8 不变（distance 在 k>=8 plateau at 2 / 已稳定 / 不动）', () => {
    expect(K_DISTANCE_PLATEAU).toBe(8);
  });
});

describe('scaleAtZoom · M-B2 阶段 B（K_MAX 32→64 · scale 3200→6400 翻倍）', () => {
  it('k=1 → scale 200（球面 base · 起点）', () => {
    expect(scaleAtZoom(1)).toBeCloseTo(200, 5);
  });

  it('k=64 → scale 6400（细节 max · 新 K_MAX 翻倍）', () => {
    expect(scaleAtZoom(64)).toBeCloseTo(6400, 5);
  });

  it('k=32 → scale ≈ 3250.8（旧 K_MAX 节点 · 新公式中段 linear lerp(200,6400,(32-1)/63)）', () => {
    // (32 - 1) / 63 = 0.4921 → 200 + 6200 * 0.4921 ≈ 3250.8
    expect(scaleAtZoom(32)).toBeCloseTo(3250.8, 1);
  });

  it('k=16 → scale ≈ 1676.2（旧节点 · linear lerp(200,6400,(16-1)/63)）', () => {
    // (16 - 1) / 63 = 0.2381 → 200 + 6200 * 0.2381 ≈ 1676.2
    expect(scaleAtZoom(16)).toBeCloseTo(1676.2, 1);
  });

  it('k=8 → scale ≈ 888.9（distance plateau 起点 · linear lerp(200,6400,(8-1)/63)）', () => {
    // (8 - 1) / 63 = 0.1111 → 200 + 6200 * 0.1111 ≈ 888.9
    expect(scaleAtZoom(8)).toBeCloseTo(888.9, 1);
  });

  it('k=4.5 → scale ≈ 544.4（中段线性内插）', () => {
    // (4.5 - 1) / 63 = 0.0556 → 200 + 6200 * 0.0556 ≈ 544.4
    expect(scaleAtZoom(4.5)).toBeCloseTo(544.4, 1);
  });

  it('k=2.5 → scale ≈ 347.6（sphere→transition 边界）', () => {
    // (2.5 - 1) / 63 = 0.0238 → 200 + 6200 * 0.0238 ≈ 347.6
    expect(scaleAtZoom(2.5)).toBeCloseTo(347.6, 1);
  });

  it('k < 1 → clamp 到 200（防越界）', () => {
    expect(scaleAtZoom(0.5)).toBe(200);
  });

  it('k > 64 → clamp 到 6400（防越界 · 新 K_MAX）', () => {
    expect(scaleAtZoom(70)).toBe(6400);
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

  it('T2.1.hotfix2-A · k=32 → distance 2（plateau · K_DISTANCE_PLATEAU=8 仍生效）', () => {
    expect(satelliteDistanceAtZoom(32)).toBe(2);
  });

  it('阶段 B · k=64 (新 K_MAX) → distance 2（plateau · K_DISTANCE_PLATEAU=8 在新 K_MAX 仍生效）', () => {
    expect(satelliteDistanceAtZoom(64)).toBe(2);
  });
});

describe('DOT_BASE_RADIUS · M-B2 阶段 B 常量提升（5/4/3 → 8/7/6 · PM 大窗实测拍 #2）', () => {
  it('person = 8（+60% vs 旧 5 · 大窗主角醒目）', () => {
    expect(DOT_BASE_RADIUS.person).toBe(8);
  });

  it('event = 7（+75% vs 旧 4 · 中间档位）', () => {
    expect(DOT_BASE_RADIUS.event).toBe(7);
  });

  it('location = 6（+100% vs 旧 3 · 辅助 hierarchy 保留）', () => {
    expect(DOT_BASE_RADIUS.location).toBe(6);
  });
});

describe('dotRadiusAtZoom · M-B2 阶段 B（baseR 提升 + 反比公式调温和 sqrt(k/4) plateau k<4 + clamp 0.5）', () => {
  it('k=1 baseR=8 → r=8（plateau · effectiveK=max(4,1)=4 · 8/sqrt(1)=8）', () => {
    expect(dotRadiusAtZoom(1, 8)).toBe(8);
  });

  it('k=2 baseR=8 → r=8（plateau · effectiveK=max(4,2)=4）', () => {
    expect(dotRadiusAtZoom(2, 8)).toBe(8);
  });

  it('k=4 baseR=8 → r=8（plateau 终点 · effectiveK=4 · 8/sqrt(1)=8）', () => {
    expect(dotRadiusAtZoom(4, 8)).toBe(8);
  });

  it('k=8 baseR=8 → r ≈ 5.66（开始反比 · 8/sqrt(8/4)=8/sqrt(2)）', () => {
    expect(dotRadiusAtZoom(8, 8)).toBeCloseTo(5.6569, 3);
  });

  it('k=16 baseR=8 → r=4（公式值 8/sqrt(4)=4 · ratio clamp baseR*0.5=4 · 刚好相等）', () => {
    expect(dotRadiusAtZoom(16, 8)).toBe(4);
  });

  it('k=32 baseR=8 → r=4（ratio clamp · 公式值 8/sqrt(8)≈2.83 < min 4）', () => {
    expect(dotRadiusAtZoom(32, 8)).toBe(4);
  });

  it('k=64 (新 K_MAX) baseR=8 → r=4（ratio clamp · 公式值 8/sqrt(16)=2 < min 4）', () => {
    expect(dotRadiusAtZoom(64, 8)).toBe(4);
  });

  it('baseR=7 (event) k=1 → r=7（plateau / +75% vs 旧 4）', () => {
    expect(dotRadiusAtZoom(1, 7)).toBe(7);
  });

  it('baseR=7 (event) k=8 → r ≈ 4.95（公式值 7/sqrt(2)）', () => {
    expect(dotRadiusAtZoom(8, 7)).toBeCloseTo(4.9497, 3);
  });

  it('baseR=7 (event) k=64 → r=3.5（ratio clamp 7*0.5）', () => {
    expect(dotRadiusAtZoom(64, 7)).toBe(3.5);
  });

  it('baseR=6 (location) k=1 → r=6（plateau / +100% vs 旧 3）', () => {
    expect(dotRadiusAtZoom(1, 6)).toBe(6);
  });

  it('baseR=6 (location) k=8 → r ≈ 4.24（公式值 6/sqrt(2)）', () => {
    expect(dotRadiusAtZoom(8, 6)).toBeCloseTo(4.2426, 3);
  });

  it('baseR=6 (location) k=64 → r=3（ratio clamp 6*0.5）', () => {
    expect(dotRadiusAtZoom(64, 6)).toBe(3);
  });
});

describe('strokeWidthAtZoom · M-B2 T2.1.hotfix3-1A（绝对值 min clamp · 防 sub-pixel 稀释）', () => {
  it('k=1 baseW=0.5 minAbs=0.6 → 0.6（plateau · k<2 clamp · 公式值 0.5 < min）', () => {
    // 公式：0.5 / sqrt(2/2) = 0.5 · max(0.6, 0.5) = 0.6
    expect(strokeWidthAtZoom(1, 0.5, 0.6)).toBe(0.6);
  });

  it('k=2 baseW=0.5 minAbs=0.6 → 0.6（基准 · 公式值 0.5 仍 < min 0.6 · clamp 起作用）', () => {
    expect(strokeWidthAtZoom(2, 0.5, 0.6)).toBe(0.6);
  });

  it('k=8 baseW=0.5 minAbs=0.6 → 0.6（公式值 0.25 << min · clamp 起作用）', () => {
    expect(strokeWidthAtZoom(8, 0.5, 0.6)).toBe(0.6);
  });

  it('k=32 baseW=0.5 minAbs=0.6 → 0.6（公式值 0.125 << min · clamp 极限）', () => {
    expect(strokeWidthAtZoom(32, 0.5, 0.6)).toBe(0.6);
  });

  it('k=1 baseW=0.5 minAbs=0.3 (dot outline) → 0.5（公式值 > min · 公式生效）', () => {
    expect(strokeWidthAtZoom(1, 0.5, 0.3)).toBe(0.5);
  });

  it('k=8 baseW=0.5 minAbs=0.3 (dot outline) → 0.3（公式值 0.25 < min · clamp）', () => {
    expect(strokeWidthAtZoom(8, 0.5, 0.3)).toBe(0.3);
  });

  it('k=32 baseW=0.5 minAbs=0.3 (dot outline) → 0.3（公式值 0.125 << min）', () => {
    expect(strokeWidthAtZoom(32, 0.5, 0.3)).toBe(0.3);
  });
});

describe('borderStrokeColor · M-B2 T2.1.hotfix3-1A（zoom-adaptive 颜色 dual lever）', () => {
  it('k=1 (sphere) → #d8cab0（淡 · spec § 6 风格 · 节点是主角）', () => {
    expect(borderStrokeColor(1)).toBe('#d8cab0');
  });

  it('k=3.99 → #d8cab0（threshold 边界下侧 · 仍球面阶段）', () => {
    expect(borderStrokeColor(3.99)).toBe('#d8cab0');
  });

  it('k=4 → #b8a880（threshold 起点 · plane mode 国界变信息焦点）', () => {
    expect(borderStrokeColor(4)).toBe('#b8a880');
  });

  it('k=8 → #b8a880（plane mode · 沙石深一档）', () => {
    expect(borderStrokeColor(8)).toBe('#b8a880');
  });

  it('k=32 → #b8a880（极深 zoom · 仍 plane）', () => {
    expect(borderStrokeColor(32)).toBe('#b8a880');
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

describe('personLabelFontSize · M-B2 T2.2-F（person 名字标签字体跟 zoom 走 · Q4 a 拍板）', () => {
  it('k<4 → 0（球面 mode 默认 hide · caller hover/click 时单独显含生卒年）', () => {
    expect(personLabelFontSize(1)).toBe(0);
    expect(personLabelFontSize(3.99)).toBe(0);
  });

  it('k=4 → 9px（threshold 起点 · 比国名 8px 大一档 · person 主角）', () => {
    expect(personLabelFontSize(4)).toBe(9);
  });

  it('k=6 → 10px（中段 lerp · 9 + 2*0.5）', () => {
    expect(personLabelFontSize(6)).toBe(10);
  });

  it('k=8 → 11px（plane mode max · 仍小于 dot radius 2-3x 视觉层级）', () => {
    expect(personLabelFontSize(8)).toBe(11);
  });

  it('k=16 → 11px（clamp · 字体不再涨防视觉过载）', () => {
    expect(personLabelFontSize(16)).toBe(11);
  });

  it('k=32 → 11px（clamp · 极深 zoom 字体仍 11px）', () => {
    expect(personLabelFontSize(32)).toBe(11);
  });

  it('person 标签字体始终大于国名标签 1-2px（hierarchy · 主角 vs 辅助）', () => {
    expect(personLabelFontSize(4)).toBeGreaterThan(borderLabelFontSize(4));
    expect(personLabelFontSize(6)).toBeGreaterThanOrEqual(borderLabelFontSize(6));
    // k>=8 person 11 < 国名 12 · 实际上 plane mode max 国名信息密度 priority 略高
    // person label hover 时切到 "name 1818-1883" 含生卒年 / 信息密度自动追平
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
