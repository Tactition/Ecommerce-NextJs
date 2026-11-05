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
 * Green tick icon badge (styled emerald tick in subtle mint circular pill)
 */
export const GREEN_TICK_BADGE =
  '<span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background-color: #ECFDF5; border: 1.5px solid #10B981; color: #059669; border-radius: 50%; font-size: 11px; font-weight: 900; margin-right: 8px; vertical-align: middle; flex-shrink: 0;">✓</span>';

/**
 * Format raw markdown or HTML from the database into clean, beautiful HTML paragraphs and headings,
 * preserving green ticks, headings, lists, bold text, and images.
 */
export function formatDescriptionHtml(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "";

  let trimmed = raw.trim();

  // If already contains structural HTML tags like <p>, <h3>, <ul>, etc.
  if (/<(p|div|h[1-6]|ul|ol|table|blockquote|br)[^>]*>/i.test(trimmed)) {
    // Replace any raw ✅, ✔, ☑ with the visual green tick badge
    let html = trimmed.replace(
      /[✅✔☑]/g,
      GREEN_TICK_BADGE
    );

    // If markdown headings or bold are nested inside <p> or <div> from rich text paste, parse them
    html = html.replace(
      /(?:<p[^>]*>)?###\s+([^<\n\r]+)(?:<\/p>)?/gi,
      '<h3 style="font-size: 1.15rem; font-weight: 700; color: #0F172A; margin: 20px 0 8px 0; letter-spacing: -0.01em;">$1</h3>'
    );
    html = html.replace(
      /(?:<p[^>]*>)?##\s+([^<\n\r]+)(?:<\/p>)?/gi,
      '<h2 style="font-size: 1.3rem; font-weight: 700; color: #0F172A; margin: 24px 0 10px 0; letter-spacing: -0.015em;">$1</h2>'
    );
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    return html;
  }

  // Convert pure markdown or mixed text to clean HTML
  let formatted = trimmed;

  // Headings: ### Heading
  formatted = formatted.replace(
    /^###\s+(.+)$/gm,
    '<h3 style="font-size: 1.15rem; font-weight: 700; color: #0F172A; margin: 18px 0 8px 0; letter-spacing: -0.01em;">$1</h3>'
  );
  formatted = formatted.replace(
    /^##\s+(.+)$/gm,
    '<h2 style="font-size: 1.3rem; font-weight: 700; color: #0F172A; margin: 22px 0 10px 0; letter-spacing: -0.015em;">$1</h2>'
  );

  // Bold text: **text**
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic text: *text*
  formatted = formatted.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Line-by-line processing for lists, green ticks, and paragraphs
  const lines = formatted.split(/\r?\n/);
  const result: string[] = [];
  let inBulletList = false;
  let inCheckList = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      if (inBulletList || inCheckList) {
        result.push("</ul>");
        inBulletList = false;
        inCheckList = false;
      }
      continue;
    }

    // Check if line starts with a green tick icon: ✅, ✔, ✓, ☑
    const isCheckLine = /^[✅✔✓☑]/.test(trimmedLine);
    // Check if line starts with standard bullets: •, -, *
    const isBulletLine = !isCheckLine && /^[•\-\*]\s+/.test(trimmedLine);

    if (isCheckLine) {
      if (inBulletList) {
        result.push("</ul>");
        inBulletList = false;
      }
      if (!inCheckList) {
        result.push('<ul style="padding: 0; margin: 12px 0; list-style: none;">');
        inCheckList = true;
      }
      const itemText = trimmedLine.replace(/^[✅✔✓☑]\s*/, "");
      result.push(
        `<li style="list-style: none; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">` +
          `<span style="display: inline-flex; align-items: center; justify-content: center; width: 19px; height: 19px; background-color: #ECFDF5; border: 1.5px solid #10B981; color: #059669; border-radius: 50%; font-size: 11px; font-weight: 900; flex-shrink: 0; margin-top: 2px;">✓</span>` +
          `<span style="color: #334155; line-height: 1.6; font-size: 0.88rem;">${itemText}</span>` +
        `</li>`
      );
    } else if (isBulletLine) {
      if (inCheckList) {
        result.push("</ul>");
        inCheckList = false;
      }
      if (!inBulletList) {
        result.push('<ul style="padding-left: 20px; margin: 10px 0; color: #475569;">');
        inBulletList = true;
      }
      const itemText = trimmedLine.replace(/^[•\-\*]\s*/, "");
      result.push(`<li style="margin-bottom: 6px; font-size: 0.88rem; line-height: 1.6;">${itemText}</li>`);
    } else if (trimmedLine.startsWith("<h2") || trimmedLine.startsWith("<h3")) {
      if (inBulletList || inCheckList) {
        result.push("</ul>");
        inBulletList = false;
        inCheckList = false;
      }
      result.push(trimmedLine);
    } else {
      if (inBulletList || inCheckList) {
        result.push("</ul>");
        inBulletList = false;
        inCheckList = false;
      }
      // Replace inline ✅ if anywhere inside paragraph
      const styledParagraph = trimmedLine.replace(/[✅✔☑]/g, GREEN_TICK_BADGE);
      result.push(`<p style="margin-bottom: 12px; line-height: 1.7; color: #475569; font-size: 0.88rem;">${styledParagraph}</p>`);
    }
  }

  if (inBulletList || inCheckList) {
    result.push("</ul>");
  }

  return result.join("\n");
}

