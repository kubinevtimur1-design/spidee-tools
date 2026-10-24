export const PNG_COPY_DOWNLOAD_HINT =
  "Буфер не принял картинку — скачал PNG.";

export const PNG_COPY_FAILED_HINT =
  "Не вышло скопировать PNG. Нажми «Скачать PNG».";

export type CopyPngResult =
  | { status: "copied"; hint: "" }
  | { status: "downloaded"; hint: string }
  | { status: "failed"; hint: string };

export type ImageClipboard = {
  write: (items: ClipboardItem[]) => Promise<void>;
};

export type CopyPngOptions = {
  clipboard?: ImageClipboard | null;
  ClipboardItem?: typeof ClipboardItem;
  secureContext?: boolean;
  toBlob?: (dataUrl: string) => Promise<Blob>;
  download?: (dataUrl: string) => Promise<void> | void;
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

function assertPngBlob(blob: Blob): Blob {
  if (!(blob instanceof Blob) || blob.type !== "image/png") {
    throw new Error("expected image/png blob");
  }
  return blob;
}

/** Собирает PNG-blob из data URL. Строку в буфер не кладём. */
export async function pngDataUrlToBlob(dataUrl: string): Promise<Blob> {
  const trimmed = dataUrl.trim();
  const marker = ";base64,";
  const markerIndex = trimmed.indexOf(marker);

  if (
    !trimmed.toLowerCase().startsWith("data:image/png") ||
    markerIndex === -1
  ) {
    throw new Error("not a png data url");
  }

  const binary = atob(trimmed.slice(markerIndex + marker.length));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index) & 0xff;
  }

  const isPng = PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
  if (!isPng) {
    throw new Error("not a png");
  }

  return new Blob([bytes], { type: "image/png" });
}

function readClipboardItem(
  override: typeof ClipboardItem | undefined,
): typeof ClipboardItem | null {
  if (override) return override;

  const ctor = (globalThis as { ClipboardItem?: typeof ClipboardItem })
    .ClipboardItem;
  return typeof ctor === "function" ? ctor : null;
}

function imagePngSupported(Item: typeof ClipboardItem): boolean {
  const supports = (Item as { supports?: (type: string) => boolean }).supports;
  if (typeof supports !== "function") return true;

  try {
    return supports.call(Item, "image/png") === true;
  } catch {
    return false;
  }
}

function canWritePng(options: CopyPngOptions): {
  clipboard: ImageClipboard;
  ClipboardItem: typeof ClipboardItem;
} | null {
  const secure =
    options.secureContext ??
    (typeof window !== "undefined" && window.isSecureContext === true);
  if (!secure) return null;

  const clipboard =
    options.clipboard === undefined
      ? typeof navigator === "undefined"
        ? null
        : navigator.clipboard
      : options.clipboard;
  if (!clipboard || typeof clipboard.write !== "function") return null;

  const Item = readClipboardItem(options.ClipboardItem);
  if (!Item || !imagePngSupported(Item)) return null;

  return { clipboard, ClipboardItem: Item };
}

async function fallback(
  dataUrl: string,
  download: CopyPngOptions["download"],
): Promise<CopyPngResult> {
  if (!download) {
    return { status: "failed", hint: PNG_COPY_FAILED_HINT };
  }

  try {
    await download(dataUrl);
    return { status: "downloaded", hint: PNG_COPY_DOWNLOAD_HINT };
  } catch {
    return { status: "failed", hint: PNG_COPY_FAILED_HINT };
  }
}

/**
 * Кладёт QR в буфер как image/png через ClipboardItem.
 * Если записать картинку нельзя — скачивает PNG и возвращает короткую подсказку.
 */
export async function copyPngToClipboard(
  pngDataUrl: string,
  options: CopyPngOptions = {},
): Promise<CopyPngResult> {
  const writer = canWritePng(options);
  if (!writer) {
    return fallback(pngDataUrl, options.download);
  }

  const toBlob = options.toBlob ?? pngDataUrlToBlob;

  try {
    const blobPromise = toBlob(pngDataUrl).then(assertPngBlob);
    const item = new writer.ClipboardItem({
      "image/png": blobPromise,
    });
    await Promise.all([writer.clipboard.write([item]), blobPromise]);
    return { status: "copied", hint: "" };
  } catch {
    return fallback(pngDataUrl, options.download);
  }
}
