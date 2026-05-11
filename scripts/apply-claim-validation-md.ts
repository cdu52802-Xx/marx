#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import type { ClaimNode } from '../src/types/Claim.ts';

const CHECKLIST_PATH = 'docs/m4-validation/marx-19-claims-checklist.md';
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

function applyMdCLI() {
  const md = readFileSync(CHECKLIST_PATH, 'utf-8');
  const dataset = JSON.parse(readFileSync(CLAIMS_JSON_PATH, 'utf-8')) as ClaimDatasetShape;
  const { updated, skipped } = applyChecklistMd(md, dataset);
  writeFileSync(CLAIMS_JSON_PATH, JSON.stringify(dataset, null, 2));
  console.log(`Updated ${updated} Marx claims (skipped ${skipped} <待翻译> placeholders)`);
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
