import { test, expect } from '@playwright/test';

// 部署形态冒烟校验（m-b2-complete 分支重写）
// 原 M2 星图版 spec（relations-svg / node-circle / force simulation）在 M4 vision pivot
// （claim-on-timeline）后选择器全部不存在 · 持续 fail 的 stale spec · 按当前形态重写：
//   1. 页面标题（M4 已改 "Marx 思想史 · claim-on-timeline"）
//   2. M5 主画布 obs 节点规模（claim 数据 wire 正常）
//   3. timeline 底栏存在（共享基础设施）
//   4. cshapes 国界 geojson 资产可达（B2 地理图 4.5MB public asset 部署完整性）

test.describe('Marx · 部署形态冒烟', () => {
  test('页面标题正确', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Marx 思想史/);
  });

  test('M5 主画布渲染 ≥ 20 个 obs 节点（claim 数据 wire）', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('g.zoom-layer g.obs');
    const count = await page.locator('g.zoom-layer g.obs').count();
    expect(count).toBeGreaterThanOrEqual(20);
  });

  test('timeline 底栏存在（▶ 播放按钮 + 轴 svg）', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#tl-play')).toBeVisible();
    await expect(page.locator('#tl-svg')).toBeVisible();
  });

  test('cshapes 国界 geojson 资产可达（B2 地理图部署完整性）', async ({ page, baseURL }) => {
    const resp = await page.request.get(`${baseURL}geo/cshapes-europe.geojson`);
    expect(resp.status()).toBe(200);
  });
});
