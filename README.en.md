# dsh-context-budget

Trim LLM chat history to a **token budget** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): keep the persona, drop oldest turns in pairs.

> Community plugin. Not affiliated with DeepSeek.  
> Port of [`canyueY/context-budget`](https://github.com/canyueY/context-budget).  
> Chinese docs: [README.md](./README.md)

## Install

```bash
dsh plugin --profile web add github:DSH-Raising-Plan/dsh-context-budget#plugin/dsh
```

## Tools

| Tool | Purpose |
| --- | --- |
| `trim_context` | Trim `{role,content}[]` to budget |
| `estimate_context_tokens` | Rough token estimate (char/2) |

## License

AGPL-3.0-or-later
