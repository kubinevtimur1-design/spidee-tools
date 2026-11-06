# Подключение входа Decap

Редактор на `/admin/` уже лежит в статическом сайте, но вход выключен: в `public/admin/config.yml` нет `base_url`, и страница не загружает Decap. Так и должно оставаться, пока не выполнены шаги ниже. Секрет OAuth в репозиторий, в `config.yml` и в браузерный бандл не кладётся.

Пока это не сделано, владелец не может войти, создать или опубликовать материал из редактора. Сборка сайта от этого не зависит.

## Почему нужен отдельный адрес

GitHub не поддерживает implicit grant. Обмен `code` на токен требует `client_secret` на сервере:

- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps

Decap для GitHub прямо говорит, что нужна серверная аутентификация, и описывает свой прокси: `/auth` открывает GitHub, `/callback` возвращает токен в окно редактора через `postMessage`.

- https://decapcms.org/docs/github-backend/
- https://decapcms.org/docs/backends-overview/
- https://decapcms.org/docs/manual-initialization/

Код прокси: `decap-auth/src/index.mjs`. Его не нужно выкладывать в публичный произвольный хост из этого репозитория. Его деплоит владелец на свой Cloudflare Worker.

Netlify Git Gateway для новой схемы не используем: у Netlify он помечен как deprecated, новые конфигурации не рекомендуются.

- https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway

Decap Turbo Free (1 сайт, 1 место, без карты) — официальная альтернатива, если не хочется держать Worker. В этом изменении она не включена: для неё нужен аккаунт Turbo и Site ID. CMS при этом остаётся Decap.

- https://decapcms.org/docs/turbo-getting-started/
- https://decapcms.org/turbo/

## Бесплатные лимиты Worker

Workers Free, без карты:

- 100 000 запросов в сутки на аккаунт, сброс в 00:00 UTC
- 10 мс CPU на запрос; ожидание ответа GitHub в CPU не входит

Вход редактора — это несколько запросов на сессию, не на просмотр сайта. Для одного редактора лимит не является рабочим ограничением.

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/

## Шаги владельца

1. Создать GitHub OAuth App: https://github.com/settings/developers и https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
   - Homepage URL: `https://spidytools.ru`
   - Authorization callback URL: `https://<host-воркера>/callback` — тот origin, на котором будет отвечать Worker, плюс путь `/callback`.
   - Wildcard matching для callback выключить. Иначе код можно увести на другой поддомен или подпуть. С 3 августа 2026 у старых приложений wildcard мог включиться сам; у нового его не включать.
   - Сгенерировать Client Secret. Он показывается один раз и остаётся только у владельца.
2. Создать Cloudflare Worker из каталога `decap-auth` (`npx wrangler deploy` из этого каталога, под аккаунтом владельца).
3. Записать секреты, не в файлы репозитория:

   ```bash
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```

   `ALLOWED_ORIGINS` уже задан в `wrangler.toml`: `https://spidytools.ru`, `https://www.spidytools.ru`, `http://localhost:3000`, `http://127.0.0.1:3000`. Токен уходит только на origin из этого списка.
4. Проверить, что `https://<host-воркера>/auth` без секрета в URL редиректит на GitHub, а секрет наружу не попадает. Этот репозиторий такой запрос не выполняет.
5. Отдельным изменением кода, через ревью Echo, раскомментировать в `public/admin/config.yml` одну строку:

   ```yaml
   base_url: https://<host-воркера>
   ```

   Без пути, без `client_id` и без секрета. После деплоя этого коммита `/admin/` начнёт загружать Decap.

## Права

В конфиге стоит `auth_scope: public_repo`. Для публичного репозитория этого хватает, чтобы читать и писать файлы. OAuth App не умеет сузить доступ до одного репозитория или одной папки: `public_repo` даёт запись во все публичные репозитории, куда может писать вошедший пользователь.

- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps

Входить должен аккаунт с правом записи в `kubinevtimur1-design/spidee-tools`. Чужой аккаунт без записи увидит отказ Decap.

Лимит GitHub API для пользовательского токена — 5000 запросов в час. Для блога этого достаточно. Прокси не кэширует API.

- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api

## Что будет после включения

Режим публикации `simple`: сохранение сразу коммитит в `main` от имени вошедшего пользователя, не от `GITHUB_TOKEN`. Такой push запускает `.github/workflows/deploy.yml`. Ограничение «события от `GITHUB_TOKEN` не запускают другие workflow» к этим коммитам не относится.

- https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow

Сейчас у `main` нет branch protection и rulesets, а окружение `github-pages` принимает деплой только с `main`. Черновик в Decap — это `draft: true`. Файл есть в git, но сборка не создаёт для него страницу, карточку и URL в sitemap. Снятие галочки публикует материал следующим деплоем, если заполнены описание, автор и дата. Снова включить черновик или удалить запись — снять с сайта. Отдельное одобрение Echo на каждый материал не требуется. Изменения кода, включая строку `base_url`, по-прежнему идут через ревью.

Каждое сохранение, включая правку черновика, всё равно пушит `main` и пересобирает весь сайт. Редакционный режим Decap (`publish_mode: editorial_workflow`) кладёт черновики в отдельные PR и не деплоит их, но тогда публикация зависит от того, что PR можно смержить без обязательного ревью. Сейчас защита веток не включена; режим `simple` выбран, чтобы публикация не выглядела как code review.

Предпросмотр в редакторе — `registerPreviewTemplate` в браузере. Это не адрес на GitHub Pages. У Pages один прод-сайт, preview deployment на ветку в текущей схеме не появляется: workflow слушает только `main`, а окружение пускает только `main`.

- https://decapcms.org/docs/customization/
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Картинки коммитятся в `public/blog/media`. Git LFS бэкенд Decap не поддерживает. GitHub не принимает файлы больше 100 МБ.

- https://decapcms.org/docs/github-backend/
- https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github

Имя файла фиксируется при первом сохранении. Смена slug в редакторе файл не переименовывает. Старый адрес кладётся в `aliases`: это страница с `canonical` и meta refresh, не HTTP 301. Статический экспорт Next.js редиректы не выполняет.

- https://nextjs.org/docs/app/guides/static-exports

Если сборка после коммита падает, шаг deploy не запускается (`needs: build`), и на Pages остаётся последний успешный деплой. Очередь workflow `pages` не отменяет уже идущий запуск. Плохой, но успешный деплой откатывается новым коммитом, обычно revert.
