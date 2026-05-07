import { renderRelations } from './viz/relations.ts';
import { m1Dataset } from './data/m1-skeleton.ts';

console.log('[Marx M1] entry');
renderRelations('#relations-svg', m1Dataset);
