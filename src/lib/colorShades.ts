/**
 * Intelligent Color Shade Mapping & Formatting Engine for E-Commerce Variations
 */

export function isColorAttribute(attrName: string): boolean {
  if (!attrName) return false;
  const n = attrName.toLowerCase();
  return (
    n.includes("color") ||
    n.includes("colour") ||
    n.includes("shade") ||
    n.includes("finish") ||
    n.includes("stain") ||
    n.includes("fabric") ||
    n.includes("linen") ||
    n.includes("velvet") ||
    n.includes("tint")
  );
}

/**
 * Returns a high-fidelity hex color code for any shade name.
 */
export function getColorHex(colorName: string, fallbackColorCode?: string | null): string {
  if (fallbackColorCode && fallbackColorCode.startsWith("#")) {
    return fallbackColorCode;
  }
  if (!colorName) return "#94A3B8";

  const clean = colorName.trim().toLowerCase();

  const colorMap: Record<string, string> = {
    // Greens
    "midnight emerald": "#064E3B",
    "forest green": "#14532D",
    "sage green": "#9CA38F",
    "olive green": "#556B2F",
    emerald: "#059669",
    olive: "#65A30D",
    mint: "#6EE7B7",
    pine: "#1B4D3E",
    moss: "#8A9A5B",
    green: "#16A34A",

    // Reds & Warm Tones
    crimson: "#991B1B",
    ruby: "#BE123C",
    burgundy: "#800020",
    wine: "#722F37",
    terracotta: "#C2410C",
    rust: "#9A3412",
    maroon: "#800000",
    brick: "#B91C1C",
    red: "#DC2626",

    // Blues
    "royal sapphire": "#1E3A8A",
    "midnight navy": "#0F172A",
    navy: "#1E3A8A",
    sapphire: "#1D4ED8",
    "sky blue": "#38BDF8",
    teal: "#0D9488",
    indigo: "#4338CA",
    cyan: "#06B6D4",
    denim: "#1E40AF",
    ocean: "#0284C7",
    blue: "#2563EB",

    // Whites & Creams
    "warm white": "#FAF7F2",
    "pearl white": "#F9F9F6",
    "chalk off-white": "#F1F5F9",
    "alabaster white": "#F5F5EC",
    "nordic satin white": "#F8FAFC",
    "off white": "#F5F5F0",
    "warm ivory": "#FDFCF0",
    ivory: "#FFFFF0",
    cream: "#FFFDD0",
    chalk: "#F1F5F9",
    white: "#FFFFFF",

    // Greys & Charcoals
    "slate charcoal": "#334155",
    "graphite grey": "#3C3D42",
    "charcoal grey": "#374151",
    "charcoal bronze": "#27272A",
    "charcoal fleck": "#374151",
    "mist grey": "#CBD5E1",
    "slate grey": "#64748B",
    "cool grey": "#94A3B8",
    "stone grey": "#94A3B8",
    anthracite: "#293241",
    charcoal: "#1E293B",
    "jet black": "#18181B",
    black: "#0F172A",
    grey: "#94A3B8",
    gray: "#94A3B8",

    // Beiges, Browns & Wood Stains
    "oatmeal beige": "#D6CFC7",
    "natural oatmeal": "#E6DFD5",
    "desert sand": "#D2B48C",
    "earth taupe": "#8B8589",
    "natural flax": "#E2DACD",
    "natural honey oak": "#C89D7C",
    "dark walnut": "#4A3728",
    walnut: "#4A3525",
    oak: "#C19A6B",
    wood: "#8B5A2B",
    espresso: "#362B28",
    chocolate: "#3E2723",
    sand: "#E2D9C8",
    taupe: "#8B8589",
    beige: "#D4C5B9",
    tan: "#D2B48C",
    khaki: "#C3B091",
    brown: "#78350F",

    // Yellows & Golds
    gold: "#D4AF37",
    mustard: "#CA8A04",
    amber: "#F59E0B",
    yellow: "#EAB308",

    // Oranges & Corals
    orange: "#EA580C",
    coral: "#F43F5E",
    peach: "#FDBA74",

    // Pinks & Purples
    rose: "#FB7185",
    blush: "#FBCFE8",
    pink: "#EC4899",
    plum: "#581C87",
    lavender: "#C084FC",
    violet: "#7C3AED",
    purple: "#9333EA",
  };

  if (colorMap[clean]) return colorMap[clean];

  for (const [key, hex] of Object.entries(colorMap)) {
    if (clean.includes(key)) return hex;
  }

  return "#94A3B8";
}

/**
 * Format raw markdown or HTML from the database into clean, beautiful HTML paragraphs and headings.
 */
export function formatDescriptionHtml(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "";

  const trimmed = raw.trim();

  // If already contains HTML tags like <p>, <h3>, <ul>, etc., return as is
  if (/<(p|div|h[1-6]|ul|ol|table|blockquote|br)[^>]*>/i.test(trimmed)) {
    return trimmed;
  }

  // Convert markdown to clean HTML
  let formatted = trimmed;

  // Headings: ### Heading
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3 style="font-size: 1.15rem; font-weight: 700; color: #0F172A; margin: 16px 0 8px 0;">$1</h3>');
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2 style="font-size: 1.3rem; font-weight: 700; color: #0F172A; margin: 18px 0 10px 0;">$1</h2>');

  // Bold text: **text**
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic text: *text*
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Checkmark lists / Bullet points
  const lines = formatted.split(/\r?\n/);
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      continue;
    }

    if (trimmedLine.startsWith("✅") || trimmedLine.startsWith("•") || trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
      if (!inList) {
        result.push('<ul style="padding-left: 20px; margin: 10px 0; color: #475569;">');
        inList = true;
      }
      const itemText = trimmedLine.replace(/^[✅•\-\*]\s*/, "");
      result.push(`<li style="margin-bottom: 6px;">${itemText}</li>`);
    } else if (trimmedLine.startsWith("<h2") || trimmedLine.startsWith("<h3")) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push(trimmedLine);
    } else {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push(`<p style="margin-bottom: 12px; line-height: 1.7; color: #475569;">${trimmedLine}</p>`);
    }
  }

  if (inList) {
    result.push("</ul>");
  }

  return result.join("\n");
}
