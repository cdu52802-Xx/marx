import { describe, it, expect, beforeEach } from 'vitest';
import { renderRelations } from '../../src/viz/relations.ts';
import type { Dataset } from '../../src/types/Node.ts';

const m2TestFixture: Dataset = {
  nodes: [
    {
      id: 'wd-q9061',
      type: 'person',
      name_zh: '卡尔·马克思',
      name_orig: 'Karl Marx',
      birth_year: 1818,
      death_year: 1883,
      main_location_lat_lng: [51.5074, -0.1278],
      bio_event_style: [],
      citation_urls: [],
    },
    {
      id: 'wd-q33760',
      type: 'person',
      name_zh: '弗里德里希·恩格斯',
      name_orig: 'Friedrich Engels',
      birth_year: 1820,
      death_year: 1895,
      main_location_lat_lng: [53.4808, -2.2426],
      bio_event_style: [],
      citation_urls: [],
    },
    {
      id: 'wd-q183242',
      type: 'work',
      name_zh: '资本论',
      name_orig: 'Das Kapital',
      pub_year: 1867,
      author_id: 'wd-q9061',
      writing_period: '1857-1867',
      summary: '资本主义生产方式批判',
      citation_urls: [],
    },
  ],
  relations: [
    { source: 'wd-q9061', target: 'wd-q33760', type: 'friend_collaborator' },
    { source: 'wd-q9061', target: 'wd-q183242', type: 'author' },
  ],
};

describe('renderRelations · M2', () => {
  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="600" height="400"></svg>';
  });

  it('throws when svg selector not found', () => {
    expect(() => renderRelations('#nonexistent', m2TestFixture)).toThrow(/SVG not found/);
  });

  it('renders one circle per node', () => {
    renderRelations('#test-svg', m2TestFixture);
    const circles = document.querySelectorAll('[data-testid="node-circle"]');
    expect(circles.length).toBe(3);
  });

  it('renders one line per relation', () => {
    renderRelations('#test-svg', m2TestFixture);
    const lines = document.querySelectorAll('[data-testid="relation-line"]');
    expect(lines.length).toBe(2);
  });

  it('attaches data-node-id matching dataset ids', () => {
    renderRelations('#test-svg', m2TestFixture);
    const circles = Array.from(document.querySelectorAll('[data-testid="node-circle"]'));
    const ids = circles.map((c) => c.getAttribute('data-node-id')).sort();
    expect(ids).toEqual(['wd-q183242', 'wd-q33760', 'wd-q9061']);
  });

  it('renders person + work labels in Chinese', () => {
    renderRelations('#test-svg', m2TestFixture);
    const labels = Array.from(document.querySelectorAll('[data-testid="node-label"]'));
    const names = labels.map((l) => l.textContent).sort();
    expect(names).toContain('卡尔·马克思');
    expect(names).toContain('弗里德里希·恩格斯');
    expect(names).toContain('资本论');
  });
});
