# Marx 星图 M3 阶段 B · person 节点校对清单

> **说明**：本文件由 `npm run m3:gen-md` 生成。请按下列格式逐节点填字段值。已填的字段（如 birth_year）保留即可。**不要**改 H3 标题（"### Q9235 ..."），脚本回填靠 H3 识别节点。

> **填写规则**：
> - 字段值用 `<占位>` 包裹的视为未填，脚本会跳过
> - latlng 格式：`52.5200,13.4050`（逗号分隔 lat,lng）
> - bio_event_style：每行一条事件，最多 5 行，格式 "yyyy 年 - 做了什么"
> - citation_urls：每行一个 URL，建议 marxists.org / plato.stanford.edu / 中文学术网

> **节点数**：34

> **PM 复核状态（2026-05-11）**：本轮 PM 容量不足，转入 opportunistic 复核模式（详见 [anchor 决策 4](../2026-05-08-m3-progress-anchor.md)）。
>
> ✅ **已入库**（person 4 字段 AI 草稿全 ship）
> - 30 个 name_orig + 30 个 latlng + 30 个 bio_event_style (5 条/人) + ~50 个 citation_urls AI 草稿已入 `src/data/nodes_skeleton.json`（Marx 1 个本来就有）
>
> ⏳ **3 个 `<不确定>` 节点 name_orig + latlng + bio + citations 都为空待复核**
> - **Q136116320** Alfred Herman / **Q110655615** Harry Waton / **Q69028** 弗里德里希·威爾克
> - 注：JSON 中 name_orig 是 M2 SPARQL fallback 到 name_zh 的值（如 Alfred Herman），test 会 fail line 32（这是 expected RED 维持，直到 PM 复核填正确 name_orig）
>
> ⏳ **学术敏感 AI default 已入库，PM 可换**
> - name_orig（3）：**Q1394** 列宁 → Lenin / **Q855** 斯大林 → Stalin / **Q57240** Bloch → Simon Bloch
> - latlng（6）：**Q27645** 巴枯宁 → Geneva / **Q34787** 恩格斯 → Manchester / **Q1394** 列宁 → Moscow / **Q57240** Bloch → Leipzig / **Q83003** 葛兰西 → Turin / **Q332535** Bulgakov → Paris
> - bio：30 个 person × 5 事件全是 AI default（事件选择 + 措辞均有争议），核心人物（Marx / Engels / Lenin / Gramsci / Benjamin 等）建议 M4 启动前重点过一遍
> - citations：AI 没访问验证（中国大陆网络限制），部分 marxists.org 路径可能死链，复核时遇到改成可访问 URL

---

### Q9061 卡尔·马克思

**Wikidata 链接**: https://www.wikidata.org/wiki/Q9061
**当前已有**: birth_year=1818 / death_year=1883
**待补**:

- name_orig: Karl Marx
- main_location_lat_lng: 51.5074,-0.1278
- bio_event_style:
  - 1818年5月 - 生于普鲁士特里尔
  - 1841年 - 耶拿大学博士论文
  - 1844年8月 - 巴黎遇恩格斯，思想合流
  - 1849年8月 - 流亡伦敦，余生 34 年
  - 1867年9月 - 《资本论》第一卷出版
- citation_urls:
  - https://www.marxists.org/archive/marx/
  - https://plato.stanford.edu/entries/marx/

---

### Q9235 格奥尔格·威廉·弗里德里希·黑格尔

**Wikidata 链接**: https://www.wikidata.org/wiki/Q9235
**当前已有**: birth_year=1770 / death_year=1831
**待补**:

- name_orig: Georg Wilhelm Friedrich Hegel
- main_location_lat_lng: 52.5200,13.4050
- bio_event_style:
  - 1770年8月 - 生于符腾堡斯图加特
  - 1788年 - 入图宾根大学神学院
  - 1807年 - 《精神现象学》出版
  - 1818年 - 柏林大学哲学讲席
  - 1831年11月 - 柏林霍乱亡
