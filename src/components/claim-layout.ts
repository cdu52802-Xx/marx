// M4 T6 主画布 layout 算法
// 落地 spec § 5 layout 规范 + § 5.4 半圆弧规范（PM 反馈硬约束）
// - 斜向流：person 按 birth_year 排序后 X+50 / Y+60 偏移
// - obs 堆叠：每行 22px，每 5 条 X 偏移 25px（主张族群区隔）
// - 半圆弧：绿弧左下 / 红弧右上 / 灰弧微弯向右（坑 23 防御 · 弧线方向容易写反）

import type { ClaimNode } from '../types/Claim.ts';

export interface PersonSection {
  id: string;
  name_zh: string;
  name_orig?: string;
  birth_year: number;
  death_year?: number;
  x: number; // 标题 X 坐标
  y: number; // 标题 Y 坐标
  claims: ClaimWithCoords[];
}

export interface ClaimWithCoords extends ClaimNode {
  x: number; // obs 行起点 X (圆点位置)
  y: number; // obs 行 Y
}

interface PersonInput {
  id: string;
  name_zh: string;
  name_orig?: string;
  birth_year: number;
  death_year?: number;
  claims: ClaimNode[];
}

const PERSON_X_OFFSET = 50; // 每个 person 比上一个 X 偏移
const PERSON_Y_OFFSET = 60; // 每个 person 比上一个 Y 偏移（基础, 未直接使用 — 由 obs 区动态高度决定）
const OBS_ROW_HEIGHT = 22; // obs 行垂直间距
const OBS_X_FROM_HEADER = 100; // obs 起点 = person 标题 X + 100
const SECTION_TOP_PADDING = 25; // person 标题到第一条 obs 的间距

// 抑制未使用常量 lint 警告（保留为 spec 文档化锚点）
void PERSON_Y_OFFSET;

export function computePersonSectionPositions(persons: PersonInput[]): PersonSection[] {
  // 按 birth_year 排序
  const sorted = [...persons].sort((a, b) => a.birth_year - b.birth_year);
  const sections: PersonSection[] = [];
  let currentX = 60;
  let currentY = 80;

  for (const p of sorted) {
    const section: PersonSection = {
      id: p.id,
      name_zh: p.name_zh,
      name_orig: p.name_orig,
      birth_year: p.birth_year,
      death_year: p.death_year,
      x: currentX,
      y: currentY,
      claims: [],
    };

    // 每个 obs 行 X = section X + 偏移 + (i 偶数小偏移)
    const obsBaseX = currentX + OBS_X_FROM_HEADER;
    let obsY = currentY + SECTION_TOP_PADDING;
    p.claims.forEach((c, i) => {
      // 45° 斜向排列: 每行 X 增量 = Y 增量 = OBS_ROW_HEIGHT (22px) (2026-05-12 PM 视觉反馈)
      section.claims.push({
        ...c,
        x: obsBaseX + i * OBS_ROW_HEIGHT,
        y: obsY,
      });
      obsY += OBS_ROW_HEIGHT;
    });

    sections.push(section);

    // 下一个 person 位置：X+50 / Y = 当前 obs 区底部 + 一些 padding
    currentX += PERSON_X_OFFSET;
    currentY = obsY + 30;
  }

  return sections;
}

export function generateArcPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: 'agreement_with' | 'disagreement_with' | 'extends',
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (type === 'extends') {
    // 灰弧 = 微弯向右（同 person 自延 / 短距 / 不是 180° 半圆）
    const midY = (y1 + y2) / 2;
    const ctrlX = Math.max(x1, x2) + dist * 0.15;
    return `M ${x1} ${y1} Q ${ctrlX} ${midY} ${x2} ${y2}`;
  }

  // 绿弧 / 红弧 = 真 180° 半圆 (SVG A 命令 / 半径 = dist/2 / 2026-05-12 PM 反馈)
  // sweep-flag 决定弧凸向哪侧:
  //   sweep=1 → 弧凸向 leftPerp 方向 (-dy, dx)
  //   sweep=0 → 弧凸向 rightPerp 方向 (dy, -dx)
  // 绿弧 want 凸向 (-, +) 方向 = (-1, 1): dot(leftPerp, (-1, 1)) = dy + dx > 0 → sweep=1
  // 红弧 want 凸向 (+, -) 方向 = (1, -1): 反过来
  const r = dist / 2;
  const leftPerpDotLeftDown = dy + dx;
  let sweep: 0 | 1;
  if (type === 'agreement_with') {
    sweep = leftPerpDotLeftDown >= 0 ? 1 : 0;
  } else {
    sweep = leftPerpDotLeftDown >= 0 ? 0 : 1;
  }
  return `M ${x1} ${y1} A ${r} ${r} 0 0 ${sweep} ${x2} ${y2}`;
}

export function getArcStyle(type: 'agreement_with' | 'disagreement_with' | 'extends') {
  switch (type) {
    case 'agreement_with':
      return { stroke: '#7a9a5a', strokeWidth: 1.1, opacity: 0.65, dasharray: 'none' };
    case 'disagreement_with':
      return { stroke: '#b8654a', strokeWidth: 1.2, opacity: 0.7, dasharray: 'none' };
    case 'extends':
      return { stroke: '#aaa', strokeWidth: 0.8, opacity: 0.4, dasharray: '2,2' };
  }
}
