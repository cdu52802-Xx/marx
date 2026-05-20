// B1 T3.1 · 多目标 fuzzy match search index
//
// 责任：跨 claim + person 多字段模糊匹配 / score 排序 / 返回结构化 SearchResult。
// V1 score 分层：exact 100 > prefix 80 > substring 60
// V2 backlog：Levenshtein typo 容错 / 中英映射高亮（如英文搜 Marx 高亮中文马克思）
//
// 用法：
//   const results = search({ claims, persons }, query, 50);
//   // T3.3 popover.showGrouped(results, conceptHit?)

import type { ClaimNode } from '../types/Claim.ts';
import type { PersonNode } from '../types/Node.ts';

export type SearchResultType = 'claim' | 'person';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  label: string;
  /** 匹配的 query 文本（高亮区间用 / T3.3 popover 紫高亮） */
  matched?: string;
  /** 排序分数：100 exact / 80 prefix / 60 substring / 0 no match（过滤掉） */
  score: number;
  /** claim 类型时填 author_id（T3.3 popover 按人物分组用） */
  author_id?: string;
  /** claim 类型时填 year（popover 年份显示用） */
  year?: number;
}

export interface SearchIndexInput {
  claims: ClaimNode[];
  persons: PersonNode[];
}

const DEFAULT_MAX = 50;

/**
 * 多目标 fuzzy match search。
 * @param input  · claims + persons 数据源
 * @param query  · 用户输入字串（trim 后 empty 返回 []）
 * @param max    · 返回最大数量（default 50 / 用于 group 之前）
 */
export function search(
  input: SearchIndexInput,
  query: string,
  max: number = DEFAULT_MAX,
): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const out: SearchResult[] = [];

  // claims 候选 · 4 个 field
  for (const c of input.claims) {
    const score = Math.max(
      fieldScore(c.claim_text, q),
      fieldScore(c.name_zh, q),
      fieldScore(c.name_orig, q),
      fieldScore(c.keywords ?? '', q),
    );
    if (score > 0) {
      out.push({
        type: 'claim',
        id: c.id,
        label: c.name_zh || c.claim_text,
        matched: q,
        score,
        author_id: c.author_id,
        year: c.year,
      });
    }
  }

  // persons 候选 · 2 个 field
  for (const p of input.persons) {
    const score = Math.max(fieldScore(p.name_zh, q), fieldScore(p.name_orig, q));
    if (score > 0) {
      out.push({
        type: 'person',
        id: p.id,
        label: p.name_zh,
        matched: q,
        score,
      });
    }
  }

  // 按 score desc 排序 / 取前 max
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, max);
}

/**
 * 单字段评分：exact 100 > prefix 80 > substring 60 > 0
 * case insensitive · 中英文同等处理（toLowerCase 对中文 no-op）
 */
function fieldScore(field: string, query: string): number {
  if (!field || !query) return 0;
  const f = field.toLowerCase();
  const q = query.toLowerCase();
  if (f === q) return 100;
  if (f.startsWith(q)) return 80;
  if (f.includes(q)) return 60;
  return 0;
}