- citation_urls:
  - https://www.marxists.org/reference/archive/hegel/
  - https://plato.stanford.edu/entries/hegel/

---

### Q76422 路德维希·费尔巴哈

**Wikidata 链接**: https://www.wikidata.org/wiki/Q76422
**当前已有**: birth_year=1804 / death_year=1872
**待补**:

- name_orig: Ludwig Feuerbach
- main_location_lat_lng: 49.4500,10.7500
- bio_event_style:
  - 1804年7月 - 生于巴伐利亚兰茨胡特
  - 1828年 - 埃尔朗根大学讲师
  - 1841年 - 《基督教的本质》出版
  - 1845年 - 隐居巴伐利亚 Bruckberg
  - 1872年9月 - Nuremberg 附近逝
- citation_urls:
  - https://www.marxists.org/reference/archive/feuerbach-ludwig/
  - https://plato.stanford.edu/entries/ludwig-feuerbach/

---

### Q76725 麥克斯·施蒂納

**Wikidata 链接**: https://www.wikidata.org/wiki/Q76725
**当前已有**: birth_year=1806 / death_year=1856
**待补**:

- name_orig: Max Stirner
- main_location_lat_lng: 52.5200,13.4050
- bio_event_style:
  - 1806年10月 - 生于拜罗伊特
  - 1842-43年 - 加入青年黑格尔派
  - 1844年 - 《唯一者及其所有物》出版
  - 1845年后 - 商业失败 + 入债务监狱
  - 1856年6月 - 柏林虫叮感染亡
- citation_urls:
  - https://www.marxists.org/reference/archive/stirner/
  - https://plato.stanford.edu/entries/max-stirner/

---

### Q5749 皮埃爾-約瑟夫·普魯東

**Wikidata 链接**: https://www.wikidata.org/wiki/Q5749
**当前已有**: birth_year=1809 / death_year=1865
**待补**:

- name_orig: Pierre-Joseph Proudhon
- main_location_lat_lng: 48.8566,2.3522
- bio_event_style:
  - 1809年1月 - 生于贝桑松工匠家
  - 1840年 - 《什么是所有权》出版
  - 1846年 - 《贫困的哲学》出版
  - 1858年 - 因《论正义》流亡比利时
  - 1865年1月 - 巴黎逝
- citation_urls:
  - https://www.marxists.org/reference/subject/economics/proudhon/
  - https://plato.stanford.edu/entries/proudhon/

---

### Q27645 米哈伊尔·巴枯宁

**Wikidata 链接**: https://www.wikidata.org/wiki/Q27645
**当前已有**: birth_year=1814 / death_year=1876
**待补**:

- name_orig: Mikhail Bakunin
- main_location_lat_lng: 46.2044,6.1432
- bio_event_style:
  - 1814年5月 - 生于俄国 Pryamukhino
  - 1849年 - 参与德累斯顿起义被捕
  - 1861年 - 从西伯利亚流放逃出
  - 1872年 - 海牙大会被开除第一国际
  - 1876年7月 - 伯尔尼逝
- citation_urls:
  - https://www.marxists.org/reference/archive/bakunin/
  - https://plato.stanford.edu/entries/bakunin/

---

### Q34787 弗里德里希·恩格斯

**Wikidata 链接**: https://www.wikidata.org/wiki/Q34787
**当前已有**: birth_year=1820 / death_year=1895
**待补**:

- name_orig: Friedrich Engels
- main_location_lat_lng: 53.4808,-2.2426
- bio_event_style:
  - 1820年11月 - 生于普鲁士巴门
  - 1844年8月 - 巴黎遇 Marx 思想合流
  - 1845年 - 《英国工人阶级状况》出版
  - 1883年后 - 编辑《资本论》II/III 卷
  - 1895年8月 - 伦敦逝
