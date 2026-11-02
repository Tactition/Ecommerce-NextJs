-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3308
-- Generation Time: Oct 30, 2026 at 10:39 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(50) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `preferred_date` date DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `author` varchar(100) DEFAULT 'Abid Electronics Team',
  `author_avatar` varchar(255) DEFAULT '/assets/images/team/team-thumb1_1.jpg',
  `category` varchar(100) DEFAULT 'Interior Design',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'published',
  `published_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `slug`, `excerpt`, `content`, `featured_image`, `author`, `author_avatar`, `category`, `meta_title`, `meta_description`, `status`, `published_at`, `created_at`, `updated_at`) VALUES
(3, 'Top Interior Design Trends Defining Luxury Homes in 2026', 'luxury-interior-design-trends-2026', 'Discover how warm minimalist wood slats, fluted textures, and ambient concealed lighting are elevating modern living spaces.', '<h3>The Evolution of Luxury Spaces</h3><p>Modern interior design in 2026 embraces organic warmth, refined textures, and integrated architectural lighting. Homeowners are moving away from sterile minimalism towards tactile luxury: fluted wood wall panels, brushed brass accents, and curved statement furniture that invite comfort and contemplation.</p>', '/assets/images/blog/blogThumb2_1.jpg', 'Wall Street Editorial Team', '/assets/images/team/team-thumb1_1.jpg', 'Interior Trends', 'Luxury Interior Design Trends 2026 | Wall Street Interiors', 'Explore key luxury interior design trends for 2026 including wood acoustic slats, curved velvet furniture, and smart concealed lighting.', 'published', '2026-10-27 17:43:50', '2026-10-27 17:43:50', '2026-10-30 13:21:35'),
(4, 'Acoustic Slat Wood Panels: Blending Sound Dampening with High Aesthetics', 'acoustic-slat-wood-panels-guide', 'A comprehensive guide on selecting natural veneer acoustic wall panels to eliminate echoes while creating striking feature walls.', '<h3>Why Acoustic Wall Panels Are Essential</h3><p>High ceilings and hard flooring often create reverberations and hollow acoustics. Acoustic slat panels backed by dense acoustic felt absorb sound frequencies while introducing the visual warmth of natural Scandinavian oak or rich walnut veneer.</p>', '/assets/images/blog/blogThumb2_2.jpg', 'Wall Street Editorial Team', '/assets/images/team/team-thumb1_2.jpg', 'Wall Treatments', 'Acoustic Slat Wood Panels Guide | Wall Street Interiors', 'Learn how acoustic wall paneling improves indoor sound quality while serving as a statement design piece in living rooms and home offices.', 'published', '2026-10-27 17:43:50', '2026-10-27 17:43:50', '2026-10-30 13:21:35'),
(5, 'Veneer vs. Acrylic vs. PU Finish: Choosing the Perfect Modular Kitchen Surface', 'veneer-acrylic-pu-modular-kitchen-guide', 'Compare durability, scratch resistance, and maintenance across top modular kitchen shutter finishes.', '<h3>Comparing Premium Kitchen Shutter Materials</h3><p>When investing in a custom modular kitchen, shutter finish dictates both longevity and daily upkeep. Acrylic offers glass-like high gloss and UV resistance, PU lacquer enables bespoke seamless color palettes, and natural wood veneer delivers unparalleled organic luxury.</p>', '/assets/images/blog/blogThumb2_3.jpg', 'Wall Street Editorial Team', '/assets/images/team/team-thumb1_3.jpg', 'Modular Living', 'Modular Kitchen Finishes: Veneer, Acrylic & PU | Wall Street Interiors', NULL, 'published', '2026-10-27 17:43:50', '2026-10-27 17:43:50', '2026-10-30 13:21:35'),
(6, 'Bespoke Hardwood Furniture: Craftsmanship & Timeless Living Spaces', 'bespoke-hardwood-furniture-craftsmanship-guide', 'Explore how seasoned walnut, solid oak joinery, and artisanal brass inlays define heirloom furniture crafted for contemporary homes.', '<h3>Heirloom Quality Furniture</h3><p>True luxury furniture is built to endure generations. Hand-selected grain patterns, mortise-and-tenon joints, and custom architectural proportions elevate every bespoke table, console, and lounge piece.</p>', '/assets/images/blog/blogThumb2_4.jpg', 'Wall Street Editorial Team', '/assets/images/team/team-thumb1_4.jpg', 'Bespoke Furniture', 'Bespoke Hardwood Furniture Guide | Wall Street Interiors', 'Learn why custom solid wood furniture remains the definitive centerpiece of luxury residential interiors in 2026.', 'published', '2026-10-30 13:08:41', '2026-10-30 13:08:41', '2026-10-30 13:21:35');

-- --------------------------------------------------------

--
-- Table structure for table `careers`
--

CREATE TABLE `careers` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `department` varchar(150) NOT NULL,
  `category_id` varchar(150) NOT NULL,
  `job_type` varchar(100) NOT NULL DEFAULT 'Full-time',
  `salary` varchar(150) NOT NULL DEFAULT 'Competitive',
  `location` varchar(200) DEFAULT 'Srinagar / On-site',
  `description` text NOT NULL,
  `requirements` text DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `careers`
--

INSERT INTO `careers` (`id`, `title`, `slug`, `department`, `category_id`, `job_type`, `salary`, `location`, `description`, `requirements`, `is_published`, `sort_order`, `created_at`, `updated_at`) VALUES
(4, 'Web Developer', 'web-developer', 'Software Engineer', 'software-engineer', 'Full-time', '₹6L - ₹10L / Year', 'Srinagar / Hybrid', 'Web developer REquired with basic knowledge of html, css and js', 'html, css, js', 1, 1, '2026-10-30 18:38:47', '2026-10-30 18:38:47');

-- --------------------------------------------------------

--
-- Table structure for table `career_applications`
--

CREATE TABLE `career_applications` (
  `id` int(11) NOT NULL,
  `career_id` int(11) DEFAULT NULL,
  `job_title` varchar(255) NOT NULL,
  `applicant_name` varchar(255) NOT NULL,
  `applicant_email` varchar(255) NOT NULL,
  `applicant_phone` varchar(100) NOT NULL,
  `portfolio_url` varchar(500) DEFAULT NULL,
  `resume_url` text DEFAULT NULL,
  `cover_note` text DEFAULT NULL,
  `status` enum('pending','reviewed','shortlisted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_submissions`
--

CREATE TABLE `contact_submissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` varchar(50) DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_submissions`
--

INSERT INTO `contact_submissions` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `created_at`) VALUES
(1, 'Alex Hunter', 'alex@example.com', '1234567890', 'General Inquiry', 'Test inquiry', 'unread', '2026-10-26 18:03:43');

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` int(11) NOT NULL,
  `question` varchar(500) NOT NULL,
  `answer` text NOT NULL,
  `is_published` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `is_published`, `sort_order`, `created_at`) VALUES
(1, 'Do you use genuine manufacturer-certified spare parts?', 'Yes, absolutely. We source all replacement parts directly from certified authorized distributors of Samsung, LG, Sony, Daikin, Bosch, and other leading brands. Every installed part includes genuine serial verification and warranty protection.', 1, 1, '2026-10-26 14:51:47'),
(2, 'How quickly can a technician inspect my appliance or device?', 'For scheduled requests, our field technicians typically arrive within 2 to 4 hours on business days across our primary service territory. We also offer priority emergency appointments for critical refrigeration and cooling failures.', 1, 2, '2026-10-26 14:51:47'),
(3, 'What warranty coverage is included with your repair work?', 'All repair work at Abid Electronics is backed by an unconditional 90 to 180-day warranty on labor and up to 1-year warranty on newly installed manufacturer parts. If the identical fault occurs during the warranty window, we fix it at no charge.', 1, 3, '2026-10-26 14:51:47'),
(4, 'Can repairs be carried out on-site at my home or workplace?', 'Over 85% of appliance repairs (including AC servicing, washing machine drive diagnostics, and refrigerator part replacements) are completed right at your doorstep. For deep micro-soldering or panel debonding, we safely transport the unit to our anti-static laboratory.', 1, 4, '2026-10-26 14:51:47'),
(5, 'How do you calculate your repair and diagnostic quotes?', 'We believe in 100% transparent pricing. You receive an upfront written diagnostic estimate detailing parts and labor before any work begins. There are zero hidden fees or surprise surcharges.', 1, 5, '2026-10-26 14:51:47');

-- --------------------------------------------------------

--
-- Table structure for table `homepage_promos`
--

