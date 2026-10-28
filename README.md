# dsh-context-budget

把 LLM 对话历史裁到 **token 预算**内：**保留人设，按「用户/助手」成对丢掉最旧轮次**。面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)。

> 社区插件，与 DeepSeek 官方无关。  
> 移植自 [`canyueY/context-budget`](https://github.com/canyueY/context-budget)。  
> 英文简版：[README.en.md](./README.en.md)

## 安装

```bash
dsh plugin --profile web add github:DSH-Raising-Plan/dsh-context-budget#plugin/dsh
```

## 工具

| 工具 | 作用 |
| --- | --- |
| `trim_context` | 将 `{role,content}[]` 裁到预算内 |
| `estimate_context_tokens` | 粗略估算 token（约 `字符数/2`） |

插件还会在 `ctx.contextBudget` 上挂裁剪能力，供其它插件复用。

## 行为说明

- 优先保留系统人设 / 长系统提示
- 超预算时从最早的对话轮次成对删除（避免半截对话）
- 估算为启发式，不替代真实 tokenizer

## 开发

```bash
npm test
npm run check
```

需要 `@deepseek-ai/dsh-tools`（或设置 `DSH_TOOLS_PATH`）。

## 许可

AGPL-3.0-or-later
