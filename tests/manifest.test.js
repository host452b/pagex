import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

test('manifest requests broad site access only through optional host permissions', async () => {
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  const manifestSource = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestSource);

  const hostPermissions = [];
  const optionalHostPermissions = [];

  if (Array.isArray(manifest.optional_host_permissions)) {
    optionalHostPermissions.push(...manifest.optional_host_permissions);
  }

  assert.equal(hostPermissions.length, 0);
  assert.ok(
    optionalHostPermissions.includes('<all_urls>'),
    'expected optional_host_permissions to include <all_urls>',
  );
});

test('manifest declares extension icons for runtime and store compliance', async () => {
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  const manifestSource = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestSource);

  assert.deepEqual(manifest.icons, {
    16: 'assets/icons/pagex-16.png',
    32: 'assets/icons/pagex-32.png',
    48: 'assets/icons/pagex-48.png',
    128: 'assets/icons/pagex-128.png',
  });

  assert.deepEqual(manifest.action.default_icon, {
    16: 'assets/icons/pagex-16.png',
    32: 'assets/icons/pagex-32.png',
  });
});

test('manifest uses Manifest V3 and targets Chrome 116+', async () => {
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.minimum_chrome_version, '116');
});

test('manifest declares all required permissions', async () => {
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  const required = [
    'activeTab',
    'cookies',
    'scripting',
    'storage',
    'tabs',
    'webNavigation',
  ];

  for (const perm of required) {
    assert.ok(
      manifest.permissions.includes(perm),
      `permissions should include "${perm}"`,
    );
  }
});

test('manifest configures background service worker as ES module', async () => {
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  assert.equal(manifest.background.service_worker, 'background.js');
  assert.equal(manifest.background.type, 'module');
});

test('manifest points popup action to popup.html', async () => {
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  assert.equal(manifest.action.default_popup, 'popup.html');
});