- citation_urls:
  - https://www.marxists.org/archive/marx/index.htm
  - https://en.wikipedia.org/wiki/Friedrich_Engels

---

### Q75784 费迪南德·拉萨尔

**Wikidata 链接**: https://www.wikidata.org/wiki/Q75784
**当前已有**: birth_year=1825 / death_year=1864
**待补**:

- name_orig: Ferdinand Lassalle
- main_location_lat_lng: 52.5200,13.4050
- bio_event_style:
  - 1825年4月 - 生于布雷斯劳犹太商家
  - 1848年 - 参与莱茵革命被捕
  - 1863年5月 - 创立全德工人联合会
  - 1864年8月 - 日内瓦 Carouge 决斗受伤
  - 1864年8月 - 决斗伤亡
- citation_urls:
  - https://www.marxists.org/archive/lassalle/
  - https://en.wikipedia.org/wiki/Ferdinand_Lassalle

---

### Q548271 亨利·迈尔斯·海德门

**Wikidata 链接**: https://www.wikidata.org/wiki/Q548271
**当前已有**: birth_year=1842 / death_year=1921
**待补**:

- name_orig: Henry Mayers Hyndman
- main_location_lat_lng: 51.5074,-0.1278
- bio_event_style:
  - 1842年3月 - 生于伦敦
  - 1881年 - 创立社会民主同盟 (SDF)
  - 1900年 - 反对布尔战争
  - 1911年 - 创立英国社会党 (BSP)
  - 1921年11月 - 伦敦逝
- citation_urls:
  - https://www.marxists.org/archive/hyndman/
  - https://en.wikipedia.org/wiki/Henry_Hyndman

---

### Q136116320 Alfred Herman

**Wikidata 链接**: https://www.wikidata.org/wiki/Q136116320
**当前已有**: birth_year=1842 / death_year=1890
**待补**:

- name_orig: <不确定: name_zh 已是英文 Alfred Herman，请点 Wikidata 链接核对原文是否为 Alfred Hermann (双 n) 或其他>
- main_location_lat_lng: <不确定: 人物身份模糊，主要活动地待 Wikidata 核对>
- bio_event_style:
  - <每行一条事件，最多 5 行，格式 "yyyy 年 - 做了什么">
- citation_urls:
  - <在这里填 1-3 个引用 URL，每行一条>

---

### Q342730 安东尼奥·拉布里奥拉

**Wikidata 链接**: https://www.wikidata.org/wiki/Q342730
**当前已有**: birth_year=1843 / death_year=1904
**待补**:

- name_orig: Antonio Labriola
- main_location_lat_lng: 41.9028,12.4964
- bio_event_style:
  - 1843年7月 - 生于卡西诺
  - 1874年 - 罗马大学道德哲学教席
  - 1893年 - 《纪念马克思宣言》出版
  - 1896年 - 《历史唯物主义随笔》出版
  - 1904年2月 - 罗马逝
- citation_urls:
  - https://www.marxists.org/archive/labriola/
  - https://en.wikipedia.org/wiki/Antonio_Labriola

---

### Q376036 斯韦托扎尔·马尔科维奇

**Wikidata 链接**: https://www.wikidata.org/wiki/Q376036
**当前已有**: birth_year=1846 / death_year=1875
**待补**:

- name_orig: Svetozar Marković
- main_location_lat_lng: 44.7866,20.4489
- bio_event_style:
  - 1846年9月 - 生于塞尔维亚 Zaječar
  - 1866年 - 留学俄国 + 瑞士
  - 1871年 - 创办塞尔维亚社党报刊
  - 1875年 - 流亡赴俄途中肺病重
  - 1875年2月 - Trieste 逝
- citation_urls:
  - https://en.wikipedia.org/wiki/Svetozar_Markovi%C4%87

---

### Q563138 卡洛·卡菲耶罗

**Wikidata 链接**: https://www.wikidata.org/wiki/Q563138
**当前已有**: birth_year=1846 / death_year=1892
**待补**:

