// M5 主线 A · T4 + Stage 2 R3 · 居中飞行算法
// spec § 7.3 单击 obs 同时居中 + 详情卡 · DR-017 · 居中算法 offset 详情卡宽度
//
// Stage 2 R3 Issue #3 修：x 居中偏移
//   根因：viewBox + preserveAspectRatio="xMidYMid meet" → viewBox 坐标 ↔ pixel 坐标 差
//          一个 meet scale (s = min(svgPxWidth/vbWidth, svgPxHeight/vbHeight)) + letterbox offset
//   修法：分两层
//     · computeCenterTransform: pure math · 输入全在 viewBox 坐标（含 visibleCenter）
//     · pixelToViewBox: SVG-aware helper · 把 pixel screen 坐标转 viewBox 坐标
//     · main.ts 组合：用 pixelToViewBox 算 visCenter 的 viewBox 坐标 / 传给 computeCenterTransform

import * as d3 from 'd3';
import type { ZoomBehavior, ZoomTransform } from 'd3-zoom';
import type { Selection } from 'd3-selection';

export interface CenterParams {
  target: { x: number; y: number }; // viewBox / canvas coords
  targetK: number;
  /**
   * 如果 currentK > targetK 则保持 currentK（不缩小 / 用户已经 zoom in 不破坏）
   * 不传则用 targetK
   */
  currentK?: number;
  /**
   * 屏幕可见区中心（在 target 同一坐标系 = viewBox 坐标）
   * main.ts 用 pixelToViewBox helper 把 pixel screen center 转 viewBox 坐标后传入
   */
  visibleCenter: { x: number; y: number };
}

export interface CenterTransform {
  k: number;
  x: number;
  y: number;
}

export function computeCenterTransform(p: CenterParams): CenterTransform {
  const k = p.currentK && p.currentK > p.targetK ? p.currentK : p.targetK;
  return {
    k,
    x: p.visibleCenter.x - p.target.x * k,
    y: p.visibleCenter.y - p.target.y * k,
  };
}

/**
 * Stage 2 R3 Issue #3 · pixel screen 坐标 → viewBox 坐标转换
 *
 * SVG viewBox + preserveAspectRatio="xMidYMid meet" 行为：
 *   - meet scale s = min(svgPxWidth / vbWidth, svgPxHeight / vbHeight)
 *   - 限制 dim 充满 SVG 元素 / 非限制 dim letterbox 居中
 *   - letterboxX = (svgPxWidth - vbWidth * s) / 2  if width 非限制
 *   - letterboxY = (svgPxHeight - vbHeight * s) / 2  if height 非限制
 *   - pixel (px, py) → viewBox: ((px - svgLeft - letterboxX) / s, (py - svgTop - letterboxY) / s)
 *
 * 输入 px, py 是 window pixel 坐标（相对 window 左上角）
 * 输出 viewBox 坐标（相对 viewBox 原点）
 */
export function pixelToViewBox(
  svgElement: SVGSVGElement,
  pxX: number,
  pxY: number,
): { x: number; y: number } {
  const rect = svgElement.getBoundingClientRect();
  const viewBox = svgElement.viewBox.baseVal;
  if (viewBox.width === 0 || viewBox.height === 0) {
    // 兜底：viewBox 没设 / 视为 1:1
    return { x: pxX - rect.left, y: pxY - rect.top };
  }
  const sWidth = rect.width / viewBox.width;
  const sHeight = rect.height / viewBox.height;
  const s = Math.min(sWidth, sHeight);
  // letterbox 在非限制 dim 上
  const letterboxX = sWidth > sHeight ? (rect.width - viewBox.width * s) / 2 : 0;
  const letterboxY = sHeight > sWidth ? (rect.height - viewBox.height * s) / 2 : 0;
  return {
    x: (pxX - rect.left - letterboxX) / s,
    y: (pxY - rect.top - letterboxY) / s,
  };
}

/**
 * Stage 2 PM checkpoint Issue 2.2 修：单击 obs 时 targetK 递进策略
 * Stage 2 R3 调整：用于双击触发的 zoom step / 单击不再触发 zoom（k>1 时只切详情）
 *
 * - currentK <= 3：跳 6（从全景或局部跳到能看 obs 周围关系 / 不一步到底）
 * - 3 < currentK <= 6：跳 8（用户已在中等 zoom / 跳到细节最大）
 * - currentK > 6：保持 currentK（已在细节区 / 不再放大）
 */
export function chooseTargetK(currentK: number): number {
  if (currentK <= 3) return 6;
  if (currentK <= 6) return 8;
  return Math.min(currentK, 8);
}

export function flyToTarget(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  svg: Selection<SVGSVGElement, unknown, any, any>,
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>,
  transform: CenterTransform,
  duration = 600,
): void {
  const t: ZoomTransform = d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k);
  if (duration === 0) {
    zoomBehavior.transform(svg, t);
    return;
  }
  svg.transition().duration(duration).ease(d3.easeCubicInOut).call(zoomBehavior.transform, t);
}
