// M-B2 T1.3 · geographic-canvas prototype 副图骨架
// Stage 1 prototype · 不接真数据 / 不接 timeline / 5 个 hardcode 测试节点
// 复用 lib/projection.ts (T1.1 · sphere/plane/transition 投影工厂)
// 渲染：graticule grid + 5 个测试 dot · 视觉风格 spec § 6 (米白 / 紫 / 沙石灰金)
// 真 obs 数据 + great circle 关系连线 + timeline 联动 → Stage 2 接
//
// M-B2 T1.4 · zoom 整合
// d3-zoom attach to svg / scaleExtent [1,8] / on('zoom') → k 反查 mode → render()
// k ≤ 2.5 sphere / k ≥ 4.5 plane / 中间 transition · 阈值见 lib/projection.ts ZOOM_THRESHOLDS
// 真平滑内插（k 区间内 scale/rotate 渐变）留 Step 1.5 / 当前 mode 切换 + scale hardcode (200/400/800)

import { select } from 'd3-selection';
import { geoPath, geoGraticule } from 'd3-geo';
import { zoom, type ZoomBehavior } from 'd3-zoom';
import { interpolateProjection, ZOOM_THRESHOLDS, type ProjectionMode } from '../lib/projection.ts';

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

  // T1.4 · d3-zoom attach · scaleExtent [1,8] / on('zoom') → k 反查 mode → render
  // jsdom 不易模拟 wheel · unit 只验 __zoom 内部 state 已附加（间接验链路）
  // PM 实测：prod 右上 prototype svg 滚轮 zoom 切球面 (k≤2.5) / 平面 (k≥4.5) / 中间 transition
  const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 8])
    .on('zoom', (event) => {
      const k = event.transform.k as number;
      let nextMode: ProjectionMode;
      if (k <= ZOOM_THRESHOLDS.sphereMax) nextMode = 'sphere';
      else if (k >= ZOOM_THRESHOLDS.planeMin) nextMode = 'plane';
      else nextMode = 'transition';
      if (nextMode !== currentMode) {
        currentMode = nextMode;
        render();
      }
    });
  svg.call(zoomBehavior);

  function render(): void {
    // mode → k 反推（interpolateProjection 内分支按 k）
    //   sphere = 1 / transition = 3.5 / plane = 8 · 见 lib/projection.ts ZOOM_THRESHOLDS
    const k = currentMode === 'sphere' ? 1 : currentMode === 'plane' ? 8 : 3.5;
    // T1.4 · scale 三段 hardcode（200 sphere / 400 transition / 800 plane）
    // 真按 k 平滑内插（k 区间内 scale 渐变 + sphere↔plane rotate 渐变）留 Step 1.5
    const scale = currentMode === 'sphere' ? 200 : currentMode === 'plane' ? 800 : 400;

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
