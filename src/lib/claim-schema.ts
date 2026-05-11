// Pattern note: validateClaim / validateClaimRelation 返回 string[] 而不是 throw。
// 跟 M3 src/lib/schema.ts validateNode 的 throw 模式 deliberate 分歧。
// 原因: M4 数据采集走 hybrid AI 草稿 + PM 批量复核 (spec § 9.2 / M3 决策 3),
// PM 复核 .md 时需要一次看完所有 error 而不是 fail-fast 第一个 stop。
import { CLAIM_CATEGORIES, type ClaimNode, type ClaimRelation } from '../types/Claim.ts';

const CHAR_MAX = 50; // claim_text 中文字符上限（汉字 length === 等价英文长度的近似）

const CLAIM_CATEGORIES_SET: ReadonlySet<string> = new Set(CLAIM_CATEGORIES);

export function validateClaim(c: ClaimNode): string[] {
  const errors: string[] = [];
  const tag = c.id;

  if (!c.claim_text || c.claim_text.trim() === '') {
    errors.push(`${tag} claim_text 不能为空`);
  } else {
    const charCount = Array.from(c.claim_text).length;
    if (charCount > CHAR_MAX) {
      errors.push(`${tag} claim_text 长度 ${charCount} 超过 ${CHAR_MAX} 字上限`);
    }
  }

  if (!c.author_id || c.author_id.trim() === '') {
    errors.push(`${tag} author_id 不能为空`);
  }

  if (!c.year || c.year <= 0 || !Number.isInteger(c.year)) {
    errors.push(`${tag} year 必须 > 0 的整数`);
  }

  if (!c.cats || c.cats.length === 0) {
    errors.push(`${tag} cats 至少 1 个`);
  } else {
    for (const cat of c.cats) {
      if (!CLAIM_CATEGORIES_SET.has(cat)) {
        errors.push(`${tag} cats 含非法值 ${cat}`);
      }
    }
  }

  return errors;
}

export function validateClaimRelation(r: ClaimRelation, knownClaimIds: Set<string>): string[] {
  const errors: string[] = [];
  const tag = `${r.source}→${r.target}`;
  if (!knownClaimIds.has(r.source)) errors.push(`${tag} source 不在 claim 集合`);
  if (!knownClaimIds.has(r.target)) errors.push(`${tag} target 不在 claim 集合`);
  if (!['agreement_with', 'disagreement_with', 'extends'].includes(r.type)) {
    errors.push(`${tag} type 必须是 agreement_with / disagreement_with / extends`);
  }
  if (r.source === r.target) errors.push(`${tag} source 不能等于 target（自环）`);
  return errors;
}
