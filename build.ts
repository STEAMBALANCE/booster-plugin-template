#!/usr/bin/env bun
import { build } from 'bun';
import { readFileSync, writeFileSync, watch } from 'node:fs';
import { resolve } from 'node:path';
import { validatePluginMeta } from '@steambalance/booster-framework/testing';
import { pluginMeta } from './src/plugin-meta';

// Validate plugin meta at startup before any build work.
const vr = validatePluginMeta(pluginMeta);
if (!vr.ok) {
  console.error('[build] plugin-meta invalid:', vr.error);
  process.exit(1);
}

// Cross-check pluginMeta.id with package.json::name. Template derives id
// from "booster-plugin-<id>" naming convention; if author updated only one of
// the two, build halts with a clear error.
const pkg = JSON.parse(readFileSync(resolve(import.meta.dir, 'package.json'), 'utf8'));
const expectedPkgName = `booster-plugin-${pluginMeta.id}`;
if (pkg.name !== expectedPkgName) {
  console.error(
    `[build] package.json::name (${pkg.name}) != "booster-plugin-${pluginMeta.id}". ` +
    `When cloning template, update both src/plugin-meta.ts AND package.json::name.`
  );
  process.exit(1);
}

const isProd = process.env['SB_PRODUCTION'] === '1';
const bundleName = `${pluginMeta.id}-${pluginMeta.version}.js`;
const sidecarName = `${pluginMeta.id}-${pluginMeta.version}.meta.json`;

async function buildOnce(): Promise<void> {
  const result = await build({
    entrypoints: ['src/index.ts'],
    outdir: resolve(import.meta.dir, 'out'),
    naming: bundleName,
    format: 'iife',
    target: 'browser',
    minify: isProd,
    sourcemap: isProd ? 'external' : 'inline',
    define: {
      __SB_PLUGIN_VERSION__: JSON.stringify(pluginMeta.version),
      __SB_PRODUCTION__: JSON.stringify(isProd),
    },
  });

  if (!result.success) {
    for (const m of result.logs) console.error(m);
    throw new Error('build failed');
  }

  writeFileSync(
    resolve(import.meta.dir, 'out', sidecarName),
    JSON.stringify(pluginMeta, null, 2) + '\n'
  );

  console.log(`built: out/${bundleName} + ${sidecarName}${isProd ? ' [prod]' : ' [dev]'}`);
}

const WATCH_DEBOUNCE_MS = 100;
const SRC_DIR = resolve(import.meta.dir, 'src');

async function watchAndRebuild(): Promise<void> {
  console.log(`[build:watch] watching ${SRC_DIR}/**`);
  let inFlight = false;
  let pending = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function fire(): void {
    if (inFlight) { pending = true; return; }
    inFlight = true;
    void buildOnce()
      .catch((e) => { console.error('[build:watch] build failed:', e); })
      .finally(() => {
        inFlight = false;
        if (pending) { pending = false; fire(); }
      });
  }

  const w = watch(SRC_DIR, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    // Ignore generated outputs to avoid rebuild loops.
    if (filename.startsWith('generated' + (process.platform === 'win32' ? '\\' : '/'))) return;
    // Trigger on .ts/.svelte/.css/.json edits only.
    if (!/\.(ts|svelte|css|json)$/.test(filename)) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fire, WATCH_DEBOUNCE_MS);
  });

  // Keep process alive in watch mode until Ctrl+C / SIGTERM.
  await new Promise<void>((resolve) => {
    const stop = (): void => {
      if (debounceTimer) clearTimeout(debounceTimer);
      w.close();
      resolve();
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
  });
}

async function main(): Promise<void> {
  const watchMode = process.argv.includes('--watch');
  await buildOnce();
  if (!watchMode) return;
  await watchAndRebuild();
}

if (import.meta.main) await main();
