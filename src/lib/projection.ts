// M-B2 T1.1 · D3 投影工厂
// orthographic (sphere) + mercator (plane) + ZOOM_THRESHOLDS placeholder
// Stage 1 prototype · 真过渡 / k → fly camera 内插在 Step 1.4 加
// 阈值默认 1-2.5 球面 / 2.5-4.5 半球 / 4.5-8 平面（PM checkpoint 实测调）
//
// M-B2 T1.6+ B · 真线性内插
// scale 跟 k 线性走（不再分 mode 段跳 200/400/800）
// k=1 → 200 sphere · k=8 → 800 plane · 中间 transition 用 sphere projection + 内插 scale
//
// M-B2 T1.6++ B · satellite projection 真丝滑过渡（兑现 spec § 4.6 100%）
//
// M-B2 T1.6+++ · plane 回 mercator（PM 实测反馈第三轮 "satellite distance→1.1 球更鼓"）
//   sphere=orthographic / transition=satellite / plane=mercator 三段
//
// M-B2 T1.6+++++ · Issue 1 修法 B · 全程 geoSatellite（PM 实测第五轮反馈跨 k=4.5 生硬 jump）
//   根因：mercator 跟 satellite 数学完全不同族（圆柱 vs 方位）· 跨界 (x, y) 坐标必不重合 · jump 不可解
//   修法：全程 geoSatellite · distance 单参数线性内插 50→2 · clipAngle 自适应 acos(1/distance)
//     - k=1 distance=50 视觉 ≈ orthographic 球面（差异 <1%）
//     - k=8 distance=2 视觉 ≈ mercator look（fisheye 极弱）
//     - 任意 k 同一 projection · 真丝滑 · 无 jump
//   ProjectionMode 概念**仍保留**给 component 层 dispatch drag 行为（sphere rotate vs transition/plane pan center）
//     · projection 层不再用 mode 选 projection
import { type GeoProjection } from 'd3-geo';
import { geoSatellite } from 'd3-geo-projection';

export type ProjectionMode = 'sphere' | 'transition' | 'plane';

export interface ProjectionOptions {
  width: number;
  height: number;
  center: [number, number]; // [lon, lat] · 球面默认中心
  scale: number; // d3 投影 scale
  rotate?: [number, number, number]; // 球面旋转
}

// ZOOM_THRESHOLDS · 仅 component 层 dispatch drag mode 用（sphere rotate vs transition/plane pan center）
// projection 层全程 satellite distance 内插 · 不再用 sphereMax/planeMin 选 projection 分支（T1.6+++++）
export const ZOOM_THRESHOLDS = { sphereMax: 2.5, planeMin: 4.5 };

// T1.6+ B · 真线性内插 scale 范围
// T2.1.hotfix · Issue 3 · 扩 K_MAX 8→16 / scale 800→1600 让 PM 看清欧洲国家细节
// T2.1.hotfix2-A · 继续扩 K_MAX 16→32 / scale 1600→3200 看清单国家级别（比利时/卢森堡/Andorra）
//   PM 拍 A · 学 Google Maps zoom 极深方向 · K_DISTANCE_PLATEAU=8 不变（distance 已稳）
//   拒切 Leaflet/Mapbox tile pyramid 真 Google Maps 方案（V2 大决策 · prototype 不做）
//   viewport k=32 显示约 5°×3.5°（比利时单国级别）
export const SCALE_AT_K_MIN = 200;
export const SCALE_AT_K_MAX = 3200;
export const K_MIN = 1;
export const K_MAX = 32;

// T2.1.hotfix · Issue 3 · distance plateau 起点（k >= K_DISTANCE_PLATEAU 时 distance 固定 SAT_DISTANCE_AT_K_MAX）
//   第一性原理：相机距地球已"接近平面" (distance=2) / 用户继续放大 = 看地面细节 (scale 翻倍)
//   不需要镜头更近 (distance < 2 会撞 fisheye + 既往 "放大不能拖" bug)
//   k=[1, 8] 区间：sphere → plane 视觉过渡（distance 50→2）
//   k=[8, 16] 区间：plane plateau · distance 保持 2 · scale 继续放大（看地面细节）
export const K_DISTANCE_PLATEAU = 8;

// T1.6+++++ · 全程 satellite distance 范围（Issue 1 修法 B · PM 拍板 B 全程不切 mercator）
//   k=1 → 50（≈ orthographic 球面视觉 / 数学 ≈ 远距 satellite）
//   k=K_DISTANCE_PLATEAU (8) → 2 （≈ mercator look · plateau 起点 · 不再继续变小）
//   跨任意 k 同一 projection · 真丝滑 · 无 jump
export const SAT_DISTANCE_AT_K_MIN = 50; // at k=1
export const SAT_DISTANCE_AT_K_MAX = 2; // at k >= K_DISTANCE_PLATEAU (plateau)

