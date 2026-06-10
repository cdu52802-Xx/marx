// M-B2 Stage 4.2 + 4.3 · geographic-canvas 国界平滑过渡 + 迁徙轨迹
//
// T4.2 国界过渡（DR-T4.2）·
//   - 分层 g（borders-layer / migration-layer / nodes-layer 等）· keyed data join 替代全量 remove+rebuild
//   - enter/exit fade 350ms（1871 普鲁士诸邦淡出 + 德意志帝国淡入）· update d 即时
//   - borderTransitionMs option（0 = 关过渡 · 副窗低密度版 + 测试用）
//   - 年份 clamp 到数据范围（cshapes 1806-2022 · timeline 2030 不再国界全空）
// T4.3 迁徙轨迹 ·
//   - path.migration 5 段 · 已走紫实线 / 未来紫虚线 · currentYear 跟 marx:time-change 走
//
// loadBorders 用 vi.mock 注入合成 3-feature 数据（jsdom 无真 fetch 资产）

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountGeographicCanvas } from '../../src/components/geographic-canvas.ts';
import { BORDER_TRANSITION_MS } from '../../src/components/geographic-canvas.ts';

const SYNTHETIC = vi.hoisted(() => {
  function square(lon: number, lat: number): GeoJSON.Polygon {
    return {
      type: 'Polygon',
      coordinates: [
        [
          [lon - 2, lat - 2],
          [lon + 2, lat - 2],
          [lon + 2, lat + 2],
          [lon - 2, lat + 2],
          [lon - 2, lat - 2],
        ],
      ],
    };
  }
  const fc: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      // StateA 1840-1871（1871 淡出 · 模拟普鲁士诸邦）
      {
        type: 'Feature',
        properties: { Name: 'StateA', From: 1840, To: 1871 },
        geometry: square(8, 50),
      },
      // StateB 1871-1990（1871 淡入 · 模拟德意志帝国）
      {
        type: 'Feature',
        properties: { Name: 'StateB', From: 1871, To: 1990 },
        geometry: square(8, 50),
      },
      // StateC 1840-1990（跨界持续存在 · update 路径）
      {
        type: 'Feature',
        properties: { Name: 'StateC', From: 1840, To: 1990 },
        geometry: square(2, 48),
      },
    ],
  };
  return fc;
});

vi.mock('../../src/lib/historical-borders.ts', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../../src/lib/historical-borders.ts')>();
  return {
    ...orig,
    loadBorders: vi.fn(async () => SYNTHETIC),
  };
});

function borderNames(container: SVGSVGElement): string[] {
  return Array.from(container.querySelectorAll('path.border'))
    .map((p) => p.getAttribute('data-name') ?? '')
    .sort();
}

describe('geographic-canvas Stage 4.2 · 国界动态过渡', () => {
  let container: SVGSVGElement;

  beforeEach(() => {
    container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.setAttribute('width', '600');
    container.setAttribute('height', '400');
    document.body.appendChild(container);
  });

  it('BORDER_TRANSITION_MS 默认 350（DR-T4.2 · 250-450 中值）', () => {
    expect(BORDER_TRANSITION_MS).toBe(350);
  });

  it('分层结构 · borders/graticule/border-labels/migration/relations/nodes/person-labels layer 按 z-order 存在', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    const g = container.querySelector('g.geographic-root') as SVGGElement;
    const layerClasses = Array.from(g.children).map((c) => c.getAttribute('class'));
    expect(layerClasses).toEqual([
      'borders-layer',
      'graticule-layer',
      'border-labels-layer',
      'migration-layer',
      'relations-layer',
      'nodes-layer',
      'person-labels-layer',
    ]);
  });

  it('mount 后（year 1843）→ StateA + StateC 渲染（borderTransitionMs 0 同步）', async () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
      borderTransitionMs: 0,
    });
    await vi.waitFor(() => {
      expect(borderNames(container)).toEqual(['StateA', 'StateC']);
    });
  });

  it('dispatch 1875 → StateA 退场 / StateB 进场（borderTransitionMs 0 同步）', async () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
      borderTransitionMs: 0,
    });
    await vi.waitFor(() => {
      expect(borderNames(container)).toEqual(['StateA', 'StateC']);
    });
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1875 } }));
    expect(borderNames(container)).toEqual(['StateB', 'StateC']);
  });

  it('默认 350ms 过渡 · dispatch 1875 后 StateA 仍短暂在场（fade out）· 过渡结束后移除', async () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    await vi.waitFor(() => {
      expect(borderNames(container)).toEqual(['StateA', 'StateC']);
    });
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1875 } }));
    // fade out 期间 StateA 还在 DOM（3 个 path 共存）
    expect(borderNames(container)).toEqual(['StateA', 'StateB', 'StateC']);
    // 过渡结束后 StateA 移除
    await vi.waitFor(
      () => {
        expect(borderNames(container)).toEqual(['StateB', 'StateC']);
      },
      { timeout: 2000 },
    );
  });

  it('年份超出数据范围 · dispatch 2030 → clamp 到数据 max（StateB + StateC 仍显示 · 不空白）', async () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
      borderTransitionMs: 0,
    });
    await vi.waitFor(() => {
      expect(borderNames(container)).toEqual(['StateA', 'StateC']);
    });
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 2030 } }));
    expect(borderNames(container)).toEqual(['StateB', 'StateC']);
  });
});

describe('geographic-canvas Stage 4.3 · 迁徙轨迹', () => {
  let container: SVGSVGElement;

  beforeEach(() => {
    container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.setAttribute('width', '600');
    container.setAttribute('height', '400');
    document.body.appendChild(container);
  });

  it('mount 后 migration-layer 内 6 段 path.migration', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    const paths = container.querySelectorAll('g.migration-layer path.migration');
    expect(paths.length).toBe(6);
  });

  it('初始 year 1843 → 3 段已走实线 + 3 段未来虚线（紫 #5b3a8c · pointer-events none）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    const paths = Array.from(
      container.querySelectorAll<SVGPathElement>('g.migration-layer path.migration'),
    );
    const solid = paths.filter((p) => p.getAttribute('stroke-dasharray') === null);
    const dashed = paths.filter((p) => p.getAttribute('stroke-dasharray') !== null);
    expect(solid.length).toBe(3);
    expect(dashed.length).toBe(3);
    for (const p of paths) {
      expect(p.getAttribute('stroke')).toBe('#5b3a8c');
      expect(p.getAttribute('pointer-events')).toBe('none');
      expect(p.getAttribute('fill')).toBe('none');
    }
  });

  it('dispatch 1850 → 6 段全实线（时间 forward 延长）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1850 } }));
    const paths = Array.from(
      container.querySelectorAll<SVGPathElement>('g.migration-layer path.migration'),
    );
    const solid = paths.filter((p) => p.getAttribute('stroke-dasharray') === null);
    expect(solid.length).toBe(6);
  });

  it('dispatch 1820 → 6 段全虚线（Marx 还在特里尔 · 全是未来）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      marxCurrentLocation: [10, 50],
    });
    window.dispatchEvent(new CustomEvent('marx:time-change', { detail: { year: 1820 } }));
    const paths = Array.from(
      container.querySelectorAll<SVGPathElement>('g.migration-layer path.migration'),
    );
    const dashed = paths.filter((p) => p.getAttribute('stroke-dasharray') !== null);
    expect(dashed.length).toBe(6);
  });
});
