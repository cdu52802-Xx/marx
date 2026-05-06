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
