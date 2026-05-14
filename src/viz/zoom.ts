// M5 主线 A · T1 · D3 zoom behavior 工厂
// spec § 9.1 + § 7.1 滚轮 zoom + § 7.2 pan + DR-014 主线 A
//
// 设计要点：
//   - createZoom 工厂返回 ZoomController（zoomBehavior / getCurrentTransform / programmaticZoom）
//   - zoom event 自动应用 transform 到 svg 下 g.zoom-layer（main.ts 包裹过）
//   - onZoom callback 给 main.ts 同步 timeline 视觉范围条 + zoom-control 比例 display
//   - scaleExtent [1, 8] PRD V1 设定
//   - T2 会加 contentBBox option → translateExtent pan clamp
//   - T9 会加 reset() API
import * as d3 from 'd3';
import type { Selection } from 'd3-selection';
import type { ZoomBehavior, ZoomTransform } from 'd3-zoom';

export interface ZoomOptions {
  scaleExtent: [number, number];
  onZoom?: (transform: ZoomTransform) => void;
}

export interface ZoomController {
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>;
  getCurrentTransform(): ZoomTransform;
  programmaticZoom(targetK: number, duration?: number): void;
}

export function createZoom(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  svg: Selection<SVGSVGElement, unknown, any, any>,
  opts: ZoomOptions,
): ZoomController {
  const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent(opts.scaleExtent)
    .on('zoom', (event) => {
      const t = event.transform as ZoomTransform;
      // 应用 transform 到 zoom-layer（main.ts 必须先包裹 <g class="zoom-layer">）
      svg.select('g.zoom-layer').attr('transform', t.toString());
      if (opts.onZoom) opts.onZoom(t);
    });

  svg.call(zoomBehavior);

  return {
    zoomBehavior,
    getCurrentTransform: () => d3.zoomTransform(svg.node()!),
    programmaticZoom: (targetK, duration = 600) => {
      svg
        .transition()
        .duration(duration)
        .call(zoomBehavior.scaleTo, targetK);
    },
  };
}
