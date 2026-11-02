import fs from "fs";
import path from "path";
import sharp from "sharp";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";

const PRODUCTS_IMAGE_DIR = path.join(process.cwd(), "public", "images", "products");

if (!fs.existsSync(PRODUCTS_IMAGE_DIR)) {
  fs.mkdirSync(PRODUCTS_IMAGE_DIR, { recursive: true });
}

interface ProductSeedItem {
  name: string;
  slug: string;
  sku: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string | null;
  subcategoryName?: string | null;
  salePrice: number;
  originalPrice: number;
  stock: number;
  badge: string;
  isBestSeller: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isOnSale: boolean;
  allowCustomSizing: boolean;
  customSizeUnit: "sq_ft" | "linear_ft";
  customSizeRate: number;
  customSizeMinPrice: number;
  customSizeLinearMode: "single_length" | "length_plus_width";
  shortDescription: string;
  description: string;
  seoTitle: string;
  metaDescription: string;
  variations: {
    skuSuffix: string;
    priceDelta: number;
    stock: number;
    attributes: { attributeName: string; attributeSlug: string; value: string; valueSlug: string; colorCode?: string }[];
  }[];
}

const PRODUCTS_DATA: ProductSeedItem[] = [
  // 1. ZEBRA BLINDS
  {
    name: "Lumina Day & Night Dual Sheer Zebra Blind",
    slug: "lumina-dual-sheer-zebra-blind",
    sku: "WSI-ZB-LUMINA-01",
    brand: "Wall Street Atelier",
    categorySlug: "zebra-blinds",
    categoryName: "Zebra Blinds",
    salePrice: 2850,
    originalPrice: 3800,
    stock: 45,
    badge: "Best Seller",
    isBestSeller: true,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 18.00,
    customSizeMinPrice: 1500.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Precision dual-layer zebra blind alternating between light-diffusing sheer voile and opaque privacy stripes.",
    description: `### Product Overview
The Lumina Day & Night Zebra Blind delivers architectural versatility and soft daylight control. Designed with alternating horizontal bands of translucent sheer mesh and light-blocking solid weave, it allows instant transitions between open ambient visibility and total personal privacy with a gentle pull of the stainless control chain.

### Material & Construction
Constructed from high-tensile 100% yarn-dyed polyester treated with an anti-static hydrophobic coating that repels dust, airborne grease, and seasonal pollen. Fitted on an extruded anodized aluminum roller barrel (38mm diameter) with precision-machined internal spring assists to prevent center fabric sagging.

### Design & Light Control
Features a contemporary 75mm solid stripe with a 50mm sheer transition band. When the stripes align, sunlight diffuses gently across interior surfaces while protecting heirloom hardwood furniture from direct UV bleaching. When staggered, 95% of direct sunlight is sealed off.

### Operating Mechanism
Equipped with a commercial-grade continuous stainless steel ball chain loop with a magnetic child-safe bottom cord tensioner, or compatible with rechargeable tubular lithium motors.

### Suitable Rooms & Maintenance
Ideal for formal living rooms, primary bedrooms, home executive offices, and private dining halls. Routine cleaning requires only a light microfiber cloth wipe or low-suction brush vacuuming. Never requires soaking or chemical solvents.

### Custom Sizing & Installation
Precision fabricated to your exact millimeter recess width and drop height. Includes universal top, side, and face mount brackets for effortless mounting inside or outside the window frame.`,
    seoTitle: "Lumina Dual Sheer Zebra Blind | Wall Street Interiors",
    metaDescription: "Custom fitted Lumina day and night zebra blinds in Srinagar. Alternating sheer and opaque stripes for effortless privacy, UV protection, and refined living.",
    variations: [
      {
        skuSuffix: "WHT-MAN",
        priceDelta: 0,
        stock: 15,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Warm White", valueSlug: "warm-white", colorCode: "#F8FAFC" },
          { attributeName: "Control Mechanism", attributeSlug: "control-mechanism", value: "Manual Chain", valueSlug: "manual-chain" },
        ],
      },
      {
        skuSuffix: "GRY-MAN",
        priceDelta: 0,
        stock: 15,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Mist Grey", valueSlug: "mist-grey", colorCode: "#94A3B8" },
          { attributeName: "Control Mechanism", attributeSlug: "control-mechanism", value: "Manual Chain", valueSlug: "manual-chain" },
        ],
      },
      {
        skuSuffix: "CHA-MOT",
        priceDelta: 2400,
        stock: 15,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Slate Charcoal", valueSlug: "slate-charcoal", colorCode: "#334155" },
          { attributeName: "Control Mechanism", attributeSlug: "control-mechanism", value: "Motorized Smart", valueSlug: "motorized-smart" },
        ],
      },
    ],
  },
  {
    name: "Aura Textured Jacquard Dual Zebra Blind",
    slug: "aura-textured-jacquard-zebra-blind",
    sku: "WSI-ZB-AURA-02",
    brand: "Wall Street Atelier",
    categorySlug: "zebra-blinds",
    categoryName: "Zebra Blinds",
    salePrice: 3600,
    originalPrice: 4800,
    stock: 30,
    badge: "Premium Choice",
    isBestSeller: false,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 22.00,
    customSizeMinPrice: 1800.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Richly woven jacquard fabric zebra blind with natural tactile depth and superior sound-dampening acoustic weave.",
    description: `### Product Overview
The Aura Textured Jacquard Zebra Blind introduces luxurious tactile depth to modern interior architecture. Woven with subtle slub yarn textures and geometric accents, it softens acoustic reverberation while providing comprehensive light filtration.

### Material & Construction
Crafted with multi-tone jacquard spun fibers integrated with UV-stabilized polymer threads. Includes a weighted teardrop bottom rail wrapped in matching textile to eliminate clatter against window frames during cross-ventilation breezes.

### Design & Light Control
Available in light-filtering and full-privacy configurations. The textured weave imparts organic warmth to stone and timber architectural finishes, making it a favorite among high-end interior architects across Kashmir.

### Operating Mechanism
Heavy-duty clutch mechanism rated for over 15,000 continuous pull cycles. Operates silently without cord jamming or friction fraying.

### Suitable Rooms & Maintenance
Perfect for expansive master bedroom suites, formal drawing rooms, boutique hospitality suites, and architectural lounges. Surface spot clean with damp sponge and mild natural detergent.

### Custom Sizing
Made to measure in our Srinagar atelier up to 2.8 meters single-span width.`,
    seoTitle: "Aura Jacquard Textured Zebra Blind | Bespoke Atelier",
    metaDescription: "Textured jacquard zebra blinds handcrafted by Wall Street Interiors. Rich dimensional weave, acoustic softening, and flexible light filtration.",
    variations: [
      {
        skuSuffix: "PEARL-LGT",
        priceDelta: 0,
        stock: 10,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Pearl White", valueSlug: "pearl-white", colorCode: "#FAF9F6" },
          { attributeName: "Light Filtration", attributeSlug: "light-filtration", value: "Light Filtering", valueSlug: "light-filtering" },
        ],
      },
      {
        skuSuffix: "SAND-PRV",
        priceDelta: 250,
        stock: 10,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Desert Sand", valueSlug: "desert-sand", colorCode: "#D2B48C" },
          { attributeName: "Light Filtration", attributeSlug: "light-filtration", value: "Total Privacy", valueSlug: "total-privacy" },
        ],
      },
      {
        skuSuffix: "ANTH-PRV",
        priceDelta: 250,
        stock: 10,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Anthracite", valueSlug: "anthracite", colorCode: "#293241" },
          { attributeName: "Light Filtration", attributeSlug: "light-filtration", value: "Total Privacy", valueSlug: "total-privacy" },
        ],
      },
    ],
  },
  {
    name: "Linear Luxe Cassette Blackout Zebra Blind",
    slug: "linear-luxe-cassette-blackout-zebra-blind",
    sku: "WSI-ZB-LINLUX-03",
    brand: "Wall Street Atelier",
    categorySlug: "zebra-blinds",
    categoryName: "Zebra Blinds",
    salePrice: 4200,
    originalPrice: 5600,
    stock: 25,
    badge: "New Arrival",
    isBestSeller: false,
    isFeatured: true,
    isPopular: false,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 26.00,
    customSizeMinPrice: 2000.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Architectural cassette-enclosed zebra blind featuring 100% blackout solid bands and side-channel light seal.",
    description: `### Product Overview
Linear Luxe is an elite window shading system featuring an integrated extruded aluminum cassette headbox that conceals the fabric roll completely. Engineered for modern minimalist spaces demanding zero visible brackets and maximum darkness on demand.

### Material & Construction
Constructed with 3-pass thermal blackout opaque bands bonded with UV-barrier layers. The curved or square aluminum headbox is finished in electrostatically applied architectural powder coat matching modern wall trims.

### Design & Light Control
Delivers 100% blackout darkness when stripes are staggered, eliminating street lamp glare and intense early morning sunrise.

### Operating Mechanism
Includes an ultra-smooth geared ratio clutch for feather-light lifting of tall window drops. Fully compatible with integrated tubular motors.

### Suitable Rooms & Maintenance
Ideal for luxury home cinemas, nursery bedrooms, and executive conference spaces. Wipe down aluminum headbox with soft microfiber; brush fabric lightly.`,
    seoTitle: "Linear Luxe Cassette Blackout Zebra Blinds | Wall Street",
    metaDescription: "Cassette-enclosed luxury blackout zebra blinds. 100% opaque bands, architectural headbox, and seamless light seal for master bedrooms and theaters.",
    variations: [
      {
        skuSuffix: "CURV-WHT",
        priceDelta: 0,
        stock: 12,
        attributes: [
          { attributeName: "Headbox Style", attributeSlug: "headbox-style", value: "Curved White Cassette", valueSlug: "curved-white" },
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Alabaster White", valueSlug: "alabaster-white", colorCode: "#F5F5F0" },
        ],
      },
      {
        skuSuffix: "SQ-BLK",
        priceDelta: 400,
        stock: 13,
        attributes: [
          { attributeName: "Headbox Style", attributeSlug: "headbox-style", value: "Square Matte Black", valueSlug: "square-black" },
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Graphite Grey", valueSlug: "graphite-grey", colorCode: "#3C3D42" },
        ],
      },
    ],
  },

  // 2. ROLLER BLINDS
  {
    name: "Solas Thermal 100% Blackout Roller Blind",
    slug: "solas-thermal-blackout-roller-blind",
    sku: "WSI-RB-SOLAS-01",
    brand: "Wall Street Atelier",
    categorySlug: "roller-blinds",
    categoryName: "Roller Blinds",
    salePrice: 2400,
    originalPrice: 3200,
    stock: 60,
    badge: "Best Seller",
    isBestSeller: true,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 15.00,
    customSizeMinPrice: 1200.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Heavy-gauge thermal blackout roller blind designed to block 100% of light and insulate cold window glass.",
    description: `### Product Overview
The Solas Thermal Blackout Roller Blind is our signature sleeping sanctuary shade. Crafted with a triple-pass foamed acrylic thermal backing, it completely eliminates incoming light leaks through the fabric while forming an insulating air barrier that reduces heat loss during cold Himalayan winters.

### Material & Construction
Constructed from 420 GSM fiberglass-reinforced composite polyester. Resists warping, edge fraying, and thermal shrinkage under harsh seasonal temperature fluctuations.

### Design & Light Control
Provides total 100% optical opacity. The smooth matte exterior face adds understated luxury to modern interiors without reflective sheen.

### Operating Mechanism
Heavy-duty 45mm aluminum tube with smooth-action spring clutch and child-safe nickel steel pull chain.

### Suitable Rooms & Maintenance
Master bedrooms, nurseries, home audio recording studios, and hotel suites. Dust with a damp cloth; moisture-resistant surface is effortless to sanitize.`,
    seoTitle: "Solas Thermal 100% Blackout Roller Blinds | Wall Street",
    metaDescription: "Custom thermal blackout roller blinds in Srinagar. Triple-pass acrylic backing ensures 100% total darkness and insulating room temperature control.",
    variations: [
      {
        skuSuffix: "NAVY",
        priceDelta: 0,
        stock: 20,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Midnight Navy", valueSlug: "midnight-navy", colorCode: "#0F172A" },
          { attributeName: "Weave Type", attributeSlug: "weave-type", value: "100% Blackout Thermal", valueSlug: "blackout-thermal" },
        ],
      },
      {
        skuSuffix: "SLATE",
        priceDelta: 0,
        stock: 20,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Slate Grey", valueSlug: "slate-grey", colorCode: "#64748B" },
          { attributeName: "Weave Type", attributeSlug: "weave-type", value: "100% Blackout Thermal", valueSlug: "blackout-thermal" },
        ],
      },
      {
        skuSuffix: "IVORY",
        priceDelta: 0,
        stock: 20,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Warm Ivory", valueSlug: "warm-ivory", colorCode: "#FFFFF0" },
          { attributeName: "Weave Type", attributeSlug: "weave-type", value: "100% Blackout Thermal", valueSlug: "blackout-thermal" },
        ],
      },
    ],
  },
  {
    name: "Solaris 3% Openness Screen Roller Blind",
    slug: "solaris-sunscreen-roller-blind",
    sku: "WSI-RB-SOLARIS-02",
    brand: "Wall Street Atelier",
    categorySlug: "roller-blinds",
    categoryName: "Roller Blinds",
    salePrice: 2700,
    originalPrice: 3600,
    stock: 50,
    badge: "Popular",
    isBestSeller: false,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 17.00,
    customSizeMinPrice: 1350.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "High-performance solar screen roller blind that diffuses harsh glare while preserving clear daytime outdoor views.",
    description: `### Product Overview
Solaris 3% Screen Blinds are engineered for modern light-filled spaces with panoramic landscape or mountain views. Using micro-perforated fiberglass basket weaves, it blocks 97% of harmful ultraviolet radiation while allowing occupants to look outside freely without screen reflection.

### Material & Construction
Woven from vinyl-coated fiberglass yarns with fire-retardant certification (NFPA 701 standard). Completely immune to sun yellowing, moisture rot, and structural stretching.

### Design & Light Control
Filters intense outdoor sun into a comfortable ambient glow. Eliminates harsh reflections on TV and computer monitors in creative home offices.

### Operating Mechanism
Smooth chain-drive gearbox with optional spring-loaded slow-rise mechanism for child-safe cordless operation.

### Suitable Rooms & Maintenance
Home workspaces, high-rise living rooms, gourmet kitchens, and commercial showrooms. Clean with water spray or damp microfiber.`,
    seoTitle: "Solaris 3% Solar Sunscreen Roller Blinds | Atelier",
    metaDescription: "Solar screen roller blinds by Wall Street Interiors. Blocks 97% UV glare while preserving your mountain views. Ideal for living rooms and home offices.",
    variations: [
      {
        skuSuffix: "COOL-GRY",
        priceDelta: 0,
        stock: 25,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Cool Grey", valueSlug: "cool-grey", colorCode: "#94A3B8" },
          { attributeName: "Openness Factor", attributeSlug: "openness-factor", value: "3% Openness", valueSlug: "3-percent" },
        ],
      },
      {
        skuSuffix: "CHARCOAL",
        priceDelta: 150,
        stock: 25,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Charcoal Bronze", valueSlug: "charcoal-bronze", colorCode: "#27272A" },
          { attributeName: "Openness Factor", attributeSlug: "openness-factor", value: "3% Openness", valueSlug: "3-percent" },
        ],
      },
    ],
  },
  {
    name: "Venezia Natural Linen-Look Translucent Roller Blind",
    slug: "venezia-linen-look-roller-blind",
    sku: "WSI-RB-VENEZIA-03",
    brand: "Wall Street Atelier",
    categorySlug: "roller-blinds",
    categoryName: "Roller Blinds",
    salePrice: 3150,
    originalPrice: 4200,
    stock: 35,
    badge: "Trending",
    isBestSeller: false,
    isFeatured: false,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 20.00,
    customSizeMinPrice: 1500.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Artisanal slub-textured translucent roller blind delivering soft organic daylight and subtle textural character.",
    description: `### Product Overview
Venezia captures the organic warmth and natural slub texture of raw Belgian flax in an easy-care, non-creasing polyester roller blind. Perfect for modern organic Scandinavian and Japandi interior aesthetics.

### Material & Construction
100% yarn-dyed textured slub weave. Laser-cut side edges ensure zero thread fraying across years of daily operation.

### Design & Light Control
Diffuses harsh light into a luminous, serene glow while maintaining moderate daytime privacy from outside observers.

### Operating Mechanism
Geared clutch with stainless chain or motorized Tuya tubular battery drive.

### Suitable Rooms & Maintenance
Dining rooms, reading rooms, wellness studios, and guest bedrooms. Vacuum on gentle cycle.`,
    seoTitle: "Venezia Linen Look Translucent Roller Blinds | Atelier",
    metaDescription: "Textured translucent linen-look roller blinds. Soft ambient daylight diffusion and organic texture for modern luxury living spaces in Srinagar.",
    variations: [
      {
        skuSuffix: "OATMEAL",
        priceDelta: 0,
        stock: 20,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Natural Oatmeal", valueSlug: "natural-oatmeal", colorCode: "#E6DFD5" },
          { attributeName: "Bottom Rail", attributeSlug: "bottom-rail", value: "Concealed Wrapped Rail", valueSlug: "concealed-wrapped" },
        ],
      },
      {
        skuSuffix: "CHALK",
        priceDelta: 100,
        stock: 15,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Chalk Off-White", valueSlug: "chalk-white", colorCode: "#F1F5F9" },
          { attributeName: "Bottom Rail", attributeSlug: "bottom-rail", value: "Sleek Aluminum Rail", valueSlug: "aluminum-rail" },
        ],
      },
    ],
  },

  // 3. VERTICAL BLINDS
  {
    name: "Panorama Architectural 127mm Vertical Blind",
    slug: "panorama-architectural-vertical-blind",
    sku: "WSI-VB-PANORAMA-01",
    brand: "Wall Street Atelier",
    categorySlug: "vertical-blinds",
    categoryName: "Vertical Blinds",
    salePrice: 3150,
    originalPrice: 4200,
    stock: 40,
    badge: "Commercial Grade",
    isBestSeller: true,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 14.00,
    customSizeMinPrice: 1800.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Wide-louver 127mm vertical blind engineered for expansive glass balconies, patio sliders, and office partitions.",
    description: `### Product Overview
The Panorama 127mm Vertical Blind is the premier solution for sliding balcony doors, French windows, and commercial floor-to-ceiling glass facades. Individual vertical louvers rotate 180 degrees to direct light precisely throughout the day or draw aside smoothly for unimpeded foot access.

### Material & Construction
Heavy-duty spun polyester louvers with high-memory shape retention. Suspended from an extruded aluminum track with self-aligning wheeled carrier trucks that glide effortlessly without sticking.

### Design & Light Control
180-degree rotation enables full daylight, angled anti-glare shading, or complete overlap privacy.

### Operating Mechanism
Child-safe rigid control wand that eliminates dangerous hanging cords, with continuous multi-wheel track trucks.

### Suitable Rooms & Maintenance
Patio balconies, corporate boardrooms, garden-facing sliding doors, and open-plan lofts. Wipe louvers with damp cloth.`,
    seoTitle: "Panorama 127mm Vertical Window Blinds | Patio Sliders",
    metaDescription: "Custom 127mm architectural vertical blinds for wide patio doors and sliding glass. 180-degree smooth rotation and commercial-grade aluminum track.",
    variations: [
      {
        skuSuffix: "89-WHT",
        priceDelta: 0,
        stock: 20,
        attributes: [
          { attributeName: "Slat Width", attributeSlug: "slat-width", value: "89mm Slim Slat", valueSlug: "89mm-slat" },
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Warm White", valueSlug: "warm-white", colorCode: "#F8FAFC" },
        ],
      },
      {
        skuSuffix: "127-GRY",
        priceDelta: 200,
        stock: 20,
        attributes: [
          { attributeName: "Slat Width", attributeSlug: "slat-width", value: "127mm Wide Slat", valueSlug: "127mm-slat" },
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Stone Grey", valueSlug: "stone-grey", colorCode: "#94A3B8" },
        ],
      },
    ],
  },
  {
    name: "Titan Rigid Textured PVC Blackout Vertical Blind",
    slug: "titan-rigid-pvc-vertical-blind",
    sku: "WSI-VB-TITAN-02",
    brand: "Wall Street Atelier",
    categorySlug: "vertical-blinds",
    categoryName: "Vertical Blinds",
    salePrice: 3600,
    originalPrice: 4800,
    stock: 30,
    badge: "Waterproof",
    isBestSeller: false,
    isFeatured: false,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 16.00,
    customSizeMinPrice: 2000.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Waterproof, curved rigid PVC vertical slats requiring no bottom weights or linking chains. 100% wipe-clean.",
    description: `### Product Overview
Titan Rigid PVC Blinds eliminate bottom chains and weights entirely. Formed with a subtle curved cross-section for maximum rigidity and light exclusion, they are 100% waterproof and flame-retardant.

### Material & Construction
Virgin UV-stabilized rigid PVC extrusion with an embossed matte linen pattern. Cannot absorb moisture, mold, or odors.

### Design & Light Control
Curved slat profiles interlock tightly when closed, delivering superior room darkening and privacy.

### Operating Mechanism
Heavy-duty wand control with self-lubricating nylon carrier rollers.

### Suitable Rooms & Maintenance
Kitchens, bathrooms, high-traffic commercial hallways, and medical consulting suites. Washable with soapy water.`,
    seoTitle: "Titan Rigid PVC Vertical Blinds | Waterproof Slats",
    metaDescription: "Rigid PVC vertical blinds without bottom chains. 100% waterproof, wipe-clean, and durable for kitchens, bathrooms, and commercial glass doors.",
    variations: [
      {
        skuSuffix: "WHITE-RIB",
        priceDelta: 0,
        stock: 15,
        attributes: [
          { attributeName: "Slat Width", attributeSlug: "slat-width", value: "89mm Slim Slat", valueSlug: "89mm-slat" },
          { attributeName: "Texture Style", attributeSlug: "texture-style", value: "Linear Ribbed White", valueSlug: "ribbed-white" },
        ],
      },
      {
        skuSuffix: "BEIGE-SMOOTH",
        priceDelta: 150,
        stock: 15,
        attributes: [
          { attributeName: "Slat Width", attributeSlug: "slat-width", value: "127mm Wide Slat", valueSlug: "127mm-slat" },
          { attributeName: "Texture Style", attributeSlug: "texture-style", value: "Smooth Matte Cream", valueSlug: "matte-cream" },
        ],
      },
    ],
  },
  {
    name: "Sonora Acoustic Fabric Louver Vertical Blind",
    slug: "sonora-acoustic-fabric-vertical-blind",
    sku: "WSI-VB-SONORA-03",
    brand: "Wall Street Atelier",
    categorySlug: "vertical-blinds",
    categoryName: "Vertical Blinds",
    salePrice: 4125,
    originalPrice: 5500,
    stock: 25,
    badge: "Acoustic Series",
    isBestSeller: false,
    isFeatured: true,
    isPopular: false,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 19.00,
    customSizeMinPrice: 2200.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Multi-ply sound-absorbing jacquard fabric louvers engineered to soften room echoes and road noise.",
    description: `### Product Overview
Sonora Acoustic Vertical Blinds combine the light management of vertical louvers with certified acoustic dampening. Ideal for open-plan living areas with hard tiled or wooden floors prone to sound reverberation.

### Material & Construction
Triple-layered acoustic fleece and woven jacquard blend with thermal interlining. Includes enclosed bottom weights sewn inside ultrasonic pockets.

### Design & Light Control
Available in deep, muted designer earth tones with gentle sound absorption (NRC 0.35 rating).

### Operating Mechanism
Heavy-duty monocommand track that tilts and traverses with a single continuous chain.

### Suitable Rooms & Maintenance
Open-plan dining rooms, executive offices, music rooms, and street-facing living lounges. Vacuum with soft brush.`,
    seoTitle: "Sonora Acoustic Fabric Vertical Blinds | Sound Dampening",
    metaDescription: "Sound-absorbing vertical fabric blinds by Wall Street Interiors. Reduces echo and traffic noise on large patio glass doors and floor-to-ceiling windows.",
    variations: [
      {
        skuSuffix: "EARTH-TAUPE",
        priceDelta: 0,
        stock: 12,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Earth Taupe", valueSlug: "earth-taupe", colorCode: "#8B8589" },
          { attributeName: "Control Style", attributeSlug: "control-style", value: "Monocommand Chain", valueSlug: "mono-chain" },
        ],
      },
      {
        skuSuffix: "CHARCOAL-WAND",
        priceDelta: 200,
        stock: 13,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Charcoal Grey", valueSlug: "charcoal-grey", colorCode: "#374151" },
          { attributeName: "Control Style", attributeSlug: "control-style", value: "Child-Safe Wand", valueSlug: "safe-wand" },
        ],
      },
    ],
  },

  // 4. ROMAN BLINDS
  {
    name: "Heritage Pure Belgian Linen Roman Blind",
    slug: "heritage-pure-belgian-linen-roman-blind",
    sku: "WSI-ROM-HERITAGE-01",
    brand: "Wall Street Atelier",
    categorySlug: "roman-blinds",
    categoryName: "Roman Blinds",
    salePrice: 4800,
    originalPrice: 6400,
    stock: 20,
    badge: "Artisanal Craft",
    isBestSeller: true,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 28.00,
    customSizeMinPrice: 2500.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Hand-tailored 100% pure Belgian linen roman blind gathering into soft, sculptural cascading pleats.",
    description: `### Product Overview
The Heritage Roman Blind embodies classic European atelier luxury. Hand-tailored from imported pure Belgian linen, it folds gracefully into flat architectural or soft waterfall pleats when raised, combining drapery warmth with compact blind geometry.

### Material & Construction
100% pre-washed pure linen lined with dense cotton sateen. Features concealed fiberglass battens inserted into stitched rear pockets to guarantee crisp horizontal folds.

### Design & Light Control
Diffuses natural daylight into a warm, inviting glow while preventing outdoor silhouettes at night.

### Operating Mechanism
Geared 1:4 planetary chain control for effortless, balanced lifting of heavy natural linen draperies.

### Suitable Rooms & Maintenance
Formal drawing rooms, master bedrooms, library alcoves, and boutique suites. Professional dry clean recommended.`,
    seoTitle: "Heritage Pure Belgian Linen Roman Blinds | Bespoke Atelier",
    metaDescription: "Hand-tailored pure Belgian linen Roman blinds. Lined with luxury cotton sateen for refined horizontal pleats in bedrooms and formal drawing rooms.",
    variations: [
      {
        skuSuffix: "FLAT-NAT",
        priceDelta: 0,
        stock: 10,
        attributes: [
          { attributeName: "Fold Style", attributeSlug: "fold-style", value: "Classic Flat Fold", valueSlug: "flat-fold" },
          { attributeName: "Linen Colour", attributeSlug: "linen-colour", value: "Natural Flax", valueSlug: "natural-flax", colorCode: "#E2DACD" },
        ],
      },
      {
        skuSuffix: "WATER-IVO",
        priceDelta: 450,
        stock: 10,
        attributes: [
          { attributeName: "Fold Style", attributeSlug: "fold-style", value: "Waterfall Hobbled Fold", valueSlug: "hobbled-fold" },
          { attributeName: "Linen Colour", attributeSlug: "linen-colour", value: "Ivory Cream", valueSlug: "ivory-cream", colorCode: "#FFFFF0" },
        ],
      },
    ],
  },
  {
    name: "Opulence Cotton-Velvet Lined Roman Blind",
    slug: "opulence-cotton-velvet-roman-blind",
    sku: "WSI-ROM-OPULENCE-02",
    brand: "Wall Street Atelier",
    categorySlug: "roman-blinds",
    categoryName: "Roman Blinds",
    salePrice: 5400,
    originalPrice: 7200,
    stock: 15,
    badge: "Luxury Choice",
    isBestSeller: false,
    isFeatured: true,
    isPopular: false,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 32.00,
    customSizeMinPrice: 2800.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Plush cotton-velvet roman blind with 3-pass thermal blackout lining for total darkness and draft exclusion.",
    description: `### Product Overview
Opulence is the ultimate bedroom roman blind. Handcrafted from heavy cotton-poly velvet with a short dense pile, it provides supreme thermal insulation against cold Himalayan winters while adding tactile richness to royal bedrooms.

### Material & Construction
Heavyweight 380 GSM cotton-poly velvet backed with thermal 3-pass blackout fleece. Blocks 100% light through fabric and dampens exterior street noise.

### Design & Light Control
Lustrous velvet texture catches ambient interior light with rich depth, creating an intimate, cozy bedtime haven.

### Operating Mechanism
Heavy-duty aluminum headrail with integrated breakaway child-safety pull pulleys.

### Suitable Rooms & Maintenance
Master bedrooms, luxury dressing rooms, private home theaters, and luxury chalets. Brush gently with velvet brush.`,
    seoTitle: "Opulence Velvet Lined Roman Blinds | Luxury Thermal Shades",
    metaDescription: "Plush cotton-velvet Roman blinds with thermal blackout lining. Handcrafted in Srinagar for maximum room warmth, acoustic dampening, and total darkness.",
    variations: [
      {
        skuSuffix: "EMERALD",
        priceDelta: 0,
        stock: 7,
        attributes: [
          { attributeName: "Velvet Colour", attributeSlug: "velvet-colour", value: "Midnight Emerald", valueSlug: "midnight-emerald", colorCode: "#064E3B" },
          { attributeName: "Lining Type", attributeSlug: "lining-type", value: "3-Pass Thermal Blackout", valueSlug: "thermal-blackout" },
        ],
      },
      {
        skuSuffix: "SAPPHIRE",
        priceDelta: 0,
        stock: 8,
        attributes: [
          { attributeName: "Velvet Colour", attributeSlug: "velvet-colour", value: "Royal Sapphire", valueSlug: "royal-sapphire", colorCode: "#1E3A8A" },
          { attributeName: "Lining Type", attributeSlug: "lining-type", value: "3-Pass Thermal Blackout", valueSlug: "thermal-blackout" },
        ],
      },
    ],
  },
  {
    name: "Modena Textured Woven Slub Roman Blind",
    slug: "modena-textured-slub-roman-blind",
    sku: "WSI-ROM-MODENA-03",
    brand: "Wall Street Atelier",
    categorySlug: "roman-blinds",
    categoryName: "Roman Blinds",
    salePrice: 3900,
    originalPrice: 5200,
    stock: 35,
    badge: "New Arrival",
    isBestSeller: false,
    isFeatured: false,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 24.00,
    customSizeMinPrice: 2200.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Tailored slub yarn roman blind with structured horizontal battens and clean architectural folds.",
    description: `### Product Overview
The Modena Roman Blind combines casual tailored slub texture with crisp modern styling. Its textured yarn cross-weave provides subtle dimensional interest, pairing effortlessly with modern minimalist oak and walnut cabinetry.

### Material & Construction
Cotton-polyester blend engineered to resist sun bleaching and humidity creasing. Lined with lightweight poly-cotton sateen.

### Design & Light Control
Diffuses harsh glare into soft daylight while providing full nighttime privacy.

### Operating Mechanism
Precision geared lift mechanism with smooth chrome control chain.

### Suitable Rooms & Maintenance
Bedrooms, informal living rooms, breakfast nooks, and study alcoves. Dust with soft microfiber.`,
    seoTitle: "Modena Textured Woven Slub Roman Blinds | Atelier",
    metaDescription: "Tailored textured slub Roman blinds by Wall Street Interiors. Natural cross-weave fabric with clean horizontal pleats for modern residential spaces.",
    variations: [
      {
        skuSuffix: "OATMEAL",
        priceDelta: 0,
        stock: 18,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Oatmeal Beige", valueSlug: "oatmeal-beige", colorCode: "#D6CFC7" },
          { attributeName: "Fold Style", attributeSlug: "fold-style", value: "Contemporary Flat Fold", valueSlug: "flat-fold" },
        ],
      },
      {
        skuSuffix: "CHARCOAL",
        priceDelta: 150,
        stock: 17,
        attributes: [
          { attributeName: "Fabric Colour", attributeSlug: "fabric-colour", value: "Charcoal Fleck", valueSlug: "charcoal-fleck", colorCode: "#374151" },
          { attributeName: "Fold Style", attributeSlug: "fold-style", value: "Contemporary Flat Fold", valueSlug: "flat-fold" },
        ],
      },
    ],
  },

  // 5. MOTORIZED BLINDS
  {
    name: "Silentium Whisper-Quiet Rechargeable Smart Blind",
    slug: "silentium-rechargeable-smart-motorized-blind",
    sku: "WSI-MB-SILENTIUM-01",
    brand: "Wall Street Atelier",
    categorySlug: "motorized-blinds",
    categoryName: "Motorized Blinds",
    salePrice: 10500,
    originalPrice: 14000,
    stock: 25,
    badge: "Smart Living",
    isBestSeller: true,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 45.00,
    customSizeMinPrice: 6000.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Wire-free rechargeable lithium motorized blind with whisper-quiet (<32dB) motor and Tuya smart home app control.",
    description: `### Product Overview
Silentium delivers effortless luxury without requiring electrical conduit carving. Powered by an internal high-capacity lithium battery concealed inside the roller barrel, it operates for 6 to 9 months on a single magnetic USB-C charge.

### Material & Construction
Concealed 28mm brushless electronic motor featuring silent planetary gearing (<32dB noise level). Paired with your choice of premium solar screen or blackout textile.

### Smart Controls & Integration
Control via multi-channel RF remote, smartphone application (iOS / Android), or hands-free voice commands via Amazon Alexa, Google Assistant, and Apple Siri Shortcuts.

### Operating Mechanism
Soft-start and soft-stop acceleration curves protect fabric headers and eliminate abrupt jolts. Includes manual pull-to-start convenience.

### Suitable Rooms & Maintenance
High double-height ceilings, master bedrooms, stairwell windows, and smart homes. Recharge via 3-meter magnetic USB-C cable.`,
    seoTitle: "Silentium Rechargeable Smart Motorized Blinds | Wall Street",
    metaDescription: "Wire-free rechargeable motorized smart blinds in Srinagar. Control via app, voice, or multi-channel remote. Whisper quiet brushless motor.",
    variations: [
      {
        skuSuffix: "LITH-WIFI",
        priceDelta: 0,
        stock: 15,
        attributes: [
          { attributeName: "Motor System", attributeSlug: "motor-system", value: "Rechargeable Lithium Battery", valueSlug: "lithium-battery" },
          { attributeName: "Connectivity", attributeSlug: "connectivity", value: "Tuya Wi-Fi Direct", valueSlug: "tuya-wifi" },
        ],
      },
      {
        skuSuffix: "HARD-ZIG",
        priceDelta: 800,
        stock: 10,
        attributes: [
          { attributeName: "Motor System", attributeSlug: "motor-system", value: "220V Hardwired AC", valueSlug: "hardwired-ac" },
          { attributeName: "Connectivity", attributeSlug: "connectivity", value: "Zigbee 3.0 Protocol", valueSlug: "zigbee-3" },
        ],
      },
    ],
  },
  {
    name: "Apex Double-Height Architectural Motorized Shade",
    slug: "apex-double-height-motorized-blind",
    sku: "WSI-MB-APEX-02",
    brand: "Wall Street Atelier",
    categorySlug: "motorized-blinds",
    categoryName: "Motorized Blinds",
    salePrice: 13875,
    originalPrice: 18500,
    stock: 15,
    badge: "Architectural Series",
    isBestSeller: false,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 55.00,
    customSizeMinPrice: 8500.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "High-torque motorized shade engineered for monumental 4+ meter drops, skylights, and double-height glass walls.",
    description: `### Product Overview
Engineered specifically for monumental architectural drops, the Apex Motorized Shade features heavy-gauge 55mm and 65mm aluminum tubes that span up to 4.5 meters in width without center deflection or smile warping.

### Material & Construction
High-torque (2.0 Nm) synchronous motor with integrated electronic limit memories. Heavy fiberglass solar screen fabric resists UV breakdown and tension elongation.

### Smart Controls & Integration
RS485 and dry-contact building automation interfaces for seamless integration with Crestron, Control4, Lutron, and KNX smart building systems.

### Operating Mechanism
Precision heavy-duty side-cable guide wires prevent blind sway in high-elevation air currents.

### Suitable Rooms & Maintenance
Double-height atrium living spaces, grand penthouses, corporate headquarters, and luxury hotel lobbies.`,
    seoTitle: "Apex Double-Height Architectural Motorized Blinds | Atelier",
    metaDescription: "Heavy-duty motorized shades for double-height windows and atriums. 4+ meter drops, building automation integration, and heavy-gauge aluminum tubes.",
    variations: [
      {
        skuSuffix: "1CH-REM",
        priceDelta: 0,
        stock: 8,
        attributes: [
          { attributeName: "Remote Option", attributeSlug: "remote-option", value: "Single-Channel RF Remote", valueSlug: "single-channel" },
          { attributeName: "Motor Torque", attributeSlug: "motor-torque", value: "1.1 Nm Standard Torque", valueSlug: "1-1-nm" },
        ],
      },
      {
        skuSuffix: "16CH-REM",
        priceDelta: 1200,
        stock: 7,
        attributes: [
          { attributeName: "Remote Option", attributeSlug: "remote-option", value: "16-Channel Multi-Room Remote", valueSlug: "16-channel" },
          { attributeName: "Motor Torque", attributeSlug: "motor-torque", value: "2.0 Nm Heavy Torque", valueSlug: "2-0-nm" },
        ],
      },
    ],
  },
  {
    name: "Nova Solar-Powered Wireless Motorized Roller Blind",
    slug: "nova-solar-powered-motorized-blind",
    sku: "WSI-MB-NOVA-03",
    brand: "Wall Street Atelier",
    categorySlug: "motorized-blinds",
    categoryName: "Motorized Blinds",
    salePrice: 12000,
    originalPrice: 16000,
    stock: 20,
    badge: "Eco Smart",
    isBestSeller: false,
    isFeatured: false,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 48.00,
    customSizeMinPrice: 7500.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Zero-wire solar-recharging motorized blind with slim window-mounted solar strip for perpetual green power.",
    description: `### Product Overview
Nova introduces sustainable energy independence to luxury window coverings. Featuring an ultra-slim photovoltaic collector strip mounted directly behind the window head, ambient sunlight continually trickles power into the internal lithium cell.

### Material & Construction
Integrated solar crystalline film with smart charge-regulation circuitry. High-performance sunscreen fabric protects interiors from thermal gain.

### Smart Controls & Integration
Operates via Tuya Smart Life mobile app and 15-channel handheld remote with programmable sunrise/sunset automated schedules.

### Operating Mechanism
Brushless micro-motor with built-in thermal overload protection and speed governor.

### Suitable Rooms & Maintenance
Skylights, difficult-to-reach conservatory windows, and eco-conscious modern villas. Zero maintenance required.`,
    seoTitle: "Nova Solar Powered Motorized Blinds | Eco Smart Shading",
    metaDescription: "Solar-powered automatic motorized blinds. Continuous trickle-charge via slim solar panel, smart app schedules, and wire-free installation in Srinagar.",
    variations: [
      {
        skuSuffix: "SOLAR-SCREEN",
        priceDelta: 0,
        stock: 10,
        attributes: [
          { attributeName: "Fabric Type", attributeSlug: "fabric-type", value: "3% Solar Screen", valueSlug: "3-solar-screen" },
          { attributeName: "Charging Mode", attributeSlug: "charging-mode", value: "Continuous Solar Panel", valueSlug: "solar-panel" },
        ],
      },
      {
        skuSuffix: "SOLAR-BLACK",
        priceDelta: 500,
        stock: 10,
        attributes: [
          { attributeName: "Fabric Type", attributeSlug: "fabric-type", value: "Total Blackout Weave", valueSlug: "total-blackout" },
          { attributeName: "Charging Mode", attributeSlug: "charging-mode", value: "Continuous Solar Panel", valueSlug: "solar-panel" },
        ],
      },
    ],
  },

  // 6. MOTORIZED CURTAIN TRACKS
  {
    name: "GlidePro Ultra-Slim Smart Electric Curtain Track",
    slug: "glidepro-ultra-slim-smart-curtain-track",
    sku: "WSI-MCT-GLIDEPRO-01",
    brand: "Wall Street Atelier",
    categorySlug: "motorized-curtain-tracks",
    categoryName: "Motorized Curtain Tracks",
    subcategorySlug: "motorized-blinds",
    subcategoryName: "Motorized Blinds",
    salePrice: 12000,
    originalPrice: 16000,
    stock: 30,
    badge: "Whisper Quiet",
    isBestSeller: true,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "linear_ft",
    customSizeRate: 850.00,
    customSizeMinPrice: 8000.00,
    customSizeLinearMode: "single_length",
    shortDescription: "Ultra-slim motorized drapery track with touch-motion technology and whisper-quiet belt drive for curtains up to 50 kg.",
    description: `### Product Overview
The GlidePro Smart Curtain Track brings effortless, theatrical glide to heavy floor-to-ceiling draperies. With Touch-Motion technology, a gentle hand tug on the curtain fabric automatically awakens the motor to glide the drapery fully open or closed.

### Material & Construction
Extruded aerospace-grade aluminum rail housing a Kevlar-reinforced steel-core timing belt and self-lubricating nylon wheel runners. Supports drapery weights up to 50 kg across single spans up to 12 meters.

### Smart Controls & Integration
Operates via handheld multi-channel remote, wall-mounted touch panel, or smartphone app. Compatible with Alexa and Google Assistant voice automation.

### Operating Mechanism
Electromagnetic clutch allows smooth manual operation during power outages without motor resistance or damage.

### Suitable Rooms & Maintenance
Master bedroom suites, formal salon drawing rooms, hotel suites, and executive suites. Track requires zero oiling.`,
    seoTitle: "GlidePro Smart Motorized Curtain Tracks | Electric Rails",
    metaDescription: "Electric motorized curtain tracks in Srinagar. Touch-motion glide, voice control, Kevlar timing belt, and whisper-quiet motor for luxury floor-to-ceiling curtains.",
    variations: [
      {
        skuSuffix: "SNGL-CEIL",
        priceDelta: 0,
        stock: 15,
        attributes: [
          { attributeName: "Track Layout", attributeSlug: "track-layout", value: "Single Track", valueSlug: "single-track" },
          { attributeName: "Mounting Option", attributeSlug: "mounting-option", value: "Ceiling Flush Mount", valueSlug: "ceiling-mount" },
        ],
      },
      {
        skuSuffix: "DUAL-WALL",
        priceDelta: 2800,
        stock: 15,
        attributes: [
          { attributeName: "Track Layout", attributeSlug: "track-layout", value: "Double Track (Sheer + Drape)", valueSlug: "double-track" },
          { attributeName: "Mounting Option", attributeSlug: "mounting-option", value: "Wall Bracket Mount", valueSlug: "wall-mount" },
        ],
      },
    ],
  },
  {
    name: "Duomax Heavy-Duty Dual Motorized Curtain Rail",
    slug: "duomax-heavy-duty-dual-curtain-track",
    sku: "WSI-MCT-DUOMAX-02",
    brand: "Wall Street Atelier",
    categorySlug: "motorized-curtain-tracks",
    categoryName: "Motorized Curtain Tracks",
    subcategorySlug: "motorized-blinds",
    subcategoryName: "Motorized Blinds",
    salePrice: 18000,
    originalPrice: 24000,
    stock: 15,
    badge: "Commercial Heavy",
    isBestSeller: false,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "linear_ft",
    customSizeRate: 1200.00,
    customSizeMinPrice: 12000.00,
    customSizeLinearMode: "single_length",
    shortDescription: "Synchronized dual-track electric system supporting both sheer voile and heavy velvet blackout drapes up to 80 kg.",
    description: `### Product Overview
Duomax is our high-capacity dual motorized rail engineered for multi-layered luxury window treatments. Two parallel concealed tracks operate independently, allowing you to slide sheer daytime voiles and heavy lined blackout drapes with separate remote buttons or voice commands.

### Material & Construction
Heavy-gauge 2.2mm wall aluminum extrusion with dual brushless high-torque motors. Supports heavy multi-pass thermal velvets and blackout acoustic linings up to 80 kg total weight.

### Smart Controls & Integration
Matter-over-Thread and Zigbee protocols ensure universal compatibility with Apple Home, Home Assistant, Control4, and Crestron.

### Operating Mechanism
Whisper-quiet helical planetary gearing with soft-start deceleration curves that preserve delicate drapery pleats.

### Suitable Rooms & Maintenance
Grand formal living halls, private cinema rooms, hotel presidential suites, and luxury villas. Zero maintenance required.`,
    seoTitle: "Duomax Dual Motorized Curtain Tracks | Heavy Drapery Rails",
    metaDescription: "Dual electric curtain track system for heavy drapes and sheer voiles. Supports up to 80 kg with smart home Matter and Zigbee automation in Srinagar.",
    variations: [
      {
        skuSuffix: "SFOLD-RIPPLE",
        priceDelta: 0,
        stock: 8,
        attributes: [
          { attributeName: "Heading Style", attributeSlug: "heading-style", value: "S-Fold Ripple Wave", valueSlug: "s-fold-ripple" },
          { attributeName: "Motor Protocol", attributeSlug: "motor-protocol", value: "Matter / Apple Home", valueSlug: "matter-apple" },
        ],
      },
      {
        skuSuffix: "PINCH-PLEAT",
        priceDelta: 0,
        stock: 7,
        attributes: [
          { attributeName: "Heading Style", attributeSlug: "heading-style", value: "Classic Pinch Pleat", valueSlug: "pinch-pleat" },
          { attributeName: "Motor Protocol", attributeSlug: "motor-protocol", value: "Tuya Zigbee 3.0", valueSlug: "tuya-zigbee" },
        ],
      },
    ],
  },
  {
    name: "ArcCurve Custom Curved Motorized Bay Window Track",
    slug: "arccurve-custom-curved-motorized-curtain-track",
    sku: "WSI-MCT-ARCCURVE-03",
    brand: "Wall Street Atelier",
    categorySlug: "motorized-curtain-tracks",
    categoryName: "Motorized Curtain Tracks",
    subcategorySlug: "motorized-blinds",
    subcategoryName: "Motorized Blinds",
    salePrice: 19875,
    originalPrice: 26500,
    stock: 10,
    badge: "Custom Atelier",
    isBestSeller: false,
    isFeatured: false,
    isPopular: false,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "linear_ft",
    customSizeRate: 1450.00,
    customSizeMinPrice: 14000.00,
    customSizeLinearMode: "single_length",
    shortDescription: "Custom precision-bent electric curtain track tailored for 90-degree corner windows, bay alcoves, and sweeping curves.",
    description: `### Product Overview
ArcCurve solves the difficult challenge of automating curtains on non-linear architectural glazing. Our atelier custom bents heavy-duty aluminum rails to exact 90-degree corners, continuous 135-degree bay windows, or gradual elliptical curves with seamless internal gliding.

### Material & Construction
Specialized malleable high-tensile alloy rail bent on hydraulic CNC mandrel tooling. Features flexible composite drive belts that navigate tight radii without binding.

### Smart Controls & Integration
Multi-channel wireless remote control, wall switch, and smartphone integration.

### Operating Mechanism
High-torque motor with electronic curve-load compensation ensures uniform glide speed through straight sections and sharp bends.

### Suitable Rooms & Maintenance
Bay window reading alcoves, corner glass master suites, and semicircular rotunda salons. Clean track exterior with dry cloth.`,
    seoTitle: "ArcCurve Curved Motorized Curtain Track | Bay Window Automation",
    metaDescription: "Custom bent electric motorized curtain tracks for bay windows and 90-degree corners. Smooth automated drapery motion tailored to your window angles.",
    variations: [
      {
        skuSuffix: "BAY-135",
        priceDelta: 0,
        stock: 5,
        attributes: [
          { attributeName: "Bend Configuration", attributeSlug: "bend-configuration", value: "135 Degree Bay Window", valueSlug: "bay-135" },
          { attributeName: "Track Finish", attributeSlug: "track-finish", value: "Matte Architectural White", valueSlug: "white-finish" },
        ],
      },
      {
        skuSuffix: "CORNER-90",
        priceDelta: 800,
        stock: 5,
        attributes: [
          { attributeName: "Bend Configuration", attributeSlug: "bend-configuration", value: "90 Degree L-Corner", valueSlug: "corner-90" },
          { attributeName: "Track Finish", attributeSlug: "track-finish", value: "Anodized Titanium Silver", valueSlug: "titanium-finish" },
        ],
      },
    ],
  },

  // 7. WINDOW BLINDS
  {
    name: "Artisan 50mm Genuine Basswood Venetian Blind",
    slug: "artisan-basswood-venetian-blind",
    sku: "WSI-WB-BASSWOOD-01",
    brand: "Wall Street Atelier",
    categorySlug: "window-blinds",
    categoryName: "Window Blinds",
    salePrice: 4875,
    originalPrice: 6500,
    stock: 40,
    badge: "Timeless Wood",
    isBestSeller: true,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 26.00,
    customSizeMinPrice: 2400.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Kiln-dried genuine North American basswood venetian blind with 50mm wide slats and decorative cloth tape ladder.",
    description: `### Product Overview
The Artisan Basswood Venetian Blind brings rich organic warmth and heirloom craftsmanship into classic and contemporary interiors. Cut from select furniture-grade kiln-dried basswood, each 50mm slat is precision planed, sanded, and multi-lacquered to resist warpage and sun bleaching.

### Material & Construction
100% genuine sustainable basswood with low moisture absorption. Fitted with heavy-duty high-profile steel headrail and decorative woven cotton tape ladders that conceal route holes for superior light closure.

### Design & Light Control
Tilt the 50mm timber louvers to angle sunlight across ceilings or close completely for dense privacy and warm acoustic shielding.

### Operating Mechanism
Smooth cord-tilt and cord-lift with matching timber wand and tassels, or upgradeable to motorized tilt-and-lift automation.

### Suitable Rooms & Maintenance
Formal study rooms, libraries, living rooms, and master bedrooms. Dust regularly with a clean feather duster or dry microfiber cloth. Avoid wet washing.`,
    seoTitle: "Artisan 50mm Basswood Venetian Blinds | Genuine Timber",
    metaDescription: "Genuine kiln-dried basswood wooden venetian blinds. 50mm slats with decorative cloth tapes, custom made to measure in Srinagar by Wall Street Interiors.",
    variations: [
      {
        skuSuffix: "OAK-50",
        priceDelta: 0,
        stock: 15,
        attributes: [
          { attributeName: "Wood Stain", attributeSlug: "wood-stain", value: "Natural Honey Oak", valueSlug: "honey-oak", colorCode: "#C89D7C" },
          { attributeName: "Ladder Style", attributeSlug: "ladder-style", value: "Decorative Cloth Tape", valueSlug: "cloth-tape" },
        ],
      },
      {
        skuSuffix: "WALNUT-50",
        priceDelta: 250,
        stock: 15,
        attributes: [
          { attributeName: "Wood Stain", attributeSlug: "wood-stain", value: "Dark Walnut", valueSlug: "dark-walnut", colorCode: "#4A3728" },
          { attributeName: "Ladder Style", attributeSlug: "ladder-style", value: "Decorative Cloth Tape", valueSlug: "cloth-tape" },
        ],
      },
      {
        skuSuffix: "WHITE-50",
        priceDelta: 0,
        stock: 10,
        attributes: [
          { attributeName: "Wood Stain", attributeSlug: "wood-stain", value: "Nordic Satin White", valueSlug: "nordic-white", colorCode: "#F8FAFC" },
          { attributeName: "Ladder Style", attributeSlug: "ladder-style", value: "Standard String Ladder", valueSlug: "string-ladder" },
        ],
      },
    ],
  },
  {
    name: "ThermaCell Cordless Honeycomb Cellular Blind",
    slug: "thermacell-honeycomb-cellular-blind",
    sku: "WSI-WB-THERMACELL-02",
    brand: "Wall Street Atelier",
    categorySlug: "window-blinds",
    categoryName: "Window Blinds",
    salePrice: 4350,
    originalPrice: 5800,
    stock: 35,
    badge: "Energy Saving",
    isBestSeller: false,
    isFeatured: true,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 24.00,
    customSizeMinPrice: 2100.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Engineered honeycomb air pockets trapping warmth in winter and blocking heat in summer. Cordless push-pull control.",
    description: `### Product Overview
ThermaCell Honeycomb Blinds are the highest energy-saving window coverings engineered for temperature-sensitive climates. Built with hexagonal air-trapping cells, they create a permanent thermal barrier against frigid window panes, dramatically cutting winter heating utility costs.

### Material & Construction
Durable spun-bonded non-woven polyester fabric with crisp permanent pleat memory. Resists crushing and pops back into shape immediately after compression.

### Design & Light Control
Available in single-cell and double-cell structures. Diffuses harsh daylight into a radiant, shadowless illumination.

### Operating Mechanism
Cordless spring-tension push-pull lift mechanism: simply push the bottom rail up or pull it down by hand. 100% child and pet safe with zero dangling cords.

### Suitable Rooms & Maintenance
Bedrooms, nurseries, mountain villas, and energy-conscious homes. Dust with vacuum on lowest suction.`,
    seoTitle: "ThermaCell Honeycomb Cellular Blinds | Thermal Window Shades",
    metaDescription: "Energy-saving cellular honeycomb blinds in Srinagar. Cordless push-pull operation with insulating air pockets to keep your home warm in winter.",
    variations: [
      {
        skuSuffix: "SNGL-CRDLSS",
        priceDelta: 0,
        stock: 20,
        attributes: [
          { attributeName: "Cell Structure", attributeSlug: "cell-structure", value: "25mm Single Cell", valueSlug: "25mm-single" },
          { attributeName: "Control Mode", attributeSlug: "control-mode", value: "Cordless Push-Pull", valueSlug: "cordless-push" },
        ],
      },
      {
        skuSuffix: "DBL-TDBU",
        priceDelta: 500,
        stock: 15,
        attributes: [
          { attributeName: "Cell Structure", attributeSlug: "cell-structure", value: "38mm Double Cell", valueSlug: "38mm-double" },
          { attributeName: "Control Mode", attributeSlug: "control-mode", value: "Top-Down Bottom-Up", valueSlug: "top-down-bottom-up" },
        ],
      },
    ],
  },
  {
    name: "AeroPrecision 25mm Architectural Aluminum Venetian Blind",
    slug: "aeroprecision-aluminum-venetian-blind",
    sku: "WSI-WB-AEROALUM-03",
    brand: "Wall Street Atelier",
    categorySlug: "window-blinds",
    categoryName: "Window Blinds",
    salePrice: 2400,
    originalPrice: 3200,
    stock: 55,
    badge: "Moisture Proof",
    isBestSeller: false,
    isFeatured: false,
    isPopular: true,
    isOnSale: true,
    allowCustomSizing: true,
    customSizeUnit: "sq_ft",
    customSizeRate: 15.00,
    customSizeMinPrice: 1400.00,
    customSizeLinearMode: "length_plus_width",
    shortDescription: "Ultra-resilient 25mm bounce-back aluminum slats with baked-on enamel finish. 100% moisture and rust proof.",
    description: `### Product Overview
AeroPrecision Venetian Blinds combine sleek industrial minimalism with extreme durability. Fabricated from high-tensile 5005-alloy aluminum slats with permanent bounce-back flexibility, they resist accidental bending and are 100% immune to humidity, rust, and moisture.

### Material & Construction
Heavy-gauge 0.21mm aluminum slats finished with a baked polyester enamel coating. Enclosed in a color-matched powder-coated steel top and bottom cassette.

### Design & Light Control
Fine 25mm louvers tilt effortlessly through 180 degrees to direct light up towards ceilings or downward over desks without glare.

### Operating Mechanism
Clear acrylic tilt wand and color-coordinated polyester lift cords with automatic locking clutch.

### Suitable Rooms & Maintenance
Kitchens, luxury bathrooms, basements, medical laboratories, and commercial design studios. Fully washable with warm water and soap.`,
    seoTitle: "AeroPrecision 25mm Aluminum Venetian Blinds | Wall Street",
    metaDescription: "Bounce-back 25mm aluminum venetian blinds. Rustproof, moisture-proof, and easy to clean. Perfect for bathrooms, kitchens, and modern offices in Srinagar.",
    variations: [
      {
        skuSuffix: "BRUSH-SLV",
        priceDelta: 0,
        stock: 30,
        attributes: [
          { attributeName: "Slat Finish", attributeSlug: "slat-finish", value: "Brushed Aluminum Silver", valueSlug: "brushed-silver", colorCode: "#C0C0C0" },
          { attributeName: "Slat Width", attributeSlug: "slat-width", value: "25mm Architectural", valueSlug: "25mm-slat" },
        ],
      },
      {
        skuSuffix: "MATTE-BLK",
        priceDelta: 150,
        stock: 25,
        attributes: [
          { attributeName: "Slat Finish", attributeSlug: "slat-finish", value: "Matte Jet Black", valueSlug: "matte-black", colorCode: "#18181B" },
          { attributeName: "Slat Width", attributeSlug: "slat-width", value: "25mm Architectural", valueSlug: "25mm-slat" },
        ],
      },
    ],
  },
];

