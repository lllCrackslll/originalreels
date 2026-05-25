import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeScript from "@/components/ThemeScript";

export const metadata = {
  title: "OriginalReels · Multipliez vos Reels. Zéro Shadowban.",
  description:
    "Modifiez l'empreinte visuelle et les métadonnées de vos vidéos Reels/Shorts pour éviter les pénalités de contenu dupliqué sur Instagram. Traitement 100% local avec FFmpeg.wasm.",
  keywords: ["reels", "shadowban", "instagram", "dupliquer reels", "anti shadowban", "ffmpeg"],
  openGraph: {
    title: "OriginalReels · Multipliez vos Reels. Zéro Shadowban.",
    description: "Traitement vidéo anti-shadowban — 100% local, aucune donnée sur nos serveurs.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-white dark:bg-zinc-950 antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
