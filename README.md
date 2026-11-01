# groove™ E-Commerce Platform
**CSE 5234 – Distributed Enterprise Computing**  
A full-stack, 3-tier vinyl record store built with React, Python REST microservices, and an AWS RDS MySQL data tier.

---

## 3-Tier Architecture Overview

```
[ Presentation Tier ]       React SPA (Port 3000)
        │                   src/api/grooveApi.js
        ▼
[ Business Tier ]           Python REST Server (Port 5001) / AWS Lambda
        │                   ├── routes/   (HTTP request validation & dispatching)
        │                   └── services/ (Stock checks, transactions, order processing)
        ▼
[ Data Tier ]               AWS RDS MySQL (warehouse_db)
                            ITEM, CUSTOMER_ORDER, CUSTOMER_ORDER_LINE_ITEM,
                            PAYMENT_INFO, SHIPPING_INFO
```

---

## Quick Start (Running Locally)

### 1. Install Dependencies
```bash
# Frontend
npm install

# Backend
pip install pymysql
```

### 2. Run the System
Open two terminal tabs:

**Terminal 1 (Backend REST Server on port 5001):**
```bash
npm run start:backend
```

**Terminal 2 (Frontend React App on port 3000):**
```bash
npm start
```
Browser opens automatically at `http://localhost:3000`.

---

## Core Features Across Labs

### Presentation Tier (Labs 5–6)
- **Storefront & Catalog (`/purchase`)**: Browse 5 curated vinyl records with high-res artwork, dynamic pricing, live warehouse stock counts, and genre filtering.
- **Cart & Checkout Flow**: 
  - Slide-out cart drawer with real-time total calculation.
  - Payment entry (`/purchase/paymentEntry`) with cardholder name, card number, expiry, CVV, and customer email.
  - Shipping entry (`/purchase/shippingEntry`) with address validation.
  - Order review (`/purchase/viewOrder`) and confirmation receipt (`/purchase/viewConfirmation`).
- **State Management**: `OrderContext` with automatic stock syncing and session cleanup.

### Business Tier (Lab 7)
- **Inventory Service**:
  - `GET /api/albums` — Returns all albums with live warehouse inventory.
  - `GET /api/albums/:id` — Look up an album by ID.
  - `GET /api/albums/search?name={name}` — Search album by name.
- **Order Processing Service**:
  - `POST /api/orders` — Validates items against available stock, creates atomic order records, and decrements inventory.
  - Graceful edge handling: Rejects insufficient stock requests with `400 Bad Request`.

### Data Tier (Lab 8)
Live AWS RDS MySQL database (`warehouse_db`) with relational integrity and cascade rules:
- **`ITEM`**: Album metadata, live available quantity, unit price, and image paths.
- **`CUSTOMER_ORDER`**: Master order tracking with foreign keys to payment and shipping.
- **`CUSTOMER_ORDER_LINE_ITEM`**: Individual items ordered (`ON DELETE CASCADE`).
- **`PAYMENT_INFO`**: Stored payment records (no order FK per guidelines).
- **`SHIPPING_INFO`**: Destination address and customer email.

---

## Running Backend Unit Tests

From the repository root:
```bash
python3 -m unittest discover -s backend/order_processing -p 'test_*.py'
```

---

## Project Structure

```
├── public/                 # Static assets & album cover images (/covers)
├── src/                    # Frontend Presentation Tier
│   ├── api/grooveApi.js    # REST API client
│   ├── components/         # React views (Home, Purchase, Checkout steps)
│   └── context/            # React Context (OrderContext.js)
├── backend/                # Backend Business & Data Access Tiers
│   ├── database/           # RDS MySQL connection factory
│   ├── routes/             # REST API endpoint handlers
│   ├── services/           # Inventory & Order business logic
│   ├── order_processing/   # AWS Lambda / SAM deployment template
│   └── server.py           # Local HTTP REST server (port 5001)
└── package.json
```
