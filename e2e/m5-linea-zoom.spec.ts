import { test, expect } from '@playwright/test';

// M5 主线 A · 可探索基础设施 E2E
// Stage 1+2+3+4+5 R0~R4 完成 / DR-069 弧线误选 bug 入 backlog 不阻塞
// 6 用户旅程对应 spec § 11.1 acceptance（T9 双击中键拍废 DR-060 / ⌂ cover reset）
//
// 调整说明（plan 原 spec → Stage 5 实施现实）:
//   1. arc click 旧验 `.arc-tooltip` → DR-063 删 / 改 `.arc-popover`
//   2. timeline drag 旧验"画布 pan 同步" → DR-042 vision pivot 颠覆 / 改"观点 opacity fade"
//   3. baseURL 配 `/marx/` (playwright.config.ts) / page.goto('/') 即可

test.describe('M5 主线 A · 可探索基础设施', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等 zoom-layer 包裹 + 数据 render（claim layout 算完 g.obs 进 DOM）
    await page.waitForSelector('g.zoom-layer g.obs');
  });

  test('滚轮 zoom · 比例 display 同步', async ({ page }) => {
    const display = page.locator('.zoom-control .zoom-display');
    await expect(display).toHaveText(/1\.0×/);

    // 滚轮缩放（向上 = 放大 / wheel deltaY 负值）
    // 注意：页面有 2 个 svg（主画布 + 时间轴 #tl-svg）→ 用 zoom-layer 父 svg 的 box 区分
    const zoomLayerBox = await page.locator('g.zoom-layer').boundingBox();
    expect(zoomLayerBox).toBeTruthy();
    await page.mouse.move(
      zoomLayerBox!.x + zoomLayerBox!.width / 2,
      zoomLayerBox!.y + zoomLayerBox!.height / 2,
    );
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(300);

    const txt = (await display.textContent())!.replace('×', '');
    const k = parseFloat(txt);
    expect(k).toBeGreaterThan(1.0);
  });

  test('单击 obs · 详情卡滑入 + 居中放大', async ({ page }) => {
    // 起始无 popover
    await expect(page.locator('.claim-popover')).toHaveCount(0);

    // 点任意 obs 圆点
    const obs = page.locator('g.obs').first();
    await obs.click();
    await page.waitForTimeout(800); // 飞行 600ms + buffer

    await expect(page.locator('.claim-popover')).toHaveCount(1);
    // 居中后 k 应该 ≥ 3（DR-031 智能 zoom k=1 跳到 6 / 但 fit 算法保证至少 > 1）
    const txt = (await page.locator('.zoom-display').textContent())!.replace('×', '');
    const k = parseFloat(txt);
    expect(k).toBeGreaterThan(1.0);
  });

  test('Esc · 关详情卡 / 不动 viewport', async ({ page }) => {
    await page.locator('g.obs').first().click();
    await page.waitForTimeout(800);
    await expect(page.locator('.claim-popover')).toHaveCount(1);
    const kBefore = parseFloat(
      (await page.locator('.zoom-display').textContent())!.replace('×', ''),
    );

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400); // hide 200ms 动画 + buffer

    await expect(page.locator('.claim-popover')).toHaveCount(0);
    const kAfter = parseFloat(
      (await page.locator('.zoom-display').textContent())!.replace('×', ''),
    );
    expect(kAfter).toBeCloseTo(kBefore, 2); // zoom 不变（小数误差容忍）
  });

  test('⌂ home 按钮 · reset 到 1.0×', async ({ page }) => {
    // 先 zoom 到几档
    await page.locator('.zoom-control .zoom-in').click();
    await page.locator('.zoom-control .zoom-in').click();
    await page.locator('.zoom-control .zoom-in').click();
    await page.waitForTimeout(700);
    const kZoomed = parseFloat(
      (await page.locator('.zoom-display').textContent())!.replace('×', ''),
    );
    expect(kZoomed).toBeGreaterThan(1.0);

    // ⌂ reset
    await page.locator('.zoom-control .zoom-reset').click();
    await page.waitForTimeout(1000); // RESET_DURATION_MS 800 + buffer

    await expect(page.locator('.zoom-display')).toHaveText(/1\.0×/);
  });

  test('点弧线 · arc-popover 弹出（上下分栏 source/target）', async ({ page }) => {
    // 起始无 arc-popover
    await expect(page.locator('.arc-popover')).toHaveCount(0);

    // 点任意 arc 中点（path mid 点必在 stroke 上 / pickNearestArc 用 elementsFromPoint 找候选）
    //   pickNearestArc 要求 cursor 在 hit zone（16 屏幕 px 透明 stroke） / 中点最稳
    //   直接用 mouse.click(x, y) 模拟用户在该屏幕坐标点击
    const arcCenter = await page.evaluate(() => {
      const hit = document.querySelector<SVGPathElement>('path.arc-hit');
      if (!hit) return null;
      const len = hit.getTotalLength();
      const pt = hit.getPointAtLength(len / 2);
      const svg = hit.ownerSVGElement!;
      const ctm = hit.getScreenCTM()!;
      // SVG 坐标 → 屏幕坐标
      const screenPt = svg.createSVGPoint();
      screenPt.x = pt.x;
      screenPt.y = pt.y;
      const transformed = screenPt.matrixTransform(ctm);
      return { x: transformed.x, y: transformed.y };
    });
    expect(arcCenter).toBeTruthy();
    await page.mouse.click(arcCenter!.x, arcCenter!.y);
    await page.waitForTimeout(800);

    await expect(page.locator('.arc-popover')).toHaveCount(1);
    // arc-popover 上下分栏 / 关闭 + 焦点按钮 必须存在
    await expect(page.locator('.arc-popover-close-btn')).toBeVisible();
    await expect(page.locator('.arc-popover-focus-btn')).toHaveCount(1);
  });

  test('拖时间轴游标 · 观点 opacity fade（vision pivot DR-042）', async ({ page }) => {
    // 初始 cursor 1950 / 全显 / 任意 obs opacity = 1
    const obs = page.locator('g.obs').first();
    const opacityBefore = await obs.getAttribute('opacity');
    expect(opacityBefore).toBe('1');

    // 拖 timeline drag-area 到最左（cursor → ~1770）
    const dragArea = page.locator('.timeline-drag-area');
    const box = await dragArea.boundingBox();
    expect(box).toBeTruthy();

    // mousedown 在最右 → drag 到最左 = cursor jumps to leftmost year (~1770)
    const startX = box!.x + box!.width - 10;
    const endX = box!.x + 10;
    const y = box!.y + box!.height / 2;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // cursor 到 ~1770 / 几乎所有 obs.year > 1770 → opacity 0.15
    // 验证至少有一个 obs opacity 变成 fade 值 (g.obs 多 92 个 / 必有 year > 1770)
    const obsAll = page.locator('g.obs');
    const count = await obsAll.count();
    let fadedCount = 0;
    for (let i = 0; i < count; i++) {
      const op = await obsAll.nth(i).getAttribute('opacity');
      if (op === '0.15') fadedCount++;
    }
    expect(fadedCount).toBeGreaterThan(0);
  });
});
