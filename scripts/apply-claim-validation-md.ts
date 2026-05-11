#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import type { ClaimNode } from '../src/types/Claim.ts';
import type { ClaimCategory } from '../src/types/Claim.ts';

const CHECKLIST_PATH = 'docs/m4-validation/marx-19-claims-checklist.md';
const CONCEPT_CHECKLIST_PATH = 'docs/m4-validation/concept-12-claims-checklist.md';
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

    // claim_text: hardened regex — non-greedy + 行尾 anchor
    const claimTextMatch = body.match(/\*\*claim_text\*\*[^:]*:[ \t]*([^\n]+?)[ \t]*$/m);
    if (
      !claimTextMatch ||
      claimTextMatch[1].trim() === '' ||
      claimTextMatch[1].trim() === '<待 AI 草稿>'
    ) {
      skipped++;
      continue;
    }
    const claim_text = claimTextMatch[1].trim();

    // year
    let year = 1850; // safe default
    const yearMatch = body.match(/\*\*year\*\*[^:]*:[ \t]*(\d+)/);
    if (yearMatch) year = parseInt(yearMatch[1]);

    // source_work_id: non-greedy + 行尾 anchor + "-" guard
    let source_work_id: string | undefined;
    const swMatch = body.match(/\*\*source_work_id\*\*[^:]*:[ \t]*([\w-]+?)[ \t]*$/m);
    if (swMatch && swMatch[1].trim() !== '' && swMatch[1].trim() !== '-') {
      source_work_id = swMatch[1].trim();
    }

    // cats: 逗号分隔多选，hardened (行尾 anchor 防 - 腐败)
    let cats: ClaimCategory[] = ['po'];
    const catsMatch = body.match(/\*\*cats\*\*[^:]*:[ \t]*([^\n]+?)[ \t]*$/m);
    if (catsMatch && catsMatch[1].trim() !== '') {
      const parsed = catsMatch[1]
        .trim()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) as ClaimCategory[];
      if (parsed.length > 0) cats = parsed;
    }

    // keywords
    let keywords: string | undefined;
    const kwMatch = body.match(/\*\*keywords\*\*[^:]*:[ \t]*([^\n]+?)[ \t]*$/m);
    if (kwMatch && kwMatch[1].trim() !== '' && kwMatch[1].trim() !== '-') {
      keywords = kwMatch[1].trim();
    }

    // name_orig (from checklist, not nodes_skeleton — single responsibility)
    let name_orig = '';
    const origMatch = body.match(/\*\*name_orig\*\*[^:]*:[ \t]*([^\n]+?)[ \t]*$/m);
    if (origMatch && origMatch[1].trim() !== '' && origMatch[1].trim() !== '-') {
      name_orig = origMatch[1].trim();
    }

    // derived_from_concept_id (readonly field written by generator)
    let derived_from_concept_id: string | undefined;
    const derivedMatch = body.match(/\*\*derived_from_concept_id\*\*[^:]*:[ \t]*([\w-]+?)[ \t]*$/m);
    if (derivedMatch && derivedMatch[1].trim() !== '' && derivedMatch[1].trim() !== '-') {
      derived_from_concept_id = derivedMatch[1].trim();
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

function applyMdCLI() {
  // Step 1: apply marx-19 checklist (update existing claims)
  const md = readFileSync(CHECKLIST_PATH, 'utf-8');
  const dataset = JSON.parse(readFileSync(CLAIMS_JSON_PATH, 'utf-8')) as ClaimDatasetShape;
  const { updated, skipped } = applyChecklistMd(md, dataset);

  // Step 2: apply concept-12 checklist (create new concept claim nodes)
  const conceptMd = readFileSync(CONCEPT_CHECKLIST_PATH, 'utf-8');
  const { created, skipped: conceptSkipped } = applyConceptChecklistMd(conceptMd, dataset);

  writeFileSync(CLAIMS_JSON_PATH, JSON.stringify(dataset, null, 2));
  console.log(`Updated ${updated} Marx claims (skipped ${skipped} <待翻译> placeholders)`);
  console.log(
    `Created/updated ${created} concept claims (skipped ${conceptSkipped} incomplete entries)`,
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
