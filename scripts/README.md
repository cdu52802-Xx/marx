# scripts/ · 数据采集与校验脚本

> 项目工具脚本目录，**不参与产品 build**（vite 不打包这里的内容）。

## 目录结构

- `sparql/` · SPARQL 查询模板（`.sparql` 纯文本，可在 https://query.wikidata.org/ 直接粘贴调试）
- `sparql/cache/` · 离线缓存 JSON（M2 方案 b 用：本机 wikidata 不通时，把网页 UI 跑出来的结果存这里）
- `fetch-skeleton.ts` · 跑全部 SPARQL 查询、合并去重、规范化为产品 schema、写出 `src/data/nodes_skeleton.json`

## 怎么跑

确保已经装 `tsx`（M2 引入的 dev 依赖）：

```bash
npm install
```

跑 M2 数据采集（默认从 Wikidata endpoint 拉数据）：

```bash
npm run fetch:skeleton
```

走方案 b 离线缓存（中国大陆本机 wikidata 不通时）：

```bash
# 先把 5 个查询的 JSON 结果手动放到 scripts/sparql/cache/01..05.json
MARX_USE_CACHE=1 npm run fetch:skeleton
```

输出：`src/data/nodes_skeleton.json`（覆盖式写）。

## 调试 SPARQL 单查询

打开 https://query.wikidata.org/，粘贴 `sparql/<NN>-*.sparql` 文件内容，点 ▶ Run。Wikidata 的 Web UI 比脚本好调试。

## 重要约定

- 一份 `.sparql` 一个查询，不在脚本里拼字符串（拼字符串难调试）
- Marx 的 Wikidata QID = `Q9061`
- 所有查询通过 `wikibase:label` 服务拿中文 label，回退英 / 德 / 法
- Wikidata SPARQL endpoint rate limit 5 query/s 非登录用户，脚本里 sleep 一下避免被 throttle
