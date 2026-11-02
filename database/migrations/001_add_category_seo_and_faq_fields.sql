-- Migration: Add rich SEO, FAQ, and Image Metadata columns to product_categories
-- Safe and idempotent: can be executed repeatedly on MySQL 8 / MariaDB

ALTER TABLE `product_categories`
  ADD COLUMN IF NOT EXISTS `sort_order` INT NOT NULL DEFAULT 0 AFTER `item_count`,
  ADD COLUMN IF NOT EXISTS `is_featured` TINYINT(1) NOT NULL DEFAULT 0 AFTER `sort_order`,
  ADD COLUMN IF NOT EXISTS `short_description` VARCHAR(255) DEFAULT NULL AFTER `is_featured`,
  ADD COLUMN IF NOT EXISTS `description` LONGTEXT DEFAULT NULL AFTER `short_description`,
  ADD COLUMN IF NOT EXISTS `key_features` JSON DEFAULT NULL AFTER `description`,
  ADD COLUMN IF NOT EXISTS `best_for` JSON DEFAULT NULL AFTER `key_features`,
  ADD COLUMN IF NOT EXISTS `materials` JSON DEFAULT NULL AFTER `best_for`,
  ADD COLUMN IF NOT EXISTS `control_types` JSON DEFAULT NULL AFTER `materials`,
  ADD COLUMN IF NOT EXISTS `seo_title` VARCHAR(255) DEFAULT NULL AFTER `control_types`,
  ADD COLUMN IF NOT EXISTS `meta_description` VARCHAR(255) DEFAULT NULL AFTER `seo_title`,
  ADD COLUMN IF NOT EXISTS `focus_keywords` VARCHAR(255) DEFAULT NULL AFTER `meta_description`,
  ADD COLUMN IF NOT EXISTS `thumbnail` VARCHAR(255) DEFAULT NULL AFTER `focus_keywords`,
  ADD COLUMN IF NOT EXISTS `image_alt` VARCHAR(255) DEFAULT NULL AFTER `thumbnail`,
  ADD COLUMN IF NOT EXISTS `blur_data_url` TEXT DEFAULT NULL AFTER `image_alt`,
  ADD COLUMN IF NOT EXISTS `faq_json` JSON DEFAULT NULL AFTER `blur_data_url`;

