import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { trim, estimateMessagesTokens, isTimeSystem } from '../src/budget.js';

describe('trim', () => {
  it('keeps system and last turn', () => {
    const history = [
      { role: 'system', content: 'you are murasame' },
      { role: 'system', content: '现在是14点30分' },
      { role: 'system', content: '现在是15点00分' },
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
      { role: 'user', content: 'bye' },
      { role: 'assistant', content: 'ok' },
    ];
    const out = trim(history, { maxTurns: 1, maxTokens: 100000 });
    assert.equal(out.filter((m) => m.role === 'system').length, 2);
    assert.equal(out.at(-2).content, 'bye');
    assert.ok(isTimeSystem(out.find((m) => m.content.startsWith('现在是'))));
    assert.equal(out.find((m) => m.content === '现在是14点30分'), undefined);
  });

  it('drops oldest pairs under token budget', () => {
    const history = [{ role: 'system', content: 'persona' }];
    for (let i = 0; i < 20; i++) {
      history.push({ role: 'user', content: 'x'.repeat(200) });
      history.push({ role: 'assistant', content: 'y'.repeat(200) });
    }
    const out = trim(history, { maxTurns: 50, maxTokens: 500 });
    assert.ok(estimateMessagesTokens(out) <= 500 || out.length <= 3);
    assert.equal(out[0].role, 'system');
  });
});
