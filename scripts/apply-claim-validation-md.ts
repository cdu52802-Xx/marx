#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import type { ClaimNode } from '../src/types/Claim.ts';
import type { ClaimCategory } from '../src/types/Claim.ts';
import { CLAIM_CATEGORIES } from '../src/types/Claim.ts';

// C1: 白名单 Set，从 CLAIM_CATEGORIES readonly array 构建
const VALID_CATS_SET = new Set<string>(CLAIM_CATEGORIES);

// C2: 12 concept ID 白名单（vision-frozen，spec 已锁定）
const VALID_CONCEPT_IDS = new Set<string>([
  'concept-alienation',
  'concept-surplus-value',
  'concept-historical-materialism',
  'concept-class-struggle',
  'concept-commodity-fetishism',
  'concept-ideology',
  'concept-mode-of-production',
  'concept-base-superstructure',
  'concept-communism',
  'concept-revolution',
  'concept-labor-theory-of-value',
  'concept-state',
]);

/**
 * I3: 共享字段提取 helper — 统一 non-greedy regex + 行尾 anchor + 5 种 placeholder guard。
 * 返回 undefined 表示字段为空/placeholder/dash/不确定，调用方无需重复检查。
 * T4: 加 `<不确定:` 前缀 guard — hybrid 模式 AI 没把握的 reference / deniz id 等字段。
 */
function extractField(body: string, fieldName: string): string | undefined {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = body.match(new RegExp(`\\*\\*${escaped}\\*\\*[^:]*:[ \\t]*([^\\n]+?)[ \\t]*$`, 'm'));
  if (!m) return undefined;
  const v = m[1].trim();
  if (v === '' || v === '-' || v === '<待 AI 草稿>' || v === '<待翻译>') return undefined;
  if (v.startsWith('<不确定')) return undefined; // T4 hybrid mode: 跳过 AI 不确定字段
  return v;
}

const CHECKLIST_PATH = 'docs/m4-validation/marx-19-claims-checklist.md';
const CONCEPT_CHECKLIST_PATH = 'docs/m4-validation/concept-12-claims-checklist.md';
const PERSON_QUOTE_CHECKLIST_PATH = 'docs/m4-validation/person-quote-checklist.md';
const CLAIMS_JSON_PATH = 'src/data/claims.json';

export interface ClaimDatasetShape {
  claims: ClaimNode[];
  relations: unknown[];
}

/**
 * Pure function: 给定 checklist md 字符串 + dataset，返回更新后的 dataset 与统计。
 * - 不读不写文件，便于单测 + CLI 复用。
 * - Critical fix (T2 code review): regex 改 [\w-]+? + [ \t]*$/m anchor，
 *   防止 PM 留空 source_work_id 时 \s* 吃换行 + [\w-]+ 误匹配下一行 `- bullet`，
 *   导致 source_work_id="-" 数据腐败。
 */
export function applyChecklistMd(
  md: string,
  dataset: ClaimDatasetShape,
): { dataset: ClaimDatasetShape; updated: number; skipped: number } {
  const claims: ClaimNode[] = dataset.claims;
  const sections = md.split(/^## (claim-marx-\d+)$/m).slice(1);
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < sections.length; i += 2) {
    const id = sections[i].trim();
    const body = sections[i + 1];
    const claim = claims.find((c) => c.id === id);
    if (!claim) continue;

    // claim_text: 行内匹配 + 行尾 anchor，避免 .+ 跨行污染
    const claimTextMatch = body.match(/\*\*claim_text\*\*[^:]*:[ \t]*([^\n]+?)[ \t]*$/m);
    if (claimTextMatch && claimTextMatch[1].trim() !== '<待翻译>') {
      claim.claim_text = claimTextMatch[1].trim();
      claim.name_zh = claim.claim_text.slice(0, 20);
      updated++;
    } else {
      skipped++;
    }

    // year: 数字本身不会跨行，但 anchor 行尾以一致性 (\d+ 已 anchored to digits)
    const yearMatch = body.match(/\*\*year\*\*[^:]*:[ \t]*(\d+)/);
    if (yearMatch) claim.year = parseInt(yearMatch[1]);

    // source_work_id: non-greedy + 行尾 anchor + "-" guard 三重防御
    const swMatch = body.match(/\*\*source_work_id\*\*[^:]*:[ \t]*([\w-]+?)[ \t]*$/m);
    if (swMatch && swMatch[1].trim() !== '' && swMatch[1].trim() !== '-') {
      claim.source_work_id = swMatch[1].trim();
    }
  }

  return { dataset, updated, skipped };
}

