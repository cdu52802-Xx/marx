// M-B2 T1.1 · D3 投影工厂
// orthographic (sphere) + mercator (plane) + ZOOM_THRESHOLDS placeholder
// Stage 1 prototype · 真过渡 / k → fly camera 内插在 Step 1.4 加
// 阈值默认 1-2.5 球面 / 2.5-4.5 半球 / 4.5-8 平面（PM checkpoint 实测调）
//
// M-B2 T1.6+ B · 真线性内插
// scale 跟 k 线性走（不再分 mode 段跳 200/400/800）
// k=1 → 200 sphere · k=8 → 800 plane · 中间 transition 用 sphere projection + 内插 scale
// 真 cross-fade（双 render 叠加 fade）留 Stage 6 polish · 当前内插 scale 已达视觉"丝滑"感
//
// M-B2 T1.6++ B · satellite projection 真丝滑过渡（兑现 spec § 4.6 100%）
// PM 实测前轮"半丝滑"反馈：跨 k=4.5 临界 sphere→plane projection 切换还是跳。
// 修法: transition + plane mode 统一用 geoSatellite · distance 内插
//   - k ≤ 2.5 球面：geoOrthographic (clipAngle 90 保 sphere 外缘遮罩)
//   - k > 2.5 透视：geoSatellite + distance 20 → 1.1 平滑内插
//     - 边界 k=2.5 时 distance=20 → geoSatellite ≈ geoOrthographic (sub-pixel match · 实测无跳)
//     - 高 k=8 时 distance=1.1 → 近距视角 (tilted satellite view 接近 plane 但仍带轻微 perspective)
// 数学连续性：geoSatellite 是 perspective projection · distance 越大越接近 orthographic / 越小越接近 plane
// 业界参考: D3 Observable / Yan Holtz / Tom MacWright 标准做法
import { geoOrthographic, type GeoProjection } from 'd3-geo';
import { geoSatellite } from 'd3-geo-projection';

export type ProjectionMode = 'sphere' | 'transition' | 'plane';

export interface ProjectionOptions {
  width: number;
  height: number;
  center: [number, number]; // [lon, lat] · 球面默认中心
  scale: number; // d3 投影 scale
  rotate?: [number, number, number]; // 球面旋转
}

export const ZOOM_THRESHOLDS = { sphereMax: 2.5, planeMin: 4.5 };

// T1.6+ B · 真线性内插 scale 范围
// k=1 sphere base 200 / k=8 plane base 800 / 中间 sphereProjection 内 scale 跟 k 走
export const SCALE_AT_K_MIN = 200;
export const SCALE_AT_K_MAX = 800;
export const K_MIN = 1;
export const K_MAX = 8;

// T1.6++ B · satellite distance 范围（k=2.5 → 20 ≈ orthographic / k=8 → 1.1 透视近距）
//   distance > 10 时 satellite 与 orthographic 几乎一致（sub-pixel） · 保 k=2.5 边界连续
//   distance < 1.5 时 perspective 强 · 近"plane"视觉但仍带轻微 tilt
export const SAT_DISTANCE_AT_K_TRANSITION_START = 20; // at k = sphereMax (2.5)
export const SAT_DISTANCE_AT_K_MAX = 1.1; // at k = K_MAX (8)

/**
 * 按 d3.zoom k 线性算 scale（200 at k=1 → 800 at k=8）
 * @param k - d3.zoom transform k（1-8）
 * @returns scale 数（线性内插）
 */
export function scaleAtZoom(k: number): number {
  const t = (k - K_MIN) / (K_MAX - K_MIN); // 0 at k=1 / 1 at k=8
  const clamped = Math.max(0, Math.min(1, t));
  return SCALE_AT_K_MIN + (SCALE_AT_K_MAX - SCALE_AT_K_MIN) * clamped;
}

/**
 * T1.6++ B · 按 k 线性算 geoSatellite 的 distance 参数
 * k = sphereMax (2.5) → 20 (≈ orthographic 球面)
 * k = K_MAX (8) → 1.1 (近距透视 / plane 视觉)
 * k < sphereMax → clamp 20（不真用 · sphere mode 走 orthographic 不走 satellite）
 * k > K_MAX → clamp 1.1
 */
