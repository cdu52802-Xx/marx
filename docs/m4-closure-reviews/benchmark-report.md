# M4 Closure · Benchmark Report

> **触发**：2026-05-13 M4 closure 4 件套 · 2/4
> **工具**：gstack `/benchmark` skill（`browse.exe` daemon · Windows native）
> **范围**：prod URL（user-facing baseline）+ localhost（网络隔离对照）
> **运行**：2026-05-13 (Asia/Shanghai)
> **模式**：`--baseline` 首跑 / 后续 M5 ship 时跑 `--baseline` 对比 regression

---

## 1. 一句话结论

**App 本身非常轻**（38KB transfer / 124KB decoded / 3 个 HTTP requests）。
**Prod 加载慢 = 中国 → GH Pages 国际线路 + Google Fonts 副 cost / 不是 app 问题**。
**M5 baseline 已建立 / 关键警戒线：bundle transfer 翻倍 = regression 信号**。

---

## 2. 关键 metrics 对比

| 阶段 | Local Dev (`vite dev`) | Prod (`GH Pages`) | 差异 | 解读 |
|---|---|---|---|---|
| TTFB | 3ms | **1605ms** | +1602ms | 网络（中国 → US GitHub）|
| FCP / first paint | 80ms | **4412ms** | +4332ms | 网络 + 等 fonts |
| LCP | 80ms | **4412ms** | 同 FCP | 主图渲染同时完成 |
| DCL | 188ms | **4216ms** | +4028ms | 网络 + Google Fonts CSS 阻塞 |
| domComplete (full load) | **496ms** | **8811ms** | +8315ms | 4.4s 多为 fonts + 闲置 d3 渲染 |
| HTTP requests | 13 | **3** | -10 | Vite bundle 把 12 个 ts/json/d3 打包成 1 个 JS |
| Total transfer | ~1.2MB | **164KB** | -1MB | bundle + minify + gzip 神效 |

---

## 3. Prod 资源详情（user-facing）

| Resource | Type | Transfer | Decoded | Duration | 备注 |
|---|---|---|---|---|---|
| `index-1Gd0cDh1.js` | script | **38KB** | 124KB | 1265ms | bundle 主文件（含 claims.json + d3 tree-shaken + 全部 app code）|
| `index-D1JYOQK8.css` | link | **<1KB** | 1.4KB | 320ms | app CSS（极小）|
| `css2` (Google Fonts) | css | **125KB** | 472KB | **2264ms** | ⚠ EB Garamond 多字重 / 阻塞 FCP |

**App 自己**: 39KB transfer（JS + CSS）/ 极轻
**第三方**: Google Fonts 125KB transfer / 占 76% network cost + 2.3s 加载时间

---

## 4. Local 资源详情（dev mode 不 bundle）

13 个 resources / 总 1.2MB（未 minify / 未 tree-shake）：

| Resource | Transfer | 备注 |
|---|---|---|
| `d3.js` | **546KB** | dev mode 全量 d3 / prod 会 tree-shake 到 ~30-50KB |
| `client` (HMR) | 205KB | vite HMR runtime / prod 没有 |
| `claims.json` | 212KB | M4 数据 / prod 被 inline 进 bundle |
| `nodes_skeleton.json` | 135KB | M3 数据 / 同上 inline |
| `claim-popover.ts` | 26KB | 详情侧栏组件 |
| `sidebar.ts` | 22KB | 左 sidebar |
| `timeline.ts` | 18KB | 底部时间轴 |
| `claim-layout.ts` | 12KB | 主画布 layout |
| `apply-claim-filters.ts` | 5KB | ⭐ B1 fix 新增 |
| `main.ts` | 40KB | main + 4 组件 mount |
| `styles.css` | 3KB | app CSS |
| `env.mjs` | 4KB | vite env |
| `css2` (Google Fonts) | 0 (cache) | 已缓存 |

---

## 5. Performance Budget Check

| Metric | Budget | Prod | Local | Status |
|---|---|---|---|---|
| FCP | < 1.8s | 4.4s | 80ms | ⚠ FAIL prod / ✅ PASS app perf |
| LCP | < 2.5s | 4.4s | 80ms | ⚠ FAIL prod / ✅ PASS app perf |
| Total JS transfer | < 500KB | 38KB | — | ✅ PASS (7.6% of budget) |
| Total CSS transfer | < 100KB | 126KB | — | ⚠ WARNING（gFonts 拉爆）|
| Total transfer | < 2MB | 164KB | — | ✅ PASS (8% of budget) |
| HTTP requests | < 50 | 3 | — | ✅ PASS（极优）|

**Grade**: B+（app 本身 A+ / 部署链路 + 第三方依赖拖累）

---

## 6. 诊断

### F1 · 中国 → GH Pages 国际线路是 page load 主因（~3-4s 不可抗）

- TCP+SSL = 2.4s（DNS 4ms ✓ / TCP 1.3s + SSL 1.1s）
- TTFB 1.6s
- 这是**网络 cost / 跟代码无关**
- 如果国外用户访问 prod，这部分会降到 < 500ms

**M5 不可优化** / 但可以观察是否有用户 / 必要时考虑 jsDelivr CDN mirror 或国内静态服务。

### F2 · Google Fonts `css2` 2.3s + 125KB 是次要 cost（可优化 / 但不紧急）

