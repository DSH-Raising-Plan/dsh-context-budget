export const TRIM_TOOL = 'trim_context';
export const ESTIMATE_TOOL = 'estimate_context_tokens';

export function trimToolSpec() {
  return {
    name: TRIM_TOOL,
    description: [
      'Trim a chat message list to fit a token budget.',
      'Keeps permanent system messages, keeps the newest time-system line, drops oldest user/assistant pairs.',
      'Never drops the last turn. Returns the trimmed messages plus before/after token estimates.',
    ].join('\n'),
    parameters: {
      messages: {
        type: 'json',
        required: true,
        description: 'Array of {role, content} messages.',
      },
      max_turns: {
        type: 'integer',
        description: 'Max dialog turns to keep (default from settings, typically 50).',
      },
      max_tokens: {
        type: 'integer',
        description: 'Token budget (default ~48000). Uses a conservative char/2 estimator unless a host counter is wired.',
      },
      mode: {
        type: 'string',
        enum: ['main', 'aux'],
        description: 'main = full trim; aux = keep first system only (for sidecar classifiers). Default main.',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          messages: { type: 'json' },
          tokens_before: { type: 'integer' },
          tokens_after: { type: 'integer' },
          dropped: { type: 'integer' },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: `trimmed ${value.dropped} msgs · ${value.tokens_before} → ${value.tokens_after} tokens\n${JSON.stringify(value.messages, null, 2)}`,
      }],
    },
  };
}

export function estimateToolSpec() {
  return {
    name: ESTIMATE_TOOL,
    description: 'Estimate token count for a message list (char/2 heuristic, no tokenizer dependency).',
    parameters: {
      messages: {
        type: 'json',
        required: true,
        description: 'Array of {role, content} messages.',
      },
    },
    output: {
      schema: {
        type: 'object',
        properties: {
          tokens: { type: 'integer' },
          messages: { type: 'integer' },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `~${value.tokens} tokens across ${value.messages} messages` }],
    },
  };
}
