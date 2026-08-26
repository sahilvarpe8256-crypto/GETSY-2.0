# GETSY 2.0 Database Schema

This document is the source of truth for the implemented GETSY 2.0 database.
All field definitions, types, validations, and indexes described here reflect
the current Mongoose models in `backend/models/`.

---

## Users

Collection: `users`

| Field          | Type     | Required | Default      | Notes                                      |
| -------------- | -------- | -------- | ------------ | ------------------------------------------ |
| `_id`          | ObjectId | auto     | auto         | MongoDB default primary key                |
| `name`         | String   | yes      | —            | Trimmed                                    |
| `email`        | String   | yes      | —            | Unique, lowercase, trimmed                 |
| `passwordHash` | String   | yes      | —            | Bcrypt hash, `select: false` by default    |
| `role`         | String   | no       | `"customer"` | Enum: `customer`, `owner`, `admin`         |
| `createdAt`    | Date     | auto     | auto         | Mongoose `timestamps: true`                |
| `updatedAt`    | Date     | auto     | auto         | Mongoose `timestamps: true`                |

### User behavior

- **Password hashing**: A `pre('save')` hook automatically hashes
  `passwordHash` with bcrypt (salt rounds: 10) whenever the field is modified.
  Plaintext passwords are never stored.
- **Password verification**: The `matchPassword(candidatePassword)` instance
  method compares a candidate password against the stored hash.
- **Query exclusion**: `passwordHash` uses `select: false`, so it is excluded
  from query results unless explicitly selected with `.select('+passwordHash')`.
- **Public serialization**: `toPublicJSON()` returns `{ id, name, email, role }`
  and never exposes `passwordHash`.

---

## Shops

Collection: `shops`

| Field          | Type     | Required | Default   | Notes                                              |
| -------------- | -------- | -------- | --------- | -------------------------------------------------- |
| `_id`          | ObjectId | auto     | auto      | MongoDB default primary key                        |
| `ownerId`      | ObjectId | yes      | —         | References `User._id`                              |
| `shopName`     | String   | yes      | —         | Trimmed                                            |
| `shopType`     | String   | yes      | —         | Trimmed                                            |
| `description`  | String   | no       | `""`      | Trimmed                                            |
| `phone`        | String   | no       | `""`      | Trimmed                                            |
| `image`        | String   | no       | `""`      | Trimmed                                            |
| `address`      | String   | no       | `""`      | Trimmed                                            |
| `area`         | String   | no       | `""`      | Trimmed                                            |
| `location`     | Object   | yes      | see below | GeoJSON Point (see Location section)               |
| `verified`     | Boolean  | no       | `false`   | Shop verification status                           |
| `createdAt`    | Date     | auto     | auto      | Mongoose `timestamps: true`                        |
| `updatedAt`    | Date     | auto     | auto      | Mongoose `timestamps: true`                        |

### Shop behavior

- **Owner relationship**: `ownerId` is an ObjectId reference (`ref: 'User'`).
  Every shop must be associated with an existing User.
- **Geospatial index**: A `2dsphere` index is defined on `location` to support
  MongoDB geospatial queries such as `$nearSphere`.
- **Public serialization**: `toPublicJSON()` returns all public fields with
  `_id` mapped to `id` and `ownerId` serialized as a string.

---

## Products

Collection: `products`

| Field         | Type     | Required | Default | Notes                                        |
| ------------- | -------- | -------- | ------- | -------------------------------------------- |
| `_id`         | ObjectId | auto     | auto    | MongoDB default primary key                  |
| `shopId`      | ObjectId | yes      | —       | References `Shop._id`                        |
| `name`        | String   | yes      | —       | Trimmed                                      |
| `category`    | String   | yes      | —       | Trimmed                                      |
| `description` | String   | no       | `""`    | Trimmed                                      |
| `price`       | Number   | yes      | —       | Minimum: `0`                                 |
| `image`       | String   | no       | `""`    | Trimmed                                      |
| `stock`       | Number   | no       | `0`     | Minimum: `0`, must be an integer             |
| `available`   | Boolean  | no       | `true`  | Product availability flag                    |
| `createdAt`   | Date     | auto     | auto    | Mongoose `timestamps: true`                  |
| `updatedAt`   | Date     | auto     | auto    | Mongoose `timestamps: true`                  |

### Product behavior

- **Shop relationship**: `shopId` is an ObjectId reference (`ref: 'Shop'`).
  Every product must be associated with an existing Shop.
- **Price validation**: Price cannot be negative (`min: 0`).
- **Stock validation**: Stock cannot be negative (`min: 0`) and must be an
  integer (`Number.isInteger` validator).
- **Public serialization**: `toPublicJSON()` returns all public fields with
  `_id` mapped to `id` and `shopId` serialized as a string.

---

## Relationships

```
User
  |
  | ownerId
  ↓
Shop
  |
  | shopId
  ↓
Product
```

- A **User** (with role `owner` or `admin`) can own zero or more **Shops**.
- A **Shop** has exactly one owner (via `ownerId`).
- A **Shop** contains zero or more **Products**.
- A **Product** belongs to exactly one **Shop** (via `shopId`).

---

## GeoJSON Location

Shop location uses the GeoJSON Point format:

```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

- `type` must be `"Point"` (enforced by schema enum, defaults to `"Point"`).
- `coordinates` is a required array of two numbers: `[longitude, latitude]`.
- Longitude must be between `-180` and `180`.
- Latitude must be between `-90` and `90`.

The `2dsphere` index on `location` enables MongoDB geospatial queries such as
`$nearSphere` for nearby-shop discovery.

---

## Indexes

| Collection | Field(s)   | Type       | Notes                              |
| ---------- | ---------- | ---------- | ---------------------------------- |
| `users`    | `email`    | unique     | Enforced by Mongoose schema        |
| `shops`    | `location` | `2dsphere` | Enables geospatial queries         |

---

## Security Rules

1. **Password hashing**: Passwords are hashed with bcrypt before storage.
   Plaintext passwords are never persisted.
2. **Query exclusion**: `passwordHash` is excluded from query results by
   default (`select: false`).
3. **Environment variables**: Sensitive credentials (`MONGO_URI`, `JWT_SECRET`)
   must be stored in environment variables, not in source code.
4. **No `.env` commits**: The `.env` file must never be committed to version
   control.
5. **Token storage**: Authentication tokens (JWT) are not stored in the
   database; they are issued on login and verified on each request.

---

## Seed Data Behavior

The seed script (`database/seed.js`) populates demo data for development.

- It creates a fixed set of demo users, shops, and products.
- Before inserting, it removes only its own previously seeded demo data
  identified by known demo email addresses.
- It **never** uses `deleteMany({})` or any equivalent destructive operation
  that would wipe the entire collection.
- Seed data is idempotent: running the seed multiple times produces the same
  result without duplicating data.

---

## Development Database Expectations

- Local development uses MongoDB on `localhost:27017` with database name `getsy`.
- The connection URI is configured via `MONGO_URI` in `backend/.env`.
- If `MONGO_URI` is not set, the seed and verify scripts fall back to
  `mongodb://localhost:27017/getsy`.
- MongoDB must be running before executing the seed or verify scripts.
- The backend application is the only access layer to the database.
  Frontend must never connect to MongoDB directly.
