import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PAGEX_STATE_KEY,
  PAGEX_MESSAGE_TYPES,
  PAGEX_STAGE_LABELS,
  PAGEX_PARSE_OPTIONS,
} from '../src/shared/constants.js';

test('PAGEX_STATE_KEY is a non-empty string', () => {
  assert.equal(typeof PAGEX_STATE_KEY, 'string');
  assert.ok(PAGEX_STATE_KEY.length > 0);
  assert.equal(PAGEX_STATE_KEY, 'pagex.parseState');
});

test('PAGEX_MESSAGE_TYPES contains all required message types', () => {
  assert.equal(PAGEX_MESSAGE_TYPES.START_PARSE, 'pagex/start-parse');
  assert.equal(PAGEX_MESSAGE_TYPES.STOP_PARSE, 'pagex/stop-parse');
});

test('PAGEX_STAGE_LABELS contains all pipeline stages', () => {
  const expectedKeys = [
    'PREPARING',
    'INJECTING',
    'COLLECTING',
    'INSPECTING',
    'FINALIZING',
  ];

  for (const key of expectedKeys) {
    assert.ok(
      typeof PAGEX_STAGE_LABELS[key] === 'string' &&
        PAGEX_STAGE_LABELS[key].length > 0,
      `PAGEX_STAGE_LABELS.${key} should be a non-empty string`,
    );
  }
});

test('PAGEX_PARSE_OPTIONS is frozen and contains all required numeric fields', () => {
  assert.ok(Object.isFrozen(PAGEX_PARSE_OPTIONS));

  const requiredFields = [
    'maxExpandRounds',
    'maxClicksPerRound',
    'maxTotalClicks',
    'enableAutoScroll',
    'autoScrollPasses',
    'clickDelayMs',
    'settleDelayMs',
    'scrollDelayMs',
    'maxTextLength',
    'maxAttributeValueLength',
    'maxElements',
    'maxResultBytes',
  ];

  for (const field of requiredFields) {
    assert.ok(
      field in PAGEX_PARSE_OPTIONS,
      `PAGEX_PARSE_OPTIONS should contain ${field}`,
    );
  }
});

test('PAGEX_PARSE_OPTIONS cannot be modified at runtime', () => {
  assert.throws(() => {
    PAGEX_PARSE_OPTIONS.maxElements = 9999;
  }, TypeError);
});
