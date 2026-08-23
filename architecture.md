# GETSY 2.0 Architecture

## 1. Overview

GETSY 2.0 is an AI-powered local shop discovery and smart commerce platform.

The platform connects customers with nearby local shops and products.

## 2. Core Technology Stack

### Frontend
- React
- Vite
- CSS / Tailwind CSS
- Browser Geolocation API

### Backend
- Node.js
- Express.js
- REST API
- JWT authentication
- bcrypt password hashing

### Database
- MongoDB
- Mongoose

### Advanced Services
- AI API for intelligent search
- Map service for location and map functionality

### Development
- Git
- GitHub
- VS Code / Antigravity

## 3. Architecture

Customer / Shop Owner
        ↓
React + Vite Frontend
        ↓
REST API
        ↓
Node.js + Express Backend
        ↓
MongoDB + Mongoose

Additional services:

Backend → AI Service
Frontend → Browser Geolocation
Frontend → Map Service

## 4. Important Architecture Rule

The frontend must never connect directly to MongoDB.

Correct:

Frontend → Backend → Database

Incorrect:

Frontend → Database

## 5. Team Responsibilities

### Member 1
Frontend

### Member 2
Backend and APIs

### Member 3
Database and data models

### Member 4
Integration, AI, testing and documentation

## 6. Main Data Models

Users
Shops
Products
Customers

Future models:

Orders
Reviews
Favorites
Search History

## 7. Development Principle

Each layer should have a clear responsibility.

Frontend:
Presentation and user interaction.

Backend:
Business logic and API communication.

Database:
Persistent data storage.

AI:
Natural-language understanding and intelligent search.

Maps:
Location visualization and geographic functionality.
