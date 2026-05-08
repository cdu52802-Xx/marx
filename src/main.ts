import './styles.css';
import { renderRelations } from './viz/relations.ts';
import { validateDataset } from './lib/schema.ts';
import datasetJson from './data/nodes_skeleton.json';
import type { Dataset } from './types/Node.ts';

console.log('[Marx M2] entry');

const dataset = datasetJson as Dataset;

try {
  validateDataset(dataset);
  console.log(
    `[Marx M2] dataset validated: ${dataset.nodes.length} nodes / ${dataset.relations.length} relations`,
  );
} catch (err) {
  console.error('[Marx M2] dataset 校验失败，渲染将中止:', err);
  throw err;
}

renderRelations('#relations-svg', dataset);
