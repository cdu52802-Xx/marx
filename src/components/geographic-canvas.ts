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
//
// M-B2 T1.6+++ · plane mode pan 真生效
// PM 第二轮 hotfix 实测：plane mode mode-aware filter 放行 mousedown 后仍无 pan 视觉响应
// 根因：zoom event 只用了 transform.k 重 render projection · 丢了 transform.x/y（pan offset）
// 修法：zoom event handler 在 plane mode 把 transform.x/y 通过 g.attr('transform', translate(x,y)) apply
//   sphere/transition mode 不 translate svg layer（球面走 drag 旋转 / transition 不允许 pan）
//
// M-B2 T1.6++++ · 解耦 zoom 跟 pan（修 Bug 1 + Bug 2）
// PM 第三轮 hotfix 实测两个关键 bug:
//   Bug 1 · 滚轮 11 下后底图 + 5 紫点消失（只剩 graticule 网格）
//     根因：d3-zoom 默认 wheel 累加 transform.x/y（"zoom 鼠标点保持原位"行为）
//          T1.6+++ 把累加的 x/y 单独 apply 到 g.attr('transform') · 跟 projection.scale 双重作用
//          → 节点平移到 viewport 外 / graticule 全地球网格仍部分可见 → "底图消失" 假象
//   Bug 2 · transition zone (k=2.5~4.5) 拖动不响应
//     根因：filter 放行 mousedown 但 zoom event handler 仅 plane mode set g.transform
//          → transition mode 拖看不到视觉变化 = "不响应"
// 修法 B（PM 拍板）· 让 d3-zoom 只管 scale (k) · 让 drag 改 projection.center 管 pan
//   - wheel zoom：reset transform.x/y = 0 防累加 · g.transform 始终 null
//   - drag mode-aware：sphere → currentRotate（既有）/ transition + plane → projection.center 改
//     精确数学：dx/dy 像素 → Δlon/Δlat 用 projection.invert 反算（d3 标准做法 / mercator + satellite 都支持）
//   - time-change event：reset panCenter（让 Marx follow reorient 重新生效）

import { select } from 'd3-selection';
import { geoPath, geoGraticule, geoDistance, geoCentroid, type GeoProjection } from 'd3-geo';
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { drag } from 'd3-drag';
import {
  interpolateProjection,
  satelliteDistanceAtZoom,
  ZOOM_THRESHOLDS,
  K_MAX,
  dotRadiusAtZoom,
  shouldShowBorderLabels,
  borderLabelFontSize,
  type ProjectionMode,
} from '../lib/projection.ts';
import { loadBorders, filterBordersAtYear } from '../lib/historical-borders.ts';
import type { GeoNode } from '../lib/geographic-data.ts';

