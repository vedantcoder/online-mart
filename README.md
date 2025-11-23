
# 🛒 Online-MART

> **A full-stack, multi-role e-commerce platform for retailers, wholesalers, customers, and delivery agents.**

---

## 📖 Table of Contents
- [🛒 Online-MART](#-online-mart)
  - [📖 Table of Contents](#-table-of-contents)
  - [🏪 Overview](#-overview)
  - [🚀 Key Features](#-key-features)
    - [🔑 Authentication \& Roles](#-authentication--roles)
    - [🛍️ Customer](#️-customer)
    - [🏬 Retailer](#-retailer)
    - [🏢 Wholesaler](#-wholesaler)
    - [🚚 Delivery Person](#-delivery-person)
    - [📦 Core System](#-core-system)
  - [🏗️ Architecture \& Tech Stack](#️-architecture--tech-stack)
  - [🗄️ Database \& Model Alignment](#️-database--model-alignment)
  - [⚙️ Setup \& Installation](#️-setup--installation)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Install Dependencies](#2-install-dependencies)
    - [3. Configure Environment Variables](#3-configure-environment-variables)
    - [4. Set Up Supabase](#4-set-up-supabase)
  - [🔑 Environment Variables](#-environment-variables)
  - [🗃️ Database Migration \& Seeding](#️-database-migration--seeding)
    - [1. Run Migrations](#1-run-migrations)
    - [2. Seed Data](#2-seed-data)
  - [🖥️ Running Locally](#️-running-locally)
  - [📚 API Overview](#-api-overview)
    - [RESTful Endpoints (examples)](#restful-endpoints-examples)
  - [🧪 Testing Guide](#-testing-guide)
  - [🚀 Deployment](#-deployment)
  - [🛠️ Troubleshooting \& Support](#️-troubleshooting--support)
  - [🤝 Contribution Guidelines](#-contribution-guidelines)
  - [📄 License](#-license)
  - [🎉 Acknowledgements](#-acknowledgements)

---

## 🏪 Overview
Online-MART is a robust, scalable, and feature-rich e-commerce platform designed for:
- **Customers**: Shop, review, and track orders
- **Retailers**: Manage inventory, orders, and proxy products from wholesalers
- **Wholesalers**: Bulk inventory management, retailer order processing
- **Delivery Agents**: Order assignment, status updates, and navigation

---

## 🚀 Key Features

### 🔑 Authentication & Roles
- Multi-role registration: Customer, Retailer, Wholesaler, Delivery Person
- Email/password, phone OTP, Google & Facebook OAuth
- Role-based dashboards and access control

### 🛍️ Customer
- Product browsing, search, and filtering
- Cart and wishlist management
- Order placement and real-time tracking
- Product reviews and ratings
- Support ticket system

### 🏬 Retailer
- Inventory management with low stock alerts
- Order processing and analytics dashboard
- Proxy product listing from wholesalers
- Customer purchase history tracking

### 🏢 Wholesaler
- Bulk inventory management
- Retailer order processing and approval
- Connected retailers view
- Analytics (planned)

### 🚚 Delivery Person
- Delivery assignment and status updates
- Availability toggle
- Navigation assistance
- Earnings tracking

### 📦 Core System
- Automated inventory management (triggers for stock updates)
- Real-time email notifications (Resend/SendGrid/AWS SES ready)
- Secure API with Row Level Security (RLS)
- Responsive, modern UI/UX

---

## 🏗️ Architecture & Tech Stack
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase (PostgreSQL, Auth, Storage)
- **Database**: PostgreSQL (Supabase hosted)
- **ORM/DB Client**: Supabase JS
- **Email**: Resend, SendGrid, or AWS SES (configurable)
- **Authentication**: Supabase Auth (JWT, OAuth, OTP)
- **CI/CD**: Vercel (recommended)
- **Testing**: Manual, with test scripts and guides

---

## 🗄️ Database & Model Alignment
- All models (Product, User, Customer, Retailer, Wholesaler, Inventory, Feedback, etc.) are perfectly aligned with the database schema.
- See [`MODEL_DB_ALIGNMENT.md`](MODEL_DB_ALIGNMENT.md) for details and SQL structure.
- Automated triggers ensure inventory consistency and order tracking.

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
 git clone https://github.com/vedantcoder/online-mart.git
 cd online-mart
```

### 2. Install Dependencies
```bash
 npm install
# or
yarn install
```

### 3. Configure Environment Variables
- Copy `.env.example` to `.env.local` and fill in all required values (see below).

### 4. Set Up Supabase
- Create a new project at [Supabase](https://supabase.com/)
- Get your project URL and keys
- Run the SQL migration scripts in `/scripts/` (see [Database Migration & Seeding](#database-migration--seeding))

---

## 🔑 Environment Variables
Add the following to your `.env.local` (never commit secrets):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Email Service (choose one)
RESEND_API_KEY=your_resend_key
SENDGRID_API_KEY=your_sendgrid_key
AWS_SES_ACCESS_KEY=your_aws_access_key
AWS_SES_SECRET_KEY=your_aws_secret_key
```

---

## 🗃️ Database Migration & Seeding

### 1. Run Migrations
- Use the Supabase SQL Editor to run scripts in `/scripts/` in order:
	1. `01-schema-from-supabase-txt.sql`
	2. `02-seed-retailers-and-products.sql`
	3. `03-seed-100-products-real.sql`
	4. ... (continue with all scripts as needed)
- For feedback, notifications, and proxy system, run:
	- `06-add-feedback-and-notifications.sql`
	- `12-add-wholesaler-proxy-system.sql`
	- `14-restructure-wholesaler-products.sql`

### 2. Seed Data
- The seeding scripts will create demo users, products, categories, and inventory.
- See [`MODEL_DB_ALIGNMENT.md`](MODEL_DB_ALIGNMENT.md) for details.

---

## 🖥️ Running Locally

```bash
npm run dev
# or
yarn dev
```
- Visit [http://localhost:3000](http://localhost:3000)
- Register as each user type to test all flows

---

## 📚 API Overview

### RESTful Endpoints (examples)
- `GET /api/orders` — List orders for user
- `PATCH /api/orders/[id]` — Update order status/assign delivery
- `GET /api/retailer/stats` — Retailer dashboard stats
- `GET /api/retailer/analytics` — Retailer analytics
- `GET /api/retailer/proxy-inventory` — Browse wholesalers
- `POST /api/retailer/proxy-inventory` — Add proxy item
- `GET /api/wholesaler/inventory` — Wholesaler inventory
- `POST /api/wholesaler/inventory` — Add to wholesaler inventory
- `GET /api/categories` — List all categories
- `POST /api/uploads` — Upload images
- `GET /api/feedback` — List reviews
- `POST /api/feedback` — Add review

> See [`COMPLETE_SUMMARY.md`](COMPLETE_SUMMARY.md) for full API documentation and usage examples.

---

## 🧪 Testing Guide
- See [`TESTING_GUIDE.md`](TESTING_GUIDE.md) for full test scenarios, feature checklists, and sample test accounts.
- Test all user flows: registration, product browsing, cart, checkout, order tracking, reviews, support, and delivery.
- Use provided test accounts or create your own for each role.

---

## 🚀 Deployment
- Recommended: Deploy on [Vercel](https://vercel.com/)
- Set all environment variables in Vercel dashboard
- Ensure Supabase project is live and migrations are run
- Test all flows in production before launch

---

## 🛠️ Troubleshooting & Support
- For setup issues, see [`SETUP_INSTRUCTIONS.md`](SETUP_INSTRUCTIONS.md)
- For database/model issues, see [`MODEL_DB_ALIGNMENT.md`](MODEL_DB_ALIGNMENT.md)
- For wholesaler system, see [`WHOLESALER_SYSTEM.md`](WHOLESALER_SYSTEM.md)
- For feature status, see [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md)
- For common issues and solutions, see [`TESTING_GUIDE.md`](TESTING_GUIDE.md)
- For further help, open an issue or contact the maintainer

---

## 🤝 Contribution Guidelines
- Fork the repo and create a feature branch
- Follow the existing code style (TypeScript, Prettier, ESLint)
- Write clear commit messages
- Add/Update documentation for new features
- Submit a pull request with a clear description

---

## 📄 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🎉 Acknowledgements
- Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), and [Vercel](https://vercel.com/)
- Special thanks to all contributors and testers!
