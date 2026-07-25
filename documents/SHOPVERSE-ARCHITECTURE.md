# ShopVerse — Full Architecture & Role Guide

This document explains **what each part does**, **how they connect**, and **what the AI layer adds** on top of the normal e-commerce flow.

---

## 1. High-level overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     USER (Browser)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │   FRONTEND (fe/)          │
              │   React · port 3000       │
              │   UI · routing · state    │
              └─────────────┬─────────────┘
                            │ HTTP + JWT
              ┌─────────────▼─────────────┐
              │   BACKEND (be/)           │
              │   Express · port 5000     │
              │   REST API · auth · AI    │
              └─────────────┬─────────────┘
                            │ SQL
              ┌─────────────▼─────────────┐
              │   PostgreSQL (shopverse)  │
              │   pgAdmin                 │
              └───────────────────────────┘
```

**Rule:** The browser never talks to Postgres directly. Everything goes through the Express API.

---

## 2. Frontend (`fe/`) — Role & responsibilities

### What FE does

The frontend is the **store the user sees and interacts with**. It handles:

- Pages and navigation
- Forms (login, search, filters)
- Displaying products, cart, wishlist, orders
- Animations and layout
- Calling the backend API
- Storing the JWT token after login

### What FE does NOT do

- Does not connect to PostgreSQL
- Does not hash passwords
- Does not run AI logic on the server (it only sends messages to `/api/ai/*`)

### Folder structure

```text
fe/src/
├── api/              HTTP calls to backend
│   ├── client.js     Base fetch + JWT header
│   ├── auth.js       Login, register, me
│   ├── products.js   Catalog fetch
│   ├── cart.js       Bag CRUD
│   ├── wishlist.js   Saved items
│   ├── orders.js     Order history + checkout
│   └── ai.js         AI recommend + chat
├── context/          Global state
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   ├── WishlistContext.jsx
│   ├── OrdersContext.jsx
│   └── ToastContext.jsx
├── pages/            Route screens
├── components/       Reusable UI
│   ├── AiConcierge.jsx    Floating AI chat
│   └── home/AiPicks.jsx   Home AI search block
├── constants/        Routes, categories, vibes
└── utils/            Vibe scoring, cart totals, formatting
```

### Pages & routes

| Route | Page | Purpose |
|-------|------|---------|
| `/login` | LoginPage | Standalone auth (no store nav) |
| `/register` | RegisterPage | Create account |
| `/` | HomePage | Landing, categories, AI picks |
| `/shop` | ShopPage | Full catalog + search/sort |
| `/shop/:category` | ShopPage | Category aisle |
| `/product/:id` | ProductDetailPage | Product detail + add to bag |
| `/vibe` | VibePage | Vibe Match Studio |
| `/collections/:slug` | CollectionPage | Curated collection |
| `/cart` | CartPage | Bag + checkout |
| `/wishlist` | WishlistPage | Saved products |
| `/orders` | OrdersPage | Order history |

**All store routes require login.** Guests only see `/login` and `/register`.

### Auth flow (FE side)

1. User submits login form → `POST /api/auth/login`
2. Backend returns `{ token, user }`
3. FE saves token in `localStorage` (`shopverse-token`)
4. Every API call adds header: `Authorization: Bearer <token>`
5. `ProtectedRoute` blocks store pages if not logged in
6. Logout clears token and redirects to login

### Data flow (FE side)

```text
User action (click Add / checkout / save wishlist)
        ↓
Context (CartContext / WishlistContext / etc.)
        ↓
api/*.js → fetch with JWT
        ↓
Express API
        ↓
Response → update UI + toast notification
```

### Vibe Match (FE logic)

Products have vibe scores in JSON: `{ focus, motion, nest, signal }`.

- User picks a vibe on Vibe Studio
- FE re-sorts products by match score
- Cart applies 12% bundle discount when 2+ items score ≥70 for active vibe
- Active vibe can sync to user profile via `PATCH /api/auth/me/vibe`

This is **rule-based personalization** (not AI).

### AI on the frontend

Two UI entry points:

1. **Home → AiPicks** — user types a need, gets product grid
2. **Floating AI button (AiConcierge)** — chat panel on every store page

Both call:
- `POST /api/ai/recommend` — one-shot picks
- `POST /api/ai/chat` — conversational agent with product cards

---

## 3. Backend (`be/`) — Role & responsibilities

### What BE does

The backend is the **brain and gatekeeper**. It:

- Validates login (JWT)
- Reads/writes PostgreSQL
- Exposes REST endpoints for products, cart, wishlist, orders
- Runs the AI agent (local or LLM)
- Never exposes DB credentials to the browser

### Folder structure

```text
be/
├── sql/
│   ├── 01_schema.sql     Tables
│   └── 02_seed.sql       Demo data
└── src/
    ├── index.js          App entry, CORS, routes
    ├── db.js             Postgres pool
    ├── middleware/
    │   └── auth.js       JWT verify + sign
    ├── routes/
    │   ├── auth.js
    │   ├── products.js
    │   ├── cart.js
    │   ├── wishlist.js
    │   ├── orders.js
    │   └── ai.js
    └── services/
        ├── aiCatalog.js  Product search/scoring for AI
        └── aiAgent.js    Recommend + chat agent
```

### Database tables

| Table | Purpose |
|-------|---------|
| `users` | Accounts, password hash, active_vibe |
| `products` | Catalog (name, price, category, vibes JSONB, image path) |
| `cart_items` | User bag (user_id + product_id + quantity) |
| `wishlist_items` | Saved products per user |
| `orders` | Order header (id, status, total, date) |
| `order_items` | Line items per order |

### Auth flow (BE side)

**Register**
1. Validate name, email, password
2. Hash password with bcrypt
3. Insert into `users`
4. Return JWT + user object

**Login**
1. Find user by email
2. Compare password with bcrypt
3. Return JWT + user object

**Protected routes**
1. Read `Authorization: Bearer <token>`
2. Verify JWT with `JWT_SECRET`
3. Attach `req.user = { id, email }`
4. Use `req.user.id` for cart/wishlist/orders/AI

### Core API behaviors

**Products** — public read from `products` table

**Cart**
- GET — join cart_items + products for logged-in user
- POST `/items` — add or increment quantity
- PUT — replace entire cart
- DELETE — remove item or clear cart

**Wishlist**
- GET — products user saved
- POST — add product id
- DELETE — remove product id

**Orders**
- GET — order history with line items
- POST — checkout: create order from cart, insert order_items, clear cart

---

## 4. AI layer — Role & how it works

### What AI adds (extra vs normal shop)

| Without AI | With AI |
|------------|---------|
| User clicks category/vibe filters | User types: “gift for runner under $150” |
| Fixed vibe score sorting | Natural language understanding + catalog search |
| No explanation | Reply explains why products fit |
| No chat | Floating concierge chat |

### Two modes

#### Mode A — Local agent (default, no API key)

Runs entirely in Node.js using your Postgres catalog.

**How it works:**
1. User sends message: “calm desk under $100”
2. `aiCatalog.js` tokenizes query, detects vibe (focus/motion/nest/signal)
3. Extracts budget if present (`under $100`)
4. Scores every product: keyword match + vibe score + price + rating
5. Returns top 4 products with reasons

**Tools concept (internal):**
- `search_products(query, vibe, maxPrice)`
- Uses real DB rows — no fake products

#### Mode B — LLM agent (optional)

Set `GROQ_API_KEY` or `OPENAI_API_KEY` in `be/.env`.

**How it works:**
1. User message sent to LLM with system prompt + catalog snapshot
2. LLM can call tools: `search_products`, `get_product`
3. Backend runs tools against Postgres
4. LLM writes natural reply + product IDs
5. FE shows reply + clickable product cards

If LLM fails → falls back to local agent automatically.

### AI endpoints

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/api/ai/status` | — | `{ providerConfigured, modes }` |
| POST | `/api/ai/recommend` | `{ query, limit }` | `{ reply, products, mode, meta }` |
| POST | `/api/ai/chat` | `{ message, history }` | `{ reply, products, mode }` |

All AI routes require JWT (user must be logged in).

### AI flow diagram

```text
User: "Gift for a runner under $150"
        ↓
FE → POST /api/ai/chat
        ↓
aiAgent.js
   ├─ (optional) LLM + tool calls
   └─ or local: aiCatalog.searchProducts()
        ↓
Postgres products table
        ↓
Ranked products + reasons
        ↓
FE shows chat reply + product links
```

### Is this a “real agent”?

**Yes, in agent-lite form:**
- Understands natural language
- Uses tools to search real catalog
- Returns grounded products (IDs from DB)
- Optional: LLM decides which tools to call

**Not yet:** autonomous checkout, payment, or multi-step planning without user confirmation.

---

## 5. End-to-end example: Add to bag → Checkout

```text
1. User logs in
   FE → POST /api/auth/login → JWT stored

2. User opens Shop, clicks Add on product
   FE → POST /api/cart/items { productId, quantity }
   BE → INSERT/UPDATE cart_items
   FE → Cart badge updates

3. User goes to Cart, clicks Checkout
   FE → POST /api/orders { total }
   BE → INSERT orders + order_items, DELETE cart_items
   FE → Navigate to Orders page
```

---

## 6. What to say on resume

**Accurate titles:**
- Full-Stack Personalized E-Commerce Platform
- AI-Assisted Shopping with JWT Auth & PostgreSQL

**Honest AI wording:**
- “Natural-language product recommendations via AI concierge”
- “Tool-calling shopping agent over Postgres catalog”
- “Local + optional LLM agent with fallback”

**Avoid unless you add real ML:**
- “AI-powered” without explaining local agent vs LLM
- “Machine learning recommendations” (current vibe scores are rule-based)

---

## 7. Run checklist

- [ ] PostgreSQL running, database `shopverse` created
- [ ] Ran `01_schema.sql` and `02_seed.sql`
- [ ] `be/.env` configured
- [ ] `cd be && npm run dev` → port 5000
- [ ] `fe/.env` has `REACT_APP_API_URL=http://localhost:5000`
- [ ] `cd fe && npm start` → port 3000
- [ ] Login with demo@shopverse.com / Demo@123
- [ ] Try Home AI picks or floating AI chat

---

## 8. Optional: Enable real LLM

Add to `be/.env`:

```env
GROQ_API_KEY=your_key_here
AI_MODEL=llama-3.3-70b-versatile
```

Restart backend. `/api/ai/status` will show `providerConfigured: true` and mode `llm-agent`.
