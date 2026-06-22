// tests/build-watch.test.ts
import { test, expect, afterAll } from 'bun:test';
import { spawn } from 'bun';
import { writeFileSync, rmSync, statSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const TRIGGER_FILE = resolve(ROOT, 'src/__watch_test_trigger__.ts');

afterAll(() => {
  try { rmSync(TRIGGER_FILE); } catch {}
});

const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const id: string = (pkg.name as string).replace(/^booster-plugin-/, '');
const outFile = resolve(ROOT, `out/${id}-${pkg.version}.js`);

/**
 * Wait for outFile's mtime to be newer than `since` AND stable
 * (unchanged for `stabilityMs`). Returns the stable mtime or throws on timeout.
 */
async function waitForMtimeNewerAndStable(
  since: number,
  stabilityMs: number,
  timeoutMs: number,
): Promise<number> {
  const deadline = Date.now() + timeoutMs;
  let lastMtime = 0;
  let stableAt = 0;

  while (Date.now() < deadline) {
    try {
      const mt = statSync(outFile).mtimeMs;
      if (mt > since) {
        if (mt !== lastMtime) {
          lastMtime = mt;
          stableAt = Date.now();
        } else if (Date.now() - stableAt >= stabilityMs) {
          return lastMtime;
        }
      }
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  if (lastMtime > since) return lastMtime; // best-effort
  throw new Error(`mtime never updated beyond ${since} within ${timeoutMs}ms`);
}

test('build --watch rebuilds within 3s after src edit', async () => {
  try { rmSync(TRIGGER_FILE); } catch {}

  const testStartMs = Date.now();

  const child = spawn({
    cmd: ['bun', 'run', 'build.ts', '--watch'],
    cwd: ROOT,
    stdout: 'ignore',
    stderr: 'ignore',
  });

  // Wait for initial build: mtime > testStartMs AND stable for 500ms (up to 8s)
  const initialMtime = await waitForMtimeNewerAndStable(testStartMs, 500, 8000);

  // Verify process is still alive (--watch keeps it running)
  expect(child.exitCode).toBeNull();

  // Trigger watcher by writing a .ts file in src/
  writeFileSync(TRIGGER_FILE, `// watch trigger\n`);

  // Wait for rebuild — allow 3s (debounce 100ms + fast build + margin)
  const editDeadline = Date.now() + 3000;
  let rebuilt = false;
  while (Date.now() < editDeadline) {
    try {
      const mt = statSync(outFile).mtimeMs;
      if (mt > initialMtime) { rebuilt = true; break; }
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }

  try { rmSync(TRIGGER_FILE); } catch {}
  expect(rebuilt).toBe(true);

  child.kill();
  await child.exited;
}, 20000);
