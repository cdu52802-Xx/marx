// M-B2 T1.6++ B · d3-geo-projection ambient declaration
// 库本身无 @types/d3-geo-projection（社区缺）· 仅声明 V1 用到的 geoSatellite
// API 来源：https://github.com/d3/d3-geo-projection/blob/main/README.md#geoSatellite
// geoSatellite() 返回 d3-geo GeoProjection · 多 .distance() / .tilt() / .clipAngle() 等链式 setter
declare module 'd3-geo-projection' {
  import type { GeoProjection } from 'd3-geo';

  interface GeoSatelliteProjection extends GeoProjection {
    /**
     * distance from the center of the sphere to the projection point (in units of sphere radius)
     * default: 2.0 · 必须 > 1（透视点不能在球内）· 越大越接近 orthographic
     */
    distance(): number;
    distance(distance: number): this;
    /**
     * Tilt of camera from vertical axis (degrees) · default: 0
     * tilt 0 = 正对 / tilt > 0 = 倾斜俯视
     */
    tilt(): number;
    tilt(tilt: number): this;
  }

  export function geoSatellite(): GeoSatelliteProjection;
}
