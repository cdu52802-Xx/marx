// M-B2 Stage 0 recon prototype · DR-097 (A+) 路径
// 临时验 D3 geo 模块本地可用性 + render 球面/平面网格
// Step 4 后 rm src/recon.ts + 撤 index.html 引入

import { geoOrthographic, geoMercator, geoPath, geoGraticule } from 'd3-geo';
import { select } from 'd3-selection';

const WIDTH = 600;
const HEIGHT = 400;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app not found');

// 球面 projection（geoOrthographic）
const orthoSvg = select(app)
  .append('svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .style('background', '#f5f5f0')
  .style('margin', '20px')
  .style('border', '1px solid #ccc');

orthoSvg
  .append('text')
  .attr('x', 10)
  .attr('y', 20)
  .style('font-family', 'sans-serif')
  .style('font-size', '12px')
  .text('geoOrthographic (球面 · 1700 时代)');

const orthoProjection = geoOrthographic()
  .scale(150)
  .translate([WIDTH / 2, HEIGHT / 2])
  .rotate([-10, -45, 0]); // 大致以欧洲为中心

const orthoPath = geoPath(orthoProjection);
const graticule = geoGraticule().step([15, 15]);

orthoSvg
  .append('path')
  .datum(graticule())
  .attr('d', orthoPath)
  .attr('fill', 'none')
  .attr('stroke', '#888')
  .attr('stroke-width', 0.5);

// 球面边界圆
orthoSvg
  .append('circle')
  .attr('cx', WIDTH / 2)
  .attr('cy', HEIGHT / 2)
  .attr('r', 150)
  .attr('fill', 'none')
  .attr('stroke', '#333')
  .attr('stroke-width', 1);

// 平面 projection（geoMercator）
const mercSvg = select(app)
  .append('svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .style('background', '#f5f5f0')
  .style('margin', '20px')
  .style('border', '1px solid #ccc');

mercSvg
  .append('text')
  .attr('x', 10)
  .attr('y', 20)
  .style('font-family', 'sans-serif')
  .style('font-size', '12px')
  .text('geoMercator (平面 · 1900+ 时代)');

const mercProjection = geoMercator()
  .scale(80)
  .translate([WIDTH / 2, HEIGHT / 2]);

const mercPath = geoPath(mercProjection);

mercSvg
  .append('path')
  .datum(graticule())
  .attr('d', mercPath)
  .attr('fill', 'none')
  .attr('stroke', '#888')
  .attr('stroke-width', 0.5);

// 测点：Paris (lon=2.35, lat=48.86)
const paris: [number, number] = [2.35, 48.86];
const parisOrtho = orthoProjection(paris);
const parisMerc = mercProjection(paris);

console.log('[recon] D3 geo 模块本地可用性验证');
console.log('[recon] Paris (lon=2.35, lat=48.86):');
console.log('[recon]   ortho pixel:', parisOrtho);
console.log('[recon]   merc  pixel:', parisMerc);
console.log('[recon] WIDTH x HEIGHT:', WIDTH, 'x', HEIGHT);

// 标注 Paris 位置（如可见）
if (parisOrtho) {
  orthoSvg
    .append('circle')
    .attr('cx', parisOrtho[0])
    .attr('cy', parisOrtho[1])
    .attr('r', 4)
    .attr('fill', '#c94a4a');
  orthoSvg
    .append('text')
    .attr('x', parisOrtho[0] + 8)
    .attr('y', parisOrtho[1] + 4)
    .style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('fill', '#c94a4a')
    .text('Paris');
}

if (parisMerc) {
  mercSvg
    .append('circle')
    .attr('cx', parisMerc[0])
    .attr('cy', parisMerc[1])
    .attr('r', 4)
    .attr('fill', '#c94a4a');
  mercSvg
    .append('text')
    .attr('x', parisMerc[0] + 8)
    .attr('y', parisMerc[1] + 4)
    .style('font-family', 'sans-serif')
    .style('font-size', '10px')
    .style('fill', '#c94a4a')
    .text('Paris');
}
