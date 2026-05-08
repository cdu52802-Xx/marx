// Marx 星图 M2 数据采集脚本
// 跑：npm run fetch:skeleton                  → 调 Wikidata endpoint（默认）
//     MARX_USE_CACHE=1 npm run fetch:skeleton → 读 scripts/sparql/cache/{01..05}.json（方案 b 离线缓存）
// 输出：src/data/nodes_skeleton.json

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDataset } from '../src/lib/schema.ts';
import type { Dataset, PersonNode, WorkNode, Relation } from '../src/types/Node.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPARQL_DIR = resolve(__dirname, 'sparql');
const CACHE_DIR = resolve(SPARQL_DIR, 'cache');
const OUTPUT_PATH = resolve(__dirname, '..', 'src', 'data', 'nodes_skeleton.json');
const ENDPOINT = 'https://query.wikidata.org/sparql';
const RATE_LIMIT_SLEEP_MS = 1000; // 5 query/s 上限的安全距离
const USE_CACHE = process.env.MARX_USE_CACHE === '1';

// === Wikidata SPARQL 结果格式 ===
interface SparqlBinding {
  [key: string]: { type: string; value: string; 'xml:lang'?: string };
}
interface SparqlResult {
  results: { bindings: SparqlBinding[] };
}

// dispatch：cache 模式读本地 JSON，endpoint 模式调 Wikidata
async function runQuery(sparqlFile: string): Promise<SparqlBinding[]> {
  return USE_CACHE ? runQueryFromCache(sparqlFile) : runQueryFromEndpoint(sparqlFile);
}

