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
  // 2026-05-12 PM 反馈: "180度的半圆, 不是劣弧" → 绿弧/红弧改用 SVG A 命令真半圆
  // SVG A 命令: M x1 y1 A rx ry rotation large-arc sweep x2 y2
  it('绿弧 (agreement) 是 180° 半圆 + 凸向左下', () => {
    const path = generateArcPath(100, 100, 200, 200, 'agreement_with');
    const match = path.match(/^M (\S+) (\S+) A (\S+) (\S+) 0 0 (\d) (\S+) (\S+)$/);
    expect(match, '应为 SVG A 命令').not.toBeNull();
    const rx = parseFloat(match![3]);
    const ry = parseFloat(match![4]);
    const sweep = match![5];
    // 半径 = dist / 2 (180° 半圆 / 直径 = 两点距离)
    const expectedR = Math.sqrt(2) * 100 * 0.5;
    expect(rx).toBeCloseTo(expectedR, 0);
    expect(ry).toBeCloseTo(expectedR, 0);
    // P2 在 P1 右下 (dx=100, dy=100) → leftPerpDot = 200 > 0 → sweep=1 (弧凸向左下)
    expect(sweep, '绿弧 sweep=1 凸向左下').toBe('1');
  });

  it('红弧 (disagreement) 是 180° 半圆 + 凸向右上', () => {
    const path = generateArcPath(100, 100, 200, 200, 'disagreement_with');
    const match = path.match(/^M (\S+) (\S+) A (\S+) (\S+) 0 0 (\d) (\S+) (\S+)$/);
    expect(match, '应为 SVG A 命令').not.toBeNull();
    const sweep = match![5];
    // 红弧 sweep=0 (凸向右上, 跟绿弧方向相反)
    expect(sweep, '红弧 sweep=0 凸向右上').toBe('0');
  });

  it('灰弧 (extends) 仍为 Q 命令微弯向右 (不是半圆)', () => {
    const path = generateArcPath(100, 100, 100, 150, 'extends');
    const match = path.match(/Q (\S+) (\S+)/);
    expect(match, '灰弧应为 Q 命令').not.toBeNull();
    const ctrlX = parseFloat(match![1]);
    expect(ctrlX, 'ctrlX 偏右').toBeGreaterThan(100);
  });
});
