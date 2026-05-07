import { test, expect } from '@playwright/test';

test.describe('Marx 星图 M1 · 在线部署形态校验', () => {
  test('页面标题正确', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Marx 星图/);
  });

  test('SVG 容器存在', async ({ page }) => {
    await page.goto('/');
    const svg = page.getByTestId('relations-svg');
    await expect(svg).toBeVisible();
  });

  test('渲染 2 个节点圆', async ({ page }) => {
    await page.goto('/');
    // 等 force-directed 模拟稳定
    await page.waitForTimeout(500);
    const circles = page.getByTestId('node-circle');
    await expect(circles).toHaveCount(2);
  });

  test('渲染 1 条关系连线', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const lines = page.getByTestId('relation-line');
    await expect(lines).toHaveCount(1);
  });

  test('显示中文标签', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const labels = page.getByTestId('node-label');
    await expect(labels.filter({ hasText: '卡尔·马克思' })).toHaveCount(1);
    await expect(labels.filter({ hasText: '弗里德里希·恩格斯' })).toHaveCount(1);
  });
});
