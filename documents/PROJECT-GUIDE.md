# ShopVerse — Complete Project Guide (Beginner Friendly)

### About this project

**ShopVerse** is a full-stack online store where users sign in, browse 62 products, add items to cart/wishlist, checkout, and view order history — all saved in PostgreSQL per account.  
It includes **Vibe Match** (mood-based product sorting + bundle discounts) and an **AI Concierge** that understands plain English like *“gift for a runner under $150”* and returns real picks from the catalog.  
Built with **React** (frontend), **Node.js + Express** (REST API), **PostgreSQL** (database), **JWT auth**, and a custom **AI search agent** (optional Groq/OpenAI for smarter chat).

**Read this if you are new to the project.**  
It explains what ShopVerse is, what languages we use, how Frontend (FE) and Backend (BE) work, where every API lives, what stores data, and how the AI layer works — with **exact file paths**.

**Quick links:** [Root README](../README.md) · [Diagrams in README](../README.md#how-it-works-big-picture)

---



## 1. What is ShopVerse?

ShopVerse is an **online shopping website** (e-commerce) where:

- Users **register / login**
- Browse **62 products** in categories (Electronics, Clothing, Home, Footwear, Accessories)
- Add items to **bag (cart)** and **wishlist**
- **Checkout** and see **orders**
- Use **Vibe Match** — sort products by mood (focus, motion, nest, signal)
- Use **AI Concierge** — type plain English like *“gift for a runner under $150”* and get real product picks

It is a **full-stack** app = **Frontend** (what you see) + **Backend** (server + database).

---



## 2. Languages & technologies (simple list)


| Part                 | Language / tech                    | Why                                  |
| -------------------- | ---------------------------------- | ------------------------------------ |
| **Frontend**         | **JavaScript** + **JSX** (React)   | Builds the UI in the browser         |
| **Frontend styling** | **CSS** + **Tailwind CSS**         | Layout, colors, animations           |
| **Backend**          | **JavaScript** (Node.js + Express) | REST API server                      |
| **Database**         | **SQL** (PostgreSQL)               | Stores users, products, cart, orders |
| **Auth**             | **JWT** + **bcrypt**               | Login tokens + password hashing      |
| **AI (optional)**    | External **LLM API** (Groq/OpenAI) | Smarter chat when API key is set     |


**Important:** We do **not** use Python, Java, or C# in this project. Almost everything is **JavaScript** (FE and BE). Database scripts are **SQL**.

---



## 3. Two apps in one repo

```
Shop-Verse/
├── fe/          ← FRONTEND  (React)     runs on http://localhost:3000
├── be/          ← BACKEND   (Express)    runs on http://localhost:5000
└── documents/   ← Docs (this file)
```

```mermaid
flowchart TB
  subgraph Browser["Your browser"]
    FE["Frontend fe/\nReact app"]
  end

  subgraph Server["Your computer / server"]
    BE["Backend be/\nExpress API"]
    DB[("PostgreSQL\nshopverse database")]
  end

  FE -->|"HTTP requests\n(JSON + JWT token)"| BE
  BE -->|"SQL queries"| DB
```



**Golden rule:** The browser **never** connects to PostgreSQL directly.  
React always calls the Express API → Express talks to the database.

---



## 4. Frontend (FE) — what it does



### 4.1 Role

The frontend is **everything you see and click**:

- Login / register pages
- Shop, product pages, cart, wishlist, orders
- AI chat button and “Ask the catalog” on Home
- Animations, toasts, navigation



### 4.2 Language & framework


| Item            | Detail                                             |
| --------------- | -------------------------------------------------- |
| Language        | **JavaScript**                                     |
| UI library      | **React** (files use `.jsx` extension)             |
| Routing         | **React Router** — URLs like `/shop`, `/cart`      |
| Global UI state | **React Context API** — shared data across pages   |
| HTTP calls      | Browser `fetch` API (wrapped in our `api/` folder) |




### 4.3 Where is data stored on the frontend?

This confuses many people. We use **two different storages**:


| What                    | Where stored             | Persistent?               | Files involved                                          |
| ----------------------- | ------------------------ | ------------------------- | ------------------------------------------------------- |
| **Login token (JWT)**   | Browser `localStorage`   | Yes (until logout)        | `fe/src/api/client.js`                                  |
| **Logged-in user info** | **React state** (memory) | No (reload fetches again) | `fe/src/context/AuthContext.jsx`                        |
| **Cart items**          | **PostgreSQL** (via API) | Yes, per user account     | `fe/src/context/CartContext.jsx` → `fe/src/api/cart.js` |
| **Wishlist**            | **PostgreSQL** (via API) | Yes                       | `WishlistContext.jsx` → `api/wishlist.js`               |
| **Orders**              | **PostgreSQL** (via API) | Yes                       | `OrdersContext.jsx` → `api/orders.js`                   |
| **Products catalog**    | **PostgreSQL** (via API) | Yes                       | `api/products.js`                                       |


**We do NOT store cart/wishlist in localStorage.**  
After login, cart lives in the **database**. React Context only holds a **copy in memory** for fast UI updates, then syncs with the API.

**Only the JWT token** is in `localStorage` under key `shopverse-token`.

### 4.4 How FE calls the backend (integration layer)

All HTTP integration is in `fe/src/api/`:


| File          | Calls these APIs                                  | Used by                        |
| ------------- | ------------------------------------------------- | ------------------------------ |
| `client.js`   | Base helper — adds JWT header to every request    | All api files                  |
| `auth.js`     | `/api/auth/register`, `/login`, `/me`, `/me/vibe` | Login, Register, AuthContext   |
| `products.js` | `/api/products`, `/api/products/:id`              | Shop, Home, Product detail     |
| `cart.js`     | `/api/cart` (GET, POST, PUT, DELETE)              | CartContext, Cart page         |
| `wishlist.js` | `/api/wishlist`                                   | WishlistContext, Product cards |
| `orders.js`   | `/api/orders`                                     | Orders page, checkout          |
| `ai.js`       | `/api/ai/status`, `/recommend`, `/chat`           | AiPicks, AiConcierge           |


**Example flow — add to cart:**

```
User clicks "Add to bag" on ProductCard
    → CartContext.addToCart()
    → cart.js → POST http://localhost:5000/api/cart/items
    → Backend saves to PostgreSQL
    → Response returns updated cart
    → Context updates UI + toast shows "Added"
```



### 4.5 Frontend folder map (important files)

```
fe/src/
├── App.js                 Main routes (login vs store)
├── api/                   ★ All backend HTTP calls
├── context/               ★ Global state (auth, cart, wishlist…)
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   ├── WishlistContext.jsx
│   ├── OrdersContext.jsx
│   └── ToastContext.jsx
├── pages/                 One file per screen
│   ├── LoginPage.jsx
│   ├── ShopPage.jsx
│   ├── CartPage.jsx
│   └── ...
├── components/            Reusable UI
│   ├── AiConcierge.jsx    ★ Floating AI chat
│   ├── home/AiPicks.jsx   ★ Home AI search
│   └── common/            Buttons, ProductCard, etc.
├── constants/index.js     Routes, categories, vibes
└── utils/                 Cart math, vibe scoring, formatting
```



### 4.6 Auth on the frontend


| File                            | Job                                        |
| ------------------------------- | ------------------------------------------ |
| `components/ProtectedRoute.jsx` | Blocks store pages if not logged in        |
| `components/GuestRoute.jsx`     | Login/register only for guests             |
| `components/AuthLayout.jsx`     | Login page shell (animated background)     |
| `context/AuthContext.jsx`       | login(), logout(), register(), user object |


---



## 5. Backend (BE) — what it does



### 5.1 Role

The backend is the **server brain**:

- Receives HTTP requests from React
- Checks JWT on protected routes
- Runs **SQL** on PostgreSQL
- Returns **JSON** responses
- Runs **AI search logic**



### 5.2 Language & framework


| Item            | Detail                                           |
| --------------- | ------------------------------------------------ |
| Language        | **JavaScript** (Node.js)                         |
| Framework       | **Express.js**                                   |
| Database driver | `pg` (node-postgres)                             |
| Config          | `be/.env` (DB URL, JWT secret, optional AI keys) |




### 5.3 Entry point

`be/src/index.js` — starts the server, enables CORS, registers all routes:

```text
/api/health     → health check
/api/auth       → auth.js
/api/products   → products.js
/api/cart       → cart.js
/api/wishlist   → wishlist.js
/api/orders     → orders.js
/api/ai         → ai.js
```



### 5.4 Backend folder map

```
be/src/
├── index.js           ★ Server entry + route mounting
├── db.js              PostgreSQL connection pool
├── middleware/
│   └── auth.js        JWT verify + sign token
├── routes/            ★ One file per API area
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── wishlist.js
│   ├── orders.js
│   └── ai.js
└── services/          ★ Business logic (especially AI)
    ├── aiCatalog.js   Product search + scoring
    └── aiAgent.js     Recommend + chat agent

be/sql/
├── 01_schema.sql      Create tables
├── 02_seed.sql        62 products + demo user
├── 03_more_products.sql   (optional, old DBs)
└── 04_update_product_images.sql
```



### 5.5 Database (PostgreSQL)

Managed in **pgAdmin**. Database name: `shopverse`.


| Table            | Stores                                                     |
| ---------------- | ---------------------------------------------------------- |
| `users`          | name, email, password_hash, active_vibe                    |
| `products`       | 62 items — name, price, category, vibes (JSON), image path |
| `cart_items`     | user_id + product_id + quantity                            |
| `wishlist_items` | user_id + product_id                                       |
| `orders`         | order id, user, status, total, date                        |
| `order_items`    | products inside each order                                 |


**Connection string** in `be/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shopverse
```

---



## 6. Complete API map (FE → BE)

Every feature uses **REST APIs** (HTTP + JSON).


| Feature         | Method | API URL               | FE file           | BE file              |
| --------------- | ------ | --------------------- | ----------------- | -------------------- |
| Register        | POST   | `/api/auth/register`  | `api/auth.js`     | `routes/auth.js`     |
| Login           | POST   | `/api/auth/login`     | `api/auth.js`     | `routes/auth.js`     |
| Current user    | GET    | `/api/auth/me`        | `api/auth.js`     | `routes/auth.js`     |
| Set vibe        | PATCH  | `/api/auth/me/vibe`   | `api/auth.js`     | `routes/auth.js`     |
| List products   | GET    | `/api/products`       | `api/products.js` | `routes/products.js` |
| One product     | GET    | `/api/products/:id`   | `api/products.js` | `routes/products.js` |
| Get cart        | GET    | `/api/cart`           | `api/cart.js`     | `routes/cart.js`     |
| Add to cart     | POST   | `/api/cart/items`     | `api/cart.js`     | `routes/cart.js`     |
| Update cart     | PUT    | `/api/cart`           | `api/cart.js`     | `routes/cart.js`     |
| Remove item     | DELETE | `/api/cart/items/:id` | `api/cart.js`     | `routes/cart.js`     |
| Get wishlist    | GET    | `/api/wishlist`       | `api/wishlist.js` | `routes/wishlist.js` |
| Add wishlist    | POST   | `/api/wishlist`       | `api/wishlist.js` | `routes/wishlist.js` |
| Remove wishlist | DELETE | `/api/wishlist/:id`   | `api/wishlist.js` | `routes/wishlist.js` |
| Order history   | GET    | `/api/orders`         | `api/orders.js`   | `routes/orders.js`   |
| Checkout        | POST   | `/api/orders`         | `api/orders.js`   | `routes/orders.js`   |
| AI status       | GET    | `/api/ai/status`      | `api/ai.js`       | `routes/ai.js`       |
| AI recommend    | POST   | `/api/ai/recommend`   | `api/ai.js`       | `routes/ai.js`       |
| AI chat         | POST   | `/api/ai/chat`        | `api/ai.js`       | `routes/ai.js`       |
| Health          | GET    | `/api/health`         | —                 | `index.js`           |


**Auth column:** Routes marked above need `Authorization: Bearer <token>` except register, login, and public product list.

---



## 7. AI layer — everything we built

The AI layer is **not** a separate app. It lives **inside the backend** as two service files + one route file, with **two UI components** on the frontend.

### 7.1 What problem AI solves


| Without AI                   | With AI                                        |
| ---------------------------- | ---------------------------------------------- |
| User clicks category filters | User types: *“above $50 running gear”*         |
| Fixed vibe buttons           | Understands price words: above, under, between |
| No explanation               | Reply explains why products match              |


Products always come from **real PostgreSQL rows** — never invented fake items.

### 7.2 AI files (what each file does)


| File                                 | Language   | Role                                                                                                                                |
| ------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `be/src/services/aiCatalog.js`       | JavaScript | **Search engine** — tokenize query, detect vibe, parse price (`above`/`under`/`between`), score all 62 products, return top matches |
| `be/src/services/aiAgent.js`         | JavaScript | **Agent brain** — `recommend()` and `chat()` functions; local mode OR optional LLM with tool calling                                |
| `be/src/routes/ai.js`                | JavaScript | **HTTP endpoints** — exposes `/recommend`, `/chat`, `/status` to React                                                              |
| `fe/src/api/ai.js`                   | JavaScript | **FE client** — `recommendProducts()`, `chatWithAgent()`                                                                            |
| `fe/src/components/AiConcierge.jsx`  | JSX        | Floating **AI chat** UI on all store pages                                                                                          |
| `fe/src/components/home/AiPicks.jsx` | JSX        | Home page **“Ask the catalog”** search box                                                                                          |




### 7.3 Local agent (works without any API key)

Default mode. No OpenAI/Groq needed.

```mermaid
sequenceDiagram
  participant UI as AiConcierge.jsx
  participant API as routes/ai.js
  participant Agent as aiAgent.js
  participant Catalog as aiCatalog.js
  participant DB as PostgreSQL

  UI->>API: POST /api/ai/chat { message }
  API->>Agent: chat(message)
  Agent->>Catalog: searchProducts(query)
  Catalog->>Catalog: detectVibe, extractPriceFilter
  Catalog->>DB: SELECT * FROM products
  DB-->>Catalog: 62 products
  Catalog->>Catalog: scoreProduct for each
  Catalog-->>Agent: top 4 + reasons
  Agent-->>API: { reply, products, mode: local-agent }
  API-->>UI: JSON
  UI->>UI: Show message + product links
```



**Scoring in** `aiCatalog.js` **(simplified):**

1. Split query into words; ignore “the”, “for”, etc.
2. Detect vibe from keywords (run → motion, desk → focus, cozy → nest…)
3. Parse price: `above $50`, `under $100`, `between $50 and $150`
4. For each product: keyword match + vibe score + price filter + rating
5. Return top 4 with reason strings



### 7.4 Optional LLM agent (Groq / OpenAI)

If you add to `be/.env`:

```env
GROQ_API_KEY=your_key
# or OPENAI_API_KEY=your_key
```

Then `aiAgent.js` calls an external LLM with **tools**:

- `search_products` → runs `aiCatalog.js`
- `get_product` → fetches one product by ID

If LLM fails → **automatic fallback** to local agent.

### 7.5 AI API endpoints


| Endpoint                 | Body example                                      | Returns                         |
| ------------------------ | ------------------------------------------------- | ------------------------------- |
| `GET /api/ai/status`     | —                                                 | `{ providerConfigured, modes }` |
| `POST /api/ai/recommend` | `{ "query": "calm desk under $100", "limit": 4 }` | `{ reply, products, mode }`     |
| `POST /api/ai/chat`      | `{ "message": "...", "history": [...] }`          | `{ reply, products, mode }`     |


Both AI endpoints require **login (JWT)**.

---



## 8. Other features (non-AI)



### Vibe Match Studio (`/vibe`)

- **Frontend only scoring** for sorting — uses `fe/src/utils/vibe.js`
- Products have vibe JSON in DB: `{ focus, motion, nest, signal }`
- Bundle **12% discount** when 2+ cart items match active vibe (see `utils/cart.js`)



### Product images

- 62 unique SVG files: `fe/public/products/1.svg` … `62.svg`
- Generator script: `be/scripts/generate-product-images.js`



### Toasts

- Top-right notifications — `ToastContext.jsx` + `components/common/ToastStack.jsx`

---



## 9. How to run (reminder)

```bash
# 1. PostgreSQL: run be/sql/01_schema.sql then 02_seed.sql in pgAdmin

# 2. Backend
cd be
cp .env.example .env
npm install
npm run dev          # → http://localhost:5000

# 3. Frontend
cd fe
npm install
npm start            # → http://localhost:3000
```

**Demo login:** `demo@shopverse.com` / `Demo@123`

---



