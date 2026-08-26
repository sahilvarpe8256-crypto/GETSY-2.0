# GETSY 2.0 — Database

This directory contains database tooling for the GETSY 2.0 project:
schema documentation, seed script, and verification script.

---

## Collections

| Collection | Description                    |
| ---------- | ------------------------------ |
| `users`    | Registered users and accounts  |
| `shops`    | Shop listings and locations    |
| `products` | Products belonging to shops    |

### Relationships

```
User  ──(ownerId)──▶  Shop  ──(shopId)──▶  Product
```

- A User (owner/admin) can own multiple Shops.
- A Shop belongs to one User and contains multiple Products.
- A Product belongs to one Shop.

### GeoJSON Convention

Shop locations are stored as GeoJSON Point objects:

```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

A `2dsphere` index on `location` enables geospatial queries.

For full field-level documentation, see [schema.md](schema.md).

---

## MongoDB Configuration

The database scripts load configuration from `backend/.env`:

```
MONGO_URI=mongodb://localhost:27017/getsy
```

If `MONGO_URI` is not set, the scripts fall back to
`mongodb://localhost:27017/getsy` for local development.

> **Warning:** Never commit the `.env` file to version control.
> It contains sensitive credentials.

---

## Seed Script

Populates the database with demo data for development.

```bash
node database/seed.js
```

### Demo Accounts

| Email                    | Password          | Role     |
| ------------------------ | ----------------- | -------- |
| `demo.owner@getsy.com`  | `DemoOwner123!`   | owner    |
| `demo.customer@getsy.com` | `DemoCustomer123!` | customer |

### Demo Shops

- **Urban Style Fashion** — Fashion (Pune area)
- **Tech Corner** — Electronics (Pune area)

### Demo Products

- Black Casual Shirt, Blue Denim Jeans (Urban Style Fashion)
- Wireless Earbuds, USB-C Charging Cable (Tech Corner)

### Safety

- The seed removes **only** its own previously created demo data before
  re-seeding. It never wipes entire collections.
- Running the seed multiple times is safe (idempotent).

> **Warning:** Seed data is for development and demo purposes only.
> Do not use demo credentials in production.

---

## Verification Script

Performs read-only checks on the database. Never modifies any data.

```bash
node database/verify.js
```

The script verifies:

1. **Database integrity** — valid roles, emails, bcrypt hashes, owner
   references, GeoJSON locations, coordinate ranges, geospatial index,
   shop references, price/stock constraints, availability flags.
2. **Demo seed presence** — confirms the expected demo users, shops, and
   products exist by their identifying fields.

Exit code `0` = all checks passed. Exit code `1` = failures detected.

---

## Architecture Note

```
Frontend  ──▶  Backend API  ──▶  MongoDB
```

- The **backend** is the only database access layer.
- The **frontend** must never connect to MongoDB directly.
- All database operations go through the backend API routes and controllers.
