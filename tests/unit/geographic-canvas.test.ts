// M-B2 T1.3 · geographic-canvas.ts prototype scaffold unit test
// 3 case · graticule mount / 5 test node / setMode 重算

import { describe, it, expect, beforeEach } from 'vitest';
import { mountGeographicCanvas } from '../../src/components/geographic-canvas.ts';

describe('mountGeographicCanvas · M-B2 T1.3', () => {
  let container: SVGSVGElement;

  beforeEach(() => {
    container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    container.setAttribute('width', '600');
    container.setAttribute('height', '400');
    document.body.appendChild(container);
  });

  it('mount 后 svg 内有 graticule path', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
    });
    expect(container.querySelector('path.graticule')).toBeTruthy();
  });

  it('mount 后 svg 内有 5 个测试节点（dot circles）', () => {
    mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
    });
    const dots = container.querySelectorAll('circle.test-node');
    expect(dots.length).toBe(5);
  });

  it('setMode 切换 → 节点 cx/cy 重算', () => {
    const api = mountGeographicCanvas({
      container,
      width: 600,
      height: 400,
      initialMode: 'sphere',
      marxCurrentLocation: [10, 50],
    });
    const firstDotSphere = (
      container.querySelector('circle.test-node') as SVGCircleElement
    ).getAttribute('cx');
    api.setMode('plane');
    const firstDotPlane = (
      container.querySelector('circle.test-node') as SVGCircleElement
    ).getAttribute('cx');
    expect(firstDotSphere).not.toBe(firstDotPlane);
  });
});
