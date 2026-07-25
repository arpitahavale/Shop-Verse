# ShopVerse

Full-stack personalized e-commerce platform with JWT auth, PostgreSQL, and an AI shopping concierge.

| App | Folder | Port |
|-----|--------|------|
| Frontend | `fe/` | 3000 |
| Backend API | `be/` | 5000 |
| Database | PostgreSQL `shopverse` | 5432 |

**Full architecture & role guide:** [`documents/SHOPVERSE-ARCHITECTURE.md`](documents/SHOPVERSE-ARCHITECTURE.md)

---

## Features

- Multi-page storefront (Home, Shop, Categories, Product, Vibe Studio, Collections)
- JWT login/register — entire store is login-gated
- Cart, wishlist, orders persisted in PostgreSQL per user
- Vibe Match — mood-based product ranking + bundle discount
- AI Concierge — natural-language product picks + chat agent
- Local product images (no external CDN dependency)

---

## Quick start

### 1. Database (pgAdmin)

1. Create database `shopverse`
2. Run in order:
   - [`be/sql/01_schema.sql`](be/sql/01_schema.sql)
   - [`be/sql/02_seed.sql`](be/sql/02_seed.sql)

### 2. Backend

```bash
cd be
cp .env.example .env   # edit DATABASE_URL if needed
npm install
npm run dev
```

Health: http://localhost:5000/api/health

### 3. Frontend

```bash
cd fe
npm install
npm start
```

App: http://localhost:3000

### Demo login

- **Email:** `demo@shopverse.com`
- **Password:** `Demo@123`

---

## Environment

**`be/.env`**

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shopverse
JWT_SECRET=shopverse_dev_jwt_secret_change_me
CLIENT_ORIGIN=http://localhost:3000

# Optional — enables real LLM agent (otherwise local agent works)
# GROQ_API_KEY=gsk_...
# OPENAI_API_KEY=sk-...
# AI_MODEL=llama-3.3-70b-versatile
```

**`fe/.env`**

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## API overview

| Area | Endpoints | Auth |
|------|-----------|------|
| Auth | `/api/auth/register`, `/login`, `/me`, `/me/vibe` | mixed |
| Products | `/api/products`, `/api/products/:id` | no |
| Cart | `/api/cart` | yes |
| Wishlist | `/api/wishlist` | yes |
| Orders | `/api/orders` | yes |
| AI | `/api/ai/status`, `/recommend`, `/chat` | yes |

---

## AI Concierge

- **Home → “Ask the catalog”** — type a need, get product picks
- **Floating AI button** — chat on any store page
- **Local agent** works without API key (searches real Postgres catalog)
- **Optional LLM** — add `GROQ_API_KEY` or `OPENAI_API_KEY` for tool-calling agent

Example prompts:
- “Calm desk setup under $100”
- “Gift for a runner”
- “Bold accessories for a night out”

This is how the ai works :
sequenceDiagram
  User->>API: "gift for a runner under $150"
  API->>LLM: message + catalog snapshot
  LLM->>API: tool call search_products(query, vibe, maxPrice)
  API->>DB: search & score products
  DB-->>API: Running Sneakers, Trail Daypack...
  API->>LLM: tool results
  LLM-->>API: natural reply + product IDs
  API-->>User: reply + product cards


---

## Tech stack

**Frontend:** React, React Router, Tailwind CSS, Framer Motion, Context API  
**Backend:** Node.js, Express, pg, JWT, bcrypt  
**Database:** PostgreSQL  
**AI:** Local catalog agent + optional OpenAI/Groq LLM with tools

---

## Project structure

```
Shop-Verse/
├── fe/                 React storefront
├── be/                 Express REST API
│   ├── sql/            Schema + seed
│   └── src/
│       ├── routes/     auth, products, cart, wishlist, orders, ai
│       └── services/   aiAgent, aiCatalog
└── documents/          Architecture docs
```
