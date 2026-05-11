#!/usr/bin/env tsx
/**
 * upgrade-concept-to-claim.ts
 *
 * 从 src/data/nodes_skeleton.json 读取 12 个 ConceptNode，
 * 为每个 concept 生成带 AI 草稿 claim_text 的 checklist entry，
 * 输出到 docs/m4-validation/concept-12-claims-checklist.md。
 *
 * PM 100% 复核后跑 npm run m4:apply-md 才写入 claims.json。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = dirname(__dirname);

const SKELETON_PATH = `${ROOT}/src/data/nodes_skeleton.json`;
const OUTPUT_PATH = `${ROOT}/docs/m4-validation/concept-12-claims-checklist.md`;

interface ConceptNode {
  id: string;
  type: string;
  name_zh: string;
  name_orig: string;
  proposed_year: number;
  proposed_work_id: string;
  definition_plain: string;
}

/**
 * AI 草稿: 12 条 claim_text（主张式 ≤ 50 字汉字）
 * 来源：plan line 916-930 + 结合 definition_plain 优化
 */
const AI_DRAFTS: Record<string, { claim_text: string; cats: string[]; keywords: string }> = {
  'concept-alienation': {
    claim_text:
      '工人在资本主义劳动中被迫与劳动产品、劳动过程、类本质、他人异化——异化劳动是人自我丧失的根源。',
    cats: ['me', 'po', 'et'],
    keywords: '异化劳动',
  },
  'concept-surplus-value': {
    claim_text:
      '资本家以工资购买劳动力，却占有劳动创造的全部价值——剩余价值是资本主义剥削的核心机制。',
    cats: ['po', 'sc'],
    keywords: '剩余价值,剥削',
  },
  'concept-historical-materialism': {
    claim_text:
      '不是意识决定存在，是社会存在决定意识——经济基础决定上层建筑，生产方式推动历史变迁。',
    cats: ['me', 'po'],
    keywords: '历史唯物主义,物质决定',
  },
  'concept-class-struggle': {
    claim_text:
      '至今一切社会的历史，都是阶级斗争的历史——自由民与奴隶，资产阶级与无产阶级的对抗贯穿始终。',
    cats: ['po'],
    keywords: '阶级斗争,历史动力',
  },
  'concept-commodity-fetishism': {
    claim_text:
      '商品在市场中呈现为独立存在物，掩盖了背后的社会劳动关系——商品拜物教是资本主义意识形态的核心幻象。',
    cats: ['me', 'po', 'sc'],
    keywords: '商品拜物教,意识形态批判',
  },
  'concept-ideology': {
    claim_text:
      '统治阶级的思想是占统治地位的思想——意识形态是阶级利益的颠倒反映，维护现存生产关系的精神工具。',
    cats: ['po', 'me'],
    keywords: '意识形态,统治阶级',
  },
  'concept-mode-of-production': {
    claim_text:
      '生产力与生产关系的矛盾推动历史前进——五种社会形态依次更替，生产方式决定社会经济形态。',
    cats: ['me', 'po'],
    keywords: '生产方式,五形态论',
  },
  'concept-base-superstructure': {
    claim_text: '经济基础决定法律、政治、意识形态等上层建筑——上层建筑反作用于基础，两者辩证统一。',
    cats: ['po', 'me'],
    keywords: '经济基础,上层建筑',
  },
  'concept-communism': {
    claim_text:
      '消灭私有制、消灭阶级，国家逐步消亡——各尽所能、各取所需的社会是人类历史的最终形态。',
    cats: ['po', 'et'],
    keywords: '共产主义,无阶级社会',
  },
  'concept-revolution': {
    claim_text:
      '暴力革命是新社会从旧社会母腹脱出的助产婆——无产阶级必须推翻资产阶级统治，建立无产阶级专政。',
    cats: ['po'],
    keywords: '暴力革命,无产阶级专政',
  },
  'concept-labor-theory-of-value': {
    claim_text: '商品价值由社会必要劳动时间决定——区分劳动与劳动力是 Marx 突破古典经济学的关键。',
    cats: ['sc', 'po'],
    keywords: '劳动价值论,社会必要劳动时间',
  },
  'concept-state': {
    claim_text:
      '国家是阶级压迫的工具，资产阶级国家是"管理资产阶级共同事务的委员会"——将随阶级消灭而消亡。',
    cats: ['po'],
    keywords: '国家,阶级压迫工具',
  },
};

function run() {
  const skeleton = JSON.parse(readFileSync(SKELETON_PATH, 'utf-8')) as {
    nodes: { id: string; type: string; [key: string]: unknown }[];
  };

  const concepts = skeleton.nodes.filter((n): n is ConceptNode => n.type === 'concept');

  if (concepts.length !== 12) {
    console.error(
      `Expected 12 concept nodes, found ${concepts.length}. Check nodes_skeleton.json.`,
    );
    process.exit(1);
  }

  const lines: string[] = [
    '# M4 Concept → Claim 升级 Checklist (Task 3)',
    '',
    '> **PM 复核说明**: 此文件由 `npm run m4:gen-concept-md` 生成。',
    '> AI 草稿已填入 `claim_text`——请逐条审阅，修改不准确的表述后',
    '> 跑 `npm run m4:apply-md` 写入 `src/data/claims.json`。',
    '> 复核完毕的条目在 `pm_reviewed` 字段填 `yes`。',
    '',
    `Generated: ${new Date().toISOString().slice(0, 10)}  `,
    `Source: 12 ConceptNode from src/data/nodes_skeleton.json`,
    '',
  ];

  for (const concept of concepts) {
    const suffix = concept.id.replace('concept-', '');
    const claimId = `claim-cpt-${suffix}`;
    const draft = AI_DRAFTS[concept.id];

    if (!draft) {
      console.error(`No AI draft for ${concept.id}. Aborting.`);
      process.exit(1);
    }

    lines.push(`## ${claimId}`);
    lines.push('');
    lines.push(`> concept: \`${concept.id}\` · ${concept.name_zh} / ${concept.name_orig}`);
    lines.push(`> definition_plain: ${concept.definition_plain}`);
    lines.push('');
    lines.push(`- **claim_text**（PM 复核 / 改）: ${draft.claim_text}`);
    lines.push(`- **year**（PM 推断 / 默认 proposed_year）: ${concept.proposed_year}`);
    lines.push(`- **source_work_id**（PM 填）: ${concept.proposed_work_id ?? ''}`);
    lines.push(`- **cats**（AI 建议，PM 可改）: ${draft.cats.join(',')}`);
    lines.push(`- **keywords**（PM 可改）: ${draft.keywords}`);
    lines.push(`- **name_orig**（原概念外文名，PM 可改）: ${concept.name_orig}`);
    lines.push(`- **derived_from_concept_id**（只读）: ${concept.id}`);
    lines.push(`- **pm_reviewed**（填 yes 表示复核完毕）: `);
    lines.push('');
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, lines.join('\n'), 'utf-8');
  console.log(`Wrote 12 concept claims to docs/m4-validation/concept-12-claims-checklist.md`);
}

// ESM CLI 入口判断
if (import.meta.url.startsWith('file:')) {
  const { pathToFileURL } = await import('url');
  const entryHref = pathToFileURL(process.argv[1] ?? '').href;
  if (import.meta.url === entryHref) run();
}
