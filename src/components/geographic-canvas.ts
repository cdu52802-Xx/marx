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
//
// M-B2 T1.5 · Marx follow + drag 旋转
// 监听 window 'marx:time-change' event (timeline T4.x dispatch · 现在只 listen)
//   → year → marxLocationAtYear() → setMarxLocation → 球面 reorient (currentLoc 推 projection center)
// d3-drag attach svg · 球面 mode 下 dx/dy → currentRotate 累加 (sphere 旋转视角)
//   平面 mode 不响应 drag 旋转（zoom 自带 drag handling for pan）

import { select } from 'd3-selection';
import { geoPath, geoGraticule } from 'd3-geo';
import { zoom, type ZoomBehavior } from 'd3-zoom';
import { drag } from 'd3-drag';
import { interpolateProjection, ZOOM_THRESHOLDS, type ProjectionMode } from '../lib/projection.ts';
import { loadBorders, filterBordersAtYear } from '../lib/historical-borders.ts';

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

// M-B2 T1.5 · Marx 行迹 6 段 (spec § 4.3)
// yearEnd 是 exclusive (年区间 [yearStart, yearEnd))
// 1883 死 / 最后一段 [1849, 1883] 用 < 1884 写法 → 但 Marx 死在 1883.03.14 / 1883 整年都算伦敦
//   ∴ 最后段 yearEnd = 1884 / 1849-1883 整年覆盖
const MARX_LOCATIONS: { yearStart: number; yearEnd: number; loc: [number, number] }[] = [
  { yearStart: 1818, yearEnd: 1835, loc: [6.64, 49.75] }, // 特里尔
  { yearStart: 1835, yearEnd: 1841, loc: [13.4, 52.52] }, // 波恩/柏林
  { yearStart: 1841, yearEnd: 1843, loc: [6.96, 50.94] }, // 科隆
  { yearStart: 1843, yearEnd: 1845, loc: [2.35, 48.86] }, // 巴黎
  { yearStart: 1845, yearEnd: 1848, loc: [4.35, 50.85] }, // 布鲁塞尔
  { yearStart: 1849, yearEnd: 1884, loc: [-0.13, 51.51] }, // 伦敦
];

