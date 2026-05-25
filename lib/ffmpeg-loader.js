import { FFmpeg } from "@ffmpeg/ffmpeg";

const CORE_BASE = "/ffmpeg";
const WORKER_PATH = "/ffmpeg/worker/worker.js";

let ffmpegInstance = null;
let loadPromise = null;

/** Nettoie worker + promesses (reload, bfcache). */
export function resetFFmpeg() {
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate();
    } catch {
      // ignore
    }
    ffmpegInstance = null;
  }
  loadPromise = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) resetFFmpeg();
  });
}

/**
 * Charge FFmpeg.wasm une seule fois (singleton + anti double-appel Strict Mode).
 */
export async function getFFmpeg({ onPhase, onProgress } = {}) {
  if (ffmpegInstance?.loaded) return ffmpegInstance;

  if (ffmpegInstance) resetFFmpeg();
  if (loadPromise) return loadPromise;

  const origin = window.location.origin;
  const loadConfig = {
    classWorkerURL: `${origin}${WORKER_PATH}`,
    coreURL: `${origin}${CORE_BASE}/ffmpeg-core.js`,
    wasmURL: `${origin}${CORE_BASE}/ffmpeg-core.wasm`,
  };

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();

    ffmpeg.on("log", ({ message }) => {
      console.log("[FFmpeg]", message);
    });

    onPhase?.("Initialisation du moteur…");
    onProgress?.(15);

    await ffmpeg.load(loadConfig);

    onProgress?.(100);
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    throw err;
  }
}

export function isFFmpegReady() {
  return ffmpegInstance?.loaded === true;
}
