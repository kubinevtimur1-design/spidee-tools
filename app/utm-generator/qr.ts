import QRCode from "qrcode";
import { shouldShowQr } from "./utm";

const QR_OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 4,
  width: 384,
  color: {
    dark: "#1d1d1fff",
    light: "#ffffffff",
  },
};

export type QrAsset = {
  pngDataUrl: string;
  svg: string;
};

export async function buildQrAsset(value: string): Promise<QrAsset | null> {
  if (!shouldShowQr(value)) return null;

  try {
    const pngDataUrl = await QRCode.toDataURL(value, QR_OPTIONS);
    const svg = await QRCode.toString(value, {
      ...QR_OPTIONS,
      type: "svg",
    });

    if (!pngDataUrl.startsWith("data:image/png;base64,")) return null;
    if (!svg.includes("<svg")) return null;

    return { pngDataUrl, svg };
  } catch {
    return null;
  }
}