/**
 * Pure function: 给定 concept checklist md 字符串 + dataset，
 * 新建 ClaimNode（derived_from_concept_id 已填）并追加到 dataset。
 * - 匹配 H2 = claim-cpt-[\w-]+（区别于 claim-marx-\d+ 的 marx-19 pattern）
 * - 沿用 T2 hardened regex 模式（non-greedy [^\n]+? + [ \t]*$/m anchor）
 * - 单职责：不读 nodes_skeleton.json，name_orig 由 checklist md 的 name_orig 字段提供
 */
export function applyConceptChecklistMd(
  md: string,
  dataset: ClaimDatasetShape,
): { dataset: ClaimDatasetShape; created: number; skipped: number } {
  const claims: ClaimNode[] = dataset.claims;
  // H2 标题格式：claim-cpt-<suffix> (e.g. claim-cpt-alienation)
  const sections = md.split(/^## (claim-cpt-[\w-]+)$/m).slice(1);
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < sections.length; i += 2) {
    const id = sections[i].trim();
    const body = sections[i + 1];

    // I3: 用 extractField helper 统一提取（非贪婪 + 行尾 anchor + 4 种 placeholder guard）
    const claim_text = extractField(body, 'claim_text');
    if (claim_text === undefined) {
      skipped++;
      continue;
    }

    // year: 数字字段单独处理（extractField 返回字符串，需转 int）
    const yearStr = extractField(body, 'year');
    const year = yearStr ? parseInt(yearStr) : 1850;

    // source_work_id
    const source_work_id = extractField(body, 'source_work_id');

    // C1: cats — extractField 已处理 "-" guard，再过白名单 filter 非法 cat
    const catsStr = extractField(body, 'cats');
    const cats: ClaimCategory[] = catsStr
      ? (catsStr
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s !== '' && VALID_CATS_SET.has(s)) as ClaimCategory[])
      : [];
    // 若 filter 后为空（全非法），用默认值 ['po']
    if (cats.length === 0) cats.push('po');

    // keywords
    const keywords = extractField(body, 'keywords');

    // name_orig
    const name_orig = extractField(body, 'name_orig') ?? '';

    // C2: derived_from_concept_id — 白名单硬校验，typo → console.warn + skip entry
    const derivedCandidate = extractField(body, 'derived_from_concept_id');
    let derived_from_concept_id: string | undefined;
    if (derivedCandidate !== undefined) {
      if (VALID_CONCEPT_IDS.has(derivedCandidate)) {
        derived_from_concept_id = derivedCandidate;
      } else {
        console.warn(
          `  ⚠️ derived_from_concept_id 非法 (white-list miss): ${derivedCandidate} — entry skip`,
        );
        skipped++;
        continue;
      }
    }

    // Check if this claim already exists (idempotent apply)
    const existing = claims.find((c) => c.id === id);
    if (existing) {
      // Update in-place (idempotent)
      existing.claim_text = claim_text;
      existing.name_zh = claim_text.slice(0, 20);
      existing.year = year;
      existing.cats = cats;
      if (source_work_id) existing.source_work_id = source_work_id;
      if (keywords) existing.keywords = keywords;
      if (name_orig) existing.name_orig = name_orig;
      created++;
      continue;
    }

    // Create new ClaimNode
    const newClaim: ClaimNode = {
      id,
      type: 'claim',
      name_zh: claim_text.slice(0, 20),
      name_orig,
      claim_text,
      author_id: 'wd-q9061', // Marx 本人（12 concept 都是 Marx 的）
      year,
      cats,
    };
    if (source_work_id) newClaim.source_work_id = source_work_id;
    if (keywords) newClaim.keywords = keywords;
    if (derived_from_concept_id) newClaim.derived_from_concept_id = derived_from_concept_id;

    claims.push(newClaim);
    created++;
  }

  return { dataset, created, skipped };
}

/**
 * T4: applyPersonQuoteMd — 99 person quote entries (33 person × 3).
 * - H2 = ## claim-q<digits>-<NN>（e.g. claim-q9235-01）
 * - 跟 concept apply 区别：
 *   1) author_id 不固定 Marx，从 checklist 的 **author_id**: wd-q<N> 字段取
 *   2) 多了 reference / deniz_person_id 字段（deniz 入 derived_from_denizcemonduygu_record_id × NO,
 *      T5 用 deniz id 做 cross-person link mapping，T4 此处只入 reference）
 *   3) 不写 derived_from_concept_id / derived_from_denizcemonduygu_record_id
 *      （test 第 3 个 it 用此判别哪些是 person quote）
 *   4) `<不确定:` 前缀字段被 extractField 跳过（claim_text 跳过 → 整条 entry skip）
 */
