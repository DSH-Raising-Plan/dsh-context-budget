# dsh-context-budget

Trim LLM chat history to a **token budget** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): keep the persona, drop oldest turns in pairs.

> Community plugin. Not affiliated with DeepSeek.  
> Port of [`canyueY/context-budget`](https://github.com/canyueY/context-budget).

## Install

```bash
dsh plugin --profile web add github:canyueY/dsh-context-budget#plugin/dsh
```

## Tools

| Tool | Purpose |
| --- | --- |
| `trim_context` | Trim `{role,content}[]` to budget |
| `estimate_context_tokens` | Rough token estimate (char/2) |

Also sets `ctx.contextBudget` for peer plugins.

## License

AGPL-3.0-or-later
