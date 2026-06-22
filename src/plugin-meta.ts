import type { PluginMeta } from '@steambalance/booster-framework/testing';

// ВАЖНО: при cloning template — обнови ВСЕ поля под свой плагин,
// а также `package.json::name` соответствующе. Build.ts при запуске
// сравнивает pluginMeta.id с derived из package.json и упадёт с
// сообщением если они расходятся — это safety net чтобы случайно не
// отгрузить плагин под id template'а.
//
// id не должен начинаться с `booster-` (зарезервировано за official
// плагинами).
export const pluginMeta: PluginMeta = {
  id: 'my-plugin',
  version: '0.0.1',
  apiVersion: 1,
  contextKinds: ['main'],
  urlPatterns: [],
  grantedCapabilities: ['ui'],
};
