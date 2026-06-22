import { test, expect } from 'bun:test';
import {
  createTestPluginContext,
  ContextKind,
  Capability,
} from '@steambalance/booster-framework/testing';

test('plugin registers header button on init', async () => {
  // Set up a capture stub for sb.plugins.register:
  let captured: { id: string; init: (ctx: never) => unknown } | null = null;
  (globalThis as { sb?: { plugins: { register: (m: never) => void } } }).sb = {
    plugins: { register: (m: { id: string; init: (ctx: never) => unknown }) => { captured = m; } },
  };

  // Importing triggers sb.plugins.register():
  await import('../src/index');

  expect(captured).not.toBeNull();
  expect(captured!.id).toBe('my-plugin');

  // Now run the init with a test context:
  const { ctx, inspect, cleanup } = createTestPluginContext({
    pluginId: 'my-plugin',
    contextKind: ContextKind.Main,
    granted: [Capability.Ui],
  });

  captured!.init(ctx as never);

  expect(inspect.domMutations.length).toBeGreaterThan(0);
  expect(inspect.domMutations[0].kind).toBe('headerButton');

  cleanup();
});
