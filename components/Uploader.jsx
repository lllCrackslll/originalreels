"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg } from "@/lib/ffmpeg-loader";
import {
  Upload,
  Video,
  CheckSquare,
  Square,
  Loader2,
  Download,
  AlertCircle,
  X,
} from "lucide-react";

const PROCESSING_OPTIONS = [
  {
    id: "metadata",
    label: "Nettoyer les métadonnées EXIF",
    description: "Supprime toutes les métadonnées identifiables (GPS, appareil, date…)",
    defaultEnabled: true,
  },
  {
    id: "mirror",
    label: "Inversion Miroir (Pixels)",
    description: "Retournement horizontal — brise le hash perceptuel de la vidéo",
    defaultEnabled: true,
  },
  {
    id: "retiming",
    label: "Retiming Imperceptible (×1.04)",
    description: "Légère accélération + micro-coupes pour modifier la signature temporelle",
    defaultEnabled: true,
  },
  {
    id: "color",
    label: "Ajustement colorimétrique profond",
    description: "Rééquilibrage d'histogramme imperceptible qui modifie le hash couleur",
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
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [outputUrl, setOutputUrl] = useState(null);
  const [error, setError] = useState(null);
  // Pré-chargement en arrière-plan
  const [preloading, setPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadLabel, setPreloadLabel] = useState("Préparation du moteur…");
  const [ffmpegReady, setFfmpegReady] = useState(false);

  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("video/")) {
      setError("Veuillez déposer un fichier vidéo valide (MP4, MOV…)");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("La vidéo ne doit pas dépasser 500 Mo.");
      return;
    }
    setError(null);
    setOutputUrl(null);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
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

  // Pré-chargement silencieux dès le montage du composant
  useEffect(() => {
    let cancelled = false;
    setPreloading(true);

    getFFmpeg({
      onPhase: (label) => { if (!cancelled) setPreloadLabel(label); },
      onProgress: (p) => { if (!cancelled) setPreloadProgress(Math.min(100, Math.round(p))); },
    })
      .then(() => {
        if (!cancelled) {
          setFfmpegReady(true);
          setPreloading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[OriginalReels] FFmpeg preload:", err);
          setPreloading(false);
          setError(err?.message || "Impossible de charger le moteur vidéo.");
        }
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFFmpeg = async () =>
    getFFmpeg({
      onPhase: (label) => setProgressLabel(label),
      onProgress: (p) => setProgress(Math.round((p / 100) * 35)),
    });

  const buildFilterChain = () => {
    const filters = [];
    if (options.mirror) filters.push("hflip");
    if (options.color) filters.push("eq=brightness=0.01:saturation=1.02:contrast=1.01");
    if (options.retiming) {
      // Retiming géré via setpts dans la vidéo et atempo dans l'audio
    }
    return filters;
  };

  const processVideo = async () => {
    if (!videoFile) return;
    setProcessing(true);
    setProgress(0);
    setProgressLabel("Chargement de FFmpeg.wasm…");
    setError(null);
    setOutputUrl(null);

    try {
      const ffmpeg = await loadFFmpeg();
      setProgress(37);
      setProgressLabel("Lecture du fichier vidéo…");

      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
      setProgress(40);

      // Construction des arguments FFmpeg
      const args = ["-i", "input.mp4"];

      // Filtres vidéo
      const vFilters = buildFilterChain();

      if (options.retiming) {
        // setpts pour vidéo (1/1.04 = ralentit la timeline → accélère)
        vFilters.push("setpts=PTS/1.04");
      }

      if (vFilters.length > 0) {
        args.push("-vf", vFilters.join(","));
      }

      // Filtres audio si retiming
      if (options.retiming) {
        args.push("-af", "atempo=1.04");
      }

      // Suppression des métadonnées
      if (options.metadata) {
        args.push("-map_metadata", "-1");
        args.push("-metadata", "encoder=");
      }

      // ultrafast = 3x plus rapide que fast, qualité quasi-identique pour les Reels
      args.push("-c:v", "libx264", "-crf", "20", "-preset", "ultrafast");
      args.push("-c:a", "aac", "-b:a", "192k");
      args.push("-movflags", "+faststart");
      args.push("output.mp4");

      setProgressLabel("Traitement en cours…");
      setProgress(30);

      await ffmpeg.exec(args);

      setProgress(90);
      setProgressLabel("Finalisation du fichier…");

      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);

      // Nettoyage
      await ffmpeg.deleteFile("input.mp4");
      await ffmpeg.deleteFile("output.mp4");

      setProgress(100);
      setProgressLabel("Traitement terminé !");
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue pendant le traitement. Essayez avec Chrome ou Edge à jour.");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setOutputUrl(null);
    setProgress(0);
    setProgressLabel("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div className="w-full">

        {/* Drag & Drop Zone */}
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
                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 drop-glow"
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
              <p className="text-base font-semibold text-black mb-1">
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

            {/* Indicateur pré-chargement FFmpeg */}
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
          /* Vidéo chargée — affichage aperçu + options */
          <div className="space-y-6">
            {/* Aperçu vidéo */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-black aspect-video">
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

            {/* Options de traitement */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">
                Transformations à appliquer
              </h3>
              <div className="space-y-4">
                {PROCESSING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className="w-full flex items-start gap-3 text-left group"
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
                          options[opt.id] ? "text-black" : "text-gray-400"
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

            {/* Barre de progression */}
            {processing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                    {progressLabel}
                  </span>
                  <span className="text-orange-500 font-semibold tabular-nums">{progress}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full progress-shimmer transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Résultat téléchargeable */}
            {outputUrl && (
              <div className="p-5 bg-green-50 border border-green-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-green-800">Vidéo prête !</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Empreinte modifiée — prête à poster sur un nouveau compte.
                  </p>
                </div>
                <a
                  href={outputUrl}
                  download={`originalreels_${videoFile.name}`}
                  className="btn-glow w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </a>
              </div>
            )}

            {/* Bouton CTA principal */}
            {!outputUrl && (
              <button
                onClick={processVideo}
                disabled={processing}
                className="btn-glow w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Génération en cours…
                  </>
                ) : (
                  "Générer la vidéo originale"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
