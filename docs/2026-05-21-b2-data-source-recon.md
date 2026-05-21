# B2 Stage 0 · 数据可达性验证结果

> DR-097 (A+) 路径 / Stage 0 风险前置 · 中国大陆网络硬约束
> 执行时间：2026-05-21（Stage 0）+ 2026-05-22（Stage 0+ cshapes spike · § 6/7）
> HEAD：0ffd410（Step 1.4 recon prototype commit · Step 4 后会被该文件 + index.html revert 替代）
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

---

## 6. Stage 0+ · cshapes 历史国界 spike（2026-05-22）

> **PM 2026-05-22 拍板**：Stage 0 选了当代国界（world-atlas）作 V1，但 § 4.2 fallback 5 列了 "cshapes 历史国界（V2+）" 路径。
> PM 决定提前验证一次：cshapes 是否真能覆盖 Marx 1818-1883 时代切片？如能 → V1 直接上历史国界，跳过 "当代占位"。
> 如不能 → 落实"V1 当代 / V2 历史"分阶段，给 PM 拍板依据。
>
> 关键风险：cshapes v2.0 主数据集时间 = **1886-2019**，**完全不覆盖 Marx 时代**（1818-1883）。spike 必须先验证这一点。

### 6.1 cshapes 主页 + ChangeLog 实测

| Resource | URL | HTTP | Latency | Result |
|---|---|---|---|---|
| cshapes 主页 | https://icr.ethz.ch/data/cshapes/ | 200 | 1.10 s | OK · 含完整下载入口表格 |
| CShapes 2.0 codebook PDF | …/CShapes-2.0_Codebook.pdf | 200 | 1.96 s + 7.84 s 完整下载 | OK · 117 KB |
| **CShapes-2.0.geojson**（全球） | …/CShapes-2.0.geojson | 200 | HEAD OK | （时间 1886-2019 · Marx 时代不覆盖 · **未下载**） |
| **CShapes-Europe.geojson**（欧洲专版） | …/CShapes-Europe.geojson | 200 | 232.7 s 完整下载 (~19 KB/s) | **OK · 4.36 MB**（关键发现） |
| ChangeLog.txt | …/ChangeLog.txt | 200 | 0.66 s + 3.91 s 完整下载 | OK · 3.7 KB |

**主页核心 quote（line 289 of HTML）**：
> "CShapes 2.0 maps the borders and capitals of independent states and dependent territories **from 1886 to 2019** and **from 1816 for CShapes-Europe**."

ChangeLog 确认：CShapes 2.0 主数据集 "Backdated CShapes to January 1, 1886."

**结论**：CShapes 2.0 **全球版** 时间范围 = 1886-2019（**不覆盖 Marx 时代**）。但 **CShapes-Europe** 是欧洲专版扩展 = **1816 起**（**完全覆盖 Marx 1818-1883**）。这是直接打破预期的好消息。

### 6.2 CShapes-Europe.geojson sanity test

下载到本地 `F:\AI\projects\Marx\tmp\cshapes\CShapes-Europe.geojson`：

| 指标 | 值 |
|---|---|
| 文件大小 | 4,574,391 bytes ≈ **4.36 MB**（raw） |
| gzip level 9 | 912,522 bytes ≈ **891 KB** |
| sha256 | `9831764d2ad17e37bc009031829265621534de097f7b3e8d6928d1a828436279` |
| Top-level type | `FeatureCollection`（标准 GeoJSON · 不含 CRS · 默认 WGS84 lon/lat） |
| Features 总数 | **322** |
| properties schema | `{ From, To, Id, Holder, Name, Status, Area, Capital, capital_geom, centroid_geom }` |
| Geometry 类型 | `Polygon` / `MultiPolygon`（典型 Germany 1850 = 11 parts · 1799 vertices） |
| Status 分布 | independent: 310 · occupied: 7 · colony: 3 · mandate: 1 · protectorate: 1 |

**时间范围实测（不是 doc 说的 1816 起）**：
- 最早 From: **1806**（Liechtenstein）
- 最晚 To: **2023**（Luxembourg）

**Marx 1818-1883 时代覆盖**：
- 180 / 322 features 与 Marx 时代重叠（**56% 数据直接相关**）
- 70 distinct state names 出现在 Marx 时代
- 每年活跃 state 数：1818=56 · 1843=56 · 1850=54 · 1867=42 · 1871=23 · 1883=26（**精确捕捉到 1871 德意志统一前后欧洲国家数大幅缩减**）

