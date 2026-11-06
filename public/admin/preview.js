(function (root) {
  var TOOLS = {
    "utm-generator": {
      href: "/utm-generator/",
      title: "Генератор UTM-меток",
      description: "Собрать ссылку с метками по полям.",
      icon: "↗",
    },
    erid: {
      href: "/erid/",
      title: "Маркировка erid",
      description: "Пометка «Реклама» и токен в ссылке.",
      icon: "Er",
    },
    qr: {
      href: "/qr/",
      title: "QR-код",
      description: "Код из уже размеченной ссылки.",
      icon: "▣",
    },
    counter: {
      href: "/counter/",
      title: "Подсчёт символов",
      description: "Длина Title и Description.",
      icon: "T",
    },
    slug: {
      href: "/slug/",
      title: "Транслит и ЧПУ",
      description: "Адрес из русского текста.",
      icon: "Aa",
    },
    "faq-schema": {
      href: "/faq-schema-generator/",
      title: "FAQ Schema",
      description: "JSON-LD для вопросов и ответов.",
      icon: "{}",
    },
  };

  var MONTHS = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  function text(value) {
    return value == null ? "" : String(value).trim();
  }

  function sanitizeHref(input) {
    var trimmed = text(input);
    if (!trimmed || /[\u0000-\u001F\u007F\\]/.test(trimmed)) return null;
    var lower = trimmed.toLowerCase();
    if (
      lower.indexOf("javascript:") === 0 ||
      lower.indexOf("data:") === 0 ||
      lower.indexOf("vbscript:") === 0
    ) {
      return null;
    }
    try {
      if (trimmed.charAt(0) === "/") {
        if (trimmed.indexOf("//") === 0) return null;
        var local = new URL(trimmed, "https://spidytools.ru");
        if (local.origin !== "https://spidytools.ru") return null;
        return withSlash(local.pathname) + local.search + local.hash;
      }
      var url = new URL(trimmed);
      if (url.protocol !== "https:" || url.username || url.password) return null;
      if (url.hostname === "spidytools.ru" || url.hostname === "www.spidytools.ru") {
        return withSlash(url.pathname) + url.search + url.hash;
      }
      return url.toString();
    } catch {
      return null;
    }
  }

  function withSlash(pathname) {
    if (!pathname || pathname === "/") return "/";
    if (pathname.charAt(pathname.length - 1) === "/") return pathname;
    if (/\.[a-z0-9]+$/i.test(pathname)) return pathname;
    return pathname + "/";
  }

  function persistedMediaPath(src) {
    if (typeof src !== "string") return null;
    var value = text(src);
    if (!value || /[\u0000-\u001F\u007F\\]/.test(value)) return null;
    var lower = value.toLowerCase();
    if (lower.indexOf("javascript:") === 0 || lower.indexOf("data:") === 0 || lower.indexOf("vbscript:") === 0) {
      return null;
    }
    try {
      var url = new URL(value, "https://spidytools.ru");
      var sameHost = url.hostname === "spidytools.ru" || url.hostname === "www.spidytools.ru";
      if (!sameHost || url.username || url.password) return null;
      if (url.pathname.indexOf("/blog/media/") !== 0 || url.pathname.indexOf("..") !== -1) return null;
      var path = url.pathname;
      if (path !== "/" && path.charAt(path.length - 1) !== "/" && !/\.[a-z0-9]+$/i.test(path)) {
        path += "/";
      }
      return path + url.search + url.hash;
    } catch {
      return null;
    }
  }

  function resolveCover(raw, getAsset) {
    var persisted = persistedMediaPath(raw);
    var resolved = null;
    if (typeof getAsset === "function") {
      try {
        var next = getAsset(raw);
        if (typeof next === "string") resolved = next;
      } catch {
        resolved = null;
      }
    }
    var pendingUpload = typeof resolved === "string" && resolved.indexOf("blob:") === 0;
    if (typeof raw !== "string") return pendingUpload ? resolved : null;
    if (!persisted) return null;
    return pendingUpload ? resolved : persisted;
  }

  function formatRuDate(iso) {
    var parts = text(iso).slice(0, 10).split("-");
    var month = MONTHS[Number(parts[1]) - 1];
    if (!parts[0] || !month || !parts[2]) return text(iso);
    return Number(parts[2]) + " " + month + " " + parts[0];
  }

  function inlineNodes(source, h) {
    var nodes = [];
    var rest = String(source);
    var pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\((?:[^()]|\([^()]*\))*\))/;
    while (rest.length) {
      var match = pattern.exec(rest);
      if (!match) {
        nodes.push(rest);
        break;
      }
      if (match.index > 0) nodes.push(rest.slice(0, match.index));
      var token = match[0];
      if (token.charAt(0) === "`") {
        nodes.push(h("code", { key: "i" + nodes.length }, token.slice(1, -1)));
      } else if (token.indexOf("**") === 0) {
        nodes.push(h("strong", { key: "i" + nodes.length }, token.slice(2, -2)));
      } else {
        var link = /^\[([^\]]+)\]\(((?:[^()]|\([^()]*\))*)\)$/.exec(token);
        var safe = link ? sanitizeHref(link[2]) : null;
        if (link && safe) {
          var props = { key: "i" + nodes.length, href: safe };
          if (safe.indexOf("https://") === 0) {
            props.target = "_blank";
            props.rel = "noopener noreferrer";
          }
          nodes.push(h("a", props, link[1]));
        } else if (link) {
          nodes.push(h("span", { key: "i" + nodes.length }, link[1]));
        } else {
          nodes.push(token);
        }
      }
      rest = rest.slice(match.index + token.length);
    }
    return nodes;
  }

  function paragraph(line, h, key) {
    return h("p", { key: key }, inlineNodes(line, h));
  }

  function markdownBlocks(source, h) {
    var lines = String(source || "").replace(/\r\n/g, "\n").split("\n");
    var blocks = [];
    var index = 0;
    while (index < lines.length) {
      var line = lines[index];
      if (line.trim().indexOf("```") === 0) {
        var code = [];
        index += 1;
        while (index < lines.length && lines[index].trim().indexOf("```") !== 0) {
          code.push(lines[index]);
          index += 1;
        }
        index += 1;
        blocks.push(h("pre", { key: "c" + blocks.length }, h("code", {}, code.join("\n"))));
        continue;
      }
      if (/^\s*\|/.test(line) && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
        var tableLines = [line];
        index += 1;
        while (index < lines.length && /^\s*\|/.test(lines[index])) {
          tableLines.push(lines[index]);
          index += 1;
        }
        blocks.push(markdownTable(tableLines, h, "t" + blocks.length));
        continue;
      }
      var heading = /^(#{1,3})\s+(.+)$/.exec(line);
      if (heading) {
        var tag = heading[1].length === 1 ? "h2" : heading[1].length === 2 ? "h2" : "h3";
        blocks.push(h(tag, { key: "h" + blocks.length }, inlineNodes(heading[2], h)));
        index += 1;
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        var items = [];
        while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
          items.push(h("li", { key: items.length }, inlineNodes(lines[index].replace(/^\s*[-*]\s+/, ""), h)));
          index += 1;
        }
        blocks.push(h("ul", { key: "u" + blocks.length }, items));
        continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        var ordered = [];
        while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
          ordered.push(
            h("li", { key: ordered.length }, inlineNodes(lines[index].replace(/^\s*\d+\.\s+/, ""), h)),
          );
          index += 1;
        }
        blocks.push(h("ol", { key: "o" + blocks.length }, ordered));
        continue;
      }
      if (!line.trim()) {
        index += 1;
        continue;
      }
      var paragraphLines = [];
      while (index < lines.length && lines[index].trim() && !/^(```|#{1,3}\s|\s*[-*]\s|\s*\d+\.\s|\s*\|)/.test(lines[index])) {
        paragraphLines.push(lines[index].trim());
        index += 1;
      }
      blocks.push(paragraph(paragraphLines.join(" "), h, "p" + blocks.length));
    }
    return h("div", { className: "blog-markdown" }, blocks);
  }

  function splitRow(line) {
    return line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map(function (cell) {
        return cell.trim();
      });
  }

  function markdownTable(tableLines, h, key) {
    var header = splitRow(tableLines[0]);
    var body = tableLines.slice(2).filter(function (row) {
      return !/^\s*\|?\s*:?-{3,}/.test(row);
    });
    return h(
      "div",
      { key: key, className: "blog-table-scroll" },
      h(
        "table",
        {},
        h(
          "thead",
          {},
          h(
            "tr",
            {},
            header.map(function (cell, cellIndex) {
              return h("th", { key: cellIndex, scope: "col" }, inlineNodes(cell, h));
            }),
          ),
        ),
        h(
          "tbody",
          {},
          body.map(function (row, rowIndex) {
            return h(
              "tr",
              { key: rowIndex },
              splitRow(row).map(function (cell, cellIndex) {
                return h("td", { key: cellIndex }, inlineNodes(cell, h));
              }),
            );
          }),
        ),
      ),
    );
  }

  function rowsOf(value) {
    if (!value) return [];
    var list = Array.isArray(value) ? value : value.toArray ? value.toArray() : [];
    return list.map(function (row) {
      if (Array.isArray(row)) return row.map(text);
      if (row && Array.isArray(row.cells)) return row.cells.map(text);
      return [];
    });
  }

  function renderBlock(block, h, key) {
    var type = text(block.type);
    if (type === "markdown") {
      if (!text(block.text)) return null;
      return h("div", { key: key }, markdownBlocks(block.text, h));
    }
    if (type === "note") {
      var tone = text(block.tone) === "warning" ? "warning" : "info";
      return h(
        "aside",
        {
          key: key,
          "data-block": "note",
          "data-tone": tone,
          className: "spidy-note" + (tone === "warning" ? " is-warning" : ""),
        },
        markdownBlocks(block.text, h),
      );
    }
    if (type === "cta") {
      var href = sanitizeHref(block.href);
      var className = "spidy-button";
      var button = href
        ? h(
            "a",
            href.indexOf("https://") === 0
              ? { href: href, className: className, target: "_blank", rel: "noopener noreferrer" }
              : { href: href, className: className },
            text(block.label),
          )
        : h("span", { className: className }, text(block.label));
      return h(
        "div",
        { key: key, "data-block": "cta", className: "spidy-cta" },
        text(block.lead) ? h("p", {}, text(block.lead)) : null,
        button,
      );
    }
    if (type === "tool") {
      var tool = TOOLS[text(block.tool)];
      if (!tool) return null;
      return h(
        "div",
        { key: key, "data-block": "tool", className: "spidy-tool" },
        text(block.caption) ? h("p", { className: "spidy-caption" }, text(block.caption)) : null,
        h(
          "a",
          { href: tool.href, className: "spidy-tool-card" },
          h("span", { className: "spidy-tool-icon" }, tool.icon),
          h(
            "span",
            {},
            h("span", { className: "spidy-tool-title" }, tool.title),
            h("span", { className: "spidy-tool-description" }, tool.description),
          ),
          h("span", { className: "spidy-tool-arrow" }, "↗"),
        ),
      );
    }
    if (type === "comparison") {
      var columns = Array.isArray(block.columns) ? block.columns.map(text) : [];
      return h(
        "figure",
        { key: key, "data-block": "comparison", className: "spidy-comparison" },
        text(block.caption) ? h("figcaption", {}, text(block.caption)) : null,
        h(
          "div",
          { className: "blog-table-scroll" },
          h(
            "table",
            {},
            h(
              "thead",
              {},
              h(
                "tr",
                {},
                columns.map(function (column, columnIndex) {
                  return h("th", { key: columnIndex, scope: "col" }, column);
                }),
              ),
            ),
            h(
              "tbody",
              {},
              rowsOf(block.rows).map(function (row, rowIndex) {
                return h(
                  "tr",
                  { key: rowIndex },
                  row.map(function (cell, cellIndex) {
                    return h("td", { key: cellIndex }, cell);
                  }),
                );
              }),
            ),
          ),
        ),
      );
    }
    return null;
  }

  function renderSpidyPreview(data, h, getAsset) {
    var author = text(data.author);
    var date = text(data.date);
    var updated = text(data.updated);
    var cover = resolveCover(data.cover, getAsset);
    var blocks = Array.isArray(data.blocks) ? data.blocks : [];
    return h(
      "main",
      { className: "spidy-preview", "data-draft": data.draft ? "true" : "false" },
      h(
        "article",
        { className: "spidy-article" },
        data.draft
          ? h(
              "p",
              { className: "spidy-draft" },
              "Черновик. Это предпросмотр внутри редактора, не адрес на сайте.",
            )
          : null,
        text(data.section) ? h("p", { className: "spidy-section" }, text(data.section)) : null,
        h("h1", {}, text(data.title) || "Без заголовка"),
        text(data.description) ? h("p", { className: "spidy-description" }, text(data.description)) : null,
        author || date
          ? h(
              "p",
              { className: "spidy-byline" },
              author || null,
              author && date ? " · " : null,
              date ? h("time", { dateTime: date.slice(0, 10) }, formatRuDate(date)) : null,
            )
          : null,
        updated && updated !== date
          ? h("p", { className: "spidy-byline" }, "Обновлено ", h("time", { dateTime: updated.slice(0, 10) }, formatRuDate(updated)))
          : null,
        cover ? h("img", { className: "spidy-cover", src: cover, alt: text(data.coverAlt) }) : null,
        h(
          "div",
          { className: "spidy-blocks" },
          blocks.map(function (block, blockIndex) {
            return renderBlock(block, h, blockIndex);
          }),
        ),
      ),
    );
  }

  function readValue(entry, path) {
    var value = entry.getIn(["data"].concat(path));
    if (value && typeof value.toJS === "function") return value.toJS();
    return value;
  }

  function entryData(entry) {
    return {
      title: readValue(entry, ["title"]),
      description: readValue(entry, ["description"]),
      section: readValue(entry, ["section"]),
      draft: readValue(entry, ["draft"]),
      author: readValue(entry, ["author"]),
      date: readValue(entry, ["date"]),
      updated: readValue(entry, ["updated"]),
      cover: readValue(entry, ["cover"]),
      coverAlt: readValue(entry, ["cover_alt"]),
      blocks: readValue(entry, ["blocks"]) || [],
    };
  }

  root.renderSpidyPreview = renderSpidyPreview;

  if (!root.CMS || !root.createClass || !root.h) return;

  var PostPreview = root.createClass({
    render: function () {
      return renderSpidyPreview(entryData(this.props.entry), root.h, this.props.getAsset);
    },
  });

  root.CMS.registerPreviewStyle("/admin/preview.css");
  root.CMS.registerPreviewTemplate("posts", PostPreview);
})(typeof window !== "undefined" ? window : globalThis);
