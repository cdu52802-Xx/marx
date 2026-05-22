// M-B2 T1.1 · D3 投影工厂
// orthographic (sphere) + mercator (plane) + ZOOM_THRESHOLDS placeholder
// Stage 1 prototype · 真过渡 / k → fly camera 内插在 Step 1.4 加
// 阈值默认 1-2.5 球面 / 2.5-4.5 半球 / 4.5-8 平面（PM checkpoint 实测调）
//
// M-B2 T1.6+ B · 真线性内插
// scale 跟 k 线性走（不再分 mode 段跳 200/400/800）
// k=1 → 200 sphere · k=8 → 800 plane · 中间 transition 用 sphere projection + 内插 scale
// 真 cross-fade（双 render 叠加 fade）留 Stage 6 polish · 当前内插 scale 已达视觉"丝滑"感

import { geoOrthographic, geoMercator, type GeoProjection } from 'd3-geo';

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

  // plane / transition · transition zone 暂用 plane 之外 / interpolate 处单独占位
  return geoMercator().scale(scale).translate(translate).center(center);
}

/**
 * 球面 ↔ 平面平滑过渡（按 zoom level 内插）
 * @param k - d3.zoom transform k（1-8）
 * @param opts - opts.scale 字段被 k 线性内插覆盖（caller 不必预算 scale · 传 placeholder 即可）
 * @returns mode + 内插参数
 *
 * T1.6+ B · 真线性内插 scale
 *  - sphere mode (k ≤ 2.5): scale 跟 k 走（k=1 → 200 · k=2.5 → 285.7）
 *  - plane mode (k ≥ 4.5): scale 跟 k 走（k=4.5 → 500 · k=8 → 800）
 *  - transition zone (2.5 < k < 4.5): 用 sphere projection（保持球面感）+ scale 跟 k 走
 *    真 cross-fade 留 Stage 6 polish · 当前 scale 平滑已达"丝滑"视觉
 */
export function interpolateProjection(
  k: number,
  opts: ProjectionOptions,
): { mode: ProjectionMode; projection: GeoProjection } {
  const scale = scaleAtZoom(k);
  const optsWithScale = { ...opts, scale };

  if (k <= ZOOM_THRESHOLDS.sphereMax) {
    return { mode: 'sphere', projection: createProjection('sphere', optsWithScale) };
  }
  if (k >= ZOOM_THRESHOLDS.planeMin) {
    return { mode: 'plane', projection: createProjection('plane', optsWithScale) };
  }
  // transition zone · 用 sphere projection 保持球面感 + scale 跟 k 走（视觉连续）
  return { mode: 'transition', projection: createProjection('sphere', optsWithScale) };
}
