import { CLAIM_CATEGORIES, type ClaimNode, type ClaimRelation } from '../types/Claim.ts';

const CHAR_MAX = 50; // claim_text 中文字符上限（汉字 length === 等价英文长度的近似）

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

  if (!c.year || c.year <= 0) {
    errors.push(`${tag} year 必须 > 0`);
  }

  if (!c.cats || c.cats.length === 0) {
    errors.push(`${tag} cats 至少 1 个`);
  } else {
    for (const cat of c.cats) {
      if (!CLAIM_CATEGORIES.includes(cat as any)) {
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
