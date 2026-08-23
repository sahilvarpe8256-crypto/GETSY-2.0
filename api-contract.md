# GETSY 2.0 API Contract

## Base URL

Development:

http://localhost:5000/api

Production URL will be added later.

---

# Authentication

## Register

POST /auth/register

Request:

{
  "name": "Sahil",
  "email": "user@example.com",
  "password": "password",
  "role": "customer"
}

Response:

{
  "user": {
    "id": "...",
    "name": "Sahil",
    "email": "user@example.com",
    "role": "customer"
  },
  "token": "..."
}

---

## Login

POST /auth/login

Request:

{
  "email": "user@example.com",
  "password": "password"
}

Response:

{
  "user": {
    "id": "...",
    "name": "Sahil",
    "email": "user@example.com",
    "role": "customer"
  },
  "token": "..."
}

---

## Current User

GET /auth/me

Authentication:

Bearer token required.

---

# Shops

## Get Shops

GET /shops

Purpose:

Retrieve shops.

---

## Get Shop

GET /shops/:id

Purpose:

Retrieve one shop.

---

## Nearby Shops

GET /shops/nearby

Query parameters:

latitude
longitude
radius

Example:

GET /shops/nearby?latitude=19.57&longitude=74.21&radius=5

Purpose:

Find shops near the customer.

---

## Create Shop

POST /shops

Authentication:

Owner required.

---

## Update Shop

PUT /shops/:id

Authentication:

Shop owner required.

---

# Products

## Get Products

GET /products

Optional query parameters:

shopId
category
search

---

## Get Product

GET /products/:id

---

## Search Products

GET /products/search

Example:

GET /products/search?query=black%20shoes

---

## Create Product

POST /products

Authentication:

Shop owner required.

---

## Update Product

PUT /products/:id

Authentication:

Shop owner required.

---

## Delete Product

DELETE /products/:id

Authentication:

Shop owner required.

---

# AI Search

## Intelligent Search

POST /search/ai

Request:

{
  "query": "I need black formal shoes under 2000 near me",
  "latitude": 19.57,
  "longitude": 74.21
}

The AI service should convert the natural language query into structured search information.

Example:

{
  "category": "footwear",
  "keywords": ["black", "formal"],
  "maxPrice": 2000,
  "latitude": 19.57,
  "longitude": 74.21
}

The backend then performs the actual database search.

Important:

AI must NOT directly access MongoDB.

---

# Standard Error Format

All API errors should follow a consistent structure.

Example:

{
  "error": "Human-readable error message"
}

---

# Authentication Rules

Protected endpoints use:

Authorization: Bearer <token>

The backend is responsible for validating the token.

---

# Frontend / Backend Rule

Frontend communicates with backend only through the documented API.

Frontend must not directly access MongoDB.

---

# API Change Rule

If an endpoint, request format, response format, or field changes:

1. Update this document.
2. Inform the affected team member.
3. Test the affected functionality.
4. Review the Pull Request before merging.