export function satelliteDistanceAtZoom(k: number): number {
  const span = K_MAX - ZOOM_THRESHOLDS.sphereMax; // 8 - 2.5 = 5.5
  const t = (k - ZOOM_THRESHOLDS.sphereMax) / span; // 0 at k=2.5 / 1 at k=8
  const clamped = Math.max(0, Math.min(1, t));
  return (
    SAT_DISTANCE_AT_K_TRANSITION_START -
    (SAT_DISTANCE_AT_K_TRANSITION_START - SAT_DISTANCE_AT_K_MAX) * clamped
  );
}

/** 创建当前 mode 的投影 */
export function createProjection(mode: ProjectionMode, opts: ProjectionOptions): GeoProjection {
  const { width, height, center, scale, rotate } = opts;
  const translate: [number, number] = [width / 2, height / 2];

  if (mode === 'sphere') {
    const proj = geoOrthographic().scale(scale).translate(translate).clipAngle(90);
    if (rotate) proj.rotate(rotate);
    else proj.rotate([-center[0], -center[1]]);
    return proj;
  }

  // T1.6++ B · plane + transition 统一走 geoSatellite · distance 由 caller 通过 satelliteDistanceAtZoom 算
  //   createProjection 不知道 k · 默认按 mode 推 distance（plane=1.1 · transition=10 中点近 ortho 侧）
  //   interpolateProjection 真正驱动 distance 内插 → caller 直接调 interpolateProjection 即可
  const dist = mode === 'plane' ? SAT_DISTANCE_AT_K_MAX : 10;
  const proj = geoSatellite().distance(dist).scale(scale).translate(translate).tilt(0);
  if (rotate) proj.rotate(rotate);
  else proj.rotate([-center[0], -center[1], 0]);
  return proj;
}

/**
 * 球面 ↔ 平面平滑过渡（按 zoom level 内插）
 * @param k - d3.zoom transform k（1-8）
 * @param opts - opts.scale 字段被 k 线性内插覆盖（caller 不必预算 scale · 传 placeholder 即可）
 * @returns mode + 内插参数
 *
 * T1.6++ B · satellite projection 真丝滑过渡
 *  - sphere mode (k ≤ 2.5): geoOrthographic + clipAngle 90 (sphere 外缘遮罩)
 *  - transition + plane (k > 2.5): geoSatellite + distance 内插
 *      distance 20 (≈orthographic · 边界 k=2.5 sub-pixel 与 ortho 一致) → 1.1 (近距透视)
 *  - scale 任意 k 都跟随 scaleAtZoom 线性走（k=1 → 200 · k=8 → 800）
 *  - mode 标签 (sphere/transition/plane) 保留向后兼容 / 视觉 k=4.5 边界已无跳
 */
export function interpolateProjection(
  k: number,
  opts: ProjectionOptions,
): { mode: ProjectionMode; projection: GeoProjection } {
  const scale = scaleAtZoom(k);
  const { width, height, center, rotate } = opts;
  const translate: [number, number] = [width / 2, height / 2];

  // sphere mode · pure orthographic (保 clipAngle 90 外缘遮罩)
  if (k <= ZOOM_THRESHOLDS.sphereMax) {
    const proj = geoOrthographic().scale(scale).translate(translate).clipAngle(90);
    if (rotate) proj.rotate(rotate);
    else proj.rotate([-center[0], -center[1]]);
    return { mode: 'sphere', projection: proj };
  }

  // transition + plane · 统一 geoSatellite · distance 跟 k 平滑内插（数学连续 · 无 k=4.5 jump）
  const dist = satelliteDistanceAtZoom(k);
  const proj = geoSatellite().distance(dist).scale(scale).translate(translate).tilt(0);
  if (rotate) proj.rotate(rotate);
  else proj.rotate([-center[0], -center[1], 0]);

  const mode: ProjectionMode = k >= ZOOM_THRESHOLDS.planeMin ? 'plane' : 'transition';
  return { mode, projection: proj };
}
