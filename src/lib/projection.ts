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
export const SCALE_AT_K_MIN = 200;
export const SCALE_AT_K_MAX = 800;
export const K_MIN = 1;
export const K_MAX = 8;

// T1.6+++++ · 全程 satellite distance 范围（Issue 1 修法 B · PM 拍板 B 全程不切 mercator）
//   k=1 → 50（≈ orthographic 球面视觉 / 数学 ≈ 远距 satellite）
//   k=8 → 2 （≈ mercator look / fisheye 极弱）
//   跨任意 k 同一 projection · 真丝滑 · 无 jump
export const SAT_DISTANCE_AT_K_MIN = 50; // at k=1
export const SAT_DISTANCE_AT_K_MAX = 2; // at k=8

/**
 * 按 d3.zoom k 线性算 scale（200 at k=1 → 800 at k=8）
 */
export function scaleAtZoom(k: number): number {
  const t = (k - K_MIN) / (K_MAX - K_MIN); // 0 at k=1 / 1 at k=8
  const clamped = Math.max(0, Math.min(1, t));
  return SCALE_AT_K_MIN + (SCALE_AT_K_MAX - SCALE_AT_K_MIN) * clamped;
}

/**
 * T1.6+++++ · Issue 1 修法 B · 全程线性内插 distance（50 at k=1 → 2 at k=8）
 *   k<1 clamp 50 · k>8 clamp 2
 */
export function satelliteDistanceAtZoom(k: number): number {
  const t = (k - K_MIN) / (K_MAX - K_MIN); // 0 at k=1 / 1 at k=8
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
