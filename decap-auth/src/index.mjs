const SCOPE = "public_repo";
const STATE_COOKIE = "decap_oauth_state";

export function parseAllowedOrigins(value) {
  if (typeof value !== "string") return [];
  const origins = [];
  for (const part of value.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    try {
      const url = new URL(trimmed);
      if (url.protocol !== "https:" && url.protocol !== "http:") continue;
      if (url.origin !== trimmed) continue;
      origins.push(url.origin);
    } catch {
      continue;
    }
  }
  return origins;
}

function tokensEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const length = Math.max(left.length, right.length);
  let mismatch = left.length === right.length ? 0 : 1;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function randomState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return "";
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function embed(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function resultPage({ allowedOrigins, message, fallback }) {
  const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>GitHub</title>
</head>
<body>
  <p>${fallback}</p>
  <script>
    (function () {
      var allowed = ${embed(allowedOrigins)};
      var message = ${embed(message)};
      if (!window.opener) return;
      window.addEventListener("message", function (event) {
        if (allowed.indexOf(event.origin) === -1) return;
        if (event.data !== "authorizing:github") return;
        window.opener.postMessage(message, event.origin);
      });
      window.opener.postMessage("authorizing:github", "*");
    })();
  </script>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
      "referrer-policy": "no-referrer",
    },
  });
}

function startAuth(url, env) {
  const provider = url.searchParams.get("provider") || "github";
  if (provider !== "github") return json(400, { error: "unsupported_provider" });
  const requestedScope = url.searchParams.get("scope");
  if (requestedScope && requestedScope !== SCOPE) {
    return json(400, { error: "unsupported_scope" });
  }
  if (!env.GITHUB_CLIENT_ID) return json(503, { error: "oauth_not_configured" });

  const state = randomState();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", `${url.origin}/callback`);
  authorize.searchParams.set("scope", SCOPE);
  authorize.searchParams.set("state", state);
  return new Response(null, {
    status: 302,
    headers: {
      location: authorize.toString(),
      "set-cookie": `${STATE_COOKIE}=${state}; HttpOnly; Secure; Path=/; Max-Age=600; SameSite=Lax`,
      "cache-control": "no-store",
    },
  });
}

async function finishAuth(request, url, env, fetchImpl) {
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const cookie = readCookie(request, STATE_COOKIE);
  if (!code || !tokensEqual(state, cookie)) return json(400, { error: "state_mismatch" });
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return json(503, { error: "oauth_not_configured" });
  }
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);
  if (allowedOrigins.length === 0) return json(503, { error: "oauth_not_configured" });

  const body = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    client_secret: env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: `${url.origin}/callback`,
    state,
  });
  let token = "";
  try {
    const response = await fetchImpl("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const payload = await response.json();
    if (!response.ok || !payload.access_token || payload.error) {
      throw new Error("token_exchange_failed");
    }
    token = payload.access_token;
  } catch {
    return resultPage({
      allowedOrigins,
      message:
        "authorization:github:error:" +
        JSON.stringify({ message: "GitHub authorization failed" }),
      fallback: "Не удалось войти через GitHub.",
    });
  }

  const inner = JSON.stringify({ token, provider: "github" }).replaceAll("<", "\\u003c");
  return resultPage({
    allowedOrigins,
    message: `authorization:github:success:${inner}`,
    fallback: "Можно закрыть это окно и вернуться в редактор.",
  });
}

export async function handleOAuthRequest(request, env, deps = {}) {
  const fetchImpl = deps.fetch ?? fetch;
  const url = new URL(request.url);
  if (request.method !== "GET") return json(405, { error: "method_not_allowed" });
  if (url.pathname === "/auth") return startAuth(url, env);
  if (url.pathname === "/callback") return finishAuth(request, url, env, fetchImpl);
  return json(404, { error: "not_found" });
}

const worker = {
  async fetch(request, env) {
    return handleOAuthRequest(request, env);
  },
};

export default worker;
