#!/usr/bin/env tsx
/**
 * Generate person quote checklist for T4.
 *
 * Reads 34 PersonNode from nodes_skeleton.json, filters out Marx (wd-q9061),
 * emits 33 × QUOTES_PER_PERSON checklist entries to docs/m4-validation/person-quote-checklist.md.
 *
 * Hybrid mode (PM feedback 2026-05-12): AI fills draft directly, PM async-reviews,
 * unsure references marked `<不确定: 待 PM 查证>` so apply script skips that field.
 */
import { readFileSync, writeFileSync } from 'fs';
import type { PersonNode } from '../src/types/Node.ts';

const NODES_PATH = 'src/data/nodes_skeleton.json';
const CHECKLIST_PATH = 'docs/m4-validation/person-quote-checklist.md';
const QUOTES_PER_PERSON = 3; // 每人 3 个 quote（M4 minimum），PM 可加到 5

function generate() {
  const nodesData = JSON.parse(readFileSync(NODES_PATH, 'utf-8'));
  const persons: PersonNode[] = nodesData.nodes.filter(
    (n: { type: string }) => n.type === 'person',
  );
  // 排除 Marx（已有 19 obs）
  const targetPersons = persons.filter((p) => p.id !== 'wd-q9061');

  let md = `# Person Quote 补采复核清单\n\n`;
  md += `> 33 person × 3 quote = 99 条 ClaimNode\n`;
  md += `> AI 草稿（hybrid 模式，PM feedback 2026-05-12）+ PM 异步复核\n`;
  md += `> 不确定的 reference 标 \`<不确定: 待 PM 查证>\`，apply 跳过该字段\n`;
  md += `> 编造引文是 P0 错误（学术信誉损害）—— 宁可空也不要编\n\n`;
  md += `---\n\n`;
  for (const p of targetPersons) {
    for (let i = 1; i <= QUOTES_PER_PERSON; i++) {
      const claimId = `claim-${p.id.replace('wd-q', 'q')}-${String(i).padStart(2, '0')}`;
      md += `## ${claimId}\n\n`;
      md += `**Person**: ${p.name_zh} (${p.name_orig}) · ${p.birth_year}–${p.death_year}\n\n`;
      md += `**bio context** (M3 已填):\n`;
      for (const event of p.bio_event_style ?? []) md += `- ${event}\n`;
      md += `\n`;
      md += `**填:**\n`;
      md += `- **claim_text**（≤ 50 字主张式）: <待 AI 草稿>\n`;
      md += `- **year**: ${p.birth_year + 30}\n`; // 默认中年
      md += `- **source_work_id**（PM 填，可空）: \n`;
      md += `- **cats**（po/me/et/re/mp 等）: po\n`;
      md += `- **keywords**（思想流派）: \n`;
      md += `- **reference**（出处文献）: \n`;
      md += `- **author_id**: ${p.id}\n`;
      md += `- **deniz_person_id**（可选，查 scripts/data/deniz-person-lookup.md 找对应 id；填了 T5 能拿到 cross-person link）: \n\n`;
      md += `---\n\n`;
    }
  }
  writeFileSync(CHECKLIST_PATH, md);
  console.log(
    `Wrote ${targetPersons.length * QUOTES_PER_PERSON} person quotes to ${CHECKLIST_PATH}`,
  );
}

generate();