**Marx 时代 70 states 完整清单**（含所有 Marx 关注的德意志诸邦）：
> Andorra, Anhalt, Anhalt-Bernberg, Anhalt-Dessau, Austria-Hungary, Baden, Bavaria, Belgium, Bremen, Bulgaria, Chechens, Circassia, Cracow, Denmark, Egypt, France, Frankfurt, **Germany**, Greece, Hanover, Hesse-Darmstadt, Hesse-Homburg, Hesse-Kassel, Hohengeroldseck, Hohenzollern-Hechingen, Hohenzollern-Sigmaringen, Iceland, Italy, Kingdom of Naples, Liechtenstein, Lippe-Detmold, Lucca, Luxembourg, Malta, Massa, Mecklenburg-Schwerin, Mecklenburg-Strelitz, Modena, Monaco, Montenegro, Nassau, Netherlands, Oldenburg, Ottoman Empire, Papal States, Parma, Piedmont, Portugal, Reuss, Romania, Russia, San Marino, Saxe-Altenburg, Saxe-Coburg-Gotha, Saxe-Coburg-Saalfeld, Saxe-Gotha-Altenberg, Saxe-Hildburgchausen, Saxe-Meiningen, Saxe-Weimar, Saxony, Schaumburg-Lippe, Serbia, Spain, Sweden, Switzerland, Tunisia, United Kingdom, Waldeck, Wolfenbuttel, Württemberg

**重要 schema 备注**：
- **没有 "Prussia"** state name —— CShapes 用 Gleditsch & Ward（G&W）coding · 1816-1885 期间普鲁士的核心区域编码为 `Name="Germany"` · Capital 字段 = `Berlin` · 这是学术圈惯例 · spec 阶段如果要在 UI 显示"普鲁士"需要做 name mapping。
- Russia 在 Marx 时代有 15 slices（border changes 精细 · 含 1856 克里米亚战后边界变化）
- Ottoman Empire 在 Marx 时代有 39 slices（巴尔干频繁变更）
- France 在 Marx 时代有 4 slices（含 1871 阿尔萨斯-洛林割让）

**结论**：**CShapes-Europe 完全覆盖 Marx 1818-1883 时代，schema 支持 From/To 时间切片，geometry 是 real polygon，可以直接用 d3-geo 投影渲染**。spike 100% 成功。

### 6.3 体积影响评估

| 路径 | Raw | Gzipped | 影响 |
|---|---|---|---|
| 全集 CShapes-Europe.geojson | 4.36 MB | 891 KB | **远超 main bundle red line** · 不可直接嵌入 |
| 按需 fetch（推荐） | — | 891 KB（首次） + 浏览器 cache | 用户视觉打开 B2 副窗才加载 · 首屏不卡 |
| **预切片 1818-1883 子集** | ≈ 4.36 × (180/322) ≈ **2.4 MB raw** | ≈ **500 KB gzip** 估算 | build-time 过滤 · 进一步降体积 |
| 简化（Douglas-Peucker tolerance）+ Marx 子集 | ≈ 1.2 MB | ≈ 200-300 KB | Stage 1 实施时可加 simplify step（mapshaper 或 turf） |

**推荐路径**：
1. build-time copy `CShapes-Europe.geojson` 到 `public/geo/cshapes-europe.geojson`（4.36 MB · 不 import · 用 fetch + `?url`）
2. Stage 1+ 可加 build-time 过滤脚本，输出 Marx 时代子集（180 features · ~2.4 MB raw）
3. Stage 2+ 可加 mapshaper simplify（geometry tolerance 0.05° 应该够 350px 副窗精度 · 估降到 200-300 KB gzip）
4. main bundle 仍 ≤ 80 KB gzip（不变 · 数据不进 bundle）

### 6.4 License + Citation

- **CC BY-NC-SA 4.0**（**非商业** · 署名 · 同样分享）
- Marx 是 personal/research project · 非商业 · OK
- Citation 必需（spec 阶段写入 about/credits 页面）：
  > Schvitz, Guy, Seraina Rüegger, Luc Girardin, Lars-Erik Cederman, Nils Weidmann, and Kristian Skrede Gleditsch. 2022. "Mapping The International System, 1886-2017: The CShapes 2.0 Dataset." *Journal of Conflict Resolution* 66(1): 144–61.
- CShapes-Europe 额外 citation：
  > Cederman, Lars-Erik, Luc Girardin, Carl Müller-Crepon, and Yannick Pengl. 2025. *Nationalism and the Transformation of the State: Border Change and Political Violence in the Modern World*. Cambridge University Press.

---

## 7. § 4.2 备选源更新评估（spike 后）

spike 100% 成功 · cshapes 不再是"V2+ 可能"，而是"V1 可直接上"。其他备选源不需要本轮深挖（PM 拍板上 cshapes 后再考虑 fallback）。简要保留：

