import assert from "node:assert/strict";
import test from "node:test";
import {
  PNG_COPY_DOWNLOAD_HINT,
  PNG_COPY_FAILED_HINT,
  copyPngToClipboard,
  pngDataUrlToBlob,
  type ImageClipboard,
} from "./copy-png";

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const PNG_DATA_URL = `data:image/png;base64,${PNG_BASE64}`;

class FakeClipboardItem {
  readonly types: string[];
  private readonly data: Record<string, Blob | Promise<Blob>>;

  constructor(data: Record<string, Blob | Promise<Blob>>) {
    this.data = data;
    this.types = Object.keys(data);
  }

  async getType(type: string): Promise<Blob> {
    const value = this.data[type];
    if (!value) throw new Error(`missing ${type}`);
    const blob = await value;
    if (typeof blob === "string" || !(blob instanceof Blob)) {
      throw new Error("clipboard payload must be a blob");
    }
    return blob;
  }
}

function asClipboardItem(value: unknown): typeof ClipboardItem {
  return value as typeof ClipboardItem;
}

test("pngDataUrlToBlob returns an image/png blob", async () => {
  const blob = await pngDataUrlToBlob(PNG_DATA_URL);
  assert.equal(blob.type, "image/png");
  const bytes = Buffer.from(await blob.arrayBuffer());
  assert.equal(bytes.subarray(0, 4).toString("hex"), "89504e47");
});

test("writes an image/png blob and does not write a data url string", async () => {
  const written: FakeClipboardItem[] = [];
  let writeTextCalled = false;
  let downloaded = false;

  const clipboard = {
    write: async (items: ClipboardItem[]) => {
      assert.equal(items.length, 1);
      written.push(items[0] as unknown as FakeClipboardItem);
    },
    writeText: async () => {
      writeTextCalled = true;
    },
  };

  const outcome = await copyPngToClipboard(PNG_DATA_URL, {
    secureContext: true,
    clipboard,
    ClipboardItem: asClipboardItem(FakeClipboardItem),
    download: async () => {
      downloaded = true;
    },
  });

  assert.equal(outcome.status, "copied");
  assert.equal(outcome.hint, "");
  assert.equal(writeTextCalled, false);
  assert.equal(downloaded, false);
  assert.deepEqual(written[0]?.types, ["image/png"]);

  const blob = await written[0].getType("image/png");
  assert.equal(blob.type, "image/png");
  const bytes = Buffer.from(await blob.arrayBuffer());
  assert.equal(bytes.subarray(0, 4).toString("hex"), "89504e47");
  assert.equal(bytes.toString("utf8").includes("data:image"), false);
});

test("starts clipboard.write before the png blob settles", async () => {
  let resolveBlob: (blob: Blob) => void = () => {};
  const pending = new Promise<Blob>((resolve) => {
    resolveBlob = resolve;
  });
  let writeStarted = false;

  const outcomePromise = copyPngToClipboard(PNG_DATA_URL, {
    secureContext: true,
    toBlob: () => pending,
    clipboard: {
      write: async () => {
        writeStarted = true;
      },
    },
    ClipboardItem: asClipboardItem(FakeClipboardItem),
    download: async () => {
      throw new Error("should stay pending");
    },
  });

  await Promise.resolve();
  assert.equal(writeStarted, true);

  resolveBlob(await pngDataUrlToBlob(PNG_DATA_URL));
  assert.deepEqual(await outcomePromise, { status: "copied", hint: "" });
});

test("downloads the png when clipboard.write rejects", async () => {
  let downloaded = "";

  const outcome = await copyPngToClipboard(PNG_DATA_URL, {
    secureContext: true,
    clipboard: {
      write: async () => {
        throw new DOMException("denied", "NotAllowedError");
      },
    },
    ClipboardItem: asClipboardItem(FakeClipboardItem),
    download: async (dataUrl) => {
      downloaded = dataUrl;
    },
  });

  assert.equal(outcome.status, "downloaded");
  assert.equal(outcome.hint, PNG_COPY_DOWNLOAD_HINT);
  assert.equal(downloaded, PNG_DATA_URL);
});

test("downloads when the image clipboard is unavailable", async () => {
  const cases: Array<{
    name: string;
    options: Parameters<typeof copyPngToClipboard>[1];
  }> = [
    {
      name: "insecure context",
      options: {
        secureContext: false,
        clipboard: {
          write: async () => {
            throw new Error("should not be called");
          },
        },
        ClipboardItem: asClipboardItem(FakeClipboardItem),
      },
    },
    {
      name: "missing clipboard",
      options: {
        secureContext: true,
        clipboard: null,
        ClipboardItem: asClipboardItem(FakeClipboardItem),
      },
    },
    {
      name: "missing write",
      options: {
        secureContext: true,
        clipboard: {} as ImageClipboard,
        ClipboardItem: asClipboardItem(FakeClipboardItem),
      },
    },
    {
      name: "missing ClipboardItem",
      options: {
        secureContext: true,
        clipboard: {
          write: async () => {
            throw new Error("should not be called");
          },
        },
        ClipboardItem: undefined,
      },
    },
  ];

  class UnsupportedItem extends FakeClipboardItem {
    static supports(type: string) {
      return type !== "image/png";
    }
  }

  cases.push({
    name: "image/png not supported",
    options: {
      secureContext: true,
      clipboard: {
        write: async () => {
          throw new Error("should not be called");
        },
      },
      ClipboardItem: asClipboardItem(UnsupportedItem),
    },
  });

  for (const item of cases) {
    let downloaded = false;
    const outcome = await copyPngToClipboard(PNG_DATA_URL, {
      ...item.options,
      download: async () => {
        downloaded = true;
      },
    });

    assert.equal(outcome.status, "downloaded", item.name);
    assert.equal(outcome.hint, PNG_COPY_DOWNLOAD_HINT, item.name);
    assert.equal(downloaded, true, item.name);
  }
});

test("does not fail silently when the download fallback throws", async () => {
  const outcome = await copyPngToClipboard(PNG_DATA_URL, {
    secureContext: false,
    download: async () => {
      throw new Error("disk full");
    },
  });

  assert.equal(outcome.status, "failed");
  assert.equal(outcome.hint, PNG_COPY_FAILED_HINT);
});

test("falls back instead of copying a non-png payload", async () => {
  let sawString = false;

  const outcome = await copyPngToClipboard("data:text/plain;base64,aGk=", {
    secureContext: true,
    clipboard: {
      write: async (items) => {
        const item = items[0] as unknown as FakeClipboardItem;
        for (const type of item.types) {
          const raw = (item as unknown as { data: Record<string, unknown> })
            .data[type];
          if (typeof raw === "string") sawString = true;
        }
        await item.getType("image/png");
      },
    },
    ClipboardItem: asClipboardItem(FakeClipboardItem),
    download: async () => {},
  });

  assert.equal(sawString, false);
  assert.equal(outcome.status, "downloaded");
  assert.equal(outcome.hint, PNG_COPY_DOWNLOAD_HINT);
});
