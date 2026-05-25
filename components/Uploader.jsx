"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg, resetFFmpeg, isFFmpegReady } from "@/lib/ffmpeg-loader";
import {
  buildFilterComplex,
  CAPTION_POSITIONS,
  CAPTION_STYLES,
  hasCaption,
  renderCaptionOverlayPng,
} from "@/lib/caption";
import { generateVariation, buildVariationFilters } from "@/lib/video-variation";
import { downloadAsZip } from "@/lib/download-zip";
import {
  Upload,
  Video,
  CheckSquare,
  Square,
  Loader2,
  Download,
  AlertCircle,
  X,
  Package,
} from "lucide-react";

const BATCH_MAX = 10;

const PROCESSING_OPTIONS = [
  {
    id: "metadata",
    label: "Nettoyer les métadonnées EXIF",
    description: "Supprime toutes les métadonnées identifiables (GPS, appareil, date…)",
    defaultEnabled: true,
  },
];

export default function Uploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [options, setOptions] = useState(
    Object.fromEntries(PROCESSING_OPTIONS.map((o) => [o.id, o.defaultEnabled]))
  );
  const [batchCount, setBatchCount] = useState(3);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [outputs, setOutputs] = useState([]);
  const [error, setError] = useState(null);
  const [preloading, setPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadLabel, setPreloadLabel] = useState("Préparation du moteur…");
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [captionPosition, setCaptionPosition] = useState("bottom");
  const [captionStyle, setCaptionStyle] = useState("white-black");
  const [zipping, setZipping] = useState(false);

  const fileInputRef = useRef(null);

  const revokeOutputs = useCallback((files) => {
    files.forEach((o) => URL.revokeObjectURL(o.url));
  }, []);

  const handleFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("video/")) {
        setError("Veuillez déposer un fichier vidéo valide (MP4, MOV…)");
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        setError("La vidéo ne doit pas dépasser 500 Mo.");
        return;
      }
      setError(null);
      setOutputs((prev) => {
        revokeOutputs(prev);
        return [];
      });
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    },
    [revokeOutputs]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);

  const toggleOption = (id) => {
    setOptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startPreload = useCallback((isCancelled = () => false) => {
    setPreloading(true);
    setFfmpegReady(false);
    setPreloadProgress(0);
    setPreloadLabel("Préparation du moteur…");
    setError(null);

    return getFFmpeg({
      onPhase: (label) => {
        if (!isCancelled()) setPreloadLabel(label);
      },
      onProgress: (p) => {
        if (!isCancelled()) setPreloadProgress(Math.min(100, Math.round(p)));
      },
    })
      .then(() => {
        if (isCancelled()) return;
        setFfmpegReady(true);
        setPreloading(false);
        setError(null);
      })
      .catch((err) => {
        if (isCancelled()) return;
        console.error("[OriginalReels] FFmpeg preload:", err);
        setPreloading(false);
        setError("Impossible de charger le moteur vidéo.");
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    const run = () => {
      if (!cancelled) startPreload(isCancelled);
    };
    run();

    const onPageShow = (event) => {
      if (event.persisted) {
        resetFFmpeg();
        run();
      }
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
      if (!isFFmpegReady()) resetFFmpeg();
    };
  }, [startPreload]);

  const buildExecArgs = (outputName, vFilters, speed, useCaption) => {
    const args = useCaption
      ? [
          "-i",
          "input.mp4",
          "-i",
          "caption.png",
          "-filter_complex",
          buildFilterComplex(vFilters, captionPosition),
          "-map",
          "[outv]",
          "-map",
          "0:a?",
        ]
      : ["-i", "input.mp4"];

    if (!useCaption && vFilters.length > 0) {
      args.push("-vf", vFilters.join(","));
    }

    args.push("-af", `atempo=${speed.toFixed(4)}`);

    if (options.metadata) {
      args.push("-map_metadata", "-1");
      args.push("-metadata", "encoder=");
    }

    args.push(
      "-c:v",
      "libx264",
      "-crf",
      "20",
      "-preset",
      "ultrafast",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-movflags",
      "+faststart",
      outputName
    );

    return args;
  };

  const processPack = async () => {
    if (!videoFile) return;
    setProcessing(true);
    setProgress(0);
    setProgressLabel("Chargement du moteur…");
    setError(null);
    setOutputs((prev) => {
      revokeOutputs(prev);
      return [];
    });

    const total = batchCount;
    const baseName = videoFile.name.replace(/\.[^.]+$/, "");
    const useCaption = hasCaption(captionText);
    const newOutputs = [];

    try {
      const ffmpeg = await getFFmpeg({
        onPhase: setProgressLabel,
        onProgress: (p) => setProgress(Math.round(p * 0.08)),
      });

      setProgressLabel("Lecture du fichier source…");
      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
      setProgress(10);

      if (useCaption) {
        setProgressLabel("Préparation du texte d'accroche…");
        const captionPng = await renderCaptionOverlayPng(
          captionText,
          captionStyle
        );
        if (!captionPng) {
          throw new Error("Impossible de générer le texte d'accroche.");
        }
        await ffmpeg.writeFile("caption.png", captionPng);
      }

      for (let i = 1; i <= total; i++) {
        setProgressLabel(`Génération de la version ${i} sur ${total}…`);
        setProgress(Math.round(10 + ((i - 1) / total) * 85));

        const variation = generateVariation();
        const { filters, speed } = buildVariationFilters(variation);
        const outputName = `output_${i}.mp4`;

        await ffmpeg.exec(
          buildExecArgs(outputName, filters, speed, useCaption)
        );

        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([data], { type: "video/mp4" });
        newOutputs.push({
          name: `originalreels_v${i}_${baseName}.mp4`,
          url: URL.createObjectURL(blob),
          blob,
        });

        await ffmpeg.deleteFile(outputName);
        setProgress(Math.round(10 + (i / total) * 85));
      }

      await ffmpeg.deleteFile("input.mp4");
      if (useCaption) {
        try {
          await ffmpeg.deleteFile("caption.png");
        } catch {
          // ignore
        }
      }

      setOutputs(newOutputs);
      setProgress(100);
      setProgressLabel(
        total === 1
          ? "Vidéo générée !"
          : `Pack terminé — ${total} déclinaisons prêtes`
      );
    } catch (err) {
      console.error(err);
      setError(
        "Une erreur est survenue pendant le traitement. Essayez avec Chrome ou Edge à jour."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (outputs.length === 0) return;
    setZipping(true);
    try {
      const baseName = videoFile?.name.replace(/\.[^.]+$/, "") || "pack";
      await downloadAsZip(
        outputs.map((o) => ({ name: o.name, blob: o.blob })),
        `originalreels_${baseName}_pack.zip`
      );
    } catch (err) {
      console.error(err);
      setError("Impossible de créer l'archive ZIP.");
    } finally {
      setZipping(false);
    }
  };

  const reset = () => {
    setOutputs((prev) => {
      revokeOutputs(prev);
      return [];
    });
    setVideoFile(null);
    setVideoPreview(null);
    setProgress(0);
    setProgressLabel("");
    setError(null);
    setCaptionText("");
    setCaptionPosition("bottom");
    setCaptionStyle("white-black");
    setBatchCount(3);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasResults = outputs.length > 0;

  return (
    <div className="w-full">
      <div className="w-full">
        {!videoFile ? (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-16
              flex flex-col items-center justify-center gap-4 transition-all duration-300
              ${
                isDragging
                  ? "border-orange-400 bg-orange-50 drop-glow-active"
                  : "border-gray-200 dark:border-zinc-700 hover:border-orange-300 hover:bg-orange-50/30 drop-glow"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDragging ? "bg-orange-100" : "bg-gray-100"
              }`}
            >
              <Upload
                className={`w-7 h-7 transition-colors duration-300 ${
                  isDragging ? "text-orange-500" : "text-gray-400"
                }`}
              />
            </div>

            <div className="text-center">
              <p className="text-base font-semibold text-black dark:text-white mb-1">
                {isDragging ? "Relâchez pour uploader" : "Glissez votre vidéo ici"}
              </p>
              <p className="text-sm text-gray-400">
                ou{" "}
                <span className="text-orange-500 font-medium underline underline-offset-2">
                  cliquez pour sélectionner
                </span>
              </p>
            </div>

            <p className="text-xs text-gray-300 mt-2">MP4, MOV, AVI · 500 Mo max</p>
            <p className="text-xs text-gray-300 mt-0.5">
              Recommandé : Chrome ou Edge · Safari partiellement supporté
            </p>

            {preloading && (
              <div className="w-full max-w-xs mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1 max-w-[70%] truncate">
                    <Loader2 className="w-3 h-3 animate-spin text-orange-400 flex-shrink-0" />
                    {preloadLabel}
                  </span>
                  <span className="tabular-nums text-orange-400">{preloadProgress}%</span>
                </div>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-300 transition-all duration-300"
                    style={{ width: `${preloadProgress}%` }}
                  />
                </div>
              </div>
            )}
            {ffmpegReady && (
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Moteur prêt — traitement instantané
              </p>
            )}
            {error && !videoFile && (
              <div className="w-full max-w-sm mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-600 text-left">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-black aspect-video">
              <video
                src={videoPreview}
                className="w-full h-full object-contain"
                controls
                muted
              />
              <button
                onClick={reset}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 rounded-lg">
                <Video className="w-3 h-3 text-orange-400" />
                <span className="text-white text-xs font-medium">{videoFile.name}</span>
              </div>
            </div>

            {/* Nombre de déclinaisons */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-black dark:text-white">
                  Nombre de déclinaisons uniques
                </h3>
                <span className="text-2xl font-bold text-orange-500 tabular-nums">
                  {batchCount}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Chaque version aura une empreinte différente (vitesse, zoom, miroir, couleurs).
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: BATCH_MAX }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={processing}
                    onClick={() => setBatchCount(n)}
                    className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                      batchCount === n
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
              <div>
                <label
                  htmlFor="caption-text"
                  className="text-sm font-semibold text-black dark:text-white block mb-1.5"
                >
                  Texte d&apos;accroche (Caption)
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Appliqué sur toutes les versions du pack. Laissé vide = aucun texte.
                </p>
                <textarea
                  id="caption-text"
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  placeholder="Ex : Tu ne vas pas croire ce hack…"
                  maxLength={120}
                  rows={2}
                  disabled={processing}
                  className="w-full resize-none rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/80 px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-shadow disabled:opacity-60"
                />
                <p className="text-xs text-gray-300 mt-1.5 text-right tabular-nums">
                  {captionText.length}/120
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Position
                </span>
                <div className="mt-2 flex gap-2">
                  {CAPTION_POSITIONS.map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      disabled={processing}
                      onClick={() => setCaptionPosition(pos.id)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                        captionPosition === pos.id
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Style
                </span>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CAPTION_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      disabled={processing}
                      onClick={() => setCaptionStyle(style.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 disabled:opacity-50 ${
                        captionStyle === style.id
                          ? "border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-950/50 ring-1 ring-orange-400/30 dark:ring-orange-500/30"
                          : "border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold ${style.sampleClass}`}
                      >
                        Aa
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          captionStyle === style.id
                            ? "text-gray-900 dark:text-orange-100"
                            : "text-gray-600 dark:text-zinc-400"
                        }`}
                      >
                        {style.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-black dark:text-white mb-4 uppercase tracking-wider">
                Options du pack
              </h3>
              <div className="space-y-4">
                {PROCESSING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    disabled={processing}
                    className="w-full flex items-start gap-3 text-left group disabled:opacity-50"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {options[opt.id] ? (
                        <CheckSquare className="w-5 h-5 text-orange-500" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium transition-colors ${
                          options[opt.id] ? "text-black dark:text-white" : "text-gray-400"
                        }`}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {processing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                    {progressLabel}
                  </span>
                  <span className="text-orange-500 font-semibold tabular-nums">
                    {progress}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full progress-shimmer transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {hasResults && (
              <div className="space-y-4">
                <div className="p-5 bg-green-50 border border-green-100 rounded-2xl">
                  <p className="text-sm font-semibold text-green-800">
                    {outputs.length === 1
                      ? "1 vidéo générée"
                      : `${outputs.length} vidéos générées`}
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Empreintes uniques — prêtes à poster sur plusieurs comptes.
                  </p>
                  {outputs.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadZip}
                      disabled={zipping}
                      className="btn-glow mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold rounded-xl transition-all duration-200"
                    >
                      {zipping ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                      Télécharger tout le pack (.zip)
                    </button>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {outputs.map((out, idx) => (
                    <a
                      key={out.name}
                      href={out.url}
                      download={out.name}
                      className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-black dark:text-white truncate">
                        Version {idx + 1}
                      </span>
                      <Download className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!hasResults && (
              <button
                onClick={processPack}
                disabled={processing}
                className="btn-glow w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Génération du pack…
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Générer le pack
                    {batchCount > 1 && (
                      <span className="opacity-80 font-normal">
                        ({batchCount} versions)
                      </span>
                    )}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