- name_orig: Carlo Cafiero
- main_location_lat_lng: 40.8518,14.2681
- bio_event_style:
  - 1846年9月 - 生于意大利巴尔莱塔
  - 1872年 - 加入巴枯宁国际联盟
  - 1879年 - 《资本论》意大利文译本
  - 1882年 - 精神崩溃入院
  - 1892年7月 - 诺利逝
- citation_urls:
  - https://www.marxists.org/archive/cafiero/
  - https://en.wikipedia.org/wiki/Carlo_Cafiero

---

### Q9375804 Witold Rola Piekarski

**Wikidata 链接**: https://www.wikidata.org/wiki/Q9375804
**当前已有**: birth_year=1857 / death_year=1909
**待补**:

- name_orig: Witold Rola-Piekarski
- main_location_lat_lng: 52.2297,21.0122
- bio_event_style:
  - 1857年 - 生于俄属波兰
  - 1880年代 - 入"无产阶级"波兰社党
  - 1885年 - 被沙俄流放西伯利亚
  - 1900年代 - 重返波兰革命活动
  - 1909年 - 华沙逝
- citation_urls:
  - https://en.wikipedia.org/wiki/Witold_Piekarski

---

### Q185085 米格尔·德·乌纳穆诺

**Wikidata 链接**: https://www.wikidata.org/wiki/Q185085
**当前已有**: birth_year=1864 / death_year=1936
**待补**:

- name_orig: Miguel de Unamuno
- main_location_lat_lng: 40.9701,-5.6635
- bio_event_style:
  - 1864年9月 - 生于毕尔巴鄂
  - 1891年 - 萨拉曼卡大学希腊语教授
  - 1901年 - 萨拉曼卡大学校长
  - 1924年 - 反 Primo de Rivera 流亡
  - 1936年12月 - 软禁中亡
- citation_urls:
  - https://plato.stanford.edu/entries/miguel-de-unamuno/
  - https://en.wikipedia.org/wiki/Miguel_de_Unamuno

---

### Q192348 贝内德托·克罗齐

**Wikidata 链接**: https://www.wikidata.org/wiki/Q192348
**当前已有**: birth_year=1866 / death_year=1952
**待补**:

- name_orig: Benedetto Croce
- main_location_lat_lng: 40.8518,14.2681
- bio_event_style:
  - 1866年2月 - 生于 Pescasseroli
  - 1903年 - 创办《La Critica》杂志
  - 1920年 - 任意大利教育部长
  - 1925年 - 起草反法西斯知识分子宣言
  - 1952年11月 - 那不勒斯逝
- citation_urls:
  - https://plato.stanford.edu/entries/croce/
  - https://en.wikipedia.org/wiki/Benedetto_Croce

---

### Q128494 Lyubov Axelrod

**Wikidata 链接**: https://www.wikidata.org/wiki/Q128494
**当前已有**: birth_year=1868 / death_year=1946
**待补**:

- name_orig: Lyubov Axelrod
- main_location_lat_lng: 46.2044,6.1432
- bio_event_style:
  - 1868年 - 生于俄国白罗斯
  - 1880年代 - 加入民意党流亡瑞士
  - 1900年 - 与普列汉诺夫合作《火星报》
  - 1920年代 - 任莫斯科共产主义学院
  - 1946年2月 - 莫斯科逝
- citation_urls:
  - https://www.marxists.org/archive/axelrod-lyubov/
  - https://en.wikipedia.org/wiki/Lyubov_Axelrod

---

### Q836646 拉蒂斯勞斯·波特凱維茨

**Wikidata 链接**: https://www.wikidata.org/wiki/Q836646
**当前已有**: birth_year=1868 / death_year=1931
**待补**:

- name_orig: Władysław Bortkiewicz
- main_location_lat_lng: 52.5200,13.4050
- bio_event_style:
  - 1868年8月 - 生于圣彼得堡波兰裔家
  - 1895年 - Strasbourg 统计学博士
  - 1898年 - 柏林大学经济统计教席
  - 1907年 - 论 Marx 价值转形问题
  - 1931年7月 - 柏林逝