/**
 * 按 d3.zoom k 线性算 scale（200 at k=1 → 800 at k=8）
 */
export function scaleAtZoom(k: number): number {
  const t = (k - K_MIN) / (K_MAX - K_MIN); // 0 at k=1 / 1 at k=8
  const clamped = Math.max(0, Math.min(1, t));
  return SCALE_AT_K_MIN + (SCALE_AT_K_MAX - SCALE_AT_K_MIN) * clamped;
}

/**
 * T2.1.hotfix · Issue 3 修法 · distance plateau · k>=K_DISTANCE_PLATEAU 时固定 SAT_DISTANCE_AT_K_MAX
 *   k=1 → 50（球面视觉）· k=8 (K_DISTANCE_PLATEAU) → 2（近平面视觉 · plateau 起点）· k>8 → 2 (plateau)
 *   k<1 clamp 50（防越界）
 *   第一性：相机距离已"接近平面" / 用户继续放大 = scale 放大看地面细节 / 不需要镜头更近
 */
export function satelliteDistanceAtZoom(k: number): number {
  const t = (k - K_MIN) / (K_DISTANCE_PLATEAU - K_MIN); // 0 at k=1 / 1 at k=K_DISTANCE_PLATEAU
  const clamped = Math.max(0, Math.min(1, t));
  return SAT_DISTANCE_AT_K_MIN - (SAT_DISTANCE_AT_K_MIN - SAT_DISTANCE_AT_K_MAX) * clamped;
}

/**
 * T1.6+++++ · clipAngle 自适应 distance
 *   satellite projection 可视球面半径 = acos(1/distance)
 *   distance=50 → clipAngle ≈ 88.85°（≈ orthographic 半球 view）
 *   distance=2 → clipAngle = 60°（局部平面视角）
 *   D3 标准做法（Mike Bostock satellite example）
 */
function clipAngleForDistance(distance: number): number {
  return (Math.acos(1 / distance) * 180) / Math.PI;
}

/**
 * T2.1.hotfix2-B · dot radius 反比 zoom（治本 PM "圆点比国家大" 痛点）
 *   第一性：用户视觉 "圆点占地图百分比" 不能随 zoom 暴涨
 *   选根号公式 baseR / sqrt(max(2, k) / 2):
 *     - clamp k<2 plateau（球面 mode 节点是主角 / 保持醒目）
 *     - k>=2 后缩小（plane mode 让位国家细节）
 *   T2.1.hotfix3-2A · 加 ratio clamp baseR*0.6（PM polish R1 拍板）
 *     第一性反思：plane mode 节点仍是用户主角（看哪些哲学家在哪国）· 不该缩到看不见
 *     min clamp 保 visibility · 同时不破"防 cover 整个小国"原意（min 仍小于 baseR）
 *     k=1/2: 5px（plateau）/ k=4: 3.54px / k=8: max(3, 2.5)=3 / k=32: max(3, 1.25)=3
 *     person baseR=5 → min 3px / event baseR=4 → min 2.4px / location baseR=3 → min 1.8px
 *   拒线性 1/k（朋友 philosophy_vis K=8 OK · 我们 K=32 用线性 = 0.156px 不可见）
 */
export function dotRadiusAtZoom(k: number, baseR: number): number {
  const effectiveK = Math.max(2, k);
  return Math.max(baseR * 0.6, baseR / Math.sqrt(effectiveK / 2));
}

/**
 * T2.1.hotfix3-1A · stroke width 反比 zoom 加绝对值 min clamp（防 sub-pixel rendering 稀释）
 *   第一性：SVG sub-pixel stroke (< 1px) antialiasing alpha 严重稀释 · 视觉颜色 ≈ alpha=stroke-width
 *     k=32 时原 baseR/sqrt(16)=0.125px → 视觉 alpha 0.125 → "看不见边界"（PM polish R1 反馈）
 *   修法：加绝对值 minAbs 参数 · 不同视觉权重场景用不同 min
 *     border path：minAbs=0.6（用户当下信息焦点 · 必须 visible）
 *     graticule：minAbs=0.6（视觉风格跟 border 一致）
 *     dot outline：minAbs=0.3（米白底 separation 作用 · 不喧宾夺主）
 *   公式跟 dotRadius 同根号 · 但 clamp 用绝对值不是 ratio（stroke 是绝对像素值 / 不像 dot 跟 baseR 线性）
 */
