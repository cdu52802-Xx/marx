# B2 Stage 0 · 数据可达性验证结果

> DR-097 (A+) 路径 / Stage 0 风险前置 · 中国大陆网络硬约束
> 执行时间：2026-05-21
> HEAD：a0c8445（Step 1.4 recon prototype commit · Step 4 后会被该文件 + index.html revert 替代）
> plan：plans/2026-05-21-marx-m-b2-geomap.md Task 0.1

---

## 1. D3 geo 库本地可用性

D3 单体 dep 已经在 package.json（`d3@7.9.0`），transitively 带 `d3-geo@3.1.1`。本次不新增依赖。

| Function | Type | 用途 |
|---|---|---|
| `geoOrthographic` | function | 球面 projection（V2+ · 1700 时代锚） |
| `geoMercator` | function | 平面 projection（V1 · 当代 fallback / 1900+ 时代） |
| `geoNaturalEarth1` | function | 平面 projection 备选（更圆润 · 适合教学风） |
| `geoPath` | function | TopoJSON / GeoJSON → SVG path |
| `geoGraticule` | function | 经纬度网格生成器（V1 V2 都用得到） |

5 个函数全部 `typeof === 'function'`。

**recon prototype 实测（Step 1.4）：**

- `npm run dev` 起 vite 8.0.10 OK · HTTP 200 · TS 编译通过
- 网格 render 正常（球面 + 平面 两个 SVG 各 1 张）
- 测点 Paris（lon=2.35, lat=48.86）pixel 坐标：
  - geoOrthographic（scale=150, translate=[300,200], rotate=[-10,-45,0]）→ **[286.86, 189.28]** ← 球内
  - geoMercator（scale=80, translate=[300,200]）→ **[303.28, 121.59]** ← viewport 内
- 两点都在 SVG viewport [0,0]–[600,400] 内，projection API 行为符合预期

**结论：D3 geo 模块 100% 本地可用，B2 Stage 1+ 可以直接基于这套 API 开发，无需后备方案。**

---

## 2. 4 候选 GeoJSON 源可达性

测试方法：`curl -sIL -o /dev/null -w "%{http_code} %{time_total}s\n" --max-time 15 <URL>`
环境：F:\AI\projects\Marx · 中国大陆 · 主力机不挂代理。

### 2.1 主页可达性（HEAD probe）

| Source | URL | HTTP | Latency | Result |
|---|---|---|---|---|
| Euratlas（主页） | https://www.euratlas.com/ | 200 | 2.90 s | OK |
| HGIS Datasets（主页） | https://hgis.org/ | 200 | 1.60 s | OK |
| HGIS Datasets（列表） | https://hgis.org/datasets/ | 200 | 0.47 s | OK |
| OSM Historical | https://www.osmhistorical.com/ | 000 | 0.04 s | **fail（connection refused / DNS）** |
| Overpass API | https://overpass-api.de/ | 406 | 0.70 s | OK（406 on HEAD 是正常 · 真用 POST query） |
| Naturalearthdata（主页） | https://www.naturalearthdata.com/ | 200 | 0.77 s | OK |
| Naturalearthdata（110m 列表） | https://www.naturalearthdata.com/downloads/110m-cultural-vectors/ | 200 | 0.71 s | OK |

### 2.2 实际数据资源端点（HEAD probe · 真要下的 URL）

| Resource | URL | HTTP | Latency | Result |
|---|---|---|---|---|
| Naturalearthdata 110m zip | https://naciscdn.org/naturalearth/110m/cultural/ne_110m_admin_0_countries.zip | 200 | 0.57 s | OK（CDN naciscdn 国内可达） |
| Naturalearthdata 50m zip | https://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_0_countries.zip | 200 | 0.79 s | OK |
| world-atlas 110m TopoJSON（jsdelivr） | https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json | 200 | 0.57 s | OK（jsdelivr 国内 mirror 极稳定） |
| world-atlas 50m TopoJSON（jsdelivr） | https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json | 200 | 0.80 s | OK |
| Euratlas Periodis 数据子页 | https://www.euratlas.com/cartogra/euratlas_periodis/index.html | 404 | 1.54 s | fail（site 改版 · 真实下载入口待人工确认） |
| HGIS 单数据集页 | https://hgis.org/datasets/german-empire-shapefile/ | 200 | 0.50 s | OK（站点结构 OK · 但 GeoJSON 下载链接通常要点进去人工拿） |
| cshapes（瑞士 ETH 历史国界数据集） | https://icr.ethz.ch/data/cshapes/ | 200 | 2.38 s | OK（彩蛋 · 学术界经典 historical boundaries dataset） |

### 2.3 总结

**3/4 主源国内直连可达**：Euratlas / HGIS / Naturalearthdata 都 200 OK，但 Euratlas / HGIS 的实际数据下载链接是 site-specific 的（点进去人工拿 shapefile zip），不是稳定的 URL。

**OSM Historical（osmhistorical.com）连接直接失败**（exit code 000 · 35ms · DNS fail 或 connection refused），但 Overpass API（overpass-api.de）可达 → 如果要 OSM 路径只能走 overpass query · 不走 osmhistorical 网站。

**最关键的发现**：jsdelivr 的 world-atlas TopoJSON mirror（`cdn.jsdelivr.net/npm/world-atlas@2/`）国内直连 **极稳定 (0.5–0.8s)**，这是 V1 数据源的最佳路径 —— 既是 npm package 又走 CDN，可以选择：