CREATE TABLE `homepage_promos` (
  `id` int(11) NOT NULL,
  `card_key` varchar(50) NOT NULL,
  `badge` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(500) NOT NULL,
  `button_text` varchar(100) DEFAULT 'View All',
  `button_link` varchar(500) DEFAULT '/shop',
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `homepage_promos`
--

INSERT INTO `homepage_promos` (`id`, `card_key`, `badge`, `title`, `description`, `image`, `button_text`, `button_link`, `is_active`, `sort_order`, `updated_at`) VALUES
(1, 'promo_1', 'GET 30% OFF', 'Luxury Acoustic Wall Paneling', NULL, '/assets/images/offer/promo1.png?v=2', 'Explore Panels', '/shop?category=wall-treatments', 1, 1, '2026-10-28 13:36:52'),
(2, 'promo_2', 'LIMITED OFFER', 'Don\'t Miss 25% Off Handcrafted Living Collections', NULL, '/assets/images/offer/promo2.png?v=2', 'Browse Furniture', '/shop?category=luxury-furniture', 1, 2, '2026-10-28 13:36:52');

-- --------------------------------------------------------

--
-- Table structure for table `homepage_settings`
--

CREATE TABLE `homepage_settings` (
  `id` int(11) NOT NULL,
  `hero_badge` varchar(255) DEFAULT 'Certified Electronic Repair & Retailers',
  `hero_title` varchar(500) NOT NULL,
  `hero_subtitle` text NOT NULL,
  `hero_button_text` varchar(100) DEFAULT 'Explore Services',
  `hero_button_link` varchar(255) DEFAULT '/services',
  `hero_secondary_button_text` varchar(100) DEFAULT 'Book Consultation',
  `hero_secondary_button_link` varchar(255) DEFAULT '/contact',
  `hero_image` varchar(500) DEFAULT NULL,
  `years_experience` int(11) DEFAULT 18,
  `repairs_completed` varchar(50) DEFAULT '25,000+',
  `satisfaction_rate` varchar(50) DEFAULT '99.4%',
  `about_heading` varchar(255) DEFAULT 'Leading Electronics Solutions & Professional Care',
  `about_text` longtext DEFAULT NULL,
  `about_image` varchar(500) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hero_price` varchar(100) DEFAULT '$125.75',
  `hero_video_url` varchar(500) DEFAULT 'https://www.youtube.com/watch?v=Cn4G2lZ_g2I',
  `hero_colors` varchar(255) DEFAULT '#770215,#E9CF10,#35424B',
  `hero_image_2` varchar(500) DEFAULT '/assets/images/intro/introThumb1_2.png',
  `hero_image_3` varchar(500) DEFAULT '/assets/images/intro/introThumb1_3.png',
  `hero_video_thumb` varchar(500) DEFAULT '/assets/images/intro/introThumbShape1_3.png',
  `weekly_deal_enabled` tinyint(1) DEFAULT 1,
  `weekly_deal_title` varchar(255) DEFAULT 'Products Of The Week',
  `weekly_deal_subtitle` varchar(100) DEFAULT 'Hot Sell',
  `weekly_deal_end_date` datetime DEFAULT NULL,
  `weekly_deal_timezone` varchar(50) DEFAULT 'Asia/Kolkata',
  `weekly_deal_product_ids` varchar(500) DEFAULT '',
  `bundle_offer_title` varchar(255) DEFAULT 'Get Bundle Products Offer',
  `bundle_offer_subtitle` text DEFAULT NULL,
  `bundle_offer_button_text` varchar(100) DEFAULT 'View All',
  `bundle_offer_button_link` varchar(255) DEFAULT '/shop',
  `bundle_offer_badge` varchar(50) DEFAULT '25% OFF'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `homepage_settings`
--

INSERT INTO `homepage_settings` (`id`, `hero_badge`, `hero_title`, `hero_subtitle`, `hero_button_text`, `hero_button_link`, `hero_secondary_button_text`, `hero_secondary_button_link`, `hero_image`, `years_experience`, `repairs_completed`, `satisfaction_rate`, `about_heading`, `about_text`, `about_image`, `updated_at`, `hero_price`, `hero_video_url`, `hero_colors`, `hero_image_2`, `hero_image_3`, `hero_video_thumb`, `weekly_deal_enabled`, `weekly_deal_title`, `weekly_deal_subtitle`, `weekly_deal_end_date`, `weekly_deal_timezone`, `weekly_deal_product_ids`, `bundle_offer_title`, `bundle_offer_subtitle`, `bundle_offer_button_text`, `bundle_offer_button_link`, `bundle_offer_badge`) VALUES
(1, ' 59% discount for all items', 'Bespoke Italian Leather Recliner Lounge', 'Transforming residential and commercial sanctuaries with precision interior craftsmanship, handcrafted furnishings, and direct B2B wholesale supply.', 'Explore Collection', '/shop', 'B2B Dealer Inquiries', '/contact', '/uploads/1793124293138_04737462081c7c08a957e11ccd896058_188b1cc779e5f6d2.jpg', 12, '1,850+ Projects', '99.8%', 'Wall Street Interiors — Redefining Living Spaces with Timeless Craftsmanship', 'Wall Street Interiors is Srinagar\'s premier studio for high-end interior architecture, bespoke handcrafted furniture, architectural wall paneling, and B2B wholesale trade supplies. We collaborate closely with architects, developers, and discerning homeowners across Kashmir to curate refined, timeless spaces.', '/assets/images/about-us/aboutThumb1_2.jpg', '2026-10-28 13:36:52', '₹45,500', 'https://www.youtube.com/watch?v=Cn4G2lZ_g2I', '#8B5A2B,#D4AF37,#2F4F4F,#1C1C1C', '/uploads/1793124347409_cdfb9bc970dcb48cf5888e761de1c0d4_900e5b895279509e.jpg', '/uploads/1793124350949_452e9b11a08a1d182cde7992465f4478_36bb26ed138b546e.jpg', '/assets/images/intro/introThumbShape1_3.png', 1, 'Products Of The Week', 'Hot Sell', '2026-11-11 13:36:52', 'Asia/Kolkata', '1,2', 'Get Bundle Products Offer', NULL, 'View All', '/shop', '25% OFF');

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `storage_key` varchar(500) NOT NULL,
  `url` varchar(500) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `media`
--

INSERT INTO `media` (`id`, `file_name`, `storage_key`, `url`, `mime_type`, `file_size`, `created_at`) VALUES
(1, '2d29ea4c33448f359bbe131028d410bf.jpg', '1793039288814_2d29ea4c33448f359bbe131028d410bf_f1dcce6107b1ff10.jpg', '/uploads/1793039288814_2d29ea4c33448f359bbe131028d410bf_f1dcce6107b1ff10.jpg', 'image/jpeg', 111723, '2026-10-26 18:28:08'),
(2, 'wall-street.png', '1793124059828_wall-street_4bf7e3e797721d1b.png', '/uploads/1793124059828_wall-street_4bf7e3e797721d1b.png', 'image/png', 110461, '2026-10-27 18:01:00'),
(3, 'ws-logo.png', '1793124175564_ws-logo_36aefaa96981ed8e.png', '/uploads/1793124175564_ws-logo_36aefaa96981ed8e.png', 'image/png', 201522, '2026-10-27 18:02:55'),
(4, 'ws-logo.png', '1793124176384_ws-logo_8ae828df5538a1d1.png', '/uploads/1793124176384_ws-logo_8ae828df5538a1d1.png', 'image/png', 201522, '2026-10-27 18:02:56'),
(5, '04737462081c7c08a957e11ccd896058.jpg', '1793124293138_04737462081c7c08a957e11ccd896058_188b1cc779e5f6d2.jpg', '/uploads/1793124293138_04737462081c7c08a957e11ccd896058_188b1cc779e5f6d2.jpg', 'image/jpeg', 91748, '2026-10-27 18:04:53'),
(6, 'cdfb9bc970dcb48cf5888e761de1c0d4.jpg', '1793124347409_cdfb9bc970dcb48cf5888e761de1c0d4_900e5b895279509e.jpg', '/uploads/1793124347409_cdfb9bc970dcb48cf5888e761de1c0d4_900e5b895279509e.jpg', 'image/jpeg', 82122, '2026-10-27 18:05:47'),
(7, '452e9b11a08a1d182cde7992465f4478.jpg', '1793124350949_452e9b11a08a1d182cde7992465f4478_36bb26ed138b546e.jpg', '/uploads/1793124350949_452e9b11a08a1d182cde7992465f4478_36bb26ed138b546e.jpg', 'image/jpeg', 135176, '2026-10-27 18:05:50'),
(8, 'cdfb9bc970dcb48cf5888e761de1c0d4.jpg', '1793130312486_cdfb9bc970dcb48cf5888e761de1c0d4_29555b238955b2bc.jpg', '/uploads/1793130312486_cdfb9bc970dcb48cf5888e761de1c0d4_29555b238955b2bc.jpg', 'image/jpeg', 82122, '2026-10-27 19:45:12'),
(9, 'scrool.png', '1793193864904_scrool_2a3f7fc8f516bf62.png', '/uploads/1793193864904_scrool_2a3f7fc8f516bf62.png', 'image/png', 4131, '2026-10-28 13:24:24'),
(10, 'bmw_black.jpg', '1793193930118_bmw_black_cdda94a6ac3645a3.jpg', '/uploads/1793193930118_bmw_black_cdda94a6ac3645a3.jpg', 'image/jpeg', 77535, '2026-10-28 13:25:30'),
(11, '452e9b11a08a1d182cde7992465f4478.jpg', '1793204605866_452e9b11a08a1d182cde7992465f4478_b833bfceda746db6.jpg', '/uploads/1793204605866_452e9b11a08a1d182cde7992465f4478_b833bfceda746db6.jpg', 'image/jpeg', 135176, '2026-10-28 16:23:25'),
(12, '0bdd71d0e49c533da6c093b77c7de1a5.jpg', '1793205064209_0bdd71d0e49c533da6c093b77c7de1a5_ac4906bb3bcd8eba.jpg', '/uploads/1793205064209_0bdd71d0e49c533da6c093b77c7de1a5_ac4906bb3bcd8eba.jpg', 'image/jpeg', 57951, '2026-10-28 16:31:04'),
(13, '3d302b6130457f65dab4bed8ef286818.jpg', '1793206623951_3d302b6130457f65dab4bed8ef286818_7e60330bc18ea296.jpg', '/uploads/1793206623951_3d302b6130457f65dab4bed8ef286818_7e60330bc18ea296.jpg', 'image/jpeg', 96319, '2026-10-28 16:57:04'),
(14, '060b297a075a06f00b8ec0134d5c0a60.jpg', '1793376343980_060b297a075a06f00b8ec0134d5c0a60_123bbfc42b43906d.jpg', '/uploads/1793376343980_060b297a075a06f00b8ec0134d5c0a60_123bbfc42b43906d.jpg', 'image/jpeg', 126630, '2026-10-30 16:05:44'),
(15, 'pexels-artbovich-6980733.jpg', '1793376431891_pexels-artbovich-6980733_75750658f26c1eb3.jpg', '/uploads/1793376431891_pexels-artbovich-6980733_75750658f26c1eb3.jpg', 'image/jpeg', 2288321, '2026-10-30 16:07:13'),
(16, 'pexels-artbovich-7587777.jpg', '1793376846828_pexels-artbovich-7587777_320658c75cb3f5a0.jpg', '/uploads/1793376846828_pexels-artbovich-7587777_320658c75cb3f5a0.jpg', 'image/jpeg', 2668177, '2026-10-30 16:14:06'),
(17, 'curtians.webp', '1793381276807_curtians_d8c04e9ccaa1ee15.webp', '/uploads/1793381276807_curtians_d8c04e9ccaa1ee15.webp', 'image/webp', 84144, '2026-10-30 17:27:56'),
(18, 'curtians.webp', '1793384755150_curtians_48741361dbffde83.webp', '/uploads/1793384755150_curtians_48741361dbffde83.webp', 'image/webp', 84144, '2026-10-30 18:25:55'),
(19, 'pexels-artbovich-6980733.jpg', '1793384755874_pexels-artbovich-6980733_bbec80115b7f72c0.jpg', '/uploads/1793384755874_pexels-artbovich-6980733_bbec80115b7f72c0.jpg', 'image/jpeg', 265654, '2026-10-30 18:25:55'),
(20, 'pexels-artbovich-7546217.jpg', '1793384756538_pexels-artbovich-7546217_0650ba2f748b6d0c.jpg', '/uploads/1793384756538_pexels-artbovich-7546217_0650ba2f748b6d0c.jpg', 'image/jpeg', 331508, '2026-10-30 18:25:56'),
(21, 'pexels-artbovich-7587777.jpg', '1793384757006_pexels-artbovich-7587777_a06388a40571508e.jpg', '/uploads/1793384757006_pexels-artbovich-7587777_a06388a40571508e.jpg', 'image/jpeg', 262894, '2026-10-30 18:25:57'),
(22, 'pexels-lukas-rychvalsky-2889618.jpg', '1793384757415_pexels-lukas-rychvalsky-2889618_8f0971459ce83d47.jpg', '/uploads/1793384757415_pexels-lukas-rychvalsky-2889618_8f0971459ce83d47.jpg', 'image/jpeg', 297810, '2026-10-30 18:25:57'),
(23, '21bbbfc314863bbe9b465dd25b63ccdb.jpg', '1793386976268_21bbbfc314863bbe9b465dd25b63ccdb_2a8be3a36280288c.jpg', '/uploads/1793386976268_21bbbfc314863bbe9b465dd25b63ccdb_2a8be3a36280288c.jpg', 'image/jpeg', 155114, '2026-10-30 19:02:56');

-- --------------------------------------------------------

--
-- Table structure for table `nav_menu_items`
--

CREATE TABLE `nav_menu_items` (
  `id` int(11) NOT NULL,
  `label` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `target` varchar(50) DEFAULT '_self',
  `parent_id` int(11) DEFAULT NULL,
  `menu_location` varchar(50) DEFAULT 'header',
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nav_menu_items`
--

INSERT INTO `nav_menu_items` (`id`, `label`, `url`, `target`, `parent_id`, `menu_location`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(15, 'Home', '/', '_self', NULL, 'header', 1, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(16, 'Shop', '/shop', '_self', NULL, 'header', 2, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(19, 'About Us', '/about', '_self', NULL, 'header', 5, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(20, 'Journal', '/blog', '_self', NULL, 'header', 6, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(21, 'Contact', '/contact', '_self', NULL, 'header', 7, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(22, 'Luxury Furniture', '/shop?category=luxury-furniture', '_self', NULL, 'categories', 1, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(23, 'Wall Treatments & Panels', '/shop?category=wall-treatments-panels', '_self', NULL, 'categories', 2, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(24, 'Architectural Lighting', '/shop?category=architectural-lighting', '_self', NULL, 'categories', 3, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(25, 'Modular Kitchen & Wardrobes', '/shop?category=modular-kitchen-wardrobes', '_self', NULL, 'categories', 4, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(26, 'Decor & Furnishings', '/shop?category=decor-furnishings', '_self', NULL, 'categories', 5, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(27, 'B2B Wholesale Hardware', '/shop?category=b2b-wholesale-hardware', '_self', NULL, 'categories', 6, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(28, 'About Wall Street', '/about', '_self', NULL, 'footer', 1, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(29, 'Turnkey Services', '/services', '_self', NULL, 'footer', 2, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(30, 'Shop Catalog', '/shop', '_self', NULL, 'footer', 3, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(31, 'Architectural Brands', '/brands', '_self', NULL, 'footer', 4, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(33, 'Contact Studio', '/contact', '_self', NULL, 'footer', 6, 1, '2026-10-27 18:38:55', '2026-10-27 18:38:55'),
(34, 'Recliners & Lounge Sofas', '/shop?category=luxury-furniture&sub=recliners', '_self', 22, 'categories', 1, 1, '2026-10-27 19:05:53', '2026-10-27 19:05:53'),
(35, 'Bespoke Dining Sets', '/shop?category=luxury-furniture&sub=dining', '_self', 22, 'categories', 2, 1, '2026-10-27 19:05:53', '2026-10-27 19:05:53'),
(36, 'Custom Coffee & Side Tables', '/shop?category=luxury-furniture&sub=tables', '_self', 22, 'categories', 3, 1, '2026-10-27 19:05:53', '2026-10-27 19:05:53'),
(37, 'Acoustic Slat Wood Panels', '/shop?category=wall-treatments-panels&sub=acoustic-slat', '_self', 23, 'categories', 1, 1, '2026-10-27 19:05:53', '2026-10-27 19:05:53'),
(38, '3D Fluted Wall Cladding', '/shop?category=wall-treatments-panels&sub=fluted-cladding', '_self', 23, 'categories', 2, 1, '2026-10-27 19:05:53', '2026-10-27 19:05:53'),
(39, 'Luxury Charcoal Louvers', '/shop?category=wall-treatments-panels&sub=charcoal-louvers', '_self', 23, 'categories', 3, 1, '2026-10-27 19:05:53', '2026-10-27 19:05:53'),
(40, 'Pendant & Chandelier Lighting', '/shop?category=architectural-lighting&sub=chandeliers', '_self', 24, 'categories', 1, 1, '2026-10-27 19:05:53', '2026-10-27 19:05:53'),
(41, 'Magnetic Track & COB Fixtures', '/shop?category=architectural-lighting&sub=track-lights', '_self', 24, 'categories', 2, 1, '2026-10-27 19:05:53', '2026-10-27 19:05:53'),
(42, 'Walk-in Glass Wardrobes', '/shop?category=modular-kitchen-wardrobes&sub=wardrobes', '_self', 25, 'categories', 1, 1, '2026-10-27 19:05:53', '2026-10-27 19:05:53'),
(43, 'European Modular Kitchens', '/shop?category=modular-kitchen-wardrobes&sub=kitchens', '_self', 25, 'categories', 2, 1, '2026-10-27 19:05:53', '2026-10-27 19:05:53'),
(48, 'Curtains', '/curtains', '_self', NULL, 'categories', 6, 1, '2026-10-28 17:02:29', '2026-10-28 17:02:29'),
(49, 'Careers', '/careers', '_self', NULL, 'header', 4, 1, '2026-10-30 18:36:14', '2026-10-30 18:36:14');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `gstin` varchar(50) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'India',
  `ship_to_different` tinyint(1) DEFAULT 0,
  `shipping_first_name` varchar(100) DEFAULT NULL,
  `shipping_last_name` varchar(100) DEFAULT NULL,
  `shipping_address_line1` varchar(255) DEFAULT NULL,
  `shipping_address_line2` varchar(255) DEFAULT NULL,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_state` varchar(100) DEFAULT NULL,
  `shipping_postal_code` varchar(20) DEFAULT NULL,
  `shipping_country` varchar(100) DEFAULT NULL,
  `order_notes` text DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `coupon_code` varchar(50) DEFAULT NULL,
  `shipping_fee` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL DEFAULT 'cod',
  `payment_status` varchar(50) NOT NULL DEFAULT 'pending',
  `order_status` varchar(50) NOT NULL DEFAULT 'confirmed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `first_name`, `last_name`, `company_name`, `gstin`, `email`, `phone`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `ship_to_different`, `shipping_first_name`, `shipping_last_name`, `shipping_address_line1`, `shipping_address_line2`, `shipping_city`, `shipping_state`, `shipping_postal_code`, `shipping_country`, `order_notes`, `subtotal`, `discount_amount`, `coupon_code`, `shipping_fee`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `created_at`, `updated_at`) VALUES
(2, 'WSI-790232-3729', 3, 'Syed', 'Tanzeel', 'afdsd', 'ADDSDSF12345678', 'syedtanzeel64@gmail.com', '67599595967', 'adsfdsf', 'adsfadsf', 'adfdsf', 'Jammu & Kashmir', '190001', 'India', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dzsfasdf', 720.00, 0.00, NULL, 0.00, 720.00, 'cod', 'pending', 'delivered', '2026-10-30 19:33:10', '2026-10-30 20:39:12'),
(3, 'WSI-556625-4317', 3, 'Syed', 'Tanzeel', 'sfdasdfda', 'VGHY123456789D7', 'syedtanzeel64@gmail.com', '1234567895', 'vxcsx', 'sgffsg', 'sfdsgdf', 'Jammu & Kashmir', '190001', 'India', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[Cancelled by customer on 31/10/2026: Changed mind / Ordered by mistake]', 120.00, 0.00, NULL, 0.00, 120.00, 'cod', 'pending', 'cancelled', '2026-10-30 19:45:56', '2026-10-30 20:55:50');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variation_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_slug` varchar(255) NOT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `attributes_json` text DEFAULT NULL,
  `custom_details_json` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variation_id`, `product_name`, `product_slug`, `product_image`, `sku`, `price`, `quantity`, `total_price`, `attributes_json`, `custom_details_json`, `created_at`) VALUES
(2, 2, 36, 21, 'Test Product', 'test-product', '/uploads/1793206623951_3d302b6130457f65dab4bed8ef286818_7e60330bc18ea296.jpg', 'TEST-KING-NAVY', 120.00, 6, 720.00, '{\"Size / Dimensions\":\"King (76x80)\",\"Color / Finish\":\"Navy Velvet\"}', NULL, '2026-10-30 19:33:10'),
(3, 3, 36, 21, 'Test Product', 'test-product', '/uploads/1793206623951_3d302b6130457f65dab4bed8ef286818_7e60330bc18ea296.jpg', 'TEST-KING-NAVY', 120.00, 1, 120.00, '{\"Size / Dimensions\":\"King (76x80)\",\"Color / Finish\":\"Navy Velvet\"}', NULL, '2026-10-30 19:45:56');

-- --------------------------------------------------------

--
-- Table structure for table `partner_brands`
--

CREATE TABLE `partner_brands` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `logo` varchar(500) NOT NULL,
  `website_url` varchar(500) DEFAULT '#',
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `partner_brands`
--

INSERT INTO `partner_brands` (`id`, `name`, `logo`, `website_url`, `is_active`, `sort_order`, `created_at`) VALUES
(13, 'Hafele Architectural Hardware', '/assets/images/brand-logo/brand-logo1_1.png', 'https://www.hafele.com', 1, 1, '2026-10-27 17:43:50'),
(14, 'Hettich Germany', '/assets/images/brand-logo/brand-logo1_2.png', 'https://www.hettich.com', 1, 2, '2026-10-27 17:43:50'),
(15, 'Blum Hardware Solutions', '/assets/images/brand-logo/brand-logo1_3.png', 'https://www.blum.com', 1, 3, '2026-10-27 17:43:50'),
(16, 'Saint-Gobain Glass', '/assets/images/brand-logo/brand-logo1_4.png', 'https://www.saint-gobain.com', 1, 4, '2026-10-27 17:43:50'),
(17, 'Asian Paints Royale', '/assets/images/brand-logo/brand-logo1_5.png', 'https://www.asianpaints.com', 1, 5, '2026-10-27 17:43:50'),
(18, 'D\'Decor Home Fabrics', '/assets/images/brand-logo/brand-logo1_6.png', 'https://www.ddecor.com', 1, 6, '2026-10-27 17:43:50'),
(19, 'Kohler Luxury Fixtures', '/assets/images/brand-logo/brand-logo2_1.png', 'https://www.kohler.com', 1, 7, '2026-10-27 17:43:50'),
(20, 'Greenply Plywood & Veneer', '/assets/images/brand-logo/brand-logo2_2.png', 'https://www.greenply.com', 1, 8, '2026-10-27 17:43:50'),
(21, 'CenturyPly Club Prime', '/assets/images/brand-logo/brand-logo2_3.png', 'https://www.centuryply.com', 1, 9, '2026-10-27 17:43:50'),
(22, 'Somany Ceramics', '/assets/images/brand-logo/brand-logo2_4.png', 'https://www.somanyceramics.com', 1, 10, '2026-10-27 17:43:50'),
(23, 'Grohe Bath Systems', '/assets/images/brand-logo/brand-logo2_5.png', 'https://www.grohe.com', 1, 11, '2026-10-27 17:43:50'),
(24, 'Kajaria Eternity', '/assets/images/brand-logo/brand-logo4_1.png', 'https://www.kajaria.com', 1, 12, '2026-10-27 17:43:50');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category_slug` varchar(100) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `subcategory_slug` varchar(255) DEFAULT NULL,
  `subcategory_name` varchar(255) DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `discount_percent` int(11) DEFAULT 0,
  `rating` decimal(2,1) DEFAULT 5.0,
  `reviews_count` int(11) DEFAULT 0,
  `image` varchar(255) NOT NULL,
  `gallery_images` longtext DEFAULT NULL,
  `badge` varchar(50) DEFAULT NULL,
  `brand` varchar(100) DEFAULT 'Generic',
  `is_best_seller` tinyint(1) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_popular` tinyint(1) DEFAULT 0,
  `is_on_sale` tinyint(1) DEFAULT 0,
  `has_variations` tinyint(1) DEFAULT 0,
  `allow_custom_sizing` tinyint(1) DEFAULT 0,
  `custom_size_rate` decimal(10,2) DEFAULT 0.00,
  `custom_size_unit` varchar(50) DEFAULT 'sq_ft',
  `custom_size_min_price` decimal(10,2) DEFAULT 0.00,
  `custom_size_linear_mode` varchar(50) DEFAULT 'length_plus_width',
  `stock` int(11) DEFAULT 50,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `category_slug`, `category_name`, `subcategory_slug`, `subcategory_name`, `short_description`, `description`, `price`, `original_price`, `discount_percent`, `rating`, `reviews_count`, `image`, `gallery_images`, `badge`, `brand`, `is_best_seller`, `is_featured`, `is_popular`, `is_on_sale`, `has_variations`, `allow_custom_sizing`, `custom_size_rate`, `custom_size_unit`, `custom_size_min_price`, `custom_size_linear_mode`, `stock`, `status`, `created_at`) VALUES
(18, 'Milano Italian Leather Accent Chair', 'milano-italian-leather-accent-chair', 'luxury-furniture', 'Luxury Furniture', NULL, NULL, 'Hand-stitched genuine Italian grain leather accent chair with brushed brass tapered legs.', NULL, 28500.00, 36000.00, 20, 5.0, 14, '/assets/images/top-deals-item/topDealsItemThumb1_1.png', '[\"/assets/images/top-deals-item/topDealsItemThumb1_1.png\",\"/assets/images/top-deals-item/topDealsItemThumb1_2.png\",\"/assets/images/top-deals-item/topDealsItemThumb1_3.png\",\"/assets/images/top-deals-item/topDealsItemThumb1_4.png\"]', 'Hot', 'Wall Street Atelier', 1, 1, 1, 1, 1, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(19, 'Nordic Oak Slat Acoustic Wall Panel', 'nordic-oak-slat-acoustic-panel', 'wall-treatments', 'Wall Treatments & Panels', NULL, NULL, 'Natural white oak veneered MDF acoustic slats mounted on recycled felt backing for superior sound dampening.', NULL, 3850.00, 5200.00, 25, 5.0, 28, '/assets/images/top-deals-item/topDealsItemThumb1_2.png', NULL, 'Sale', 'AcoustiWall Pro', 1, 1, 1, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(20, 'Brushed Brass Linear Pendant Chandelier', 'brushed-brass-linear-pendant', 'lighting-fixtures', 'Architectural Lighting', NULL, NULL, 'Architectural minimalist LED chandelier with satin champagne gold finish and dimmable ambiance.', NULL, 14900.00, 19500.00, 23, 5.0, 41, '/assets/images/top-deals-item/topDealsItemThumb1_3.png', NULL, 'New', 'Lumina Luxe', 1, 1, 0, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(21, 'Calacatta Gold Marble Center Table', 'calacatta-gold-marble-table', 'luxury-furniture', 'Luxury Furniture', NULL, NULL, 'Polished Italian Calacatta gold composite marble tabletop with geometric carbon-black powder-coated steel base.', NULL, 22000.00, 28000.00, 21, 4.9, 19, '/assets/images/top-deals-item/topDealsItemThumb1_4.png', NULL, NULL, 'Wall Street Atelier', 1, 0, 1, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(22, 'Velvet Chesterfield 3-Seater Lounge Sofa', 'velvet-chesterfield-3-seater-sofa', 'luxury-furniture', 'Luxury Furniture', NULL, NULL, 'Classic deep button-tufted Chesterfield sofa upholstered in ultra-plush stain-resistant royal velvet.', NULL, 68000.00, 85000.00, 20, 5.0, 33, '/assets/images/top-deals-item/topDealsItemThumb1_5.png', NULL, 'Popular', 'Wall Street Atelier', 1, 1, 1, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(23, 'Matte Charcoal Fluted Wall Panel (8ft)', 'matte-charcoal-fluted-wall-panel', 'wall-treatments', 'Wall Treatments & Panels', NULL, NULL, 'Waterproof charcoal polymer fluted paneling ideal for luxury feature walls, bed backs, and TV units.', NULL, 4200.00, 5500.00, 23, 5.0, 52, '/assets/images/top-deals-item/topDealsItemThumb1_6.png', NULL, 'Hot', 'AcoustiWall Pro', 1, 1, 0, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(24, 'Minimalist Recessed Magnetic Track Light Set', 'minimalist-magnetic-track-light', 'lighting-fixtures', 'Architectural Lighting', NULL, NULL, 'Ultra-thin surface or recessed magnetic track lighting kit with interchangeable flood and spotlight modules.', NULL, 6400.00, 8000.00, 20, 4.9, 17, '/assets/images/top-deals-item/topDealsItemThumb1_7.png', NULL, NULL, 'Lumina Luxe', 1, 0, 1, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(25, 'Heavy-Duty Soft-Close Concealed Hinges (20-Pack)', 'heavy-duty-soft-close-concealed-hinges', 'wholesale-hardware', 'B2B Wholesale Hardware', NULL, NULL, 'Contractor-grade stainless steel 3D adjustable hydraulic soft-close cabinet hinges for modular kitchens.', NULL, 2950.00, 3800.00, 22, 5.0, 49, '/assets/images/top-deals-item/topDealsItemThumb1_8.png', NULL, 'B2B Bulk', 'Hettich Pro', 1, 1, 1, 1, 0, 1, 14.00, 'linear_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(26, 'Royal Emerald Velvet Dining Chairs (Set of 2)', 'royal-emerald-dining-chairs', 'luxury-furniture', 'Luxury Furniture', NULL, NULL, 'Curved ergonomic backrest dining chairs in rich emerald velvet with gold-tipped solid ash wood legs.', NULL, 18500.00, 24000.00, 23, 5.0, 22, '/assets/images/best-seller/bestSellerProductThumb1_1.png', NULL, 'Exclusive', 'Wall Street Atelier', 0, 1, 1, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(27, 'Handcrafted Teakwood Console Credenza', 'handcrafted-teakwood-console-credenza', 'luxury-furniture', 'Luxury Furniture', NULL, NULL, 'Live-edge reclaimed seasoned teakwood console with woven cane rattan drawer fronts and brass pulls.', NULL, 31000.00, 39000.00, 20, 5.0, 36, '/assets/images/best-seller/bestSellerProductThumb1_2.png', NULL, 'Handmade', 'Wall Street Atelier', 0, 1, 0, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(28, '3D Textured Geometric Wave Feature Panel', '3d-textured-geometric-wave-panel', 'wall-treatments', 'Wall Treatments & Panels', NULL, NULL, 'Seamless interlocking paintable gypsum wall panel creating dramatic light and shadow dimensions.', NULL, 2650.00, 3400.00, 22, 4.8, 18, '/assets/images/best-seller/bestSellerProductThumb1_3.png', NULL, '15% OFF', 'AcoustiWall Pro', 0, 1, 1, 1, 0, 1, 10.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(29, 'Dimmable Warm LED Halo Ring Chandelier', 'dimmable-warm-led-halo-chandelier', 'lighting-fixtures', 'Architectural Lighting', NULL, NULL, 'Dual-tier brushed titanium floating ring chandelier with indirect silicone diffuser for soft luxury lighting.', NULL, 18000.00, 24000.00, 25, 5.0, 29, '/assets/images/best-seller/bestSellerProductThumb1_4.png', NULL, '25% OFF', 'Lumina Luxe', 0, 0, 1, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(30, 'Acrylic Gloss Modular Kitchen Shutter Unit', 'acrylic-gloss-modular-kitchen-shutter', 'modular-kitchen', 'Modular Kitchen & Wardrobes', NULL, NULL, 'Scratch-resistant 1mm anti-fingerprint acrylic shutters on 18mm BWR plywood with seamless laser edge banding.', NULL, 42000.00, 55000.00, 24, 5.0, 44, '/assets/images/best-seller/bestSellerProductThumb1_5.png', NULL, 'Modular', 'Hafele Interior', 0, 1, 1, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(31, 'Modern Walk-In Wardrobe Master Organizers', 'modern-walk-in-wardrobe-organizers', 'modular-kitchen', 'Modular Kitchen & Wardrobes', NULL, NULL, 'Custom aluminum profile walk-in closet system with integrated sensor LED lighting and felt-lined jewelry drawers.', NULL, 58000.00, 75000.00, 22, 5.0, 27, '/assets/images/best-seller/bestSellerProductThumb1_6.png', NULL, 'Custom', 'Blum Systems', 0, 1, 0, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(32, 'Handwoven Kashmiri Wool Artisan Rug (5x7)', 'handwoven-kashmiri-wool-artisan-rug', 'decor-furnishings', 'Decor & Furnishings', NULL, NULL, 'Hand-knotted 100% fine New Zealand wool rug featuring contemporary abstract gradients in taupe and ivory.', NULL, 26500.00, 34000.00, 22, 5.0, 19, '/assets/images/best-seller/bestSellerProductThumb1_7.png', NULL, 'Artisan', 'Wall Street Atelier', 0, 0, 1, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(33, 'Aluminium Gola Architectural Profiles (Pack of 6)', 'aluminium-gola-architectural-profiles', 'wholesale-hardware', 'B2B Wholesale Hardware', NULL, NULL, 'Sleek handleless J-profile and C-profile anodized black extrusions for seamless modern cabinetry.', NULL, 4800.00, 6200.00, 22, 5.0, 38, '/assets/images/best-seller/bestSellerProductThumb1_8.png', NULL, 'Contractor', 'Hettich Pro', 0, 1, 1, 1, 0, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-27 17:43:50'),
(34, 'test', 'test', 'decor-furnishings', 'Decor & Furnishings', 'test', 'test', 'ugtfiyktv', 'ljhvblv', 25.00, NULL, 58, 5.0, 0, '/uploads/1793130312486_cdfb9bc970dcb48cf5888e761de1c0d4_29555b238955b2bc.jpg', NULL, 'hot', 'Wall Street Interiors', 1, 1, 1, 1, 1, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 90, 'active', '2026-10-27 19:45:24'),
(35, 'test2', 'test2', 'luxury-furniture', 'Luxury Furniture', 'bespoke-dining-sets', 'Bespoke Dining Sets', 'kvhgvkv', 'hjvkvki', 25.00, 40.00, 10, 5.0, 0, '/uploads/1793204605866_452e9b11a08a1d182cde7992465f4478_b833bfceda746db6.jpg', NULL, 'HOT', 'Wall Street Interiors', 1, 1, 1, 1, 1, 0, 0.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-28 16:23:46'),
(36, 'Test Product', 'test-product', 'curtains', 'Curtains', NULL, NULL, 'Test Description !', 'Detailed Description Two', 25.00, NULL, 0, 5.0, 0, '/uploads/1793381276807_curtians_d8c04e9ccaa1ee15.webp', '[\"/uploads/1793384755150_curtians_48741361dbffde83.webp\",\"/uploads/1793384755874_pexels-artbovich-6980733_bbec80115b7f72c0.jpg\",\"/uploads/1793384756538_pexels-artbovich-7546217_0650ba2f748b6d0c.jpg\",\"/uploads/1793384757006_pexels-artbovich-7587777_a06388a40571508e.jpg\",\"/uploads/1793384757415_pexels-lukas-rychvalsky-2889618_8f0971459ce83d47.jpg\"]', 'Hot', 'Wall Street Interiors', 1, 1, 1, 1, 1, 1, 14.00, 'sq_ft', 0.00, 'length_plus_width', 50, 'active', '2026-10-28 16:59:59');

-- --------------------------------------------------------

--
-- Table structure for table `product_attributes`
--

CREATE TABLE `product_attributes` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_attributes`
--

INSERT INTO `product_attributes` (`id`, `name`, `slug`, `created_at`) VALUES
(1, 'Size / Dimensions', 'size', '2026-10-28 13:36:51'),
(2, 'Color / Finish', 'color', '2026-10-28 13:36:51'),
(3, 'Material', 'material', '2026-10-28 13:36:51'),
(5, 'Leg Finish', 'leg-finish', '2026-10-28 17:01:21');

-- --------------------------------------------------------

--
-- Table structure for table `product_attribute_values`
--

CREATE TABLE `product_attribute_values` (
  `id` int(11) NOT NULL,
  `attribute_id` int(11) NOT NULL,
  `value` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `color_code` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_attribute_values`
--

INSERT INTO `product_attribute_values` (`id`, `attribute_id`, `value`, `slug`, `color_code`, `created_at`) VALUES
(1, 1, 'Standard (5x7 ft)', 'standard-5x7', NULL, '2026-10-28 13:36:52'),
(2, 1, 'Large (6x9 ft)', 'large-6x9', NULL, '2026-10-28 13:36:52'),
(3, 1, 'Extra Large (8x10 ft)', 'xl-8x10', NULL, '2026-10-28 13:36:52'),
(4, 1, 'Single Panel (240x60 cm)', 'single-240x60', NULL, '2026-10-28 13:36:52'),
(5, 1, 'Double Pack (240x120 cm)', 'double-240x120', NULL, '2026-10-28 13:36:52'),
(6, 2, 'Natural Oak', 'natural-oak', '#D2B48C', '2026-10-28 13:36:52'),
(7, 2, 'Smoked Walnut', 'smoked-walnut', '#5C4033', '2026-10-28 13:36:52'),
(8, 2, 'Charcoal Black', 'charcoal-black', '#222222', '2026-10-28 13:36:52'),
(9, 2, 'Brushed Gold', 'brushed-gold', '#D4AF37', '2026-10-28 13:36:52'),
(10, 3, 'Solid Teak Wood', 'solid-teak', NULL, '2026-10-28 13:36:52'),
(11, 3, 'Acoustic Felt & Timber', 'acoustic-felt-timber', NULL, '2026-10-28 13:36:52'),
(12, 3, 'Italian Top-Grain Leather', 'italian-leather', NULL, '2026-10-28 13:36:52'),
(13, 5, 'Brushed Gold', 'brushed-gold', NULL, '2026-10-28 17:01:21'),
(14, 5, 'Matte Black', 'matte-black', NULL, '2026-10-28 17:01:21'),
(15, 1, 'King (76x80)', 'king-76x80', NULL, '2026-10-28 17:20:37'),
(16, 1, 'Queen (60x80)', 'queen-60x80', NULL, '2026-10-28 17:20:37'),
(17, 2, 'Navy Velvet', 'navy-velvet', NULL, '2026-10-28 17:20:37'),
(18, 2, 'Emerald Velvet', 'emerald-velvet', NULL, '2026-10-28 17:20:37'),
(19, 1, '6.7 * 4.5ft', '6-7-4-5ft', NULL, '2026-10-29 18:04:18'),
(20, 1, '7 ft *3ft', '7-ft-3ft', NULL, '2026-10-29 18:04:18'),
(21, 1, '5.3 * 6.2 ft', '5-3-6-2-ft', NULL, '2026-10-29 18:06:46');

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `icon_type` varchar(50) DEFAULT 'laptop',
  `image` varchar(255) DEFAULT NULL,
  `item_count` int(11) DEFAULT 16,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `parent_id`, `name`, `slug`, `icon_type`, `image`, `item_count`, `is_active`, `created_at`) VALUES
(13, NULL, 'Luxury Furniture', 'luxury-furniture', 'sofa', '/uploads/1793386976268_21bbbfc314863bbe9b465dd25b63ccdb_2a8be3a36280288c.jpg', 6, 1, '2026-10-27 17:43:50'),
(14, NULL, 'Wall Treatments & Panels', 'wall-treatments', 'wall', '/assets/images/top-deals-item/topDealsItemThumb1_2.png', 3, 1, '2026-10-27 17:43:50'),
(15, NULL, 'Architectural Lighting', 'lighting-fixtures', 'lamp', '/assets/images/top-deals-item/topDealsItemThumb1_3.png', 3, 1, '2026-10-27 17:43:50'),
(16, NULL, 'Modular Kitchen & Wardrobes', 'modular-kitchen', 'kitchen', '/assets/images/best-seller/bestSellerProductThumb1_5.png', 2, 1, '2026-10-27 17:43:50'),
(17, NULL, 'Decor & Furnishings', 'decor-furnishings', 'decor', '/assets/images/best-seller/bestSellerProductThumb1_7.png', 2, 1, '2026-10-27 17:43:50'),
(18, NULL, 'B2B Wholesale Hardware', 'wholesale-hardware', 'hardware', '/assets/images/top-deals-item/topDealsItemThumb1_8.png', 2, 1, '2026-10-27 17:43:50'),
(19, NULL, 'Curtains', 'curtains', 'gadget', '/uploads/1793381276807_curtians_d8c04e9ccaa1ee15.webp', 1, 1, '2026-10-27 19:29:02'),
(20, 13, 'Recliners & Lounge Sofas', 'recliners-lounge-sofas', 'fa-solid fa-couch', '/assets/images/top-deals-item/topDealsItemThumb1_1.png', 0, 1, '2026-10-27 19:34:40'),
(21, 13, 'Bespoke Dining Sets', 'bespoke-dining-sets', 'fa-solid fa-chair', '/assets/images/best-seller/bestSellerProductThumb1_1.png', 1, 1, '2026-10-27 19:34:40'),
(22, 13, 'Custom Coffee & Side Tables', 'custom-coffee-side-tables', 'fa-solid fa-table', '/assets/images/top-deals-item/topDealsItemThumb1_4.png', 0, 1, '2026-10-27 19:34:40'),
(23, 14, 'Acoustic Slat Wood Panels', 'acoustic-slat-wood-panels', 'fa-solid fa-bars', NULL, 0, 1, '2026-10-27 19:34:40'),
(24, 14, '3D Fluted Wall Cladding', '3d-fluted-wall-cladding', 'fa-solid fa-border-all', NULL, 0, 1, '2026-10-27 19:34:40'),
(25, 14, 'Luxury Charcoal Louvers', 'luxury-charcoal-louvers', 'fa-solid fa-layer-group', NULL, 0, 1, '2026-10-27 19:34:40'),
(26, 15, 'Pendant & Chandelier Lighting', 'pendant-chandelier-lighting', 'fa-solid fa-lightbulb', NULL, 0, 1, '2026-10-27 19:34:40'),
(27, 15, 'Magnetic Track & COB Fixtures', 'magnetic-track-cob-fixtures', 'fa-solid fa-bolt', NULL, 0, 1, '2026-10-27 19:34:40'),
(28, 16, 'Walk-in Glass Wardrobes', 'walk-in-glass-wardrobes', 'fa-solid fa-door-closed', NULL, 0, 1, '2026-10-27 19:34:40'),
(29, 16, 'European Modular Kitchens', 'european-modular-kitchens', 'fa-solid fa-kitchen-set', NULL, 0, 1, '2026-10-27 19:34:40'),
(31, NULL, 'couch', 'couch', 'fa-solid fa-couch', NULL, 0, 1, '2026-10-27 19:44:02'),
(32, 17, 'test', 'test', 'fa-solid fa-shapes', NULL, 1, 1, '2026-10-28 13:06:39');

-- --------------------------------------------------------

--
-- Table structure for table `product_variations`
--

CREATE TABLE `product_variations` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 10,
  `image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variations`
--

INSERT INTO `product_variations` (`id`, `product_id`, `sku`, `price`, `original_price`, `stock`, `image`, `is_active`, `created_at`) VALUES
(1, 34, 'TEST-STD-OAK', 25.00, 35.00, 15, '/uploads/1793130312486_cdfb9bc970dcb48cf5888e761de1c0d4_29555b238955b2bc.jpg', 1, '2026-10-28 13:37:17'),
(2, 34, 'TEST-LRG-WAL', 45.00, 60.00, 8, '/uploads/1793130312486_cdfb9bc970dcb48cf5888e761de1c0d4_29555b238955b2bc.jpg', 1, '2026-10-28 13:37:17'),
(3, 35, 'TEST2-STA-NAT-ACO', 25.00, 40.00, 50, '/assets/images/product/01.png', 1, '2026-10-28 16:23:46'),
(4, 35, 'TEST2-STA-SMO-ACO', 35.00, 50.00, 50, '/assets/images/product/01.png', 1, '2026-10-28 16:23:46'),
(5, 35, 'TEST2-LAR-NAT-ACO', 44.99, 60.00, 50, '/assets/images/product/01.png', 1, '2026-10-28 16:23:46'),
(6, 35, 'TEST2-LAR-SMO-ACO', 55.00, 70.00, 50, '/assets/images/product/01.png', 1, '2026-10-28 16:23:46'),
(7, 18, 'MILANO-GOLD', 350.00, 420.00, 10, '/assets/images/product/01.png', 1, '2026-10-28 17:01:21'),
(8, 18, 'MILANO-BLACK', 320.00, 390.00, 15, '/assets/images/product/02.png', 1, '2026-10-28 17:01:21'),
(21, 36, 'TEST-KING-NAVY', 120.00, 150.00, 15, '/uploads/1793206623951_3d302b6130457f65dab4bed8ef286818_7e60330bc18ea296.jpg', 1, '2026-10-30 18:26:06'),
(22, 36, 'TEST-QUEEN-EMERALD', 110.00, 140.00, 20, '/uploads/1793206623951_3d302b6130457f65dab4bed8ef286818_7e60330bc18ea296.jpg', 1, '2026-10-30 18:26:06');

-- --------------------------------------------------------

--
-- Table structure for table `product_variation_values`
--

CREATE TABLE `product_variation_values` (
  `id` int(11) NOT NULL,
  `variation_id` int(11) NOT NULL,
  `attribute_id` int(11) NOT NULL,
  `value_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variation_values`
--

INSERT INTO `product_variation_values` (`id`, `variation_id`, `attribute_id`, `value_id`) VALUES
(1, 1, 1, 1),
(2, 1, 2, 6),
(3, 2, 1, 2),
(4, 2, 2, 7),
(5, 3, 1, 1),
(6, 3, 2, 6),
(7, 3, 3, 11),
(8, 4, 1, 1),
(9, 4, 2, 7),
(10, 4, 3, 11),
(11, 5, 1, 2),
(12, 5, 2, 6),
(13, 5, 3, 11),
(14, 6, 1, 2),
(15, 6, 2, 7),
(16, 6, 3, 11),
(17, 7, 5, 13),
(18, 8, 5, 14),
(43, 21, 1, 15),
(44, 21, 2, 17),
(45, 22, 1, 16),
(46, 22, 2, 18);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_system`, `created_at`, `updated_at`) VALUES
(1, 'Super Administrator', 'admin', 'Complete, unrestricted control across all modules, website configuration, and user permissions.', 1, '2026-10-30 17:26:34', '2026-10-30 17:26:34'),
(2, 'Content Editor', 'editor', 'Manage catalog products, categories, work gallery, blogs, testimonials, and services.', 0, '2026-10-30 17:26:34', '2026-10-30 17:26:34'),
(3, 'Store Manager', 'manager', 'Manage store inventory, products, categories, pricing, customer reviews, and inquiries.', 0, '2026-10-30 17:26:34', '2026-10-30 17:26:34'),
(4, 'Customer', 'customer', 'Registered shopper with access to cart, orders, and wishlist.', 0, '2026-10-30 20:13:22', '2026-10-30 20:13:22');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `module`, `action`) VALUES
(34, 1, 'blog', 'create'),
(36, 1, 'blog', 'delete'),
(35, 1, 'blog', 'edit'),
(33, 1, 'blog', 'view'),
(18, 1, 'brands', 'create'),
(20, 1, 'brands', 'delete'),
(19, 1, 'brands', 'edit'),
(17, 1, 'brands', 'view'),
(6, 1, 'categories', 'create'),
(8, 1, 'categories', 'delete'),
(7, 1, 'categories', 'edit'),
(5, 1, 'categories', 'view'),
(30, 1, 'faqs', 'create'),
(32, 1, 'faqs', 'delete'),
(31, 1, 'faqs', 'edit'),
(29, 1, 'faqs', 'view'),
(22, 1, 'gallery', 'create'),
(24, 1, 'gallery', 'delete'),
(23, 1, 'gallery', 'edit'),
(21, 1, 'gallery', 'view'),
(10, 1, 'menus', 'create'),
(12, 1, 'menus', 'delete'),
(11, 1, 'menus', 'edit'),
(9, 1, 'menus', 'view'),
(2, 1, 'products', 'create'),
(4, 1, 'products', 'delete'),
(3, 1, 'products', 'edit'),
(1, 1, 'products', 'view'),
(47, 1, 'roles', 'create'),
(49, 1, 'roles', 'delete'),
(48, 1, 'roles', 'edit'),
(46, 1, 'roles', 'view'),
(14, 1, 'services', 'create'),
(16, 1, 'services', 'delete'),
(15, 1, 'services', 'edit'),
(13, 1, 'services', 'view'),
(41, 1, 'settings', 'edit'),
(40, 1, 'settings', 'view'),
(39, 1, 'submissions', 'delete'),
(38, 1, 'submissions', 'edit'),
(37, 1, 'submissions', 'view'),
(26, 1, 'testimonials', 'create'),
(28, 1, 'testimonials', 'delete'),
(27, 1, 'testimonials', 'edit'),
(25, 1, 'testimonials', 'view'),
(43, 1, 'users', 'create'),
(45, 1, 'users', 'delete'),
(44, 1, 'users', 'edit'),
(42, 1, 'users', 'view'),
(72, 2, 'blog', 'create'),
(73, 2, 'blog', 'edit'),
(71, 2, 'blog', 'view'),
(60, 2, 'brands', 'create'),
(61, 2, 'brands', 'edit'),
(59, 2, 'brands', 'view'),
(54, 2, 'categories', 'create'),
(55, 2, 'categories', 'edit'),
(53, 2, 'categories', 'view'),
(69, 2, 'faqs', 'create'),
(70, 2, 'faqs', 'edit'),
(68, 2, 'faqs', 'view'),
(63, 2, 'gallery', 'create'),
(64, 2, 'gallery', 'edit'),
(62, 2, 'gallery', 'view'),
(51, 2, 'products', 'create'),
(52, 2, 'products', 'edit'),
(50, 2, 'products', 'view'),
(57, 2, 'services', 'create'),
(58, 2, 'services', 'edit'),
(56, 2, 'services', 'view'),
(74, 2, 'submissions', 'view'),
(66, 2, 'testimonials', 'create'),
(67, 2, 'testimonials', 'edit'),
(65, 2, 'testimonials', 'view'),
(101, 3, 'blog', 'view'),
(98, 3, 'brands', 'create'),
(99, 3, 'brands', 'edit'),
(97, 3, 'brands', 'view'),
(80, 3, 'categories', 'create'),
(82, 3, 'categories', 'delete'),
(81, 3, 'categories', 'edit'),
(79, 3, 'categories', 'view'),
(91, 3, 'faqs', 'create'),
(93, 3, 'faqs', 'delete'),
(92, 3, 'faqs', 'edit'),
(90, 3, 'faqs', 'view'),
(100, 3, 'gallery', 'view'),
(84, 3, 'menus', 'create'),
(85, 3, 'menus', 'edit'),
(83, 3, 'menus', 'view'),
(76, 3, 'products', 'create'),
(78, 3, 'products', 'delete'),
(77, 3, 'products', 'edit'),
(75, 3, 'products', 'view'),
(102, 3, 'services', 'view'),
(96, 3, 'submissions', 'delete'),
(95, 3, 'submissions', 'edit'),
(94, 3, 'submissions', 'view'),
(87, 3, 'testimonials', 'create'),
(89, 3, 'testimonials', 'delete'),
(88, 3, 'testimonials', 'edit'),
(86, 3, 'testimonials', 'view');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `short_description` text DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `price_range` varchar(100) DEFAULT 'Starts from $49',
  `is_published` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` longtext DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES
(1, 'site_name', 'Wall Street Interiors', '2026-10-27 17:42:56'),
(2, 'tagline', 'Bespoke Living, Crafted Spaces & B2B Wholesale Interiors', '2026-10-27 17:42:56'),
(3, 'company_phone', '+91 9018454526', '2026-10-27 17:42:56'),
(4, 'company_email', 'contact@wallstreetinteriors.com', '2026-10-27 17:42:56'),
(5, 'company_address', 'Masjid Near Dilbar studio, Syed Ali Akbar St, Srinagar, 190001, IN', '2026-10-27 17:42:56'),
(6, 'working_hours', 'Monday – Saturday: 9:30 AM – 7:30 PM | Sunday: By Appointment', '2026-10-27 17:42:56'),
(7, 'footer_about', 'Wall Street Interiors is Srinagar\'s distinguished design studio and supplier for luxury bespoke furniture, acoustic wall treatments, modular kitchens, and wholesale interior materials.', '2026-10-27 17:42:56'),
(8, 'facebook_url', 'https://facebook.com/wallstreetinteriors', '2026-10-27 17:42:56'),
(9, 'twitter_url', 'https://x.com/wallstreetinteriors', '2026-10-27 17:42:56'),
(10, 'instagram_url', 'https://instagram.com/wallstreetinteriors', '2026-10-27 17:42:56'),
(11, 'linkedin_url', 'https://linkedin.com/company/wallstreetinteriors', '2026-10-27 17:42:56'),
(12, 'whatsapp_number', '+919018454526', '2026-10-27 17:42:56'),
(13, 'emergency_contact', '+91 9018454526', '2026-10-27 17:42:56'),
(16, 'meta_title', 'Wall Street Interiors | Luxury Interior Architecture, Custom Furniture & B2B Wholesale', '2026-10-27 17:42:56'),
(17, 'meta_description', 'Wall Street Interiors is Srinagar\'s premier studio for bespoke interior architecture, handcrafted luxury furniture, 3D architectural wall panels, and B2B wholesale trade supplies.', '2026-10-27 17:42:56'),
(18, 'meta_keywords', 'Wall Street Interiors, Interior Design Srinagar, Custom Furniture, Wall Paneling, Modular Kitchens, Luxury Home Decor, B2B Interior Wholesale, Architecture Kashmir, Syed Ali Akbar St', '2026-10-27 17:42:56'),
(19, 'site_logo', '/uploads/1793124059828_wall-street_4bf7e3e797721d1b.png', '2026-10-27 18:02:58'),
(20, 'site_logo_white', '/uploads/1793124175564_ws-logo_36aefaa96981ed8e.png', '2026-10-27 18:02:58'),
(21, 'site_favicon', '/uploads/1793124176384_ws-logo_8ae828df5538a1d1.png', '2026-10-27 18:02:58'),
(23, 'company_address_secondary', 'Design Studio & Experience Center: Syed Ali Akbar St, Srinagar, 190001', '2026-10-27 17:42:56'),
(24, 'phone_numbers', '[{\"id\":\"p1\",\"number\":\"+91 9018454526\",\"label\":\"Client Inquiries & Orders\",\"is_primary\":true},{\"id\":\"p2\",\"number\":\"+91 7889804942\",\"label\":\"B2B Wholesale & Project Desk\",\"is_primary\":false}]', '2026-10-27 17:42:56'),
(25, 'email_addresses', '[{\"id\":\"e1\",\"email\":\"contact@wallstreetinteriors.com\",\"label\":\"General & Client Support\",\"is_primary\":true},{\"id\":\"e2\",\"email\":\"dealers@wallstreetinteriors.com\",\"label\":\"B2B Dealer Partnerships\",\"is_primary\":false},{\"id\":\"e3\",\"email\":\"projects@wallstreetinteriors.com\",\"label\":\"Architectural Project Consultations\",\"is_primary\":false}]', '2026-10-27 17:42:56'),
(30, 'youtube_url', 'https://youtube.com/wallstreetinteriors', '2026-10-27 17:42:56'),
(62, 'meta_author', 'Wall Street Interiors', '2026-10-27 17:42:56');

-- --------------------------------------------------------

--
-- Table structure for table `testimonials`
--

CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_role` varchar(255) DEFAULT 'Homeowner',
  `avatar` varchar(500) DEFAULT NULL,
  `content` text NOT NULL,
  `rating` int(11) DEFAULT 5,
  `is_published` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `testimonials`
--

INSERT INTO `testimonials` (`id`, `customer_name`, `customer_role`, `avatar`, `content`, `rating`, `is_published`, `sort_order`, `created_at`) VALUES
(3, 'Bashir Ahmad Mir', 'Villa Homeowner, Rajbagh', '/uploads/1793205064209_0bdd71d0e49c533da6c093b77c7de1a5_ac4906bb3bcd8eba.jpg', 'Wall Street Interiors transformed our 5-bedroom villa into an architectural masterpiece. Their bespoke teakwood furniture, acoustic slat wall panels, and modular kitchen were delivered with immaculate precision.', 5, 1, 0, '2026-10-27 17:43:50'),
(4, 'Ar. Suhail Qazi', 'Principal Architect, Studio Qazi', '/assets/images/testimonial/testimonial1_2.png', 'As an architect, sourcing premium hardware and custom fluted panels on tight deadlines is always a challenge. Wall Street Interiors has become our most trusted B2B partner for contractor-grade materials and flawless craftsmanship.', 5, 1, 2, '2026-10-27 17:43:50'),
(5, 'Tariq H. Lone', 'Managing Director, Grand Pine Hotel', '/assets/images/testimonial/testimonial1_3.png', 'From guest room bed backs to the grand lobby acoustic ceiling, Wall Street Interiors handled our hotel renovation seamlessly. Their commercial wholesale rates and dedicated support are unmatched in Kashmir.', 5, 1, 3, '2026-10-27 17:43:50');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `address_line1` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `created_at`, `address_line1`, `city`, `state`, `postal_code`) VALUES
(1, 'Wall Street Admin', 'admin@wallstreetinteriors.com', NULL, '$2b$10$s6LV0.ZASiYnkupisMEmP.wAlMFvg1/WbD5b8a2UpAEXlCg8JWZPm', 'admin', '2026-10-26 14:51:47', NULL, NULL, NULL, NULL),
(2, 'Wall Street Editor', 'editor@wallstreetinteriors.com', NULL, '$2b$10$lICEZWwtYQkGu1Awo.Ub7e.WMdAPGZF9Og4Idem1X8M7jqiSh7iy2', 'editor', '2026-10-30 17:05:04', NULL, NULL, NULL, NULL),
(3, 'Syed Tanzeel', 'syedtanzeel64@gmail.com', '+91 7780834427', '$2b$10$3/rOxSyM2s.x8BgJdlMy6OnVuOmrpSue2nYBLa8ohOIIlkfkX1DIa', 'customer', '2026-10-30 20:31:27', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `work_gallery`
--

CREATE TABLE `work_gallery` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(500) NOT NULL,
  `category` varchar(100) DEFAULT 'Repair',
  `is_published` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_gallery`
--

INSERT INTO `work_gallery` (`id`, `title`, `description`, `image`, `category`, `is_published`, `sort_order`, `created_at`) VALUES
(1, 'Curtain', 'Curtain', '/assets/images/product-gallery/productGalleryThumb4_1.jpg', 'Curtain', 1, 1, '2026-10-26 14:51:47'),
(2, 'Multi-Zone Inverter Compressor Rebuild', 'Rebuilding dual-rotary compressor assembly and nitrogen pressure testing for zero leaks.', '/assets/images/product-gallery/productGalleryThumb4_2.jpg', 'HVAC & Air Cooling', 1, 2, '2026-10-26 14:51:47'),
(3, 'Denon AV Receiver Power Stage Capacitance Tuning', 'Audiophile-grade Nichicon capacitor replacement restoring total harmonic distortion to <0.02%.', '/assets/images/product-gallery/productGalleryThumb4_3.jpg', 'Audio & Theater', 1, 3, '2026-10-26 14:51:47'),
(4, 'Commercial Refrigeration Cold-Chain Sensor Calibration', 'Precision digital temperature telemetry sensor overhaul for a local pharmacy cooling bank.', '/assets/images/about-us/aboutThumb1_1.jpg', 'Refrigeration', 1, 4, '2026-10-26 14:51:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_blog_slug` (`slug`),
  ADD KEY `idx_blog_status` (`status`,`published_at`);

--
-- Indexes for table `careers`
--
ALTER TABLE `careers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `career_applications`
--
ALTER TABLE `career_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_career_id` (`career_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contact_status` (`status`),
  ADD KEY `idx_submissions_id_desc` (`id`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_faqs_published` (`is_published`,`sort_order`),
  ADD KEY `idx_faqs_sort` (`is_published`,`sort_order`,`id`);

--
-- Indexes for table `homepage_promos`
--
ALTER TABLE `homepage_promos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `card_key` (`card_key`);

--
-- Indexes for table `homepage_settings`
--
ALTER TABLE `homepage_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nav_menu_items`
--
ALTER TABLE `nav_menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nav_location_active` (`menu_location`,`is_active`,`sort_order`),
  ADD KEY `idx_nav_parent` (`parent_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_orders_user_created` (`user_id`, `created_at`),
  ADD KEY `idx_orders_status_created` (`order_status`, `created_at`),
  ADD KEY `idx_orders_created` (`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `idx_order_items_product` (`product_id`);

--
-- Indexes for table `partner_brands`
--
ALTER TABLE `partner_brands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_brands_active` (`is_active`,`sort_order`),
  ADD KEY `idx_brands_sort` (`is_active`,`sort_order`,`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_products_status_featured` (`status`,`is_featured`),
  ADD KEY `idx_products_status_bestseller` (`status`,`is_best_seller`),
  ADD KEY `idx_products_status_popular` (`status`,`is_popular`),
  ADD KEY `idx_products_status_onsale` (`status`,`is_on_sale`),
  ADD KEY `idx_products_cat_slug` (`category_slug`),
  ADD KEY `idx_products_id_desc` (`id`),
  ADD KEY `idx_products_status_id` (`status`,`id`),
  ADD KEY `idx_products_name` (`name`(50)),
  ADD KEY `idx_products_brand` (`brand`(50)),
  ADD KEY `idx_products_status_price` (`status`,`price`);

--
-- Indexes for table `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `product_attribute_values`
--
ALTER TABLE `product_attribute_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attr_id` (`attribute_id`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_cat_parent_active` (`parent_id`,`is_active`),
  ADD KEY `idx_cat_active` (`is_active`);

--
-- Indexes for table `product_variations`
--
ALTER TABLE `product_variations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_sku` (`sku`);

--
-- Indexes for table `product_variation_values`
--
ALTER TABLE `product_variation_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_variation` (`variation_id`),
  ADD KEY `idx_attr_val` (`attribute_id`,`value_id`),
  ADD KEY `value_id` (`value_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_perm` (`role_id`,`module`,`action`),
  ADD KEY `idx_role` (`role_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_services_slug` (`slug`),
  ADD KEY `idx_services_published` (`is_published`,`sort_order`),
  ADD KEY `idx_services_sort` (`is_published`,`sort_order`,`id`);

--
-- Indexes for table `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_testimonials_published` (`is_published`,`sort_order`),
  ADD KEY `idx_testimonials_sort` (`is_published`,`sort_order`,`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`);

--
-- Indexes for table `work_gallery`
--
ALTER TABLE `work_gallery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_gallery_published` (`is_published`,`sort_order`),
  ADD KEY `idx_gallery_sort` (`is_published`,`sort_order`,`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `careers`
--
ALTER TABLE `careers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `career_applications`
--
ALTER TABLE `career_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `homepage_promos`
--
ALTER TABLE `homepage_promos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `homepage_settings`
--
ALTER TABLE `homepage_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `nav_menu_items`
--
ALTER TABLE `nav_menu_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `partner_brands`
--
ALTER TABLE `partner_brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `product_attributes`
--
ALTER TABLE `product_attributes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_attribute_values`
--
ALTER TABLE `product_attribute_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `product_variations`
--
ALTER TABLE `product_variations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `product_variation_values`
--
ALTER TABLE `product_variation_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=149;

--
-- AUTO_INCREMENT for table `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `work_gallery`
--
ALTER TABLE `work_gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_attribute_values`
--
ALTER TABLE `product_attribute_values`
  ADD CONSTRAINT `product_attribute_values_ibfk_1` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variations`
--
ALTER TABLE `product_variations`
  ADD CONSTRAINT `product_variations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variation_values`
--
ALTER TABLE `product_variation_values`
  ADD CONSTRAINT `product_variation_values_ibfk_1` FOREIGN KEY (`variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_variation_values_ibfk_2` FOREIGN KEY (`attribute_id`) REFERENCES `product_attributes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_variation_values_ibfk_3` FOREIGN KEY (`value_id`) REFERENCES `product_attribute_values` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
