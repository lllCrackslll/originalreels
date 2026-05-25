/**
 * Mot-symbole OriginalReels — sans icône, "Reels" en orange.
 */
export default function LogoWordmark({ className = "text-xl" }) {
  return (
    <span className={`font-semibold tracking-tight ${className}`}>
      <span className="text-black dark:text-white">Original</span>
      <span className="text-orange-500">Reels</span>
    </span>
  );
}
