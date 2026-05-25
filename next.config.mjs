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
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin"    },
          { key: "Cross-Origin-Embedder-Policy",  value: "require-corp"   },
          { key: "Cross-Origin-Resource-Policy",  value: "cross-origin"   },
        ],
      },
    ];
  },
};

export default nextConfig;