- citation_urls:
  - https://en.wikipedia.org/wiki/Ladislaus_Bortkiewicz

---

### Q110655615 Harry Waton

**Wikidata 链接**: https://www.wikidata.org/wiki/Q110655615
**当前已有**: birth_year=1870 / death_year=1959
**待补**:

- name_orig: <不确定: Harry Waton 已是英文形式，请点 Wikidata 链接核对>
- main_location_lat_lng: <不确定: 人物身份模糊，主要活动地待 Wikidata 核对>
- bio_event_style:
  - <每行一条事件，最多 5 行，格式 "yyyy 年 - 做了什么">
- citation_urls:
  - <在这里填 1-3 个引用 URL，每行一条>

---

### Q1394 列宁

**Wikidata 链接**: https://www.wikidata.org/wiki/Q1394
**当前已有**: birth_year=1870 / death_year=1924
**待补**:

- name_orig: Vladimir Lenin
- main_location_lat_lng: 55.7558,37.6173
- bio_event_style:
  - 1870年4月 - 生于辛比尔斯克
  - 1900-03年 - 瑞士流亡 + 创《火星报》
  - 1917年4月 - 回俄发布《四月提纲》
  - 1917年11月 - 领导十月革命夺权
  - 1924年1月 - 戈尔基村亡
- citation_urls:
  - https://www.marxists.org/archive/lenin/
  - https://en.wikipedia.org/wiki/Vladimir_Lenin

---

### Q332535 谢尔盖·布尔加科夫

**Wikidata 链接**: https://www.wikidata.org/wiki/Q332535
**当前已有**: birth_year=1871 / death_year=1944
**待补**:

- name_orig: Sergei Bulgakov
- main_location_lat_lng: 48.8566,2.3522
- bio_event_style:
  - 1871年7月 - 生于俄国奥勒尔
  - 1901年 - 莫斯科教研经济学
  - 1922年 - 被苏联驱逐"哲学船"
  - 1925年 - 巴黎圣谢尔吉神学院院长
  - 1944年7月 - 巴黎逝
- citation_urls:
  - https://plato.stanford.edu/entries/bulgakov-sergei/
  - https://en.wikipedia.org/wiki/Sergei_Bulgakov

---

### Q347930 安東尼·潘涅庫克

**Wikidata 链接**: https://www.wikidata.org/wiki/Q347930
**当前已有**: birth_year=1873 / death_year=1960
**待补**:

- name_orig: Anton Pannekoek
- main_location_lat_lng: 52.3676,4.9041
- bio_event_style:
  - 1873年1月 - 生于荷兰 Vaassen
  - 1906年 - 加入荷兰社会民主工党
  - 1918年 - 创立荷兰共产党
  - 1936年 - 《工人委员会》理论奠基
  - 1960年4月 - Wageningen 逝
- citation_urls:
  - https://www.marxists.org/archive/pannekoe/
  - https://en.wikipedia.org/wiki/Anton_Pannekoek

---

### Q855 约瑟夫·斯大林

**Wikidata 链接**: https://www.wikidata.org/wiki/Q855
**当前已有**: birth_year=1878 / death_year=1953
**待补**:

- name_orig: Joseph Stalin
- main_location_lat_lng: 55.7558,37.6173
- bio_event_style:
  - 1878年12月 - 生于格鲁吉亚 Gori
  - 1917年 - 任布尔什维克中央委员
  - 1922年 - 任苏共总书记
  - 1928年 - 启动一五计划 + 集体化
  - 1953年3月 - 莫斯科逝
- citation_urls:
  - https://www.marxists.org/reference/archive/stalin/
  - https://en.wikipedia.org/wiki/Joseph_Stalin

---

### Q57240 恩斯特·西蒙·布洛赫

