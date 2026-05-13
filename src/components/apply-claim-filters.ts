// M4 B1 (smoke test 2026-05-13 后) · sidebar filter → 主画布 DOM 应用
// spec § 7.2 line 279: cats 默认 ☑ me/po/et/re/mp + ☐ 其他 6 类
// 实际 UI 只列 5 cats checkbox，**其他 6 类 (lo/ep/ae/mi/la/sc) 不在 filters 字典里 → 视为不过滤 (默认显示)**
//
// 规则:
// 1. person section 标题: filters.nodes.person ON → 显示 / OFF → 整 section 隐藏
// 2. obs (g.obs): filters.nodes.claim ON 且 (claim.cats 含至少 1 个 filters.cats[cat] !== false) → 显示
//    - 含未列 cat 的 claim (如 'lo' 'ep'): filters.cats.lo === undefined !== false → some() 返回 true → 显示 ✓
//    - 含 [me, po] + uncheck me: po 还 ON → 显示 ✓
//    - 含 [me] 单 cat + uncheck me: 全 false → 隐藏 ✓
//    - cats empty array (防御): 不过滤 → 显示
// 3. 弧线 (path.arc): 按 filters.relations[r.type] 显隐
//    - 注: cats filter 让 obs 隐藏后弧线不联动 (一端隐藏一端可见时弧线仍画)
//      → 见 [docs/m4-polish-backlog.md](../../docs/m4-polish-backlog.md) 'arc-cats 联动'

import type * as d3 from 'd3';
import type { ClaimNode, ClaimRelation } from '../types/Claim.ts';
import type { SidebarFilters } from './sidebar.ts';

export interface FilterContext {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  claimById: Map<string, ClaimNode>;
}

export function applyClaimFilters(ctx: FilterContext, filters: SidebarFilters): void {
  const { svg, claimById } = ctx;

  // 1. person section 标题
  svg
    .selectAll<SVGGElement, unknown>('g.person-section')
    .style('display', () => (filters.nodes.person ? null : 'none'));

  // 2. obs (claim 主开关 + cats 过滤)
  svg.selectAll<SVGGElement, unknown>('g.obs').style('display', function () {
    if (!filters.nodes.claim) return 'none';
    const id = (this as SVGGElement).getAttribute('data-claim-id');
    const claim = id ? claimById.get(id) : null;
    if (!claim || !claim.cats || claim.cats.length === 0) return null;
    const anyOn = claim.cats.some(
      (cat) => (filters.cats as Record<string, boolean>)[cat] !== false,
    );
    return anyOn ? null : 'none';
  });

  // 3. 弧线
  svg
    .selectAll<SVGPathElement, ClaimRelation>('path.arc')
    .style('display', (r) =>
      (filters.relations as Record<string, boolean>)[r.type] ? null : 'none',
    );
}
