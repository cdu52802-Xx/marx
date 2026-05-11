import type {
  Node,
  PersonNode,
  WorkNode,
  EventNode,
  ConceptNode,
  PlaceNode,
  Relation,
  Dataset,
  RelationType,
} from '../types/Node.ts';

const VALID_RELATION_TYPES: ReadonlySet<RelationType> = new Set([
  'mentor',
  'opponent',
  'friend_collaborator',
  'influences',
  'author',
  'proposed_concept',
  'lived_in',
  'participated_in',
  'agreement_with',
  'disagreement_with',
  'extends',
]);

function requireField(obj: unknown, field: string, contextId: string): void {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error(`schema: ${contextId} is not an object`);
  }
  if (!(field in obj) || (obj as Record<string, unknown>)[field] === undefined) {
    throw new Error(`schema: ${contextId} missing required field "${field}"`);
  }
}

function validatePerson(n: PersonNode): void {
  const ctx = `person "${n.id}"`;
  requireField(n, 'birth_year', ctx);
  requireField(n, 'death_year', ctx);
  requireField(n, 'main_location_lat_lng', ctx);
  requireField(n, 'bio_event_style', ctx);
  requireField(n, 'citation_urls', ctx);
  if (!Array.isArray(n.bio_event_style)) {
    throw new Error(`schema: ${ctx} bio_event_style must be array`);
  }
  if (!Array.isArray(n.citation_urls)) {
    throw new Error(`schema: ${ctx} citation_urls must be array`);
  }
  if (!Array.isArray(n.main_location_lat_lng) || n.main_location_lat_lng.length !== 2) {
    throw new Error(`schema: ${ctx} main_location_lat_lng must be [lat, lng] tuple`);
  }
}

function validateWork(n: WorkNode): void {
  const ctx = `work "${n.id}"`;
  requireField(n, 'pub_year', ctx);
  requireField(n, 'author_id', ctx);
  requireField(n, 'writing_period', ctx);
  requireField(n, 'summary', ctx);
  requireField(n, 'citation_urls', ctx);
}

function validateEvent(n: EventNode): void {
  const ctx = `event "${n.id}"`;
  requireField(n, 'start_date', ctx);
  requireField(n, 'end_date', ctx);
  requireField(n, 'location_lat_lng', ctx);
  requireField(n, 'description_event_style', ctx);
  requireField(n, 'participants_ids', ctx);
}

function validateConcept(n: ConceptNode): void {
  const ctx = `concept "${n.id}"`;
  requireField(n, 'proposed_year', ctx);
  requireField(n, 'proposed_work_id', ctx);
  requireField(n, 'definition_plain', ctx);
  requireField(n, 'citation_urls', ctx);
  requireField(n, 'successor_notes', ctx);
}

function validatePlace(n: PlaceNode): void {
  const ctx = `place "${n.id}"`;
  requireField(n, 'lat_lng', ctx);
  requireField(n, 'marx_activity_description', ctx);
}

export function validateNode(n: Node): void {
  if (!n || typeof n !== 'object') {
    throw new Error('schema: node is not an object');
  }
  requireField(n, 'id', 'node');
  requireField(n, 'type', `node "${(n as Node).id}"`);
  requireField(n, 'name_zh', `node "${(n as Node).id}"`);
  requireField(n, 'name_orig', `node "${(n as Node).id}"`);

  switch (n.type) {
    case 'person':
      return validatePerson(n);
    case 'work':
      return validateWork(n);
    case 'event':
      return validateEvent(n);
    case 'concept':
      return validateConcept(n);
    case 'place':
      return validatePlace(n);
    default:
      throw new Error(`schema: unknown node type "${(n as { type: string }).type}"`);
  }
}

export function validateRelation(r: Relation): void {
  if (!r || typeof r !== 'object') {
    throw new Error('schema: relation is not an object');
  }
  requireField(r, 'source', 'relation');
  requireField(r, 'target', 'relation');
  requireField(r, 'type', 'relation');
  if (!VALID_RELATION_TYPES.has(r.type)) {
    throw new Error(`schema: unknown relation type "${r.type}"`);
  }
}

export function validateDataset(d: Dataset): void {
  if (!d || typeof d !== 'object') {
    throw new Error('schema: dataset is not an object');
  }
  if (!Array.isArray(d.nodes)) {
    throw new Error('schema: dataset.nodes must be array');
  }
  if (!Array.isArray(d.relations)) {
    throw new Error('schema: dataset.relations must be array');
  }

  const seenIds = new Set<string>();
  for (const node of d.nodes) {
    validateNode(node);
    if (seenIds.has(node.id)) {
      throw new Error(`schema: duplicate node id "${node.id}"`);
    }
    seenIds.add(node.id);
  }

  for (const rel of d.relations) {
    validateRelation(rel);
    if (!seenIds.has(rel.source)) {
      throw new Error(`schema: relation source "${rel.source}" not in nodes`);
    }
    if (!seenIds.has(rel.target)) {
      throw new Error(`schema: relation target "${rel.target}" not in nodes`);
    }
  }
}
