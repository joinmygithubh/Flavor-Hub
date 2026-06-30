# Flavor Hub — Backend API

REST API for the Flavor Hub food delivery & discovery platform. Built with
**Node.js + Express + MongoDB (Mongoose)** with JWT auth, server-side validation
(Zod), centralized error handling, rate limiting and a pluggable payment layer.

## Quick start

```bash
cd server
cp .env.example .env        # fill in MONGO_URI + JWT_SECRET
npm install
npm run seed                # load the dish catalogue + default admin
npm run dev                 # starts on http://localhost:5000
```

> Requires Node 18+ and a MongoDB Atlas connection string (or any MongoDB URI).

## Environment variables

See [`.env.example`](./.env.example) for the full, documented list. The essentials:

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign auth tokens |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated |
| `PAYMENT_PROVIDER` | `mock` (default). Seam for `stripe`/`razorpay` |

## Folder structure

```
server/
├── src/
│   ├── config/        # env loading + DB connection
│   │   ├── env.js
│   │   └── db.js
│   ├── models/        # Mongoose schemas
│   │   ├── User.js  Dish.js  Order.js  Restaurant.js
│   ├── controllers/   # request handlers (thin, delegate to utils/services)
│   ├── routes/        # Express routers (auth, dish, order, payment)
│   ├── middleware/     # auth, validate (Zod), asyncHandler, errorHandler
│   ├── services/      # tokenService, paymentService (mock gateway)
│   ├── utils/         # ApiError, apiResponse, pricing (server-side totals)
│   ├── validators/    # Zod request schemas
│   ├── seed/          # catalogue data + seed runner
│   ├── app.js         # Express app assembly (middleware + routes)
│   └── server.js      # entry point (DB connect + listen + shutdown)
└── .env.example
```

## API reference

All responses use a consistent shape:

```jsonc
{ "success": true, "message": "OK", "data": {}, "meta": { } }
```

### Auth
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | – | Register, returns `{ token, user }` |
| POST | `/api/auth/login` | – | Login, returns `{ token, user }` |
| GET | `/api/auth/me` | user | Current profile |
| PUT | `/api/auth/me` | user | Update name / addresses |

### Dishes
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/dishes` | – | Paginated list. Query: `cuisine, search, isVeg, minPrice, maxPrice, minRating, sort, page, limit` |
| GET | `/api/dishes/:id` | – | Single dish + reviews |
| GET | `/api/dishes/meta/cuisines` | – | Cuisines that have dishes |
| POST | `/api/dishes/:id/reviews` | user | Add a review |
| POST | `/api/dishes` | admin | Create dish |
| PUT | `/api/dishes/:id` | admin | Update dish |
| DELETE | `/api/dishes/:id` | admin | Delete dish |

### Orders
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/orders` | user | Create order (COD or verified Online) |
| GET | `/api/orders/me` | user | My order history |
| GET | `/api/orders/:id` | user/admin | Single order (owner or admin) |
| GET | `/api/orders` | admin | All orders (paginated) |
| PATCH | `/api/orders/:id/status` | admin | Update order status |

### Payments (mock gateway)
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/payments/create` | user | Create a payment session (server-priced) |
| POST | `/api/payments/mock-pay` | user | Simulate the gateway completing payment (`?fail=true` to fail) |
| POST | `/api/payments/verify` | user | Verify a completed payment signature |

## Security & engineering notes

- **Prices are computed server-side** (`utils/pricing.js`) from the DB — the client
  cannot tamper with the charged amount or add-on prices.
- **Validation** runs on every input via Zod (`middleware/validate.js`), in addition
  to Mongoose schema validation.
- **Security middleware:** `helmet`, scoped `cors` (no `*`), `express-mongo-sanitize`,
  global + per-route rate limiting, body size limits.
- **Errors** are normalized in one place (`middleware/errorHandler.js`) for Zod,
  Mongoose cast/validation/duplicate-key and JWT errors.
- **Payments** use a self-contained mock gateway so the app runs with no external
  accounts. Swap in Stripe/Razorpay inside `services/paymentService.js` — the
  controller/UI contract stays identical.

Default seeded admin (change in `.env`): `admin@flavorhub.test` / `Admin@12345`.
