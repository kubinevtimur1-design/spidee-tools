function readDecapBaseUrl(yaml) {
  var lines = String(yaml).split(/\r?\n/);
  for (var i = 0; i < lines.length; i += 1) {
    var trimmed = lines[i].trim();
    if (!trimmed || trimmed.charAt(0) === "#") continue;
    var match = trimmed.match(/^base_url:\s*(\S+)\s*$/);
    if (!match) continue;
    try {
      var url = new URL(match[1]);
      if (url.protocol !== "https:") return null;
      if (url.username || url.password || url.search || url.hash) return null;
      if (url.pathname !== "/" && url.pathname !== "") return null;
      return url.origin;
    } catch {
      return null;
    }
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
      "Кнопка входа в Decap намеренно не показывается. GitHub требует сервер для обмена кода на токен, а секрет OAuth нельзя класть в статический сайт.",
    ),
  );
  var list = document.createElement("ol");
  [
    "Владелец создаёт GitHub OAuth App и бесплатный Cloudflare Worker по инструкции decap-auth/OWNER-SETUP.md.",
    "Секрет остаётся только в секрете Worker. В репозиторий попадает origin прокси, без client_secret.",
    "После этого отдельное изменение config.yml с base_url проходит ревью кода. Тогда /admin загрузит Decap.",
  ].forEach(function (step) {
    list.appendChild(element(document, "li", "", step));
  });
  wrap.appendChild(list);
  wrap.appendChild(
    element(
      document,
      "p",
      "",
      "Публикация материалов после настройки — коммит в main от аккаунта владельца. Отдельное одобрение каждой статьи не требуется. Код по-прежнему идёт через ревью.",
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
  var baseUrl = readDecapBaseUrl(yaml);
  if (!baseUrl) {
    mountBlocked(document);
    return { enabled: false };
  }
  mountCms(document);
  return { enabled: true, baseUrl: baseUrl };
}

if (typeof window !== "undefined") {
  window.readDecapBaseUrl = readDecapBaseUrl;
  window.bootDecapGate = bootDecapGate;
  if (window.document && !window.__DECAP_GATE_TEST__) {
    window.bootDecapGate(window.document, function (url, options) {
      return window.fetch(url, options);
    });
  }
}
