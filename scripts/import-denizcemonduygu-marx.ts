#!/usr/bin/env tsx
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import type { ClaimNode, ClaimCategory } from '../src/types/Claim.ts';
import { CLAIM_CATEGORIES } from '../src/types/Claim.ts';

// PM 三台机器之间路径不同，支持 DENIZ_DATA_PATH 环境变量 override。
const DENIZ_DATA_PATH =
  process.env.DENIZ_DATA_PATH ?? 'C:/Users/xuzequan/Desktop/denizcemonduygu-data.json';
const MARX_PERSON_ID_DENIZ = 57;
const MARX_AUTHOR_ID_MARX = 'wd-q9061';
const CLAIMS_JSON_PATH = 'src/data/claims.json';
const CHECKLIST_PATH = 'docs/m4-validation/marx-19-claims-checklist.md';

const VALID_CATS: ReadonlySet<string> = new Set(CLAIM_CATEGORIES);

// denizcemonduygu data 里有 'ba' (Basics) 等不属于 Marx 11 类 ClaimCategory 的 marker。
// 'ba' 是 denizcemonduygu 用来标"代表性观点"的次级 tag，已经跟主 cat 共存（如 me,ba）。
// import 时 filter 掉 'ba' 等非 11 类 cat，保留主 cat 即可。
// Named export 便于单测调用。
export function filterValidCats(cats: string[]): ClaimCategory[] {
  const dropped: string[] = [];
  const valid: ClaimCategory[] = [];
  for (const c of cats) {
    if (VALID_CATS.has(c)) valid.push(c as ClaimCategory);
    else dropped.push(c);
  }
  if (dropped.length > 0) {
    console.log(`  (dropped non-11-class cats: ${dropped.join(', ')})`);
  }
  return valid;
}

interface DenizRecord {
  id: number;
  person: number;
  line: string;
  cats: string[];
  keywords?: string;
  reference?: string;
}

interface DenizPerson {
  id: number;
  name: string;
  time?: string;
  loc?: string;
}

interface DenizData {
  people: DenizPerson[];
  records: DenizRecord[];
}

function importMarx() {
  let denizData: DenizData;
  try {
    denizData = JSON.parse(readFileSync(DENIZ_DATA_PATH, 'utf-8')) as DenizData;
  } catch (e) {
    console.error(`❌ 无法读取 denizcemonduygu data: ${DENIZ_DATA_PATH}`);
    console.error(`   修法: 设环境变量 DENIZ_DATA_PATH 指向 data.json 路径，或把文件放到默认位置`);
    console.error(`   原始错误: ${(e as Error).message}`);
    process.exit(1);
  }

  const marxRecords = denizData.records.filter((r) => r.person === MARX_PERSON_ID_DENIZ);
  console.log(`Found ${marxRecords.length} Marx records in denizcemonduygu`);

  const claims: ClaimNode[] = marxRecords.map((r, i) => ({
    id: `claim-marx-${String(i + 1).padStart(3, '0')}`,
    type: 'claim' as const,
    name_zh: '<待翻译>',
    name_orig: r.line.slice(0, 30),
    claim_text: '<待翻译>',
    author_id: MARX_AUTHOR_ID_MARX,
    source_work_id: undefined,
    year: 1850,
    cats: filterValidCats(r.cats),
    keywords: r.keywords || undefined,
    reference: r.reference || undefined,
    derived_from_denizcemonduygu_record_id: r.id,
  }));

  const dataset = { claims, relations: [] };
  mkdirSync('src/data', { recursive: true });
  writeFileSync(CLAIMS_JSON_PATH, JSON.stringify(dataset, null, 2));
  console.log(`Wrote ${claims.length} claims to ${CLAIMS_JSON_PATH}`);

  // PM 复核清单 md
  let md = `# Marx 19 Claim · 翻译复核清单\n\n`;
  md += `> **来源**: denizcemonduygu.com/philo data.json (PM 抓取于 2026-05-11)\n`;
  md += `> **复核策略**: AI 翻译 + PM 异步抽查 5 条 (opportunistic, spec § 9.2 例外)\n`;
  md += `> **PM 看完想改:** 编辑下面 \`claim_text\` 字段后跑 \`npm run m4:apply-md\` 同步回 src/data/claims.json\n\n`;
  md += `---\n\n`;
  for (const c of claims) {
    const denizRec = marxRecords.find((r) => r.id === c.derived_from_denizcemonduygu_record_id)!;
    md += `## ${c.id}\n\n`;
    md += `**英文原文** (denizcemonduygu record #${c.derived_from_denizcemonduygu_record_id}):\n\n`;
    md += `> ${denizRec.line}\n\n`;
    md += `- **claim_text**（PM 复核 / 改）: <待翻译>\n`;
    md += `- **year**（PM 推断 / 默认 1850）: 1850\n`;
    md += `- **source_work_id**（PM 填，如 wd-q295347 = 1844 手稿）: \n`;
    md += `- **cats**（denizcemonduygu 已标）: ${c.cats.join(', ')}\n`;
    md += `- **keywords**: ${c.keywords ?? '(无)'}\n`;
    md += `- **reference**: ${c.reference ?? '(无)'}\n\n`;
    md += `---\n\n`;
  }
  mkdirSync('docs/m4-validation', { recursive: true });
  writeFileSync(CHECKLIST_PATH, md);
  console.log(`Wrote checklist to ${CHECKLIST_PATH}`);

  // M4 v2 patch: 同时输出 deniz person lookup 表 (供 T4 / T5 用)
  generateDenizPersonLookup(denizData);
}

