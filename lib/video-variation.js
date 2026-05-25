/**
 * Génère des paramètres aléatoires pour une déclinaison vidéo unique.
 */

export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function generateVariation() {
  return {
    speed: randomBetween(0.96, 1.05),
    zoom: randomBetween(1.02, 1.06),
    mirror: Math.random() < 0.5,
    brightness: randomBetween(-0.02, 0.03),
    saturation: randomBetween(0.98, 1.05),
    contrast: randomBetween(0.99, 1.04),
  };
}

/** Chaîne de filtres vidéo pour une variation donnée */
export function buildVariationFilters(variation) {
  const filters = [];
  const z = variation.zoom.toFixed(4);

  if (variation.mirror) filters.push("hflip");

  filters.push(
    `scale=iw*${z}:ih*${z},crop=iw/${z}:ih/${z}:(iw-iw/${z})/2:(ih-ih/${z})/2`
  );

  filters.push(
    `eq=brightness=${variation.brightness.toFixed(3)}:saturation=${variation.saturation.toFixed(3)}:contrast=${variation.contrast.toFixed(3)}`
  );

  filters.push(`setpts=PTS/${variation.speed.toFixed(4)}`);

  return { filters, speed: variation.speed };
}
