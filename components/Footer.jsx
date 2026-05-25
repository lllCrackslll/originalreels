"use client";

import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-black">OriginalReels</span>
        </div>

        <p className="text-xs text-gray-400 text-center">
          © 2026 OriginalReels · Traitement vidéo 100% local · Anti-shadowban
        </p>

        <div className="flex items-center gap-5">
          {["Confidentialité", "CGU", "Contact"].map((item) => (
            <button
              key={item}
              className="text-xs text-gray-400 hover:text-black transition-colors duration-200"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
