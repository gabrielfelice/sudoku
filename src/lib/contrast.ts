/**
 * WCAG Contrast Validation Utilities
 * Ensures text is readable against background colors
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ContrastValidationResult {
  isValid: boolean;
  failedColors: Array<{ label: string; color: string; ratio: number }>;
  suggestedFixes: Array<{ color: string; suggested: string }>;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance (WCAG formula)
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standard (4.5:1)
 */
export function meetsWCAG_AA(bg: string, text: string): boolean {
  return getContrastRatio(bg, text) >= 4.5;
}

/**
 * Suggest black or white text based on background
 */
export function suggestTextColor(bg: string): string {
  const rgb = hexToRgb(bg);
  if (!rgb) return "#000000";

  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  return lum > 0.5 ? "#000000" : "#ffffff";
}

/**
 * Validate cell background against all text colors
 */
export function validateCellColors(
  cellBg: string,
  textColors: {
    givenNumberColor: string;
    correctNumberColor: string;
    wrongNumberColor: string;
  },
): ContrastValidationResult {
  const checks = [
    { label: "Números dados", color: textColors.givenNumberColor },
    { label: "Números corretos", color: textColors.correctNumberColor },
    { label: "Números errados", color: textColors.wrongNumberColor },
  ];

  const failedColors: Array<{ label: string; color: string; ratio: number }> =
    [];
  const suggestedFixes: Array<{ color: string; suggested: string }> = [];

  for (const check of checks) {
    const ratio = getContrastRatio(cellBg, check.color);
    if (ratio < 4.5) {
      failedColors.push({ ...check, ratio });
      suggestedFixes.push({
        color: check.color,
        suggested: suggestTextColor(cellBg),
      });
    }
  }

  return {
    isValid: failedColors.length === 0,
    failedColors,
    suggestedFixes,
  };
}