function generateDenizPersonLookup(denizData: DenizData) {
  const persons = denizData.people;
  const recordCounts = new Map<number, number>();
  for (const r of denizData.records) {
    recordCounts.set(r.person, (recordCounts.get(r.person) ?? 0) + 1);
  }
  const sorted = [...persons].sort(
    (a, b) => (recordCounts.get(b.id) ?? 0) - (recordCounts.get(a.id) ?? 0),
  );

  let lookup = `# denizcemonduygu Person Lookup · T4/T5 用\n\n`;
  lookup += `> 188 个 denizcemonduygu person id ↔ name 表 + records 数（按话语权排序）\n`;
  lookup += `> **用途**：T4 PM 复核 quote 时，可选填 \`deniz_person_id\` 让 T5 拿到 cross-person 关系 link\n`;
  lookup += `> Marx 项目 PersonNode id (wd-q<N>) 已在 src/data/nodes_skeleton.json，PM 自行对应\n\n`;
  lookup += `| deniz id | name | time | records 数 |\n`;
  lookup += `|---|---|---|---|\n`;
  for (const p of sorted) {
    lookup += `| ${p.id} | ${p.name} | ${p.time ?? ''} | ${recordCounts.get(p.id) ?? 0} |\n`;
  }
  mkdirSync('scripts/data', { recursive: true });
  writeFileSync('scripts/data/deniz-person-lookup.md', lookup);
  console.log(
    `Wrote deniz person lookup (${persons.length} persons) to scripts/data/deniz-person-lookup.md`,
  );

  const initialMap: Record<number, string> = { [MARX_PERSON_ID_DENIZ]: MARX_AUTHOR_ID_MARX };
  writeFileSync('scripts/data/deniz-person-id-map.json', JSON.stringify(initialMap, null, 2));
  console.log(`Wrote deniz person id map (1 entry: Marx) to scripts/data/deniz-person-id-map.json`);
}

// ESM CLI 入口判断：仅当脚本被 tsx / node 直接执行时跑 importMarx()，
// 被 test 文件 import 时不触发。Windows backslash 路径需 pathToFileURL 规范化。
if (import.meta.url.startsWith('file:')) {
  const { pathToFileURL } = await import('url');
  const entryHref = pathToFileURL(process.argv[1] ?? '').href;
  if (import.meta.url === entryHref) importMarx();
}
