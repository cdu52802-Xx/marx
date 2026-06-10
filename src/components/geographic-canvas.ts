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
//
// M-B2 Stage 4.2 · 渲染架构升级 · 分层 g + keyed data join（替代每帧全量 remove+rebuild）
//   动机：T4.2 国界过渡需要 enter/exit 区分（fade in/out）· remove+rebuild 架构做不了 transition
//   附带收益（goal #3 优化）：zoom/drag/hover 高频 render 不再重建全部 DOM · 只 update attr
//   分层 z-order（替代渲染顺序隐式 z-order）：
//     borders-layer → graticule-layer → border-labels-layer → migration-layer
//     → relations-layer → nodes-layer → person-labels-layer
//   国界过渡（DR-T4.2）：
//     - enter fade in / exit fade out 350ms（1871 普鲁士诸邦淡出 · 德意志帝国淡入）
//     - update 的 path d 即时更新（不做 path morph · 避免跟节点瞬移不同步 + interpolateString 开销）
//     - 只在 feature set 真变化时 fade（拖动时间轴同一时期内不触发 transition）
//     - borderTransitionMs option：0 = 关过渡（副窗低密度版 + unit test 同步断言用）
//     - 信息性 motion 不加 reduce-motion guard（anchor § 3 拍板 · Win10 陷阱只 guard 装饰性 motion）
//   年份 clamp（数据边界修正）：cshapes 1806-2023 · timeline 1770-2030 超界年份 clamp 到数据范围
//     （之前 year > 2022 时 filterBordersAtYear 返回空 → 国界全消失 · 初始游标 2030 必踩）
//
// M-B2 Stage 4.3 · 迁徙轨迹（plan T4.3）
//   MARX_LOCATIONS 7 段（抽到 lib/marx-itinerary.ts · 补 1848 科隆修空洞）→ 6 段 great-circle path
//   已走（currentYear >= arrivalYear）紫实线 / 未来紫虚线 '4 3' · 时间 forward 实线段延长
//   z-order：borders 之上 · relations/dots 之下（anchor § 3 拍板）

import { select } from 'd3-selection';
import 'd3-transition'; // 注册 selection.transition / interrupt（T4.2 国界 fade 用）
import { geoPath, geoGraticule, geoDistance, geoCentroid, type GeoProjection } from 'd3-geo';
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { drag } from 'd3-drag';
import {
  interpolateProjection,
  satelliteDistanceAtZoom,
  ZOOM_THRESHOLDS,
  K_MAX,
  DOT_BASE_RADIUS,
  dotRadiusAtZoom,
  strokeWidthAtZoom,
  borderStrokeColor,
  shouldShowBorderLabels,
  borderLabelFontSize,
  personLabelFontSize,
  type ProjectionMode,
} from '../lib/projection.ts';
import { loadBorders, filterBordersAtYear } from '../lib/historical-borders.ts';
import { borderDisplayName } from '../lib/border-names-zh.ts';
import {
  marxLocationAtYear,
  computeMigrationSegments,
  type MigrationSegment,
} from '../lib/marx-itinerary.ts';
import type { GeoNode } from '../lib/geographic-data.ts';
import { isRelationInvolved, type GeoRelation } from '../lib/geographic-relations.ts';
import { greatCircleArc } from '../lib/great-circle.ts';

// M-B2 T2.1 · 删 TEST_NODES（Stage 1 prototype 5 hardcode）· 改接 nodes 入参
// V1 PM 拍板 A · 真数据先 ship · 当前 34 person 中 31 个有效（3 个 [0,0] 占位 filter）
// event + location 数据缺口落 backlog · 入参签名预留
//
// M-B2 T4.3 · MARX_LOCATIONS + marxLocationAtYear 抽到 lib/marx-itinerary.ts（迁徙轨迹 SSOT）

// DR-T4.2 · 国界过渡时长 350ms（anchor § 3 给 250-450 区间 · 取中值 · PM 微调入口 = borderTransitionMs option）
export const BORDER_TRANSITION_MS = 350;

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
  /**
   * M-B2 T2.3 · 渲染的地理关系连线（PM 拍 ζ · DR-107）
   *   V1 数据 reality 37 条 person-person arc（35 influences + 1 mentor + 1 friend_collaborator）
   *   默认 stroke #9b8b6f gray opacity 0.25 · hover/click person 涉及 arc 联动高亮紫
   *   入参为空数组时不渲染 arc（兼容 Stage 1 prototype 测试场景）
   */
  relations?: GeoRelation[];
  /**
   * M-B2 T4.2 · 国界 enter/exit fade 时长（ms）· 默认 BORDER_TRANSITION_MS (350)
   *   0 = 关过渡（同步 join · 副窗低密度版 + unit test 用）
   */
  borderTransitionMs?: number;
}

