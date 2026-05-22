// M-B2 T1.6+ C · historical-borders 加载 + 按年过滤
// Stage 1 临时全量 cshapes-Europe (4.4 MB) · 走 public/ 静态 asset 不嵌 main bundle
// Stage 4 真做 build-time filter Marx subset ~480 KB 替换（plan stage4 task）
//
// 数据：CShapes-Europe.geojson · CC BY-NC-SA 4.0
//   Schvitz et al. 2022 (CShapes 2.0) + Cederman et al. 2025 (Atlas of Western European States)
//   https://icr.ethz.ch/data/cshapes/ · 见 docs/CITATIONS.md
//
// Schema：每 feature properties.From / properties.To (年份)
//   过滤逻辑：From <= year < To · From=To 视为 sentinel（永不匹配）
//   refs cshapes Codebook § 5
//
// 加载策略：public/geo/cshapes-europe.geojson 由 vite 原样 copy 到 dist/geo/
//   走 BASE_URL + relative path · 避免 ?url import 导致 dist/ 双份 copy（dist/geo + dist/assets）

const BORDERS_URL = `${import.meta.env.BASE_URL}geo/cshapes-europe.geojson`;

let _cache: GeoJSON.FeatureCollection | null = null;

/**
 * 加载完整 cshapes-Europe geojson（4.4 MB）
 * Stage 4 build-time filter Marx subset ~480 KB 替换
 */
export async function loadBorders(): Promise<GeoJSON.FeatureCollection> {
  if (_cache) return _cache;
  const resp = await fetch(BORDERS_URL);
  if (!resp.ok) {
    throw new Error(`[historical-borders] fetch fail: ${resp.status} ${resp.statusText}`);
  }
  _cache = (await resp.json()) as GeoJSON.FeatureCollection;
  return _cache;
}

/**
 * 给定 year 过滤覆盖该年的 features（From ≤ year < To）
 * From === To 视为 sentinel（永不匹配 / 数据里 Russia 等首尾 marker 行）
 */
export function filterBordersAtYear(
  geojson: GeoJSON.FeatureCollection,
  year: number,
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: geojson.features.filter((f) => {
      const from = f.properties?.['From'] as number | undefined;
      const to = f.properties?.['To'] as number | undefined;
      if (typeof from !== 'number' || typeof to !== 'number') return false;
      if (from === to) return false; // sentinel
      return from <= year && year < to;
    }),
  };
}

/** 测试用：重置 cache（unit test 之间隔离） */
export function _resetCache(): void {
  _cache = null;
}
