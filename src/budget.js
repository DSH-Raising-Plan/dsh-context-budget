/**
 * Context budget — port of canyueY/context-budget.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const TIME_SYSTEM_RE = /^现在是.+点.+分$/;
export const MAX_TOKEN_ESTIMATE = 1 << 22;
const PER_MESSAGE_OVERHEAD = 4;

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.max(1, Math.min(Math.floor(String(text).length / 2), MAX_TOKEN_ESTIMATE));
}

function textOf(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((block) => {
      if (block && typeof block === 'object') return String(block.text || block.content || '');
      return String(block);
    }).join('');
  }
  return content == null ? '' : String(content);
}

export function estimateMessagesTokens(messages, { counter = null } = {}) {
  const count = counter || estimateTokens;
  let total = 0;
  for (const msg of messages) {
    const content = msg?.content ?? '';
    if (Array.isArray(content)) {
      for (const b of content) {
        total += count(typeof b === 'object' ? textOf(b) : String(b));
      }
    } else {
      total += count(textOf(content));
    }
    total += PER_MESSAGE_OVERHEAD;
  }
  return total;
}

export function coerceMessages(messages) {
  const out = [];
  for (const m of messages || []) {
    if (!m || typeof m !== 'object') continue;
    let content = m.content;
    if (content == null) content = '';
    else if (typeof content !== 'string') content = String(content);
    out.push({ role: String(m.role || 'user'), content });
  }
  return out;
}

export function isTimeSystem(msg) {
  if (msg?.role !== 'system') return false;
  return TIME_SYSTEM_RE.test(String(msg.content || '').trim());
}

export function splitMessages(history) {
  const msgs = coerceMessages((history || []).filter((m) => m && typeof m === 'object'));
  const times = msgs.filter(isTimeSystem);
  const systems = msgs.filter((m) => m.role === 'system' && !isTimeSystem(m));
  const dialog = msgs.filter((m) => m.role !== 'system');
  return [systems, times.slice(-1), dialog];
}

export function budgetSettings(cfg = null) {
  const defaults = {
    max_history_turns: 50,
    max_context_tokens: 48000,
    max_aux_history_turns: 24,
    max_new_tokens: 2048,
    reply_max_tokens: 1024,
    weather_history_messages: 16,
  };
  const bounds = {
    max_history_turns: [4, 200],
    max_context_tokens: [2048, 128000],
    max_aux_history_turns: [4, 100],
    max_new_tokens: [256, 16384],
    reply_max_tokens: [128, 8192],
    weather_history_messages: [4, 64],
  };
  let block = {};
  if (cfg && typeof cfg === 'object') {
    if (cfg.chat && typeof cfg.chat === 'object') block = cfg.chat;
    else block = cfg;
  }
  const out = { ...defaults };
  for (const [name, def] of Object.entries(defaults)) {
    let val = Number.parseInt(block[name] ?? def, 10);
    if (!Number.isFinite(val)) val = def;
    const [lo, hi] = bounds[name];
    out[name] = Math.max(lo, Math.min(val, hi));
  }
  return out;
}

function pairCount(messages) {
  return Math.floor(messages.length / 2);
}

export function trim(history, {
  settings = null,
  maxTurns = null,
  maxTokens = null,
  counter = null,
} = {}) {
  const st = settings || budgetSettings();
  const turnLimit = maxTurns == null ? st.max_history_turns : Math.max(0, Number(maxTurns));
  const tokenLimit = maxTokens == null ? st.max_context_tokens : Math.max(1, Number(maxTokens));

  let [systems, times, dialog] = splitMessages(history);
  const keep = Math.max(2, turnLimit * 2);
  if (dialog.length > keep) dialog = dialog.slice(-keep);

  while (pairCount(dialog) > 1) {
    const trial = [...systems, ...times, ...dialog];
    if (estimateMessagesTokens(trial, { counter }) <= tokenLimit) break;
    dialog = dialog.slice(2);
  }
  return [...systems, ...times, ...dialog];
}

export function trimAuxiliary(history, { settings = null, maxTurns = null } = {}) {
  const st = settings || budgetSettings();
  const limit = maxTurns == null ? st.max_aux_history_turns : Math.max(0, Number(maxTurns));
  const msgs = coerceMessages((history || []).filter((m) => m && typeof m === 'object'));
  const system = msgs.filter((m) => m.role === 'system' && !isTimeSystem(m)).slice(0, 1);
  let dialog = msgs.filter((m) => m.role !== 'system');
  if (limit > 0 && dialog.length > limit * 2) dialog = dialog.slice(-(limit * 2));
  return [...system, ...dialog];
}

export const trimConversationHistory = trim;
