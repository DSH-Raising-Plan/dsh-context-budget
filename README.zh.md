# dsh-context-budget · 中文说明

把对话历史裁到 token 预算内：**保留人设，按对丢掉最旧轮次**。

> 社区插件。移植自 [`canyueY/context-budget`](https://github.com/canyueY/context-budget)。

## 安装

```bash
dsh plugin --profile web add github:canyueY/dsh-context-budget#plugin/dsh
```

## 工具

| 工具 | 作用 |
| --- | --- |
| `trim_context` | 按预算裁剪消息列表 |
| `estimate_context_tokens` | 粗略估算 token |

## 许可

AGPL-3.0-or-later
