-- ==============================================================================
-- Migration: 3-Domain Strict Authentication Isolation
-- Database: ecommerce
-- Tables Created: customers, admin_users, dealers
-- Backup Tables: users_backup_pre_isolation, dealer_profiles_backup_pre_isolation
-- ==============================================================================

-- 1. BACKUPS
CREATE TABLE IF NOT EXISTS `users_backup_pre_isolation` AS SELECT * FROM `users`;
CREATE TABLE IF NOT EXISTS `dealer_profiles_backup_pre_isolation` AS SELECT * FROM `dealer_profiles`;

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `address_line1` VARCHAR(255) NULL,
  `address_line2` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  `is_active` TINYINT(1) DEFAULT 1,
  `email_verified` TINYINT(1) DEFAULT 0,
  `failed_login_attempts` INT DEFAULT 0,
  `locked_until` TIMESTAMP NULL,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ADMIN_USERS TABLE
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin', 'manager', 'editor', 'support') NOT NULL DEFAULT 'editor',
  `permissions` JSON NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `failed_login_attempts` INT DEFAULT 0,
  `locked_until` TIMESTAMP NULL,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. DEALERS TABLE
CREATE TABLE IF NOT EXISTS `dealers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(200) NOT NULL,
  `contact_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `gst_number` VARCHAR(50) NOT NULL UNIQUE,
  `business_type` ENUM('retailer', 'contractor', 'designer', 'wholesaler', 'other') DEFAULT 'retailer',
  `address` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(20) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  `approval_status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING',
  `rejection_reason` TEXT NULL,
  `allow_credit_terms` TINYINT(1) DEFAULT 0,
  `credit_limit` DECIMAL(12,2) DEFAULT 0.00,
  `credit_days` INT DEFAULT 0,
  `tier_id` INT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `failed_login_attempts` INT DEFAULT 0,
  `locked_until` TIMESTAMP NULL,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dealers_email` (`email`),
  INDEX `idx_dealers_status` (`approval_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. UPDATE FOREIGN KEYS TO POINT TO ISOLATED DEALERS TABLE
ALTER TABLE dealer_addresses DROP FOREIGN KEY fk_addr_dealer;
ALTER TABLE dealer_addresses ADD CONSTRAINT fk_addr_dealer FOREIGN KEY (dealer_id) REFERENCES dealers (id) ON DELETE CASCADE;

ALTER TABLE wholesale_prices DROP FOREIGN KEY fk_wp_dealer;
ALTER TABLE wholesale_prices ADD CONSTRAINT fk_wp_dealer FOREIGN KEY (dealer_id) REFERENCES dealers (id) ON DELETE CASCADE;


