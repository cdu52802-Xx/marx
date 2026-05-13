// M4 B1 fix · applyClaimFilters 单元测试
// 修复 smoke test 2026-05-13 发现: sidebar 5 学科 + 观点 claim checkbox 显示但不生效

import { describe, it, expect, beforeEach } from 'vitest';
import * as d3 from 'd3';
import { applyClaimFilters } from '../../src/components/apply-claim-filters.ts';
import type { ClaimNode } from '../../src/types/Claim.ts';
import type { SidebarFilters } from '../../src/components/sidebar.ts';

function makeClaim(id: string, cats: ClaimNode['cats']): ClaimNode {
  return {
    id,
    type: 'claim',
    cats,
    claim_text: 'test',
    author_id: 'wd-q9061',
    year: 1850,
  };
}

describe('applyClaimFilters · B1 cats + claim filter', () => {
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let claimById: Map<string, ClaimNode>;
  let defaultFilters: SidebarFilters;

  beforeEach(() => {
    document.body.innerHTML = '';
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svgEl);
    svg = d3.select<SVGSVGElement, unknown>(svgEl);

    // 1 person section + 4 obs (me / po / [me,po] / lo 未列)
    svg.append('g').attr('class', 'person-section').attr('data-person-id', 'p1');
    svg.append('g').attr('class', 'obs').attr('data-claim-id', 'c-me');
    svg.append('g').attr('class', 'obs').attr('data-claim-id', 'c-po');
    svg.append('g').attr('class', 'obs').attr('data-claim-id', 'c-me-po');
    svg.append('g').attr('class', 'obs').attr('data-claim-id', 'c-lo');

    claimById = new Map([
      ['c-me', makeClaim('c-me', ['me'])],
      ['c-po', makeClaim('c-po', ['po'])],
      ['c-me-po', makeClaim('c-me-po', ['me', 'po'])],
      ['c-lo', makeClaim('c-lo', ['lo'])],
    ]);

    defaultFilters = {
      nodes: { claim: true, person: true, work: false, event: false, place: false },
      relations: { agreement_with: true, disagreement_with: true, extends: false },
      cats: { me: true, po: true, et: true, re: true, mp: true },
    };
  });

  // helper: D3 .style('display') 返回 computed style (SVG g 默认 'inline')
  // 'visible' = inline style 没设 display:none / 'hidden' = display: none
  const isHidden = (sel: d3.Selection<SVGElement, unknown, null, undefined>) =>
    sel.style('display') === 'none';

  it('default filters → 所有 obs + section 显示', () => {
    applyClaimFilters({ svg, claimById }, defaultFilters);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-me"]'))).toBe(false);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-po"]'))).toBe(false);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-me-po"]'))).toBe(false);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-lo"]'))).toBe(false);
    expect(isHidden(svg.select('g.person-section'))).toBe(false);
  });

  it('uncheck "形而上 me" → 含 me 单 cat 的 obs 隐藏 / 含 po 单 cat 仍显示', () => {
    const filters: SidebarFilters = {
      ...defaultFilters,
      cats: { ...defaultFilters.cats, me: false },
    };
    applyClaimFilters({ svg, claimById }, filters);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-me"]'))).toBe(true);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-po"]'))).toBe(false);
  });

  it('uncheck "形而上 me" → 含 [me, po] 的 obs 仍显示 (po 还 ON)', () => {
    const filters: SidebarFilters = {
      ...defaultFilters,
      cats: { ...defaultFilters.cats, me: false },
    };
    applyClaimFilters({ svg, claimById }, filters);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-me-po"]'))).toBe(false);
  });

  it('uncheck "形而上 me" → 含未列 cat (lo) 的 obs 仍显示', () => {
    const filters: SidebarFilters = {
      ...defaultFilters,
      cats: { ...defaultFilters.cats, me: false },
    };
    applyClaimFilters({ svg, claimById }, filters);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-lo"]'))).toBe(false);
  });

  it('uncheck "观点 claim" → 所有 obs 隐藏 (含未列 cat 的)', () => {
    const filters: SidebarFilters = {
      ...defaultFilters,
      nodes: { ...defaultFilters.nodes, claim: false },
    };
    applyClaimFilters({ svg, claimById }, filters);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-me"]'))).toBe(true);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-po"]'))).toBe(true);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-me-po"]'))).toBe(true);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-lo"]'))).toBe(true);
  });

  it('uncheck "人物 person" → person section 隐藏', () => {
    const filters: SidebarFilters = {
      ...defaultFilters,
      nodes: { ...defaultFilters.nodes, person: false },
    };
    applyClaimFilters({ svg, claimById }, filters);
    expect(isHidden(svg.select('g.person-section'))).toBe(true);
  });

  it('recheck "形而上 me" 后 c-me 单 cat 重新显示', () => {
    const off: SidebarFilters = {
      ...defaultFilters,
      cats: { ...defaultFilters.cats, me: false },
    };
    applyClaimFilters({ svg, claimById }, off);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-me"]'))).toBe(true);
    applyClaimFilters({ svg, claimById }, defaultFilters);
    expect(isHidden(svg.select('g.obs[data-claim-id="c-me"]'))).toBe(false);
  });
});
