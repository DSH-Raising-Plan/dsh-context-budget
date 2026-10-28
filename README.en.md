# dsh-context-budget

Trim LLM chat history to a **token budget** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): **keep the persona, drop the oldest user/assistant pairs**.

> Community plugin. Not affiliated with DeepSeek.  
> Port of [`canyueY/context-budget`](https://github.com/canyueY/context-budget).  
> Chinese docs: [README.md](./README.md)

## Why

The context window is a hard limit. Character-based truncation cuts the system persona in half or leaves a dangling question, and the next turn loses the thread. This plugin trims by **turn pairs**:

- Always keeps system prompts / persona;
- Drops from the oldest `user` + `assistant` pair;
- **Never drops the last message** — the current question must survive;
- Keeps the newest “current time” system line.

Token counting is a conservative `characters / 2` heuristic with no tokenizer dependency; pass a custom `counter` when precise counts matter.

## Features

- System persona and time line are preserved first;
- Pairwise removal, so no half Q/A remains;
- `main` / `aux` modes: `aux` keeps only the first system message for side classifiers;
- Configurable turn and token budgets, clamped to safe ranges;
- Exposes `trim` / `trimAuxiliary` / `estimateMessagesTokens` on `ctx.contextBudget` for reuse.

## Install

```bash
dsh plugin --profile web add github:DSH-Raising-Plan/dsh-context-budget#plugin/dsh
```

## Tools

| Tool | Arguments | Purpose |
| --- | --- | --- |
| `trim_context` | `messages` (required), `max_turns`, `max_tokens`, `mode` | Trim `{role, content}[]` to budget and return before/after token estimates |
| `estimate_context_tokens` | `messages` (required) | Rough token estimate (`chars / 2`) |

`mode=main` is the full trim; `mode=aux` keeps only the first system message (for side classifiers).

## Configuration

Reads `ctx.config['dsh-context-budget']`, falling back to `ctx.config.chat`:

| Key | Default | Range | Meaning |
| --- | --- | --- | --- |
| `max_history_turns` | `50` | 4–200 | Max dialog turns to keep |
| `max_context_tokens` | `48000` | 2048–128000 | Context token budget |
| `max_aux_history_turns` | `24` | 4–100 | Turns kept in `aux` mode |
| `max_new_tokens` | `2048` | 256–16384 | Generation budget (advisory) |
| `reply_max_tokens` | `1024` | 128–8192 | Reply budget (advisory) |
| `weather_history_messages` | `16` | 4–64 | Messages kept for short weather sessions |

## Examples

```text
trim_context {"messages":[{"role":"system","content":"You are Murasame"}, ...], "max_tokens": 8000, "max_turns": 20}
```

Returns:

```json
{
  "messages": [...],
  "tokens_before": 12000,
  "tokens_after": 7600,
  "dropped": 8
}
```

## Limitations

- `chars / 2` is a heuristic; Chinese, code and JSON deviate in different directions;
- Tool-call messages and image blocks are not handled;
- It drops old turns instead of summarizing or compressing them;
- The last message is always kept, so a single oversized message can still exceed the budget.

## Development

```bash
npm test
npm run check
```

Requires `@deepseek-ai/dsh-tools` (or `DSH_TOOLS_PATH`).

## License

AGPL-3.0-or-later