| 源 | Stage 0 + 0+ 验证 | 角色 |
|---|---|---|
| **CShapes-Europe**（新发现） | 200 OK 4.36 MB · 1816-2023 · 真历史切片 | **V1 主源（推荐）** |
| world-atlas（Stage 0 选） | 200 OK 38 KB gzip 国内 0.57s · 当代国界 | **降级为 fallback**（cshapes 加载失败时） |
| Euratlas Periodis | Stage 0 子页 404 · site 改版 | 弃 · 真要还需 PM 手动确认 |
| HGIS Datasets | Stage 0 主页 OK · 数据需点进去 | 弃 · 单 dataset 颗粒太细不适合 Marx |
| OSM Historical | Stage 0 DNS fail | 弃 |
| Overpass API | Stage 0 406 OK · 需 POST query | 不适合 batch 渲染 |
| Natural Earth historical subset | Stage 0 主要当代 · historical subset 不存在 | 弃 |

---

## 8. DR-099 草案（PM 拍板前预案 · spike 结论）

```
DR-099 草案（B2 Stage 0+ 数据源最终决策 · cshapes spike 100% 成功）

决策：B2 历史国界数据源 V1 选定 = CShapes-Europe.geojson（ETH Zurich · CC BY-NC-SA 4.0）

理由（第一性原理）：
1. 完全覆盖 Marx 1818-1883 时代（实测 180/322 features · 70 distinct states）
2. 真历史切片（From/To 字段 · 1871 德意志统一前后 state count 56→23 真实反映）
3. 学术圈权威（COW / G&W 编码 · Schvitz et al. 2022 JCR · Cederman et al. 2025）
4. 国内直连可达（ETH Zurich icr.ethz.ch · HEAD 1.10s · 全文下载 232s/4.36MB · 一次性下载本地存）
5. 不需要付费 / 不需要登录 / GeoJSON 标准格式（d3-geo 直接渲染）

备选 fallback：
- L1：world-atlas TopoJSON 38 KB（DR-098 当代国界 · cshapes 加载失败兜底）
- L2：（极端）Codex 主力机代下 cshapes + 微信回传

实施路径：
- 文件位置：`public/geo/cshapes-europe.geojson`（4.36 MB raw · 不进 bundle · fetch + topojson.feature 不需要 · 直接 JSON.parse）
- 时间切片：Stage 1+ 加 build-time 过滤脚本（仅保留 1818-1883 子集 · 180 features ≈ 2.4 MB raw）
- 几何简化：Stage 2+ 视实测性能加 mapshaper Douglas-Peucker（tolerance 0.05° · 估降 200-300 KB gzip）
- name mapping：spec 阶段加 i18n table（"Germany" → "Prussia / 普鲁士" 1816-1870 · "German Empire / 德意志帝国" 1871+）
- credits/license：about 页加 cshapes citation block

spec § 4.7 影响：
- Stage 0 DR-098 草案 "V1 = 当代国界" → 升级为 "V1 = 真历史国界 cshapes-europe"
- 不再需要"V1 当代占位 / V2 全连续动态"两阶段方案
- Stage 1 可直接渲染 1850 / 1871 / 1883 时代切片
- world-atlas 38 KB 仍保留为 L1 fallback（cshapes 加载失败兜底当代国界）

体积红线：
- main bundle gzip ≤ 80 KB（当前 34 KB · 不变 · 数据不进 bundle）
- geo data fetch（仅 B2 副窗打开时）：4.36 MB raw → ≈ 891 KB gzip first load → 浏览器 cache
- Stage 1 build-time 过滤 → ≈ 2.4 MB raw / ≈ 500 KB gzip
- Stage 2 mapshaper simplify → ≈ 1.2 MB raw / ≈ 200-300 KB gzip
```

---

## 9. Stage 0+ 后续动作

- PM 拍板 DR-099 草案（升 V1 数据源到 cshapes · 或保留 DR-098 当代国界 + cshapes 留 V2）
- 拍板后：本地缓存的 `tmp/cshapes/CShapes-Europe.geojson` 进入 Stage 1 实施
  - 拷到 `public/geo/cshapes-europe.geojson`（4.36 MB · `.gitignore` 已通过 `public/` 内不忽略 · git LFS 待评估）
  - 或：写 build-time 过滤脚本 Marx 子集（更轻量）
- spec § 4.7 / § 4.2 改写（cshapes 升 V1 · world-atlas 降 L1 fallback）
- about 页 placeholder 加 cshapes citation
- B2 副窗 UI 加 era slider（1818-1883 · 默认 1848 革命年）的 spec 升级
