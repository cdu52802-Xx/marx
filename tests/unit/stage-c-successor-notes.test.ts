import { describe, it, expect } from 'vitest';
import type { Node, ConceptNode } from '../../src/types/Node.ts';
import data from '../../src/data/nodes_skeleton.json';

// 阶段 C acceptance test · A 模式 inline successor_notes
// 决策来源：docs/2026-05-08-m3-progress-anchor.md 决策 1（A 模式覆盖 plan B 模式）
// 字段定义来源：src/types/Node.ts L74-82 SuccessorNote interface
// 数量 / 字数约束来源：plan L1595 / L1642 / L2700 + design doc § 5.4

describe('Stage C · 阶段 C 后来者旁注完成 acceptance', () => {
  const nodes = data.nodes as Node[];
  const concepts = nodes.filter((n): n is ConceptNode => n.type === 'concept');

  it('12 个核心 concept 节点存在（前置 stage B Task 9）', () => {
    expect(concepts.length).toBeGreaterThanOrEqual(12);
  });

  it('每个 concept successor_notes 数量在 [3, 5]（design doc § 5.4）', () => {
    for (const c of concepts) {
      const n = c.successor_notes?.length ?? 0;
      expect(n, `${c.id} ${c.name_zh} successor_notes 数量 ${n}`).toBeGreaterThanOrEqual(3);
      expect(n, `${c.id} ${c.name_zh} successor_notes 数量 ${n}`).toBeLessThanOrEqual(5);
    }
  });

  it('总旁注数量在 [36, 60]（12 × 3-5）', () => {
    const total = concepts.reduce((sum, c) => sum + (c.successor_notes?.length ?? 0), 0);
    expect(total).toBeGreaterThanOrEqual(36);
    expect(total).toBeLessThanOrEqual(60);
  });

  it('每条 SuccessorNote 6 字段全填', () => {
    for (const c of concepts) {
      for (const n of c.successor_notes ?? []) {
        const tag = `${c.id} ${c.name_zh} → ${n.successor_name_zh ?? '<空>'}`;
        expect(n.successor_name_zh, `${tag} successor_name_zh`).toBeTruthy();
        expect(n.successor_name_orig, `${tag} successor_name_orig`).toBeTruthy();
        expect(n.year, `${tag} year`).toBeGreaterThan(0);
        expect(n.source_work, `${tag} source_work`).toBeTruthy();
        expect(n.note_text, `${tag} note_text`).toBeTruthy();
        expect(n.citation_urls?.length ?? 0, `${tag} citation_urls`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('每条 note_text 字数在 [300, 500]（design doc § 5.4 硬性约束）', () => {
    for (const c of concepts) {
      for (const n of c.successor_notes ?? []) {
        const tag = `${c.id} → ${n.successor_name_zh ?? '<空>'}`;
        const len = Array.from(n.note_text ?? '').length;
        expect(len, `${tag} note_text 字数 ${len}`).toBeGreaterThanOrEqual(300);
        expect(len, `${tag} note_text 字数 ${len}`).toBeLessThanOrEqual(500);
      }
    }
  });
});
