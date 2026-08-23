# GETSY 2.0 Architecture

## 1. Project Overview

GETSY 2.0 is an AI-powered local shop discovery and smart commerce platform.

The platform connects customers with nearby local shops and products.

## 2. Main Architecture

Customer
   ↓
Frontend
   ↓
Backend API
   ↓
Database

Additional Services:

Frontend
   ├── Maps
   ├── AI Search
   └── Location Services

Backend
   ├── Authentication
   ├── Shop Management
   ├── Product Management
   ├── Search
   └── AI Integration

Database
   ├── Users
   ├── Shops
   ├── Products
   └── Customers

## 3. Team Responsibilities

Member 1:
Frontend development

Member 2:
Backend and API development

Member 3:
Database design and management

Member 4:
Integration, testing and documentation

## 4. Development Principle

Frontend communicates with backend through defined APIs.

Backend communicates with the database.

Frontend should NOT directly access the database.

## 5. Integration Flow

Frontend
    ↓
REST API
    ↓
Backend
    ↓
Database

Backend
    ↓
AI Services

Frontend
    ↓
Maps / Location Services
