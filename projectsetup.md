# 🚀 Wall Street Interiors — Production Hosting & Deployment Guide

This comprehensive guide details step-by-step instructions for deploying and hosting the **Wall Street Interiors** Next.js e-commerce application on production servers (Ubuntu/Linux VPS, cPanel with Node.js Selector, or Cloud Platforms).

---

## 📋 Table of Contents
1. [System & Runtime Requirements](#1-system--runtime-requirements)
2. [Project Architecture Overview](#2-project-architecture-overview)
3. [Database Setup & Import](#3-database-setup--import)
4. [Environment Configuration (.env)](#4-environment-configuration-env)
5. [Hosting Option A: Ubuntu / Debian VPS with Nginx & PM2 (Recommended)](#5-hosting-option-a-ubuntu--debian-vps-with-nginx--pm2-recommended)
6. [Hosting Option B: cPanel / Shared Hosting (Node.js App Selector)](#6-hosting-option-b-cpanel--shared-hosting-nodejs-app-selector)
7. [Hosting Option C: Docker & Containerized Hosting](#7-hosting-option-c-docker--containerized-hosting)
8. [File Uploads & Media Storage Configuration](#8-file-uploads--media-storage-configuration)
9. [Post-Deployment Verification Checklist](#9-post-deployment-verification-checklist)
10. [Updating the Application (Zero Downtime)](#10-updating-the-application-zero-downtime)
11. [Troubleshooting & Common Issues](#11-troubleshooting--common-issues)

---

## 1. System & Runtime Requirements

| Dependency | Minimum Version | Recommended Version |
| :--- | :--- | :--- |
| **Node.js** | `v18.18.0` | `v20.x LTS` (Iron) |
| **npm** | `v9.x` | `v10.x` |
| **Database** | MySQL `8.0+` or MariaDB `10.4+` | MySQL `8.0` / MariaDB `10.6+` |
| **Reverse Proxy** | Nginx `1.18+` or Apache `2.4+` | Nginx `1.24+` |
| **Process Manager** | PM2 `5.x` | PM2 `5.3+` |
| **Memory (RAM)** | 1 GB | 2 GB+ (for building Next.js) |
| **Storage** | 5 GB SSD | 15 GB+ SSD (to accommodate media uploads) |

---

## 2. Project Architecture Overview

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Database Layer**: `mysql2/promise` with robust connection pooling (`src/lib/db.ts`)
- **Authentication**: Cryptographic JWT sessions (`jose`, `bcryptjs`) using HTTP-only secure cookies (`src/lib/auth.ts`, `src/lib/token.ts`)
- **File Uploads**: Admin image uploads saved to `public/uploads/` on disk and indexed in MySQL `media` table (`src/app/api/uploads/route.ts`)
- **Interactive UI**: GSAP scroll animations, real-time order tracking, live instant search API, and multi-language support

---

## 3. Database Setup & Import

The project repository includes the complete, up-to-date database dump located at:
📁 **`DATABASE-ECOM/ecommerce.sql`**

### Method 1: Import via phpMyAdmin (cPanel, Plesk, Localhost)
1. Log in to your hosting panel (e.g. cPanel) and open **MySQL Databases**.
2. Create a new database (e.g. `ecommerce` or `user_ecommerce`).
3. Create a MySQL user, generate a strong password, and assign the user to the database with **ALL PRIVILEGES**.
4. Open **phpMyAdmin**, select your new database in the left sidebar.
5. Click the **Import** tab at the top.
6. Click **Choose File** and select `DATABASE-ECOM/ecommerce.sql`.
7. Ensure format is **SQL** and character set is **utf8mb4**, then click **Import** (or **Go**).

### Method 2: Import via Linux Command Line / VPS
Run the following commands on your server:

```bash
# 1. Log in to MySQL
mysql -u root -p

# 2. Inside MySQL console, create the database with utf8mb4 encoding:
CREATE DATABASE ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON ecommerce.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 3. Import the SQL dump:
mysql -u ecommerce_user -p ecommerce < DATABASE-ECOM/ecommerce.sql
```

### 🔑 Default Administrator Credentials
Once the database is imported, the following default credentials are ready to use:

- **Login URL**: `https://yourdomain.com/login`
- **Email**: `admin@wallstreetinteriors.com`
- **Password**: `Admin@123`
- **Role**: `admin` (Full dashboard access at `/dashboard`)

> ⚠️ **Security Notice**: Immediately after your first login, visit **Profile** or **Admin Settings** to change the administrator password.

---

## 4. Environment Configuration (.env)

In the root of your project on the server, create a production `.env` file (you can copy `.env.example`):

```bash
cp .env.example .env
```

### Production `.env` Variables:

```env
# ==============================================================================
# Wall Street Interiors - Production Environment Variables
# ==============================================================================

# Node Environment
NODE_ENV=production

# Canonical Domain URL (with https://, no trailing slash)
AUTH_URL=https://yourdomain.com

# Site Title Branding
NEXT_PUBLIC_SITE_NAME="Wall Street Interiors"

# Cryptographic Session JWT Secret
# Generate a fresh 64-char hex key via: openssl rand -hex 32
AUTH_SECRET=9f8c4e61234a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c

# MySQL Database Configuration
# On Linux VPS or cPanel, DB_HOST is usually 127.0.0.1 or localhost
DB_HOST=127.0.0.1

# MySQL Port (Standard Linux hosting port is 3306; local XAMPP was 3308)
DB_PORT=3306

# Database Name
DB_NAME=ecommerce

# Database User
DB_USER=ecommerce_user

# Database Password
DB_PASSWORD=YourStrongPassword123!
```

---

## 5. Hosting Option A: Ubuntu / Debian VPS with Nginx & PM2 (Recommended)

This is the industry standard for hosting high-performance Next.js applications with SSL, automatic restarts, and connection pooling.

### Step 1: Install Server Dependencies
On your clean Ubuntu 22.04 / 24.04 LTS server:

```bash
# Update repositories
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx mysql-server

# Verify installations
node -v   # Should output v20.x.x
npm -v    # Should output v10.x.x

# Install PM2 globally
sudo npm install -g pm2
```

### Step 2: Clone or Upload the Codebase
```bash
# Create application directory
sudo mkdir -p /var/www/wallstreet-interiors
sudo chown -R $USER:$USER /var/www/wallstreet-interiors

# Clone your repository (or copy files via SFTP / rsync)
cd /var/www/wallstreet-interiors
git clone <your-git-repository-url> .
```

### Step 3: Install NPM Dependencies & Build
```bash
cd /var/www/wallstreet-interiors

# Install production and development dependencies (needed for build)
npm install

# Ensure uploads directory exists and is writable
mkdir -p public/uploads
chmod -R 775 public/uploads

# Configure environment variables
nano .env   # Paste your production environment configuration

# Build Next.js optimized production bundle
npm run build
```

### Step 4: Configure & Start PM2
The project includes a ready-to-use [`ecosystem.config.cjs`](file:///c:/xampp/htdocs/ecommerce/ecosystem.config.cjs).

```bash
# Start the application with PM2
pm2 start ecosystem.config.cjs

# Verify process status
pm2 status

# Save PM2 process list to restore automatically on server reboot
pm2 save
sudo pm2 startup
```

*(Follow the command printed by `sudo pm2 startup` to register the system service).*

### Step 5: Configure Nginx Reverse Proxy
Create a new Nginx server block for your domain:

```bash
sudo nano /etc/nginx/sites-available/wallstreet
```

Paste the following production Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Maximum file upload size for admin media library (images up to 25MB)
    client_max_body_size 25M;

    # Proxy to Next.js running on port 3000
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }

    # Serve uploaded media directly via Nginx with caching
    location /uploads/ {
        alias /var/www/wallstreet-interiors/public/uploads/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }

    # Cache static Next.js assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_bypass $http_upgrade;
        access_log off;
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Enable the configuration and test Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/wallstreet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Install Free SSL with Let's Encrypt (Certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure HTTPS, rewrite HTTP requests to HTTPS, and schedule automatic SSL renewals!

---

## 6. Hosting Option B: cPanel / Shared Hosting (Node.js App Selector)

If your host provides cPanel with **Setup Node.js App** (CloudLinux / Phusion Passenger):

### Step 1: Create Database & Import
1. Go to **cPanel > MySQL Databases**, create a database and database user.
2. In **cPanel > phpMyAdmin**, select the database, click **Import**, and upload `DATABASE-ECOM/ecommerce.sql`.

### Step 2: Upload Files to cPanel
1. Open **cPanel > File Manager**.
2. Create a folder in your home root (e.g. `/home/username/wallstreet-app`).
3. Upload all project files **EXCEPT** `.next`, `node_modules`, `.git`, and `buyer-file.zip`.
4. Ensure `public/uploads` directory exists and has permission `755` or `775`.

### Step 3: Configure Node.js Application in cPanel
1. In cPanel, search for **Setup Node.js App** (or **NodeJS Selector**).
2. Click **Create Application**:
   - **Node.js version**: Choose `20.x` (or `18.x`).
   - **Application mode**: `Production`
   - **Application root**: `wallstreet-app` (the folder you created).
   - **Application URL**: `yourdomain.com`
   - **Application startup file**: `server.js` or `node_modules/next/dist/bin/next`
3. Under **Environment variables**, click **Add Variable** and input:
   - `NODE_ENV` = `production`
   - `DB_HOST` = `127.0.0.1`
   - `DB_PORT` = `3306`
   - `DB_NAME` = `cpaneluser_ecommerce`
   - `DB_USER` = `cpaneluser_dbuser`
   - `DB_PASSWORD` = `YourPassword`
   - `AUTH_SECRET` = `Your64CharRandomSecret`
   - `AUTH_URL` = `https://yourdomain.com`
4. Click **Create** / **Save**.

### Step 4: Run NPM Install & Build in cPanel Terminal
1. Open **cPanel > Terminal**.
2. Run the virtual environment activation command displayed at the top of your Node.js App page (e.g. `source /home/username/nodevenv/wallstreet-app/20/bin/activate`).
3. Navigate to application folder:
   ```bash
   cd /home/username/wallstreet-app
   npm install
   npm run build
   ```
4. Back in the cPanel Node.js App UI, click **Restart Application**.

---

## 7. Hosting Option C: Docker & Containerized Hosting

For Docker, CapRover, Coolify, or Portainer deployments, use the following production setup:

### `Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads

USER node
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 8. File Uploads & Media Storage Configuration

The admin panel provides image gallery and product image upload functionality.

- **Storage Location**: `public/uploads/`
- **Allowed MIME Formats**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`
- **File Size Limit**: Configured up to 15 MB per file.
- **Permission Requirement**: The web server process user (`www-data` on Ubuntu or your cPanel user) **must** have write permissions to `public/uploads`.

```bash
# On Ubuntu / Nginx
sudo chown -R www-data:www-data /var/www/wallstreet-interiors/public/uploads
sudo chmod -R 775 /var/www/wallstreet-interiors/public/uploads
```

---

## 9. Post-Deployment Verification Checklist

After launching, perform these verification checks:

- [ ] **Home Page Loads**: Check `https://yourdomain.com/` for proper visual styling and GSAP scroll animations.
- [ ] **Database Connectivity**: Verify products, categories, and testimonials render on the shop and home pages.
- [ ] **Admin Authentication**:
  - Visit `/login`.
  - Sign in with `admin@wallstreetinteriors.com` / `Admin@123`.
  - Confirm redirect to `/dashboard`.
- [ ] **Image Upload**: In the Admin Dashboard, edit a product or upload an image to confirm `public/uploads/` is writable.
- [ ] **Live Search**: Open the search bar in the header and verify instant search responses.
- [ ] **Cart & Order Flow**:
  - Add a product to cart.
  - Complete checkout at `/checkout`.
  - Verify order appears in Admin Dashboard under **Order Management** (`/dashboard/orders`).
- [ ] **Mobile Hamburger Menu**: Inspect on mobile viewport to verify drawer slides smoothly with zero layout glitching.

---

## 10. Updating the Application (Zero Downtime)

When updating the site with new features or changes:

```bash
cd /var/www/wallstreet-interiors

# 1. Pull latest code
git pull origin main

# 2. Install any newly added packages
npm install --production=false

# 3. Build optimized production bundle
npm run build

# 4. Gracefully reload PM2 process without downtime
pm2 reload wallstreet-interiors
```

---

## 11. Troubleshooting & Common Issues

### Issue 1: `502 Bad Gateway` (Nginx)
- **Cause**: Next.js application is not running on port 3000 or crashed on startup.
- **Fix**: Check PM2 logs:
  ```bash
  pm2 status
  pm2 logs wallstreet-interiors --lines 100
  ```
  Ensure database credentials in `.env` are correct and port 3000 is open locally.

### Issue 2: `ER_ACCESS_DENIED_ERROR` / Database Connection Error
- **Cause**: Incorrect `DB_USER`, `DB_PASSWORD`, or MySQL host.
- **Fix**: Verify database credentials using MySQL CLI:
  ```bash
  mysql -u ecommerce_user -p -h 127.0.0.1 -P 3306 ecommerce
  ```
  Ensure `DB_PORT=3306` on Linux servers (local XAMPP was using `3308`).

### Issue 3: `413 Request Entity Too Large` on Image Upload
- **Cause**: Nginx default client upload limit is 1MB.
- **Fix**: Add `client_max_body_size 25M;` inside your Nginx server block and reload Nginx (`sudo systemctl reload nginx`).

### Issue 4: `EACCES: permission denied, mkdir '/var/www/.../public/uploads'`
- **Cause**: The Node.js process does not have permission to write to the upload directory.
- **Fix**:
  ```bash
  sudo chown -R $USER:www-data /var/www/wallstreet-interiors/public/uploads
  sudo chmod -R 775 /var/www/wallstreet-interiors/public/uploads
  ```

---

*Wall Street Interiors — Architecture & Living Spaces E-Commerce Engine*

