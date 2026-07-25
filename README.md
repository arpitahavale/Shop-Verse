# ShopVerse

Full-stack e-commerce with **JWT auth**, **PostgreSQL**, and an **AI shopping concierge**.  
Read this README once — the diagrams below show exactly how the frontend, API, and database work together.

| Layer | Folder | Port |
|-------|--------|------|
| Frontend | `fe/` | 3000 |
| Backend API | `be/` | 5000 |
| Database | PostgreSQL `shopverse` | 5432 |

**Deeper guide:** [`documents/SHOPVERSE-ARCHITECTURE.md`](documents/SHOPVERSE-ARCHITECTURE.md)

---

## How it works (big picture)

The browser **never** talks to Postgres directly. React calls Express; Express runs SQL.

```mermaid
flowchart LR
  User[User Browser]
  FE[React Frontend fe/]
  API[Express API be/]
  DB[(PostgreSQL shopverse)]

  User --> FE
  FE -->|HTTP + JWT| API
  API -->|SQL| DB
```

**Golden rule:** UI → API → DB. Always.

---

## 1. Login & JWT (auth flow)

The whole store is login-gated. After login, every protected API call sends `Authorization: Bearer <token>`.

```mermaid
sequenceDiagram
  actor User
  participant FE as React (fe/)
  participant API as Express /api/auth
  participant DB as PostgreSQL

  User->>FE: Submit login form
  FE->>API: POST /api/auth/login { email, password }
  API->>DB: SELECT user by email
  DB-->>API: password_hash row
  API->>API: bcrypt compare password
  API-->>FE: { token, user }
  FE->>FE: Save JWT in localStorage
  FE-->>User: Open store (Home, Shop, etc.)

  Note over FE,API: Later requests include header Authorization Bearer token
  FE->>API: GET /api/cart (with JWT)
  API->>API: Verify JWT middleware
  API->>DB: SELECT cart_items for user_id
  DB-->>API: Cart rows
  API-->>FE: Cart JSON
```

| Step | Who | What |
|------|-----|------|
| 1 | React | Sends credentials to `/api/auth/login` |
| 2 | Express | Validates password, signs JWT |
| 3 | React | Stores token; `ProtectedRoute` blocks guests |
| 4 | React | Attaches JWT on cart, wishlist, orders, AI calls |

---

## 2. Store API flow (products → cart → checkout)

Catalog is public. Cart, wishlist, and orders require login.

```mermaid
sequenceDiagram
  actor User
  participant FE as React + Context
  participant API as Express REST
  participant DB as PostgreSQL

  User->>FE: Browse Shop
  FE->>API: GET /api/products
  API->>DB: SELECT products
  DB-->>API: 62 product rows
  API-->>FE: Product list JSON
  FE-->>User: Render product grid

  User->>FE: Add to bag
  FE->>API: POST /api/cart/items { productId, qty }
  API->>DB: INSERT/UPDATE cart_items
  DB-->>API: OK
  API-->>FE: Updated cart
  FE-->>User: Toast + badge update

  User->>FE: Checkout
  FE->>API: POST /api/orders { total }
  API->>DB: INSERT order + order_items
  API->>DB: DELETE user cart_items
  DB-->>API: Order created
  API-->>FE: { orderId, status }
  FE-->>User: Redirect to Orders page
```

### API map (quick reference)

| Area | Endpoints | Auth required? |
|------|-----------|----------------|
| **Auth** | `POST /register`, `POST /login`, `GET /me`, `PATCH /me/vibe` | login/register = no; me = yes |
| **Products** | `GET /products`, `GET /products/:id` | No |
| **Cart** | `GET/POST/PUT/DELETE /cart` | Yes |
| **Wishlist** | `GET/POST/DELETE /wishlist` | Yes |
| **Orders** | `GET/POST /orders` | Yes |
| **AI** | `GET /status`, `POST /recommend`, `POST /chat` | Yes |

All routes are prefixed with `/api` (e.g. `http://localhost:5000/api/products`).

---

## 3. AI concierge (how recommendations work)

Two entry points in the UI:
- **Home → “Ask the catalog”** → `POST /api/ai/recommend`
- **Floating AI chat** → `POST /api/ai/chat`

Both search **real products in Postgres** — not fake/mock data.

### Mode A — Local agent (default, no API key)

