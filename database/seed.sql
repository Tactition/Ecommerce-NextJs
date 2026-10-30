-- Initial Seed Data for Wall Street Interiors
-- Based on Wall Street Interiors Service Agreement (Srinagar, J&K)
-- Designed to be idempotent and safe to run multiple times

-- 1. Default Admin User (Password: Admin@123)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`)
VALUES (
  1,
  'Wall Street Admin',
  'admin@wallstreetinteriors.com',
  '$2b$10$s6LV0.ZASiYnkupisMEmP.wAlMFvg1/WbD5b8a2UpAEXlCg8JWZPm',
  'admin'
) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `email`=VALUES(`email`);

-- 2. 6 Core Interior Architecture Services
INSERT INTO `services` (`id`, `title`, `slug`, `short_description`, `description`, `image`, `price_range`, `is_published`, `sort_order`)
VALUES
(
  1,
  'Complete Residential Interior Architecture',
  'residential-interiors',
  'Turnkey luxury interior design and turnkey execution for villas, penthouses, and residences in Kashmir.',
  '<h3>End-to-End Residential Living Spaces</h3><p>At Wall Street Interiors, we deliver cohesive luxury environments designed around your lifestyle. From 3D architectural spatial layouts to bespoke furniture and ambient lighting, our team handles every aspect from concept to white-glove handover.</p><h4>Service Scope:</h4><ul><li>Comprehensive 3D visual walkthroughs and material boards</li><li>False ceiling design, cove lighting, and acoustic insulation</li><li>Custom millwork, wall paneling, and Italian marble flooring</li><li>Bespoke modular kitchens and walk-in wardrobe suites</li></ul>',
  '/assets/images/best-seller/bestSellerProductThumb2_1.png',
  'Starts from ₹1,500 / sq.ft',
  1,
  1
),
(
  2,
  'Custom Luxury Furniture Fabrication',
  'custom-furniture-fabrication',
  'Bespoke handcrafted sofas, dining sets, accent chairs, and credenzas tailored to exact client dimensions.',
  '<h3>Artisanal Furniture Crafted to Perfection</h3><p>We craft heirloom furniture using kiln-dried seasoned hardwoods, genuine top-grain leathers, high-density comfort foams, and premium PVD titanium metal accents. Every piece is built to order in our specialized workshops.</p><h4>Offerings:</h4><ul><li>Custom Chesterfield, sectional, and curved contemporary sofas</li><li>Calacatta and Black Marquina marble dining and coffee tables</li><li>Designer headboards, nightstands, and dressing vanities</li><li>Ergonomic office desks and executive leather seating</li></ul>',
  '/assets/images/popular-categories/popularCategories4_1.jpg',
  'Starts from ₹25,000',
  1,
  2
),
(
  3,
  '3D Architectural Wall Paneling & Acoustics',
  'wall-paneling-acoustics',
  'Decorative fluted panels, acoustic oak wood slats, upholstered fabric panels, and 3D textured feature walls.',
  '<h3>Elevate Your Walls into Architectural Art</h3><p>Turn blank partitions into breathtaking focal points with our advanced wall cladding solutions. We install acoustic felt-backed timber slats, CNC grooved panels, and luxury metallic inlays that combine acoustics with striking aesthetics.</p>',
  '/assets/images/popular-categories/popularCategories4_2.jpg',
  'Starts from ₹180 / sq.ft',
  1,
  3
),
(
  4,
  'Modular Kitchen & Walk-In Wardrobe Design',
  'modular-kitchens-wardrobes',
  'German-engineered hardware, anti-scratch acrylic shutters, hydraulic lift-ups, and custom walk-in closet systems.',
  '<h3>Precision Ergonomics for Modern Living</h3><p>Our modular systems combine German-grade soft-close mechanisms with marine-grade BWR plywood and quartz countertops. We ensure maximum space optimization and effortless daily usage.</p>',
  '/assets/images/popular-categories/popularCategories4_3.jpg',
  'Starts from ₹1,20,000',
  1,
  4
),
(
  5,
  'Commercial & Corporate Office Turnkey Fitouts',
  'commercial-office-fitouts',
  'Contemporary workplace interiors, executive cabins, acoustic conference rooms, and retail boutique showrooms.',
  '<h3>Professional Environments Built for Impact</h3><p>We design functional, high-productivity commercial spaces reflecting your corporate brand identity. From ergonomic workstations to acoustically treated boardrooms, we ensure timely delivery with zero operational downtime.</p>',
  '/assets/images/popular-categories/popularCategories4_4.jpg',
  'Starts from ₹1,800 / sq.ft',
  1,
  5
),
(
  6,
  'B2B Wholesale Supply for Contractors & Dealers',
  'b2b-wholesale-supply',
  'Direct trade supply of architectural hardware, decorative wall panels, acoustic slats, and designer fittings.',
  '<h3>Dedicated Trade Partnership Program</h3><p>Wall Street Interiors provides certified contractors, architects, and retail dealers with wholesale pricing, prompt bulk supply, technical documentation, and priority logistical fulfillment across Jammu & Kashmir.</p>',
  '/assets/images/popular-categories/popularCategories4_1.jpg',
  'Special Trade Rates',
  1,
  6
)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`), `short_description`=VALUES(`short_description`), `description`=VALUES(`description`), `image`=VALUES(`image`), `price_range`=VALUES(`price_range`);

