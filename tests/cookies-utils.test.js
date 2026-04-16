import test from 'node:test';
import assert from 'node:assert/strict';

import { formatCookiesTxt } from '../src/shared/cookies-utils.js';

test('formats a basic cookie in Netscape cookies.txt format', () => {
  const cookies = [
    {
      domain: '.example.com',
      path: '/',
      secure: false,
      expirationDate: 1700000000,
      name: 'session',
      value: 'abc123',
    },
  ];

  const result = formatCookiesTxt(cookies);
  const lines = result.split('\n');
  const dataLine = lines.find((l) => l.startsWith('.example.com'));

  assert.ok(dataLine, 'should contain a cookie line');

  const fields = dataLine.split('\t');
  assert.equal(fields[0], '.example.com');
  assert.equal(fields[1], 'TRUE');
  assert.equal(fields[2], '/');
  assert.equal(fields[3], 'FALSE');
  assert.equal(fields[4], '1700000000');
  assert.equal(fields[5], 'session');
  assert.equal(fields[6], 'abc123');
});

test('sets isDomainWide to FALSE for non-dot domains', () => {
  const cookies = [
    {
      domain: 'exact.example.com',
      path: '/',
      secure: true,
      expirationDate: 1700000000,
      name: 'token',
      value: 'xyz',
    },
  ];

  const result = formatCookiesTxt(cookies);
  const dataLine = result.split('\n').find((l) => l.startsWith('exact'));
  const fields = dataLine.split('\t');

  assert.equal(fields[1], 'FALSE');
  assert.equal(fields[3], 'TRUE');
});

test('session cookies get expiry 0', () => {
  const cookies = [
    {
      domain: '.example.com',
      path: '/',
      secure: false,
      name: 'temp',
      value: 'val',
    },
  ];

  const result = formatCookiesTxt(cookies);
  const dataLine = result.split('\n').find((l) => l.startsWith('.example'));
  const fields = dataLine.split('\t');

  assert.equal(fields[4], '0');
});

test('includes Netscape header comment', () => {
  const result = formatCookiesTxt([]);

  assert.ok(result.includes('# Netscape HTTP Cookie File'));
});

test('includes privacy note in header', () => {
  const result = formatCookiesTxt([]);

  assert.ok(result.includes('stays on your device'));
});

test('formats multiple cookies', () => {
  const cookies = [
    {
      domain: '.a.com',
      path: '/',
      secure: false,
      expirationDate: 1000,
      name: 'n1',
      value: 'v1',
    },
    {
      domain: '.b.com',
      path: '/app',
      secure: true,
      expirationDate: 2000,
      name: 'n2',
      value: 'v2',
    },
  ];

  const result = formatCookiesTxt(cookies);
  const dataLines = result
    .split('\n')
    .filter((l) => l && !l.startsWith('#'));

  assert.equal(dataLines.length, 2);
  assert.ok(dataLines[0].includes('.a.com'));
  assert.ok(dataLines[1].includes('.b.com'));
});

test('empty cookies array produces only headers', () => {
  const result = formatCookiesTxt([]);
  const dataLines = result
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'));

  assert.equal(dataLines.length, 0);
});

test('handles fractional expirationDate by flooring', () => {
  const cookies = [
    {
      domain: '.example.com',
      path: '/',
      secure: false,
      expirationDate: 1700000000.789,
      name: 'frac',
      value: 'val',
    },
  ];

  const result = formatCookiesTxt(cookies);
  const dataLine = result.split('\n').find((l) => l.startsWith('.example'));
  const fields = dataLine.split('\t');

  assert.equal(fields[4], '1700000000');
});

test('defaults path to / when missing', () => {
  const cookies = [
    {
      domain: '.example.com',
      secure: false,
      expirationDate: 1000,
      name: 'np',
      value: 'vp',
    },
  ];

  const result = formatCookiesTxt(cookies);
  const dataLine = result.split('\n').find((l) => l.startsWith('.example'));
  const fields = dataLine.split('\t');

  assert.equal(fields[2], '/');
});

test('preserves special characters in cookie values', () => {
  const cookies = [
    {
      domain: '.example.com',
      path: '/',
      secure: false,
      expirationDate: 1000,
      name: 'data',
      value: 'hello=world&foo=bar%20baz',
    },
  ];

  const result = formatCookiesTxt(cookies);
  const dataLine = result.split('\n').find((l) => l.startsWith('.example'));
  const fields = dataLine.split('\t');

  assert.equal(fields[6], 'hello=world&foo=bar%20baz');
});
