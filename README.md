# dsh-context-budget

把 LLM 对话历史裁到 **token 预算**内：**保留人设，按「用户/助手」成对丢掉最旧轮次**。面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)。

> 社区插件，与 DeepSeek 官方无关。  
> 移植自 [`canyueY/context-budget`](https://github.com/canyueY/context-budget)。  
> English: [README.en.md](./README.en.md)

## 为什么需要它

上下文窗口是硬上限。常见的“按字符截断”会把系统人设切掉，或者留下半截问答，模型下一轮就接不上。这个插件按**对话轮次成对**裁剪：

- 永远保留系统提示 / 人设；
- 只从最旧的 `user` + `assistant` 对开始删；
- **最后一条消息永远不删**（当前问题必须留下）；
- 额外保留最近一条“现在是几点”的时间系统行。

token 估算用 `字符数 / 2` 的保守启发式，不依赖 tokenizer；需要精确计数时可以注入 `counter`。

## 特性

- 系统人设与时间行优先保留；
- 成对删除，避免出现“有问无答”的半截历史；
- `main` / `aux` 两种模式：`aux` 只保留首条 system，适合侧路分类器；
- 可配置轮数上限与 token 预算，输入会被夹到安全范围；
- 在 `ctx.contextBudget` 上暴露 `trim` / `trimAuxiliary` / `estimateMessagesTokens`，供其它插件复用。

## 安装

```bash
dsh plugin --profile web add github:DSH-Raising-Plan/dsh-context-budget#plugin/dsh
```

## 工具

| 工具 | 参数 | 作用 |
| --- | --- | --- |
| `trim_context` | `messages`（必填）、`max_turns`、`max_tokens`、`mode` | 把 `{role, content}[]` 裁到预算内，返回裁剪后的消息与前后 token 估算 |
| `estimate_context_tokens` | `messages`（必填） | 粗略估算 token（约 `字符数/2`） |

`mode=main` 是完整裁剪；`mode=aux` 只保留第一条 system（给侧路分类器用）。

## 配置

配置块读取 `ctx.config['dsh-context-budget']`，没有则读 `ctx.config.chat`：

| 键 | 默认 | 范围 | 含义 |
| --- | --- | --- | --- |
| `max_history_turns` | `50` | 4–200 | 最多保留多少轮对话 |
| `max_context_tokens` | `48000` | 2048–128000 | 上下文 token 预算 |
| `max_aux_history_turns` | `24` | 4–100 | `aux` 模式保留轮数 |
| `max_new_tokens` | `2048` | 256–16384 | 生成预算（供宿主参考） |
| `reply_max_tokens` | `1024` | 128–8192 | 回复预算（供宿主参考） |
| `weather_history_messages` | `16` | 4–64 | 天气类短会话保留条数 |

## 使用示例

```text
trim_context {"messages":[{"role":"system","content":"你是丛雨"}, ...], "max_tokens": 8000, "max_turns": 20}
```

返回：

```json
{
  "messages": [...],
  "tokens_before": 12000,
  "tokens_after": 7600,
  "dropped": 8
}
```

## 限制

- `字符数/2` 只是启发式，中文/代码/JSON 的误差方向不同；
- 不处理工具调用消息、图片块等非文本内容；
- 裁剪是“丢最旧”，不做摘要/压缩；
- 永远保留最后一条消息，所以单条超长消息仍可能超预算。

## 开发

```bash
npm test
npm run check
```

需要 `@deepseek-ai/dsh-tools`（或设置 `DSH_TOOLS_PATH`）。

## 许可

AGPL-3.0-or-later
