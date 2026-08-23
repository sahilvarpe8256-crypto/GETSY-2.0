# GETSY 2.0 API Contract

This document defines how the frontend communicates with the backend.

## Base URL

Development:

http://localhost:5000/api

## Authentication

The backend will handle user authentication.

Frontend will send authentication requests to the backend.

## Shops

### Get nearby shops

GET /shops/nearby

Purpose:
Find shops near the customer's location.

### Get shop details

GET /shops/:id

Purpose:
Get complete information about a specific shop.

## Products

### Search products

GET /products/search

Purpose:
Search products available in local shops.

### Get product details

GET /products/:id

Purpose:
Get complete information about a product.

## Authentication

### Register

POST /auth/register

Purpose:
Create a new user or shop owner account.

### Login

POST /auth/login

Purpose:
Authenticate an existing user.

## Important Rule

Frontend developers must use the API endpoints defined here.

Backend developers must maintain these API contracts unless the team agrees to change them.

Any API change must be documented here.