- 方案 A：build-time 把 TopoJSON 拷贝进 `public/` · vite `?url` asset 静态托管（推荐）
- 方案 B：runtime fetch jsdelivr CDN（依赖外部网络 · 不推荐）
- 方案 C：`npm i world-atlas` 当 npm dep · import JSON · vite 自动处理（也是 OK）

**B2 推荐方案 A**：把 ne_110m / ne_50m TopoJSON 拷贝到 `public/geo/`，vite 当静态资源 hash 处理，不嵌 main bundle，按需 fetch。

---

## 3. 体积评估

测试方法：`curl -sL` 下 jsdelivr world-atlas TopoJSON · `gzip -k` 看压缩后体积。

| Resource | Raw | Gzipped | 备注 |
|---|---|---|---|
| ne_110m_admin_0_countries TopoJSON | **105 KB** | **38 KB** | V1 默认 · 177 countries · 'countries' + 'land' objects · 视觉粗看够用 |
| ne_50m_admin_0_countries TopoJSON | **739 KB** | **230 KB** | V2+ 高分辨率 · 缩放看细节时切到 50m |

**Bundle 影响评估**（按 Marx 项目 ≤ 80 KB main bundle gzip 红线）：

- vite `?url` 路径加载（**强烈推荐**）：TopoJSON 不进 main.js · 单独 asset · 不占 main bundle gzip 配额。Stage 1 起手只引 110m（38 KB gzip），首屏可接受。
- 如果误嵌进 main bundle（`import topojson from './world.json'` · vite 默认会 inline）：38 KB + 当前 34 KB B1 bundle = **72 KB · 接近红线 80 KB 但还在 safe**。但 50m 230 KB 就直接 OOM 了。
- 必须确保 Stage 1 拿 TopoJSON 走 `?url` 或 fetch · 不走 import。

**HTTP/2 多路复用下 38 KB gzip · 实测 0.57s 直连 jsdelivr · 应该 < 1s 加载完。本地 public/ 托管会更快。**

---

## 4. 选定数据源 + 决策（DR-098 草案）

### 4.1 推荐方案：world-atlas（NaturalEarth 改的 TopoJSON · jsdelivr 镜像）

**理由（一性原理）：**

1. **国内直连可达 + CDN 极稳** —— jsdelivr 0.57s 延迟，比 GitHub raw / unpkg 都强很多
2. **是 TopoJSON 不是原始 shapefile** —— d3 + topojson-client 即可解码，无需 gdal / 转换链
3. **体积小** —— 38 KB gzip 110m 默认 + 230 KB gzip 50m 按需，符合 Marx 极简原则
4. **维护良性** —— mike bostock 团队维护 · GeoJSON 社区事实标准
5. **schema 干净** —— `objects.countries.geometries[].properties.name` 命名直观，B2 后续可以 join 自定义元数据（如 1850 vs 当代国界差异）

**短板（要在 spec 写明）：**

- world-atlas 是 **当代国界** · 不是历史国界。对 Marx 1700–1900 思想史，当代国界在 V1 fallback 阶段够用（"哲学家活动城市的大致地理位置"语义对），但 **如果未来要做 V2 时代切片（1815 拿破仑后 vs 1871 德意志统一）必须切到 Euratlas / cshapes 等历史源**。
- DR-097 (A+) 路径明确 V1 起 = 当代国界 + 经纬度网格 + city markers，符合此局限。

### 4.2 备选 fallback

| 优先级 | 方案 | 触发场景 |
|---|---|---|
| 1（已选） | world-atlas TopoJSON (jsdelivr / public/) | 默认 |
| 2 | npm `i world-atlas` 当 dep | jsdelivr 偶发慢 · 想 build-time 锁定 |
| 3 | 直下 naciscdn.org 原始 shapefile + 本地转 TopoJSON | 极端情况 jsdelivr 全挂（不太可能） |
| 4 | Codex 主力机代下 · 三机协作回传 | 主力机突然连不上 jsdelivr |
| 5 | （未来 V2+）cshapes 历史国界 | 要时代切片国界变化 |
| 6 | （未来 V2+）Euratlas Periodis | 要 16–21 世纪欧洲历史国界精细变化（site 数据要人工下） |

### 4.3 落 DR-098 spec 内容草稿（待 spec 阶段引）

```
DR-098（B2 Stage 0 数据源决策）：
- 选定：world-atlas TopoJSON via jsdelivr · 110m default + 50m on-demand
- 加载路径：build-time 拷到 public/geo/ · vite ?url asset · fetch + topojson.feature() 解码
- V1 范围：当代国界 + graticule + city markers（DR-097 A+ 路径）
- V2+ 触发条件：PM 明确要时代切片国界 → 切 cshapes 或 Euratlas（独立 spike）
- 依赖：保持 d3@7.9.0 · 新增 npm i topojson-client（~5 KB gzip）
- 体积红线：main bundle gzip ≤ 80 KB（current 34 KB / 加 5 KB topojson-client = 39 KB · 远 safe）
- TopoJSON 不嵌 bundle · public/geo/world-110m.json (38 KB gzip) 独立 fetch
```

---

## 5. 后续动作

- Step 4 删 `src/recon.ts` + 撤 `index.html` 临时引入 + final commit
- 该 doc 成为 Stage 0 SSOT · Stage 1 起 PM checkpoint 用
- DR-098 草案待 spec 阶段 PM checkpoint 后正式写入 spec 文件