-- 3. 12 Partner Brands (Luxury Interior Architecture & Hardware)
INSERT INTO `partner_brands` (`id`, `name`, `logo`, `website_url`, `is_active`, `sort_order`)
VALUES
(1, 'Hafele Hardware', '/assets/images/brand-logo/brand-logo1_1.png', 'https://www.hafele.com', 1, 1),
(2, 'Hettich Germany', '/assets/images/brand-logo/brand-logo1_2.png', 'https://www.hettich.com', 1, 2),
(3, 'Blum Hardware', '/assets/images/brand-logo/brand-logo1_3.png', 'https://www.blum.com', 1, 3),
(4, 'Saint-Gobain Glass', '/assets/images/brand-logo/brand-logo1_4.png', 'https://www.saint-gobain.com', 1, 4),
(5, 'Asian Paints Royale', '/assets/images/brand-logo/brand-logo1_5.png', 'https://www.asianpaints.com', 1, 5),
(6, 'D\'Decor Fabrics', '/assets/images/brand-logo/brand-logo1_6.png', 'https://www.ddecor.com', 1, 6),
(7, 'Kohler Fixtures', '/assets/images/brand-logo/brand-logo2_1.png', 'https://www.kohler.com', 1, 7),
(8, 'Greenply Veneer', '/assets/images/brand-logo/brand-logo2_2.png', 'https://www.greenply.com', 1, 8),
(9, 'CenturyPly Club Prime', '/assets/images/brand-logo/brand-logo2_3.png', 'https://www.centuryply.com', 1, 9),
(10, 'Somany Ceramics', '/assets/images/brand-logo/brand-logo2_4.png', 'https://www.somanyceramics.com', 1, 10),
(11, 'Grohe Bath Systems', '/assets/images/brand-logo/brand-logo2_5.png', 'https://www.grohe.com', 1, 11),
(12, 'Kajaria Eternity', '/assets/images/brand-logo/brand-logo4_1.png', 'https://www.kajaria.com', 1, 12)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `logo`=VALUES(`logo`);

