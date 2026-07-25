# ShopVerse — Local Postgres + Auth + Thin API

This project has two apps:

- `fe/` — React storefront (port 3000)
- `be/` — Express API (port 5000) talking to local PostgreSQL

## 1. PostgreSQL + pgAdmin

1. Install PostgreSQL and open **pgAdmin**.
2. Create a database named `shopverse`.
3. Open Query Tool on `shopverse` and run, in order:
   - [`be/sql/01_schema.sql`](be/sql/01_schema.sql)
   - [`be/sql/02_seed.sql`](be/sql/02_seed.sql)
4. Confirm tables: `users`, `products`, `cart_items`, `wishlist_items`, `orders`, `order_items`.

### Connection string

Edit [`be/.env`](be/.env) to match your Postgres password:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/shopverse
JWT_SECRET=shopverse_dev_jwt_secret_change_me
CLIENT_ORIGIN=http://localhost:3000
```

Default example uses user `postgres` / password `postgres`.

## 2. Start the API

```bash
cd be
npm install
npm run dev
```

Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

## 3. Start the React app

```bash
cd fe
npm install
npm start
```

App: [http://localhost:3000](http://localhost:3000)

## Demo login

- Email: `demo@shopverse.com`
- Password: `Demo@123`

## Auth & data flow

- **All store pages require login** — guests are redirected to a standalone `/login` (or `/register`) screen with no shop navigation
- Login / Register: JWT stored in `localStorage`
- After sign-in: full access to home, shop, vibe, bag, wishlist, orders
- Cart, wishlist, orders, and active vibe sync to Postgres for the logged-in user

## Useful API routes

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | no |
| POST | `/api/auth/login` | no |
| GET | `/api/auth/me` | yes |
| PATCH | `/api/auth/me/vibe` | yes |
| GET | `/api/products` | no |
| GET | `/api/products/:id` | no |
| GET/PUT/DELETE | `/api/cart` | yes |
| GET/POST/DELETE | `/api/wishlist` | yes |
| GET/POST | `/api/orders` | yes |
