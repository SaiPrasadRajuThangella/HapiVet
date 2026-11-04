// Unsplash helper: serves resized, compressed, auto-format images from the CDN.
export const unsplash = (id, w = 1200, q = 70) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
