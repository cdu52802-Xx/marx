// M-B2 T1.3 · geographic-canvas prototype 副图骨架
// Stage 1 prototype · 不接真数据 / 不接 timeline / 5 个 hardcode 测试节点
// 复用 lib/projection.ts (T1.1 · sphere/plane/transition 投影工厂)
// 渲染：graticule grid + 5 个测试 dot · 视觉风格 spec § 6 (米白 / 紫 / 沙石灰金)
// 真 obs 数据 + great circle 关系连线 + timeline 联动 → Stage 2 接

import { select } from 'd3-selection';
import { geoPath, geoGraticule } from 'd3-geo';
import { interpolateProjection, type ProjectionMode } from '../lib/projection.ts';

// Stage 1 prototype 测试节点（5 个 / 真数据 Stage 2 接）
// 选址逻辑：Marx 生平相关欧洲城市 / 跨经度 (-0.13 to 13.40) + 跨纬度 (48.86 to 52.52)
//   → sphere ↔ plane 切换时 cx/cy 变化明显 / PM 视觉验证好辨认
const TEST_NODES: { id: string; lonLat: [number, number] }[] = [
  { id: 'trier', lonLat: [6.64, 49.75] },
  { id: 'bonn', lonLat: [7.1, 50.74] },
  { id: 'berlin', lonLat: [13.4, 52.52] },
  { id: 'paris', lonLat: [2.35, 48.86] },
  { id: 'london', lonLat: [-0.13, 51.51] },
];

export interface GeographicCanvasOptions {
  container: SVGSVGElement;
  width: number;
  height: number;
  initialMode?: ProjectionMode;
  marxCurrentLocation?: [number, number]; // [lon, lat] · Stage 1.5 接 timeline
}

export interface GeographicCanvasApi {
  setMode(mode: ProjectionMode): void;
  setMarxLocation(loc: [number, number]): void;
  rotate(deg: [number, number, number]): void;
  destroy(): void;
}

export function mountGeographicCanvas(opts: GeographicCanvasOptions): GeographicCanvasApi {
  const { container, width, height } = opts;
  let currentMode: ProjectionMode = opts.initialMode ?? 'sphere';
  let currentLoc: [number, number] = opts.marxCurrentLocation ?? [10, 50];
  let currentRotate: [number, number, number] | undefined;

  const svg = select(container);
  const g = svg.append('g').attr('class', 'geographic-root');

  function render(): void {
    // mode → k 反推（interpolateProjection 内分支按 k）
    //   sphere = 1 / transition = 3.5 / plane = 8 · 见 lib/projection.ts ZOOM_THRESHOLDS
    const k = currentMode === 'sphere' ? 1 : currentMode === 'plane' ? 8 : 3.5;
    // scale 在 sphere/plane 差量大（200 vs 800）/ Stage 2 调
    const scale = currentMode === 'sphere' ? 200 : 800;

    const { projection } = interpolateProjection(k, {
      width,
      height,
      center: currentLoc,
      scale,
      rotate: currentRotate,
    });
    const pathGen = geoPath(projection);

    // graticule 经纬网（每 10° 一条 / d3 默认 step）
    g.selectAll('path.graticule').remove();
    g.append('path')
      .attr('class', 'graticule')
      .attr('d', pathGen(geoGraticule()()) ?? '')
      .attr('fill', 'none')
      .attr('stroke', '#d8cab0') // 沙石灰金 · spec § 6
      .attr('stroke-width', 0.5);

    // 5 个测试节点
    g.selectAll('circle.test-node').remove();
    g.selectAll('circle.test-node')
      .data(TEST_NODES)
      .enter()
      .append('circle')
      .attr('class', 'test-node')
      .attr('data-id', (d) => d.id)
      .attr('cx', (d) => projection(d.lonLat)?.[0] ?? 0)
      .attr('cy', (d) => projection(d.lonLat)?.[1] ?? 0)
      .attr('r', 4)
      .attr('fill', '#5b3a8c'); // 紫 · spec § 6
  }

  render();

  return {
    setMode(mode: ProjectionMode): void {
      currentMode = mode;
      render();
    },
    setMarxLocation(loc: [number, number]): void {
      currentLoc = loc;
      render();
    },
    rotate(deg: [number, number, number]): void {
      currentRotate = deg;
      render();
    },
    destroy(): void {
      g.remove();
    },
  };
}
