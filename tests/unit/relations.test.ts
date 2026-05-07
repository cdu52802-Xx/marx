import { describe, it, expect, beforeEach } from 'vitest';
import { renderRelations } from '../../src/viz/relations.ts';
import { m1Dataset } from '../../src/data/m1-skeleton.ts';

describe('renderRelations · M1', () => {
  beforeEach(() => {
    document.body.innerHTML = '<svg id="test-svg" width="600" height="400"></svg>';
  });

  it('throws when svg selector not found', () => {
    expect(() => renderRelations('#nonexistent', m1Dataset)).toThrow(/SVG not found/);
  });

  it('renders 2 node circles for M1 dataset', () => {
    renderRelations('#test-svg', m1Dataset);
    const circles = document.querySelectorAll('[data-testid="node-circle"]');
    expect(circles.length).toBe(2);
  });

  it('renders 1 relation line for M1 dataset', () => {
    renderRelations('#test-svg', m1Dataset);
    const lines = document.querySelectorAll('[data-testid="relation-line"]');
    expect(lines.length).toBe(1);
  });

  it('attaches data-node-id matching dataset ids', () => {
    renderRelations('#test-svg', m1Dataset);
    const circles = Array.from(document.querySelectorAll('[data-testid="node-circle"]'));
    const ids = circles.map((c) => c.getAttribute('data-node-id')).sort();
    expect(ids).toEqual(['engels', 'marx']);
  });

  it('renders Chinese name labels', () => {
    renderRelations('#test-svg', m1Dataset);
    const labels = Array.from(document.querySelectorAll('[data-testid="node-label"]'));
    const names = labels.map((l) => l.textContent).sort();
    expect(names).toEqual(['卡尔·马克思', '弗里德里希·恩格斯']);
  });
});
