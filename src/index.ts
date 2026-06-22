import {
  ContextKind,
  Capability,
  type PluginContext,
} from '@steambalance/booster-framework';
import { pluginMeta } from './plugin-meta';

declare const sb: {
  plugins: { register: (m: unknown) => void };
};

function ck(k: string): ContextKind {
  switch (k) {
    case 'main': return ContextKind.Main;
    case 'shared': return ContextKind.Shared;
    case 'tabbedBrowser': return ContextKind.TabbedBrowser;
    case 'web': return ContextKind.Web;
    default: throw new Error(`unknown contextKind: ${k}`);
  }
}

function cap(c: string): Capability {
  switch (c) {
    case 'ui': return Capability.Ui;
    case 'steam': return Capability.Steam;
    case 'configs': return Capability.Configs;
    case 'bus': return Capability.Bus;
    case 'pages': return Capability.Pages;
    default: throw new Error(`unknown capability: ${c}`);
  }
}

sb.plugins.register({
  ...pluginMeta,
  displayName: 'Мой плагин', // strings-allow-cyrillic
  description: 'Hello-world plugin from booster-plugin-template.',
  contextKinds: pluginMeta.contextKinds.map(ck),
  capabilities: pluginMeta.grantedCapabilities.map(cap),
  init(ctx: PluginContext): () => void {
    ctx.log.info('hello from my-plugin');

    const button = ctx.sb.ui.addHeaderButton({
      id: 'my-plugin-btn',
      label: 'Привет', // strings-allow-cyrillic
      onClick: () => {
        ctx.log.info('button clicked');
      },
    });

    return () => {
      button.remove();
      ctx.log.info('my-plugin cleanup');
    };
  },
});
