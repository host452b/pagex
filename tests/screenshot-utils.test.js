import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateScrollPositions } from '../src/shared/screenshot-utils.js';

test('single capture when page fits in viewport', () => {
  assert.deepEqual(calculateScrollPositions(800, 1000), [0]);
});

test('single capture when page equals viewport', () => {
  assert.deepEqual(calculateScrollPositions(1000, 1000), [0]);
});

test('two captures for page slightly taller than viewport', () => {
  const positions = calculateScrollPositions(1100, 1000);

  assert.equal(positions.length, 2);
  assert.equal(positions[0], 0);
  assert.equal(positions[1], 100);
});

test('exact multiple of viewport needs no overlap', () => {
  const positions = calculateScrollPositions(3000, 1000);

  assert.deepEqual(positions, [0, 1000, 2000]);
});

test('non-exact multiple includes final overlap position', () => {
  const positions = calculateScrollPositions(2500, 1000);

  assert.deepEqual(positions, [0, 1000, 1500]);
});

test('last position always equals scrollHeight minus viewportHeight', () => {
  const scrollHeight = 4321;
  const viewportHeight = 900;
  const positions = calculateScrollPositions(scrollHeight, viewportHeight);

  assert.equal(positions[positions.length - 1], scrollHeight - viewportHeight);
});

test('positions are in ascending order', () => {
  const positions = calculateScrollPositions(5000, 700);

  for (let i = 1; i < positions.length; i++) {
    assert.ok(positions[i] > positions[i - 1], `position ${i} should be > position ${i - 1}`);
  }
});

test('first position is always zero', () => {
  assert.equal(calculateScrollPositions(5000, 700)[0], 0);
  assert.equal(calculateScrollPositions(100, 1000)[0], 0);
  assert.equal(calculateScrollPositions(1000, 1000)[0], 0);
});

test('handles zero or negative inputs gracefully', () => {
  assert.deepEqual(calculateScrollPositions(0, 1000), [0]);
  assert.deepEqual(calculateScrollPositions(1000, 0), [0]);
  assert.deepEqual(calculateScrollPositions(-1, 1000), [0]);
  assert.deepEqual(calculateScrollPositions(1000, -1), [0]);
});

test('covers the entire page height', () => {
  const scrollHeight = 3700;
  const viewportHeight = 1000;
  const positions = calculateScrollPositions(scrollHeight, viewportHeight);

  assert.equal(positions[0], 0, 'first capture starts at top');
  assert.equal(
    positions[positions.length - 1] + viewportHeight,
    scrollHeight,
    'last capture reaches the bottom',
  );
});

test('handles floating-point dimensions without crashing', () => {
  const positions = calculateScrollPositions(1500.7, 900.3);

  assert.ok(positions.length >= 1);
  assert.equal(positions[0], 0);
});

test('handles very large page height', () => {
  const positions = calculateScrollPositions(100000, 900);

  assert.equal(positions[0], 0);
  assert.equal(positions[positions.length - 1], 100000 - 900);
  assert.ok(positions.length > 100);
});

test('returns single position when scrollHeight is 1', () => {
  assert.deepEqual(calculateScrollPositions(1, 1000), [0]);
});
