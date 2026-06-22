<!--
Спасибо за contribution в booster-plugin-template. Этот шаблон публикуется
как boilerplate для авторов внешних steambooster-плагинов; принимаем
только улучшения самого шаблона — не отдельные плагины (см. ниже).
-->

## Что меняется

<!-- 1-2 предложения: суть изменения и зачем оно нужно. -->

## Scope этого репозитория

`booster-plugin-template` — публичный boilerplate. Сюда принимаются ТОЛЬКО:

- [ ] Bug fix в самом шаблоне (`build.ts`, `tsconfig.json`, `package.json`,
      примеры в `src/`, тесты в `tests/`).
- [ ] Doc / README clarifications.
- [ ] Усиления test-каркаса (smoke / type-check / build-check).
- [ ] CI workflow fixes (`.github/workflows/*`).

**НЕ принимается:**

- Готовые плагины. Внешние плагины живут в своих репозиториях.
- Breaking changes к публичному API `@steambalance/booster-framework` — это
  обсуждается в репозитории `booster-framework`, не здесь.
- Cosmetic refactor'ы без bug fix / new test / doc.

## Checklist

- [ ] `bun install` проходит без ошибок.
- [ ] `bun test` зелёный локально (включая `tests/index.test.ts`).
- [ ] `bun run build` производит ожидаемый `out/<id>-<version>.js`.
- [ ] Изменены файлы только внутри scope'a выше.
- [ ] Если меняется поведение — есть regression-тест.
- [ ] Документация (`README.md`) обновлена при необходимости.

## Связанные репозитории

- [`booster-framework`](https://github.com/STEAMBALANCE/booster-framework) — публичный
  API, который шаблон использует через `@steambalance/booster-framework`.
- [`booster-plugins`](https://github.com/STEAMBALANCE/booster-plugins) — официальные
  плагины (`booster-checkout`, `booster-addfunds`); хороший reference для structure.
