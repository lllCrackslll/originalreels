/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      /**
       * COOP + COEP — obligatoires pour FFmpeg.wasm (SharedArrayBuffer).
       *
       * ⚠️  Appliqués UNIQUEMENT sur /dashboard/* :
       *     Ces headers bloquent l'iframe de restauration de session Firebase Auth
       *     (qui pointe vers accounts.google.com). Les appliquer globalement
       *     empêcherait la connexion/inscription de fonctionner.
       *
       * Vercel les injectera automatiquement sur chaque réponse HTML du dashboard.
       */
      {
        source: "/dashboard/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy",  value: "same-origin"    },
          /**
           * "credentialless" active SharedArrayBuffer sans bloquer les ressources
           * tierces (Firebase Auth, Google Fonts…) qui n'ont pas de header CORP.
           * Supporté sur Chrome 96+, Firefox 119+, Edge 96+.
           * "require-corp" était trop strict et cassait Firebase.
           */
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
