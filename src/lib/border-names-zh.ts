// M-B2 B-2 backlog · cshapes-Europe 国名中文映射
// spec § 4.7 + DR-T2.1.hotfix2-C 注（"中文国名映射 70 states 留 Stage 4"· 实扫 105 distinct Name 全量做）
//
// 来源：2026-06-10 node 扫描 public/geo/cshapes-europe.geojson properties.Name（322 features · 105 distinct）
// 命名原则：
//   - 历史国名用通行中文译名（普鲁士 / 教皇国 / 奥匈帝国 / 萨克森诸邦保留连字符全名）
//   - COW 命名习惯的括号别名取主名（"Belarus (Byelorussia)" → 白俄罗斯）
//   - 数据残缺名按原意补全（"Hesse-Darmstadt (Ducal" 缺右括号 · key 按数据原样）
//   - Germany / Turkey (Ottoman Empire) 一名跨多时代 → borderDisplayName 按 From 年代区分（不入表）
// fallback：表内查不到返回原文（新数据源扩充时不空白）

export const BORDER_NAMES_ZH: Record<string, string> = {
  Albania: '阿尔巴尼亚',
  Andorra: '安道尔',
  Anhalt: '安哈尔特',
  'Anhalt-Bernberg': '安哈尔特-贝恩堡',
  'Anhalt-Dessau': '安哈尔特-德绍',
  Austria: '奥地利',
  'Austria-Hungary': '奥匈帝国',
  Azerbaijan: '阿塞拜疆',
  Baden: '巴登',
  Bavaria: '巴伐利亚',
  'Belarus (Byelorussia)': '白俄罗斯',
  Belgium: '比利时',
  Bosnia: '波斯尼亚',
  'Bosnia-Herzegovina': '波黑',
  Bremen: '不来梅',
  Bulgaria: '保加利亚',
  Chechens: '车臣',
  Circassia: '切尔克西亚',
  Cracow: '克拉科夫',
  Croatia: '克罗地亚',
  'Czech Republic': '捷克',
  Czechoslovakia: '捷克斯洛伐克',
  Danzig: '但泽',
  Denmark: '丹麦',
  Egypt: '埃及',
  Estonia: '爱沙尼亚',
  Finland: '芬兰',
  France: '法国',
  Frankfurt: '法兰克福',
  Georgia: '格鲁吉亚',
  'German Democratic Republic': '民主德国',
  'German Federal Republic': '联邦德国',
  'Germany (Prussia)': '普鲁士',
  Greece: '希腊',
  Hanover: '汉诺威',
  Herzegovina: '黑塞哥维那',
  'Hesse-Darmstadt (Ducal': '黑森-达姆施塔特',
  'Hesse-Homburg': '黑森-洪堡',
  'Hesse-Kassel (Electoral)': '黑森-卡塞尔',
  Hohengeroldseck: '霍恩格罗尔德塞克',
  'Hohenzollern-Hechingen': '霍亨索伦-黑兴根',
  'Hohenzollern-Sigmaringen': '霍亨索伦-锡格马林根',
  Hungary: '匈牙利',
  Iceland: '冰岛',
  Ireland: '爱尔兰',
  Italy: '意大利',
  'Italy/Sardinia': '撒丁王国',
  Kazakhstan: '哈萨克斯坦',
  'Kingdom of Naples': '那不勒斯王国',
  Kosovo: '科索沃',
  Latvia: '拉脱维亚',
  Liechtenstein: '列支敦士登',
  'Lippe-Detmold': '利珀-代特莫尔德',
  Lithuania: '立陶宛',
  Lucca: '卢卡',
  Luxembourg: '卢森堡',
  'Macedonia (FYROM/North Macedonia)': '北马其顿',
  Malta: '马耳他',
  Massa: '马萨',
  'Mecklenburg-Schwerin': '梅克伦堡-什未林',
  'Mecklenburg-Strelitz': '梅克伦堡-施特雷利茨',
  Modena: '摩德纳',
  Moldova: '摩尔多瓦',
  Monaco: '摩纳哥',
  Montenegro: '黑山',
  Nassau: '拿骚',
  Netherlands: '荷兰',
  Norway: '挪威',
  Oldenburg: '奥尔登堡',
  'Ottoman Empire': '奥斯曼帝国',
  'Papal States': '教皇国',
  Parma: '帕尔马',
  Piedmont: '皮埃蒙特',
  Poland: '波兰',
  Portugal: '葡萄牙',
  Reuss: '罗伊斯',
  Romania: '罗马尼亚',
  Rumania: '罗马尼亚',
  Russia: '俄国',
  'Russia (Soviet Union)': '苏联',
  'San Marino': '圣马力诺',
  'Saxe-Altenburg': '萨克森-阿尔滕堡',
  'Saxe-Coburg-Gotha': '萨克森-科堡-哥达',
  'Saxe-Coburg-Saalfeld': '萨克森-科堡-萨尔费尔德',
  'Saxe-Gotha-Altenberg': '萨克森-哥达-阿尔滕堡',
  'Saxe-Hildburgchausen': '萨克森-希尔德布尔格豪森',
  'Saxe-Meiningen': '萨克森-迈宁根',
  'Saxe-Weimar': '萨克森-魏玛',
  Saxony: '萨克森',
  'Schaumburg Lippe': '绍姆堡-利珀',
  Serbia: '塞尔维亚',
  Slovakia: '斯洛伐克',
  Slovenia: '斯洛文尼亚',
  Spain: '西班牙',
  Sweden: '瑞典',
  Switzerland: '瑞士',
  Tunisia: '突尼斯',
  Ukraine: '乌克兰',
  'United Kingdom': '英国',
  Waldeck: '瓦尔德克',
  Wolfenbuttel: '布伦瑞克-沃尔芬比特尔',
  Württemberg: '符腾堡',
  Yugoslavia: '南斯拉夫',
};

/**
 * 国名显示名（中文优先 · 查不到 fallback 原文）
 * @param fromYear - feature properties.From · Germany / Turkey 一名跨时代 · 按年代区分
 */
export function borderDisplayName(name: string | undefined, fromYear?: number): string {
  if (!name) return '';
  if (name === 'Germany') {
    return (fromYear ?? 9999) < 1919 ? '德意志帝国' : '德国';
  }
  if (name === 'Turkey (Ottoman Empire)') {
    return (fromYear ?? 9999) < 1923 ? '奥斯曼帝国' : '土耳其';
  }
  return BORDER_NAMES_ZH[name] ?? name;
}
