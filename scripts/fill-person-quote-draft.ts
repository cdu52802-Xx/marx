#!/usr/bin/env tsx
/**
 * One-shot AI draft filler for T4 person quote checklist (hybrid mode).
 * 33 person × 3 quote = 99 entries. Replaces placeholders in checklist.md.
 *
 * Conservative principle (per AGENTS.md AI 草稿质量要求):
 * - Only reference sources I'm confident about
 * - Mark `<不确定: 待 PM 查证>` when unsure (apply script skips that field)
 * - Each claim_text ≤ 50 汉字, first-person stance
 *
 * Discard after T4 commit (this is a generation helper, not infrastructure).
 */
import { readFileSync, writeFileSync } from 'fs';

interface PersonQuote {
  claim_text: string; // ≤ 50 字
  year: number;
  cats: string; // comma-separated
  keywords: string;
  reference: string; // or `<不确定: 待 PM 查证>`
  deniz_person_id?: string;
}

// 33 person × 3 quote = 99 ClaimNode (AI draft, PM async review)
const QUOTES: Record<string, PersonQuote[]> = {
  // ============ Hegel (1770-1831) · Marx 的直接哲学前驱 ============
  'wd-q9235': [
    {
      claim_text: '理性即现实，凡现实的都是合理的——精神在历史中辩证展开。',
      year: 1820,
      cats: 'me,po',
      keywords: 'Hegelian idealism,dialectic',
      reference: 'Hegel, G.W.F. (1820). Grundlinien der Philosophie des Rechts, 序言.',
      deniz_person_id: '50',
    },
    {
      claim_text: '历史是绝对精神自我认识的辩证过程，每个时代都是必然环节。',
      year: 1807,
      cats: 'me',
      keywords: 'absolute idealism,philosophy of history',
      reference: 'Hegel, G.W.F. (1807). Phänomenologie des Geistes.',
      deniz_person_id: '50',
    },
    {
      claim_text: '主奴辩证法：奴隶通过劳动改造世界，反获自我意识——劳动是自由的中介。',
      year: 1807,
      cats: 'me,po,et',
      keywords: 'master-slave dialectic,labor',
      reference: 'Hegel, G.W.F. (1807). Phänomenologie des Geistes, B.IV.A.',
      deniz_person_id: '50',
    },
  ],
  // ============ Feuerbach (1804-1872) · 唯物主义转折点 ============
  'wd-q76422': [
    {
      claim_text: '神是人的本质的异化投射——不是上帝创造人，是人按自己创造上帝。',
      year: 1841,
      cats: 're,me',
      keywords: 'anthropological materialism,religion critique',
      reference: 'Feuerbach, L. (1841). Das Wesen des Christentums.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '哲学的对象不是抽象精神，而是感性的、肉体的、现实的人。',
      year: 1843,
      cats: 'me,mp',
      keywords: 'sensualism,anthropological turn',
      reference: 'Feuerbach, L. (1843). Grundsätze der Philosophie der Zukunft.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '宗教的秘密在人类学——批判神学必先还原为批判人本身的异化。',
      year: 1841,
      cats: 're,et',
      keywords: 'religion as alienation',
      reference: 'Feuerbach, L. (1841). Das Wesen des Christentums, 第一编.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Max Stirner (1806-1856) · Marx 在《德意志意识形态》批判对象 ============
  'wd-q76725': [
    {
      claim_text: '我把我的事业建立在虚无之上——除唯一者自己以外，一切都是虚妄。',
      year: 1844,
      cats: 'me,et,po',
      keywords: 'egoism,nihilism',
      reference: 'Stirner, M. (1844). Der Einzige und sein Eigentum, 序言.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '国家、社会、人类、神——都是压迫个人的"幽灵"，必须由唯一者抛弃。',
      year: 1844,
      cats: 'po,me',
      keywords: 'anti-statism,individualism',
      reference: 'Stirner, M. (1844). Der Einzige und sein Eigentum.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '共产主义只是把神圣的占有换成神圣的共有——仍以集体名义剥夺个人。',
      year: 1844,
      cats: 'po',
      keywords: 'critique of communism,egoist union',
      reference: 'Stirner, M. (1844). Der Einzige und sein Eigentum, 第二部分.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Proudhon (1809-1865) · Marx《哲学的贫困》论敌 ============
  'wd-q5749': [
    {
      claim_text: '财产就是盗窃——所有权在没有劳动的情况下取得就是对劳动者的掠夺。',
      year: 1840,
      cats: 'po,et',
      keywords: 'mutualism,anti-property',
      reference: "Proudhon, P.-J. (1840). Qu'est-ce que la propriété?",
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '互助主义：自由人之间的契约联合可以取代国家与资本——无政府才是秩序。',
      year: 1851,
      cats: 'po',
      keywords: 'mutualism,anarchism',
      reference: 'Proudhon, P.-J. (1851). Idée générale de la Révolution au XIXe siècle.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '哲学是经济矛盾的体系——贫困即矛盾本身，须由社会互助化解。',
      year: 1846,
      cats: 'po,me',
      keywords: 'philosophy of poverty',
      reference:
        'Proudhon, P.-J. (1846). Système des contradictions économiques ou Philosophie de la misère.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Bakunin (1814-1876) · 第一国际分裂论敌 ============
  'wd-q27645': [
    {
      claim_text: '一切国家都是压迫——即便是无产阶级专政也会变成新红色官僚。',
      year: 1873,
      cats: 'po',
      keywords: 'anarchism,anti-statism',
      reference: 'Bakunin, M. (1873). Государственность и анархия (Statism and Anarchy).',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '自由不能由权威给予，必须由人民自下而上的革命直接夺取。',
      year: 1871,
      cats: 'po,et',
      keywords: 'libertarian socialism,direct revolution',
      reference: 'Bakunin, M. (1871). Бог и государство (God and the State).',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '破坏的激情也是创造的激情——彻底毁灭旧世界才能诞生新世界。',
      year: 1842,
      cats: 'po,et',
      keywords: 'revolutionary destruction',
      reference: 'Bakunin, M. (1842). Die Reaktion in Deutschland.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Engels (1820-1895) · Marx 终身合作者 ============
  'wd-q34787': [
    {
      claim_text: '家庭、私有制、国家是历史产物——母权制曾长期主导，阶级出现才有国家。',
      year: 1884,
      cats: 'po,me',
      keywords: 'historical materialism,family',
      reference: 'Engels, F. (1884). Der Ursprung der Familie, des Privateigentums und des Staats.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '自然辩证法：辩证法不仅是社会规律，也是物质自然演化的根本规律。',
      year: 1883,
      cats: 'sc,me',
      keywords: 'dialectics of nature',
      reference: 'Engels, F. (1883). Dialektik der Natur (posthumous, marxists.org).',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '英国工人阶级的状况是资本主义工业化的代价——他们的解放就是人类的解放。',
      year: 1845,
      cats: 'po,et',
      keywords: 'working class condition,industrial capitalism',
      reference: 'Engels, F. (1845). Die Lage der arbeitenden Klasse in England.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Lassalle (1825-1864) · 德国工人运动 ============
  'wd-q75784': [
    {
      claim_text: '工人必须通过国家选举建立合作社——以普选权和国家资助实现解放。',
      year: 1863,
      cats: 'po',
      keywords: 'state socialism,universal suffrage',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '工资铁律：在自由竞争下工资总趋向最低生存水平——必须用国家干预打破。',
      year: 1863,
      cats: 'po,sc',
      keywords: 'iron law of wages',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '相对于工人阶级，其他一切阶级都是反动的——只有工人代表全民族的未来。',
      year: 1862,
      cats: 'po',
      keywords: 'workers as universal class',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Hyndman (1842-1921) · 英国 SDF 创始人 ============
  'wd-q548271': [
    {
      claim_text: '马克思主义必须本土化——英国走议会道路而非俄式革命也能达到社会主义。',
      year: 1881,
      cats: 'po',
      keywords: 'British socialism,parliamentary road',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '剩余价值理论是社会主义的科学基石——资本剥削有量化经济根据。',
      year: 1881,
      cats: 'po,sc',
      keywords: 'Marxist economics',
      reference: 'Hyndman, H.M. (1881). England for All (借鉴 Capital 但未署名引发与 Marx 不和).',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '英国工人有特权的工资是帝国剥削殖民地的红利——必须警惕沙文主义。',
      year: 1911,
      cats: 'po,et',
      keywords: 'imperialism critique',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Alfred Herman (1842-1890) · Marx 晚期同时代人 / 资料极少 ============
  'wd-q136116320': [
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1872,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1872,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1872,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Labriola (1843-1904) · 意大利第一位马克思主义者 ============
  'wd-q342730': [
    {
      claim_text: '历史唯物主义不是经济宿命论——是研究历史的方法，非预测公式。',
      year: 1896,
      cats: 'me,po',
      keywords: 'Italian Marxism,methodology',
      reference: 'Labriola, A. (1896). In memoria del Manifesto dei Comunisti.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '理论与实践统一——马克思主义首要不是世界观而是无产阶级的行动哲学。',
      year: 1897,
      cats: 'po,mp',
      keywords: 'praxis philosophy',
      reference: 'Labriola, A. (1897). Discorrendo di socialismo e di filosofia.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1895,
      cats: 'po',
      keywords: 'historical materialism',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Marković (1846-1875) · 塞尔维亚社会主义先驱 ============
  'wd-q376036': [
    {
      claim_text: '塞尔维亚 zadruga 公社是社会主义本土基础——可绕过资本主义直达共产。',
      year: 1872,
      cats: 'po',
      keywords: 'agrarian socialism,Balkan socialism',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1872,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1872,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Cafiero (1846-1892) · 意大利无政府主义者 / Capital 摘要 ============
  'wd-q563138': [
    {
      claim_text: '资本论需要通俗化——把 Marx 的剥削分析变成工人能读懂的语言。',
      year: 1879,
      cats: 'po',
      keywords: 'popularizing Marxism',
      reference: 'Cafiero, C. (1879). Il Capitale di Carlo Marx brevemente compendiato.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '无政府共产主义：废除一切国家与所有制——按需分配自下而上的联合。',
      year: 1880,
      cats: 'po',
      keywords: 'anarcho-communism',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1880,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Piekarski (1857-1909) · 波兰社会主义者 / 资料极少 ============
  'wd-q9375804': [
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1887,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1887,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1887,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Unamuno (1864-1936) · 西班牙存在主义者 / 间接相关 ============
  'wd-q185085': [
    {
      claim_text: '人是有血肉的存在，对死亡的痛苦感是哲学的起点——不是抽象理性。',
      year: 1913,
      cats: 'me,et',
      keywords: 'Spanish existentialism,tragic sense',
      reference: 'Unamuno, M. (1913). Del sentimiento trágico de la vida.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '理性和信仰永远冲突——这种矛盾本身才是真正的人性悲剧。',
      year: 1913,
      cats: 're,me',
      keywords: 'reason vs faith',
      reference: 'Unamuno, M. (1913). Del sentimiento trágico de la vida.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1900,
      cats: 'et',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Croce (1866-1952) · 意大利新黑格尔主义者 ============
  'wd-q192348': [
    {
      claim_text: '一切真历史都是当代史——历史只在当下的精神中获得真实存在。',
      year: 1917,
      cats: 'me,mp',
      keywords: 'Italian neo-Hegelianism,philosophy of history',
      reference: 'Croce, B. (1917). Teoria e storia della storiografia.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '马克思主义是经济唯物主义的方法启示——但不是封闭哲学体系。',
      year: 1900,
      cats: 'po,mp',
      keywords: 'critique of Marxism',
      reference: 'Croce, B. (1900). Materialismo storico ed economia marxistica.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '历史是自由的故事——精神在历史中不断扩展和实现自由的范围。',
      year: 1938,
      cats: 'po,me',
      keywords: 'historicism,liberty',
      reference: 'Croce, B. (1938). La storia come pensiero e come azione.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Lyubov Axelrod (1868-1946) · 普列汉诺夫派 / 反列宁 ============
  'wd-q128494': [
    {
      claim_text: '哲学唯物主义必须以认识论为基础——不能跳过哲学直接谈政治。',
      year: 1906,
      cats: 'me,ep',
      keywords: 'Russian Marxism,Plekhanov school',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1900,
      cats: 'me',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1908,
      cats: 'ep,me',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Bortkiewicz (1868-1931) · 转形问题数学家 ============
  'wd-q836646': [
    {
      claim_text: '价值与价格的转形需要联立方程——Marx 第三卷数学上未严格证明完整。',
      year: 1907,
      cats: 'sc,po',
      keywords: 'transformation problem,mathematical economics',
      reference: 'Bortkiewicz, L. v. (1907). Wertrechnung und Preisrechnung im Marxschen System.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1907,
      cats: 'sc',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1907,
      cats: 'sc',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Harry Waton (1870-1959) · 美国 Marxist / 资料较少 ============
  'wd-q110655615': [
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1900,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1900,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1900,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Lenin (1870-1924) · 俄国革命领袖 ============
  'wd-q1394': [
    {
      claim_text: '没有革命的理论，就没有革命的运动——先锋党是工人阶级意识的载体。',
      year: 1902,
      cats: 'po',
      keywords: 'vanguard party,Leninism',
      reference: 'Lenin, V.I. (1902). Что делать? (What Is to Be Done?), marxists.org.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '帝国主义是资本主义的最高阶段——金融资本与垄断把世界划分为殖民体系。',
      year: 1917,
      cats: 'po,sc',
      keywords: 'imperialism theory',
      reference: 'Lenin, V.I. (1917). Империализм, как высшая стадия капитализма, marxists.org.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '国家是阶级压迫的工具——无产阶级必须粉碎旧国家机器，建立专政过渡。',
      year: 1917,
      cats: 'po',
      keywords: 'state and revolution',
      reference: 'Lenin, V.I. (1917). Государство и революция, marxists.org.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Bulgakov (1871-1944) · 从 Marxist 转向东正教神学 ============
  'wd-q332535': [
    {
      claim_text: '马克思主义的经济决定论无法解释精神现象——必须诉诸宗教与终极意义。',
      year: 1903,
      cats: 'po,re',
      keywords: 'Russian religious philosophy',
      reference: 'Bulgakov, S. (1903). От марксизма к идеализму (From Marxism to Idealism).',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '经济是创造活动的精神维度——索菲亚（神圣智慧）贯穿物质生产。',
      year: 1912,
      cats: 'po,re,me',
      keywords: 'sophiology,religious economics',
      reference: 'Bulgakov, S. (1912). Философия хозяйства (Philosophy of Economy).',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1917,
      cats: 're',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Pannekoek (1873-1960) · 议会共产主义 ============
  'wd-q347930': [
    {
      claim_text: '工人议会才是无产阶级真正的自治形式——反对党国一体的列宁式专政。',
      year: 1920,
      cats: 'po',
      keywords: 'council communism,left communism',
      reference: 'Pannekoek, A. (1920). Weltrevolution und kommunistische Taktik.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '工人必须自己解放自己——党代替阶级行动只会重建新的统治。',
      year: 1936,
      cats: 'po',
      keywords: 'workers self-emancipation',
      reference: 'Pannekoek, A. (1936). Lenin als Philosoph (marxists.org).',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1916,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Stalin (1878-1953) · 官方教科书唯物主义 ============
  'wd-q855': [
    {
      claim_text: '辩证唯物主义有四特征：联系、运动、量变质变、对立统一——是普遍世界观。',
      year: 1938,
      cats: 'me',
      keywords: 'diamat,Stalinism',
      reference: 'Stalin, J. (1938). О диалектическом и историческом материализме (marxists.org).',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '一国可以建成社会主义——苏联工业化是先锋，无需等世界革命。',
      year: 1924,
      cats: 'po',
      keywords: 'socialism in one country',
      reference: 'Stalin, J. (1924). Основы ленинизма (Foundations of Leninism), marxists.org.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '阶级斗争在社会主义建设过程中不会消失而会更加尖锐——必须警惕敌人渗透。',
      year: 1937,
      cats: 'po',
      keywords: 'sharpening class struggle',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Ernst Bloch (1885-1977) · 希望哲学 ============
  'wd-q57240': [
    {
      claim_text: '人是仍未完成的存在——希望是面向尚未存在的乌托邦的根本激情。',
      year: 1959,
      cats: 'et,me',
      keywords: 'philosophy of hope,utopia',
      reference: 'Bloch, E. (1959). Das Prinzip Hoffnung.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '马克思主义包含暖流（乌托邦）与冷流（科学）——缺一不可。',
      year: 1959,
      cats: 'po,mp',
      keywords: 'warm/cold currents in Marxism',
      reference: 'Bloch, E. (1959). Das Prinzip Hoffnung, 第一卷.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '艺术、神话、宗教中潜藏着未实现的人性——必须以唯物主义解读。',
      year: 1923,
      cats: 'ae,re',
      keywords: 'utopian function of art',
      reference: 'Bloch, E. (1923). Geist der Utopie.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Moszkowska (1886-1968) · 波兰女经济学家 ============
  'wd-q4305318': [
    {
      claim_text: '资本主义危机根源在消费不足——工资压低导致总需求长期萎缩。',
      year: 1935,
      cats: 'sc,po',
      keywords: 'underconsumption theory,Marxist economics',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1929,
      cats: 'sc',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1943,
      cats: 'sc,po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Korsch (1886-1961) · 西方马克思主义先驱 ============
  'wd-q60208': [
    {
      claim_text: '马克思主义和哲学是同一过程——把理论与无产阶级实践重新连接起来。',
      year: 1923,
      cats: 'mp,po',
      keywords: 'Western Marxism,praxis',
      reference: 'Korsch, K. (1923). Marxismus und Philosophie.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '第二国际把马克思主义庸俗化成实证科学——丢失了革命辩证法。',
      year: 1923,
      cats: 'po,mp',
      keywords: 'critique of orthodoxy',
      reference: 'Korsch, K. (1923). Marxismus und Philosophie.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1938,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Gramsci (1891-1937) · 文化霸权 ============
  'wd-q83003': [
    {
      claim_text: '文化霸权先于政治权力——统治阶级通过市民社会的同意而非仅暴力维持统治。',
      year: 1932,
      cats: 'po,me',
      keywords: 'cultural hegemony,civil society',
      reference: 'Gramsci, A. (1929-1935). Quaderni del carcere (Prison Notebooks).',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '每个人都是知识分子——但只有有机知识分子能从阶级内部组织文化抵抗。',
      year: 1932,
      cats: 'po,et',
      keywords: 'organic intellectuals',
      reference: 'Gramsci, A. Prison Notebooks, Notebook 12.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '阵地战 vs 运动战——发达资本主义需要长期文化阵地战，不是单次起义。',
      year: 1932,
      cats: 'po',
      keywords: 'war of position',
      reference: 'Gramsci, A. Prison Notebooks, Notebook 13.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Benjamin (1892-1940) · 历史的天使 ============
  'wd-q61078': [
    {
      claim_text: '历史的天使被进步的风暴吹向未来，他面向的是堆积如山的废墟。',
      year: 1940,
      cats: 'me,ae',
      keywords: 'philosophy of history,messianic time',
      reference: 'Benjamin, W. (1940). Über den Begriff der Geschichte, IX 节.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '机械复制时代艺术失去了灵韵（aura）——但获得了大众政治化的新潜能。',
      year: 1936,
      cats: 'ae,po',
      keywords: 'aura,mass culture',
      reference:
        'Benjamin, W. (1936). Das Kunstwerk im Zeitalter seiner technischen Reproduzierbarkeit.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '历史唯物主义须从被压迫者视角写作——每个文献都是野蛮的记录。',
      year: 1940,
      cats: 'po,me',
      keywords: 'history from below',
      reference: 'Benjamin, W. (1940). Über den Begriff der Geschichte, VII 节.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Sankrityayan (1893-1963) · 印度 Marxist + 佛学学者 ============
  'wd-q3351937': [
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1923,
      cats: 'po,re',
      keywords: 'Indian Marxism',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1923,
      cats: 'po,re',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1923,
      cats: 'po,re',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Valentin Asmus (1894-1975) · 苏联哲学家 / 资料较少 ============
  'wd-q731904': [
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1924,
      cats: 'me,ep',
      keywords: 'Soviet philosophy',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1924,
      cats: 'me',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1924,
      cats: 'me',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Carlos Astrada (1894-1970) · 阿根廷 Marxist / Heidegger 弟子 ============
  'wd-q2939300': [
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1924,
      cats: 'po,me',
      keywords: 'Latin American Marxism',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1924,
      cats: 'po,me',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1924,
      cats: 'po,me',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Edmund Wilson (1895-1972) · 美国文学批评家 ============
  'wd-q704931': [
    {
      claim_text: '从黑格尔到列宁——社会主义思想是一条连贯的智识革命传统。',
      year: 1940,
      cats: 'po,me',
      keywords: 'intellectual history of socialism',
      reference:
        'Wilson, E. (1940). To the Finland Station: A Study in the Writing and Acting of History.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1940,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1940,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Bataille (1897-1962) · 异端思想家 ============
  'wd-q207359': [
    {
      claim_text: '一般经济学：剩余能量必须以非生产性方式消耗——耗费而非积累是社会真相。',
      year: 1949,
      cats: 'po,me',
      keywords: 'general economy,expenditure',
      reference: 'Bataille, G. (1949). La Part maudite.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '资本主义压抑了献祭、节庆、色情等耗费形式——使能量流回积累陷入危机。',
      year: 1949,
      cats: 'po,et',
      keywords: 'sacrifice,erotism',
      reference: 'Bataille, G. (1949). La Part maudite.',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1933,
      cats: 'ae',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
  // ============ Friedrich Wilcke (1784-1868) · 资料极少 / 可能是 Marx 父亲圈 ============
  'wd-q69028': [
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1814,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1814,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
    {
      claim_text: '<不确定: 待 PM 查证>',
      year: 1814,
      cats: 'po',
      keywords: '<不确定: 待 PM 查证>',
      reference: '<不确定: 待 PM 查证>',
      deniz_person_id: '<不确定: 待 PM 查证>',
    },
  ],
};

const CHECKLIST_PATH = 'docs/m4-validation/person-quote-checklist.md';

function fillDrafts() {
  let md = readFileSync(CHECKLIST_PATH, 'utf-8');

  // Pattern: H2 = ## claim-q<id>-<NN>
  // For each person id, replace placeholders in 3 entries
  let replaced = 0;
  let unsureCount = 0;
  for (const [personId, quotes] of Object.entries(QUOTES)) {
    const idSuffix = personId.replace('wd-q', 'q');
    for (let i = 0; i < quotes.length; i++) {
      const claimId = `claim-${idSuffix}-${String(i + 1).padStart(2, '0')}`;
      const q = quotes[i];

      // Section split: each entry is between `## <claimId>` and next `---` or EOF
      const headerRe = new RegExp(`(## ${claimId}\\n[\\s\\S]*?)(?=\\n---\\n)`, 'm');
      const m = md.match(headerRe);
      if (!m) {
        console.warn(`  ⚠️ Section ${claimId} not found`);
        continue;
      }
      let section = m[1];

      section = section.replace(
        /- \*\*claim_text\*\*[^\n]*\n/,
        `- **claim_text**（≤ 50 字主张式）: ${q.claim_text}\n`,
      );
      section = section.replace(/- \*\*year\*\*[^\n]*\n/, `- **year**: ${q.year}\n`);
      section = section.replace(
        /- \*\*cats\*\*[^\n]*\n/,
        `- **cats**（po/me/et/re/mp 等）: ${q.cats}\n`,
      );
      section = section.replace(
        /- \*\*keywords\*\*[^\n]*\n/,
        `- **keywords**（思想流派）: ${q.keywords}\n`,
      );
      section = section.replace(
        /- \*\*reference\*\*[^\n]*\n/,
        `- **reference**（出处文献）: ${q.reference}\n`,
      );
      section = section.replace(
        /- \*\*deniz_person_id\*\*[^\n]*\n/,
        `- **deniz_person_id**（可选，查 scripts/data/deniz-person-lookup.md 找对应 id；填了 T5 能拿到 cross-person link）: ${q.deniz_person_id ?? ''}\n`,
      );

      md = md.replace(m[1], section);
      replaced++;
      if (q.claim_text.startsWith('<不确定')) unsureCount++;
    }
  }

  writeFileSync(CHECKLIST_PATH, md);
  console.log(`Filled ${replaced} entries (${unsureCount} marked <不确定> for whole claim_text)`);
}

fillDrafts();
