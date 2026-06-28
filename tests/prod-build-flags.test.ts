import { test, expect, beforeAll, afterAll } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const OUT_DIR = join(ROOT, 'out');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
  name: string;
  version: string;
};
const id = pkg.name.replace(/^booster-plugin-/, '');
const BUNDLE = join(OUT_DIR, `${id}-${pkg.version}.js`);
const MAP_FILE = `${BUNDLE}.map`;

beforeAll(() => {
  if (existsSync(MAP_FILE)) rmSync(MAP_FILE);
});

afterAll(() => {
  if (existsSync(MAP_FILE)) rmSync(MAP_FILE);
});

test('production build does not emit a sourcemap file', () => {
  if (existsSync(MAP_FILE)) rmSync(MAP_FILE);
  const r = spawnSync('bun', ['run', 'build.ts'], {
    cwd: ROOT,
    env: { ...process.env, SB_PRODUCTION: '1' },
    stdio: 'pipe',
  });

  expect(r.status).toBe(0);
  expect(existsSync(BUNDLE)).toBe(true);
  expect(existsSync(MAP_FILE)).toBe(false);
});
