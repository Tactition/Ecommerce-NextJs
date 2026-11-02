-- Database schema addition for Wall Street Interiors Products & Categories
USE ecommerce;

CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon_type VARCHAR(50) DEFAULT 'sofa',
    item_count INT DEFAULT 16,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_slug VARCHAR(100) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    short_description TEXT,
    description LONGTEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percent INT DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    image VARCHAR(255) NOT NULL,
    badge VARCHAR(50) DEFAULT NULL,
    brand VARCHAR(100) DEFAULT 'Wall Street Atelier',
    is_best_seller TINYINT(1) DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    is_popular TINYINT(1) DEFAULT 0,
    is_on_sale TINYINT(1) DEFAULT 0,
    stock INT DEFAULT 50,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_products_name (`name`(50)),
    INDEX idx_products_brand (`brand`(50)),
    INDEX idx_products_status_price (`status`, `price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Category Data
INSERT INTO product_categories (name, slug, icon_type, item_count, is_active) VALUES
('Luxury Furniture', 'luxury-furniture', 'sofa', 24, 1),
('Wall Treatments & Panels', 'wall-treatments', 'wall', 18, 1),
('Architectural Lighting', 'lighting-fixtures', 'lamp', 16, 1),
('Modular Kitchen & Wardrobes', 'modular-kitchen', 'kitchen', 14, 1),
('Decor & Furnishings', 'decor-furnishings', 'decor', 20, 1),
('B2B Wholesale Hardware', 'wholesale-hardware', 'hardware', 32, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), item_count=VALUES(item_count);

-- Insert Best Seller Products for Wall Street Interiors
INSERT INTO products (name, slug, category_slug, category_name, short_description, price, original_price, discount_percent, rating, reviews_count, image, badge, brand, is_best_seller, is_popular, is_on_sale) VALUES
('Milano Italian Leather Accent Chair', 'milano-italian-leather-accent-chair', 'luxury-furniture', 'Luxury Furniture', 'Hand-stitched genuine Italian grain leather accent chair with brushed brass tapered legs.', 28500.00, 36000.00, 20, 5.0, 14, '/assets/images/top-deals-item/topDealsItemThumb1_1.png', 'Hot', 'Wall Street Atelier', 1, 1, 1),
('Nordic Oak Slat Acoustic Wall Panel', 'nordic-oak-slat-acoustic-panel', 'wall-treatments', 'Wall Treatments & Panels', 'Natural white oak veneered MDF acoustic slats mounted on recycled felt backing for superior sound dampening.', 3850.00, 5200.00, 25, 5.0, 28, '/assets/images/top-deals-item/topDealsItemThumb1_2.png', 'Sale', 'AcoustiWall Pro', 1, 1, 1),
('Brushed Brass Linear Pendant Chandelier', 'brushed-brass-linear-pendant', 'lighting-fixtures', 'Architectural Lighting', 'Architectural minimalist LED chandelier with satin champagne gold finish and dimmable ambiance.', 14900.00, 19500.00, 23, 5.0, 41, '/assets/images/top-deals-item/topDealsItemThumb1_3.png', 'New', 'Lumina Luxe', 1, 1, 0),
('Calacatta Gold Marble Center Table', 'calacatta-gold-marble-table', 'luxury-furniture', 'Luxury Furniture', 'Polished Italian Calacatta gold composite marble tabletop with geometric carbon-black powder-coated steel base.', 22000.00, 28000.00, 21, 4.9, 19, '/assets/images/top-deals-item/topDealsItemThumb1_4.png', NULL, 'Wall Street Atelier', 1, 0, 1),
('Velvet Chesterfield 3-Seater Lounge Sofa', 'velvet-chesterfield-3-seater-sofa', 'luxury-furniture', 'Luxury Furniture', 'Classic deep button-tufted Chesterfield sofa upholstered in ultra-plush stain-resistant royal velvet.', 68000.00, 85000.00, 20, 5.0, 33, '/assets/images/top-deals-item/topDealsItemThumb1_5.png', 'Popular', 'Wall Street Atelier', 1, 1, 1),
('Matte Charcoal Fluted Wall Panel (8ft)', 'matte-charcoal-fluted-wall-panel', 'wall-treatments', 'Wall Treatments & Panels', 'Waterproof charcoal polymer fluted paneling ideal for luxury feature walls, bed backs, and TV units.', 4200.00, 5500.00, 23, 5.0, 52, '/assets/images/top-deals-item/topDealsItemThumb1_6.png', 'Hot', 'AcoustiWall Pro', 1, 1, 0),
('Minimalist Recessed Magnetic Track Light Set', 'minimalist-magnetic-track-light', 'lighting-fixtures', 'Architectural Lighting', 'Ultra-thin surface or recessed magnetic track lighting kit with interchangeable flood and spotlight modules.', 6400.00, 8000.00, 20, 4.9, 17, '/assets/images/top-deals-item/topDealsItemThumb1_7.png', NULL, 'Lumina Luxe', 1, 0, 1),
('Heavy-Duty Soft-Close Concealed Hinges (20-Pack)', 'heavy-duty-soft-close-concealed-hinges', 'wholesale-hardware', 'B2B Wholesale Hardware', 'Contractor-grade stainless steel 3D adjustable hydraulic soft-close cabinet hinges for modular kitchens.', 2950.00, 3800.00, 22, 5.0, 49, '/assets/images/top-deals-item/topDealsItemThumb1_8.png', 'B2B Bulk', 'Hettich Pro', 1, 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), image=VALUES(image);

-- Insert Featured Products for Wall Street Interiors
INSERT INTO products (name, slug, category_slug, category_name, short_description, price, original_price, discount_percent, rating, reviews_count, image, badge, brand, is_featured, is_popular, is_on_sale) VALUES
('Royal Emerald Velvet Dining Chairs (Set of 2)', 'royal-emerald-dining-chairs', 'luxury-furniture', 'Luxury Furniture', 'Curved ergonomic backrest dining chairs in rich emerald velvet with gold-tipped solid ash wood legs.', 18500.00, 24000.00, 23, 5.0, 22, '/assets/images/best-seller/bestSellerProductThumb1_1.png', 'Exclusive', 'Wall Street Atelier', 1, 1, 1),
('Handcrafted Teakwood Console Credenza', 'handcrafted-teakwood-console-credenza', 'luxury-furniture', 'Luxury Furniture', 'Live-edge reclaimed seasoned teakwood console with woven cane rattan drawer fronts and brass pulls.', 31000.00, 39000.00, 20, 5.0, 36, '/assets/images/best-seller/bestSellerProductThumb1_2.png', 'Handmade', 'Wall Street Atelier', 1, 1, 0),
('3D Textured Geometric Wave Feature Panel', '3d-textured-geometric-wave-panel', 'wall-treatments', 'Wall Treatments & Panels', 'Seamless interlocking paintable gypsum wall panel creating dramatic light and shadow dimensions.', 2650.00, 3400.00, 22, 4.8, 18, '/assets/images/best-seller/bestSellerProductThumb1_3.png', '15% OFF', 'AcoustiWall Pro', 1, 1, 1),
('Dimmable Warm LED Halo Ring Chandelier', 'dimmable-warm-led-halo-chandelier', 'lighting-fixtures', 'Architectural Lighting', 'Dual-tier brushed titanium floating ring chandelier with indirect silicone diffuser for soft luxury lighting.', 18000.00, 24000.00, 25, 5.0, 29, '/assets/images/best-seller/bestSellerProductThumb1_4.png', '25% OFF', 'Lumina Luxe', 1, 0, 1),
('Acrylic Gloss Modular Kitchen Shutter Unit', 'acrylic-gloss-modular-kitchen-shutter', 'modular-kitchen', 'Modular Kitchen & Wardrobes', 'Scratch-resistant 1mm anti-fingerprint acrylic shutters on 18mm BWR plywood with seamless laser edge banding.', 42000.00, 55000.00, 24, 5.0, 44, '/assets/images/best-seller/bestSellerProductThumb1_5.png', 'Modular', 'Hafele Interior', 1, 1, 1),
('Modern Walk-In Wardrobe Master Organizers', 'modern-walk-in-wardrobe-organizers', 'modular-kitchen', 'Modular Kitchen & Wardrobes', 'Custom aluminum profile walk-in closet system with integrated sensor LED lighting and felt-lined jewelry drawers.', 58000.00, 75000.00, 22, 5.0, 27, '/assets/images/best-seller/bestSellerProductThumb1_6.png', 'Custom', 'Blum Systems', 1, 1, 0),
('Handwoven Kashmiri Wool Artisan Rug (5x7)', 'handwoven-kashmiri-wool-artisan-rug', 'decor-furnishings', 'Decor & Furnishings', 'Hand-knotted 100% fine New Zealand wool rug featuring contemporary abstract gradients in taupe and ivory.', 26500.00, 34000.00, 22, 5.0, 19, '/assets/images/best-seller/bestSellerProductThumb1_7.png', 'Artisan', 'Wall Street Atelier', 1, 0, 1),
('Aluminium Gola Architectural Profiles (Pack of 6)', 'aluminium-gola-architectural-profiles', 'wholesale-hardware', 'B2B Wholesale Hardware', 'Sleek handleless J-profile and C-profile anodized black extrusions for seamless modern cabinetry.', 4800.00, 6200.00, 22, 5.0, 38, '/assets/images/best-seller/bestSellerProductThumb1_8.png', 'Contractor', 'Hettich Pro', 1, 1, 1)
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), image=VALUES(image);