- `fonts.googleapis.com/css2?family=EB+Garamond:...` 
- 阻塞 FCP（CSS in head）
- 中国到 google 网络也慢
- 472KB decoded = 嵌了多字重 base64 字体

**修复方向（M5+ 评估 / 不在本期）**：
- A · 自托管 fonts/EB+Garamond.woff2（fontsource / 复制到 `/public/fonts/`）→ 砍 2.3s + 减 125KB transfer / 但 +50-100KB 自带字体文件
- B · 简化字体方案（只用 1-2 字重 instead of 多字重）→ 砍 ~70KB
- C · Font-display: swap 显式（避免阻塞 FCP）→ 不砍量但 FCP 早 2-3s

⭐ M5 主线 C 多类型详情页前评估 / 视觉风格定调时一并决定。

### F3 · App bundle 极小（38KB transfer）= M5 有大量 budget

- 当前 prod JS: 38KB transfer / 124KB decoded
- 警戒线（regression threshold）= +25% 即 +9.5KB transfer
- M5 主线 ABC 加：zoom（~3KB d3.zoom 复用）+ mini-map（~5-10KB）+ 多详情页（10-20KB）= 预估总 +15-30KB transfer
- ✅ 仍在 < 500KB budget 内 / 但要持续监控

---

## 7. M5 baseline 警戒值

下次 M5 ship 前后跑 `/benchmark` 对比时，**任一项超线就是 regression 信号**：

| Metric | Baseline (prod) | M5 警戒值（+25%）| M5 危险值（+50% 或 +500ms）|
|---|---|---|---|
| Total JS transfer | 38KB | **48KB** | 57KB |
| Total CSS transfer | 126KB | 158KB | 189KB |
| Total transfer | 164KB | 205KB | 246KB |
| HTTP requests | 3 | 4 (lazy split 可能) | 5+ |
| FCP | 4412ms | 5515ms (+25%) | 4912ms (+500ms abs) |
| LCP | 4412ms | 5515ms | 4912ms |
| domComplete | 8811ms | 11013ms | 9311ms |

⭐ **核心 KPI**：Total JS transfer 别破 50KB（除非 PM 明确接受 trade-off）。

---

## 8. baseline.json（gstack 标准存档）

写到 `.gstack/benchmark-reports/baselines/baseline.json` + 复制到 [`docs/m4-closure-reviews/baseline.json`](./baseline.json)（git 跟踪 / 跨窗口续接保留）：

```json
{
  "url": "https://cdu52802-xx.github.io/marx/",
  "timestamp": "2026-05-13T16:00:00+08:00",
  "branch": "main",
  "tag": "m4-final",
  "milestone": "M4 closure",
  "network_context": "China → GH Pages international",
  "pages": {
    "/": {
      "ttfb_ms": 1605,
      "fcp_ms": 4412,
      "lcp_ms": 4412,
      "dom_interactive_ms": 1615,
      "dcl_ms": 4216,
      "dom_complete_ms": 8811,
      "full_load_ms": 8811,
      "total_requests": 3,
      "total_transfer_bytes": 163827,
      "js_bundle_bytes": 37976,
      "css_bundle_bytes": 125851,
      "app_css_bytes": 996,
      "largest_resources": [
        {"name": "index-1Gd0cDh1.js", "size": 37976, "duration": 1265, "type": "app-bundle"},
        {"name": "css2 (Google Fonts)", "size": 124855, "duration": 2264, "type": "third-party-fonts"},
        {"name": "index-D1JYOQK8.css", "size": 996, "duration": 320, "type": "app-css"}
      ]
    }
  }
}
```

---

## 9. 推荐操作（按 ROI 排序）

| # | 操作 | 类别 | 时间 | 影响 | 时机 |
|---|---|---|---|---|---|
| 1 | 把本 baseline 落进 git（防丢） | 数据 | 5 min | M5 ship 时可对比 | ⭐ 立即（已落 docs/） |
| 2 | M5 brainstorm 时评估 self-host fonts | 视觉 | 30 min 评估 | -2.3s FCP / +50KB transfer / trade-off | M5 主线 C / 视觉重定调时 |
| 3 | M5 zoom 实施时 watch bundle size | 监控 | 持续 | 防 d3.zoom + 详情页代码膨胀 | M5 期间每 task 完成跑 build / 看 bundle |
| 4 | 评估 China CDN mirror（若 PM 朋友看抱怨慢） | 部署 | 1 day 调研 | -3s TTFB | M5+ 或 PM 反馈后 |

---

## 10. Caveats

- **首跑**：无 historical trend 数据 / 本次为 baseline 起点
- **GH Pages 是 prod 唯一渠道**：没有 staging 环境 / baseline 直接对 prod
- **网络条件**：本次测于中国大陆 / 国外用户体验会显著好
- **Cold vs warm cache**：本次是 cold load（首访问）/ warm load 会显著快（Service Worker 也没有 / 全靠浏览器 cache）
- **dev mode 不能直接对比 prod**：dev 不 bundle / 不 minify / 不 gzip / 13 个 file vs 3 个 / 不是 user-facing 数据

---

**STATUS**: DONE
**REASON**: prod + local baseline 都拿到 / metric 详尽 / M5 警戒值定下
**ATTEMPTED**: gstack `browse.exe` perf + js eval / prod + local 双向对比
**RECOMMENDATION**: baseline 落 git / M5 ship 时复跑做对比 / fonts 优化推 M5 主线 C 评估
