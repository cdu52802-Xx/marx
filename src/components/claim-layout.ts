// M4 T6 主画布 layout 算法
// 落地 spec § 5 layout 规范 + § 5.4 半圆弧规范（PM 反馈硬约束）
// - 斜向流：全部 obs 走同一条 45° 直斜线（对齐 denizcemonduygu/philo/browse 视觉参照）
// - obs 堆叠：每步 Δx = Δy = 22px · 段交界 Δx = Δy = 77px（22 步 + 55 段距）
// - 半圆弧：绿弧左下 / 红弧右上 / 灰弧微弯向右（坑 23 防御 · 弧线方向容易写反）
//
// PM R2（2026-06-11）· "斜线是歪的不直" 修复：
//   旧实现段内 22/22 是 45° · 但段交界跳「右 50 / 下 77」≈57° → 27 段累计折出 ~730px 歪线
//   新实现：单一 chain 游标贯穿全部 obs · 每步（含段交界）Δx 恒等 Δy → x − y 全局恒定 = 真直线
//   纵坐标跟旧版逐点一致（行距/段距/呼吸感不变）· 仅横坐标摆正 · header 锚定第一条 obs（左 100 / 上 25）

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

const OBS_STEP = 22; // 45° 链条步长 · Δx = Δy（原 OBS_ROW_HEIGHT · 行距视觉不变）
const SECTION_GAP = 55; // 段交界额外 45° 间隙（25 标题顶距 + 30 段距 · 原纵向节奏不变）
const HEADER_LEFT_OF_OBS = 100; // person 标题在第一条 obs 左侧偏移（原 OBS_X_FROM_HEADER）
const HEADER_ABOVE_OBS = 25; // person 标题在第一条 obs 上方（原 SECTION_TOP_PADDING）
const CHAIN_START_X = 160; // 第一条 obs 起点（原 60 header + 100）
const CHAIN_START_Y = 105; // 原 80 header + 25

export function computePersonSectionPositions(persons: PersonInput[]): PersonSection[] {
  // 按 birth_year 排序
  const sorted = [...persons].sort((a, b) => a.birth_year - b.birth_year);
  const sections: PersonSection[] = [];
  // PM R2 · 单一 chain 游标贯穿全部 obs · 每步 Δx 恒等 Δy → 全局共线 45° 直斜线
  let chainX = CHAIN_START_X;
  let chainY = CHAIN_START_Y;

  for (const p of sorted) {
    const section: PersonSection = {
      id: p.id,
      name_zh: p.name_zh,
      name_orig: p.name_orig,
      birth_year: p.birth_year,
      death_year: p.death_year,
      // header 锚定本段第一条 obs（左 100 / 上 25）· header 们自成一条平行斜线
      x: chainX - HEADER_LEFT_OF_OBS,
      y: chainY - HEADER_ABOVE_OBS,
      claims: [],
    };

    for (const c of p.claims) {
      section.claims.push({ ...c, x: chainX, y: chainY });
      chainX += OBS_STEP;
      chainY += OBS_STEP;
    }

    sections.push(section);

    // 段交界：沿同一条 45° 线再走 SECTION_GAP（0 obs 段也不破链）
    chainX += SECTION_GAP;
    chainY += SECTION_GAP;
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
