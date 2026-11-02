const mysql = require("mysql2/promise");

async function main() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3308,
    user: "root",
    password: "",
    database: "ecommerce",
    charset: "utf8mb4",
  });

  console.log("Connected to MySQL database.");

  // 1. Core Product Categories
  const categoriesToUpsert = [
    {
      name: "Wallpapers",
      slug: "wallpapers",
      icon_type: "fa-solid fa-scroll",
      image: "/assets/images/category/categoryThumb1_1.jpg",
      item_count: 4,
      sort_order: 1,
      is_featured: 1,
      short_description: "Importer-direct European & Asian luxury 3D embossed vinyl, textured linen, and bespoke wall murals for Kashmir homes.",
      description: "Looking for the finest wallpaper shop in Srinagar? Wall Street Interiors is Kashmir's premier importer-direct interior materials house with our experience showroom at Habba Kadal and central godown at Fateh Kadal. Unlike small local retailers with limited catalog swatches or generic online sites, we import directly from world-class manufacturers in Europe and Asia. From heavy washable 3D textured wallpapers, non-woven luxury damasks, and moisture-resistant vinyl wallpapers to custom panoramic murals and children's room themes, our live stock allows you to touch and feel authentic embossed textures before installation. We provide both retail supply and wholesale trade pricing for contractors, interior designers, and hotel fit-outs across Kashmir.",
      key_features: JSON.stringify([
        "Importer-Direct Wholesale & Retail Rates with Zero Middleman Markup",
        "Moisture-Resistant Heavy Vinyl & Washable Non-Woven Substrates",
        "Hundreds of Roll Designs Stocked Live at Our Srinagar Showroom & Godown",
        "Anti-Mildew & Anti-Fungal Formulations Built for Kashmir Winters",
        "Turnkey Professional Wallpaper Hanging & Installation Across Srinagar",
      ]),
      best_for: JSON.stringify([
        "Drawing Rooms & Traditional Baithaks",
        "Master Bed Chambers & Feature Accent Walls",
        "Kashmiri Wedding Season Room Makeovers",
        "Hotels, Houseboats & Boutique Cafes",
        "Bespoke Kids & Study Bedrooms",
      ]),
      materials: JSON.stringify(["Heavy Washable Vinyl", "Non-Woven Fiber", "Embossed Foil", "Textured Linen Substrate"]),
      control_types: JSON.stringify(["Roll Width: 53cm / 106cm", "Custom Seamless Murals", "Paste-The-Wall Application"]),
      seo_title: "Wallpaper Shop in Srinagar | 3D & Textured Wallpapers Kashmir | Wall Street Interiors",
      meta_description: "Srinagar's importer-direct wallpaper house. Browse 3D, textured, luxury European & kids wallpapers at wholesale prices. Visit Habba Kadal showroom or WhatsApp +919018454526.",
      focus_keywords: "wallpaper shop in Srinagar, 3D wallpaper Srinagar, textured wallpaper Kashmir, wallpaper price in Srinagar, wholesale wallpaper Kashmir, Wall Street Interiors, Habba Kadal wallpaper",
      image_alt: "Luxury 3D Embossed Designer Wallpaper in Srinagar Kashmir",
      faq_json: JSON.stringify([
        {
          question: "Where is your wallpaper showroom located in Srinagar?",
          answer: "Our retail experience showroom is located near New Habba Kadal Bridge, Srinagar, with our bulk central godown near Syed Ali Akbar Mosque, Fateh Kadal. You can browse physical catalogs and live roll stock 6 days a week.",
        },
        {
          question: "What is the average wallpaper price in Srinagar?",
          answer: "Because Wall Street Interiors is an importer-direct house, our wholesale and retail rates start from budget-friendly options up to ultra-luxury imported European embossed collections. Contact us on WhatsApp (+91 9018454526) with your room dimensions for an immediate estimate.",
        },
        {
          question: "Are wallpapers durable against Srinagar's winter cold and moisture?",
          answer: "Yes! We specifically stock heavy-duty non-woven and vinyl-coated wallpapers that resist cold room temperature fluctuations, prevent peeling during frosty winter dampness, and can be easily wiped clean.",
        },
        {
          question: "Can I order via WhatsApp from outside Srinagar?",
          answer: "Absolutely. Send photos or wall measurements to +91 9018454526. We will share video catalogs, high-resolution swatches, and dispatch direct to your doorstep anywhere in Kashmir or India.",
        },
      ]),
    },
    {
      name: "Wooden Flooring",
      slug: "wooden-flooring",
      icon_type: "fa-solid fa-layer-group",
      image: "/assets/images/category/categoryThumb1_2.jpg",
      item_count: 3,
      sort_order: 2,
      is_featured: 1,
      short_description: "High-density German AC4/AC5 laminate, engineered hardwood, and herringbone wooden flooring engineered to insulate Kashmir homes against freezing winters.",
      description: "Looking for premium wooden flooring in Srinagar? Wall Street Interiors supplies importer-direct AC4 and AC5 scratch-resistant German laminate, engineered hardwood planks, and classic herringbone parquet designed specifically for Kashmir's sub-zero winter temperatures and heating setups. Unlike cold tiled surfaces, our multi-layer HDF moisture-shielded flooring creates natural thermal insulation, holding room heat efficiently whether you use Hamams, Bukharies, or central heating. Visit our Habba Kadal showroom or Fateh Kadal godown to walk on real installed samples and explore factory-direct wholesale and retail rates.",
      key_features: JSON.stringify([
        "Thermal Core Insulation: Retains Ambient Room Heat Against Sub-Zero Temperatures",
        "High-Density Moisture-Shield HDF Core Resistant to Seasonal Expansion",
        "AC4 & AC5 Heavy Commercial Wear Ratings: Scratch & Dent Resistant",
        "Underfloor Heating and Radiator Compatible Uniclic Locking Mechanism",
        "Massive In-Stock Planks for Immediate Dispatch from Fateh Kadal Godown",
      ]),
      best_for: JSON.stringify([
        "Kashmir Winter Living Spaces & Lounge Areas",
        "Master Suites & Heritage Bedrooms",
        "Commercial Boutiques & Luxury Hotel Rooms",
        "Executive Offices & Conference Spaces",
      ]),
      materials: JSON.stringify(["German HDF Moisture Core", "European Oak Veneer", "Melamine Scratch Resin", "Sound-Dampening IXPE Underlay"]),
      control_types: JSON.stringify(["Uniclic Floating Fit", "Herringbone Interlock", "8mm / 12mm Commercial Thickness"]),
      seo_title: "Wooden Flooring in Srinagar | Laminate & Hardwood Kashmir | Wall Street Interiors",
      meta_description: "Importer-direct wooden flooring in Srinagar. German AC4/AC5 laminate, engineered hardwood & herringbone planks built for Kashmir cold winters. Showroom & wholesale depot.",
      focus_keywords: "wooden flooring Srinagar, laminate flooring Srinagar, engineered wood Kashmir, wooden flooring price Srinagar, best flooring for Kashmir cold weather, Wall Street Interiors",
      image_alt: "German AC4 Laminate Wooden Flooring Installation in Srinagar Kashmir",
      faq_json: JSON.stringify([
        {
          question: "Which flooring is best for Kashmir's cold weather?",
          answer: "Laminate and engineered wooden flooring are widely recognized as the warmest, most comfortable flooring solutions for Srinagar. Unlike stone or porcelain tiles which absorb winter frost, HDF laminate acts as a natural insulator, keeping your feet warm and significantly reducing heating costs.",
        },
        {
          question: "Does wooden flooring warp in Srinagar during winter dampness?",
          answer: "Our importer-direct flooring features precision-milled wax-sealed Uniclic edges and moisture-shield backing engineered specifically to withstand climatic humidity shifts without buckling or gapping.",
        },
        {
          question: "Do you supply wholesale for builders and contractors in Kashmir?",
          answer: "Yes. Wall Street Interiors operates a dedicated central wholesale godown near Syed Ali Akbar Mosque, Fateh Kadal, providing contractor discounts, consistent batch availability, and trade credit terms.",
        },
      ]),
    },
    {
      name: "PVC Panels & Flooring",
      slug: "pvc-panels-flooring",
      icon_type: "fa-solid fa-border-all",
      image: "/assets/images/category/categoryThumb1_3.jpg",
      item_count: 3,
      sort_order: 3,
      is_featured: 1,
      short_description: "100% waterproof fluted charcoal louvers, UV marble sheets, and PVC wall cladding designed to permanently resolve moisture and seepage issues in Kashmir homes.",
      description: "Tired of wall seepage, paint peeling, and winter moisture ruining your walls? Wall Street Interiors is Srinagar's leading importer-direct source for 100% waterproof PVC wall panels, architectural charcoal louvers, UV gloss marble sheets, and heavy-duty PVC flooring. Our modern interlocking panels conceal damp masonry, provide additional room insulation, and require zero painting or sanding. Perfect for quick renovations, wedding season home upgrades, bathrooms, and commercial fit-outs. See physical samples at our Habba Kadal showroom and get bulk wholesale supply from our Fateh Kadal godown.",
      key_features: JSON.stringify([
        "100% Waterproof & Termite-Proof: Permanently Eliminates Wall Seepage Issues",
        "Thermal & Sound Insulating Hollow Chamber Construction",
        "Pre-Finished Textures: Realistic Woodgrain, Fluted Charcoal & Italian Marble",
        "Quick Dry Installation: Transform Full Rooms in 24 to 48 Hours",
        "Zero Maintenance: Wipe-Clean Surface Without Yearly Paint Repainting",
      ]),
      best_for: JSON.stringify([
        "Seepage-Prone Ground Floors & Exterior-Facing Walls",
        "Feature TV Console Walls & Hallway Paneling",
        "Commercial Showrooms, Cafes & Restaurant Dining Rooms",
        "Quick Wedding Season Home Makeovers",
      ]),
      materials: JSON.stringify(["Virgin Polymer Resin", "Charcoal Polystyrene Core", "UV Polycarbonate Finish", "Flame-Retardant PVC"]),
      control_types: JSON.stringify(["Tongue & Groove Interlock", "Seamless Click Fitting", "Hidden Fastener Clips"]),
      seo_title: "PVC Panels Srinagar | Waterproof Wall Cladding & Louvers Kashmir | Wall Street Interiors",
      meta_description: "Buy waterproof PVC wall panels, charcoal louvers & PVC flooring in Srinagar at wholesale prices. 100% moisture & seepage proof for Kashmir homes. Habba Kadal showroom.",
      focus_keywords: "PVC panels Srinagar, PVC wall panels Kashmir, charcoal louvers Srinagar, PVC flooring Srinagar, waterproof wall panels Kashmir, interior shop in Srinagar",
      image_alt: "Waterproof Fluted Charcoal PVC Wall Panels in Srinagar Kashmir",
      faq_json: JSON.stringify([
        {
          question: "Can PVC panels solve wall dampness in Srinagar houses?",
          answer: "Yes! PVC panels provide an impermeable physical barrier over damp or peeling plastered walls. Because they are 100% non-porous and installed on concealed furring strips, moisture never penetrates through to the living space.",
        },
        {
          question: "How fast can a room be transformed with PVC panels?",
          answer: "Most average-sized rooms in Srinagar can be completely cladded within 1 to 2 days without mess, dust, or wet cement odors.",
        },
      ]),
    },
    {
      name: "Faux Tin Ceilings",
      slug: "faux-tin-ceilings",
      icon_type: "fa-solid fa-crown",
      image: "/assets/images/category/categoryThumb1_4.jpg",
      item_count: 3,
      sort_order: 4,
      is_featured: 1,
      short_description: "Lightweight 3D embossed metallic and vintage faux tin ceiling tiles offering regal grandeur and thermal overhead insulation for Kashmir drawing rooms and halls.",
      description: "Looking for a breathtaking, regal ceiling finish without the exorbitant expense and long delay of traditional woodwork? Wall Street Interiors is the exclusive importer-direct supplier of architectural faux tin ceiling panels and 3D embossed metallic ceiling tiles in Srinagar, Kashmir. Available in stunning antique copper, burnished brass, champagne gold, and royal matte white, these lightweight panels provide majestic acoustic balance, thermal overhead barrier, and timeless grandeur. Visit our Habba Kadal showroom to inspect the dimensional relief patterns or order wholesale for hotel and banquet projects across the Valley.",
      key_features: JSON.stringify([
        "Authentic 3D Deep Relief Embossing in Antique Copper, Gold & Royal White",
        "Ultra-Lightweight & Drop-In / Glue-Up Grid Compatible",
        "Fire-Retardant Class A & 100% Rust / Moisture-Resistant",
        "Thermal Overhead Shield: Minimizes Winter Heat Loss Through Ceilings",
        "Immediate Wholesale Stock Ready in Fateh Kadal Godown",
      ]),
      best_for: JSON.stringify([
        "Heritage Drawing Rooms & Traditional Kashmir Baithaks",
        "Luxury Hotel Lobbies, Houseboats & Boutique Cafes",
        "Banquet Halls & Marriage Function Venues",
        "High-End Residential Dining & Entrance Lobbies",
      ]),
      materials: JSON.stringify(["Thermoformed Architectural Polymer", "Vacuum-Metalized Coating", "Class A Fire-Rated Core"]),
      control_types: JSON.stringify(["Standard 2ft x 2ft (600x600mm)", "Direct Glue-Up or Drop-In Grid", "Overlapping Seam Edges"]),
      seo_title: "Faux Tin Ceilings in Srinagar | 3D Decorative Ceiling Panels Kashmir | Wall Street Interiors",
      meta_description: "Importer-direct faux tin ceilings & 3D metallic embossed ceiling tiles in Srinagar, Kashmir. Elegant antique copper, brass & royal white finishes at wholesale rates.",
      focus_keywords: "faux tin ceiling Kashmir, faux tin ceiling tiles Srinagar, 3D ceiling panels Srinagar, decorative ceiling Srinagar, Khatamband alternative Srinagar, Wall Street Interiors",
      image_alt: "3D Metallic Embossed Faux Tin Ceiling Panels in Srinagar Kashmir",
      faq_json: JSON.stringify([
        {
          question: "What are faux tin ceilings made of and do they rust in Kashmir?",
          answer: "Our faux tin ceiling tiles are crafted from high-grade thermoformed architectural polymer with multi-layer metallic vacuum plating. They never rust, corrode, or react to winter dampness, unlike real sheet metal.",
        },
        {
          question: "How do faux tin ceilings compare with traditional wood Khatamband?",
          answer: "While Khatamband is a treasured local art, faux tin ceilings offer a lighter, zero-maintenance, moisture-impervious alternative that installs in a fraction of the time and at a significantly lower cost, while delivering unmatched royal European and Mughal aesthetic charm.",
        },
      ]),
    },
    {
      name: "Window Blinds",
      slug: "window-blinds",
      icon_type: "fa-solid fa-shapes",
      image: "/assets/images/category/categoryThumb1_5.jpg",
      item_count: 21,
      sort_order: 5,
      is_featured: 1,
      short_description: "Precision made-to-measure roller blinds, day & night zebra blinds, acoustic verticals, and smart motorized blinds engineered for Kashmir sunshine and insulation.",
      description: "Custom window blinds manufactured to millimeter precision for Srinagar homes, offices, hotels, and hospitals. From thermal blackout roller blinds and day-and-night dual sheer zebra shades to motorized smart blinds operated via smartphone or remote control. Direct showroom measurement assistance across Srinagar and fast delivery.",
      key_features: JSON.stringify([
        "Custom Made-to-Measure Fabrication to Exact Window Dimensions",
        "Thermal Blackout & UV Sunscreen Fabrics for Winter Insulation & Summer Glare",
        "Rechargeable Whisper-Quiet Smart Motorization Compatible with Alexa & Google",
        "Heavy-Duty Powder-Coated Aluminum Top Cassettes & Bottom Rails",
        "On-Site Measurement & Professional Fitting Available Across Srinagar",
      ]),
      best_for: JSON.stringify([
        "Modern Living Rooms & Sunrooms",
        "Bedrooms Requiring 100% Thermal Blackout",
        "Executive Offices & Commercial Glazing",
        "Double-Height Bay Windows & Hard-to-Reach Skylights",
      ]),
      materials: JSON.stringify(["Thermal Blackout Polyester", "Sunscreen Mesh 3%", "Antistatic Dust-Repellent Fabric", "Aviation-Grade Aluminum"]),
      control_types: JSON.stringify(["Smooth Cordless Spring", "Continuous Nickel Chain", "Smart RF Remote & Wi-Fi App"]),
      seo_title: "Window Blinds in Srinagar | Roller, Zebra & Motorized Blinds Kashmir | Wall Street Interiors",
      meta_description: "Importer-direct window blinds in Srinagar. Custom made-to-measure zebra, roller, roman, vertical & smart motorized blinds with on-site measuring & WhatsApp quote.",
      focus_keywords: "window blinds Srinagar, roller blinds Kashmir, zebra blinds Srinagar, vertical blinds price Srinagar, motorized blinds Kashmir, Wall Street Interiors",
      image_alt: "Custom Made-to-Measure Window Blinds in Srinagar Kashmir",
      faq_json: JSON.stringify([
        {
          question: "Do you offer in-home measurement for blinds in Srinagar?",
          answer: "Yes, our technical team provides on-site window measurement and physical fabric catalog swatches at your doorstep throughout Srinagar.",
        },
        {
          question: "Can blinds help insulate windows in Kashmir winters?",
          answer: "Absolutely. Our thermal blackout and cellular honeycomb blinds create an insulating air pocket against glass panes, reducing cold drafts and cutting room heat loss by up to 35%.",
        },
      ]),
    },
  ];

  for (const cat of categoriesToUpsert) {
    const [existing] = await connection.query(
      "SELECT id FROM product_categories WHERE slug = ?",
      [cat.slug]
    );

    if (existing.length > 0) {
      await connection.query(
        `UPDATE product_categories SET 
          name = ?, icon_type = ?, image = COALESCE(image, ?), item_count = ?, sort_order = ?,
          is_featured = ?, short_description = ?, description = ?, key_features = ?,
          best_for = ?, materials = ?, control_types = ?, seo_title = ?, meta_description = ?,
          focus_keywords = ?, image_alt = ?, faq_json = ?, is_active = 1
        WHERE slug = ?`,
        [
          cat.name, cat.icon_type, cat.image, cat.item_count, cat.sort_order,
          cat.is_featured, cat.short_description, cat.description, cat.key_features,
          cat.best_for, cat.materials, cat.control_types, cat.seo_title, cat.meta_description,
          cat.focus_keywords, cat.image_alt, cat.faq_json, cat.slug,
        ]
      );
      console.log(`Updated category: ${cat.name} (${cat.slug})`);
    } else {
      await connection.query(
        `INSERT INTO product_categories 
          (name, slug, icon_type, image, item_count, sort_order, is_featured, short_description, description, key_features, best_for, materials, control_types, seo_title, meta_description, focus_keywords, image_alt, faq_json, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          cat.name, cat.slug, cat.icon_type, cat.image, cat.item_count, cat.sort_order,
          cat.is_featured, cat.short_description, cat.description, cat.key_features,
          cat.best_for, cat.materials, cat.control_types, cat.seo_title, cat.meta_description,
          cat.focus_keywords, cat.image_alt, cat.faq_json,
        ]
      );
      console.log(`Inserted category: ${cat.name} (${cat.slug})`);
    }
  }

  // 2. Representative Products for the new categories
  const productsToUpsert = [
    // Wallpapers
    {
      name: "Royal Damask Imperial 3D Embossed Vinyl Wallpaper",
      slug: "royal-damask-3d-embossed-wallpaper",
      category_slug: "wallpapers",
      category_name: "Wallpapers",
      short_description: "Srinagar's premier importer-direct heavy vinyl 3D wallpaper, crafted for drawing rooms and accent walls across Kashmir.",
      description: "Experience royal luxury with the Royal Damask Imperial 3D Embossed Wallpaper, exclusively imported by Wall Street Interiors Srinagar. Engineered with deep sculptural relief embossing on a heavy non-woven vinyl base, this wallpaper adds grandeur to Kashmir drawing rooms, master suites, and wedding celebration venues. Unlike delicate paper alternatives, its heavy-gauge vinyl is moisture-resistant, washable, and insulated against frosty winter dampness. Available for immediate pickup at our Habba Kadal showroom and wholesale dispatch from our Fateh Kadal godown.",
      price: 2450,
      original_price: 3200,
      discount_percent: 23,
      rating: 4.9,
      reviews_count: 28,
      image: "/assets/images/category/categoryThumb1_1.jpg",
      badge: "Importer Direct",
      brand: "Wall Street Heritage",
      is_best_seller: 1,
      is_featured: 1,
      stock: 120,
    },
    {
      name: "Nordic Minimalist Textured Linen Non-Woven Wallpaper",
      slug: "nordic-textured-linen-wallpaper",
      category_slug: "wallpapers",
      category_name: "Wallpapers",
      short_description: "European imported subtle textured linen wallpaper for serene living and bedroom sanctuaries in Srinagar.",
      description: "Designed for modern architects and homeowners in Kashmir, the Nordic Textured Linen Wallpaper combines tactile warmth with Scandinavian elegance. Its micro-embossed woven texture diffuses ambient light softly, concealing minor masonry imperfections common in older plaster walls. Highly breathable and anti-mildew formulated to endure freezing Kashmir winters without lifting or peeling.",
      price: 2150,
      original_price: 2800,
      discount_percent: 23,
      rating: 4.8,
      reviews_count: 19,
      image: "/assets/images/category/categoryThumb1_1.jpg",
      badge: "Popular",
      brand: "Nordic Luxe",
      is_popular: 1,
      is_featured: 1,
      stock: 95,
    },
    {
      name: "Kashmir Botanical Bespoke Heritage Wall Mural",
      slug: "kashmir-botanical-bespoke-mural-wallpaper",
      category_slug: "wallpapers",
      category_name: "Wallpapers",
      short_description: "Custom-scaled heritage floral and Chinar-inspired artistic wall mural, imported direct and sized to your exact room dimensions.",
      description: "A showstopping statement piece for luxury villas, boutique hotels, and dining rooms in Srinagar. This botanical wall mural incorporates timeless floral and Chinar foliage motifs on a seamless matte non-woven canvas. Each mural is custom printed and scaled to your exact wall height and width, creating a continuous masterpiece without visible vertical joins.",
      price: 4800,
      original_price: 6500,
      discount_percent: 26,
      rating: 5.0,
      reviews_count: 14,
      image: "/assets/images/category/categoryThumb1_1.jpg",
      badge: "Bespoke",
      brand: "Wall Street Heritage",
      is_featured: 1,
      stock: 45,
    },

    // Wooden Flooring
    {
      name: "Bavaria Alpine Oak AC4 German Laminate Wooden Flooring",
      slug: "bavaria-alpine-oak-laminate-flooring",
      category_slug: "wooden-flooring",
      category_name: "Wooden Flooring",
      short_description: "High-density German AC4 scratch-resistant laminate flooring. Multi-layer thermal moisture-shield HDF core engineered for cold Kashmir winters.",
      description: "Transform your home with the natural warmth and acoustic comfort of Bavaria Alpine Oak laminate flooring, imported directly to Srinagar by Wall Street Interiors. Featuring a heavy-density 8.3mm wax-sealed HDF core, this flooring provides exceptional thermal insulation against sub-zero winter temperatures, keeping rooms significantly warmer than cold ceramic or marble tiles. Fully compatible with underfloor heating systems and resistant to seasonal expansion. Visit our Habba Kadal showroom to walk on real installed samples.",
      price: 145,
      original_price: 195,
      discount_percent: 25,
      rating: 4.9,
      reviews_count: 34,
      image: "/assets/images/category/categoryThumb1_2.jpg",
      badge: "Best for Kashmir Winters",
      brand: "Bavaria Timber",
      is_best_seller: 1,
      is_featured: 1,
      allow_custom_sizing: 1,
      custom_size_rate: 145,
      custom_size_unit: "sq_ft",
      stock: 4500,
    },
    {
      name: "Nordic Smoked Oak Herringbone Parquet Flooring",
      slug: "nordic-smoked-oak-herringbone-parquet",
      category_slug: "wooden-flooring",
      category_name: "Wooden Flooring",
      short_description: "Classic herringbone parquet with precision Uniclic locking. Built for Kashmir heritage homes, boutique hotels, and luxury master bedrooms.",
      description: "The timeless grandeur of royal European parquet, right here in Srinagar. Nordic Smoked Oak Herringbone features precision micro-beveled planks designed for left-and-right interlocking herringbone layouts. With an AC5 commercial wear rating and wax-sealed edges, it withstands high foot traffic, wedding gatherings, and harsh winter moisture with grace. Central godown stock available at Fateh Kadal for immediate trade dispatch.",
      price: 210,
      original_price: 290,
      discount_percent: 27,
      rating: 5.0,
      reviews_count: 22,
      image: "/assets/images/category/categoryThumb1_2.jpg",
      badge: "Architect's Choice",
      brand: "Nordic Luxe",
      is_featured: 1,
      allow_custom_sizing: 1,
      custom_size_rate: 210,
      custom_size_unit: "sq_ft",
      stock: 2800,
    },

    // PVC Panels & Flooring
    {
      name: "Architectural Fluted Charcoal Wall Louver Panel",
      slug: "architectural-fluted-charcoal-louver-panel",
      category_slug: "pvc-panels-flooring",
      category_name: "PVC Panels & Flooring",
      short_description: "100% waterproof fluted charcoal wall louvers. Conceals dampness and wall seepage permanently, giving Srinagar homes modern 3D luxury.",
      description: "Permanently solve wall dampness, paint peeling, and winter moisture while upgrading your interiors to 5-star hotel luxury. Imported directly by Wall Street Interiors, our Architectural Fluted Charcoal Louver Panels are manufactured from 100% waterproof high-density polystyrene. Ideal for TV backdrop walls, bed feature heads, and hallway cladding. Lightweight, fire-retardant, and requires zero painting or sanding.",
      price: 680,
      original_price: 950,
      discount_percent: 28,
      rating: 4.9,
      reviews_count: 41,
      image: "/assets/images/category/categoryThumb1_3.jpg",
      badge: "100% Waterproof",
      brand: "Wall Street Architectural",
      is_best_seller: 1,
      is_featured: 1,
      stock: 450,
    },
    {
      name: "Calacatta Gold UV Gloss Waterproof Marble Wall Sheet",
      slug: "calacatta-gold-uv-marble-wall-sheet",
      category_slug: "pvc-panels-flooring",
      category_name: "PVC Panels & Flooring",
      short_description: "High-gloss UV marble sheet with realistic Italian Calacatta gold veining. Eliminates cold stone weight and moisture absorption.",
      description: "Enjoy the radiant luxury of Italian marble at a fraction of the cost, weight, and installation time. Our 8ft x 4ft Calacatta Gold UV marble sheets feature multi-layer scratch-resistant polyurethane lacquer over a high-density PVC composite. 100% moisture-impervious, termite-proof, and washable, making it perfect for Srinagar bathrooms, kitchen backsplashes, and commercial lobby accent walls.",
      price: 1850,
      original_price: 2500,
      discount_percent: 26,
      rating: 4.8,
      reviews_count: 18,
      image: "/assets/images/category/categoryThumb1_3.jpg",
      badge: "Hot Sell",
      brand: "Wall Street Architectural",
      is_popular: 1,
      is_featured: 1,
      stock: 160,
    },

    // Faux Tin Ceilings
    {
      name: "Royal Antique Copper 3D Embossed Faux Tin Ceiling Tile",
      slug: "royal-antique-copper-faux-tin-ceiling-tile",
      category_slug: "faux-tin-ceilings",
      category_name: "Faux Tin Ceilings",
      short_description: "Majestic 3D embossed antique copper ceiling panel. Lightweight, rust-proof, and fire-retardant overhead grandeur for Srinagar drawing rooms.",
      description: "Recreate the regal splendor of historic palaces in your Kashmir home with the Royal Antique Copper 3D Embossed Faux Tin Ceiling Tile. Exclusively imported by Wall Street Interiors, each 2ft x 2ft tile features deep ornamental embossing with an authentic vintage copper patina. Made from high-grade thermoformed architectural polymer, it will never rust, sag, or react to winter dampness. Can be glued directly to existing ceilings or dropped into standard T-bar grid systems. View live installations at our Habba Kadal showroom.",
      price: 380,
      original_price: 520,
      discount_percent: 27,
      rating: 4.9,
      reviews_count: 27,
      image: "/assets/images/category/categoryThumb1_4.jpg",
      badge: "Exclusive Import",
      brand: "Wall Street Heritage",
      is_best_seller: 1,
      is_featured: 1,
      stock: 800,
    },
    {
      name: "Versailles Champagne Gold Embossed Ceiling Panel",
      slug: "versailles-champagne-gold-ceiling-panel",
      category_slug: "faux-tin-ceilings",
      category_name: "Faux Tin Ceilings",
      short_description: "Regal European baroque embossed relief panel in radiant champagne gold. Easy grid drop-in or direct glue-up installation.",
      description: "Designed for grand drawing rooms, boutique hotel lobbies, and marriage banquet spaces across Srinagar. The Versailles Champagne Gold panel reflects overhead chandelier light with warmth and radiance. Ultra-lightweight and Class A fire-rated, it acts as an overhead thermal cushion that retains winter room heat. In-stock for immediate pickup or delivery from our Fateh Kadal godown.",
      price: 420,
      original_price: 580,
      discount_percent: 27,
      rating: 5.0,
      reviews_count: 16,
      image: "/assets/images/category/categoryThumb1_4.jpg",
      badge: "Luxury Gold",
      brand: "Wall Street Heritage",
      is_featured: 1,
      stock: 650,
    },
  ];

  for (const prod of productsToUpsert) {
    const [existing] = await connection.query(
      "SELECT id FROM products WHERE slug = ?",
      [prod.slug]
    );

    if (existing.length === 0) {
      await connection.query(
        `INSERT INTO products 
          (name, slug, category_slug, category_name, short_description, description, price, original_price, discount_percent, rating, reviews_count, image, badge, brand, is_best_seller, is_featured, is_popular, is_on_sale, stock, status, allow_custom_sizing, custom_size_rate, custom_size_unit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'active', ?, ?, ?)`,
        [
          prod.name,
          prod.slug,
          prod.category_slug,
          prod.category_name,
          prod.short_description,
          prod.description,
          prod.price,
          prod.original_price,
          prod.discount_percent,
          prod.rating,
          prod.reviews_count,
          prod.image,
          prod.badge || null,
          prod.brand || "Wall Street Interiors",
          prod.is_best_seller || 0,
          prod.is_featured || 0,
          prod.is_popular || 0,
          prod.stock || 50,
          prod.allow_custom_sizing || 0,
          prod.custom_size_rate || null,
          prod.custom_size_unit || null,
        ]
      );
      console.log(`Inserted product: ${prod.name}`);
    } else {
      await connection.query(
        `UPDATE products SET 
          name = ?, category_slug = ?, category_name = ?, short_description = ?, description = ?,
          price = ?, original_price = ?, discount_percent = ?, rating = ?, reviews_count = ?,
          badge = ?, brand = ?, is_best_seller = ?, is_featured = ?, is_popular = ?, stock = ?
        WHERE slug = ?`,
        [
          prod.name,
          prod.category_slug,
          prod.category_name,
          prod.short_description,
          prod.description,
          prod.price,
          prod.original_price,
          prod.discount_percent,
          prod.rating,
          prod.reviews_count,
          prod.badge || null,
          prod.brand || "Wall Street Interiors",
          prod.is_best_seller || 0,
          prod.is_featured || 0,
          prod.is_popular || 0,
          prod.stock || 50,
          prod.slug,
        ]
      );
      console.log(`Updated product: ${prod.name}`);
    }
  }

  // 3. Search-Optimized Blog Posts for Local SEO
  const blogsToUpsert = [
    {
      title: "Best Flooring for Kashmir's Cold Weather: Wood vs Laminate vs PVC",
      slug: "best-flooring-kashmir-cold-weather-wood-laminate-pvc",
      category: "Flooring Guides",
      excerpt: "A comprehensive guide on choosing the best flooring for Srinagar winters. Compare German laminate, engineered hardwood, and heavy-duty PVC for insulation, Hamam heating, and sub-zero durability.",
      meta_title: "Best Flooring for Kashmir's Cold Weather | Wood vs Laminate vs PVC Srinagar",
      meta_description: "Discover the best flooring for cold Kashmir winters. Compare German laminate, engineered wood & waterproof PVC for insulation and Hamam heating. Showroom in Srinagar.",
      content: `<h2>Why Flooring Choice Matters in Srinagar's Climate</h2>
<p>Kashmir's harsh winters, with temperatures frequently dropping well below freezing, place unique demands on interior materials. While traditional Kashmiri architecture favored brick, timber, and handwoven carpets, modern homeowners and renovators in Srinagar often struggle with stone or porcelain tiles that turn ice-cold to the touch and drain ambient room heat.</p>
<p>At <strong>Wall Street Interiors</strong> (Srinagar’s importer-direct materials house), we regularly guide homeowners, architects, and builders through the three primary modern flooring options: <strong>German AC4/AC5 Laminate Flooring</strong>, <strong>Engineered Hardwood</strong>, and <strong>Heavy-Duty PVC/Vinyl Plank Flooring</strong>. Here is how they stack up for Kashmir homes.</p>

<h3>1. German HDF Laminate Flooring: The Warmest Value Choice</h3>
<p>Laminate wooden flooring has quickly become Srinagar’s top choice for living rooms, bedrooms, and lounges. High-density fiberboard (HDF) acts as a natural thermal insulator. When paired with high-density IXPE foam underlay, laminate creates an effective barrier between icy concrete slabs and your living space.</p>
<ul>
  <li><strong>Thermal Comfort:</strong> Retains room heat efficiently, warming quickly when Bukharies, AC heat pumps, or electric radiators are turned on.</li>
  <li><strong>Durability:</strong> Our AC4 and AC5 commercial wear layers resist heavy furniture indents, winter boots, and lively family gatherings during wedding season.</li>
  <li><strong>Cost:</strong> Importer-direct wholesale pricing makes it considerably more affordable than solid timber while delivering authentic oak, walnut, and teak textures.</li>
</ul>

<h3>2. Engineered Hardwood: Heirloom Elegance with Heating Stability</h3>
<p>Solid wood planks often buckle or gap in Kashmir due to intense humidity shifts between humid monsoon dampness and dry winter indoor heating. Engineered hardwood solves this completely. Constructed from multi-ply cross-laminated birch beneath a thick European oak or American walnut top layer, it remains dimensionally stable even above underfloor heating setups and traditional warm Hamam floors.</p>

<h3>3. Waterproof PVC Plank Flooring: The Zero-Moisture Champion</h3>
<p>For ground floor rooms, basements, and moisture-prone areas near waterbodies or canals in old Srinagar, PVC flooring is unbeatable. Being 100% waterproof, it completely eliminates concerns of rot, swelling, or mold, providing warm underfoot comfort in spaces where wood might struggle.</p>

<h3>Touch & Compare at Our Srinagar Showroom</h3>
<p>Don't make your decision from a tiny catalog thumbnail. Visit our experience showroom near <strong>New Habba Kadal Bridge</strong> or our wholesale godown near <strong>Syed Ali Akbar Mosque, Fateh Kadal</strong> to walk on fully installed floor mockups. You can also WhatsApp your room dimensions to <strong>+91 9018454526</strong> for an instant estimate.</p>`,
      featured_image: "/assets/images/category/categoryThumb1_2.jpg",
      author: "Wall Street Interiors Design Desk",
      status: "published",
      published_at: new Date("2026-10-15T10:00:00Z"),
    },
    {
      title: "Wallpaper vs Paint: Which Is Better for Srinagar Homes?",
      slug: "wallpaper-vs-paint-srinagar-homes",
      category: "Wall Coverings",
      excerpt: "Explore the pros, cons, costs, and winter durability of imported 3D wallpaper versus traditional paint in Kashmir. Learn why wallpaper provides better insulation and faster makeovers.",
      meta_title: "Wallpaper vs Paint in Srinagar | Cost, Durability & Winter Guide | Wall Street Interiors",
      meta_description: "Comparing wallpaper vs wall paint for Kashmir homes. Understand moisture resistance, winter durability, costs, and quick wedding season room makeovers in Srinagar.",
      content: `<h2>The Dilemma: Fresh Paint or Designer Wallpaper?</h2>
<p>Every year before Eid, festivals, or wedding season, homeowners across Srinagar debate whether to repaint their rooms or switch to modern wallpapers. In Kashmir’s climate, walls face extreme temperature swings, hairline plaster cracks, and persistent dampness that often leaves traditional wall paint flaking, peeling, or chalking within two seasons.</p>

<h3>1. Speed & Cleanliness: Transform Rooms in 24 Hours</h3>
<p>Painting a drawing room in Srinagar typically requires 4 to 7 days of scraping, sanding, primer coats, and drying time—accompanied by unpleasant chemical paint fumes that linger in cold, sealed rooms. In contrast, professional wallpaper installation by Wall Street Interiors is clean, virtually odorless, and can completely transform an entire drawing room in less than a day.</p>

<h3>2. Thermal Insulation & Wall Flaw Concealment</h3>
<p>Our heavy vinyl and non-woven 3D textured wallpapers provide a physical thermal barrier over cold masonry. The embossed texture effortlessly conceals settlement cracks, uneven plaster, and minor surface blemishes that high-gloss paint would otherwise exaggerate under room lighting.</p>

<h3>3. Cost & Longevity</h3>
<p>While basic paint may seem cheaper initially, it often demands repainting every 2–3 years in Kashmir. A high-quality imported European wallpaper roll from our Habba Kadal showroom lasts 10 to 15 years with minimal maintenance—requiring only an occasional wipe with a damp cloth.</p>

<h3>Visit Our Srinagar Showroom or Order on WhatsApp</h3>
<p>Browse hundreds of live rolls and international designer swatches at our showroom near New Habba Kadal Bridge. WhatsApp your wall photos to <strong>+91 9018454526</strong> for free pattern recommendations and quotes.</p>`,
      featured_image: "/assets/images/category/categoryThumb1_1.jpg",
      author: "Wall Street Interiors Design Desk",
      status: "published",
      published_at: new Date("2026-10-20T10:00:00Z"),
    },
    {
      title: "Wallpaper Price in Srinagar: A Complete Cost & Room Guide",
      slug: "wallpaper-price-srinagar-complete-cost-guide",
      category: "Pricing & Guides",
      excerpt: "How much does wallpaper cost in Srinagar? A transparent breakdown of roll prices, labor rates, room estimates, and importer-direct wholesale savings at Wall Street Interiors.",
      meta_title: "Wallpaper Price in Srinagar | Complete Cost & Room Estimate Guide",
      meta_description: "Find out actual wallpaper prices in Srinagar per roll and per square foot. Learn labor installation rates and wholesale trade pricing at Wall Street Interiors Kashmir.",
      content: `<h2>Understanding Wallpaper Pricing in Kashmir</h2>
<p>One of the most frequent questions we receive on our WhatsApp hotline (+91 9018454526) is: <em>"What is the price of wallpaper in Srinagar?"</em></p>
<p>Because Wall Street Interiors is an <strong>importer-direct house</strong> operating both a retail showroom at Habba Kadal and a central wholesale depot at Fateh Kadal, our pricing cuts out multiple tiers of middleman distributor markups. Here is a clear, transparent cost guide for 2026.</p>

<h3>Standard Roll Dimensions & Coverage</h3>
<p>Most imported wallpaper comes in standard roll sizes:</p>
<ul>
  <li><strong>Standard European Roll:</strong> 0.53 meters wide by 10 meters long (approx. 57 sq. ft.). Accounting for pattern matching and cuts, one roll comfortably covers about 50 sq. ft. of wall area.</li>
  <li><strong>Korean / Grand Width Roll:</strong> 1.06 meters wide by 15.6 meters long (approx. 178 sq. ft.), covering 150–160 sq. ft.</li>
</ul>

<h3>Price Tiers in Srinagar</h3>
<ul>
  <li><strong>Economy Textures & Vinyls:</strong> ₹1,200 to ₹1,800 per roll. Excellent for rental homes, kids' study nooks, and quick refreshes.</li>
  <li><strong>Mid-Range 3D Embossed & Washable Non-Woven:</strong> ₹1,850 to ₹2,800 per roll. Our most popular category for master bedrooms and living rooms in Srinagar.</li>
  <li><strong>Luxury European Damasks & Velvet Textures:</strong> ₹3,000 to ₹5,500 per roll. Featuring metallic foils, mica mineral chips, and plush dimensional relief for royal drawing rooms.</li>
  <li><strong>Custom Panoramic Murals:</strong> Sized to order from ₹90 to ₹160 per sq. ft.</li>
</ul>

<h3>Installation Labor Rates in Srinagar</h3>
<p>Professional hanging by experienced wallpaper artisans in Srinagar typically costs between ₹350 and ₹500 per roll, which includes specialist heavy-duty adhesive with anti-fungal treatment.</p>

<h3>Get an Instant Room Quote</h3>
<p>Measure your wall height and width, snap a photo on your phone, and send it to our WhatsApp desk at <strong>+91 9018454526</strong>. We will calculate the exact roll count and price within minutes.</p>`,
      featured_image: "/assets/images/category/categoryThumb1_1.jpg",
      author: "Wall Street Interiors Design Desk",
      status: "published",
      published_at: new Date("2026-10-25T10:00:00Z"),
    },
    {
      title: "How to Choose the Perfect Blinds for Your Living Room in Kashmir",
      slug: "how-to-choose-blinds-living-room-kashmir",
      category: "Window Treatments",
      excerpt: "Expert advice on selecting zebra, roller, roman, or motorized smart blinds for Kashmir homes. Balance winter insulation, summer daylight control, and effortless style.",
      meta_title: "How to Choose Blinds for Living Room in Kashmir | Srinagar Window Guide",
      meta_description: "Discover the best window blinds for Srinagar homes. Learn how Zebra blinds and motorized blackout roller shades provide privacy and winter thermal insulation.",
      content: `<h2>Windows in Kashmir: More Than Just Glass</h2>
<p>Windows in Kashmiri homes are celebrated architectural elements, offering views of snowcapped peaks, Chinars, and courtyard gardens. However, large glass surfaces are also where up to 35% of winter room heat escapes. The right window treatment must deliver two things simultaneously: <strong>exceptional thermal control</strong> and <strong>graceful light adjustment</strong>.</p>

<h3>1. Zebra Blinds: The Versatile Modern Favorite</h3>
<p>Dual sheer Zebra blinds feature alternating solid and translucent stripes. With a gentle pull of the chain or remote button, you can shift from diffused daylight to full privacy. They have rapidly replaced dusty traditional net curtains across modern Srinagar apartments and duplexes.</p>

<h3>2. Thermal Blackout Roller Blinds: The Winter Shield</h3>
<p>If your room faces cold north-westerly winds, heavy-gauge thermal blackout roller blinds with silver reflective backing create an airtight insulating barrier against freezing glass panes, drastically reducing fuel and heating electricity costs.</p>

<h3>3. Motorized Smart Blinds: Effortless Modern Luxury</h3>
<p>For double-height ceiling voids, stairwell glass walls, or comfortable bedroom lounging, rechargeable motorized blinds operate smoothly via handheld remote, smartphone app, or voice control with Alexa and Google Assistant.</p>

<h3>Free On-Site Window Measurement in Srinagar</h3>
<p>Our technicians carry fabric catalogs and precision laser meters directly to your home. Book a free consultation by messaging <strong>+91 9018454526</strong> on WhatsApp.</p>`,
      featured_image: "/assets/images/category/categoryThumb1_5.jpg",
      author: "Wall Street Interiors Design Desk",
      status: "published",
      published_at: new Date("2026-10-28T10:00:00Z"),
    },
    {
      title: "Faux Tin Ceilings: The Stylish, Affordable Luxury Alternative for Srinagar Homes",
      slug: "faux-tin-ceilings-stylish-affordable-alternative-kashmir",
      category: "Ceiling Solutions",
      excerpt: "Discover 3D embossed metallic faux tin ceiling panels in Srinagar. Learn how antique copper, gold, and royal white tiles provide royal grandeur and overhead insulation.",
      meta_title: "Faux Tin Ceilings in Srinagar | 3D Metallic Ceiling Tiles Kashmir",
      meta_description: "Explore faux tin ceilings in Kashmir. Lightweight 3D embossed antique copper and white gold ceiling panels at wholesale prices from Wall Street Interiors Srinagar.",
      content: `<h2>Reimagining Ceilings in Kashmiri Architecture</h2>
<p>Kashmiri interior architecture has always revered grand ceilings, from intricate wooden Khatamband to ornate plasterwork. However, authentic hand-carved wood requires months of artisan labor, adds significant overhead dead weight, and demands careful seasonal climate maintenance.</p>
<p><strong>Wall Street Interiors</strong> is proud to introduce <strong>Importer-Direct Architectural Faux Tin Ceiling Panels</strong> to Srinagar, offering royal heritage aesthetics at a fraction of traditional costs and installation time.</p>

<h3>Key Benefits for Kashmir Homes & Commercial Spaces</h3>
<ul>
  <li><strong>Authentic 3D Metallic Relief:</strong> Available in antique burnished copper, vintage brass, champagne gold, and royal matte white. The deep dimensional embossing captures chandelier light with regal grandeur.</li>
  <li><strong>100% Rust & Moisture-Proof:</strong> Engineered from high-grade thermoformed polymer with vacuum metal plating. Unlike real metal sheets or plaster, they never rust, corrode, crack, or yellow under winter dampness.</li>
  <li><strong>Thermal Overhead Shield:</strong> Warm air naturally rises. Our ceiling panels create an overhead insulating air cavity that prevents heat from escaping through the roof.</li>
  <li><strong>Quick, Clean Installation:</strong> Can be glued directly onto existing flat plaster or plywood, or dropped seamlessly into standard commercial 2ft x 2ft grid runners within 24 to 48 hours.</li>
</ul>

<h3>See Authentic Samples in Srinagar</h3>
<p>Visit our showroom near New Habba Kadal Bridge to inspect real panel relief and finish swatches, or contact our WhatsApp wholesale trade desk at <strong>+91 9018454526</strong>.</p>`,
      featured_image: "/assets/images/category/categoryThumb1_4.jpg",
      author: "Wall Street Interiors Design Desk",
      status: "published",
      published_at: new Date("2026-10-30T10:00:00Z"),
    },
    {
      title: "Interior Ideas & Fast Room Makeovers for Kashmiri Wedding Season",
      slug: "interior-design-renovation-ideas-kashmiri-wedding-season",
      category: "Design Stories",
      excerpt: "Preparing your home for a Kashmiri wedding (Khandar)? Quick, stunning room makeover ideas with 3D wallpapers, warm wooden flooring, fluted louvers, and custom blinds.",
      meta_title: "Interior Ideas & Room Makeovers for Kashmiri Wedding Season | Srinagar",
      meta_description: "Top interior makeover ideas for Kashmiri wedding season (Khandar). Quick 3D wallpaper, wooden flooring & PVC panel renovations in Srinagar by Wall Street Interiors.",
      content: `<h2>Preparing Kashmir Homes for the Big Celebration</h2>
<p>In Kashmir, a wedding (<em>Khandar</em>) is a grand celebration that brings dozens of guests, relatives, and wedding parties into your home. The drawing room (<em>Baithak</em>), guest chambers, and bridal rooms must look immaculate, welcoming, and luxurious.</p>
<p>If your wedding date is approaching and you have only a few weeks left, traditional wet masonry and paint renovations are too messy and risky. Here is how you can achieve a complete luxury interior transformation in under a week with <strong>Wall Street Interiors</strong>.</p>

<h3>1. Feature Wall Transformation with 3D Wallpaper (1 Day)</h3>
<p>Select an opulent royal damask or botanical mural for the main backdrop where wedding photographs and bride/groom greetings take place. Installed in just hours with zero mess, it immediately elevates the room into a regal palace.</p>

<h3>2. Warm Wooden Flooring for Guest Comfort (1–2 Days)</h3>
<p>Guests spend hours sitting on the floor or sofas during musical evenings and Wazwan feasts. German AC4 laminate wooden flooring provides welcoming warmth, eliminates freezing floor chills, and can be wiped clean effortlessly after gatherings.</p>

<h3>3. Modern TV Backdrop with Fluted Charcoal Louvers (1 Day)</h3>
<p>Add depth and architectural sophistication behind your television or bridal display console with 100% waterproof fluted charcoal louvers and integrated LED strip lighting.</p>

<h3>4. Fresh Made-to-Measure Blinds (2–3 Days)</h3>
<p>Replace old curtains with crisp dual-sheer Zebra shades or rich Roman blinds that give guests effortless light control and complete evening privacy.</p>

<h3>Get Fast Wedding Season Consultation</h3>
<p>Our Srinagar team understands the tight timelines of wedding preparations. WhatsApp photos of your celebration spaces to <strong>+91 9018454526</strong> for priority measuring and delivery.</p>`,
      featured_image: "/assets/images/category/categoryThumb1_3.jpg",
      author: "Wall Street Interiors Design Desk",
      status: "published",
      published_at: new Date("2026-11-01T10:00:00Z"),
    },
  ];

  for (const blog of blogsToUpsert) {
    const [existing] = await connection.query(
      "SELECT id FROM blog_posts WHERE slug = ?",
      [blog.slug]
    );

    if (existing.length === 0) {
      await connection.query(
        `INSERT INTO blog_posts 
          (title, slug, category, excerpt, content, featured_image, author, status, published_at, meta_title, meta_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          blog.title,
          blog.slug,
          blog.category,
          blog.excerpt,
          blog.content,
          blog.featured_image,
          blog.author,
          blog.status,
          blog.published_at,
          blog.meta_title,
          blog.meta_description,
        ]
      );
      console.log(`Inserted blog post: ${blog.title}`);
    } else {
      await connection.query(
        `UPDATE blog_posts SET 
          title = ?, category = ?, excerpt = ?, content = ?, featured_image = ?,
          author = ?, status = ?, meta_title = ?, meta_description = ?
        WHERE slug = ?`,
        [
          blog.title,
          blog.category,
          blog.excerpt,
          blog.content,
          blog.featured_image,
          blog.author,
          blog.status,
          blog.meta_title,
          blog.meta_description,
          blog.slug,
        ]
      );
      console.log(`Updated blog post: ${blog.title}`);
    }
  }

  // 4. Update Site Settings with positioning, dual locations, and SEO keywords
  const siteSettingsUpdates = [
    { key: "site_name", value: "Wall Street Interiors" },
    { key: "tagline", value: "Imported Finishes for Kashmir Homes | Importer-Direct Interior Materials House" },
    { key: "meta_title", value: "Wall Street Interiors | Srinagar's Importer-Direct Interior Materials House" },
    { key: "meta_description", value: "Srinagar's importer-direct source for wallpapers, wooden flooring, PVC panels, faux tin ceilings & blinds at wholesale & retail rates. Showroom at Habba Kadal & Godown at Fateh Kadal. WhatsApp +919018454526." },
    { key: "meta_keywords", value: "wallpaper shop in Srinagar, wooden flooring Srinagar, PVC panels Srinagar, window blinds Srinagar, faux tin ceiling Kashmir, interior shop in Srinagar, wholesale interior material Kashmir, roller blinds Kashmir, zebra blinds Srinagar, vertical blinds price Srinagar, Wall Street Interiors Habba Kadal, Fateh Kadal godown" },
    { key: "company_phone", value: "+91 9018454526" },
    { key: "whatsapp_number", value: "+919018454526" },
    { key: "company_address", value: "Showroom: Near New Habba Kadal Bridge, Habba Kadal, Srinagar, Jammu & Kashmir 190001" },
    { key: "company_address_secondary", value: "Central Godown & Wholesale Depot: Near Syed Ali Akbar Mosque, Fateh Kadal, Srinagar, Jammu & Kashmir 190002" },
    { key: "footer_about", value: "Wall Street Interiors is Srinagar’s importer-direct interior materials house, where you can see it, touch it, and get it installed. We import directly from global manufacturers to supply homeowners, builders, and interior designers across Kashmir with wallpapers, wooden flooring, PVC panels, faux tin ceilings, and custom blinds at genuine wholesale-friendly prices." },
    {
      key: "phone_numbers",
      value: JSON.stringify([
        { id: "p1", number: "+91 9018454526", label: "Habba Kadal Showroom & WhatsApp", is_primary: true },
        { id: "p2", number: "+91 7889804942", label: "Fateh Kadal Godown & Wholesale Desk", is_primary: false },
      ]),
    },
    {
      key: "email_addresses",
      value: JSON.stringify([
        { id: "e1", email: "contact@wallstreetinteriors.com", label: "Client Inquiries & Orders", is_primary: true },
        { id: "e2", email: "wholesale@wallstreetinteriors.com", label: "B2B Trade & Contractor Desk", is_primary: false },
        { id: "e3", email: "projects@wallstreetinteriors.com", label: "Commercial & Hotel Fit-outs", is_primary: false },
      ]),
    },
  ];

  for (const s of siteSettingsUpdates) {
    const [existing] = await connection.query(
      "SELECT id FROM site_settings WHERE setting_key = ?",
      [s.key]
    );
    if (existing.length > 0) {
      await connection.query(
        "UPDATE site_settings SET setting_value = ? WHERE setting_key = ?",
        [s.value, s.key]
      );
    } else {
      await connection.query(
        "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)",
        [s.key, s.value]
      );
    }
  }
  console.log("Updated site_settings with positioning and dual locations.");

  // 5. Update Homepage Settings
  const updatedFeaturesJson = JSON.stringify([
    {
      id: "f1",
      icon: "fa-solid fa-warehouse",
      title: "Importer-Direct Value",
      description: "Direct import: global designs at wholesale prices",
    },
    {
      id: "f2",
      icon: "fa-solid fa-snowflake",
      title: "Built for Kashmir",
      description: "Insulation & moisture-resistant winter materials",
    },
    {
      id: "f3",
      icon: "fa-solid fa-store",
      title: "Showroom & Godown Stock",
      description: "Touch live samples at Habba & Fateh Kadal",
    },
    {
      id: "f4",
      icon: "fa-solid fa-headset",
      title: "WhatsApp Room Quotes",
      description: "Send room photos for fast quotes & advice",
    },
  ]);

  await connection.query(
    `UPDATE homepage_settings SET 
      hero_badge = ?, hero_title = ?, hero_subtitle = ?,
      hero_button_text = ?, hero_button_link = ?,
      hero_secondary_button_text = ?, hero_secondary_button_link = ?,
      about_heading = ?, about_text = ?,
      features_enabled = 1, features_json = ?
    WHERE id = 1`,
    [
      "Importer-Direct Interior Materials House",
      "Imported Finishes for Kashmir Homes",
      "Where you can see it, touch it, and get it installed. Importer-direct source for luxury wallpapers, wooden flooring, waterproof PVC panels, faux tin ceilings, and custom window blinds at wholesale-friendly prices.",
      "Explore Materials",
      "/shop",
      "WhatsApp Room Quote",
      "https://wa.me/919018454526?text=Hi%20Wall%20Street%20Interiors,%20I%20would%20like%20a%20quote%20for%20my%20room%20interiors.",
      "Wall Street Interiors — From Import to Your Walls",
      "Wall Street Interiors is Srinagar’s importer-direct interior materials house. We import directly from global manufacturers to supply homeowners, builders, and interior designers across Kashmir with wallpapers, wooden flooring, PVC panels, faux tin ceilings, and blinds. With a full retail showroom at Habba Kadal and our central godown at Fateh Kadal, you get authentic stock you can inspect, wholesale-friendly pricing, and materials engineered specifically for Kashmir's cold winters.",
      updatedFeaturesJson,
    ]
  );
  console.log("Updated homepage_settings successfully.");

  // 6. Navigation Menus in nav_menu_items (Original State)
  const desiredCategoryMenus = [
    { label: "Zebra Blinds", url: "/category/zebra-blinds", parent_id: null, sort_order: 1 },
    { label: "Roller Blinds", url: "/category/roller-blinds", parent_id: null, sort_order: 2 },
    { label: "Vertical Blinds", url: "/category/vertical-blinds", parent_id: null, sort_order: 3 },
    { label: "Roman Blinds", url: "/category/roman-blinds", parent_id: null, sort_order: 4 },
    { label: "Motorized Blinds", url: "/category/motorized-blinds", parent_id: null, sort_order: 5 },
    { label: "Motorized Curtain Tracks", url: "/category/motorized-curtain-tracks", parent_id: 37, sort_order: 6 },
    { label: "Window Blinds", url: "/category/window-blinds", parent_id: null, sort_order: 7 },
  ];

  await connection.query("DELETE FROM nav_menu_items WHERE menu_location = 'categories'");
  for (const m of desiredCategoryMenus) {
    await connection.query(
      "INSERT INTO nav_menu_items (label, url, target, parent_id, menu_location, sort_order, is_active) VALUES (?, ?, '_self', ?, 'categories', ?, 1)",
      [m.label, m.url, m.parent_id, m.sort_order]
    );
  }

  // Header menus:
  const desiredHeaderMenus = [
    { label: "Home", url: "/", parent_id: null, sort_order: 1 },
    { label: "Shop", url: "/shop", parent_id: null, sort_order: 2 },
    { label: "Careers", url: "/careers", parent_id: null, sort_order: 4 },
    { label: "About Us", url: "/about", parent_id: null, sort_order: 5 },
    { label: "Journal", url: "/blog", parent_id: null, sort_order: 6 },
    { label: "Contact", url: "/contact", parent_id: null, sort_order: 7 },
  ];

  await connection.query("DELETE FROM nav_menu_items WHERE menu_location = 'header'");
  for (const m of desiredHeaderMenus) {
    await connection.query(
      "INSERT INTO nav_menu_items (label, url, target, parent_id, menu_location, sort_order, is_active) VALUES (?, ?, '_self', ?, 'header', ?, 1)",
      [m.label, m.url, m.parent_id, m.sort_order]
    );
  }
  console.log("Synchronized nav_menu_items successfully.");

  await connection.end();
  console.log("All brand positioning data successfully seeded!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