-- 4. Testimonials
INSERT INTO `testimonials` (`id`, `customer_name`, `customer_role`, `avatar`, `content`, `rating`, `is_published`, `sort_order`)
VALUES
(
  1,
  'Bashir Ahmad Mir',
  'Villa Homeowner, Rajbagh',
  '/assets/images/testimonial/testimonial1_1.png',
  'Wall Street Interiors transformed our 5-bedroom villa into an architectural masterpiece. Their bespoke teakwood furniture, acoustic slat wall panels, and modular kitchen were delivered with immaculate precision.',
  5, 1, 1
),
(
  2,
  'Ar. Suhail Qazi',
  'Principal Architect, Studio Qazi',
  '/assets/images/testimonial/testimonial1_2.png',
  'As an architect, sourcing premium hardware and custom fluted panels on tight deadlines is always a challenge. Wall Street Interiors has become our most trusted B2B partner for contractor-grade materials and flawless craftsmanship.',
  5, 1, 2
),
(
  3,
  'Tariq H. Lone',
  'Managing Director, Grand Pine Hotel',
  '/assets/images/testimonial/testimonial1_3.png',
  'From guest room bed backs to the grand lobby acoustic ceiling, Wall Street Interiors handled our hotel renovation seamlessly. Their commercial wholesale rates and dedicated support are unmatched in Kashmir.',
  5, 1, 3
)
ON DUPLICATE KEY UPDATE `customer_name`=VALUES(`customer_name`), `content`=VALUES(`content`);

-- 5. Blog Posts
INSERT INTO `blog_posts` (`id`, `title`, `slug`, `excerpt`, `content`, `featured_image`, `author`, `meta_title`, `meta_description`, `status`)
VALUES
(
  1,
  'Top Interior Design Trends Defining Luxury Homes in 2026',
  'luxury-interior-design-trends-2026',
  'Discover how warm minimalist wood slats, fluted textures, and ambient concealed lighting are elevating modern living spaces.',
  '<h3>The Evolution of Luxury Spaces</h3><p>Modern interior design in 2026 embraces organic warmth, refined textures, and integrated architectural lighting. Homeowners are moving away from sterile minimalism towards tactile luxury: fluted wood wall panels, brushed brass accents, and curved statement furniture that invite comfort and contemplation.</p>',
  '/assets/images/blog/blog1_1.jpg',
  'Wall Street Editorial Team',
  'Luxury Interior Design Trends 2026 | Wall Street Interiors',
  'Explore key luxury interior design trends for 2026 including wood acoustic slats, curved velvet furniture, and smart concealed lighting.',
  'published'
),
(
  2,
  'Acoustic Slat Wood Panels: Blending Sound Dampening with High Aesthetics',
  'acoustic-slat-wood-panels-guide',
  'A comprehensive guide on selecting natural veneer acoustic wall panels to eliminate echoes while creating striking feature walls.',
  '<h3>Why Acoustic Wall Panels Are Essential</h3><p>High ceilings and hard flooring often create reverberations and hollow acoustics. Acoustic slat panels backed by dense acoustic felt absorb sound frequencies while introducing the visual warmth of natural Scandinavian oak or rich walnut veneer.</p>',
  '/assets/images/blog/blog1_2.jpg',
  'Wall Street Editorial Team',
  'Acoustic Slat Wood Panels Guide | Wall Street Interiors',
  'Learn how acoustic wall paneling improves indoor sound quality while serving as a statement design piece in living rooms and home offices.',
  'published'
),
(
  3,
  'Veneer vs. Acrylic vs. PU Finish: Choosing the Perfect Modular Kitchen Surface',
  'veneer-acrylic-pu-modular-kitchen-guide',
  'Compare durability, scratch resistance, and maintenance across top modular kitchen shutter finishes.',
  '<h3>Comparing Premium Kitchen Shutter Materials</h3><p>When investing in a custom modular kitchen, shutter finish dictates both longevity and daily upkeep. Acrylic offers glass-like high gloss and UV resistance, PU lacquer enables bespoke seamless color palettes, and natural wood veneer delivers unparalleled organic luxury.</p>',
  '/assets/images/blog/blog1_3.jpg',
  'Wall Street Editorial Team',
  'Modular Kitchen Finishes: Veneer, Acrylic & PU | Wall Street Interiors',
  'Expert comparison of kitchen shutter finishes to help you choose the best material for durability, moisture resistance, and aesthetics.',
  'published'
)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`), `excerpt`=VALUES(`excerpt`), `content`=VALUES(`content`);
