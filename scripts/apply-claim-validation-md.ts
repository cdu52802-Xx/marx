#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from 'fs';
import type { ClaimNode } from '../src/types/Claim.ts';

const CHECKLIST_PATH = 'docs/m4-validation/marx-19-claims-checklist.md';
const CLAIMS_JSON_PATH = 'src/data/claims.json';

function applyMd() {
  const md = readFileSync(CHECKLIST_PATH, 'utf-8');
  const dataset = JSON.parse(readFileSync(CLAIMS_JSON_PATH, 'utf-8'));
  const claims: ClaimNode[] = dataset.claims;

  const sections = md.split(/^## (claim-marx-\d+)$/m).slice(1);
  let updated = 0;
  let skipped = 0;
  for (let i = 0; i < sections.length; i += 2) {
    const id = sections[i].trim();
    const body = sections[i + 1];
    const claim = claims.find((c) => c.id === id);
    if (!claim) continue;

    const claimTextMatch = body.match(/\*\*claim_text\*\*[^:]*:\s*(.+)/);
    if (claimTextMatch && claimTextMatch[1].trim() !== '<待翻译>') {
      claim.claim_text = claimTextMatch[1].trim();
      claim.name_zh = claim.claim_text.slice(0, 20);
      updated++;
    } else {
      skipped++;
    }

    const yearMatch = body.match(/\*\*year\*\*[^:]*:\s*(\d+)/);
    if (yearMatch) claim.year = parseInt(yearMatch[1]);

    const swMatch = body.match(/\*\*source_work_id\*\*[^:]*:\s*([\w-]+)/);
    if (swMatch && swMatch[1].trim() !== '') claim.source_work_id = swMatch[1].trim();
  }

  writeFileSync(CLAIMS_JSON_PATH, JSON.stringify(dataset, null, 2));
  console.log(`Updated ${updated} Marx claims (skipped ${skipped} <待翻译> placeholders)`);
}

applyMd();
