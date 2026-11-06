# Подключение входа Decap

Редактор на `/admin/` лежит в статическом сайте, но вход выключен: в `public/admin/config.yml` нет `base_url`, и страница не загружает Decap. Так и остаётся. OAuth App, Cloudflare Worker и аккаунт Decap Turbo сейчас не создаются.

Секрет OAuth в репозиторий, в `config.yml` и в браузерный бандл не кладётся. Сборка сайта от входа не зависит.

## Почему нужен отдельный адрес

GitHub не поддерживает implicit grant. Обмен `code` на токен требует `client_secret` на сервере:

- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps

Decap для GitHub прямо говорит, что нужна серверная аутентификация, и описывает свой прокси: `/auth` открывает GitHub, `/callback` возвращает токен в окно редактора через `postMessage`.

- https://decapcms.org/docs/github-backend/
- https://decapcms.org/docs/backends-overview/
- https://decapcms.org/docs/manual-initialization/

Код прокси: `decap-auth/src/index.mjs`. Он не задеплоен и сейчас не деплоится.

Netlify Git Gateway для новой схемы не используем: у Netlify он помечен как deprecated, новые конфигурации не рекомендуются.

- https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway

Decap Turbo в этом изменении не включён. Чем его доступ к репозиторию отличается от OAuth App, написано в блокере ниже.

- https://decapcms.org/docs/turbo-getting-started/
- https://decapcms.org/turbo/

## Бесплатные лимиты Worker

Workers Free, без карты:

- 100 000 запросов в сутки на аккаунт, сброс в 00:00 UTC
- 10 мс CPU на запрос; ожидание ответа GitHub в CPU не входит

Вход редактора — это несколько запросов на сессию, не на просмотр сайта. Для одного редактора лимит не является рабочим ограничением.

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/

## Блокер: выбранный OAuth не ограничивается репозиторием Spidy

Текущая схема — бэкенд Decap `github` плюс прокси в `decap-auth/src/index.mjs` со scope `public_repo` — не умеет выдать токен только на `kubinevtimur1-design/spidee-tools`.

`public_repo` у OAuth App — это запись в публичные репозитории, к которым у пользователя уже есть доступ, а не в один выбранный репозиторий. В протоколе авторизации OAuth App нет параметра `repository_id`.

- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps

Decap забирает токен в браузер: прокси на `/callback` отдает его окну редактора через `postMessage`, дальше CMS сама ходит в `api.github.com`. Список origin в `ALLOWED_ORIGINS` ограничивает только адресата `postMessage`. Он не сужает токен. Любой список репозиториев на прокси тоже не сужает токен, который уже оказался в браузере.

- https://decapcms.org/docs/backends-overview/

Пока владелец отдельно не согласится на запись во все свои публичные репозитории, OAuth App не создавать, Worker не деплоить, `base_url` не включать.

## Что в документах ограничивает один репозиторий, и чего здесь нет

GitHub App, в отличие от OAuth App, ставится на выбранные репозитории. Пользовательский токен App (`ghu_`) видит только пересечение прав пользователя и установки App. При обмене кода можно передать `repository_id` одного репозитория; если App или пользователь к нему не допущены, GitHub этот параметр молча игнорирует. Для GitHub App в авторизации допустим только scope `offline_access`, не `public_repo`.

- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps
- https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app
- https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-with-a-github-app-on-behalf-of-a-user

Документация бэкенда Decap `github` описывает OAuth scope и передачу токена в CMS. Она не описывает GitHub App и `repository_id`. Совместимость Decap с токеном `ghu_` здесь не проверялась и не включается.

Decap Turbo документирует другой контур: GitHub App Turbo ставится на выбранные репозитории, это внешняя граница доступа, а вход редактора в аккаунт Turbo сам по себе доступ к репозиториям не дает. Токен GitHub при этом держит сервер Turbo, не браузер. Для этого нужен аккаунт Turbo и установка их App. Ни того, ни другого сейчас нет, и этот PR схему на Turbo не переключает.

- https://decapcms.org/docs/turbo-getting-started/
- https://decapcms.org/docs/turbo-troubleshooting-faq/
- https://decapcms.org/docs/github-backend/

Fine-grained PAT на один репозиторий GitHub умеет, но у Decap нет описанного входа с вставкой такого токена. Это не схема этого PR.

Лимит GitHub API для пользовательского токена — 5000 запросов в час. Для блога этого достаточно. Прокси не кэширует API.

- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api

## Что будет после включения

Ниже — поведение уже после отдельного разрешения включить вход. Сейчас вход не включается.

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
