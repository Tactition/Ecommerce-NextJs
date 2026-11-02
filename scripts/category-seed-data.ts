export interface CategoryFAQ {
  question: string;
  answer: string;
}

export interface SeedCategory {
  name: string;
  slug: string;
  parentSlug?: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  iconType: string;
  shortDescription: string;
  longDescription: string;
  keyFeatures: string[];
  bestFor: string[];
  materials: string[];
  controlTypes: string[];
  seoTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  imageAlt: string;
  faqs: CategoryFAQ[];
  promptDescription: string;
  room: string;
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    name: "Zebra Blinds",
    slug: "zebra-blinds",
    parentSlug: null,
    sortOrder: 1,
    isActive: true,
    isFeatured: true,
    iconType: "fa-solid fa-bars",
    shortDescription: "Dual-layer sheer and opaque alternating stripes for flexible light filtering and instant privacy control.",
    longDescription:
      "Zebra Blinds (also known as dual or vision blinds) represent the pinnacle of contemporary window styling. Engineered with alternating bands of translucent sheer mesh and light-blocking solid weave, these blinds allow effortless transitions between ambient diffused daylight and comprehensive personal privacy with a slight adjustment of the control mechanism. Ideal for modern apartments, penthouses, and executive offices seeking a geometric, architectural silhouette without the bulk of secondary drapery.",
    keyFeatures: [
      "Dual-layer striped fabric for seamless light adjustment",
      "Overlapping alignment locks out harsh glare and UV rays",
      "Precision weighted bottom rail prevents sway in breeze",
      "Anti-static, dust-repellent polyester textile blends",
      "Smooth manual stainless chain or motorized operation",
      "Zero cord clutter with optional child-safe magnetic tensioners",
    ],
    bestFor: ["Living Rooms", "Bedrooms", "Home Offices", "Boardrooms"],
    materials: ["High-Tensile Polyester", "Anti-Fray Sheer Voile", "Flame-Retardant Fibers"],
    controlTypes: ["Precision Beaded Chain", "Rechargeable Lithium Motor", "Smart Home Voice Control"],
    seoTitle: "Zebra Blinds in Srinagar | Luxury Dual Day & Night Shades",
    metaDescription: "Explore custom-fitted Zebra Blinds by Wall Street Interiors. Dual sheer-and-opaque fabric stripes provide refined light balance, UV defense, and privacy.",
    focusKeywords: ["zebra blinds", "day and night blinds", "vision blinds", "custom window shades"],
    imageAlt: "Contemporary zebra blinds with alternating sheer and charcoal grey privacy stripes installed in a luxury living room",
    promptDescription: "alternating sheer and opaque horizontal striped zebra blinds",
    room: "bright living room",
    faqs: [
      {
        question: "How do zebra blinds switch between privacy and open view?",
        answer: "By gently rotating the dual-layer fabric loop, the opaque stripes either align together to let natural light through the sheer bands, or stagger over each other to block external visibility completely.",
      },
      {
        question: "Can zebra blinds be customized for oversized bay windows?",
        answer: "Yes, Wall Street Interiors custom fabricates zebra blinds up to 2.8 meters in width and 3 meters in height with heavy-duty aluminum top cassettes to prevent sagging.",
      },
      {
        question: "Are zebra blinds easy to clean in dusty environments?",
        answer: "Our fabrics feature a hydrophobic, anti-static coating. Routine maintenance only requires a light feather dusting or a handheld vacuum on low suction.",
      },
    ],
  },
  {
    name: "Roller Blinds",
    slug: "roller-blinds",
    parentSlug: null,
    sortOrder: 2,
    isActive: true,
    isFeatured: true,
    iconType: "fa-solid fa-scroll",
    shortDescription: "Clean, minimalist single-fabric roll-up blinds available in sunscreen, translucent, and 100% total blackout weaves.",
    longDescription:
      "Roller Blinds offer timeless architectural simplicity. Crafted from a single uninterrupted fabric panel wrapped around an anodized aluminum barrel, they retreat into an ultra-low profile when raised, preserving pristine outdoor views. Wall Street Interiors curates bespoke weaves ranging from 3% openness solar screens that preserve natural lighting while eliminating screen glare, to multi-layer thermal blackouts that maintain room warmth during cold mountain winters.",
    keyFeatures: [
      "Single continuous textile roll with ultra-compact headbox",
      "Available in 100% Total Blackout and Sunscreen micro-weaves",
      "Thermal insulation backing reduces HVAC cooling and heating costs",
      "Anodized high-gauge aluminum tubes resist center deflection",
      "Zero bottom curling through precision laser-cut edges",
      "Antibacterial and mold-resistant for moisture-prone areas",
    ],
    bestFor: ["Home Offices", "Media Rooms", "Bedrooms", "Conference Studios"],
    materials: ["Vinyl-Coated Fiberglass", "Thermal Acrylic Backed Polyester", "Linen-Look Polyester"],
    controlTypes: ["Nylon Loop Cord", "Spring Assisted Slow-Rise", "Tuya Smart Remote Motor"],
    seoTitle: "Custom Roller Blinds | Blackout & Sunscreen Window Shades",
    metaDescription: "Discover bespoke roller blinds in Srinagar. Choose between 100% blackout thermal weaves and glare-reducing sunscreen fabrics for modern interiors.",
    focusKeywords: ["roller blinds", "blackout roller shades", "sunscreen blinds", "minimalist window blinds"],
    imageAlt: "Minimalist neutral linen roller blind mounted inside window frame in a sunlit modern home office",
    promptDescription: "minimalist plain linen textured roller blind",
    room: "home office",
    faqs: [
      {
        question: "What is the difference between sunscreen and blackout roller blinds?",
        answer: "Sunscreen blinds filter glare and block up to 95% of UV radiation while retaining your daytime outdoor view. Blackout blinds have an opaque acrylic backing that stops 100% of incoming light.",
      },
      {
        question: "Can roller blinds be installed inside the window recess?",
        answer: "Yes, both inside-mount (flush with wall) and outside-mount (overlapping the window frame for maximum light seal) configurations are supported.",
      },
      {
        question: "Do your roller blinds rattle when windows are open?",
        answer: "We supply concealed bottom-rail guide wires and magnetic hold-down clips that keep the blinds firmly tethered even during cross-ventilation breezes.",
      },
    ],
  },
  {
    name: "Vertical Blinds",
    slug: "vertical-blinds",
    parentSlug: null,
    sortOrder: 3,
    isActive: true,
    isFeatured: false,
    iconType: "fa-solid fa-align-justify",
    shortDescription: "Rotating vertical louvers engineered for wide glass expanses, sliding patio doors, and commercial offices.",
    longDescription:
      "Vertical Blinds provide unmatched light regulation for wide structural openings, sliding balconies, and floor-to-ceiling glass facades. Individual vertical fabric louvers rotate 180 degrees on an extruded aluminum headrail, allowing you to angle sunlight precisely across the room or slide the entire stack smoothly to one side for unobstructed walk-through access. Finished in textured soil-resistant fabrics that withstand high foot traffic.",
    keyFeatures: [
      "180-degree louver rotation for multi-angle light direction",
      "Smooth traverse gliding for sliding glass and balcony doors",
      "Weights and connecting link chains maintain crisp vertical drape",
      "Individual louvers can be independently serviced or replaced",
      "Heavy-duty powder-coated aluminum track mechanism",
      "Wand control option completely removes hanging pull cords",
    ],
    bestFor: ["Patio Balconies", "French Windows", "Commercial Offices", "Dining Halls"],
    materials: ["Rigid Textured PVC", "Woven Jacquard Polyester", "Acoustic Dampening Weave"],
    controlTypes: ["Child-Safe Control Wand", "Dual Beaded Cord", "Motorized Remote Traverse"],
    seoTitle: "Vertical Window Blinds | Patio & Large Glass Door Blinds",
    metaDescription: "Shop luxury vertical blinds designed for sliding patio doors and wide windows. 180-degree rotating slats for effortless privacy and glare control.",
    focusKeywords: ["vertical blinds", "patio door blinds", "vertical louvers", "commercial window blinds"],
    imageAlt: "Floor-to-ceiling vertical blinds over wide sliding glass patio doors in a bright contemporary dining space",
    promptDescription: "sleek vertical slat blinds covering a wide glass patio door",
    room: "dining area",
    faqs: [
      {
        question: "Are vertical blinds suitable for residential sliding doors?",
        answer: "Yes, they are the industry standard for sliding glass doors because they open horizontally in the same direction as your door, preserving easy foot traffic.",
      },
      {
        question: "What slat widths are available?",
        answer: "We fabricate vertical slats in standard 89mm (3.5 inch) and 127mm (5 inch) widths to match small, medium, or tall architectural expanses.",
      },
      {
        question: "Can individual damaged vertical slats be replaced?",
        answer: "Yes, each louver unclips independently from the track runner, allowing single-slat replacement without replacing the entire track system.",
      },
    ],
  },
  {
    name: "Roman Blinds",
    slug: "roman-blinds",
    parentSlug: null,
    sortOrder: 4,
    isActive: true,
    isFeatured: true,
    iconType: "fa-solid fa-layer-group",
    shortDescription: "Luxurious tailored fabric blinds that gather into soft, cascading horizontal pleats when raised.",
    longDescription:
      "Roman Blinds bring the plush warmth and tactile grandeur of custom drapery into the clean footprint of a blind. Handcrafted from premium natural linens, chenilles, and rich velvets, our Roman shades fold upward into cascading soft pleats via concealed horizontal battens. Backed with premium thermal or blackout interlining, they offer exceptional draft exclusion and acoustic softening for intimate bedrooms and refined drawing rooms.",
    keyFeatures: [
      "Hand-tailored soft cascading folds create bespoke warmth",
      "Concealed rear composite rods ensure flat, even horizontal stacks",
      "Thermal interlining insulates against cold drafts and street noise",
      "Lined borders protect surface fabrics from fading under direct UV",
      "High-precision geared chain system ensures effortless lifting",
      "Removable fabric face for seasonal professional dry cleaning",
    ],
    bestFor: ["Master Bedrooms", "Formal Drawing Rooms", "Boutique Suites", "Libraries"],
    materials: ["Pure Belgian Linen", "Cotton-Linen Blends", "Textured Chenille & Velvet"],
    controlTypes: ["Smooth Geared Ball Chain", "Integrated Tubular Motor", "Smart Zigbee Automation"],
    seoTitle: "Bespoke Roman Blinds | Handcrafted Luxury Fabric Shades",
    metaDescription: "Hand-tailored Roman blinds in Kashmir. Crafted from Belgian linen and plush velvets that gather into soft pleats for unmatched bedroom and salon elegance.",
    focusKeywords: ["roman blinds", "fabric roman shades", "luxury window shades", "linen roman blinds"],
    imageAlt: "Handcrafted soft folded linen roman blind in a cozy luxury master bedroom setting",
    promptDescription: "soft folded fabric roman blind in warm neutral textured linen",
    room: "luxury bedroom",
    faqs: [
      {
        question: "What fold styles do you offer for Roman blinds?",
        answer: "We offer classic flat-fold (sleek, contemporary stack) and soft hobbled/cascade fold (gentle overlapping waterfall pleats when lowered).",
      },
      {
        question: "Can Roman blinds be fitted with thermal blackout lining?",
        answer: "Yes, every custom Roman blind can be specified with premium 3-pass blackout thermal fleece lining that blocks light and insulates chilly window glass.",
      },
      {
        question: "How do Roman blinds compare to full-length curtains?",
        answer: "Roman blinds offer the same luxurious texture and fabric warmth as curtains but consume zero floor space, making them ideal above radiators, desks, or window benches.",
      },
    ],
  },
  {
    name: "Motorized Blinds",
    slug: "motorized-blinds",
    parentSlug: null,
    sortOrder: 5,
    isActive: true,
    isFeatured: true,
    iconType: "fa-solid fa-bolt",
    shortDescription: "Ultra-quiet smart motorized shades controlled via handheld multi-channel remotes, smartphone apps, or voice commands.",
    longDescription:
      "Motorized Blinds merge sophisticated window design with effortless home automation. Equipped with whisper-quiet tubular brushless motors concealed inside the roller barrel, these shades can be operated individually or in synchronized room groups using sleek wall switches, smartphone applications, or voice assistants (Alexa, Google Assistant, Apple HomeKit). Ideal for double-height architectural glass, skylights, or homeowners seeking scheduled dawn-to-dusk luxury.",
    keyFeatures: [
      "Ultra-quiet (<35dB) brushless motor engineering",
      "Rechargeable magnetic USB-C battery or hardwired 220V power",
      "Sync with Apple HomeKit, Google Home, Alexa, and Tuya Smart",
      "Programmable sun tracking and scheduled dawn/dusk automations",
      "Multi-channel remote controls up to 16 window groups independently",
      "Manual override pull-to-start feature for intuitive guest use",
    ],
    bestFor: ["Double-Height Living Rooms", "Skylights", "Smart Homes", "Master Suites"],
    materials: ["Solar Screen Fiberglass", "Total Blackout Poly-Vinyl", "Acoustic Honeycomb"],
    controlTypes: ["RF Handheld Remote", "Smartphone App (iOS & Android)", "Voice Command"],
    seoTitle: "Smart Motorized Blinds | Electric Automatic Window Shades",
    metaDescription: "Upgrade your living spaces with quiet motorized blinds by Wall Street Interiors. Voice, remote, and app-controlled electric shades for modern smart homes.",
    focusKeywords: ["motorized blinds", "electric blinds", "smart window shades", "automatic roller blinds"],
    imageAlt: "Motorized smart window shade in modern living room with a handheld remote placed nearby",
    promptDescription: "modern motorized window blind with an elegant remote control sitting on a table nearby",
    room: "smart living room",
    faqs: [
      {
        question: "Do I need electrical pre-wiring for motorized blinds?",
        answer: "Not necessarily. We offer wire-free rechargeable lithium battery motors that run for 6 to 9 months on a single USB-C charge, as well as hardwired 220V motors for new builds.",
      },
      {
        question: "Can multiple blinds be raised and lowered together?",
        answer: "Yes. Our multi-channel remotes and mobile app let you trigger all window blinds in a room or entire floor with a single button press or schedule.",
      },
      {
        question: "What happens if Wi-Fi goes down?",
        answer: "The RF handheld remote controls operate on direct 433MHz radio frequency and continue to function 100% normally even without internet access.",
      },
    ],
  },
  {
    name: "Motorized Curtain Tracks",
    slug: "motorized-curtain-tracks",
    parentSlug: "motorized-blinds",
    sortOrder: 6,
    isActive: true,
    isFeatured: false,
    iconType: "fa-solid fa-sliders",
    shortDescription: "Concealed electric drapery track systems with whisper-smooth gliding for floor-to-ceiling pinch pleat and ripple fold curtains.",
    longDescription:
      "Motorized Curtain Tracks transform heavy luxury draperies into effortless architectural movements. Featuring reinforced stainless drive belts and self-lubricating nylon carriers, our motorized tracks support drapery weights up to 60 kg with whisper-quiet, fluid motion. Soft-start and soft-stop acceleration profiles prevent fabric strain, while built-in touch-motion technology automatically opens or closes the drapery with a gentle pull at the curtain edge.",
    keyFeatures: [
      "Heavy load capacity supporting up to 60 kg of lined luxury drapery",
      "Touch-motion technology: gently tug the fabric to trigger motion",
      "Ultra-quiet belt drive with soft-start and soft-stop deceleration",
      "Compatible with Ripple Fold (S-Fold) and Pinch Pleat curtain styles",
      "Expandable modular track lengths up to 12 meters with straight or curved joins",
      "Seamless integration with room automation panels and voice assistants",
    ],
    bestFor: ["Floor-to-Ceiling Windows", "Living Room Salons", "Hotel Suites", "Home Theaters"],
    materials: ["Extruded Aerospace Aluminum", "Kevlar-Reinforced Timing Belt", "Self-Lubricating Rollers"],
    controlTypes: ["Wall Touch Switch", "RF Multi-Channel Remote", "Smart App & Voice Automation"],
    seoTitle: "Motorized Curtain Tracks | Electric Smart Drapery Rails",
    metaDescription: "Electric motorized curtain tracks in Srinagar. Whisper-quiet, smooth gliding tracks for heavy luxury curtains with touch-motion and smart home controls.",
    focusKeywords: ["motorized curtain track", "electric curtain rail", "smart drapery track", "automatic curtains"],
    imageAlt: "Floor-to-ceiling sheer and velvet drapery gliding along a sleek concealed motorized electric track",
    promptDescription: "floor-to-ceiling sheer curtains hung on a slim minimalist motorized electric curtain track",
    room: "living room",
    faqs: [
      {
        question: "Can motorized curtain tracks handle curved or bay windows?",
        answer: "Yes, our aluminum rails can be custom bent in our atelier to 90-degree corners, continuous bay window angles, and sweeping arches.",
      },
      {
        question: "Can I open the curtains manually if power fails?",
        answer: "Yes, the electromagnetic clutch automatically disengages during power outages, allowing you to pull the curtains open or shut smoothly by hand without damaging the motor.",
      },
      {
        question: "Which curtain heading styles work with motorized tracks?",
        answer: "The track supports modern S-Fold (Ripplefold) for continuous architectural waves as well as classic pinch pleat and French pleat draperies.",
      },
    ],
  },
  {
    name: "Window Blinds",
    slug: "window-blinds",
    parentSlug: null,
    sortOrder: 7,
    isActive: true,
    isFeatured: true,
    iconType: "fa-solid fa-shapes",
    shortDescription: "Comprehensive architectural blinds collection including custom timber venetians, cellular honeycombs, and aluminum shades.",
    longDescription:
      "Window Blinds is our master collection encompassing all architectural light-control treatments for residential and commercial environments. From genuine kiln-dried basswood venetians that infuse warm organic character to energy-saving cellular honeycomb shades that create an air barrier against winter drafts, Wall Street Interiors delivers precision made-to-measure solutions backed by comprehensive on-site installation and commercial warranties.",
    keyFeatures: [
      "Broad catalog: Basswood Venetians, Honeycomb Cellulars, and Aluminum Slats",
      "Custom measured and fabricated to exact millimeter tolerances",
      "Superior thermal and acoustic insulation performance",
      "Commercial-grade hardware engineered for heavy cycle longevity",
      "Wide assortment of natural wood stains, matte metals, and woven textures",
      "Full warranty support with factory-certified on-site installation",
    ],
    bestFor: ["Entire Residential Residences", "Executive Suites", "Villas", "Hospitality Projects"],
    materials: ["Kiln-Dried Basswood", "Air-Trap Cellular Spunbond", "Heavy Gauge 5005 Aluminum"],
    controlTypes: ["Cordless Push-Pull", "Precision Dual Wand", "Smart Motorized Integration"],
    seoTitle: "Window Blinds in Srinagar | Custom Luxury Window Treatments",
    metaDescription: "Browse custom window blinds by Wall Street Interiors. Kiln-dried wooden venetians, honeycomb shades, and modern architectural blinds tailored to your space.",
    focusKeywords: ["window blinds", "custom window treatments", "wooden blinds", "honeycomb blinds"],
    imageAlt: "Row of luxury custom window blinds installed across a sequence of modern architectural windows",
    promptDescription: "a beautiful row of varied modern architectural window blinds installed on tall windows",
    room: "bright showroom style living space",
    faqs: [
      {
        question: "How do I choose between wooden blinds and fabric shades?",
        answer: "Wooden blinds excel at classic warmth and directional tilt control. Fabric shades (Zebra, Roller, Roman) excel at soft light diffusion, total blackout sealing, and compact stacking.",
      },
      {
        question: "Do you offer free on-site measuring and fabric swatches in Srinagar?",
        answer: "Yes, our interior design consultants visit your property with genuine physical material books to measure window recesses and verify light orientations.",
      },
      {
        question: "What is the typical fabrication and installation lead time?",
        answer: "Custom blinds are precisely manufactured and installed within 5 to 7 business days from measurement confirmation.",
      },
    ],
  },
];

