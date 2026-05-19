// M5 T10 · 集中 re-export 只用到的 d3 API
// 原因: `import * as d3 from 'd3'` 让 rollup 整包 bundle d3 (~30 子模块) /
//   实测 bundle gzip 48.68 KB > warning 47 KB。
// 本文件只 named re-export 用到的 4 子模块 / vite tree-shake 友好 / bundle 显著减小。
//
// 调用 site 不变 (5 文件 src/main.ts / src/viz/zoom.ts / src/viz/center.ts /
//   src/viz/relations.ts / src/components/apply-claim-filters.ts) 只改 import path:
//   `import * as d3 from 'd3'` → `import * as d3 from '<rel>/lib/d3.ts'`
//
// 用到的 d3 API 汇总 (grep src):
//   - d3-selection: select, selectAll, type Selection
//   - d3-zoom: zoom, zoomTransform, zoomIdentity, type ZoomBehavior, type ZoomTransform
//   - d3-ease: easeCubicInOut
//   - d3-force: forceSimulation, forceManyBody, forceCenter,
//     type SimulationNodeDatum, type SimulationLinkDatum (仅 viz/relations.ts dead code + 单测)
//   - d3-transition 隐式依赖 (selection.transition() / via d3-selection augmentation)

export { select, selectAll, type Selection, type BaseType } from 'd3-selection';
// d3-transition 通过 side-effect import 给 selection 注入 .transition() 方法
import 'd3-transition';
export { zoom, zoomTransform, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
export { easeCubicInOut } from 'd3-ease';
export {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceLink,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';
