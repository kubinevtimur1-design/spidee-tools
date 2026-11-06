import assert from "node:assert/strict";
import test from "node:test";

import { handleOAuthRequest, parseAllowedOrigins } from "./src/index.mjs";

const env = {
  GITHUB_CLIENT_ID: "Iv1.client",
  GITHUB_CLIENT_SECRET: "secret-value-do-not-leak",
  ALLOWED_ORIGINS:
    "https://spidytools.ru,https://www.spidytools.ru,http://localhost:3000",
};

test("allowed origins are exact and the scope stays public_repo", async () => {
  assert.deepEqual(parseAllowedOrigins(env.ALLOWED_ORIGINS), [
    "https://spidytools.ru",
    "https://www.spidytools.ru",
    "http://localhost:3000",
  ]);
  assert.deepEqual(parseAllowedOrigins("https://evil.example/steal"), []);

  const response = await handleOAuthRequest(
    new Request(
      "https://worker.example/auth?provider=github&scope=public_repo&site_id=spidytools.ru",
    ),
    env,
  );
  assert.equal(response.status, 302);
  const location = new URL(response.headers.get("location"));
  assert.equal(location.origin, "https://github.com");
  assert.equal(location.pathname, "/login/oauth/authorize");
  assert.equal(location.searchParams.get("client_id"), env.GITHUB_CLIENT_ID);
  assert.equal(location.searchParams.get("scope"), "public_repo");
  assert.equal(
    location.searchParams.get("redirect_uri"),
    "https://worker.example/callback",
  );
  assert.equal(response.headers.get("location").includes(env.GITHUB_CLIENT_SECRET), false);

  const broad = await handleOAuthRequest(
    new Request("https://worker.example/auth?provider=github&scope=repo"),
    env,
  );
  assert.equal(broad.status, 400);
});

test("callback posts the token only to an allowed opener origin", async () => {
  const auth = await handleOAuthRequest(
    new Request("https://worker.example/auth?provider=github&scope=public_repo"),
    env,
  );
  const state = new URL(auth.headers.get("location")).searchParams.get("state");
  const cookie = auth.headers.get("set-cookie").split(";")[0];
  let sawSecret = false;

  const callback = await handleOAuthRequest(
    new Request(`https://worker.example/callback?code=abc&state=${state}`, {
      headers: { cookie },
    }),
    env,
    {
      fetch: async (url, init) => {
        assert.equal(url, "https://github.com/login/oauth/access_token");
        const params = new URLSearchParams(init.body);
        sawSecret = params.get("client_secret") === env.GITHUB_CLIENT_SECRET;
        return Response.json({
          access_token: "gho_</script><script>alert(1)",
          token_type: "bearer",
        });
      },
    },
  );

  const html = await callback.text();
  assert.equal(sawSecret, true);
  assert.equal(html.includes(env.GITHUB_CLIENT_SECRET), false);
  assert.equal(html.includes("<script>alert"), false);
  assert.match(html, /authorization:github:success:/);
  assert.match(html, /u003c/);
  assert.match(html, /postMessage\(message, event\.origin\)/);
  assert.match(html, /https:\/\/spidytools\.ru/);
  assert.equal((html.match(/<script>/g) || []).length, 1);

  const mismatch = await handleOAuthRequest(
    new Request("https://worker.example/callback?code=abc&state=different", {
      headers: { cookie },
    }),
    env,
    {
      fetch: async () => {
        throw new Error("token endpoint must not be called");
      },
    },
  );
  assert.equal(mismatch.status, 400);
});
