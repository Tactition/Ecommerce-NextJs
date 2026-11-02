/**
 * CATEGORY IMAGE GENERATOR & OPTIMIZER
 * 
 * IMPORTANT COMPLIANCE & USAGE NOTE:
 * Always review generated AI imagery for physical realism and confirm the AI provider's
 * commercial terms for e-commerce catalog use. Real on-site photos of actual atelier
 * installations consistently yield the highest customer trust and conversion rates.
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { SEED_CATEGORIES, SeedCategory } from "./category-seed-data";

const OUTPUT_DIR = path.join(process.cwd(), "public", "images", "categories");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export interface ImageResult {
  slug: string;
  heroPath: string;
  thumbPath: string;
  blurDataURL: string;
  isPlaceholder: boolean;
}

function createFallbackSvg(category: SeedCategory): Buffer {
  const svg = `
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <line x1="120" y1="280" x2="220" y2="280" stroke="#FF4035" stroke-width="4" stroke-linecap="round"/>
      <text x="120" y="240" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="4" fill="#94A3B8">WALL STREET INTERIORS</text>
      
      <text x="120" y="370" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="#FFFFFF">${category.name}</text>
      
      <text x="120" y="440" font-family="Arial, sans-serif" font-size="24" font-weight="400" fill="#CBD5E1">Architectural Window Treatments &amp; Bespoke Shading</text>
      
      <circle cx="1040" cy="660" r="60" fill="none" stroke="rgba(255,64,53,0.4)" stroke-width="2" />
      <text x="1040" y="666" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#FF4035">ATELIER</text>
    </svg>
  `;
  return Buffer.from(svg);
}

async function generateFromApi(category: SeedCategory, apiKey: string): Promise<Buffer | null> {
  const prompt = `Professional interior photography of ${category.promptDescription} installed on a window in a bright, modern ${category.room}, soft natural daylight, clean minimal styling, neutral color palette, photorealistic, sharp focus, wide composition with space on the left, no people, no text, no logos, no watermarks`;

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
        response_format: "b64_json",
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const b64 = data.data?.[0]?.b64_json;
    if (b64) {
      return Buffer.from(b64, "base64");
    }
  } catch (err) {
    // Fall back cleanly
  }
  return null;
}

export async function processCategoryImages(force = false): Promise<Record<string, ImageResult>> {
  const apiKey = process.env.IMAGE_API_KEY || process.env.OPENAI_API_KEY || "";
  const results: Record<string, ImageResult> = {};

  for (const cat of SEED_CATEGORIES) {
    const heroFilename = `${cat.slug}.webp`;
    const thumbFilename = `${cat.slug}-thumb.webp`;
    const heroFilePath = path.join(OUTPUT_DIR, heroFilename);
    const thumbFilePath = path.join(OUTPUT_DIR, thumbFilename);

    const publicHeroUrl = `/images/categories/${heroFilename}`;
    const publicThumbUrl = `/images/categories/${thumbFilename}`;

    if (!force && fs.existsSync(heroFilePath) && fs.existsSync(thumbFilePath)) {
      const blurBuffer = await sharp(heroFilePath).resize(16, 11).webp({ quality: 20 }).toBuffer();
      results[cat.slug] = {
        slug: cat.slug,
        heroPath: publicHeroUrl,
        thumbPath: publicThumbUrl,
        blurDataURL: `data:image/webp;base64,${blurBuffer.toString("base64")}`,
        isPlaceholder: false,
      };
      continue;
    }

    let sourceBuffer: Buffer | null = null;
    let isPlaceholder = false;

    if (apiKey) {
      sourceBuffer = await generateFromApi(cat, apiKey);
    }

    if (!sourceBuffer) {
      sourceBuffer = createFallbackSvg(cat);
      isPlaceholder = true;
    }

    const heroBuffer = await sharp(sourceBuffer)
      .resize(1200, 800, { fit: "cover", position: "center" })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    fs.writeFileSync(heroFilePath, heroBuffer);

    const thumbBuffer = await sharp(sourceBuffer)
      .resize(400, 300, { fit: "cover", position: "center" })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();
    fs.writeFileSync(thumbFilePath, thumbBuffer);

    const tinyBlurBuffer = await sharp(heroBuffer)
      .resize(16, 11)
      .webp({ quality: 20 })
      .toBuffer();
    const blurDataURL = `data:image/webp;base64,${tinyBlurBuffer.toString("base64")}`;

    results[cat.slug] = {
      slug: cat.slug,
      heroPath: publicHeroUrl,
      thumbPath: publicThumbUrl,
      blurDataURL,
      isPlaceholder,
    };
  }

  return results;
}