**Wikidata 链接**: https://www.wikidata.org/wiki/Q57240
**当前已有**: birth_year=1885 / death_year=1977
**待补**:

- name_orig: Ernst Simon Bloch
- main_location_lat_lng: 51.3397,12.3731
- bio_event_style:
  - 1885年7月 - 生于莱茵兰 Ludwigshafen
  - 1918年 - 《乌托邦精神》出版
  - 1938-49年 - 美国流亡
  - 1949年 - 莱比锡大学哲学教席
  - 1977年8月 - Tübingen 逝
- citation_urls:
  - https://plato.stanford.edu/entries/bloch/
  - https://en.wikipedia.org/wiki/Ernst_Bloch

---

### Q4305318 Natalia Moszkowska

**Wikidata 链接**: https://www.wikidata.org/wiki/Q4305318
**当前已有**: birth_year=1886 / death_year=1968
**待补**:

- name_orig: Natalia Moszkowska
- main_location_lat_lng: 47.3769,8.5417
- bio_event_style:
  - 1886年 - 生于华沙犹太家庭
  - 1929年 - 苏黎世经济学博士
  - 1935年 - 《Marx 价值理论批判》出版
  - 1960年代 - 苏黎世经济学界活跃
  - 1968年 - 苏黎世逝
- citation_urls:
  - https://en.wikipedia.org/wiki/Natalia_Moszkowska

---

### Q60208 卡爾·柯爾施

**Wikidata 链接**: https://www.wikidata.org/wiki/Q60208
**当前已有**: birth_year=1886 / death_year=1961
**待补**:

- name_orig: Karl Korsch
- main_location_lat_lng: 52.5200,13.4050
- bio_event_style:
  - 1886年8月 - 生于汉堡 Tostedt
  - 1923年 - 《Marxism 与哲学》出版
  - 1926年 - 被开除德共
  - 1933年 - 流亡丹麦后转美国
  - 1961年10月 - 麻州 Belmont 逝
- citation_urls:
  - https://www.marxists.org/archive/korsch/
  - https://en.wikipedia.org/wiki/Karl_Korsch

---

### Q83003 安东尼奥·葛兰西

**Wikidata 链接**: https://www.wikidata.org/wiki/Q83003
**当前已有**: birth_year=1891 / death_year=1937
**待补**:

- name_orig: Antonio Gramsci
- main_location_lat_lng: 45.0703,7.6869
- bio_event_style:
  - 1891年1月 - 生于撒丁岛 Ales
  - 1919年 - 都灵创《Ordine Nuovo》
  - 1921年 - 创立意大利共产党
  - 1926年 - 被法西斯逮捕入狱
  - 1937年4月 - 罗马监狱医院逝
- citation_urls:
  - https://www.marxists.org/archive/gramsci/
  - https://plato.stanford.edu/entries/gramsci/

---

### Q61078 瓦尔特·本雅明

**Wikidata 链接**: https://www.wikidata.org/wiki/Q61078
**当前已有**: birth_year=1892 / death_year=1940
**待补**:

- name_orig: Walter Benjamin
- main_location_lat_lng: 48.8566,2.3522
- bio_event_style:
  - 1892年7月 - 生于柏林犹太家庭
  - 1925年 - 教职论文《德国哀悼剧》被拒
  - 1933年 - 纳粹上台流亡巴黎
  - 1936年 - 《机械复制时代艺术作品》出版
  - 1940年9月 - 西法边境 Portbou 自杀
- citation_urls:
  - https://plato.stanford.edu/entries/benjamin/
  - https://en.wikipedia.org/wiki/Walter_Benjamin

---

### Q3351937 羅睺羅•桑克特雅揚

**Wikidata 链接**: https://www.wikidata.org/wiki/Q3351937
**当前已有**: birth_year=1893 / death_year=1963
**待补**:

