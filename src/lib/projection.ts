// M-B2 T1.1 · D3 投影工厂
// orthographic (sphere) + mercator (plane) + ZOOM_THRESHOLDS placeholder
// Stage 1 prototype · 真过渡 / k → fly camera 内插在 Step 1.4 加
// 阈值默认 1-2.5 球面 / 2.5-4.5 半球 / 4.5-8 平面（PM checkpoint 实测调）

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
 * @returns mode + 内插参数
 */
export function interpolateProjection(
  k: number,
  opts: ProjectionOptions,
): { mode: ProjectionMode; projection: GeoProjection } {
  if (k <= ZOOM_THRESHOLDS.sphereMax) {
    return { mode: 'sphere', projection: createProjection('sphere', opts) };
  }
  if (k >= ZOOM_THRESHOLDS.planeMin) {
    return { mode: 'plane', projection: createProjection('plane', opts) };
  }
  // transition zone · 暂用 sphere 占位 / Step 1.4 加真过渡
  return { mode: 'transition', projection: createProjection('sphere', opts) };
}
