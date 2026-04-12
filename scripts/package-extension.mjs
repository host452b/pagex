import { packageExtension } from '../src/shared/package-extension.js';

try {
  const archivePath = await packageExtension(process.cwd());
  console.log(`Created Chrome upload archive: ${archivePath}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to package extension: ${message}`);
  process.exitCode = 1;
}
