// Utility for dynamic ambient gradient colors

export const DEFAULT_GRADIENT_COLOR = '#1E293B'; // Slate fallback
export const SOUNDWAVE_YELLOW = '#FFD60A';

const PRESET_PALETTES = [
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#DC2626', // Crimson
  '#D97706', // Amber
  '#7C3AED', // Purple
  '#2563EB', // Blue
  '#DB2777', // Pink
  '#0D9488', // Teal
  '#EA580C', // Orange
  '#0284C7', // Sky
];

/**
 * Derives a consistent, visually pleasing ambient color from a string (e.g. title or ID)
 */
export function getAmbientColorFromString(str: string): string {
  if (!str) return DEFAULT_GRADIENT_COLOR;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PRESET_PALETTES.length;
  return PRESET_PALETTES[index];
}

/**
 * Extracts a dominant vibrant color from an image URL in the browser
 */
export async function extractDominantColor(imageUrl?: string): Promise<string> {
  if (!imageUrl) return DEFAULT_GRADIENT_COLOR;

  // If running on server or in environment without window
  if (typeof window === 'undefined') {
    return getAmbientColorFromString(imageUrl);
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(getAmbientColorFromString(imageUrl));
            return;
          }
          canvas.width = 16;
          canvas.height = 16;
          ctx.drawImage(img, 0, 0, 16, 16);
          const data = ctx.getImageData(0, 0, 16, 16).data;

          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            // Avoid overly bright or pitch black pixels
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 25 && brightness < 235) {
              r += data[i];
              g += data[i + 1];
              b += data[i + 2];
              count++;
            }
          }

          if (count > 0) {
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);
            // Boost saturation slightly for ambient glow
            resolve(`rgb(${r}, ${g}, ${b})`);
          } else {
            resolve(getAmbientColorFromString(imageUrl));
          }
        } catch {
          // CORS error on canvas reading
          resolve(getAmbientColorFromString(imageUrl));
        }
      };

      img.onerror = () => {
        resolve(getAmbientColorFromString(imageUrl));
      };
    } catch {
      resolve(getAmbientColorFromString(imageUrl));
    }
  });
}