export function applyPersonQuoteMd(
  md: string,
  dataset: ClaimDatasetShape,
): { dataset: ClaimDatasetShape; created: number; skipped: number } {
  const claims: ClaimNode[] = dataset.claims;
  // H2 = claim-q<digits>-<NN>，需 anchor 末尾 \d+ 防误匹配 claim-cpt-xxx 或 claim-marx-xxx
  const sections = md.split(/^## (claim-q\d+-\d+)$/m).slice(1);
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < sections.length; i += 2) {
    const id = sections[i].trim();
    const body = sections[i + 1];

    const claim_text = extractField(body, 'claim_text');
    if (claim_text === undefined) {
      skipped++;
      continue;
    }

    // author_id: must exist 且 wd-q<N> 形式
    const author_id = extractField(body, 'author_id');
    if (author_id === undefined || !author_id.startsWith('wd-q')) {
      console.warn(`  ⚠️ ${id} author_id 缺失或非法: ${author_id} — entry skip`);
      skipped++;
      continue;
    }

    const yearStr = extractField(body, 'year');
    const year = yearStr ? parseInt(yearStr) : 1850;

    const source_work_id = extractField(body, 'source_work_id');

    const catsStr = extractField(body, 'cats');
    const cats: ClaimCategory[] = catsStr
      ? (catsStr
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s !== '' && VALID_CATS_SET.has(s)) as ClaimCategory[])
      : [];
    if (cats.length === 0) cats.push('po');

    const keywords = extractField(body, 'keywords');
    const reference = extractField(body, 'reference');

    // Check if exists (idempotent)
    const existing = claims.find((c) => c.id === id);
    if (existing) {
      existing.claim_text = claim_text;
      existing.name_zh = claim_text.slice(0, 20);
      existing.author_id = author_id;
      existing.year = year;
      existing.cats = cats;
      if (source_work_id) existing.source_work_id = source_work_id;
      if (keywords) existing.keywords = keywords;
      if (reference) existing.reference = reference;
      created++;
      continue;
    }

    // Create new person quote ClaimNode
    // name_orig 留空（person quote 无统一原文名，跟 marx-19 quote 一致）
    const newClaim: ClaimNode = {
      id,
      type: 'claim',
      name_zh: claim_text.slice(0, 20),
      name_orig: '',
      claim_text,
      author_id,
      year,
      cats,
    };
    if (source_work_id) newClaim.source_work_id = source_work_id;
    if (keywords) newClaim.keywords = keywords;
    if (reference) newClaim.reference = reference;
    // 注意：故意不写 derived_from_concept_id / derived_from_denizcemonduygu_record_id
    // 让 test 第 3 个 it 通过 filter 识别为 person quote

    claims.push(newClaim);
    created++;
  }

  return { dataset, created, skipped };
}

function applyMdCLI() {
  // Step 1: apply marx-19 checklist (update existing claims)
  const md = readFileSync(CHECKLIST_PATH, 'utf-8');
  const dataset = JSON.parse(readFileSync(CLAIMS_JSON_PATH, 'utf-8')) as ClaimDatasetShape;
  const { updated, skipped } = applyChecklistMd(md, dataset);

  // Step 2: apply concept-12 checklist (create new concept claim nodes)
  const conceptMd = readFileSync(CONCEPT_CHECKLIST_PATH, 'utf-8');
  const { created, skipped: conceptSkipped } = applyConceptChecklistMd(conceptMd, dataset);

  // Step 3: apply person quote checklist (T4 / 33 person × 3 quote = 99)
  const personQuoteMd = readFileSync(PERSON_QUOTE_CHECKLIST_PATH, 'utf-8');
  const { created: personCreated, skipped: personSkipped } = applyPersonQuoteMd(
    personQuoteMd,
    dataset,
  );

  writeFileSync(CLAIMS_JSON_PATH, JSON.stringify(dataset, null, 2));
  console.log(`Updated ${updated} Marx claims (skipped ${skipped} <待翻译> placeholders)`);
  console.log(
    `Created/updated ${created} concept claims (skipped ${conceptSkipped} incomplete entries)`,
  );
  console.log(
    `Person quote claims: ${personCreated} added/updated (skipped ${personSkipped} <不确定>/<待 AI 草稿> entries)`,
  );
}

// ESM CLI 入口判断：仅当脚本被 tsx / node 直接执行时跑 CLI，
// 被 test 文件 import 时不触发。
// Windows: process.argv[1] 是 backslash 路径 (e.g. F:\...\apply-claim-validation-md.ts)，
// import.meta.url 是 file:/// + forward slash → 用 pathToFileURL 规范化对比。
if (import.meta.url.startsWith('file:')) {
  const { pathToFileURL } = await import('url');
  const entryHref = pathToFileURL(process.argv[1] ?? '').href;
  if (import.meta.url === entryHref) applyMdCLI();
}
