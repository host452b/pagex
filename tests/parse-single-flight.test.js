import test from 'node:test';
import assert from 'node:assert/strict';

import { createParseSingleFlight } from '../src/shared/parse-single-flight.js';

test('createParseSingleFlight rejects concurrent starts until the active request finishes', () => {
  const gate = createParseSingleFlight();

  const first = gate.start({
    requestId: 'req-1',
    tabId: 101,
  });

  assert.equal(first.ok, true);
  assert.equal(gate.getActive().requestId, 'req-1');

  const second = gate.start({
    requestId: 'req-2',
    tabId: 202,
  });

  assert.equal(second.ok, false);
  assert.equal(second.activeRequest.requestId, 'req-1');

  gate.finish('req-1');

  const third = gate.start({
    requestId: 'req-3',
    tabId: 303,
  });

  assert.equal(third.ok, true);
  assert.equal(gate.getActive().requestId, 'req-3');
});

test('finish with mismatched requestId is a no-op', () => {
  const gate = createParseSingleFlight();

  gate.start({ requestId: 'req-A', tabId: 1 });
  gate.finish('req-WRONG');

  assert.equal(gate.getActive().requestId, 'req-A');
});

test('finish when nothing is active is a no-op', () => {
  const gate = createParseSingleFlight();

  gate.finish('req-none');

  assert.equal(gate.getActive(), null);
});

test('getActive returns null when no parse is active', () => {
  const gate = createParseSingleFlight();

  assert.equal(gate.getActive(), null);
});

test('independent instances do not share state', () => {
  const gateA = createParseSingleFlight();
  const gateB = createParseSingleFlight();

  gateA.start({ requestId: 'a1', tabId: 10 });

  const bStart = gateB.start({ requestId: 'b1', tabId: 20 });

  assert.equal(bStart.ok, true);
  assert.equal(gateA.getActive().requestId, 'a1');
  assert.equal(gateB.getActive().requestId, 'b1');
});
