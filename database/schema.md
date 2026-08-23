# GETSY 2.0 Database Schema

## Users

Collection: users

Fields:

- _id
- name
- email
- passwordHash
- role
- createdAt
- updatedAt

Roles:

- customer
- owner
- admin

---

## Shops

Collection: shops

Fields:

- _id
- ownerId
- shopName
- shopType
- description
- phone
- image
- address
- area
- location
- verified
- createdAt
- updatedAt

Relationship:

ownerId references a User.

---

## Products

Collection: products

Fields:

- _id
- shopId
- name
- category
- description
- price
- image
- stock
- available
- createdAt
- updatedAt

Relationship:

shopId references a Shop.

---

# Relationships

User
  |
  | ownerId
  ↓
Shop
  |
  | shopId
  ↓
Product

---

# Location

Shop location must contain geographic coordinates.

Initial structure:

{
  "latitude": 19.57,
  "longitude": 74.21
}

The final geospatial representation will be finalized before implementation of nearby-shop queries.

---

# Security

Passwords must never be stored as plain text.

Use password hashing.

Authentication tokens must not be stored in the database as plain-text secrets unnecessarily.

Environment variables must contain sensitive credentials.

Never commit .env files.