- name_orig: Rāhula Sāṅkr̥tyāyana
- main_location_lat_lng: 25.3176,82.9739
- bio_event_style:
  - 1893年4月 - 生于印度北方邦
  - 1920年代 - 入佛教 + 学梵巴利文
  - 1937-38年 - 苏联列宁格勒大学讲学
  - 1947年 - 加入印度共产党
  - 1963年4月 - 大吉岭逝
- citation_urls:
  - https://en.wikipedia.org/wiki/Rahul_Sankrityayan

---

### Q731904 Valentin Asmus

**Wikidata 链接**: https://www.wikidata.org/wiki/Q731904
**当前已有**: birth_year=1894 / death_year=1975
**待补**:

- name_orig: Valentin Asmus
- main_location_lat_lng: 55.7558,37.6173
- bio_event_style:
  - 1894年12月 - 生于俄属波兰基辅
  - 1925年 - 莫斯科大学哲学教席
  - 1930年代 - 苏联《哲学史》教科书撰写
  - 1958年 - 《柏拉图》传记出版
  - 1975年6月 - 莫斯科逝
- citation_urls:
  - https://en.wikipedia.org/wiki/Valentin_Asmus

---

### Q2939300 Carlos Astrada

**Wikidata 链接**: https://www.wikidata.org/wiki/Q2939300
**当前已有**: birth_year=1894 / death_year=1970
**待补**:

- name_orig: Carlos Astrada
- main_location_lat_lng: -34.6037,-58.3816
- bio_event_style:
  - 1894年2月 - 生于阿根廷 Córdoba
  - 1929年 - 留学 Freiburg 师从海德格尔
  - 1936年 - 《海德格尔的哲学》出版
  - 1952年 - 加入阿根廷共产党
  - 1970年12月 - 布宜诺斯艾利斯逝
- citation_urls:
  - https://en.wikipedia.org/wiki/Carlos_Astrada

---

### Q704931 埃德蒙·威尔逊

**Wikidata 链接**: https://www.wikidata.org/wiki/Q704931
**当前已有**: birth_year=1895 / death_year=1972
**待补**:

- name_orig: Edmund Wilson
- main_location_lat_lng: 40.7128,-74.0060
- bio_event_style:
  - 1895年5月 - 生于新泽西 Red Bank
  - 1929年 - 《Axel's Castle》文学批评
  - 1940年 - 《To the Finland Station》出版
  - 1955年 - 《死海古卷》研究
  - 1972年6月 - 纽约 Talcottville 逝
- citation_urls:
  - https://en.wikipedia.org/wiki/Edmund_Wilson

---

### Q207359 喬治·巴代伊

**Wikidata 链接**: https://www.wikidata.org/wiki/Q207359
**当前已有**: birth_year=1897 / death_year=1962
**待补**:

- name_orig: Georges Bataille
- main_location_lat_lng: 48.8566,2.3522
- bio_event_style:
  - 1897年9月 - 生于法国 Billom
  - 1929年 - 创办《Documents》杂志
  - 1933年 - 与超现实主义运动决裂
  - 1949年 - 《被诅咒的份额》出版
  - 1962年7月 - 巴黎逝
- citation_urls:
  - https://plato.stanford.edu/entries/bataille/
  - https://en.wikipedia.org/wiki/Georges_Bataille

---

### Q69028 弗里德里希·威爾克

**Wikidata 链接**: https://www.wikidata.org/wiki/Q69028
**当前已有**: birth_year=1784 / death_year=1868
**待补**:

- name_orig: <不确定: 弗里德里希·威爾克 译名歧义，可能是 Friedrich Wilcke / Friedrich Vielke / Friedrich Wielke，请点 Wikidata 链接核对>
- main_location_lat_lng: <不确定: 人物身份模糊，主要活动地待 Wikidata 核对>
- bio_event_style:
  - <每行一条事件，最多 5 行，格式 "yyyy 年 - 做了什么">
- citation_urls:
  - <在这里填 1-3 个引用 URL，每行一条>

---
