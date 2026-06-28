# booster-plugin-template

GitHub template-репозиторий для авторов сторонних `steambooster`-плагинов.
Содержит минимальный hello-world плагин: одна кнопка в шапке Steam,
готовый `bun build` в IIFE-бандл и `bun test` под `happy-dom`.

Если вы дошли сюда впервые — см. полный walkthrough в
[`booster-framework/docs/getting-started.md`](https://github.com/STEAMBALANCE/booster-framework/blob/main/docs/getting-started.md).
Этот README — короткая «сейчас сделай вот это»-шпаргалка; за описанием
API'и обращайтесь в [`booster-framework/docs/`](https://github.com/STEAMBALANCE/booster-framework/tree/main/docs).

## Prerequisites

- Windows 11 (target — Steam CEF runtime).
- [`bun`](https://bun.com/) ≥ 1.3.
- GitHub CLI `gh` ≥ 2.50 (для `gh repo create --template`).
- Установленный Steam. `steambooster-dev.exe` сам запускает его с
  `-cef-enable-debugging` — править ярлык вручную не нужно.
- Dev-сборка `steambooster-dev.exe` — получите её у оператора / с
  официального портала.

## Зависимость от фреймворка

Шаблон зависит от `@steambalance/booster-framework` и уже объявляет эту зависимость
в `package.json`. Отдельно ставить фреймворк не нужно — он подтянется при
`bun install` (шаг ниже) из публичного GitHub-тега фреймворка.

## Установка зависимостей

Фреймворк `@steambalance/booster-framework` указан в `package.json` как
публичная GitHub-зависимость. Токен для GitHub Packages не нужен:

```pwsh
bun install
```

## Quick start

```pwsh
cd C:\work\plugins
gh repo create my-plugin --template STEAMBALANCE/booster-plugin-template --clone --private
cd my-plugin
bun install
bun run build      # → out/<id>-<ver>.js + .meta.json
```

Build produces TWO artefacts:
- `out/<id>-<ver>.js` — IIFE-бандл, который injector внедряет в Steam.
- `out/<id>-<ver>.meta.json` — sidecar с capabilities + contextKinds. Это механизм dev-режима: при локальной загрузке через `--dev-plugin` injector читает его до выполнения бандла, чтобы узнать запрошенные capabilities/contextKinds. В production те же метаданные берутся из записи плагина в подписанном манифесте — sidecar на CDN не публикуется.

Получите dev-сборку `steambooster-dev.exe` у оператора / с официального
портала и положите её в текущий каталог:

```pwsh
.\steambooster-dev.exe `
    --manifest-poll-interval=5 `
    --dev-plugin=.\out\my-plugin-0.0.1.js
```

`--dev-plugin=` принимает абсолютный путь к `.js`; injector сам
прочитает sibling `.meta.json`, валидирует, и спайсит в resolved manifest.
`--manifest-poll-interval=5` сокращает hot-reload cycle до ≤5 c.

`steambooster-dev.exe` сам поднимет Steam с `-cef-enable-debugging`; ваш
плагин зарегистрируется и кнопка «Привет» появится в шапке Steam в
течение 5–10 секунд.

Hot-reload: `bun run build --watch` в одном терминале, steambooster в
другом — каждый save → rebuild → injector подхватывает в ≤ 5 c.

## Что нужно отредактировать перед первой публикацией

Шаблонный плагин — рабочий hello-world, но id, displayName и UI
относятся к шаблону. Перед тем как ваш плагин получит публичный
manifest-approval, обновите:

1. **`package.json::name`** — поменяйте `booster-plugin-my-plugin` на свой
   id. Правила: минимум 2 символа, максимум 41; начинается со строчной
   буквы `[a-z]`; второй символ — буква или цифра (не дефис); необязательная
   середина 0–38 символов из `[a-z0-9-]`; последний символ — буква или цифра
   (не дефис). Точный регексп: `^[a-z][a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$`. **Префикс `booster-` зарезервирован за официальными
   плагинами `STEAMBALANCE/booster-plugins`** — ваш id должен начинаться с
   чего-то другого (например, `balance-watcher`, `tg-notify`).
   `build.ts` проверяет соответствие `package.json::name` и
   `src/plugin-meta.ts::pluginMeta.id` и упадёт с ошибкой, если они
   расходятся.
2. **`src/plugin-meta.ts`** — обновите `id`, `version`,
   `contextKinds`, `urlPatterns`, `grantedCapabilities`. Это
   source-of-truth для capabilities, который injector прочтёт из
   sidecar `.meta.json` до загрузки bundle'а.
3. **`src/index.ts::register({...})`**:
   - `id` — тот же, что в `package.json::name` минус `booster-plugin-`
     префикс (уже берётся из `plugin-meta.ts` через spread).
   - `displayName` — отображаемое имя (обязательное поле, RU/EN/любой
     язык; видно в logs и потенциальном UI).
   - `description` — короткая строка.
   - `contextKinds` — где плагин запускается:
     [`ContextKind.Main`](https://github.com/STEAMBALANCE/booster-framework/blob/main/docs/plugin-contract.md)
     (UI Steam'а, шапка/popup'ы) и/или `ContextKind.Web` (встроенный
     браузер магазина). Webonly — нужен `urlPatterns`.
   - `capabilities` — что плагин будет дёргать через `ctx.sb.*`. См.
     [`docs/capabilities.md`](https://github.com/STEAMBALANCE/booster-framework/blob/main/docs/capabilities.md).
     Минимум — `Capability.Ui`.
   - `init` — собственно логика. Возвращайте cleanup-функцию.
4. **`package.json::version`** — `0.0.1` подходит для локального dev'a;
   при первом submit'е поднимите до `0.1.0`.
5. **`tests/index.test.ts`** — добавьте свои тесты. Тесты — это
   immutable-контракт ожидаемого поведения (см.
   [`testing.md`](https://github.com/STEAMBALANCE/booster-framework/blob/main/docs/testing.md)).

После правок:

```pwsh
bun test                # должен быть зелёным
bun run build           # → out/<id>-<version>.js
```

## Команды

```pwsh
bun install             # установить зависимости
bun run build           # build IIFE-бандла (dev → external sourcemap)
bun --watch run build   # auto-rebuild при изменении src/
bun test                # bun test (happy-dom)
SB_PRODUCTION=1 bun run build   # production-вариант (minified, без sourcemap)
```

`build.ts` минимальный: `bun build src/index.ts --format iife
--target browser`, с `__SB_PLUGIN_VERSION__` и `__SB_PRODUCTION__`
define'ами. Production-сборка не пишет sourcemap рядом с бандлом.
Подходит как стартовая точка; усложните под себя, если
понадобится Svelte / CSS / multi-entry.

## Troubleshooting

### `--dev-plugin` failed: "sidecar .meta.json not found"

Bundle есть, sidecar — нет. Build broken? Run `bun run build` повторно;
если sidecar всё равно отсутствует — убедитесь, что `src/plugin-meta.ts`
существует и exports `pluginMeta` правильной shape
(см. `@steambalance/booster-framework/testing::PluginMeta`).

## Чек-лист первого релиза

- [ ] `package.json::name` уникальный, не `booster-`-prefix.
- [ ] `src/plugin-meta.ts::pluginMeta.id` совпадает с `name` минус `booster-plugin-` префикс.
- [ ] `displayName` человекочитаемый (в `src/index.ts`).
- [ ] `capabilities` — минимально необходимый набор.
- [ ] `bun test` зелёный.
- [ ] `bun run build` без warnings.
- [ ] Плагин прошёл локально через `--dev-plugin=...` и видно в шапке /
      на нужной странице.
- [ ] Отправлен URL бандла через portal-форму для approval'a (см.
      [`booster-plugins/README.md`](https://github.com/STEAMBALANCE/booster-plugins/blob/main/README.md)).

## Документация

- [Walkthrough (Getting Started)](https://github.com/STEAMBALANCE/booster-framework/blob/main/docs/getting-started.md)
- [API reference](https://github.com/STEAMBALANCE/booster-framework/tree/main/docs)
- [Capabilities](https://github.com/STEAMBALANCE/booster-framework/blob/main/docs/capabilities.md)
- [Testing](https://github.com/STEAMBALANCE/booster-framework/blob/main/docs/testing.md)
- [Troubleshooting](https://github.com/STEAMBALANCE/booster-framework/blob/main/docs/troubleshooting.md)

## Status

Active development. API внутри `apiVersion: 1` — стабилен; breaking
изменения идут через bump `apiVersion`.
