function readTurboSiteId(yaml) {
  var lines = String(yaml).split(/\r?\n/);
  var uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  for (var i = 0; i < lines.length; i += 1) {
    var trimmed = lines[i].trim();
    if (!trimmed || trimmed.charAt(0) === "#") continue;
    var match = trimmed.match(/^turbo_site_id:\s*(\S+)\s*$/);
    if (!match) continue;
    return uuid.test(match[1]) ? match[1] : null;
  }
  return null;
}

function element(document, tag, className, text) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function mountBlocked(document) {
  var root = document.getElementById("gate");
  root.replaceChildren();
  var wrap = element(document, "div", "gate");
  wrap.appendChild(element(document, "p", "status", "Вход не подключён"));
  wrap.appendChild(element(document, "h1", "", "Редактор материалов"));
  wrap.appendChild(
    element(
      document,
      "p",
      "",
      "Кнопка входа в Decap намеренно не показывается: в config.yml ещё нет turbo_site_id.",
    ),
  );
  var list = document.createElement("ol");
  [
    "Схема — Decap Turbo Free и бэкенд turbo-github. Свой OAuth-прокси со scope public_repo снят.",
    "Картинки хранятся только в git, в public/blog/media.",
    "Вход включится после UUID сайта Turbo в config.yml. До установки GitHub App список прав смотрит Echo. См. decap-auth/OWNER-SETUP.md.",
  ].forEach(function (step) {
    list.appendChild(element(document, "li", "", step));
  });
  wrap.appendChild(list);
  wrap.appendChild(
    element(
      document,
      "p",
      "",
      "Вход остаётся выключенным. Редактор не входит в Turbo и не публикует материалы.",
    ),
  );
  root.appendChild(wrap);
}

function mountCms(document) {
  var manual = document.createElement("script");
  manual.textContent = "window.CMS_MANUAL_INIT = true;";
  document.body.appendChild(manual);

  var cms = document.createElement("script");
  cms.src = "https://unpkg.com/decap-cms@3.17.3/dist/decap-cms.js";
  cms.onload = function () {
    var preview = document.createElement("script");
    preview.src = "/admin/preview.js";
    preview.onload = function () {
      if (typeof window.initCMS === "function") window.initCMS();
    };
    document.body.appendChild(preview);
  };
  document.body.appendChild(cms);
}

async function bootDecapGate(document, fetchImpl) {
  var response = await fetchImpl("/admin/config.yml", { cache: "no-store" });
  if (!response.ok) {
    mountBlocked(document);
    return { enabled: false };
  }
  var yaml = await response.text();
  var siteId = readTurboSiteId(yaml);
  if (!siteId) {
    mountBlocked(document);
    return { enabled: false };
  }
  mountCms(document);
  return { enabled: true, siteId: siteId };
}

if (typeof window !== "undefined") {
  window.readTurboSiteId = readTurboSiteId;
  window.bootDecapGate = bootDecapGate;
  if (window.document && !window.__DECAP_GATE_TEST__) {
    window.bootDecapGate(window.document, function (url, options) {
      return window.fetch(url, options);
    });
  }
}
