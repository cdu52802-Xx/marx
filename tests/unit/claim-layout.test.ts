import { describe, it, expect } from 'vitest';
import {
  computePersonSectionPositions,
  generateArcPath,
} from '../../src/components/claim-layout.ts';
import type { ClaimNode } from '../../src/types/Claim.ts';

// fixture：layout test 只关心 id / birth_year / claims 的存在性，不关心 ClaimNode 全字段
// 用 Partial<ClaimNode> 配合 unknown 双 cast 替代 plan template 里的 `as any`（lint friendly）
type LayoutPersonFixture = {
  id: string;
  name_zh?: string;
  birth_year: number;
  claims: Partial<ClaimNode>[];
};

const asPersons = (xs: LayoutPersonFixture[]) =>
  xs as unknown as Parameters<typeof computePersonSectionPositions>[0];

describe('claim-layout · person section 斜向流坐标', () => {
  it('person 按 birth_year 排序后斜向偏移', () => {
    const persons: LayoutPersonFixture[] = [
      { id: 'p1', name_zh: 'A', birth_year: 1770, claims: [{ id: 'c1' }] },
      { id: 'p2', name_zh: 'B', birth_year: 1820, claims: [{ id: 'c2' }] },
      { id: 'p3', name_zh: 'C', birth_year: 1880, claims: [{ id: 'c3' }] },
    ];
    const sections = computePersonSectionPositions(asPersons(persons));
    expect(sections[0].x).toBeLessThan(sections[1].x);
    expect(sections[1].x).toBeLessThan(sections[2].x);
    expect(sections[0].y).toBeLessThan(sections[1].y);
    expect(sections[1].y).toBeLessThan(sections[2].y);
  });

  it('多 obs person section 占用更多垂直空间', () => {
    const persons: LayoutPersonFixture[] = [
      {
        id: 'p1',
        birth_year: 1770,
        claims: Array.from({ length: 10 }, (_, i) => ({ id: `c${i}` })),
      },
      { id: 'p2', birth_year: 1820, claims: [{ id: 'c10' }] },
    ];
    const sections = computePersonSectionPositions(asPersons(persons));
    const p1Bottom = sections[0].y + sections[0].claims.length * 22;
    expect(sections[1].y).toBeGreaterThan(p1Bottom); // p2 不重叠 p1 obs 区
  });
});

describe('claim-layout · 半圆弧 SVG path generator', () => {
  it('绿弧 (agreement) 控制点偏左下', () => {
    const path = generateArcPath(100, 100, 200, 200, 'agreement_with');
    // path 形如 "M 100 100 Q ctrlX ctrlY 200 200"
    const match = path.match(/Q (\S+) (\S+)/);
    expect(match).not.toBeNull();
    const ctrlX = parseFloat(match![1]);
    const ctrlY = parseFloat(match![2]);
    const midX = (100 + 200) / 2;
    const midY = (100 + 200) / 2;
    expect(ctrlX, 'ctrlX 偏左 (< midX)').toBeLessThan(midX);
    expect(ctrlY, 'ctrlY 偏下 (> midY)').toBeGreaterThan(midY);
  });

  it('红弧 (disagreement) 控制点偏右上', () => {
    const path = generateArcPath(100, 100, 200, 200, 'disagreement_with');
    const match = path.match(/Q (\S+) (\S+)/);
    const ctrlX = parseFloat(match![1]);
    const ctrlY = parseFloat(match![2]);
    const midX = (100 + 200) / 2;
    const midY = (100 + 200) / 2;
    expect(ctrlX, 'ctrlX 偏右 (> midX)').toBeGreaterThan(midX);
    expect(ctrlY, 'ctrlY 偏上 (< midY)').toBeLessThan(midY);
  });

  it('灰弧 (extends) 控制点偏右 (微弯)', () => {
    const path = generateArcPath(100, 100, 100, 150, 'extends');
    const match = path.match(/Q (\S+) (\S+)/);
    const ctrlX = parseFloat(match![1]);
    expect(ctrlX, 'ctrlX 偏右').toBeGreaterThan(100);
  });
});
