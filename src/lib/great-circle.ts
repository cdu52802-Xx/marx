// M-B2 T1.2 · great circle arc 计算
// 算法：geoInterpolate sample N 个球面内插点 / projection 转 pixel / d3 line 串起来
// spec § 4.6 缩放谱系：关系连线在球面 = great circle 大圆弧 / 平面 = 投影曲线
// 默认 50 sample · 平衡精度 vs 性能（M-B1 polish 实测够细）

import { geoInterpolate, type GeoProjection } from 'd3-geo';
import { line } from 'd3-shape';

/**
 * 计算两地点之间的 great circle path（球面贴球面大圆弧 / 平面投影为曲线）
 * @param from - 起点 [lon, lat]
 * @param to - 终点 [lon, lat]
 * @param projection - d3 GeoProjection（orthographic / mercator / ...）
 * @param samples - 内插点数 / 默认 50
 * @returns SVG path d 属性（M x,y L x,y L ...）
 */
export function greatCircleArc(
  from: [number, number],
  to: [number, number],
  projection: GeoProjection,
  samples: number = 50,
): string {
  const interp = geoInterpolate(from, to);
  const points: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const lonLat = interp(t);
    const pixel = projection(lonLat);
    if (pixel) points.push(pixel);
  }
  const pathGen = line<[number, number]>()
    .x((p) => p[0])
    .y((p) => p[1]);
  return pathGen(points) ?? '';
}
