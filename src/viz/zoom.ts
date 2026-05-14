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
  /**
   * T2 · pan boundary clamp · 外 5% padding 自动加
   * 不传 = 无限 pan（d3 默认）
   * 传 = translateExtent 设为 [bbox - 5% padding, bbox + 5% padding]
   */
  contentBBox?: { x: number; y: number; width: number; height: number };
  onZoom?: (transform: ZoomTransform) => void;
}

const PAN_PADDING_RATIO = 0.05;

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
  const zoomBehavior = d3.zoom<SVGSVGElement, unknown>().scaleExtent(opts.scaleExtent);

  // T2 · pan boundary clamp 外 5% padding
  if (opts.contentBBox) {
    const padX = opts.contentBBox.width * PAN_PADDING_RATIO;
    const padY = opts.contentBBox.height * PAN_PADDING_RATIO;
    zoomBehavior.translateExtent([
      [opts.contentBBox.x - padX, opts.contentBBox.y - padY],
      [
        opts.contentBBox.x + opts.contentBBox.width + padX,
        opts.contentBBox.y + opts.contentBBox.height + padY,
      ],
    ]);
  }

  zoomBehavior.on('zoom', (event) => {
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
      // duration === 0 → 直接 set 不走 transition（jsdom 测试 + 即刻应用场景）
      if (duration === 0) {
        zoomBehavior.scaleTo(svg, targetK);
        return;
      }
      svg.transition().duration(duration).call(zoomBehavior.scaleTo, targetK);
    },
  };
}
