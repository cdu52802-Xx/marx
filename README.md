# Marx

> 0 代码 PM 在 vibe coding 模式下的第一个产品。当前阶段：仅有结构骨架，产品方向待定。

## 目录说明

| 目录 / 文件 | 用途 |
|---|---|
| `docs/` | 需求、PRD、设计稿、决策记录（跟代码一起进 git） |
| `src/` | 代码（具体结构由项目类型决定，未来再加） |
| `.gitignore` | 忽略列表（IDE 临时文件、AI 工具配置、密钥等） |
| `README.md` | 这个文件 |

## 跨电脑协作

- **这台电脑**（Claude 主力机）：`F:\AI\projects\Marx\`
- **另一台电脑**（Codex 主力机）：在那台运行 `gh repo clone cdu52802-Xx/marx`，建议放在 `<盘>:\AI\projects\Marx\`
- **同步靠 GitHub**：每次开工 `git pull`，每次收工 `git push`

## 规则

- AI 工具的本地配置（`.claude/` `.codex/` 等）**不入库**
- 密钥、`.env`、token **绝不入库**
- 上述都已在 `.gitignore` 里管着，照常 commit 即可

## M1 项目骨架（已上线）

线上：https://cdu52802-xx.github.io/marx/

### 本地开发命令

```bash
npm install                       # 首次
npx playwright install chromium   # 首次（e2e 需要）

npm run dev              # 本地开发 server (localhost:5173/marx/)
npm run build            # 生产构建到 dist/
npm run preview          # 本地预览 build 产物 (localhost:4173/marx/)

npm test                 # vitest 单元测试
npm run e2e              # Playwright e2e 测试
npm run lint             # ESLint
npm run format           # Prettier 格式化
```

### 文件路径约定（项目级，跟 AGENTS.md 一致）

| 路径 | 用途 |
|---|---|
| `docs/` | 需求 / PRD / 决策记录 / 阶段 takeaway |
| `specs/` | spec-first 工作流的 design doc |
| `plans/` | implementation plans（implementation 子任务清单） |
| `src/` | TypeScript 源码 |
| `tests/` | vitest 单元测试 |
| `e2e/` | Playwright e2e 测试 |
| `.github/workflows/` | GitHub Actions CI/CD |

### 当前 milestone 进度

- [x] **M1** 项目骨架 + Hello World deploy（2026-05-07）
- [ ] **M2** 数据 schema + SPARQL 阶段 A（plan 待写）
- [ ] **M3** 数据采集阶段 B + C（plan 待写）
- [ ] **M4** 关系图主视图 + 共享元素（plan 待写）
- [ ] **M5** 地理图画中画副视图（plan 待写）
- [ ] **M6** UI/UX 优化 + 验证 + ship（plan 待写）

详见 [`specs/2026-05-07-marx-star-map-design.md`](specs/2026-05-07-marx-star-map-design.md)
