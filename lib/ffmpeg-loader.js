import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const CORE_BASE = "/ffmpeg";
const WORKER_PATH = "/ffmpeg/worker/worker.js";
const LOAD_TIMEOUT_MS = 90_000;

let ffmpegInstance = null;
let loadPromise = null;

/**
 * Charge FFmpeg.wasm une seule fois (singleton + anti double-appel Strict Mode).
 * Utilise un worker statique dans /public pour contourner le bug Turbopack.
 */
export async function getFFmpeg({ onPhase, onProgress } = {}) {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const ffmpeg = new FFmpeg();

    ffmpeg.on("log", ({ message }) => {
      console.log("[FFmpeg]", message);
    });

    onPhase?.("Téléchargement du moteur (~31 Mo)…");
    onProgress?.(10);

    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(`${origin}${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      toBlobURL(`${origin}${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    ]);

    onPhase?.("Initialisation WASM…");
    onProgress?.(75);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);

    try {
      await ffmpeg.load(
        {
          classWorkerURL: `${origin}${WORKER_PATH}`,
          coreURL,
          wasmURL,
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    onProgress?.(100);
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    if (err?.name === "AbortError") {
      throw new Error(
        "Le chargement du moteur a expiré (90 s). Rechargez la page."
      );
    }
    throw err;
  }
}

export function isFFmpegReady() {
  return ffmpegInstance !== null;
}
