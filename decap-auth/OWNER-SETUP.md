# Вход Decap Turbo

Редактор на `/admin/` выключен: в `public/admin/config.yml` нет `turbo_site_id`, и страница не загружает Decap. Так и остаётся, пока UUID сайта не попадёт в конфиг отдельным ревью. Секретов в репозитории нет. Аккаунт Turbo и GitHub App отсюда не создаются и не ставятся.

Свой OAuth-прокси со scope `public_repo` снят. Каталог `decap-auth/src` и Worker больше не являются путём деплоя. `public_repo` давал запись во все публичные репозитории пользователя, а токен уходил в браузер. Это не ограничение одним репозиторием Spidy.

- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
- https://decapcms.org/docs/backends-overview/

## Что уже выбрано

Decap CMS с бэкендом `turbo-github` на тарифе Turbo Free: €0, 1 сайт, 1 место, без карты и без срока, если не включать пробный Pro. Контент остаётся в git. Картинки — только файлы в `public/blog/media`, не S3. S3-библиотека Turbo относится к Pro и в конфиге не задана.

- https://decapcms.org/turbo/
- https://decapcms.org/docs/turbo-billing/
- https://decapcms.org/docs/turbo-getting-started/
- https://decapcms.org/docs/turbo-connecting-a-site/
- https://decapcms.org/docs/turbo-media-proxy/

`draft: true` скрывает материал из каталога, sitemap и статического маршрута. Файл Markdown в публичном GitHub остаётся читаемым и не является секретом.

Обложка в предпросмотре следует правилу сайта: в файле допустим только путь `/blog/media/…` (адрес `https://spidytools.ru/blog/media/…` приводится к этому пути). Чужой `https` и `data:` в поле не показываются, даже если `getAsset` вернёт для них `blob:`. Временный просмотр только что выбранного файла возможен, когда Decap через `getAsset` отдаёт `blob:` для объекта загрузки или для уже допустимого пути. Это не проверка внутри вошедшей сессии CMS.

## Что заполняет владелец, без секретов

Эти поля не секретные. Пока их нет в конфиге, вход честно выключен.

1. Организация Turbo на Free. Пробный Pro не включать.
2. Перед установкой GitHub App открыть экран прав и передать его Echo. Ставить App только если Echo подтвердит список. Ожидаемый выбор репозитория: **Only select repositories** → `kubinevtimur1-design/spidee-tools`. Если на экране запись в другие репозитории, администрирование организации или иной неожиданный доступ — установку остановить.
   GitHub отдельно пишет, что даже при выборе отдельных репозиториев App сохраняет как минимум чтение всех публичных репозиториев. Это тоже должно быть явно принято Echo до установки.
   - https://decapcms.org/docs/turbo-getting-started/
   - https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-a-third-party
3. Сайт Turbo, после разрешения установки:
   - Git provider: GitHub
   - Repo: `kubinevtimur1-design/spidee-tools`
   - Branch: `main`
   - Config path: `public/admin/config.yml`
   - Admin interface URL: `https://spidytools.ru/admin/`
4. С вкладки Overview скопировать Site ID. Это UUID, не секрет. Отдельным коммитом на ревью добавить в `backend`:

```yaml
backend:
  name: turbo-github
  branch: main
  turbo_site_id: 00000000-0000-4000-8000-000000000000
```

Подставить настоящий UUID. Пример выше не включать: страница входа смотрит только на некомментированную строку с UUID.

Репозиторий в `config.yml` для Turbo не задаётся. Источник прав — строка сайта в кабинете Turbo и установка App.

- https://decapcms.org/docs/turbo-connecting-a-site/

## После включения

Сохранение коммитит в `main` через сервер Turbo, не токеном `public_repo` в браузере. Публикация для этого репозитория — снять `draft` при заполненных описании, авторе и дате. Снятие с публикации — снова включить черновик или удалить запись. Черновик всё равно лежит в публичном git.

Проверки входа, черновика, картинки, предпросмотра, публикации, правки и снятия с публикации описаны в `decap-auth/E2E-AFTER-DEPLOY.md`. Их запускают только после ревью, деплоя и появления `turbo_site_id`. Реальный черновик маркетолога в этих проверках не публикуют.
