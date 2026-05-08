// Marx 星图 M3 阶段 B 校对回填脚本
// 读 PM 填好的 docs/m3-validation/person-checklist.md + work-checklist.md
// 反向回填 src/data/nodes_skeleton.json
// 跑：npm run m3:apply-md     （both）
//      npm run m3:apply-person （仅 person）
//      npm run m3:apply-work   （仅 work）

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Node } from '../src/types/Node.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const JSON_PATH = resolve(ROOT, 'src/data/nodes_skeleton.json');
const PERSON_MD = resolve(ROOT, 'docs/m3-validation/person-checklist.md');
const WORK_MD = resolve(ROOT, 'docs/m3-validation/work-checklist.md');

type ParsedNode = {
  id: string;
  fields: Record<string, string | string[]>;
};

const PLACEHOLDER_REGEX = /<[^>]+>/; // 含 <...> 的字段视为未填

function isUnfilled(value: string): boolean {
  return PLACEHOLDER_REGEX.test(value);
}

function parseChecklist(md: string): ParsedNode[] {
  const lines = md.split(/\r?\n/);
  const nodes: ParsedNode[] = [];
  let current: ParsedNode | null = null;
  let listField: string | null = null;

  for (const line of lines) {
    const h3 = line.match(/^### (Q\d+) /);
    if (h3) {
      if (current) nodes.push(current);
      const wdId = `wd-${h3[1].toLowerCase()}`;
      current = { id: wdId, fields: {} };
      listField = null;
      continue;
    }
    if (!current) continue;

    // 单行字段，如 "- name_orig: Karl Marx"
    const single = line.match(/^- ([a-z_]+): (\S.*)$/);
    if (single) {
      const [, key, value] = single;
      if (!isUnfilled(value.trim())) {
        current.fields[key] = value.trim();
      }
      listField = null;
      continue;
    }

    // 列表字段开头，如 "- bio_event_style:"
    const listStart = line.match(/^- ([a-z_]+):\s*$/);
    if (listStart) {
      listField = listStart[1];
      current.fields[listField] = [];
      continue;
    }

    // 列表项，如 "  - 1818 年 - 生于普鲁士特里尔"
    if (listField) {
      const item = line.match(/^  - (.+)$/);
      if (item) {
        const value = item[1].trim();
        if (!isUnfilled(value)) {
          (current.fields[listField] as string[]).push(value);
        }
      } else if (line.startsWith('---')) {
        listField = null;
      }
    }
  }
  if (current) nodes.push(current);
  return nodes;
}

function applyToNode(node: Node, parsed: ParsedNode): boolean {
  let changed = false;
  for (const [key, value] of Object.entries(parsed.fields)) {
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      const current = (node as Record<string, unknown>)[key];
      if (JSON.stringify(current) !== JSON.stringify(value)) {
        (node as Record<string, unknown>)[key] = value;
        changed = true;
      }
      continue;
    }
    if (key === 'main_location_lat_lng') {
      const m = value.match(/^(-?[\d.]+),\s*(-?[\d.]+)$/);
      if (m) {
        const ll: [number, number] = [Number(m[1]), Number(m[2])];
        const currentLL = (node as Record<string, unknown>).main_location_lat_lng;
        if (JSON.stringify(currentLL) !== JSON.stringify(ll)) {
          (node as Record<string, unknown>).main_location_lat_lng = ll;
          changed = true;
        }
      }
      continue;
    }
    if ((node as Record<string, unknown>)[key] !== value) {
      (node as Record<string, unknown>)[key] = value;
      changed = true;
    }
  }
  return changed;
}

function main(target: 'person' | 'work' | 'both'): void {
  const data = JSON.parse(readFileSync(JSON_PATH, 'utf-8')) as {
    nodes: Node[];
    relations: unknown[];
  };
  let touched = 0;

  if (target === 'person' || target === 'both') {
    const parsed = parseChecklist(readFileSync(PERSON_MD, 'utf-8'));
    for (const p of parsed) {
      const node = data.nodes.find((n) => n.id === p.id);
      if (!node) {
        console.warn(`⚠ ${p.id} 在 nodes_skeleton.json 找不到，跳过`);
        continue;
      }
      if (applyToNode(node, p)) touched++;
    }
  }
  if (target === 'work' || target === 'both') {
    const parsed = parseChecklist(readFileSync(WORK_MD, 'utf-8'));
    for (const p of parsed) {
      const node = data.nodes.find((n) => n.id === p.id);
      if (!node) {
        console.warn(`⚠ ${p.id} 在 nodes_skeleton.json 找不到，跳过`);
        continue;
      }
      if (applyToNode(node, p)) touched++;
    }
  }

  writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`✓ 回填完成，影响 ${touched} 个节点`);
}

const target = (process.argv[2] ?? 'both') as 'person' | 'work' | 'both';
main(target);
