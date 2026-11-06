const SITE_HOSTS = new Set(["spidytools.ru", "www.spidytools.ru"]);

function withTrailingSlash(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  if (pathname.endsWith("/")) return pathname;
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return `${pathname}/`;
}

export function sanitizeHref(input: string): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed || /[\u0000-\u001F\u007F\\]/.test(trimmed)) return null;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//")) return null;
    let url: URL;
    try {
      url = new URL(trimmed, "https://spidytools.ru");
    } catch {
      return null;
    }
    if (url.origin !== "https://spidytools.ru") return null;
    return `${withTrailingSlash(url.pathname)}${url.search}${url.hash}`;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  if (SITE_HOSTS.has(url.hostname)) {
    return `${withTrailingSlash(url.pathname)}${url.search}${url.hash}`;
  }
  return url.toString();
}

export function sanitizeMediaSrc(input: string): string | null {
  const href = sanitizeHref(input);
  if (!href || !href.startsWith("/blog/media/")) return null;
  if (href.includes("..")) return null;
  return href;
}
