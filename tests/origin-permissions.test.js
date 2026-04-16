import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildOriginPermissionPattern,
} from '../src/shared/origin-permissions.js';

test('buildOriginPermissionPattern returns requestable origin patterns for web urls', () => {
  assert.equal(
    buildOriginPermissionPattern('https://example.com/docs/page'),
    'https://example.com/*',
  );

  assert.equal(
    buildOriginPermissionPattern('http://localhost:3000/dashboard'),
    'http://localhost:3000/*',
  );
});

test('buildOriginPermissionPattern skips unsupported urls', () => {
  assert.equal(buildOriginPermissionPattern('chrome://extensions/'), '');
  assert.equal(buildOriginPermissionPattern('file:///Users/me/demo.html'), '');
  assert.equal(buildOriginPermissionPattern('not-a-url'), '');
});

test('buildOriginPermissionPattern returns empty for null, undefined, and empty string', () => {
  assert.equal(buildOriginPermissionPattern(null), '');
  assert.equal(buildOriginPermissionPattern(undefined), '');
  assert.equal(buildOriginPermissionPattern(''), '');
});

test('buildOriginPermissionPattern preserves port in the pattern', () => {
  assert.equal(
    buildOriginPermissionPattern('https://app.example.com:8443/page'),
    'https://app.example.com:8443/*',
  );
});