// M-B2 T2.1 · 删 TEST_NODES（Stage 1 prototype 5 hardcode）· 改接外部 nodes 入参
// V1 PM 拍板 A · 真数据先 ship · 当前 34 person 中 31 个有效（3 个 [0,0] 占位 filter）
// event + location 数据缺口落 backlog · 入参签名预留

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
  /**
   * M-B2 T2.1 · 渲染的地理节点
   *   V1 数据现状 (PM 拍板 A)：31 person (34 - 3 个 [0,0] 占位 filter) / 0 event / 0 location
   *   入参为空数组时仅渲染 graticule + borders（兼容 Stage 1 prototype 测试 + 调用方未传场景）
   */
  nodes?: GeoNode[];
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
  // M-B2 T2.1 · 渲染节点 · default [] 兼容 Stage 1 prototype unit test 不传 nodes 场景
  const nodes: GeoNode[] = opts.nodes ?? [];
  // T1.6+ B · 真线性内插 · k 从 zoom event 拿 / interpolateProjection 内按 k 算 scale
  let currentZoomK = 1;
  // T1.6++++ → T2.1.hotfix Issue 2 · 统一 drag state · drag 全程改 panCenter（删 currentRotate）
  //   第一性：satellite projection .center([lng,lat]) 数学等价 .rotate([-lng,-lat,0])
  //   用户不需要 roll（地球不扭脖子）/ sphere mode drag 跟 transition+plane mode drag 数学+用户体验都等价
  //   两套 state 切 mode 不同步是上轮 race 根因 / 统一 state 杜绝
  //   null 表示 follow currentLoc（Marx 当年地点）· 非 null 时 drag 改写 / time-change reset 回 null
  let panCenter: [number, number] | null = null;

  const svg = select(container);
  const g = svg.append('g').attr('class', 'geographic-root');

  // T1.4 · d3-zoom attach · scaleExtent [1,8] / on('zoom') → k 反查 mode → render
  // jsdom 不易模拟 wheel · unit 只验 __zoom 内部 state 已附加（间接验链路）
  // PM 实测：prod 右上 prototype svg 滚轮 zoom 切球面 (k≤2.5) / 平面 (k≥4.5) / 中间 transition
  //
  // T1.6+ A · drag bug fix · filter 屏蔽 mousedown
  // 原 bug: zoom default 自带 drag-for-pan 抢 mousedown → d3-drag 拿不到 event → 球面 drag 旋转无响应
  // 修法: zoomBehavior.filter 拦截 mousedown / 让 zoom 只响应 wheel + touchstart / drag 独占 mousedown
  //
  // T1.6++ A · mode-aware filter（PM 实测反馈：第一轮 hotfix 后平面 mode 完全不能拖动）
  // 球面 mode：屏蔽 mousedown · d3-drag 接管旋转
  // 平面 / transition mode：放行 mousedown · zoom 自带 pan 接管平移
  // T1.6+++++ · Issue 2 修法 · 拦 wheel 自己算 k · 杜绝 race + x/y 累加
  //   PM 实测 ad75468 后报告："缩回 sphere 那一下又不能拖动" + 偶发底图消失（不稳定复现）
  //   根因：T1.6++++ 的 reset 逻辑同步调 zoomBehavior.transform 在 zoom event handler 内
  //         → 同步触发二次 zoom event · resettingZoom flag 防递归 · 但 d3-zoom 内部 svg.__zoom
  //         在两次 event 之间瞬间 inconsistent · 跟 d3-drag mousedown handler 偶发 race
  //   修法：detach d3-zoom 默认 wheel handler（svg.on('wheel.zoom', null)）·
  //         自挂 svg.on('wheel', custom) · preventDefault + zoomBehavior.transform(svg, scale(newK))
  //         → 完全跳过 d3-zoom 内部 wheel anchor 算法 · transform.x/y 永远 0 · 无 race
  //   保留：filter 屏蔽 mousedown（所有 mode 都让 d3-drag 接管 pan/rotate）·
  //         g.attr('transform') 防御性设 null（应永远是 null · 因 x/y 不再累加）
  // T2.1.hotfix · Issue 3 · scaleExtent 上限从 8 扩到 K_MAX (16) · PM 要看清欧洲国家细节
  const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, K_MAX])
    .filter((event: Event) => {
      // mousedown 一律屏蔽 / 交 d3-drag 处理（sphere rotate · transition/plane pan）
      // wheel 由自挂 wheel listener 接管（svg.on('wheel.zoom', null) 后 d3-zoom 不再处理 wheel）
      if (event.type === 'mousedown') return false;
      return true;
    })
    .on('zoom', (event) => {
      const k = event.transform.k as number;
      currentZoomK = k;
      // T1.6+ B · 任何 k 变化都 re-render（不止 mode 切换）/ scale 跟 k 线性走 → 视觉连续
      if (k <= ZOOM_THRESHOLDS.sphereMax) currentMode = 'sphere';
      else if (k >= ZOOM_THRESHOLDS.planeMin) currentMode = 'plane';
      else currentMode = 'transition';

      // T1.6+++++ · 防御 · 我们自挂 wheel 不让 x/y 累加 · g.transform 应永远是 null
      g.attr('transform', null);

      render();
    });
  svg.call(zoomBehavior);

  // T1.6+++++ · detach d3-zoom 默认 wheel handler · 自挂 wheel 接管
  svg.on('wheel.zoom', null);
  const wheelHandler = (event: WheelEvent): void => {
    event.preventDefault();
    // 沿用 d3-zoom 默认 wheelDelta 公式（保持手感一致）
    // d3-zoom source: -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002)
    const wheelDelta = -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002);
    const newK = Math.max(1, Math.min(K_MAX, currentZoomK * Math.pow(2, wheelDelta)));
    if (newK === currentZoomK) return;
    // 直接 set transform = (newK, 0, 0) · 完全跳过 d3-zoom anchor 算法 · x/y 永远 0
    zoomBehavior.transform(svg, zoomIdentity.scale(newK));
  };
  svg.on('wheel', wheelHandler);

  // T2.1.hotfix · Issue 2 · 统一 drag handler · 全 mode 改 panCenter（删 currentRotate path）
  //   数学：dx/dy 像素 → projection.invert 反算 viewport 中心 vs 偏移点 Δlon/Δlat → panCenter 累加
  //   drag 拖屏幕向右 = projection.center 向左移（看左边 / 用户视角向右 pan）→ 故 invert 用 [cx - dx, cy - dy]
  //   sphere mode 视觉表现仍是"旋转地球"（panCenter 改 = projection.rotate 自动跟着改 / 视觉等价）
  //   transition/plane mode 视觉表现是"拖动地图"（同一 state · 同一公式 · 一致体验）
  const dragBehavior = drag<SVGSVGElement, unknown>().on('drag', (event) => {
    const dx = event.dx as number;
    const dy = event.dy as number;
    const proj = createProjectionForCurrentState();
    if (!proj.invert) {
      // d3 satellite/mercator/orthographic 都支持 invert · 兜底防御
      return;
    }
    const cx = width / 2;
    const cy = height / 2;
    const centerLngLat = proj.invert([cx, cy]);
    const offsetLngLat = proj.invert([cx - dx, cy - dy]);
    if (!centerLngLat || !offsetLngLat) return;
    const dLon = offsetLngLat[0] - centerLngLat[0];
    const dLat = offsetLngLat[1] - centerLngLat[1];
    const base = panCenter ?? currentLoc;
    panCenter = [base[0] + dLon, base[1] + dLat];
    render();
  });
  svg.call(dragBehavior);

  // T1.5 · window 'marx:time-change' event listener · year → Marx 当年地点 → reorient
  // timeline T4.x dispatch 此 event · 现在只 listen（dispatch 由后续 task 加）
  // listener 必须 destroy 时 detach（不然组件卸载后 stale closure 持续累加）
  // T2.1.hotfix · Issue 2 · 统一 state · 只 reset panCenter（删 currentRotate path）
  const timeHandler = (e: Event): void => {
    const detail = (e as CustomEvent).detail as { year?: number } | undefined;
    if (typeof detail?.year === 'number') {
      currentLoc = marxLocationAtYear(detail.year);
      panCenter = null; // reset pan · 让 currentLoc 重新作 projection.center · render 重算 rotate
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

  /**
   * T1.6++++ · helper · 用当前 state 算 projection（drag handler invert 反算用）
   * 跟 render 共享 k 计算逻辑 · 避免重复
   */
  function createProjectionForCurrentState(): GeoProjection {
    const k = computeEffectiveK();
    const center: [number, number] = panCenter ?? currentLoc;
    // T2.1.hotfix · Issue 2 · 不传 rotate · interpolateProjection else 分支自动 rotate([-center[0], -center[1], 0])
    const { projection } = interpolateProjection(k, {
      width,
      height,
      center,
      scale: 200,
    });
    return projection;
  }

  /**
   * T1.6++++ · 抽出 k 计算逻辑（render + createProjectionForCurrentState 共享）
   * setMode 手动切换时（无 zoom event）按 mode 默认 k 推（sphere=1 · transition=3.5 · plane=8）
   */
  function computeEffectiveK(): number {
    return currentMode === 'sphere' && currentZoomK <= ZOOM_THRESHOLDS.sphereMax
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
  }

  function render(): void {
    // T1.6+ B · 真线性内插 · currentZoomK 直接传 / interpolateProjection 内按 k 算 scale
    //   k=1 scale=200（sphere 视觉）/ k=8 scale=853（plateau 起点）/ k=16 scale=1600（细节最大）
    const k = computeEffectiveK();

    // T2.1.hotfix · Issue 2 · 统一 state · panCenter 优先 / 否则 follow currentLoc
    //   sphere/transition/plane 都用同一 center / projection.rotate 自动跟着 center 走
    const center: [number, number] = panCenter ?? currentLoc;
    const { projection } = interpolateProjection(k, {
      width,
      height,
      center,
      scale: 200, // placeholder · interpolateProjection 内被 scaleAtZoom(k) 覆盖
    });
    const pathGen = geoPath(projection);

    // T2.1.hotfix · Issue 1 · 球面背后节点 hide
    //   D3 projection.clipAngle 只 clip path / 不 clip SVG circle · 背面 circle 仍 render（透过球面）
    //   修法：每节点算 great-circle 角距离到视野中心 · > 当前 distance 对应 clipAngle 就 display:none
    //   clipAngle = acos(1 / distance)（弧度）· 跟 projection.ts clipAngleForDistance 一致
    const currentDistance = satelliteDistanceAtZoom(k);
    const clipAngleRad = Math.acos(1 / currentDistance);

    // T2.1.hotfix2-B · stroke-width 反比 zoom（border + graticule · 高 zoom 不模糊）
    //   公式 dotRadiusAtZoom(k, baseW) · 同根号公式 / clamp k<2 plateau
    const strokeW = dotRadiusAtZoom(k, 0.5);

    // T1.6+ C · borders 底图层（最底 / 在 graticule + nodes 之前 / 防遮节点）
    // spec § 6 视觉：米白 fill (#fcfaf6) + 沙石灰金 stroke (#d8cab0)
    // T2.1.hotfix2-B · stroke-width 反比 zoom（高 zoom 时国界线不会太粗）
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
        .attr('stroke-width', strokeW);
    }

    // graticule 经纬网（每 10° 一条 / d3 默认 step）
    // T2.1.hotfix2-B · stroke-width 反比 zoom（视觉风格跟 border 一致）
    g.selectAll('path.graticule').remove();
    g.append('path')
      .attr('class', 'graticule')
      .attr('d', pathGen(geoGraticule()()) ?? '')
      .attr('fill', 'none')
      .attr('stroke', '#d8cab0') // 沙石灰金 · spec § 6
      .attr('stroke-width', strokeW);

    // T2.1.hotfix2-C · 国名英文标签（k>=4 trigger / 字体跟 zoom 走 / 背面 hide）
    //   位置：d3.geoCentroid 算每国地理中心 → projection 推 pixel
    //   字段：CShapes feature.properties.Name（英文如 "Belgium" "Prussia"）
    //   中文映射 70 states 留 Stage 4 backlog（spec § 4.7 已规划）
    //   z-order：在 graticule 之后 · dots 之前（dots 在最上 · 标签辅助）
    g.selectAll('text.border-label').remove();
    if (bordersGeojson && shouldShowBorderLabels(k)) {
      const fontSize = borderLabelFontSize(k);
      g.selectAll<SVGTextElement, GeoJSON.Feature>('text.border-label')
        .data(bordersGeojson.features)
        .enter()
        .append('text')
        .attr('class', 'border-label')
        .attr('x', (d) => {
          const centroid = geoCentroid(d as GeoJSON.GeoJsonObject);
          return projection(centroid as [number, number])?.[0] ?? 0;
        })
        .attr('y', (d) => {
          const centroid = geoCentroid(d as GeoJSON.GeoJsonObject);
          return projection(centroid as [number, number])?.[1] ?? 0;
        })
        .attr('text-anchor', 'middle')
        .attr('font-size', fontSize)
        .attr('fill', '#6a5a4a') // 沙石灰金深一档 · spec § 6
        .attr('opacity', 0.75)
        .attr('pointer-events', 'none')
        .attr('display', (d) => {
          const centroid = geoCentroid(d as GeoJSON.GeoJsonObject);
          return geoDistance(center, centroid as [number, number]) > clipAngleRad ? 'none' : null;
        })
        .text((d) => ((d as GeoJSON.Feature).properties as { Name?: string } | null)?.Name ?? '');
    }

    // M-B2 T2.1 · 86 节点完整渲染（V1 = 31 person · event + location backlog）
    // spec § 4.4 5 类节点视觉：
    //   person → 紫 #5b3a8c · r=5（M5 主图同色）
    //   event  → 橙 #cc6633 · r=4（V1 数据缺口 · 留 code path · V1+ wire up）
    //   location → 灰 #9b8b6f · r=3（V1 数据缺口 · 留 code path · V1+ wire up）
    // T2.1.hotfix · Issue 1 · 背面节点 display:none（great-circle 距离 > clipAngle 隐藏）
    // T2.1.hotfix2-B · dot radius 反比 zoom（治本 PM "圆点比国家大" 痛点）
    g.selectAll('circle.geo-node').remove();
    g.selectAll('circle.geo-node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', (d) => `geo-node geo-node-${d.type}`)
      .attr('data-id', (d) => d.id)
      .attr('cx', (d) => projection(d.lonLat)?.[0] ?? 0)
      .attr('cy', (d) => projection(d.lonLat)?.[1] ?? 0)
      .attr('r', (d) => dotRadiusAtZoom(k, d.type === 'person' ? 5 : d.type === 'event' ? 4 : 3))
      .attr('fill', (d) =>
        d.type === 'person' ? '#5b3a8c' : d.type === 'event' ? '#cc6633' : '#9b8b6f',
      )
      .attr('display', (d) => (geoDistance(center, d.lonLat) > clipAngleRad ? 'none' : null));
  }

  render();

  return {
    setMode(mode: ProjectionMode): void {
      currentMode = mode;
      render();
    },
    setMarxLocation(loc: [number, number]): void {
      currentLoc = loc;
      panCenter = null; // T1.6++++ · 外部 setMarxLocation 也 reset pan（跟 time-change handler 对仗）
      render();
    },
    rotate(_deg: [number, number, number]): void {
      // T2.1.hotfix · Issue 2 · 统一 drag state · rotate API deprecated
      //   保留接口防 console 调用方破裂 · 实际无副作用（推荐用 setMarxLocation 改 center）
      console.warn(
        '[geographic-canvas] rotate(deg) deprecated · 用 setMarxLocation(loc) 改 projection.center',
      );
    },
    destroy(): void {
      window.removeEventListener('marx:time-change', timeHandler);
      svg.on('wheel', null); // T1.6+++++ · detach 自挂 wheel handler · 防 memory leak / stale closure
      g.remove();
    },
  };
}
