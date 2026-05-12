#!/usr/bin/env tsx
// T5 import: denizcemonduygu Marx-涉及 link → ClaimRelation
// 策略:
//   - 精确级: record_id → claim_id (T2 import 时 claim.derived_from_denizcemonduygu_record_id 填的)
//   - Fallback: record.person → denizPersonMap → marx_author_id → first claim of that author
//   - dedup: 按 (source, target, type) 三元组去重
import { readFileSync, writeFileSync } from 'fs';
import type { ClaimNode, ClaimRelation } from '../src/types/Claim.ts';

const DENIZ_DATA_PATH = 'C:/Users/xuzequan/Desktop/denizcemonduygu-data.json';
const CLAIMS_JSON_PATH = 'src/data/claims.json';

function importLinks() {
  const denizData = JSON.parse(readFileSync(DENIZ_DATA_PATH, 'utf-8'));
  const dataset = JSON.parse(readFileSync(CLAIMS_JSON_PATH, 'utf-8'));
  const claims: ClaimNode[] = dataset.claims;

  // ★ 读 deniz person id map (T2/T4 维护; T5 subagent 已扩展到 7 个 mapping)
  let denizPersonMap: Record<number, string> = {};
  try {
    denizPersonMap = JSON.parse(readFileSync('scripts/data/deniz-person-id-map.json', 'utf-8'));
  } catch {
    console.warn(
      'scripts/data/deniz-person-id-map.json 不存在，只走 record-level mapping (link 数会少)',
    );
  }
  console.log(`deniz person mapping size: ${Object.keys(denizPersonMap).length} persons`);

  // 精确级: record_id → claim_id
  const recordIdToClaimId = new Map<number, string>();
  for (const c of claims) {
    if (c.derived_from_denizcemonduygu_record_id !== undefined) {
      recordIdToClaimId.set(c.derived_from_denizcemonduygu_record_id, c.id);
    }
  }

  // Person-level fallback: author_id → first claim_id of that author
  const authorIdToFirstClaim = new Map<string, string>();
  for (const c of claims) {
    if (!authorIdToFirstClaim.has(c.author_id)) {
      authorIdToFirstClaim.set(c.author_id, c.id);
    }
  }
  console.log(
    `Mapped: ${recordIdToClaimId.size} records (precise) / ${authorIdToFirstClaim.size} authors (fallback)`,
  );

  // 抽 Marx 涉及的 link (Marx deniz person id = 57)
  const marxRecordIdsInDeniz = new Set(
    denizData.records
      .filter((r: { person: number }) => r.person === 57)
      .map((r: { id: number }) => r.id),
  );
  const marxLinks = denizData.links.filter(
    (l: { l0: number; l1: number }) =>
      marxRecordIdsInDeniz.has(l.l0) || marxRecordIdsInDeniz.has(l.l1),
  );
  console.log(`Found ${marxLinks.length} links involving Marx records`);

  // record_id → claim_id (精确) 或 record.person → marx author_id → first claim (fallback)
  function mapEndpoint(recordId: number): { id: string; precise: boolean } | null {
    const precise = recordIdToClaimId.get(recordId);
    if (precise) return { id: precise, precise: true };
    const rec = denizData.records.find((r: { id: number }) => r.id === recordId);
    if (!rec) return null;
    const marxAuthorId = denizPersonMap[rec.person];
    if (!marxAuthorId) return null;
    const firstClaim = authorIdToFirstClaim.get(marxAuthorId);
    return firstClaim ? { id: firstClaim, precise: false } : null;
  }

  // 转换 + dedup
  const seen = new Set<string>();
  const relations: ClaimRelation[] = [];
  const unmappedPersons = new Set<number>();
  let preciseCount = 0;
  let fallbackCount = 0;
  let dedupedCount = 0;
  let selfLoopCount = 0;

  for (const l of marxLinks) {
    const s = mapEndpoint(l.l0);
    const t = mapEndpoint(l.l1);
    if (!s || !t) {
      for (const rid of [l.l0, l.l1]) {
        const rec = denizData.records.find((r: { id: number }) => r.id === rid);
        if (rec && !denizPersonMap[rec.person]) unmappedPersons.add(rec.person);
      }
      continue;
    }
    if (s.id === t.id) {
      selfLoopCount++;
      continue;
    }
    const type = l.type === 'p' ? 'agreement_with' : 'disagreement_with';
    const key = `${s.id}|${t.id}|${type}`;
    if (seen.has(key)) {
      dedupedCount++;
      continue;
    }
    seen.add(key);
    relations.push({ source: s.id, target: t.id, type });
    if (s.precise && t.precise) preciseCount++;
    else fallbackCount++;
  }

  const agree = relations.filter((r) => r.type === 'agreement_with').length;
  const disagree = relations.filter((r) => r.type === 'disagreement_with').length;
  console.log(
    `Mapped to ${relations.length} ClaimRelation (precise: ${preciseCount} / person-fallback: ${fallbackCount})`,
  );
  console.log(`  agreement_with: ${agree} / disagreement_with: ${disagree}`);
  console.log(`  dedup skipped: ${dedupedCount} / self-loop skipped: ${selfLoopCount}`);

  if (unmappedPersons.size > 0) {
    console.log(
      `\n⚠ Unmapped deniz person ids (填 scripts/data/deniz-person-id-map.json 可拿到更多 link):`,
    );
    console.log(`  ${[...unmappedPersons].sort((a, b) => a - b).join(', ')}`);
    console.log(`  查 scripts/data/deniz-person-lookup.md 找对应 name + 时代`);
  }

  dataset.relations = relations;
  writeFileSync(CLAIMS_JSON_PATH, JSON.stringify(dataset, null, 2));
  console.log(`\n✓ Wrote ${relations.length} relations to ${CLAIMS_JSON_PATH}`);
}

importLinks();
