import assert from "node:assert/strict";
import test from "node:test";
import { buildQrAsset } from "./qr";
import { EMPTY_UTM, buildUtmUrl, type UtmValues } from "./utm";

const sample = buildUtmUrl(
  "https://example.ru/catalog",
  {
    ...EMPTY_UTM,
    utm_source: "yandex",
    utm_medium: "cpc",
    utm_campaign: "{campaign_id}",
  } satisfies UtmValues,
  [],
);

test("builds a png data url and svg for a ready utm link", async () => {
  const asset = await buildQrAsset(sample);

  assert.ok(asset);
  assert.match(asset.pngDataUrl, /^data:image\/png;base64,[A-Za-z0-9+/=]+$/);
  assert.match(asset.svg, /<svg[\s>]/);

  const bytes = Buffer.from(asset.pngDataUrl.split(",")[1], "base64");
  assert.equal(bytes.subarray(0, 4).toString("hex"), "89504e47");
});

test("returns null when the result should not get a QR", async () => {
  assert.equal(await buildQrAsset(""), null);
  assert.equal(await buildQrAsset("example.ru/catalog"), null);
  assert.equal(await buildQrAsset("ftp://example.ru/file"), null);
});

test("two links do not share one picture", async () => {
  const other = await buildQrAsset("https://example.ru/other");
  const first = await buildQrAsset(sample);

  assert.ok(other);
  assert.ok(first);
  assert.notEqual(other.pngDataUrl, first.pngDataUrl);
});

test("gives up on a link that cannot fit into a QR", async () => {
  const huge = `https://example.ru/?q=${"a".repeat(8000)}`;
  assert.equal(await buildQrAsset(huge), null);
});
