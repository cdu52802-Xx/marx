import { test, expect } from '@playwright/test';

// M-B2 副窗地理图 E2E（plan T7.1 · ≥8 spec · m-b2-complete 分支全量完成版）
//
// 覆盖：
//   1. 默认 list-main 布局（M5 主画布 + 副窗 mini 地理图 + header 互换按钮 · 图例隐藏）
//   2. 副窗低密度（人节点有 / 关系线无 · 380×214 paper）
//   3. header ↔ 互换 → geo-main（主画布地理图 + 副窗隐藏 + 图例显示）
//   4. geo 主画布完整渲染（国界 + 迁徙 6 段 + 人节点 + 关系线）
//   5. localStorage 持久化（互换后 reload 仍 geo-main）
//   6. 时间轴 seek → 国界动态切换 + 副窗标题年份地名更新
//   7. 迁徙轨迹随时间 forward（早年虚线多 / 晚年实线多）
//   8. 主副联动（搜索候选 click → 详情卡让位 274 + 副窗作者高亮紫圈）
//
// B-7 已知：geo dot click prod 无反应（backlog · 不在本 E2E 范围）

test.describe('M-B2 副窗地理图 · 全量完成', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('g.zoom-layer g.obs');
  });

  test('默认 list-main · M5 主画布可见 + 副窗可见 + header 互换按钮 · 图例隐藏', async ({
    page,
  }) => {
    // M5 主 svg 可见 · geo 主 svg 隐藏
    await expect(page.locator('svg.geo-canvas-svg')).toBeHidden();
    // header 互换按钮（B1 placeholder 已替换为正式按钮）
    const swapBtn = page.locator('.header-controls .swap-button');
    await expect(swapBtn).toBeVisible();
    await expect(swapBtn).toHaveText('↔ 互换');
    // 副窗可见 · 图例隐藏
    await expect(page.locator('.geographic-panel')).toBeVisible();
    await expect(page.locator('.legend-panel')).toBeHidden();
  });

  test('副窗低密度 · 人节点渲染 / 关系线不渲染 / paper 风格 380×214', async ({ page }) => {
    const panel = page.locator('.geographic-panel');
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    expect(box?.width).toBe(380);
    expect(box?.height).toBe(214);
    // mini 地理图：人节点 > 0 · 关系线 = 0（低密度减法）
    const dotCount = await panel.locator('circle.geo-node').count();
    expect(dotCount).toBeGreaterThan(0);
    await expect(panel.locator('path.geo-relation')).toHaveCount(0);
    // 标题
    await expect(panel.locator('.geographic-panel-title')).toContainText('§ 地理图');
  });

  test('header ↔ 互换 → geo-main · 主画布地理图 + 副窗隐藏 + 图例显示', async ({ page }) => {
    await page.locator('.header-controls .swap-button').click();
    await expect(page.locator('svg.geo-canvas-svg')).toBeVisible();
    await expect(page.locator('.geographic-panel')).toBeHidden();
    const legend = page.locator('.legend-panel');
    await expect(legend).toBeVisible();
    await expect(legend.locator('.legend-row')).toHaveCount(5);
  });

  test('geo 主画布完整渲染 · 国界 + 迁徙 6 段 + 人节点 + 关系线', async ({ page }) => {
    await page.locator('.header-controls .swap-button').click();
    const geoSvg = page.locator('svg.geo-canvas-svg');
    await expect(geoSvg).toBeVisible();
    // 国界 async 加载（4.5MB geojson）· 等出现
    await expect
      .poll(async () => geoSvg.locator('path.border').count(), { timeout: 15_000 })
      .toBeGreaterThan(0);
    await expect(geoSvg.locator('path.migration')).toHaveCount(6);
    const dotCount = await geoSvg.locator('circle.geo-node').count();
    expect(dotCount).toBeGreaterThan(20); // 31 人（部分球面背面 display:none 但仍在 DOM）
    const relCount = await geoSvg.locator('path.geo-relation').count();
    expect(relCount).toBeGreaterThan(20); // 37 条
  });

  test('localStorage 持久化 · 互换后 reload 仍 geo-main', async ({ page }) => {
    await page.locator('.header-controls .swap-button').click();
    await expect(page.locator('svg.geo-canvas-svg')).toBeVisible();
    await page.reload();
    await page.waitForSelector('svg.geo-canvas-svg');
    await expect(page.locator('svg.geo-canvas-svg')).toBeVisible();
    await expect(page.locator('.geographic-panel')).toBeHidden();
    // 清回默认 · 不污染后续 spec（beforeEach goto 不清 localStorage）
    await page.evaluate(() => localStorage.removeItem('marx:canvas-role'));
  });

  test('时间轴 seek → 国界动态切换 + 副窗标题年份更新', async ({ page }) => {
    // list-main 下副窗 mini 地理图也接 time-change
    const panel = page.locator('.geographic-panel');
    await expect
      .poll(async () => panel.locator('path.border').count(), { timeout: 15_000 })
      .toBeGreaterThan(0);
    const namesBefore = await panel.locator('path.border').evaluateAll((els) =>
      els
        .map((el) => el.getAttribute('data-name'))
        .sort()
        .join(','),
    );
    // click-to-seek 时间轴左 1/4 处（1770-2030 → ≈1835 · Marx 时代）
    const tlSvg = page.locator('#tl-svg');
    const tlBox = await tlSvg.boundingBox();
    if (!tlBox) throw new Error('timeline svg not found');
    await page.mouse.click(tlBox.x + tlBox.width * 0.25, tlBox.y + tlBox.height / 2);
    // 副窗标题更新（年份 + Marx 行迹地名）
    await expect(panel.locator('.geographic-panel-title')).toContainText('§ 地理图 · 18');
    // 国界 feature 集合变化（2022 clamp 当代 → 1830s 历史国界）
    await expect
      .poll(async () =>
        panel.locator('path.border').evaluateAll((els) =>
          els
            .map((el) => el.getAttribute('data-name'))
            .sort()
            .join(','),
        ),
      )
      .not.toBe(namesBefore);
  });

  test('迁徙轨迹随时间 forward · 早年虚线多 / 晚年实线多', async ({ page }) => {
    await page.locator('.header-controls .swap-button').click();
    const geoSvg = page.locator('svg.geo-canvas-svg');
    await expect(geoSvg.locator('path.migration')).toHaveCount(6);
    const tlBox = await page.locator('#tl-svg').boundingBox();
    if (!tlBox) throw new Error('timeline svg not found');
    // seek ≈1822（左 1/5 · 1770 + 260*0.2 = 1822）→ 全未来 · 6 虚线
    await page.mouse.click(tlBox.x + tlBox.width * 0.2, tlBox.y + tlBox.height / 2);
    await expect
      .poll(async () =>
        geoSvg
          .locator('path.migration')
          .evaluateAll((els) => els.filter((el) => el.getAttribute('stroke-dasharray')).length),
      )
      .toBe(6);
    // seek ≈1926（左 60% · 1770 + 260*0.6 = 1926）→ 全已走 · 0 虚线
    await page.mouse.click(tlBox.x + tlBox.width * 0.6, tlBox.y + tlBox.height / 2);
    await expect
      .poll(async () =>
        geoSvg
          .locator('path.migration')
          .evaluateAll((els) => els.filter((el) => el.getAttribute('stroke-dasharray')).length),
      )
      .toBe(0);
  });

  test('主副联动 · 搜索候选 click → 详情卡让位 274 + 副窗作者紫圈高亮', async ({ page }) => {
    await page.waitForSelector('.search-input');
    await page.locator('.search-input').fill('异化');
    await page.waitForTimeout(400); // debounce 200ms + render buffer
    await page.locator('.search-result-popover .search-result-claim-item').first().click();
    // 详情卡 open + T3.4 让位（副窗在场 bottom 274）
    const popover = page.locator('.claim-popover');
    await expect(popover).toBeVisible();
    await expect(popover).toHaveCSS('bottom', '274px');
    // T3.1 · 副窗 mini 地理图作者高亮（异化 claims 作者 = 马克思 wd-q9061）
    const marxDot = page.locator('.geographic-panel circle.geo-node[data-id="wd-q9061"]');
    await expect(marxDot).toHaveAttribute('stroke', '#5b3a8c');
  });
});
