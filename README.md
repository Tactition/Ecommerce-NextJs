# 🏛️ Wall Street Interiors - E-Commerce Web Platform

A production-grade luxury e-commerce and interior architecture platform built with **Next.js 15 (App Router)**, **React 19**, **MySQL 8 / MariaDB**, and **TypeScript**. Features a custom high-performance shopping engine, dynamic product attributes/variations, role-based admin dashboard (RBAC), live order manager, promotional campaigns, and automated SEO.

---

## 📋 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Prerequisites](#-prerequisites)
3. [Quick Local Setup (XAMPP / Localhost)](#-quick-local-setup-xampp--localhost)
4. [Deployment on aaPanel (VPS / Ubuntu / Debian / CentOS)](#-deployment-on-aapanel-vps--ubuntu--debian--centos)
5. [Deployment on cPanel / CloudLinux VPS](#-deployment-on-cpanel--cloudlinux-vps)
6. [Deployment on Vercel + Cloud Database](#-deployment-on-vercel--cloud-database)
7. [Environment Variables Reference](#-environment-variables-reference)
8. [Database Schema & Seed Data](#-database-schema--seed-data)
9. [Default Credentials & Access](#-default-credentials--access)
10. [Useful NPM Scripts](#-useful-npm-scripts)

---

## 🛠️ Tech Stack
- **Frontend / Framework**: Next.js 15.1.7 (App Router, Turbopack, ISR / React 19)
- **Styling**: SCSS / Bootstrap 5 / Modern CSS custom properties
- **Database**: MySQL 8.x / MariaDB 10.x (pooled connections via `mysql2`)
- **Authentication**: JWT Sessions (`jose` on Edge/Node runtimes with HTTP-only cookies) + bcryptjs
- **Animations / Icons**: GSAP (deferred), Lucide React & FontAwesome 6 Pro
- **Validation**: Zod schema validation

---

## 📦 Prerequisites
- **Node.js**: `v18.18.0` or higher (Recommended: `v20.x` or `v22.x` LTS)
- **Package Manager**: `npm` (v9+) or `yarn` / `pnpm`
- **Database**: MySQL Server 8.0+ or MariaDB 10.4+
- **Git**

---

## 💻 Quick Local Setup (XAMPP / Localhost)

### 1. Clone the repository
```bash
git clone https://github.com/Tactition/Ecommerce-NextJs.git
cd Ecommerce-NextJs
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Database (XAMPP / Local MySQL)
1. Start **Apache** and **MySQL** in XAMPP.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`).
3. Create a new database named:
   ```sql
   ecommerce
   ```
4. Click on **Import**, choose the file located at:
   ```
   DATABASE-ECOM/ecommerce.sql
   ```
5. Click **Go / Import** to create all tables and initial seed data.

### 4. Configure Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```
Update `.env.local`:
```env
NODE_ENV=development
AUTH_URL=http://localhost:3000
AUTH_SECRET=generate_a_random_32_to_64_character_secret_key_here

DB_HOST=127.0.0.1
DB_PORT=3306      # or 3308 if your XAMPP MySQL port is customized
DB_USER=root
DB_PASSWORD=
DB_NAME=ecommerce
DB_SSL=false
```

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐧 Deployment on aaPanel (VPS / Ubuntu / Debian / CentOS)

aaPanel is a popular control panel for hosting Next.js node applications with PM2 and Nginx reverse proxy.

### Step 1: Install Node.js & MySQL in aaPanel
1. Log into your **aaPanel dashboard**.
2. Go to **App Store**:
   - Install **PM2 Node Manager** (or **Node.js Version Manager**).
   - Install **Nginx** (any stable version, e.g. 1.22+).
   - Install **MySQL** (MySQL 8.0 or MariaDB 10.6+).
3. Open **PM2 Manager** / **Node Version Manager** and install **Node.js v20.x LTS**. Set it as the CLI version.

### Step 2: Create MySQL Database in aaPanel
1. In aaPanel, go to the **Databases** tab.
2. Click **Add Database**:
   - **DB Name**: `ecommerce`
   - **User**: `ecommerce_user`
   - **Password**: *(Generate strong password and save it)*
   - **Access**: `127.0.0.1` (Local only)
3. Click **Import** next to your new database:
   - Upload and import `DATABASE-ECOM/ecommerce.sql`.

### Step 3: Clone or Upload the Code
You can clone using Git via aaPanel Terminal or File Manager:
```bash
cd /www/wwwroot
git clone https://github.com/Tactition/Ecommerce-NextJs.git yourdomain.com
cd yourdomain.com
```

### Step 4: Configure `.env`
In `/www/wwwroot/yourdomain.com`:
```bash
cp .env.example .env
nano .env
```
Fill in your production details:
```env
NODE_ENV=production
AUTH_URL=https://yourdomain.com
AUTH_SECRET=9b7c89a01f72e3d489bcaef1029384758b9c0d1e2f3a4b5c6d7e8f9012345678

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ecommerce
DB_USER=ecommerce_user
DB_PASSWORD=your_aapanel_db_password
DB_SSL=false
```

### Step 5: Install & Build Application
Inside `/www/wwwroot/yourdomain.com`, run:
```bash
npm install --production=false
npm run build
```

### Step 6: Start Application with PM2
You can start it using aaPanel's PM2 GUI or via Terminal:

**Via Terminal**:
```bash
npm install -g pm2
pm2 start npm --name "wallstreet-ecommerce" -- start -- -p 3000
pm2 save
pm2 startup
```

### Step 7: Configure Nginx Reverse Proxy in aaPanel
1. Go to **Website** &rarr; **Add site**:
   - **Domain**: `yourdomain.com`
   - **Path**: `/www/wwwroot/yourdomain.com`
   - **FTP / Database**: No
2. Open the newly created site settings &rarr; **Reverse Proxy** &rarr; **Add Reverse Proxy**:
   - **Proxy Name**: `nextjs_proxy`
   - **Target URL**: `http://127.0.0.1:3000`
   - **Sent Domain**: `$host`
3. Go to the **SSL** tab:
   - Select **Let's Encrypt** &rarr; Select your domain &rarr; Apply for free SSL Certificate &rarr; Turn on **Force HTTPS**.

Your website will now be live on `https://yourdomain.com`!

---

## 🌐 Deployment on cPanel / CloudLinux VPS

If your hosting provider offers cPanel with **Setup Node.js App** (Passenger):

1. **Database**:
   - Go to **cPanel &rarr; MySQL Databases**.
   - Create a database (e.g. `cpaneluser_ecommerce`) and a database user. Assign **ALL PRIVILEGES**.
   - Go to **phpMyAdmin**, select the database, and **Import** `DATABASE-ECOM/ecommerce.sql`.
2. **Setup Node.js App**:
   - In cPanel, click **Setup Node.js App**.
   - Click **Create Application**.
   - **Node.js version**: Select `20.x` or latest.
   - **Application mode**: `Production`.
   - **Application root**: `ecommerce` (or your folder name).
   - **Application URL**: `yourdomain.com`.
   - **Application startup file**: `node_modules/next/dist/bin/next` or standard server wrapper.
3. **Upload Files & Environment Variables**:
   - Upload project files (or git clone).
   - In cPanel Node app interface, add Environment Variables (`DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_USER=...`, `DB_PASSWORD=...`, `DB_NAME=...`, `AUTH_SECRET=...`, `AUTH_URL=https://yourdomain.com`).
4. **Run Build & Start**:
   - Open cPanel Terminal (or SSH):
     ```bash
     npm install
     npm run build
     ```
   - Click **Restart** in the Node.js App manager in cPanel.

---

## ⚡ Deployment on Vercel + Cloud Database

Vercel hosts Next.js serverless functions. Because Vercel cannot reach `localhost`, use a cloud MySQL host like **TiDB Cloud Serverless** (Free 5GB) or **Aiven**:

1. **Setup Cloud Database**:
   - Create a free instance on [TiDB Cloud](https://tidbcloud.com/) or [Aiven MySQL](https://aiven.io/).
   - Run / import `DATABASE-ECOM/ecommerce.sql`.
2. **Import Repo in Vercel**:
   - Log into [Vercel](https://vercel.com/) with GitHub.
   - Click **Add New...** &rarr; **Project** &rarr; select `Tactition/Ecommerce-NextJs`.
3. **Configure Environment Variables in Vercel**:
   - `DB_HOST`: *(Your cloud DB host)*
   - `DB_PORT`: `4000` (for TiDB) or `3306`
   - `DB_USER`: *(Your cloud DB user)*
   - `DB_PASSWORD`: *(Your cloud DB password)*
   - `DB_NAME`: `ecommerce`
   - `DB_SSL`: `true`
   - `AUTH_SECRET`: *(Random 32+ character string)*
   - `AUTH_URL`: `https://your-project.vercel.app`
4. **Click Deploy**.

---

## 🔐 Environment Variables Reference

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `production` or `development` | Node execution environment |
| `AUTH_URL` | Yes | `http://localhost:3000` or `https://example.com` | Base canonical domain for sessions, links, SEO |
| `AUTH_SECRET` | Yes | `generate_random_64_char_string` | Cryptographic secret for signing JWT cookies |
| `DB_HOST` | Yes | `127.0.0.1` | MySQL server host |
| `DB_PORT` | Yes | `3306` | MySQL port (3306 standard, 3308 for some XAMPP setups, 4000 for TiDB) |
| `DB_NAME` | Yes | `ecommerce` | MySQL database name |
| `DB_USER` | Yes | `root` or `ecommerce_user` | MySQL user |
| `DB_PASSWORD` | Yes | `your_password` | MySQL password |
| `DB_SSL` | Optional | `false` (set `true` for cloud DBs) | Enables TLS/SSL encryption for cloud MySQL |
| `NEXT_PUBLIC_SITE_NAME`| Optional | `Wall Street Interiors` | Default website title fallback |

---

## 🗄️ Database Schema & Seed Data

The complete database dump with all tables, constraints, default settings, and sample catalogs is stored in:
```
DATABASE-ECOM/ecommerce.sql
```

Key Tables:
- `users`: User profiles, hashed passwords (bcrypt), roles (`admin`, `editor`, `manager`, `customer`).
- `products`: Product catalog, variations support, custom sizing formulas, images, categories.
- `product_categories`: Hierarchical category taxonomy with subcategories.
- `product_attributes` & `product_variations`: Dynamic variation matrix (colors, sizes, wood finish).
- `orders` & `order_items`: Full checkout order lifecycles and tracking numbers.
- `site_settings`: Global brand identity, address, phone numbers, working hours, and social links.
- `homepage_settings`: Hero sections, weekly deal timers, feature proposition boxes, and stories.
- `homepage_promos`: Dynamic promotional banners and links.
- `nav_menu_items`: Dynamic drag-and-drop navigation hierarchies for Header, Footer, and Categories.
- `blog_posts` & `testimonials`: Editorial articles and customer testimonials.

---

## 👤 Default Credentials & Access

Initial users seeded in `DATABASE-ECOM/ecommerce.sql`:

| Role | Email | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@wallstreetinteriors.com` | `admin123` | Full Master Control (`/dashboard`) |
| **Editor** | `editor@wallstreetinteriors.com` | `admin123` | Catalog, Blog, and Content updates |

> [!CAUTION]
> Immediately change default passwords upon initial deployment by visiting **Dashboard &rarr; Account / Profile**!

---

## 🚀 Useful NPM Scripts

```bash
# Start local development server with Turbopack
npm run dev

# Compile optimized production build
npm run build

# Start production server (runs on port 3000 by default)
npm run start

# Seed default blind product catalog (optional)
npm run seed:products

# Seed initial categories (optional)
npm run seed:categories
```

---

## 🛡️ License
Private and proprietary. Developed for Wall Street Interiors.