export interface GeographicCanvasApi {
  setMode(mode: ProjectionMode): void;
  setMarxLocation(loc: [number, number]): void;
  rotate(deg: [number, number, number]): void;
  /**
   * Stage 4 性能守卫 · 隐藏期（display:none）跳过的 time-change 渲染 · swap 切回 geo-main 时补一次
   */
  refresh(): void;
  destroy(): void;
}

export function mountGeographicCanvas(opts: GeographicCanvasOptions): GeographicCanvasApi {
  const { container, width, height } = opts;
  let currentMode: ProjectionMode = opts.initialMode ?? 'sphere';
  let currentLoc: [number, number] = opts.marxCurrentLocation ?? [10, 50];
  // M-B2 T2.1 · 渲染节点 · default [] 兼容 Stage 1 prototype unit test 不传 nodes 场景
  const nodes: GeoNode[] = opts.nodes ?? [];
  // M-B2 T2.3 · 渲染关系连线 · default [] 兼容
  const relations: GeoRelation[] = opts.relations ?? [];
  // T4.2 · 国界 fade 时长（0 = 关）
  const borderTransitionMs = opts.borderTransitionMs ?? BORDER_TRANSITION_MS;
  // T4.3 · 迁徙 segment（5 段 · mount 时算一次 · 静态数据）
  const migrationSegments: MigrationSegment[] = computeMigrationSegments();
  // T1.6+ B · 真线性内插 · k 从 zoom event 拿 / interpolateProjection 内按 k 算 scale
  let currentZoomK = 1;
  // T1.6++++ → T2.1.hotfix Issue 2 · 统一 drag state · drag 全程改 panCenter（删 currentRotate）
  //   第一性：satellite projection .center([lng,lat]) 数学等价 .rotate([-lng,-lat,0])
  //   用户不需要 roll（地球不扭脖子）/ sphere mode drag 跟 transition+plane mode drag 数学+用户体验都等价
  //   两套 state 切 mode 不同步是上轮 race 根因 / 统一 state 杜绝
  //   null 表示 follow currentLoc（Marx 当年地点）· 非 null 时 drag 改写 / time-change reset 回 null
  let panCenter: [number, number] | null = null;

  // T2.2-F · person 节点 hover/click state（D+E 混合 · PM Q1a/Q2b/Q3a/Q4a 拍板）
  //   球面 mode (k<4)：default label hide / hover 显含生卒年 / click 选中常驻
  //   plane mode (k>=4)：default label 全显（仅 name_zh）/ hover 切到含生卒年 / click 选中常驻
  //   selected 视觉：紫圈 indicator (B1 DR-087 复用 · stroke #5b3a8c sw=2) + label 加粗
  let hoveredPersonId: string | null = null;
  let selectedPersonId: string | null = null;

  // Stage 4 性能守卫（审查 workflow 确认 3 条 high finding）·
  //   lastGeom：最近一次完整 render 的几何上下文 · hover/click 只刷样式时复用（不重算投影/路径）
  //   pendingRender：隐藏期（list-main 模式 geo svg display:none）跳过的渲染标记 · refresh() 补
  //   lastHandledYearInt：整数年粒度守卫 · borders From/To 整数 + Marx 行迹整数边界
  //     → 同一整数年内的高频 time-change（drag mousemove / playback 50ms 小数步进）是视觉 no-op · skip
  let lastGeom: {
    projection: GeoProjection;
    k: number;
    center: [number, number];
    clipAngleRad: number;
    dotOutlineW: number;
  } | null = null;
  let pendingRender = false;
  let lastHandledYearInt: number | null = null;

  function isContainerHidden(): boolean {
    return container.style.display === 'none';
  }

  const svg = select(container);
  const g = svg.append('g').attr('class', 'geographic-root');

  // Stage 4.2 · 分层 g（z-order 显式化 · keyed join 的容器）
  const layers = {
    borders: g.append('g').attr('class', 'borders-layer'),
    graticule: g.append('g').attr('class', 'graticule-layer'),
    borderLabels: g.append('g').attr('class', 'border-labels-layer'),
    migration: g.append('g').attr('class', 'migration-layer'),
    relations: g.append('g').attr('class', 'relations-layer'),
    nodes: g.append('g').attr('class', 'nodes-layer'),
    personLabels: g.append('g').attr('class', 'person-labels-layer'),
  };
  // graticule 单 path · mount 建一次 · render 只 update attr
  const graticulePath = layers.graticule
    .append('path')
    .attr('class', 'graticule')
    .attr('fill', 'none');

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
  //
  // T2.2-F click-bug fix v2 (root cause) · dragBehavior.filter target = dot 时 return false
  //   v1 (db68602) clickDistance(5) PM 实测 prod 仍 click 无反应
  //   v1 不足根因：用户鼠标实际可能移动 > 5px 时仍被 d3-drag 视为 drag · 拦 click
  //     jsdom test pass · jsdom dispatchEvent('click') 直接给 circle 不走 mousedown/move/up 流程
  //     → jsdom 无法 catch d3-drag 拦 click 真 bug（lesson 4.9 复用：E2E 路径补 jsdom 漏）
  //
  //   v2 root cause fix · dragBehavior.filter check event.target ·
  //     如果 mousedown 命中 circle.geo-node → return false → d3-drag 完全不接管该 mousedown
  //     → 不 attach window click.drag listener → native click 100% 到 dot.on('click') handler
  //   保留 clickDistance(5) 作为 svg 空白 click 的兜底（双保险）
  //   ⚠ B-7 · v1+v2 prod 实测仍 fail · 真根因不明 · 此段不动 · 等专项 polish R（h1/h3-h6 假设池）
  //
  //   行为 trade-off ·
  //     dot mousedown → 走 click 路径（hover/click 联动 · F+ζ pattern）
  //     svg 空白 mousedown → 走 drag pan 路径（unchanged）
  //     → 用户体验：dot 是"点击 commit" · 空白是"拖动 pan" · 各司其职
  const dragBehavior = drag<SVGSVGElement, unknown>()
    .filter((event: Event) => {
      // v2 fix · mousedown 命中 dot → d3-drag 不接管 · 让 native click 独立路径走 dot click handler
      const target = event.target as Element | null;
      if (target?.tagName === 'circle' && target.classList?.contains('geo-node')) {
        return false;
      }
      // svg 空白 + 其他子元素 mousedown → d3-drag 接管走 pan/rotate 路径（unchanged）
      return true;
    })
    .clickDistance(5)
    .on('drag', (event) => {
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
  // listener 必须 destroy 时 detach（不然组件卸载后 stale closure 持续累加）
  // T2.1.hotfix · Issue 2 · 统一 state · 只 reset panCenter（删 currentRotate path）
  // Stage 4.1 · borders 动态切片（接 marx:time-change event）
  //   bordersFullGeojson cache 完整 322 features · loadBorders 内部 _cache 已防重复 fetch
  //   bordersGeojson 按 currentYear filter 后 ≈ 50-100 features · 喂 render() pathGen
  //   currentYear 初始 1843（hardcode 跟 Stage 1 sample 一致 · main.ts wire timeline initialCursor 后接到 Marx 1818-1883 range）
  // Stage 4.2 · feature set 真变化才触发 fade（同一时期内拖动时间轴不重启 transition）
  //   + 年份 clamp 到数据范围（cshapes 1806-2023 · 超界不再国界全空）
  let bordersFullGeojson: GeoJSON.FeatureCollection | null = null;
  let bordersGeojson: GeoJSON.FeatureCollection | null = null;
  let bordersYearRange: { min: number; max: number } | null = null;
  let currentYear: number = 1843;

  // Stage 4.2 · feature → 稳定 key（keyed join 用 · filterBordersAtYear 保留对象引用 → WeakMap 可行）
  const borderKeyByFeature = new WeakMap<object, number>();
  let borderKeySeq = 0;
  function borderKey(f: GeoJSON.Feature): number {
    let k = borderKeyByFeature.get(f);
    if (k === undefined) {
      k = borderKeySeq;
      borderKeySeq += 1;
      borderKeyByFeature.set(f, k);
    }
    return k;
  }
  // Stage 4.2 · centroid 静态 per-feature · cache（之前每 render 每 feature 算 3 次）
  const centroidByFeature = new WeakMap<object, [number, number]>();
  function borderCentroid(f: GeoJSON.Feature): [number, number] {
    let c = centroidByFeature.get(f);
    if (!c) {
      c = geoCentroid(f as GeoJSON.GeoJsonObject) as [number, number];
      centroidByFeature.set(f, c);
    }
    return c;
  }

  function clampBordersYear(year: number): number {
    if (!bordersYearRange) return year;
    return Math.max(bordersYearRange.min, Math.min(bordersYearRange.max, year));
  }

  function bordersSetChanged(
    prev: GeoJSON.FeatureCollection | null,
    next: GeoJSON.FeatureCollection,
  ): boolean {
    if (!prev) return true;
    if (prev.features.length !== next.features.length) return true;
    for (let i = 0; i < prev.features.length; i++) {
      if (prev.features[i] !== next.features[i]) return true;
    }
    return false;
  }

  const timeHandler = (e: Event): void => {
    const detail = (e as CustomEvent).detail as { year?: number } | undefined;
    if (typeof detail?.year !== 'number') return;
    currentYear = detail.year;
    // Stage 4 守卫 1 · 整数年粒度 · borders 过滤 + marxLocationAtYear 都是整数年粒度
    //   同一整数年内的高频 dispatch（timeline drag mousemove / playback 0.45 年步进）= 视觉 no-op
    //   panCenter 非 null 时不 skip（time-change 要 reset 回 Marx follow · 既有行为）
    const yearInt = Math.trunc(currentYear);
    if (yearInt === lastHandledYearInt && panCenter === null) return;
    lastHandledYearInt = yearInt;
    currentLoc = marxLocationAtYear(currentYear);
    panCenter = null; // reset pan · 让 currentLoc 重新作 projection.center · render 重算 rotate
    // Stage 4.1 · 动态 re-filter borders 按新 year（bordersFullGeojson 已 cache · O(322) features filter · 快）
    let animateBorders = false;
    if (bordersFullGeojson) {
      const filtered = filterBordersAtYear(bordersFullGeojson, clampBordersYear(currentYear));
      animateBorders = bordersSetChanged(bordersGeojson, filtered);
      bordersGeojson = filtered;
    }
    // Stage 4 守卫 2 · 隐藏画布（list-main 模式 geo svg display:none）·
    //   之前用户在 M5 主图拖时间轴时 · 每个 mousemove 都为看不见的画布做全量投影 + DOM 更新
    //   状态已更新（currentYear/currentLoc/bordersGeojson）· swap 切回 geo-main 时 refresh() 补渲染
    if (isContainerHidden()) {
      pendingRender = true;
      return;
    }
    render({ animateBorders });
  };
  window.addEventListener('marx:time-change', timeHandler);

  // T1.6+ C · cshapes 底图加载（Stage 1 静态 1843 sample · Stage 4.1 升级动态切片）
  //   loadBorders().then 内：保存 full geojson + 数据年份范围 + 按 currentYear initial filter
  //   后续 marx:time-change event 触发 timeHandler 内 re-filter
  // async load · 失败兜底（L1 留 V1+ world-atlas fallback / 现在只 console.error）
  loadBorders()
    .then((full) => {
      bordersFullGeojson = full;
      // Stage 4.2 · 数据年份范围（From min / To max - 1 · From===To sentinel 跳过）
      let minFrom = Infinity;
      let maxTo = -Infinity;
      for (const f of full.features) {
        const from = f.properties?.['From'] as number | undefined;
        const to = f.properties?.['To'] as number | undefined;
        if (typeof from !== 'number' || typeof to !== 'number' || from === to) continue;
        if (from < minFrom) minFrom = from;
        if (to > maxTo) maxTo = to;
      }
      if (minFrom !== Infinity && maxTo !== -Infinity) {
        bordersYearRange = { min: minFrom, max: maxTo - 1 };
      }
      bordersGeojson = filterBordersAtYear(full, clampBordersYear(currentYear));
      render({ animateBorders: true });
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

  interface RenderOptions {
    /** T4.2 · 本次 render 国界走 enter/exit fade（仅 time-change 且 feature set 真变化时 true） */
    animateBorders?: boolean;
  }

  function render(renderOpts?: RenderOptions): void {
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

    // T2.1.hotfix3-1A · stroke 视觉权重 dual lever（PM polish R1 反馈 "边界线颜色太浅"）
    //   lever A · stroke-width 绝对值 min clamp 0.6（防 sub-pixel rendering antialiasing 稀释）
    //   lever B · 颜色 zoom-adaptive（sphere 保 #d8cab0 spec § 6 / plane k>=4 加深 #b8a880）
    //   dot outline 用更小 min 0.3（米白底 separation 作用 · 不喧宾夺主）
    const borderStrokeW = strokeWidthAtZoom(k, 0.5, 0.6);
    const borderColor = borderStrokeColor(k);
    const dotOutlineW = strokeWidthAtZoom(k, 0.5, 0.3);

    // Stage 4 性能守卫 · 缓存几何上下文给 renderFocusStyles（hover/click 只刷样式不重算几何）
    lastGeom = { projection, k, center, clipAngleRad, dotOutlineW };

    // === borders 底图层（最底 · 防遮节点）===
    // spec § 6 视觉：米白 fill (#fcfaf6) + 沙石灰金 stroke
    // Stage 4.2 · keyed join + enter/exit fade（DR-T4.2）· update 的 d 即时更新
    const animate = (renderOpts?.animateBorders ?? false) && borderTransitionMs > 0;
    const borderFeatures = bordersGeojson?.features ?? [];
    const borderSel = layers.borders
      .selectAll<SVGPathElement, GeoJSON.Feature>('path.border')
      .data(borderFeatures, (d) => borderKey(d));
    const borderEnter = borderSel
      .enter()
      .append('path')
      .attr('class', 'border')
      .attr('data-name', (d) => (d.properties as { Name?: string } | null)?.Name ?? '')
      .attr('fill', '#fcfaf6'); // 米白底 · spec § 6
    borderEnter
      .merge(borderSel)
      .attr('d', (d) => pathGen(d as GeoJSON.GeoJsonObject) ?? '')
      .attr('stroke', borderColor) // T2.1.hotfix3-1A · sphere #d8cab0 / plane #b8a880
      .attr('stroke-width', borderStrokeW);
    if (animate) {
      borderEnter
        .attr('opacity', 0)
        .transition('border-fade')
        .duration(borderTransitionMs)
        .attr('opacity', 1);
      borderSel
        .exit()
        .transition('border-fade')
        .duration(borderTransitionMs)
        .attr('opacity', 0)
        .remove();
    } else {
      borderEnter.attr('opacity', 1);
      borderSel.interrupt('border-fade').attr('opacity', 1);
      borderSel.exit().interrupt('border-fade').remove();
    }

    // graticule 经纬网（每 10° 一条 / d3 默认 step）· 单 path · 只 update attr
    // T2.1.hotfix3-1A · 跟 border 同步 dual lever（视觉风格一致）
    graticulePath
      .attr('d', pathGen(geoGraticule()()) ?? '')
      .attr('stroke', borderColor) // T2.1.hotfix3-1A · 跟 border 同色
      .attr('stroke-width', borderStrokeW);

    // T2.1.hotfix2-C · 国名英文标签（k>=4 trigger / 字体跟 zoom 走 / 背面 hide）
    //   位置：d3.geoCentroid 算每国地理中心（per-feature cache）→ projection 推 pixel
    //   字段：CShapes feature.properties.Name（英文如 "Belgium" "Prussia"）
    //   z-order：在 graticule 之后 · dots 之前（dots 在最上 · 标签辅助）
    const labelFeatures =
      bordersGeojson && shouldShowBorderLabels(k) ? bordersGeojson.features : [];
    const labelFontSize = borderLabelFontSize(k);
    layers.borderLabels
      .selectAll<SVGTextElement, GeoJSON.Feature>('text.border-label')
      .data(labelFeatures, (d) => borderKey(d))
      .join('text')
      .attr('class', 'border-label')
      .attr('x', (d) => projection(borderCentroid(d))?.[0] ?? 0)
      .attr('y', (d) => projection(borderCentroid(d))?.[1] ?? 0)
      .attr('text-anchor', 'middle')
      .attr('font-size', labelFontSize)
      .attr('fill', '#6a5a4a') // 沙石灰金深一档 · spec § 6
      .attr('opacity', 0.75)
      .attr('pointer-events', 'none')
      .attr('display', (d) =>
        geoDistance(center, borderCentroid(d)) > clipAngleRad ? 'none' : null,
      )
      // B-2 · 中文国名（105 名全量映射 · Germany/奥斯曼按 From 年代区分 · 查不到 fallback 原文）
      .text((d) => {
        const props = d.properties as { Name?: string; From?: number } | null;
        return borderDisplayName(props?.Name, props?.From);
      });

    // === M-B2 T4.3 · 迁徙轨迹（borders 之上 · relations/dots 之下）===
    //   已走（currentYear >= arrivalYear）紫实线 opacity 0.55 / 未来紫虚线 '4 3' opacity 0.35
    //   stroke-width 反比 zoom（跟 border dual lever 同思路 · base 1.2 / min 0.7）
    const migrationStrokeW = strokeWidthAtZoom(k, 1.2, 0.7);
    layers.migration
      .selectAll<SVGPathElement, MigrationSegment>('path.migration')
      .data(migrationSegments)
      .join('path')
      .attr('class', 'migration')
      .attr('d', (d) => greatCircleArc(d.from, d.to, projection, 30))
      .attr('fill', 'none')
      .attr('stroke', '#5b3a8c')
      .attr('stroke-width', migrationStrokeW)
      .attr('stroke-dasharray', (d) => (currentYear >= d.arrivalYear ? null : '4 3'))
      .attr('opacity', (d) => (currentYear >= d.arrivalYear ? 0.55 : 0.35))
      .attr('pointer-events', 'none');

    // M-B2 T2.3 · 地理关系连线 arc 渲染（PM 拍 ζ · DR-107 · Q5a/Q6a/Q7a/Q8a）
    //   V1 数据 reality 37 条 person-person arc（35 influences + 1 mentor + 1 friend_collaborator）
    //   默认 #9b8b6f 灰 opacity 0.25 sw 0.5（淡而可见 · 不抢 dot 主角）
    //   hover person → 涉及 arc 临时高亮紫 opacity 0.7 sw 1
    //   click person → 涉及 arc 持久高亮紫 opacity 0.85 sw 1.2
    //   其他 arc（有 focus 但本 arc 不涉及）fade opacity 0.1（让位 focus · 突出叙事）
    //   z-order：在 migration 之后 · dots 之前（arc 不遮 dots · dot pointer-events 优先）
    const rel = relationStyleFns();
    layers.relations
      .selectAll<SVGPathElement, GeoRelation>('path.geo-relation')
      .data(relations, (d) => `${d.fromId}|${d.toId}|${d.type}`)
      .join('path')
      .attr('class', 'geo-relation')
      .attr('data-from', (d) => d.fromId)
      .attr('data-to', (d) => d.toId)
      .attr('d', (d) => greatCircleArc(d.fromLonLat, d.toLonLat, projection))
      .attr('fill', 'none')
      .attr('stroke', rel.stroke)
      .attr('stroke-width', rel.strokeWidth)
      .attr('opacity', rel.opacity)
      .attr('pointer-events', 'none');

    // M-B2 T2.1 · 86 节点完整渲染（V1 = 31 person · event + location backlog）
    // spec § 4.4 5 类节点视觉：
    //   person → 紫 #5b3a8c · M5 主图同色
    //   event  → 橙 #cc6633（V1 数据缺口 · 留 code path · V1+ wire up）
    //   location → 灰 #9b8b6f（V1 数据缺口 · 留 code path · V1+ wire up）
    // T2.1.hotfix · Issue 1 · 背面节点 display:none（great-circle 距离 > clipAngle 隐藏）
    // T2.1.hotfix2-B · dot radius 反比 zoom（治本 PM "圆点比国家大" 痛点）
    // T2.1.hotfix3-2A · dot radius ratio clamp baseR*0.6（PM polish R1 · 防过小看不见）
    //   + 米白 outline stroke（separation 跟底图 · contrast 增）
    // T2.2-F-Q3a · selected person dot 紫圈 indicator（B1 DR-087 复用 · stroke #5b3a8c sw=2）
    // T2.2-F · hover/click handler on dot · update state + re-render
    // Stage 4.2 · keyed join（id）· handler 只在 enter 时 attach 一次（不再每帧重建 DOM + 重挂 handler）
    layers.nodes
      .selectAll<SVGCircleElement, GeoNode>('circle.geo-node')
      .data(nodes, (d) => d.id)
      .join((enter) =>
        enter
          .append('circle')
          .attr('class', (d) => `geo-node geo-node-${d.type}`)
          .attr('data-id', (d) => d.id)
          .on('mouseenter', (_event, d) => {
            if (d.type !== 'person') return;
            hoveredPersonId = d.id;
            renderFocusStyles(); // Stage 4 守卫 · 只刷样式（之前 hover 触发全量几何重投影）
          })
          .on('mouseleave', (_event, d) => {
            if (d.type !== 'person') return;
            if (hoveredPersonId === d.id) {
              hoveredPersonId = null;
              renderFocusStyles();
            }
          })
          .on('click', (event: MouseEvent, d) => {
            if (d.type !== 'person') return;
            event.stopPropagation();
            // toggle · 点同一个取消 / 点另一个切换
            selectedPersonId = selectedPersonId === d.id ? null : d.id;
            renderFocusStyles();
          }),
      )
      .attr('cx', (d) => projection(d.lonLat)?.[0] ?? 0)
      .attr('cy', (d) => projection(d.lonLat)?.[1] ?? 0)
      .attr('r', (d) =>
        dotRadiusAtZoom(
          k,
          d.type === 'person'
            ? DOT_BASE_RADIUS.person
            : d.type === 'event'
              ? DOT_BASE_RADIUS.event
              : DOT_BASE_RADIUS.location,
        ),
      )
      .attr('fill', (d) =>
        d.type === 'person' ? '#5b3a8c' : d.type === 'event' ? '#cc6633' : '#9b8b6f',
      )
      // T2.2-F-Q3a · selected dot 用紫圈 stroke 替换米白 outline · sw=2 视觉跟 B1 DR-087 一致
      .attr('stroke', nodeStrokeFns(dotOutlineW).stroke)
      .attr('stroke-width', nodeStrokeFns(dotOutlineW).strokeWidth)
      .attr('display', (d) => (geoDistance(center, d.lonLat) > clipAngleRad ? 'none' : null));

    renderPersonLabels(projection, k, center, clipAngleRad);
  }

  /** T2.3 ζ focus 样式三元组（render 全量 join 与 renderFocusStyles 共用 · 读 hover/selected closure state） */
  function relationStyleFns(): {
    stroke: (d: GeoRelation) => string;
    strokeWidth: (d: GeoRelation) => number;
    opacity: (d: GeoRelation) => number;
  } {
    const focusPersonId = selectedPersonId ?? hoveredPersonId;
    const hasFocus = focusPersonId !== null;
    const focusIsSelected = selectedPersonId !== null;
    return {
      stroke: (d) => (isRelationInvolved(d, focusPersonId) ? '#5b3a8c' : '#9b8b6f'),
      strokeWidth: (d) => {
        if (isRelationInvolved(d, focusPersonId)) return focusIsSelected ? 1.2 : 1;
        return 0.5;
      },
      opacity: (d) => {
        if (isRelationInvolved(d, focusPersonId)) return focusIsSelected ? 0.85 : 0.7;
        if (hasFocus) return 0.1;
        return 0.25;
      },
    };
  }

  /** T2.2-F-Q3a · selected 紫圈 / 默认米白 outline（render 与 renderFocusStyles 共用） */
  function nodeStrokeFns(outlineW: number): {
    stroke: (d: GeoNode) => string;
    strokeWidth: (d: GeoNode) => number;
  } {
    return {
      stroke: (d) => (d.id === selectedPersonId ? '#5b3a8c' : '#fcfaf6'),
      strokeWidth: (d) => (d.id === selectedPersonId ? 2 : outlineW),
    };
  }

  /**
   * T2.2-F · person 节点名字标签（D+E 混合 · 数据 + zoom + hover/click 三维 visibility）
   *   D zoom threshold：plane mode (k>=4) 默认全显 · 球面 mode (k<4) 默认 hide
   *   E hover/click：任何 zoom 下 hover/selected 都显（且切到含生卒年 Q2 b 格式）
   *   selected 加粗 (font-weight 700 · Q3 a 跟紫圈 dual indicator)
   *   位置：cx + r + 2 紧贴右侧 / italic / 紫 #5b3a8c (Q1 a · Q4 a)
   *   pointer-events none · 不抢 dot hover
   *   Stage 4 · 抽函数 · render（现算几何）与 renderFocusStyles（lastGeom 缓存几何）共用
   */
  function renderPersonLabels(
    projection: GeoProjection,
    k: number,
    center: [number, number],
    clipAngleRad: number,
  ): void {
    const visiblePersonLabels = nodes.filter((d) => {
      if (d.type !== 'person') return false;
      if (d.id === selectedPersonId) return true;
      if (d.id === hoveredPersonId) return true;
      return k >= 4;
    });
    const defaultPersonFontSize = personLabelFontSize(k);
    const personDotR = dotRadiusAtZoom(k, DOT_BASE_RADIUS.person);
    layers.personLabels
      .selectAll<SVGTextElement, GeoNode>('text.person-label')
      .data(visiblePersonLabels, (d) => d.id)
      .join('text')
      .attr('class', 'person-label')
      .attr('data-id', (d) => d.id)
      .attr('x', (d) => (projection(d.lonLat)?.[0] ?? 0) + personDotR + 2)
      .attr('y', (d) => (projection(d.lonLat)?.[1] ?? 0) + 3)
      .attr('text-anchor', 'start')
      .attr('font-style', 'italic')
      .attr('font-size', (d) => {
        // hover/selected 时不论 zoom · clamp min 9px 保最小可读
        const isExpanded = d.id === selectedPersonId || d.id === hoveredPersonId;
        if (isExpanded) return Math.max(9, defaultPersonFontSize);
        return defaultPersonFontSize;
      })
      .attr('font-weight', (d) => (d.id === selectedPersonId ? 700 : 400))
      .attr('fill', '#5b3a8c') // Q1 a · 紫同 dot fill
      .attr('opacity', 0.9)
      .attr('pointer-events', 'none')
      .attr('display', (d) => (geoDistance(center, d.lonLat) > clipAngleRad ? 'none' : null))
      .text((d) => {
        // Q2 b · hover/click 时显含生卒年 "name_zh 1818-1883"
        const isExpanded = d.id === selectedPersonId || d.id === hoveredPersonId;
        if (isExpanded && d.deathYear) {
          return `${d.name_zh} ${d.year ?? ''}-${d.deathYear}`;
        }
        return d.name_zh;
      });
  }

  /**
   * Stage 4 性能守卫（审查 workflow 确认 finding · hover 全量重投影）·
   * hover/click 只改 focus 样式（relation stroke/opacity · dot 紫圈 · person label join）
   * 不重算 projection / border path / graticule / migration（几何全在 lastGeom 缓存里）
   */
  function renderFocusStyles(): void {
    if (!lastGeom) {
      render();
      return;
    }
    const { projection, k, center, clipAngleRad, dotOutlineW } = lastGeom;
    const rel = relationStyleFns();
    layers.relations
      .selectAll<SVGPathElement, GeoRelation>('path.geo-relation')
      .attr('stroke', rel.stroke)
      .attr('stroke-width', rel.strokeWidth)
      .attr('opacity', rel.opacity);
    const nodeFns = nodeStrokeFns(dotOutlineW);
    layers.nodes
      .selectAll<SVGCircleElement, GeoNode>('circle.geo-node')
      .attr('stroke', nodeFns.stroke)
      .attr('stroke-width', nodeFns.strokeWidth);
    renderPersonLabels(projection, k, center, clipAngleRad);
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
    refresh(): void {
      // Stage 4 守卫 2 配套 · 隐藏期状态已更新 · 这里补一次完整渲染（不 animate · 用户没看过中间态）
      // 没有 pending（隐藏期间无 time-change）就跳过 · swap 来回切不重复渲染
      if (!pendingRender) return;
      pendingRender = false;
      render();
    },
    destroy(): void {
      window.removeEventListener('marx:time-change', timeHandler);
      svg.on('wheel', null); // T1.6+++++ · detach 自挂 wheel handler · 防 memory leak / stale closure
      svg.on('.zoom', null); // Stage 4 · destroy 对仗 · detach d3-zoom 全部 namespaced listener
      svg.on('.drag', null); // Stage 4 · destroy 对仗 · detach d3-drag mousedown listener
      g.remove();
    },
  };
}