// 方案 b：读 scripts/sparql/cache/<num>.json（user 在能上 wikidata 的网络网页 UI 跑后下载的 JSON）
// 兼容两种格式：
//   (a) simplified flat array：[{"key": "value", ...}, ...]                    ← Wikidata Query Service 网页 UI Download → JSON 默认格式
//   (b) 标准 SPARQL Result：{"head": {...}, "results": {"bindings": [...]}}  ← 选 "JSON（详细）" 才会得到这个
function runQueryFromCache(sparqlFile: string): SparqlBinding[] {
  const num = sparqlFile.match(/^\d+/)?.[0];
  if (!num) {
    throw new Error(`fetch-skeleton: cannot extract number prefix from "${sparqlFile}"`);
  }
  const cachePath = resolve(CACHE_DIR, `${num}.json`);
  console.log(`[cache] ${sparqlFile} ← cache/${num}.json`);
  const raw = readFileSync(cachePath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;

  let bindings: SparqlBinding[];
  if (Array.isArray(parsed)) {
    // simplified flat array → 转成内部 SparqlBinding 格式
    bindings = (parsed as Record<string, string>[]).map(flatToBinding);
  } else if (typeof parsed === 'object' && parsed !== null && 'results' in parsed) {
    // 标准 SPARQL Result format
    bindings = (parsed as SparqlResult).results.bindings;
  } else {
    throw new Error(`fetch-skeleton: unknown cache format in ${cachePath}`);
  }
  console.log(`  ← ${bindings.length} rows (cached)`);
  return bindings;
}

// simplified flat object → SparqlBinding（脚本内部期望的 W3C SPARQL JSON Result format）
function flatToBinding(flat: Record<string, string>): SparqlBinding {
  const binding: SparqlBinding = {};
  for (const [key, value] of Object.entries(flat)) {
    if (typeof value !== 'string') continue;
    const isUri = value.startsWith('http://') || value.startsWith('https://');
    binding[key] = isUri ? { type: 'uri', value } : { type: 'literal', value };
  }
  return binding;
}

// 默认：调 Wikidata SPARQL endpoint
async function runQueryFromEndpoint(sparqlFile: string): Promise<SparqlBinding[]> {
  const sparql = readFileSync(resolve(SPARQL_DIR, sparqlFile), 'utf-8');
  const url = `${ENDPOINT}?query=${encodeURIComponent(sparql)}`;
  console.log(`[fetch] ${sparqlFile}`);

  const res = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'marx-star-map-m2/0.1 (https://github.com/cdu52802-Xx/marx)',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SPARQL ${sparqlFile} failed: HTTP ${res.status}\n${body.slice(0, 500)}`);
  }

  const json = (await res.json()) as SparqlResult;
  console.log(`  ← ${json.results.bindings.length} rows`);
  return json.results.bindings;
}

// 从 Wikidata URI 抽 QID，如 http://www.wikidata.org/entity/Q9061 → wd-q9061
function qidFromUri(uri: string): string {
  const match = uri.match(/Q\d+$/);
  if (!match) {
    throw new Error(`fetch-skeleton: cannot extract QID from "${uri}"`);
  }
  return `wd-${match[0].toLowerCase()}`;
}

function pickInt(b: SparqlBinding, key: string): number | undefined {
  const v = b[key]?.value;
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? undefined : n;
}

function pickStr(b: SparqlBinding, key: string): string {
  return b[key]?.value ?? '';
}

// 已知 Marx 自己的 fixed entry
const MARX_NODE: PersonNode = {
  id: 'wd-q9061',
  type: 'person',
  name_zh: '卡尔·马克思',
  name_orig: 'Karl Marx',
  birth_year: 1818,
  death_year: 1883,
  main_location_lat_lng: [51.5074, -0.1278], // 伦敦
  bio_event_style: [
    '1818年5月 - 生于普鲁士特里尔',
    '1841年 - 耶拿大学博士论文',
    '1844年8月 - 巴黎遇恩格斯，思想合流',
    '1849年8月 - 流亡伦敦，余生 34 年',
    '1867年9月 - 《资本论》第一卷出版',
  ],
  citation_urls: [
    'https://www.marxists.org/archive/marx/',
    'https://plato.stanford.edu/entries/marx/',
  ],
};

async function fetchPersons(): Promise<{ persons: PersonNode[]; relations: Relation[] }> {
  const personMap = new Map<string, PersonNode>();
  const relations: Relation[] = [];
  personMap.set(MARX_NODE.id, MARX_NODE);

  // 1. influences (P737) Marx 受影响于
  const influences = await runQuery('01-marx-influences.sparql');
  if (!USE_CACHE) await sleep(RATE_LIMIT_SLEEP_MS);
  for (const b of influences) {
    const id = qidFromUri(b.person.value);
    if (!personMap.has(id)) {
      personMap.set(id, makeMinimalPerson(id, b));
    }
    relations.push({ source: id, target: MARX_NODE.id, type: 'influences' });
  }

  // 2. influenced (P737 反向) Marx 影响了
  const influenced = await runQuery('02-marx-influenced.sparql');
  if (!USE_CACHE) await sleep(RATE_LIMIT_SLEEP_MS);
  for (const b of influenced) {
    const id = qidFromUri(b.person.value);
    if (!personMap.has(id)) {
      personMap.set(id, makeMinimalPerson(id, b));
    }
    relations.push({ source: MARX_NODE.id, target: id, type: 'influences' });
  }

  // 3. collaborators (P1327)
  const collaborators = await runQuery('03-marx-collaborators.sparql');
  if (!USE_CACHE) await sleep(RATE_LIMIT_SLEEP_MS);
  for (const b of collaborators) {
    const id = qidFromUri(b.person.value);
    if (!personMap.has(id)) {
      personMap.set(id, makeMinimalPerson(id, b));
    }
    relations.push({ source: MARX_NODE.id, target: id, type: 'friend_collaborator' });
  }

  // 4. students/teachers (P802 / P1066)
  const studentsTeachers = await runQuery('04-marx-students-teachers.sparql');
  if (!USE_CACHE) await sleep(RATE_LIMIT_SLEEP_MS);
  for (const b of studentsTeachers) {
    const id = qidFromUri(b.person.value);
    if (!personMap.has(id)) {
      personMap.set(id, makeMinimalPerson(id, b));
    }
    const rel = b.relation?.value;
    if (rel === 'teacher_of_marx') {
      relations.push({ source: id, target: MARX_NODE.id, type: 'mentor' });
    } else {
      relations.push({ source: MARX_NODE.id, target: id, type: 'mentor' });
    }
  }

  return { persons: Array.from(personMap.values()), relations };
}

async function fetchWorks(
  authorMarxId: string,
): Promise<{ works: WorkNode[]; relations: Relation[] }> {
  const works: WorkNode[] = [];
  const relations: Relation[] = [];
  const rows = await runQuery('05-marx-works.sparql');
  for (const b of rows) {
    const id = qidFromUri(b.work.value);
    works.push({
      id,
      type: 'work',
      name_zh: pickStr(b, 'workLabel'),
      name_orig: pickStr(b, 'workLabel'), // M2 简化：原文同 label，M3 阶段 B 人工补
      pub_year: pickInt(b, 'pubYear') ?? 0,
      author_id: authorMarxId,
      writing_period: pickInt(b, 'pubYear') ? String(pickInt(b, 'pubYear')) : 'unknown',
      summary: 'M3 阶段 B 人工补充', // M2 占位，M3 校对
      citation_urls: [],
    });
    relations.push({ source: authorMarxId, target: id, type: 'author' });
  }
  return { works, relations };
}

// 用 SPARQL 行造一个 minimum PersonNode（M2 字段尽量填，缺的占位等 M3 校对）
function makeMinimalPerson(id: string, b: SparqlBinding): PersonNode {
  return {
    id,
    type: 'person',
    name_zh: pickStr(b, 'personLabel'),
    name_orig: pickStr(b, 'personLabel'), // M3 阶段 B 人工补原文
    birth_year: pickInt(b, 'birthYear') ?? 0,
    death_year: pickInt(b, 'deathYear') ?? 0,
    main_location_lat_lng: [0, 0], // M3 阶段 B 人工补
    bio_event_style: [], // M3 阶段 B 人工补
    citation_urls: [],
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  console.log('[fetch-skeleton] Marx 星图 M2 数据采集开始');
  console.log(`mode = ${USE_CACHE ? 'CACHE (read scripts/sparql/cache/)' : 'ENDPOINT (Wikidata)'}`);
  if (!USE_CACHE) console.log(`endpoint = ${ENDPOINT}`);
  console.log(`output = ${OUTPUT_PATH}\n`);

  const { persons, relations: personRels } = await fetchPersons();
  console.log(`\npersons: ${persons.length} (含 Marx 自己)`);

  const { works, relations: workRels } = await fetchWorks(MARX_NODE.id);
  console.log(`works: ${works.length}`);

  const dataset: Dataset = {
    nodes: [...persons, ...works],
    relations: [...personRels, ...workRels],
  };

  console.log(`\ntotal: ${dataset.nodes.length} nodes / ${dataset.relations.length} relations`);

  console.log('[validate] 跑 schema 校验...');
  validateDataset(dataset);
  console.log('[validate] OK\n');

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(dataset, null, 2), 'utf-8');
  console.log(`[fetch-skeleton] wrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('[fetch-skeleton] FAILED:', err);
  process.exit(1);
});
