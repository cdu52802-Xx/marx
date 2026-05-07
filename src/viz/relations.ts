import * as d3 from 'd3';
import type { Dataset, Node, Relation } from '../types/Node.ts';

interface SimNode extends d3.SimulationNodeDatum, Node {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  type: Relation['type'];
}

export function renderRelations(svgSelector: string, dataset: Dataset): void {
  const svg = d3.select<SVGSVGElement, unknown>(svgSelector);
  if (svg.empty()) {
    throw new Error(`renderRelations: SVG not found at "${svgSelector}"`);
  }

  const width = +(svg.attr('width') ?? 600);
  const height = +(svg.attr('height') ?? 400);

  // 清空已有内容（M2+ 重新渲染时需要）
  svg.selectAll('*').remove();

  const simNodes: SimNode[] = dataset.nodes.map((n) => ({ ...n }));
  const simLinks: SimLink[] = dataset.relations.map((r) => ({
    source: r.source,
    target: r.target,
    type: r.type,
  }));

  const simulation = d3
    .forceSimulation<SimNode>(simNodes)
    .force(
      'link',
      d3
        .forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance(150),
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const linkGroup = svg
    .append('g')
    .attr('class', 'links')
    .selectAll<SVGLineElement, SimLink>('line')
    .data(simLinks)
    .join('line')
    .attr('stroke', '#888')
    .attr('stroke-width', 2)
    .attr('data-testid', 'relation-line');

  const nodeGroup = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll<SVGCircleElement, SimNode>('circle')
    .data(simNodes)
    .join('circle')
    .attr('r', 20)
    .attr('fill', '#7c5dbe') // M4 会替换为 5 色编码（M1 暂用单一紫色）
    .attr('data-testid', 'node-circle')
    .attr('data-node-id', (d) => d.id);

  const labelGroup = svg
    .append('g')
    .attr('class', 'labels')
    .selectAll<SVGTextElement, SimNode>('text')
    .data(simNodes)
    .join('text')
    .text((d) => d.name_zh)
    .attr('font-size', 12)
    .attr('text-anchor', 'middle')
    .attr('dy', 35)
    .attr('data-testid', 'node-label');

  simulation.on('tick', () => {
    linkGroup
      .attr('x1', (d) => (d.source as SimNode).x ?? 0)
      .attr('y1', (d) => (d.source as SimNode).y ?? 0)
      .attr('x2', (d) => (d.target as SimNode).x ?? 0)
      .attr('y2', (d) => (d.target as SimNode).y ?? 0);
    nodeGroup.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0);
    labelGroup.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0);
  });
}
