# TownTicker (FlashAds)

> **Self-Serve, Hyperlocal Ad Network for Independent Publishers & Local Businesses. The new classifieds**

TownTicker (FlashAds) is an end-to-end, automated ad network platform designed to empower local news websites, independent publishers, and digital media outlets to monetize their audience through self-serve, time-based "flash" ads. Local businesses and advertisers can effortlessly customize, schedule, pay for, and track their ads in real time.

---

## Table of Contents

- [Architecture & Monorepo Structure](#-architecture--monorepo-structure)
- [Key Features](#-key-features)
  - [Publisher Platform](#-publisher-platform)
  - [Self-Serve Advertiser Portal](#️-self-serve-advertiser-portal)
  - [Embeddable Widget](#-embeddable-widget)
  - [Super Admin & Audit Suite](#-super-admin--audit-suite)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database Setup (Docker)](#1-database-setup-docker)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Publisher Portal Setup](#3-publisher-portal-setup)
  - [4. Advertiser Portal Setup](#4-advertiser-portal-setup)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Database Management & Seeding](#-database-management--seeding)
- [Widget Integration Guide](#-widget-integration-guide)
- [API Overview](#-api-overview)
- [License](#-license)

---

## Architecture & Monorepo Structure

The repository is organized into four main sub-projects:

```
FlashAds/
├── backend/                  # Node.js + Express + TypeScript REST API
│   ├── cron.ts               # Automated ad expiration & notification jobs
│   ├── db.ts                 # PostgreSQL connection pool
│   ├── init.sql              # Initial database schema DDL
│   ├── logger.ts             # System event & audit logger
│   ├── migrate.ts            # Incremental migration scripts
│   ├── routes/               # Express route handlers
│   │   ├── ads.ts            # Public ads, checkout, & analytics tracking
│   │   ├── advertiserAuth.ts # Advertiser authentication & profile management
│   │   ├── auth.ts           # Publisher & Admin authentication
│   │   ├── passwordReset.ts  # Tokenized password reset flows
│   │   ├── publishers.ts     # Publisher configuration, tiers, & schemas
│   │   └── webhooks.ts       # Stripe webhook event handling
│   ├── seed.ts               # Initial dummy data & admin accounts
│   ├── seed_analytics.ts     # Sample impression and click analytics
│   └── stripe.ts             # Stripe API integration & platform fee calculation
├── frontend-publisher/       # React 19 + TypeScript + Vite portal for publishers & admins
│   └── src/
│       ├── components/       # Reusable UI components & Brand logo
│       └── pages/            # Dashboard, Settings, System Admin, FAQ, Landing
├── frontend-advertiser/      # React 19 + TypeScript + Vite self-serve portal
│   └── src/
│       ├── components/       # Ad live preview, dynamic form components
│       └── pages/            # Submit Ad, Checkout, Dashboard, Account Settings
├── widget/                   # Lightweight standalone vanilla JS widget
│   └── widget.js             # Embeddable script with view/click tracking
└── docker-compose.yml        # PostgreSQL 15 container definition
```

---

## Key Features

### Publisher Platform (`frontend-publisher`)
- **Interactive Revenue & Performance Analytics**: Visual line charts, bar graphs, and KPIs powered by Recharts (Revenue, Impressions, Clicks, and CTR).
- **Dynamic Schema Builder**: Build custom ad schemas on the fly (text fields, textareas, image uploaders, URLs).
- **Custom Tier & Duration Configurator**: Define customizable pricing tiers (e.g. 24 hours, 72 hours, 7 days) and prices in USD.
- **Form & Widget Theme Editor**: Real-time visual customizer for widget layout (grid/row/column), Google Fonts integration, colors, borders, and margins.
- **Stripe Connect Integration**: Connect publisher Stripe accounts for direct, automated split payouts with platform fee management.
- **Advertiser Moderation & Blocking**: Blocklist abusive advertiser accounts or emails per publisher.

### Self-Serve Advertiser Portal (`frontend-advertiser`)
- **Instant Self-Serve Ad Creation**: Dynamic form generated automatically based on publisher configuration.
- **Real-Time Live Ad Preview**: Preview how ads look on desktop and mobile before paying.
- **Seamless Stripe Checkout**: Direct checkout with automated ad activation upon payment confirmation.
- **Advertiser Dashboard**: Track running ad campaigns, total view/click metrics, renewal reminders, and past receipts.
- **One-Click Renewal**: Re-run expired campaigns with a single click.

### Embeddable Widget (`widget`)
- **Zero Framework Dependency**: Ultra-lightweight, standalone JavaScript snippet.
- **Dynamic Font Loading**: Injects Google Fonts on-demand based on publisher widget configuration.
- **Analytics Tracking**: Native support for view tracking and non-blocking beacon-based click tracking (`navigator.sendBeacon`).
- **Responsive Layouts**: Supports horizontal tickers, vertical sidebars, and fluid card grids.

### Super Admin & Audit Suite
- **Global Network Overview**: System admin view across all publishers, active ads, network-wide impressions, and revenue.
- **Comprehensive Audit Logs**: Centralized logging system (`system_logs`) recording logins, ad creation, config changes, and deletions.
- **Account Moderation**: Platform-level advertiser suspension and publisher management.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend API** | Node.js, Express 5, TypeScript, PostgreSQL (`pg`), JWT, Multer, Bcrypt |
| **Payments** | Stripe Connect API & Webhooks |
| **Publisher App** | React 19, TypeScript, Vite, React Router 7, Recharts, Oxlint |
| **Advertiser App** | React 19, TypeScript, Vite, React Router 7, Axios, Oxlint |
| **Widget** | Vanilla JavaScript (ES6+), SendBeacon API, DOM APIs |
| **Infrastructure** | Docker, Docker Compose, PostgreSQL 15 |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)

---

### 1. Database Setup (Docker)

Start the PostgreSQL 15 database container:

```bash
docker-compose up -d
```

This starts PostgreSQL on port `5432` and automatically initializes the database schema from `backend/init.sql`.

---

### 2. Backend Setup

Navigate to the `backend` directory, install dependencies, and run database migrations/seeds:

```bash
cd backend
npm install

# Run database migrations
npx ts-node migrate.ts

# (Optional) Seed demo admin, publisher, and sample ad data
npx ts-node seed.ts

# (Optional) Seed sample analytics events
npx ts-node seed_analytics.ts

# Start backend development server
npm run dev
```

The API server will run at: `http://localhost:3001`

**Default Seed Accounts:**
- **Admin**: `admin@admin.com` / `admin`
- **Publisher**: `pub@localnews.com` / `password`

---

### 3. Publisher Portal Setup

Open a new terminal and start the publisher dashboard:

```bash
cd frontend-publisher
npm install
npm run dev
```

The Publisher Portal will run at: `http://localhost:5173` (or the port shown by Vite).

---

### 4. Advertiser Portal Setup

Open a new terminal and start the self-serve advertiser application:

```bash
cd frontend-advertiser
npm install
npm run dev
```

The Advertiser Portal will run at: `http://localhost:5174` (or the port shown by Vite).

---

## Configuration & Environment Variables

### Backend (`backend/.env`)

Create a `.env` file inside `backend/`:

```env
PORT=3001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=townticker

JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

---

## Database Management & Seeding

| Command | Description |
|---|---|
| `npx ts-node migrate.ts` | Runs schema updates, creates auxiliary tables (advertisers, system_logs, password_resets). |
| `npx ts-node seed.ts` | Inserts admin publisher (`admin@admin.com`) and demo publisher (`pub@localnews.com`). |
| `npx ts-node seed_analytics.ts` | Populates mock views, clicks, and impressions for dashboard visualization testing. |
| `npm test` | Runs Jest unit and integration test suites. |

---

## Widget Integration Guide

Publishers can embed the TownTicker ad widget on any website with two simple snippets:

### 1. Add the Target HTML Container
```html
<div id="townticker-widget" data-publisher="<YOUR_PUBLISHER_UUID>"></div>
```

### 2. Include the Widget Script
```html
<script src="http://localhost:3001/widget/widget.js" async></script>
```

*(Replace `http://localhost:3001` with your production backend domain).*

---

## API Overview

### Public & Widget Endpoints
- `GET /health` - Service health check
- `GET /api/ads?publisher=<id>` - Fetch active, unexpired ads for the widget
- `POST /api/ads/:id/view` - Record an ad impression
- `POST /api/ads/:id/click` - Record an ad click event (supports `sendBeacon`)
- `POST /api/ads/checkout` - Initialize Stripe checkout session for ad submission

### Authentication Endpoints
- `POST /api/auth/register` - Register a new publisher
- `POST /api/auth/login` - Publisher & Admin login
- `POST /api/auth/forgot-password` - Request password reset token
- `POST /api/auth/reset-password` - Confirm password reset
- `POST /api/advertisers/register` - Register a new advertiser
- `POST /api/advertisers/login` - Advertiser login

### Publisher & Admin Endpoints (Authenticated)
- `GET /api/publishers/:id` - Fetch publisher configuration & schema
- `PUT /api/publishers/:id/config` - Update publisher tiers, schema, and widget theme
- `GET /api/publishers/:id/ads` - Fetch publisher ads and live analytics
- `GET /api/publishers/:id/advertisers` - Manage advertisers & blocklists
- `GET /api/publishers/admin/logs` - Retrieve global system audit logs *(Admin only)*

---

## License

This project is licensed under the ISC License.
