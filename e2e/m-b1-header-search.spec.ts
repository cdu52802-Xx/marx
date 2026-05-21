import { test, expect } from '@playwright/test';

// M-B1 主线 · header + 全局搜索 E2E
// Stage 1-4 全 ship + 4 轮 polish DR-084~087 验收（spec § 3.7 Acceptance v2）
//
// 4 spec：
//   1. 搜索打字 "异化" → popover 候选 list（concept 段 DR-080 + claim items + author group DR-078）
//   2. 候选 click → DR-086 详情卡同时 open + DR-087 紫圈 stroke + obs-text 加粗 + fade + flyTo
//   3. Esc → 搜索浮窗关 + obs 高亮清（DR-085 全局 keydown · 详情卡 Esc 走 onClose=restoreArcOpacity）
//   4. 空 query click → 探索形态 3 段 chip（DR-078）· chip click → 自动填搜索框 + 切结果形态
//
// 替补说明（plan 原 T5.1 Step 4 filter chip → 砍 DR-083 / 改 spec 4 = 探索形态 + chip 自动填）

test.describe('M-B1 主线 · header + 全局搜索', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等数据 render（claim layout 算完 g.obs 进 DOM）+ header search input mount
    await page.waitForSelector('g.zoom-layer g.obs');
    await page.waitForSelector('.search-input');
  });

  test('搜索打字 "异化" · popover 显示 concept 段 + claim group + 字面高亮', async ({ page }) => {
    const input = page.locator('.search-input');
    await input.fill('异化');
    await page.waitForTimeout(400); // debounce 200ms + render buffer

    // popover 出现
    await expect(page.locator('.search-result-popover')).toHaveCount(1);

    // § 概念段（"异化" 是 CORE_CONCEPTS 精确命中 / DR-080）
    await expect(
      page.locator('.search-result-popover .search-result-section[data-section="concept"]'),
    ).toHaveCount(1);

    // § 按 author_id 分组段（DR-078 / 至少 1 个 / 异化主要是马克思 wd-q9061）
    const groupCount = await page
      .locator('.search-result-popover .search-result-section[data-section="group"]')
      .count();
    expect(groupCount).toBeGreaterThan(0);

    // claim item 至少 1 条
    const claimCount = await page
      .locator('.search-result-popover .search-result-claim-item[data-result-type="claim"]')
      .count();
    expect(claimCount).toBeGreaterThan(0);

    // 关键词紫色高亮 em.search-result-highlight 至少 1 个（V1 仅字面 / DR-080 中英映射 V2）
    const highlightCount = await page
      .locator('.search-result-popover em.search-result-highlight')
      .count();
    expect(highlightCount).toBeGreaterThan(0);
  });

  test('候选 click · 详情卡 open + obs 紫圈 + obs-text 加粗 + fade + flyTo（DR-086 + DR-087）', async ({
    page,
  }) => {
    const input = page.locator('.search-input');
    await input.fill('异化');
    await page.waitForTimeout(400);

    // 取第一个 claim item id（数据库实存 / 不写死）
    const firstClaim = page
      .locator('.search-result-popover .search-result-claim-item[data-result-type="claim"]')
      .first();
    const claimId = await firstClaim.getAttribute('data-result-id');
    expect(claimId).toBeTruthy();

    // 起始 zoom 1.0
    const zoomDisplay = page.locator('.zoom-control .zoom-display');
    const kBefore = parseFloat((await zoomDisplay.textContent())!.replace('×', ''));

    // click claim → dispatch obs click（DR-086）+ 立即 re-apply highlightObs
    await firstClaim.click();
    await page.waitForTimeout(900); // flyTo 600ms + showClaimPopover slide + buffer

    // DR-086 · 详情卡同时 open
    await expect(page.locator('.claim-popover')).toHaveCount(1);

    // search-result-popover 已 hide（onSelect 内 hide）
    await expect(page.locator('.search-result-popover')).toHaveCount(0);

    // DR-087 · obs-dot 紫圈 stroke=#fcfaf6 / sw=2 / r=5
    const obsDot = page.locator(`g.obs[data-claim-id="${claimId}"] circle.obs-dot`);
    await expect(obsDot).toHaveAttribute('stroke', '#fcfaf6');
    await expect(obsDot).toHaveAttribute('stroke-width', '2');

    // DR-087 · obs-text 加粗 font-weight=700（commit selection 视觉标记）
    const obsText = page.locator(`g.obs[data-claim-id="${claimId}"] text.obs-text`);
    await expect(obsText).toHaveAttribute('font-weight', '700');

    // fade · 其他 obs 至少 1 个 opacity=0.15（focusSet 之外）
    const allObs = page.locator('g.obs');
    const total = await allObs.count();
    let fadedCount = 0;
    for (let i = 0; i < total; i++) {
      const op = await allObs.nth(i).getAttribute('opacity');
      if (op === '0.15') fadedCount++;
    }
    expect(fadedCount).toBeGreaterThan(0);

    // flyTo · zoom 放大（智能 zoom k > 起始 1.0）
    const kAfter = parseFloat((await zoomDisplay.textContent())!.replace('×', ''));
    expect(kAfter).toBeGreaterThan(kBefore);
  });

  test('Esc · 搜索浮窗关 + obs 高亮清 + 详情卡关（DR-085 全局 keydown + onClose=restoreArcOpacity）', async ({
    page,
  }) => {
    const input = page.locator('.search-input');
    await input.fill('异化');
    await page.waitForTimeout(400);

    // 选第一个 claim 进入 state1 + detail
    const firstClaim = page
      .locator('.search-result-popover .search-result-claim-item[data-result-type="claim"]')
      .first();
    const claimId = await firstClaim.getAttribute('data-result-id');
    await firstClaim.click();
    await page.waitForTimeout(900);

    // Pre · 验证已进入 state1 + detail（紫圈 + 详情卡）
    await expect(page.locator('.claim-popover')).toHaveCount(1);
    const obsDot = page.locator(`g.obs[data-claim-id="${claimId}"] circle.obs-dot`);
    await expect(obsDot).toHaveAttribute('stroke', '#fcfaf6');

    // 按 Esc
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // search-result-popover 仍 0（click 后已 hide）
    await expect(page.locator('.search-result-popover')).toHaveCount(0);

    // 详情卡关（claim-popover Esc handler → hideClaimPopover → onClose=restoreArcOpacity）
    await expect(page.locator('.claim-popover')).toHaveCount(0);

    // 紫圈清 · obs-dot stroke null（restoreArcOpacity 清 + 全局 keydown clearSearchHighlight 幂等）
    await expect(obsDot).not.toHaveAttribute('stroke', '#fcfaf6');

    // obs-text 加粗清（DR-087 systematic 复原）
    const obsText = page.locator(`g.obs[data-claim-id="${claimId}"] text.obs-text`);
    await expect(obsText).not.toHaveAttribute('font-weight', '700');

    // fade 清 · 至少 1 个 obs opacity 复原（applyTimelineFiltering 重设全画布）
    const allObs = page.locator('g.obs');
    const total = await allObs.count();
    let normalCount = 0;
    for (let i = 0; i < total; i++) {
      const op = await allObs.nth(i).getAttribute('opacity');
      if (op === '1' || op == null) normalCount++;
    }
    expect(normalCount).toBeGreaterThan(0);
  });

  test('空 query click · 探索形态 3 段 chip · chip click 自动填 + 切结果形态（DR-078）', async ({
    page,
  }) => {
    const input = page.locator('.search-input');

    // click empty input → reopenSearchPopover → handleSearch('') → showExplore
    await input.click();
    await page.waitForTimeout(300);

    await expect(page.locator('.search-result-popover')).toHaveCount(1);

    // 3 段 chip section 全在
    await expect(
      page.locator('.search-result-popover .search-result-section[data-section="persons"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('.search-result-popover .search-result-section[data-section="concepts"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('.search-result-popover .search-result-section[data-section="periods"]'),
    ).toHaveCount(1);

    // chip 数量 = curate（7 persons + 8 concepts + 4 periods）
    const personChips = await page
      .locator(
        '.search-result-popover .search-result-section[data-section="persons"] .search-result-chip',
      )
      .count();
    expect(personChips).toBe(7);
    const conceptChips = await page
      .locator(
        '.search-result-popover .search-result-section[data-section="concepts"] .search-result-chip',
      )
      .count();
    expect(conceptChips).toBe(8);
    const periodChips = await page
      .locator(
        '.search-result-popover .search-result-section[data-section="periods"] .search-result-chip',
      )
      .count();
    expect(periodChips).toBe(4);

    // click "异化" concept chip · handleChipClick → input.value = "异化" + showGrouped
    const yihuaChip = page.locator('.search-result-chip[data-chip-text="异化"]');
    await yihuaChip.click();
    await page.waitForTimeout(400);

    // 自动填搜索框
    await expect(input).toHaveValue('异化');

    // 切结果形态 · § 概念段命中（DR-080 精确匹配）
    await expect(
      page.locator('.search-result-popover .search-result-section[data-section="concept"]'),
    ).toHaveCount(1);
  });
});
