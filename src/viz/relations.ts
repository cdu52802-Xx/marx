import * as d3 from 'd3';
import type { Dataset, Node, Relation } from '../types/Node.ts';

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name_zh: string;
  type: Node['type'];
}
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

  svg.selectAll('*').remove();

  const simNodes: SimNode[] = dataset.nodes.map((n) => ({
    id: n.id,
    name_zh: n.name_zh,
    type: n.type,
  }));
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
        .distance(80), // 节点变多，连线缩短
    )
    .force('charge', d3.forceManyBody().strength(-150)) // 节点变多，斥力减小避免炸开
    .force('center', d3.forceCenter(width / 2, height / 2));

  const linkGroup = svg
    .append('g')
    .attr('class', 'links')
    .selectAll<SVGLineElement, SimLink>('line')
    .data(simLinks)
    .join('line')
    .attr('class', 'relation-line')
    .attr('data-testid', 'relation-line');

  const nodeGroup = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll<SVGCircleElement, SimNode>('circle')
    .data(simNodes)
    .join('circle')
    .attr('r', 8) // 节点变多，半径减小（M4 改为按类型分级 r=22 / 14 / 8）
    .attr('class', 'node-circle')
    .attr('data-testid', 'node-circle')
    .attr('data-node-id', (d) => d.id);

  const labelGroup = svg
    .append('g')
    .attr('class', 'labels')
    .selectAll<SVGTextElement, SimNode>('text')
    .data(simNodes)
    .join('text')
    .text((d) => d.name_zh)
    .attr('class', 'node-label')
    .attr('text-anchor', 'middle')
    .attr('dy', 18)
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
