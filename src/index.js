/**
 * dsh-context-budget — DeepSeek Harness plugin entry.
 * Port of https://github.com/canyueY/context-budget
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { pathToFileURL } from 'node:url';
import {
  budgetSettings,
  coerceMessages,
  estimateMessagesTokens,
  trim,
  trimAuxiliary,
} from './budget.js';
import { estimateToolSpec, trimToolSpec } from './tool-spec.js';

export const name = 'dsh-context-budget';
export const inject = ['tools'];

export {
  budgetSettings,
  trim,
  trimAuxiliary,
  estimateTokens,
  estimateMessagesTokens,
} from './budget.js';

async function loadDefineTool() {
  try {
    const mod = await import('@deepseek-ai/dsh-tools');
    if (mod?.defineTool) return mod.defineTool;
  } catch { /* fall through */ }
  const override = process.env.DSH_TOOLS_PATH;
  if (override) {
    const mod = await import(pathToFileURL(override).href);
    if (mod?.defineTool) return mod.defineTool;
  }
  throw new Error('cannot resolve @deepseek-ai/dsh-tools (set DSH_TOOLS_PATH for local dev)');
}

function loadSettings(ctx) {
  const block = ctx?.config?.['dsh-context-budget'] ?? ctx?.config?.chat ?? null;
  return budgetSettings(block);
}

export async function apply(ctx) {
  const defineTool = await loadDefineTool();
  const settings = loadSettings(ctx);
  ctx.contextBudget = { settings, trim, trimAuxiliary, estimateMessagesTokens };

  const trimTool = defineTool({
    ...trimToolSpec(),
    async execute(args) {
      const messages = Array.isArray(args?.messages) ? args.messages : [];
      const before = estimateMessagesTokens(coerceMessages(messages));
      const mode = args?.mode === 'aux' ? 'aux' : 'main';
      const trimmed = mode === 'aux'
        ? trimAuxiliary(messages, { settings, maxTurns: args.max_turns })
        : trim(messages, {
          settings,
          maxTurns: args.max_turns,
          maxTokens: args.max_tokens,
        });
      const after = estimateMessagesTokens(trimmed);
      return {
        messages: trimmed,
        tokens_before: before,
        tokens_after: after,
        dropped: Math.max(0, coerceMessages(messages).length - trimmed.length),
      };
    },
  });

  const estimateTool = defineTool({
    ...estimateToolSpec(),
    async execute(args) {
      const messages = coerceMessages(Array.isArray(args?.messages) ? args.messages : []);
      return {
        tokens: estimateMessagesTokens(messages),
        messages: messages.length,
      };
    },
  });

  const disposers = [
    ctx.tools.register(trimTool),
    ctx.tools.register(estimateTool),
  ];
  return () => {
    for (const dispose of disposers.reverse()) dispose?.();
    delete ctx.contextBudget;
  };
}
