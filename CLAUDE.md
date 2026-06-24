# booster-plugin-template

GitHub **template repository** for external `steambooster` plugin
authors. Cloned via `gh repo create --template`, this is a working
hello-world plugin: one header button in Steam, ready `bun build` to
IIFE bundle, ready `bun test` under happy-dom. Edit, rename, ship.

> This template is **self-contained** for the boilerplate stage — you
> don't need any other repo checked out to build, test, and ship. Global
> conventions (string handling, security primitives, error handling) are
> maintained in the project's internal documentation; the framework API
> you actually call lives in the public
> [`@steambalance/booster-framework`](https://github.com/STEAMBALANCE/booster-framework)
> docs. Once you need real API details, follow the docs pointers below.

## What this repo is

A starter, not a library. Once you `gh repo create -t
STEAMBALANCE/booster-plugin-template my-plugin --clone`, you own a new
repo with this scaffold. Customise `src/index.ts`, rename the plugin
id, declare your capabilities, run `bun test`, run `bun run build`,
submit the bundle URL through the portal-approval form. From then on
your new repo lives outside the `STEAMBALANCE` org.

## Framework dependency

`package.json` declares `@steambalance/booster-framework`. `bun install` pulls it
from the package registry; no manual framework checkout is needed:

```pwsh
gh repo create my-plugin --template STEAMBALANCE/booster-plugin-template --clone --private
cd my-plugin
bun install
```

## Repo layout

```
booster-plugin-template/
├── src/
│   └── index.ts        # register({ id, capabilities, init, ... })
├── tests/
│   └── index.test.ts   # happy-dom bun test
├── build.ts            # bun build src/index.ts → out/<id>-<ver>.js
├── package.json        # rename "name" + bump "version" before first build
├── tsconfig.json
├── CLAUDE.md           # (this file)
└── README.md           # quick-start cheatsheet
```

## Conventions (carry-over from the project)

**Commit messages.** Conventional Commits / git-flow style (global rule
for all 4 repos; canonical in the project's `booster-injector/CLAUDE.md`).
Use a type prefix (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`,
`test:`, `build:`, `ci:`, `perf:`, …) with an optional scope, e.g.
`feat(popup): …`. Subject in lowercase — don't capitalize the first word;
capitals only where the language demands them (proper nouns, acronyms).
Keep it laconic and clear, not a wall of text; English only. A body is
optional and brief — add one only when the *why* isn't obvious from the
subject.

**Plugin id.** Lower-case latin letters + digits + dashes, from 2 chars,
no leading digit and no leading/trailing dash (regex
`^[a-z][a-z0-9]([a-z0-9-]{1,38}[a-z0-9])?$`). **The `booster-` prefix is
reserved** for the org's internal plugins (`booster-checkout`,
`booster-addfunds` — see `../booster-plugins/`). Pick something like
`balance-watcher`, `tg-notify`. `build.ts` strips the
`booster-plugin-` portion from `package.json::name` to derive the bundle
suffix.

**Capability minimisation.** Request only what you need.
See `../booster-framework/docs/capabilities.md`.

**Strings.** The template stays minimal and ships no `strings/`
directory: its two Russian literals (`displayName` "Мой плагин" and the
button label "Привет") sit behind inline `// strings-allow-cyrillic`
pragmas. As soon as you have real user-visible copy, drop the pragmas,
add `strings/ru.json`, wire a `gen-strings.ts`, and call via the
generated `LL` accessor — the project's `no-hardcoded-ru` guard rejects
un-pragma'd Cyrillic literals in committed sources.

## Build / dev / test

```pwsh
bun install                       # install deps (pulls @steambalance/booster-framework)
bun test                          # happy-dom bun test
bun run build                     # dev IIFE → out/<id>-<ver>.js
bun --watch run build             # auto-rebuild on src/ change
SB_PRODUCTION=1 bun run build     # production-style build (minified, external sourcemap)
```

To load your bundle into a live Steam instance, obtain the dev build
from your operator / the official portal and pass `--dev-plugin`:

```pwsh
# place steambooster-dev.exe in the current directory, then:
.\steambooster-dev.exe --dev-plugin=.\out\my-plugin-0.0.1.js
```

(`steambooster-dev.exe` launches Steam with `-cef-enable-debugging`
itself — no manual Steam step needed.)

## First-release checklist

- [ ] `package.json::name` is unique, no `booster-` prefix.
- [ ] `src/index.ts::register({ id })` matches `package.json::name`
      minus the `booster-plugin-` prefix.
- [ ] `displayName` is human-readable.
- [ ] `capabilities` list is minimal.
- [ ] `bun test` green.
- [ ] `bun run build` clean.
- [ ] Verified locally via `--dev-plugin=...` against real Steam.
- [ ] Bundle URL submitted through the portal-approval form (see
      `../booster-plugins/README.md`).

## See also

- `../booster-framework/docs/getting-started.md` — full walkthrough,
  ~30 min from `gh repo create` to a live button in Steam.
- `../booster-framework/docs/plugin-contract.md` — `register()`,
  `PluginManifest`, `PluginContext`, lifecycle.
- `../booster-framework/docs/capabilities.md` — full capability matrix.
- `../booster-framework/docs/testing.md` — `@steambalance/booster-framework/testing`,
  `createTestPluginContext`.
- `../booster-framework/docs/troubleshooting.md` — apiVersion mismatch,
  capability denial, hot-reload, port conflicts.
- Project-wide conventions (strings, URLs, error handling, security
  primitives) are documented internally and apply across the framework
  and plugin ecosystem; you don't need them to ship a template-based plugin.
- `README.md` — the README this template ships with (your fork keeps
  it as a starting point for your own README).
