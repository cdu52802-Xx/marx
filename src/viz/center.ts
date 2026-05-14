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
  /**
   * Stage 2 PM checkpoint Issue 2.1 修：屏幕固定 header 高度（默认 0 / Marx 项目 70px）
   * Y 居中算法用：visibleCenterY = headerHeight + (viewport.height - headerHeight - timelineHeight) / 2
   * 不传则不偏移（视为 viewport.height 全是可见区）
   */
  headerHeight?: number;
  /**
   * Stage 2 PM checkpoint Issue 2.1 修：屏幕固定底部 timeline 高度（默认 0 / Marx 项目 160px）
   */
  timelineHeight?: number;
}

export interface CenterTransform {
  k: number;
  x: number;
  y: number;
}

export function computeCenterTransform(p: CenterParams): CenterTransform {
  const k = p.currentK && p.currentK > p.targetK ? p.currentK : p.targetK;
  const headerHeight = p.headerHeight ?? 0;
  const timelineHeight = p.timelineHeight ?? 0;
  const visibleCenterX = (p.viewport.width - p.sidebarWidth - p.popoverWidth) / 2 + p.sidebarWidth;
  // Stage 2 Issue 2.1 修：Y 居中算可见区（header / timeline 占用屏幕固定 padding）
  const visibleCenterY = headerHeight + (p.viewport.height - headerHeight - timelineHeight) / 2;
  return {
    k,
    x: visibleCenterX - p.target.x * k,
    y: visibleCenterY - p.target.y * k,
  };
}

/**
 * Stage 2 PM checkpoint Issue 2.2 修：单击 obs 时 targetK 递进策略
 * - currentK <= 3：跳 6（从全景或局部跳到能看 obs 周围关系 / 不一步到底）
 * - 3 < currentK <= 6：跳 8（用户已在中等 zoom / 跳到细节最大）
 * - currentK > 6：保持 currentK（已在细节区 / 不再放大）
 *
 * PM 原话："用户从全景状态或者2、3这种全局上点到具体观点时，他的视野还是需要放得开一点，
 *           看一看各观点之间得关系...等他看看，拖动拖动，在已经放大一部分的情况下再点击某个节点时，
 *           再给他放大到 8"
 */
export function chooseTargetK(currentK: number): number {
  if (currentK <= 3) return 6;
  if (currentK <= 6) return 8;
  return Math.min(currentK, 8); // 已 > 6 保持当前 / 8 是 scaleExtent max
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
