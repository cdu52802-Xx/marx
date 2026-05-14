// M5 主线 A · T4 · 居中飞行算法
// spec § 7.3 单击 obs 同时居中 + 详情卡 · DR-017 · 居中算法 offset 详情卡宽度
//
// 核心数学：
//   visibleCenterX = (viewport.width - sidebar - popover) / 2 + sidebar
//     = 可见区（屏幕减去 sidebar + popover 后）的横向中点 / 用屏幕坐标表达
//   visibleCenterY = viewport.height / 2
//     = 屏幕纵向中点（header / timeline 上下 padding 让 SVG fill 区域跟 viewport 一致 / 简化处理）
//
//   目标 transform 让画布坐标 (target.x, target.y) 飞到 visibleCenter（屏幕坐标）:
//     transform.k = max(targetK, currentK)  // 已经 zoom in 时不缩小
//     transform.x = visibleCenterX - target.x * k
//     transform.y = visibleCenterY - target.y * k
//
//   flyToTarget = 调 d3 transition 应用 [k, x, y] / 600ms cubic-in-out / spec § 4.1
import * as d3 from 'd3';
import type { ZoomBehavior, ZoomTransform } from 'd3-zoom';
import type { Selection } from 'd3-selection';

export interface CenterParams {
  target: { x: number; y: number };
  targetK: number;
  /**
   * 如果 currentK > targetK 则保持 currentK（不缩小 / 用户已经 zoom in 不破坏）
   * 不传则用 targetK
   */
  currentK?: number;
  viewport: { width: number; height: number };
  sidebarWidth: number;
  popoverWidth: number;
}

export interface CenterTransform {
  k: number;
  x: number;
  y: number;
}

export function computeCenterTransform(p: CenterParams): CenterTransform {
  const k = p.currentK && p.currentK > p.targetK ? p.currentK : p.targetK;
  const visibleCenterX = (p.viewport.width - p.sidebarWidth - p.popoverWidth) / 2 + p.sidebarWidth;
  const visibleCenterY = p.viewport.height / 2;
  return {
    k,
    x: visibleCenterX - p.target.x * k,
    y: visibleCenterY - p.target.y * k,
  };
}

export function flyToTarget(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  svg: Selection<SVGSVGElement, unknown, any, any>,
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>,
  transform: CenterTransform,
  duration = 600,
): void {
  const t: ZoomTransform = d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k);
  // duration === 0 → 直接 set / 跳 transition（jsdom + 即刻 set 场景）
  if (duration === 0) {
    zoomBehavior.transform(svg, t);
    return;
  }
  svg.transition().duration(duration).ease(d3.easeCubicInOut).call(zoomBehavior.transform, t);
}
