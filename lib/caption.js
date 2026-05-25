/** Police Impact — servie depuis /public/fonts/ */
export const CAPTION_FONT_PATH = "/fonts/Impact.ttf";

export const CAPTION_POSITIONS = [
  { id: "top", label: "En haut" },
  { id: "bottom", label: "En bas" },
];

export const CAPTION_STYLES = [
  {
    id: "white-black",
    label: "Blanc · fond noir",
    sampleClass: "bg-black text-white font-impact rounded-xl",
  },
  {
    id: "black-orange",
    label: "Noir · fond orange",
    sampleClass: "bg-orange-500 text-black font-impact rounded-xl",
  },
];

const FONT_SIZE = 32;
const PAD_X = 20;
const PAD_Y = 14;
const BORDER_RADIUS = 14;

let impactFontLoaded = false;

async function ensureImpactFont() {
  if (impactFontLoaded || typeof document === "undefined") return;
  try {
    const face = new FontFace(
      "Impact",
      `url(${CAPTION_FONT_PATH}) format("truetype")`
    );
    await face.load();
    document.fonts.add(face);
    await document.fonts.ready;
    impactFontLoaded = true;
  } catch {
    // Fallback : le navigateur utilisera Impact système si dispo
    impactFontLoaded = true;
  }
}

/**
 * Génère un PNG transparent avec texte + cadre aux coins arrondis (Canvas).
 * @returns {Promise<Uint8Array|null>}
 */
export async function renderCaptionOverlayPng(text, styleId) {
  const trimmed = text?.trim();
  if (!trimmed || typeof document === "undefined") return null;

  await ensureImpactFont();

  const font = `${FONT_SIZE}px Impact, Haettenschweiler, sans-serif`;
  const measure = document.createElement("canvas").getContext("2d");
  measure.font = font;
  const textWidth = measure.measureText(trimmed).width;

  const width = Math.ceil(textWidth + PAD_X * 2);
  const height = Math.ceil(FONT_SIZE + PAD_Y * 2);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.font = font;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, BORDER_RADIUS);

  if (styleId === "black-orange") {
    ctx.fillStyle = "rgba(249, 115, 22, 0.92)";
    ctx.fill();
    ctx.fillStyle = "#000000";
  } else {
    ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(trimmed, width / 2, height / 2);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) return null;

  return new Uint8Array(await blob.arrayBuffer());
}

/** Indique si une caption doit être appliquée */
export function hasCaption(text) {
  return Boolean(text?.trim());
}

/**
 * Filtre overlay FFmpeg (coins arrondis via PNG).
 * @param {"top"|"bottom"} position
 */
export function buildCaptionOverlayExpr(position) {
  const y =
    position === "top"
      ? "main_h*0.08"
      : "main_h*0.88-h";
  return `x=(main_w-w)/2:y=${y}:format=auto`;
}

/**
 * Construit filter_complex : transformations vidéo + overlay caption.
 */
export function buildFilterComplex(vFilters, position) {
  const overlay = buildCaptionOverlayExpr(position);
  const chain =
    vFilters.length > 0 ? vFilters.join(",") : "copy";

  if (chain === "copy") {
    return `[0:v][1:v]overlay=${overlay}[outv]`;
  }
  return `[0:v]${chain}[v];[v][1:v]overlay=${overlay}[outv]`;
}
