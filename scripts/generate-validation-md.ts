// Marx 星图 M3 阶段 B 校对辅助脚本
// 读 src/data/nodes_skeleton.json，输出 PM 友好 Markdown 校对清单到 docs/m3-validation/
// 跑：npm run m3:gen-md

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Node, PersonNode, WorkNode } from '../src/types/Node.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src/data/nodes_skeleton.json');
const OUT_DIR = resolve(ROOT, 'docs/m3-validation');

mkdirSync(OUT_DIR, { recursive: true });

const data = JSON.parse(readFileSync(SRC, 'utf-8')) as { nodes: Node[]; relations: unknown[] };

function wikidataUrl(id: string): string {
  // id 形如 "wd-q9061" → URL https://www.wikidata.org/wiki/Q9061
  const qid = id.replace(/^wd-q/, 'Q').toUpperCase();
  return `https://www.wikidata.org/wiki/${qid}`;
}

function genPersonChecklist(persons: PersonNode[]): string {
  const lines: string[] = [
    '# Marx 星图 M3 阶段 B · person 节点校对清单',
    '',
    '> **说明**：本文件由 `npm run m3:gen-md` 生成。请按下列格式逐节点填字段值。已填的字段（如 birth_year）保留即可。**不要**改 H3 标题（"### Q9235 ..."），脚本回填靠 H3 识别节点。',
    '',
    '> **填写规则**：',
    '> - 字段值用 `<占位>` 包裹的视为未填，脚本会跳过',
    '> - latlng 格式：`52.5200,13.4050`（逗号分隔 lat,lng）',
    '> - bio_event_style：每行一条事件，最多 5 行，格式 "yyyy 年 - 做了什么"',
    '> - citation_urls：每行一个 URL，建议 marxists.org / plato.stanford.edu / 中文学术网',
    '',
    `> **节点数**：${persons.length}`,
    '',
    '---',
    '',
  ];
  for (const p of persons) {
    lines.push(`### ${p.id.replace(/^wd-/, '').toUpperCase()} ${p.name_zh}`);
    lines.push('');
    lines.push(`**Wikidata 链接**: ${wikidataUrl(p.id)}`);
    lines.push(`**当前已有**: birth_year=${p.birth_year} / death_year=${p.death_year}`);
    lines.push(`**待补**:`);
    lines.push('');
    const filledOrig =
      p.name_orig && p.name_orig !== p.name_zh
        ? p.name_orig
        : '<在这里填原文名（德/英/法等），如 Karl Marx>';
    lines.push(`- name_orig: ${filledOrig}`);
    const ll = p.main_location_lat_lng;
    const filledLL =
      ll && ll[0] !== 0
        ? `${ll[0]},${ll[1]}`
        : '<在这里填经纬度，格式 lat,lng，如 51.5074,-0.1278（伦敦）>';
    lines.push(`- main_location_lat_lng: ${filledLL}`);
    lines.push(`- bio_event_style:`);
    if (p.bio_event_style && p.bio_event_style.length > 0) {
      for (const b of p.bio_event_style) lines.push(`  - ${b}`);
    } else {
      lines.push(`  - <每行一条事件，最多 5 行，格式 "yyyy 年 - 做了什么">`);
    }
    lines.push(`- citation_urls:`);
    if (p.citation_urls && p.citation_urls.length > 0) {
      for (const u of p.citation_urls) lines.push(`  - ${u}`);
    } else {
      lines.push(`  - <在这里填 1-3 个引用 URL，每行一条>`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  return lines.join('\n');
}

function genWorkChecklist(works: WorkNode[]): string {
  const lines: string[] = [
    '# Marx 星图 M3 阶段 B · work 节点校对清单',
    '',
    '> **说明**：本文件由 `npm run m3:gen-md` 生成。',
    '',
    '> **填写规则**：',
    '> - name_orig：原文标题，如《资本论》→ "Das Kapital"',
    '> - writing_period：写作时段，如 "1857-1867"',
    '> - summary：3 行内事件式简明，如 "1867 - 第一卷出版" / "1885 - 恩格斯整理出版第二卷"',
    '> - author_id：作者节点 ID，如马克思 = "wd-q9061"',
    '',
    `> **节点数**：${works.length}`,
    '',
    '---',
    '',
  ];
  for (const w of works) {
    lines.push(`### ${w.id.replace(/^wd-/, '').toUpperCase()} ${w.name_zh}`);
    lines.push('');
    lines.push(`**Wikidata 链接**: ${wikidataUrl(w.id)}`);
    lines.push(`**当前已有**: pub_year=${w.pub_year}`);
    lines.push(`**待补**:`);
    lines.push('');
    const filledOrig =
      w.name_orig && w.name_orig !== w.name_zh
        ? w.name_orig
        : '<在这里填原文标题，如 Das Kapital>';
    lines.push(`- name_orig: ${filledOrig}`);
    lines.push(
      `- writing_period: ${w.writing_period && w.writing_period.length > 0 ? w.writing_period : '<写作时段，如 "1857-1867">'}`,
    );
    lines.push(
      `- summary: ${w.summary && w.summary.length > 0 ? w.summary : '<最多 3 行，事件式简明，多行可在末尾加 / 分隔>'}`,
    );
    lines.push(
      `- author_id: ${w.author_id && w.author_id.length > 0 ? w.author_id : '<作者节点 ID，如 wd-q9061>'}`,
    );
    lines.push(`- citation_urls:`);
    if (w.citation_urls && w.citation_urls.length > 0) {
      for (const u of w.citation_urls) lines.push(`  - ${u}`);
    } else {
      lines.push(`  - <每行一个 URL>`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  return lines.join('\n');
}

const persons = data.nodes.filter((n): n is PersonNode => n.type === 'person');
const works = data.nodes.filter((n): n is WorkNode => n.type === 'work');

writeFileSync(resolve(OUT_DIR, 'person-checklist.md'), genPersonChecklist(persons), 'utf-8');
writeFileSync(resolve(OUT_DIR, 'work-checklist.md'), genWorkChecklist(works), 'utf-8');

console.log(`✓ 生成 person-checklist.md（${persons.length} 节点）`);
console.log(`✓ 生成 work-checklist.md（${works.length} 节点）`);
console.log(`输出目录：${OUT_DIR}`);
