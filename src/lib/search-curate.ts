// B1 T3.4 · search curate lists（PM 2026-05-20 mockup 拍板 / 按建议默认）
//
// 责任：B1 探索形态 popover 用的 3 段静态清单 + 概念精确匹配 helper。
// 视觉：spec § 3.3.1 探索形态 / DR-078 / DR-080 精确匹配 / DR-081 普鲁东 + 施蒂纳 数据真实优先。
// V2 backlog：中英文映射高亮（如英文搜 "Alienation" 命中"异化"）/ 数据库 normalize 简繁。

/** 主要人物 7 位 · 数据库真实 person.id 映射（id 详见 src/data/nodes_skeleton.json）*/
export interface MainPerson {
  id: string;
  /** 简短显示名（chip 用 / 不含完整 name_zh 如"卡尔·马克思"）*/
  name: string;
}

export const MAIN_PERSONS: readonly MainPerson[] = [
  { id: 'wd-q9061', name: '马克思' },
  { id: 'wd-q34787', name: '恩格斯' },
  { id: 'wd-q9235', name: '黑格尔' },
  { id: 'wd-q76422', name: '费尔巴哈' },
  // 数据库实存繁体「皮埃爾-約瑟夫·普魯東」/ chip 显示简体「普鲁东」(DR-081)
  { id: 'wd-q5749', name: '普鲁东' },
  { id: 'wd-q27645', name: '巴枯宁' },
  // 数据库实存繁体「麥克斯·施蒂納」/ chip 显示简体「施蒂纳」(DR-081 取代圣西门)
  { id: 'wd-q76725', name: '施蒂纳' },
] as const;

/** 核心概念 8 个 · 含提出者 + 年份 + 出处元信息（"§ 概念"段命中时显示）*/
export interface CoreConcept {
  /** chip 显示 + 精确匹配 query（DR-080）*/
  label: string;
  /** 提出者 person.id */
  proposedBy: string;
  /** 提出者显示名（不查 persons map 避免额外 lookup）*/
  proposedByName: string;
  /** 概念首次提出年份 */
  year: number;
  /** 出处书名 + 卷/篇 */
  source: string;
}

export const CORE_CONCEPTS: readonly CoreConcept[] = [
  {
    label: '异化',
    proposedBy: 'wd-q9061',
    proposedByName: '马克思',
    year: 1844,
    source: '1844 经济学哲学手稿',
  },
  {
    label: '阶级',
    proposedBy: 'wd-q9061',
    proposedByName: '马克思',
    year: 1848,
    source: '共产党宣言',
  },
  {
    label: '革命',
    proposedBy: 'wd-q9061',
    proposedByName: '马克思',
    year: 1848,
    source: '共产党宣言',
  },
  {
    label: '商品',
    proposedBy: 'wd-q9061',
    proposedByName: '马克思',
    year: 1867,
    source: '资本论 卷一',
  },
  {
    label: '资本',
    proposedBy: 'wd-q9061',
    proposedByName: '马克思',
    year: 1867,
    source: '资本论 卷一',
  },
  {
    label: '历史唯物',
    proposedBy: 'wd-q9061',
    proposedByName: '马克思',
    year: 1859,
    source: '政治经济学批判 序言',
  },
  {
    label: '辩证法',
    proposedBy: 'wd-q9235',
    proposedByName: '黑格尔',
    year: 1807,
    source: '精神现象学',
  },
  {
    label: '剩余价值',
    proposedBy: 'wd-q9061',
    proposedByName: '马克思',
    year: 1867,
    source: '资本论 卷一',
  },
] as const;

/** 关键时段 4 段 · 含年份范围（chip 显示 + 后续 timeline filter 用）*/
export interface KeyPeriod {
  /** chip 显示 */
  label: string;
  /** 年份范围 [start, end] 含端点 */
  range: [number, number];
}

export const KEY_PERIODS: readonly KeyPeriod[] = [
  { label: '1840s 青年', range: [1840, 1849] },
  { label: '1848 革命', range: [1848, 1848] },
  { label: '1864 第一国际', range: [1864, 1864] },
  { label: '1871 巴黎公社', range: [1871, 1871] },
] as const;

/**
 * 概念精确匹配（DR-080）· trim 后跟 CORE_CONCEPTS label 字面相等 → 返回 ConceptMeta / 否则 null。
 * 不做 partial / 不做中英映射 / 不做大小写无关（中文 toLowerCase no-op）。
 * "异化" → CoreConcept · "异" → null · "ALIENATION" → null · "" → null
 */
export function isExactConceptHit(query: string): CoreConcept | null {
  const q = query.trim();
  if (!q) return null;
  return CORE_CONCEPTS.find((c) => c.label === q) ?? null;
}
