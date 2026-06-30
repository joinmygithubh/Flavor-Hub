# 🍽️ Flavor Hub

A production-grade, full-stack **MERN** food delivery & discovery web app. Browse
dishes across **10 cuisines**, filter and sort, customize with spice levels and
add-ons, manage a cart, and check out with **Cash on Delivery** or a **mock online
payment** gateway — then track your order through every stage.

> Built to real-client-deliverable standards: modular architecture, server-side
> validation, centralized error handling, JWT auth, rate limiting, security headers,
> and a clean, animated, fully responsive UI.

---

## ✨ Features

- **Home** — hero banner, search, and horizontally scrollable cuisine chips.
- **Listing** — responsive dish grid with real food images, ratings, prep time, veg/non-veg, price.
- **Filter & sort** — by cuisine, max price, minimum rating, and dietary preference.
- **Dish detail** — full description, ingredients, spice-level & add-on customization, and reviews.
- **Cart drawer** — quantity controls, live subtotal, persistent across reloads.
- **Checkout** — delivery address form + payment method selection + order summary.
- **Payments** — COD (confirmed instantly) and Online (mock Stripe/Razorpay-style flow; failed payments don't create an order).
- **Auth** — signup / login (JWT + bcrypt), profile page with editable address and **order history**.
- **Order tracking** — animated status steps: Placed → Preparing → Out for Delivery → Delivered.
- **Admin dashboard** — add / edit / delete dishes and update order statuses.
- **Polish** — skeleton loaders, empty states, toasts, Framer Motion animations, **dark mode**, mobile bottom nav.

---

## 🧱 Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React (Vite), Tailwind CSS, React Router, Axios, Framer Motion, Zustand, lucide-react |
| Backend | Node.js, Express.js (REST API) |
| Database | MongoDB Atlas + Mongoose ODM |
| Auth | JWT + bcrypt |
| Validation | Zod (server) + lightweight client-side validation |
| State | Zustand (cart) + React Context (auth, theme) |

---

## 📁 Project structure

```
flavor-hub/
├── server/                     # Express REST API
│   ├── src/
│   │   ├── config/             # env + db connection
│   │   ├── models/             # User, Dish, Order, Restaurant
│   │   ├── controllers/        # request handlers
│   │   ├── routes/             # auth, dish, order, payment routers
│   │   ├── middleware/         # auth, validate (Zod), asyncHandler, errorHandler
│   │   ├── services/           # tokenService, paymentService (mock gateway)
│   │   ├── utils/              # ApiError, apiResponse, pricing
│   │   ├── validators/         # Zod schemas
│   │   ├── seed/               # catalogue data + seed runner
│   │   ├── app.js              # Express app assembly
│   │   └── server.js           # entry point
│   ├── .env.example
│   └── README.md               # full API reference
│
├── client/                     # React (Vite) frontend
│   ├── src/
│   │   ├── api/                # axiosInstance + service layer (auth/dish/order/payment)
│   │   ├── components/         # ui / dish / cart / layout / routing
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── store/              # cartStore, uiStore (Zustand)
│   │   ├── hooks/              # useDishes, useDebounce
│   │   ├── pages/              # Home, Dishes, DishDetail, Checkout, ...
│   │   ├── utils/              # constants, formatters, totals
│   │   ├── App.jsx             # routes + layout
│   │   └── main.jsx
│   └── .env.example
│
├── package.json                # root convenience scripts
└── README.md                   # you are here
```

---

## 🚀 Getting started

### Prerequisites
- **Node.js 18+**
- A **MongoDB** connection string (free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works great)

### 1. Install dependencies

```bash
# from the project root
npm run install:all
# (or: cd server && npm install   then   cd ../client && npm install)
```

### 2. Configure environment variables

**Backend** — copy and edit:

```bash
cd server
cp .env.example .env
```

Set at minimum:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/flavorhub
JWT_SECRET=<a long random string>
CLIENT_URL=http://localhost:5173
```

**Frontend** (optional — sensible default works in dev):

```bash
cd client
cp .env.example .env
```

### 3. Seed the database

Loads 50 dishes (5 per cuisine) with real food images, plus a default admin user.

```bash
cd server
npm run seed
```

Default admin → **admin@flavorhub.test** / **Admin@12345** (configurable in `.env`).

### 4. Run the app (two terminals)

```bash
# Terminal 1 — API on http://localhost:5000
npm run dev:server

# Terminal 2 — web app on http://localhost:5173
npm run dev:client
```

Open **http://localhost:5173** 🎉  (Vite proxies `/api` → `localhost:5000`, so no CORS setup needed in dev.)

### Run with Docker (one command)

Prefer containers? The repo ships a full Docker setup (MongoDB + API + nginx-served client):

```bash
docker compose up --build
# first run only — seed the catalogue:
docker compose exec api npm run seed
```

- Web UI → **http://localhost:8080**  (nginx reverse-proxies `/api` to the API, single origin, no CORS config needed)
- API health → **http://localhost:5000/api/health**

No local Node or MongoDB install required — just Docker.

---

## 💳 Payment flows

| Method | Behavior |
| --- | --- |
| **Cash on Delivery** | Order created immediately with `paymentStatus: "Pending"`. |
| **Pay Online** | Opens a mock gateway (test mode). On success: create session → pay → **verify signature** → order created with `paymentStatus: "Paid"`. On failure/cancel: **no order is created** and the user can retry. |

The payment layer (`server/src/services/paymentService.js`) is a self-contained mock
that mirrors the Stripe/Razorpay create-and-verify handshake, so the app is fully
demoable with **zero external accounts**. Swap in a real provider there without
touching the controllers or UI.

---

## 🔒 Engineering & security highlights

- **Server-authoritative pricing** — totals/add-on prices are recomputed from the DB; a tampered cart can't change the charge (verified by tests).
- **Validation everywhere** — Zod on every request + Mongoose schema validation.
- **Consistent API shape** — `{ success, message, data, meta }` enforced via helpers.
- **Centralized error handling** — one middleware normalizes Zod/Mongoose/JWT errors.
- **Hardening** — `helmet`, scoped CORS (no `*`), `express-mongo-sanitize`, body-size limits, global + per-route rate limiting.
- **Async/await + reusable `asyncHandler`** — no raw `.then()` chains, no repetitive try/catch.
- **Paginated list endpoints**, lazy-loaded images with branded fallbacks, and a dedicated Axios service layer.

See [`server/README.md`](./server/README.md) for the full **API reference**.

---

## 🚀 Deployment & CI

### Continuous Integration
Every push to `main` and every pull request runs [`.github/workflows/ci.yml`](./.github/workflows/ci.yml):
- **Server** — installs deps and assembles the Express app (catches syntax/import/wiring errors, no DB needed).
- **Client** — runs ESLint (`--max-warnings 0`) and a production Vite build.

### One-click deploy (Render)
The repo includes a [`render.yaml`](./render.yaml) Blueprint that provisions both services:

1. In Render, choose **New → Blueprint** and point it at this repo.
2. Set the secrets it asks for:
   - `flavorhub-api` → **`MONGO_URI`** (your Atlas string). `JWT_SECRET` is auto-generated.
   - After the first deploy, set **`CLIENT_URL`** on the API to the web URL (e.g. `https://flavorhub-web.onrender.com`) and **`VITE_API_BASE_URL`** on the web service to the API URL **with `/api`** (e.g. `https://flavorhub-api.onrender.com/api`), then redeploy.

### Frontend on Vercel (alternative)
[`client/vercel.json`](./client/vercel.json) configures the Vite build + SPA routing. Import the repo in Vercel, set the **Root Directory** to `client`, add `VITE_API_BASE_URL` (your API URL + `/api`), and deploy.

---

## 📜 License

MIT — built for demonstration purposes.
