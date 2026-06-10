// M-B2 T4.3 · Marx 行迹数据 + 迁徙 segment 纯函数
// 从 geographic-canvas.ts 抽出（T1.5 hardcode 表 · spec § 4.3）·
//   canvas 渲染 + 副窗 + 图例都要引用 · 抽 lib 单一数据源（SSOT）
//
// yearEnd 是 exclusive (年区间 [yearStart, yearEnd))
// 1883 死 / 最后一段 [1849, 1883] 用 < 1884 写法 → 但 Marx 死在 1883.03.14 / 1883 整年都算伦敦
//   ∴ 最后段 yearEnd = 1884 / 1849-1883 整年覆盖

export interface MarxLocation {
  yearStart: number;
  yearEnd: number;
  loc: [number, number]; // [lon, lat]
}

// T4.3 数据修正：原 6 段表在 1848 有空洞（布鲁塞尔段 yearEnd=1848 · 伦敦段 yearStart=1849）
//   → marxLocationAtYear(1848) 落 fallback 欧洲中心 · 拖时间轴跨 1848 球心跳变一年
//   史实：Marx 1848.04-1849.05 在科隆办《新莱茵报》· 补第 6 段科隆 → 7 段 / 迁徙 6 段
export const MARX_LOCATIONS: MarxLocation[] = [
  { yearStart: 1818, yearEnd: 1835, loc: [6.64, 49.75] }, // 特里尔
  { yearStart: 1835, yearEnd: 1841, loc: [13.4, 52.52] }, // 波恩/柏林
  { yearStart: 1841, yearEnd: 1843, loc: [6.96, 50.94] }, // 科隆
  { yearStart: 1843, yearEnd: 1845, loc: [2.35, 48.86] }, // 巴黎
  { yearStart: 1845, yearEnd: 1848, loc: [4.35, 50.85] }, // 布鲁塞尔
  { yearStart: 1848, yearEnd: 1849, loc: [6.96, 50.94] }, // 科隆（新莱茵报）
  { yearStart: 1849, yearEnd: 1884, loc: [-0.13, 51.51] }, // 伦敦
];

export function marxLocationAtYear(year: number): [number, number] {
  const rec = MARX_LOCATIONS.find((r) => year >= r.yearStart && year < r.yearEnd);
  return rec?.loc ?? [10, 50]; // fallback 欧洲中心
}

// T4.3 · 迁徙 segment（6 地点 → 5 段）
//   arrivalYear = 下一段 yearStart（到达年）· currentYear >= arrivalYear 即"已走"
export interface MigrationSegment {
  from: [number, number];
  to: [number, number];
  arrivalYear: number;
}

export function computeMigrationSegments(): MigrationSegment[] {
  return MARX_LOCATIONS.slice(0, -1).map((rec, i) => ({
    from: rec.loc,
    to: MARX_LOCATIONS[i + 1].loc,
    arrivalYear: MARX_LOCATIONS[i + 1].yearStart,
  }));
}