```mermaid
sequenceDiagram
  actor User
  participant FE as React AiConcierge
  participant API as /api/ai/chat
  participant Agent as aiAgent.js
  participant Search as aiCatalog.js
  participant DB as PostgreSQL

  User->>FE: "above $50 running gear"
  FE->>API: POST /chat { message, history } + JWT
  API->>Agent: chat(message)
  Agent->>Search: searchProducts(query)
  Search->>Search: Parse price (above/under/between)
  Search->>Search: Detect vibe + score products
  Search->>DB: SELECT * FROM products
  DB-->>Search: 62 products
  Search-->>Agent: Top 4 ranked picks + reasons
  Agent-->>API: { reply, products, mode: local-agent }
  API-->>FE: JSON response
  FE-->>User: Chat reply + clickable product cards
```

**Scoring logic (simplified):** keyword match + vibe score + price filter + rating.

### Mode B — LLM agent (optional, needs API key in `be/.env`)

```mermaid
sequenceDiagram
  actor User
  participant FE as React
  participant API as Express /api/ai
  participant LLM as Groq / OpenAI
  participant Tools as search_products tool
  participant DB as PostgreSQL

  User->>FE: "gift for a runner under $150"
  FE->>API: POST /api/ai/chat + JWT
  API->>LLM: message + catalog snapshot
  LLM->>API: tool call search_products(...)
  API->>Tools: Run aiCatalog search
  Tools->>DB: Query + rank products
  DB-->>Tools: Matching products
  Tools-->>API: Tool result JSON
  API->>LLM: tool output
  LLM-->>API: Natural language reply
  API-->>FE: reply + product IDs
  FE-->>User: Chat + product links
```

If LLM fails → falls back to **local agent** automatically.

Example prompts: *“calm desk under $100”*, *“gift for a runner”*, *“above $50”*

---

## Features

- Multi-page store: Home, Shop, Categories, Product, Vibe Studio, Collections
- Login-gated storefront (JWT + bcrypt)
- Cart, wishlist, orders saved per user in Postgres
- Vibe Match — mood-based ranking + bundle discount
- AI Concierge — natural-language search over 62 real products
- Unique SVG product images (`/products/1.svg` … `/products/62.svg`)

---

## Quick start

### 1. Database (pgAdmin)

1. Create database `shopverse`
2. Run SQL scripts **in order**:
   - [`be/sql/01_schema.sql`](be/sql/01_schema.sql)
   - [`be/sql/02_seed.sql`](be/sql/02_seed.sql) — 62 products + demo user

**Already have the old 12-product DB?** Also run [`be/sql/03_more_products.sql`](be/sql/03_more_products.sql) and [`be/sql/04_update_product_images.sql`](be/sql/04_update_product_images.sql).

### 2. Backend

```bash
cd be
cp .env.example .env
npm install
npm run dev
```

Health check: http://localhost:5000/api/health

### 3. Frontend

```bash
cd fe
npm install
npm start
```

App: http://localhost:3000

**Demo login:** `demo@shopverse.com` / `Demo@123`

---

## Environment

**`be/.env`**

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shopverse
JWT_SECRET=shopverse_dev_jwt_secret_change_me
CLIENT_ORIGIN=http://localhost:3000

# Optional — real LLM agent (local agent works without these)
# GROQ_API_KEY=gsk_...
# OPENAI_API_KEY=sk-...
```

**`fe/.env`**

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React, React Router, Tailwind, Framer Motion, Context API |
| Backend | Node.js, Express, pg, JWT, bcrypt |
| Database | PostgreSQL |
| AI | Local catalog agent + optional Groq/OpenAI tool-calling |

---

## Project structure

```
Shop-Verse/
├── fe/src/
│   ├── api/          → HTTP client (auth, products, cart, ai…)
│   ├── context/      → Auth, Cart, Wishlist, Orders, Toast
│   ├── pages/        → Route screens
│   └── components/   → UI + AiConcierge
├── be/src/
│   ├── routes/       → REST endpoints
│   ├── services/     → aiAgent.js, aiCatalog.js
│   └── middleware/   → JWT auth
├── be/sql/           → schema, seed, migrations
└── documents/        → full architecture write-up
```

---

## Regenerate product images

```bash
cd be
node scripts/generate-product-images.js
```

Creates unique SVG images for all 62 products in `fe/public/products/`.
