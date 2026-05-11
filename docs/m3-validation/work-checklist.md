# Marx 星图 M3 阶段 B · work 节点校对清单

> **说明**：本文件由 `npm run m3:gen-md` 生成。

> **填写规则**：
> - name_orig：原文标题，如《资本论》→ "Das Kapital"
> - writing_period：写作时段，如 "1857-1867"
> - summary：3 行内事件式简明，单 string 用 " / " 分隔 sub-events
> - author_id：作者节点 ID，如马克思 = "wd-q9061"

> **节点数**：4

> **PM 复核状态（2026-05-11）**：本轮 PM 容量不足，转入 opportunistic 复核模式（详见 [anchor 决策 4](../2026-05-08-m3-progress-anchor.md)）。
>
> ✅ **已入库**（4 work 全 AI 草稿）
> - 4 个 name_orig（德语原标题，标准学术拼写） + 4 个 writing_period + 4 个 summary + ~8 个 citation_urls AI 草稿已入 `src/data/nodes_skeleton.json`
>
> ⏳ **无 `<不确定>` 节点**（4 work 都是 Marx 经典著作，无歧义）
>
> ⏳ **opportunistic 复核重点**
> - writing_period 学术常用区间（如《资本论》= 1857-1867）— PM 可根据偏好（计划起 / 集中写作 / 完稿）改
> - summary 3 sub-events 选择 + 措辞 AI default — PM 可换 events 或改措辞
> - citation_urls AI 没访问验证（中国大陆网络限制），可能死链，复核时遇到改成可访问 URL

---

### Q40591 共产党宣言

**Wikidata 链接**: https://www.wikidata.org/wiki/Q40591
**当前已有**: pub_year=1848
**待补**:

- name_orig: Manifest der Kommunistischen Partei
- writing_period: 1847-1848
- summary: 1847 共产主义者同盟委托 / 1848年2月 伦敦德文版出版 / 引发欧洲革命之春
- author_id: wd-q9061
- citation_urls:
  - https://www.marxists.org/chinese/marx-engels/01/index.htm
  - https://www.marxists.org/archive/marx/works/1848/communist-manifesto/

---

### Q58784 资本论

**Wikidata 链接**: https://www.wikidata.org/wiki/Q58784
**当前已有**: pub_year=1867
**待补**:

- name_orig: Das Kapital, Kritik der politischen Ökonomie
- writing_period: 1857-1867
- summary: 1857 开始政治经济学研究 / 1867年9月 第一卷汉堡出版 / 1885+1894 恩格斯整理 II/III 卷
- author_id: wd-q9061
- citation_urls:
  - https://www.marxists.org/chinese/marx/01/index.htm
  - https://www.marxists.org/archive/marx/works/1867-c1/

---

### Q295347 1844年哲学和经济学手稿

**Wikidata 链接**: https://www.wikidata.org/wiki/Q295347
**当前已有**: pub_year=1932
**待补**:

- name_orig: Ökonomisch-philosophische Manuskripte aus dem Jahre 1844
- writing_period: 1844
- summary: 1844 巴黎流亡期笔记 / 论异化劳动 + 私有财产批判 / 1932 苏联档案首次完整刊出
- author_id: wd-q9061
- citation_urls:
  - https://www.marxists.org/chinese/marx/1844/index.htm
  - https://www.marxists.org/archive/marx/works/1844/manuscripts/

---

### Q470600 德意志意識形態

**Wikidata 链接**: https://www.wikidata.org/wiki/Q470600
**当前已有**: pub_year=1932
**待补**:

- name_orig: Die Deutsche Ideologie
- writing_period: 1845-1846
- summary: 1845-46 Marx + Engels 合著 / 批判青年黑格尔派 + 费尔巴哈 / 1932 苏联首次完整出版
- author_id: wd-q9061
- citation_urls:
  - https://www.marxists.org/chinese/marx/02/index.htm
  - https://www.marxists.org/archive/marx/works/1845/german-ideology/

---