async function generateProductWebp(slug: string, title: string, category: string): Promise<string> {
  const filename = `${slug}.webp`;
  const filePath = path.join(PRODUCTS_IMAGE_DIR, filename);
  const publicPath = `/images/products/${filename}`;

  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const safeCategory = category.toUpperCase().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTitle = (title.length > 28 ? title.slice(0, 26) + '...' : title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `
    <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- Brand Header -->
      <line x1="80" y1="160" x2="140" y2="160" stroke="#FF4035" stroke-width="3" stroke-linecap="round"/>
      <text x="80" y="130" font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="3" fill="#94A3B8">WALL STREET ATELIER</text>
      
      <!-- Category & Title -->
      <text x="80" y="240" font-family="Arial, sans-serif" font-size="16" font-weight="600" letter-spacing="2" fill="#FF4035">${safeCategory}</text>
      <text x="80" y="320" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#FFFFFF">${safeTitle}</text>
      <text x="80" y="370" font-family="Arial, sans-serif" font-size="16" font-weight="400" fill="#CBD5E1">Custom Architectural Window Treatment</text>
      
      <!-- Feature Badges -->
      <rect x="80" y="440" width="160" height="36" rx="18" fill="rgba(255,255,255,0.08)" />
      <text x="160" y="463" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#FFFFFF">MADE TO MEASURE</text>

      <rect x="260" y="440" width="160" height="36" rx="18" fill="rgba(255,64,53,0.15)" stroke="#FF4035" stroke-width="1" />
      <text x="340" y="463" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#FF4035">CUSTOM SIZING</text>

      <!-- Atelier Seal -->
      <circle cx="700" cy="700" r="50" fill="none" stroke="rgba(255,64,53,0.3)" stroke-width="2" />
      <text x="700" y="705" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="1" fill="#FF4035">AUTHENTIC</text>
    </svg>
  `;

  const webpBuffer = await sharp(Buffer.from(svg))
    .resize(800, 800)
    .webp({ quality: 80 })
    .toBuffer();

  fs.writeFileSync(filePath, webpBuffer);
  return publicPath;
}

export async function seedProducts() {
  console.log("\n=======================================================");
  console.log("  SEEDING 21 PREMIUM WINDOW BLINDS PRODUCTS");
  console.log("=======================================================\n");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3308),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce",
  });

  // Map to cache attribute IDs and value IDs
  const attrCache: Record<string, number> = {};
  const valCache: Record<string, number> = {};

  async function getOrCreateAttribute(name: string, slug: string): Promise<number> {
    if (attrCache[slug]) return attrCache[slug];
    const [rows] = await conn.query<RowDataPacket[]>("SELECT id FROM product_attributes WHERE slug = ? LIMIT 1", [slug]);
    if (rows.length > 0) {
      attrCache[slug] = rows[0].id;
      return rows[0].id;
    }
    const [res] = await conn.query<ResultSetHeader>("INSERT INTO product_attributes (name, slug) VALUES (?, ?)", [name, slug]);
    attrCache[slug] = res.insertId;
    return res.insertId;
  }

  async function getOrCreateValue(attrId: number, value: string, slug: string, colorCode?: string): Promise<number> {
    const key = `${attrId}:${slug}`;
    if (valCache[key]) return valCache[key];
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM product_attribute_values WHERE attribute_id = ? AND slug = ? LIMIT 1",
      [attrId, slug]
    );
    if (rows.length > 0) {
      valCache[key] = rows[0].id;
      return rows[0].id;
    }
    const [res] = await conn.query<ResultSetHeader>(
      "INSERT INTO product_attribute_values (attribute_id, value, slug, color_code) VALUES (?, ?, ?, ?)",
      [attrId, value, slug, colorCode || null]
    );
    valCache[key] = res.insertId;
    return res.insertId;
  }

  let createdProducts = 0;
  let updatedProducts = 0;
  let createdVariations = 0;

  for (const prod of PRODUCTS_DATA) {
    // 1. Ensure product image exists
    const imagePath = await generateProductWebp(prod.slug, prod.name, prod.categoryName);
    const galleryImagesJson = JSON.stringify([imagePath]);

    const discountPercent = Math.round(((prod.originalPrice - prod.salePrice) / prod.originalPrice) * 100);

    // 2. Check existing product
    const [existing] = await conn.query<RowDataPacket[]>("SELECT id FROM products WHERE slug = ? LIMIT 1", [prod.slug]);
    let productId: number;

    const upsertProductQuery = `
      INSERT INTO products (
        name, slug, category_slug, category_name, subcategory_slug, subcategory_name,
        short_description, description, price, original_price, discount_percent,
        rating, reviews_count, image, gallery_images, badge, brand,
        is_best_seller, is_featured, is_popular, is_on_sale,
        has_variations, allow_custom_sizing, custom_size_rate, custom_size_unit,
        custom_size_min_price, custom_size_linear_mode, stock, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        category_slug = VALUES(category_slug),
        category_name = VALUES(category_name),
        subcategory_slug = VALUES(subcategory_slug),
        subcategory_name = VALUES(subcategory_name),
        short_description = VALUES(short_description),
        description = VALUES(description),
        price = VALUES(price),
        original_price = VALUES(original_price),
        discount_percent = VALUES(discount_percent),
        image = VALUES(image),
        gallery_images = VALUES(gallery_images),
        badge = VALUES(badge),
        brand = VALUES(brand),
        is_best_seller = VALUES(is_best_seller),
        is_featured = VALUES(is_featured),
        is_popular = VALUES(is_popular),
        is_on_sale = VALUES(is_on_sale),
        has_variations = VALUES(has_variations),
        allow_custom_sizing = VALUES(allow_custom_sizing),
        custom_size_rate = VALUES(custom_size_rate),
        custom_size_unit = VALUES(custom_size_unit),
        custom_size_min_price = VALUES(custom_size_min_price),
        custom_size_linear_mode = VALUES(custom_size_linear_mode),
        stock = VALUES(stock),
        status = 'active'
    `;

    const productValues = [
      prod.name,
      prod.slug,
      prod.categorySlug,
      prod.categoryName,
      prod.subcategorySlug || null,
      prod.subcategoryName || null,
      prod.shortDescription,
      prod.description,
      prod.salePrice,
      prod.originalPrice,
      discountPercent,
      5.0,
      12,
      imagePath,
      galleryImagesJson,
      prod.badge,
      prod.brand,
      prod.isBestSeller ? 1 : 0,
      prod.isFeatured ? 1 : 0,
      prod.isPopular ? 1 : 0,
      prod.isOnSale ? 1 : 0,
      prod.variations.length > 0 ? 1 : 0,
      prod.allowCustomSizing ? 1 : 0,
      prod.customSizeRate,
      prod.customSizeUnit,
      prod.customSizeMinPrice,
      prod.customSizeLinearMode,
      prod.stock,
    ];

    if (existing.length === 0) {
      const [insertRes] = await conn.query<ResultSetHeader>(upsertProductQuery, productValues);
      productId = insertRes.insertId;
      createdProducts++;
      console.log(`  [CREATED PRODUCT] #${productId} ${prod.name} (${prod.categoryName})`);
    } else {
      productId = existing[0].id;
      await conn.query(upsertProductQuery, productValues);
      updatedProducts++;
      console.log(`  [UPDATED PRODUCT] #${productId} ${prod.name}`);
    }

    // 3. Upsert dynamic variations
    for (const v of prod.variations) {
      const varSku = `${prod.sku}-${v.skuSuffix}`;
      const varPrice = prod.salePrice + v.priceDelta;
      const varOriginalPrice = prod.originalPrice + v.priceDelta;

      const [existingVar] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM product_variations WHERE product_id = ? AND sku = ? LIMIT 1",
        [productId, varSku]
      );

      let variationId: number;
      if (existingVar.length === 0) {
        const [varRes] = await conn.query<ResultSetHeader>(
          `INSERT INTO product_variations (product_id, sku, price, original_price, stock, image, is_active)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [productId, varSku, varPrice, varOriginalPrice, v.stock, imagePath]
        );
        variationId = varRes.insertId;
        createdVariations++;
      } else {
        variationId = existingVar[0].id;
        await conn.query(
          `UPDATE product_variations SET price = ?, original_price = ?, stock = ?, image = ?, is_active = 1 WHERE id = ?`,
          [varPrice, varOriginalPrice, v.stock, imagePath, variationId]
        );
      }

      // Link variation attribute values
      for (const attr of v.attributes) {
        const attrId = await getOrCreateAttribute(attr.attributeName, attr.attributeSlug);
        const valId = await getOrCreateValue(attrId, attr.value, attr.valueSlug, attr.colorCode);

        await conn.query(
          `INSERT INTO product_variation_values (variation_id, attribute_id, value_id)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE value_id = VALUES(value_id)`,
          [variationId, attrId, valId]
        );
      }
    }
  }

  // 4. Update item_count in product_categories
  console.log("\n  [INFO] Updating category product counts...");
  await conn.query(`
    UPDATE product_categories c
    SET item_count = (
      SELECT COUNT(*)
      FROM products p
      WHERE p.status = 'active'
        AND (
          p.category_slug = c.slug
          OR p.subcategory_slug = c.slug
          OR (c.parent_id IS NULL AND p.category_slug IN (SELECT sub.slug FROM product_categories sub WHERE sub.parent_id = c.id))
        )
    )
  `);

  await conn.end();

  console.log("\n=======================================================");
  console.log("  SEED RESULTS SUMMARY");
  console.log("=======================================================");
  console.log(`  Products Created:     ${createdProducts}`);
  console.log(`  Products Updated:     ${updatedProducts}`);
  console.log(`  Total Products:       ${PRODUCTS_DATA.length}`);
  console.log(`  Variations Seeded:    ${createdVariations}`);
  console.log("=======================================================\n");
}

seedProducts().catch((err) => {
  console.error("Fatal product seeding error:", err);
  process.exit(1);
});

