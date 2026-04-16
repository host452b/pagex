import test from 'node:test';
import assert from 'node:assert/strict';

import {
  canCopyForSelectedTab,
  getResultMismatchMessage,
  isParseButtonDisabled,
} from '../src/shared/popup-state.js';

test('canCopyForSelectedTab only allows copying the currently parsed tab result', () => {
  const parseState = {
    canCopy: true,
    selectedTabId: 21,
    result: { frames: [] },
  };

  assert.equal(canCopyForSelectedTab(parseState, 21), true);
  assert.equal(canCopyForSelectedTab(parseState, 99), false);
});

test('getResultMismatchMessage warns when the selected tab differs from the stored result', () => {
  const parseState = {
    selectedTabId: 21,
  };

  assert.equal(getResultMismatchMessage(parseState, 21), '');
  assert.match(
    getResultMismatchMessage(parseState, 99),
    /Selection changed/,
  );
});

test('isParseButtonDisabled respects local starting state and background running state', () => {
  assert.equal(
    isParseButtonDisabled({
      hasTabs: true,
      isStartingParse: true,
      parseState: null,
    }),
    true,
  );

  assert.equal(
    isParseButtonDisabled({
      hasTabs: true,
      isStartingParse: false,
      parseState: {
        status: 'running',
      },
    }),
    true,
  );

  assert.equal(
    isParseButtonDisabled({
      hasTabs: true,
      isStartingParse: false,
      parseState: {
        status: 'completed',
      },
    }),
    false,
  );
});

test('canCopyForSelectedTab returns false when parseState is null or missing fields', () => {
  assert.equal(canCopyForSelectedTab(null, 1), false);
  assert.equal(canCopyForSelectedTab(undefined, 1), false);
  assert.equal(
    canCopyForSelectedTab({ canCopy: true, selectedTabId: 1, result: null }, 1),
    false,
  );
  assert.equal(
    canCopyForSelectedTab({ canCopy: false, selectedTabId: 1, result: {} }, 1),
    false,
  );
});

test('canCopyForSelectedTab returns false for invalid selectedTabId', () => {
  const parseState = { canCopy: true, selectedTabId: 21, result: {} };

  assert.equal(canCopyForSelectedTab(parseState, 0), false);
  assert.equal(canCopyForSelectedTab(parseState, -1), false);
  assert.equal(canCopyForSelectedTab(parseState, null), false);
  assert.equal(canCopyForSelectedTab(parseState, undefined), false);
});

test('isParseButtonDisabled returns true when no tabs are available', () => {
  assert.equal(
    isParseButtonDisabled({
      hasTabs: false,
      isStartingParse: false,
      parseState: null,
    }),
    true,
  );
});

test('isParseButtonDisabled allows parsing when idle with tabs', () => {
  assert.equal(
    isParseButtonDisabled({
      hasTabs: true,
      isStartingParse: false,
      parseState: null,
    }),
    false,
  );
});

test('getResultMismatchMessage returns empty for null or invalid inputs', () => {
  assert.equal(getResultMismatchMessage(null, 1), '');
  assert.equal(getResultMismatchMessage({ selectedTabId: 21 }, 0), '');
  assert.equal(getResultMismatchMessage({ selectedTabId: 21 }, -1), '');
  assert.equal(getResultMismatchMessage({}, 1), '');
});
