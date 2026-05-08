import { test, expect } from '@playwright/test';

test.describe('Marx 星图 M2 · 在线部署形态校验', () => {
  test('页面标题正确', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Marx 星图/);
  });

  test('SVG 容器存在', async ({ page }) => {
    await page.goto('/');
    const svg = page.getByTestId('relations-svg');
    await expect(svg).toBeVisible();
  });

  test('渲染至少 20 个节点圆（M2 SPARQL 骨架规模）', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800); // 节点变多，等 force simulation 稳定时间加长
    const circles = page.getByTestId('node-circle');
    const count = await circles.count();
    expect(count).toBeGreaterThanOrEqual(20);
  });

  test('渲染至少 20 条关系连线', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800);
    const lines = page.getByTestId('relation-line');
    const count = await lines.count();
    expect(count).toBeGreaterThanOrEqual(20);
  });

  test('Marx 自己的节点 + 中文标签存在', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(800);
    const labels = page.getByTestId('node-label');
    await expect(labels.filter({ hasText: '卡尔·马克思' })).toHaveCount(1);
  });
});
