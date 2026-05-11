import type { NodeBase } from './Node.ts';

export type ClaimCategory =
  | 'me' // Metaphysics 形而上学
  | 'ep' // Epistemology 认识论
  | 'lo' // Logic 逻辑
  | 'et' // Ethics 伦理
  | 'po' // Political 政治
  | 'ae' // Aesthetics 美学
  | 're' // Religion 宗教
  | 'mi' // Mind 心灵
  | 'la' // Language 语言
  | 'sc' // Science 科学
  | 'mp'; // Metaphilosophy 元哲学

export const CLAIM_CATEGORIES: readonly ClaimCategory[] = [
  'me',
  'ep',
  'lo',
  'et',
  'po',
  'ae',
  're',
  'mi',
  'la',
  'sc',
  'mp',
] as const;

export interface ClaimNode extends NodeBase {
  type: 'claim';
  claim_text: string; // 一句话主张（10-50 字汉字 / 等价英文长度）
  author_id: string; // FK → PersonNode.id
  source_work_id?: string; // FK → WorkNode.id（可空）
  year: number; // claim 年份（用于时间轴 + 排序）
  cats: ClaimCategory[]; // 学科分类（可多选，借鉴 denizcemonduygu）
  keywords?: string; // 思想流派 tag（如 "异化劳动"）
  reference?: string; // 出处书名 + 页码 / URL
  derived_from_concept_id?: string; // 可选：从哪个 ConceptNode 升级而来（T3 用）
  derived_from_denizcemonduygu_record_id?: number; // 可选：denizcemonduygu data.json record id（T2 用）
}

export interface ClaimRelation {
  source: string; // ClaimNode.id
  target: string; // ClaimNode.id
  type: 'agreement_with' | 'disagreement_with' | 'extends';
}

export interface ClaimDataset {
  claims: ClaimNode[];
  relations: ClaimRelation[];
}

export const isClaim = (n: any): n is ClaimNode => n?.type === 'claim';
