import { describe, it, expect } from 'vitest';
import type { Node, PersonNode, WorkNode, ConceptNode } from '../../src/types/Node.ts';
import data from '../../src/data/nodes_skeleton.json';

const CORE_CONCEPT_IDS = [
  'concept-alienation',
  'concept-surplus-value',
  'concept-historical-materialism',
  'concept-class-struggle',
  'concept-commodity-fetishism',
  'concept-ideology',
  'concept-mode-of-production',
  'concept-base-superstructure',
  'concept-communism',
  'concept-revolution',
  'concept-labor-theory-of-value',
  'concept-state',
] as const;

describe('Stage B · 阶段 B 校对完成 acceptance', () => {
  const nodes = data.nodes as Node[];

  it('节点总数在 [36, 60] 区间（39 起 + 12 concept 新增 - 0~3 误分类）', () => {
    expect(nodes.length).toBeGreaterThanOrEqual(36);
    expect(nodes.length).toBeLessThanOrEqual(60);
  });

  it('person 节点 4 字段全填（name_orig != name_zh / latlng 非 [0,0] / bio 非空 / citations 非空）', () => {
    const persons = nodes.filter((n): n is PersonNode => n.type === 'person');
    expect(persons.length).toBeGreaterThanOrEqual(30);
    for (const p of persons) {
      expect(p.name_orig, `${p.id} ${p.name_zh} name_orig`).not.toBe(p.name_zh);
      expect(p.main_location_lat_lng, `${p.id} ${p.name_zh} latlng`).not.toEqual([0, 0]);
      expect(p.bio_event_style?.length ?? 0, `${p.id} ${p.name_zh} bio_event_style`).toBeGreaterThanOrEqual(1);
      expect(p.citation_urls?.length ?? 0, `${p.id} ${p.name_zh} citation_urls`).toBeGreaterThanOrEqual(1);
    }
  });

  it('work 节点 5 字段全填', () => {
    const works = nodes.filter((n): n is WorkNode => n.type === 'work');
    expect(works.length).toBeGreaterThanOrEqual(4);
    for (const w of works) {
      expect(w.name_orig, `${w.id} name_orig`).not.toBe(w.name_zh);
      expect(w.writing_period, `${w.id} writing_period`).toBeTruthy();
      expect(w.summary, `${w.id} summary`).toBeTruthy();
      expect(w.author_id, `${w.id} author_id`).toBeTruthy();
      expect(w.citation_urls?.length ?? 0, `${w.id} citations`).toBeGreaterThanOrEqual(1);
    }
  });

  it('12 个 design doc § 5.2 核心 concept 节点存在', () => {
    const concepts = nodes.filter((n) => n.type === 'concept');
    const conceptIds = new Set(concepts.map((c) => c.id));
    for (const required of CORE_CONCEPT_IDS) {
      expect(conceptIds.has(required), `缺少核心 concept ${required}`).toBe(true);
    }
  });

  it('每个 concept 节点必填字段全填（successor_notes 字段存在即可，内容由阶段 C Task 14 填）', () => {
    const concepts = nodes.filter((n): n is ConceptNode => n.type === 'concept');
    for (const c of concepts) {
      expect(c.name_zh, `${c.id} name_zh`).toBeTruthy();
      expect(c.name_orig, `${c.id} name_orig`).toBeTruthy();
      expect(c.proposed_year, `${c.id} proposed_year`).toBeGreaterThan(0);
      expect(c.proposed_work_id, `${c.id} proposed_work_id`).toBeTruthy();
      expect(c.definition_plain, `${c.id} definition_plain`).toBeTruthy();
      expect(c.citation_urls?.length ?? 0, `${c.id} citations`).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(c.successor_notes), `${c.id} successor_notes 字段必须是数组（schema 校验要求）`).toBe(true);
    }
  });
});