export function strokeWidthAtZoom(k: number, baseW: number, minAbs: number): number {
  const effectiveK = Math.max(2, k);
  return Math.max(minAbs, baseW / Math.sqrt(effectiveK / 2));
}

/**
 * T2.1.hotfix3-1A · border stroke 颜色 zoom-adaptive（dual lever 跟 strokeWidth 同步上）
 *   第一性：底图（border + graticule）在不同 zoom 阶段承担不同视觉角色
 *     - sphere mode (k<4 整地球 view)：节点是主角 / 国界淡淡 → 保 #d8cab0 沙石灰金（spec § 6）
 *     - plane mode (k>=4 看国家细节)：国界是用户当下信息焦点 → 加深 #b8a880 沙石深一档
 *   spec § 6 描述了底色风格 · 未规定 zoom-adaptive 视觉权重 · 本修法是 spec 补充不是违背
 *   PM polish R1 反馈 "国境/分区边界线颜色太浅了" / 跟 strokeWidth clamp 是 dual lever
 */
export function borderStrokeColor(k: number): string {
  return k >= 4 ? '#b8a880' : '#d8cab0';
}

/**
 * T2.1.hotfix2-C · 国名标签 zoom threshold
 *   k<4 球面阶段：不显标签（视觉过载 + 节点本身是主角 + 球面背面遮一半）
 *   k>=4 平面阶段：显标签（信息密度真增 / 用户辨识 CShapes 历史国界 1843 普鲁士/奥地利等）
 *   threshold=4 选址：cross 球面→平面过渡中段（ZOOM_THRESHOLDS.transition→plane = 4.5 边界附近）
 */
export function shouldShowBorderLabels(k: number): boolean {
  return k >= 4;
}

/**
 * T2.1.hotfix2-C · 国名标签字体大小跟 zoom 走
 *   k=4: 8px（threshold 起点 · 不喧宾夺主）
 *   k>=8: 12px（plane mode 信息密度 max · 仍小于节点 dot radius 视觉层级）
 *   中间线性 lerp · k<4 返 0（caller 应先 check shouldShowBorderLabels）
 */
export function borderLabelFontSize(k: number): number {
  if (k < 4) return 0;
  const t = Math.min(1, (k - 4) / 4);
  return 8 + 4 * t;
}

/**
 * 创建当前 mode 的投影（兼容 setMode API · 全 satellite · mode 仅映射到默认 k）
 *   sphere → k=1 / plane → k=8 / transition → k=(1+8)/2=4.5
 */
export function createProjection(mode: ProjectionMode, opts: ProjectionOptions): GeoProjection {
  const { width, height, center, scale, rotate } = opts;
  const translate: [number, number] = [width / 2, height / 2];

  const k = mode === 'sphere' ? K_MIN : mode === 'plane' ? K_MAX : (K_MIN + K_MAX) / 2;
  const distance = satelliteDistanceAtZoom(k);
  const clipAngle = clipAngleForDistance(distance);

  const proj = geoSatellite()
    .distance(distance)
    .scale(scale)
    .translate(translate)
    .tilt(0)
    .clipAngle(clipAngle);
  if (rotate) proj.rotate(rotate);
  else proj.rotate([-center[0], -center[1], 0]);
  return proj;
}

/**
 * T1.6+++++ · Issue 1 修法 B · 全程 geoSatellite · distance + clipAngle 单参数内插
 *   不再分 sphere/transition/plane 三段（projection 层）· 同一 projection · 真丝滑
 *   - scale 跟 scaleAtZoom 线性走（200→800）
 *   - distance 跟 satelliteDistanceAtZoom 线性走（50→2）
 *   - clipAngle 跟 distance 走（88.85°→60°）
 *   mode 字段仅给 component 层用（dispatch drag · 区分 sphere rotate vs transition/plane pan）
 */
export function interpolateProjection(
  k: number,
  opts: ProjectionOptions,
): { mode: ProjectionMode; projection: GeoProjection } {
  const { width, height, center, rotate } = opts;
  const translate: [number, number] = [width / 2, height / 2];

  const scale = scaleAtZoom(k);
  const distance = satelliteDistanceAtZoom(k);
  const clipAngle = clipAngleForDistance(distance);

  const proj = geoSatellite()
    .distance(distance)
    .scale(scale)
    .translate(translate)
    .tilt(0)
    .clipAngle(clipAngle);
  if (rotate) proj.rotate(rotate);
  else proj.rotate([-center[0], -center[1], 0]);

  const mode: ProjectionMode =
    k <= ZOOM_THRESHOLDS.sphereMax
      ? 'sphere'
      : k >= ZOOM_THRESHOLDS.planeMin
        ? 'plane'
        : 'transition';

  return { mode, projection: proj };
}
