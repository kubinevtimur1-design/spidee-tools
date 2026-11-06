(function () {
  if (!window.CMS || !window.createClass || !window.h) return;

  function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value.toArray === "function") return value.toArray();
    return [];
  }

  var PostPreview = window.createClass({
    render: function () {
      var h = window.h;
      var entry = this.props.entry;
      var title = entry.getIn(["data", "title"]) || "Без заголовка";
      var draft = entry.getIn(["data", "draft"]);
      var blocks = this.props.widgetsFor("blocks");
      var items = blocks && typeof blocks.map === "function" ? blocks : [];
      var body = items.map(function (block, index) {
        var type = block.getIn(["data", "type"]);
        if (type === "markdown" || type === "note") {
          return h("div", { key: index }, block.getIn(["widgets", "text"]));
        }
        if (type === "cta") {
          return h(
            "p",
            { key: index },
            block.getIn(["data", "lead"]) || "",
            " ",
            h("strong", {}, block.getIn(["data", "label"]) || ""),
          );
        }
        if (type === "tool") {
          return h(
            "p",
            { key: index },
            block.getIn(["data", "caption"]) || "",
            " ",
            h("strong", {}, block.getIn(["data", "tool"]) || ""),
          );
        }
        if (type === "comparison") {
          var columns = toArray(block.getIn(["data", "columns"]));
          var rows = toArray(block.getIn(["data", "rows"]));
          return h(
            "table",
            { key: index },
            h(
              "thead",
              {},
              h(
                "tr",
                {},
                columns.map(function (column, columnIndex) {
                  return h("th", { key: columnIndex }, String(column));
                }),
              ),
            ),
            h(
              "tbody",
              {},
              rows.map(function (row, rowIndex) {
                var cells = toArray(row);
                return h(
                  "tr",
                  { key: rowIndex },
                  cells.map(function (cell, cellIndex) {
                    return h("td", { key: cellIndex }, String(cell));
                  }),
                );
              }),
            ),
          );
        }
        return h("div", { key: index });
      });

      return h(
        "article",
        { className: "decap-preview" },
        draft
          ? h(
              "p",
              { className: "decap-preview-draft" },
              "Черновик. Это предпросмотр внутри редактора, не адрес на сайте.",
            )
          : null,
        h("h1", {}, title),
        body,
      );
    },
  });

  window.CMS.registerPreviewStyle("/admin/preview.css");
  window.CMS.registerPreviewTemplate("posts", PostPreview);
})();