function marxLocationAtYear(year: number): [number, number] {
  const rec = MARX_LOCATIONS.find((r) => year >= r.yearStart && year < r.yearEnd);
  return rec?.loc ?? [10, 50]; // fallback 欧洲中心
}

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
  // T1.6+ B · 真线性内插 · k 从 zoom event 拿 / interpolateProjection 内按 k 算 scale
  let currentZoomK = 1;

  const svg = select(container);
  const g = svg.append('g').attr('class', 'geographic-root');

  // T1.4 · d3-zoom attach · scaleExtent [1,8] / on('zoom') → k 反查 mode → render
  // jsdom 不易模拟 wheel · unit 只验 __zoom 内部 state 已附加（间接验链路）
  // PM 实测：prod 右上 prototype svg 滚轮 zoom 切球面 (k≤2.5) / 平面 (k≥4.5) / 中间 transition
  //
  // T1.6+ A · drag bug fix · filter 屏蔽 mousedown
  // 原 bug: zoom default 自带 drag-for-pan 抢 mousedown → d3-drag 拿不到 event → 球面 drag 旋转无响应
  // 修法: zoomBehavior.filter 拦截 mousedown / 让 zoom 只响应 wheel + touchstart / drag 独占 mousedown
  const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 8])
    .filter((event: Event) => {
      // 屏蔽 mousedown（让 d3-drag 接管球面旋转）/ 允许 wheel / touchstart / touchmove 等
      return event.type !== 'mousedown';
    })
    .on('zoom', (event) => {
      const k = event.transform.k as number;
      currentZoomK = k;
      // T1.6+ B · 任何 k 变化都 re-render（不止 mode 切换）/ scale 跟 k 线性走 → 视觉连续
      if (k <= ZOOM_THRESHOLDS.sphereMax) currentMode = 'sphere';
      else if (k >= ZOOM_THRESHOLDS.planeMin) currentMode = 'plane';
      else currentMode = 'transition';
      render();
    });
  svg.call(zoomBehavior);

  // T1.5 · d3-drag attach · 球面 mode 下 dx/dy → currentRotate 累加（sphere 视角旋转）
  // 平面 mode 不响应（zoom 自带 pan handling 走 wheel + drag · 此处只补 sphere 旋转）
  // 0.5 系数：1px 拖动 = 0.5° 旋转（手感经验值 / 见 https://observablehq.com/@d3/versor-dragging）
  // 注：spec 设 zoom 只 wheel · drag 给 globe 旋转 / 但 zoom default 同时挂 drag pan
  //   → MVP 阶段保留 zoom drag pan（不冲突 / d3 内部 event 顺序 zoom 先 drag 后）
  const dragBehavior = drag<SVGSVGElement, unknown>().on('drag', (event) => {
    if (currentMode !== 'sphere') return; // 平面/过渡 不响应 drag 旋转
    const dx = event.dx as number;
    const dy = event.dy as number;
    const rotate = currentRotate ?? [-currentLoc[0], -currentLoc[1], 0];
    currentRotate = [rotate[0] + dx * 0.5, rotate[1] - dy * 0.5, rotate[2]];
    render();
  });
  svg.call(dragBehavior);

  // T1.5 · window 'marx:time-change' event listener · year → Marx 当年地点 → reorient
  // timeline T4.x dispatch 此 event · 现在只 listen（dispatch 由后续 task 加）
  // listener 必须 destroy 时 detach（不然组件卸载后 stale closure 持续累加）
  const timeHandler = (e: Event): void => {
    const detail = (e as CustomEvent).detail as { year?: number } | undefined;
    if (typeof detail?.year === 'number') {
      currentLoc = marxLocationAtYear(detail.year);
      currentRotate = undefined; // reset drag · 让 currentLoc 重新 drive projection center
      render();
    }
  };
  window.addEventListener('marx:time-change', timeHandler);

  // T1.6+ C · cshapes 底图临时上（Stage 1 静态 1843 sample）
  // Stage 4 真接 timeline year 动态切换 + build-time filter Marx subset (~480 KB)
  // async load · 失败兜底（L1 留 V1+ world-atlas fallback / 现在只 console.error）
  let bordersGeojson: GeoJSON.FeatureCollection | null = null;
  loadBorders()
    .then((g) => {
      bordersGeojson = filterBordersAtYear(g, 1843);
      render();
    })
    .catch((err) => {
      console.error('[geographic-canvas] borders load fail · L1 fallback world-atlas 留 V1+', err);
    });

  function render(): void {
    // T1.6+ B · 真线性内插 · currentZoomK 直接传 / interpolateProjection 内按 k 算 scale
    //   k=1 sphere scale=200 / k=4.5 transition scale=500 / k=8 plane scale=800（lib/projection.ts scaleAtZoom）
    // setMode 手动切换时（无 zoom event）按 mode 默认 k 推（sphere=1 · transition=3.5 · plane=8）
    const k =
      currentMode === 'sphere' && currentZoomK <= ZOOM_THRESHOLDS.sphereMax
        ? currentZoomK
        : currentMode === 'plane' && currentZoomK >= ZOOM_THRESHOLDS.planeMin
          ? currentZoomK
          : currentMode === 'transition' &&
              currentZoomK > ZOOM_THRESHOLDS.sphereMax &&
              currentZoomK < ZOOM_THRESHOLDS.planeMin
            ? currentZoomK
            : currentMode === 'sphere'
              ? 1
              : currentMode === 'plane'
                ? 8
                : 3.5;

    const { projection } = interpolateProjection(k, {
      width,
      height,
      center: currentLoc,
      scale: 200, // placeholder · interpolateProjection 内被 scaleAtZoom(k) 覆盖
      rotate: currentRotate,
    });
    const pathGen = geoPath(projection);

    // T1.6+ C · borders 底图层（最底 / 在 graticule + nodes 之前 / 防遮节点）
    // spec § 6 视觉：米白 fill (#fcfaf6) + 沙石灰金 stroke (#d8cab0)
    g.selectAll('path.border').remove();
    if (bordersGeojson) {
      const borderSel = g
        .selectAll<SVGPathElement, GeoJSON.Feature>('path.border')
        .data(bordersGeojson.features);
      borderSel
        .enter()
        .append('path')
        .attr('class', 'border')
        .attr('d', (d) => pathGen(d as GeoJSON.GeoJsonObject) ?? '')
        .attr('fill', '#fcfaf6') // 米白底 · spec § 6
        .attr('stroke', '#d8cab0') // 沙石灰金 border · spec § 6
        .attr('stroke-width', 0.5);
    }

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
      window.removeEventListener('marx:time-change', timeHandler);
      g.remove();
    },
  };
}
