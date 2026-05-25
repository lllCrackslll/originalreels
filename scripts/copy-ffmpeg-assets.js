/**
 * Copie les binaires FFmpeg (core + worker) dans /public/ffmpeg/
 * pour éviter le CDN et les problèmes de bundling Turbopack.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const coreSrc = path.join(root, "node_modules/@ffmpeg/core/dist/esm");
const workerSrc = path.join(root, "node_modules/@ffmpeg/ffmpeg/dist/esm");
const publicDir = path.join(root, "public/ffmpeg");
const workerDir = path.join(publicDir, "worker");

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

for (const file of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
  copyFile(path.join(coreSrc, file), path.join(publicDir, file));
}

for (const file of ["worker.js", "const.js", "errors.js"]) {
  copyFile(path.join(workerSrc, file), path.join(workerDir, file));
}

console.log("[copy-ffmpeg-assets] OK → public/ffmpeg/");
