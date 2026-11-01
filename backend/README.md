# groove™ Backend Architecture (Lab 7 & Lab 8)

This directory contains the business logic, REST API routing, and data access layers for the **groove™** vinyl records e-commerce platform.

---

## Architecture Overview

The backend is organized into a clean 3-tier layered architecture:

```
backend/
├── routes/                  # ROUTE LAYER: HTTP endpoint definitions and request routing
│   ├── inventory_routes.py  # GET  /api/albums (catalog & live remaining stock)
│   └── order_routes.py      # POST /api/orders (submits and records customer orders)
│
├── services/                # SERVICE LAYER: Core business logic
│   ├── inventory_service.py # Reads warehouse inventory directly from database
│   └── order_service.py     # Validates quantities, decrements stock, records transactions
│
├── database/                # DATA ACCESS LAYER: Database connectivity
│   └── db_connection.py     # AWS RDS MySQL connection manager (warehouse_db)
│
├── order_processing/        # AWS Lambda serverless deployment package
│   ├── lambda_function.py   # AWS Lambda entry point (invokes order_routes)
│   ├── template.yaml        # AWS SAM CloudFormation infrastructure template
│   └── test_lambda_function.py # Unit tests for the microservice
│
├── server.py                # Local REST API server (runs on port 5001)
└── README.md                # This documentation file
```

---

## REST API Endpoints

### 1. `GET /api/albums`
- **Route Handler**: `routes/inventory_routes.py`
- **Service**: `services/inventory_service.py`
- **Description**: Returns the list of albums with current warehouse stock levels (`AVAILABLE_QUANTITY`) fetched from the `ITEM` table.
- **Example Response**:
  ```json
  [
    {
      "id": 1,
      "itemNumber": 1001,
      "name": "Abbey Road",
      "subtitle": "The Beatles",
      "genre": "Rock",
      "price": 34.99,
      "image": "/covers/abbey-road.jpg",
      "stock": 18
    }
  ]
  ```

### 2. `GET /api/albums/:id`
- **Route Handler**: `routes/inventory_routes.py`
- **Service**: `services/inventory_service.py`
- **Description**: Returns a single album by primary key ID or item number.
- **Example**: `GET /api/albums/2` -> The Dark Side of the Moon

### 3. `GET /api/albums/search?name={albumName}`
- **Route Handler**: `routes/inventory_routes.py`
- **Service**: `services/inventory_service.py`
- **Description**: Searches and returns a single album by name.
- **Example**: `GET /api/albums/search?name=Rumours` -> Rumours

### 4. `POST /api/orders`
- **Route Handler**: `routes/order_routes.py`
- **Service**: `services/order_service.py`
- **Description**: Validates that ordered items do not exceed warehouse stock. In an atomic transaction, it inserts records into:
  1. `PAYMENT_INFO`
  2. `SHIPPING_INFO`
  3. `CUSTOMER_ORDER`
  4. `CUSTOMER_ORDER_LINE_ITEM`
  5. Decrements `ITEM.AVAILABLE_QUANTITY`
- **Example Request**:
  ```json
  {
    "items": [{"id": 1, "quantity": 1}],
    "payment": {
      "card_holder_name": "Jane Doe",
      "credit_card_number": "4111222233334444",
      "expir_date": "12/28",
      "cvvCode": "123"
    },
    "shipping": {
      "name": "Jane Doe",
      "address_1": "2015 Neil Ave",
      "city": "Columbus",
      "state": "OH",
      "zip": "43210",
      "email": "jane@example.com"
    }
  }
  ```
- **Example Response**:
  ```json
  {
    "confirmationNumber": "CH-000004"
  }
  ```

---

## Database Schema (`warehouse_db` on AWS RDS MySQL)

1. **`ITEM`** — Stores product details, price, warehouse inventory, and cover image path (`ID`, `ITEM_NUMBER`, `NAME`, `DESCRIPTION`, `AVAILABLE_QUANTITY`, `UNIT_PRICE`, `IMAGE_URL`).
2. **`CUSTOMER_ORDER`** — Master order records (`ID`, `CUSTOMER_NAME`, `CUSTOMER_EMAIL`, `STATUS`, foreign keys).
3. **`CUSTOMER_ORDER_LINE_ITEM`** — Line item details for each order (`ID`, `ITEM_NUMBER`, `ITEM_NAME`, `QUANTITY`, `CUSTOMER_ORDER_ID_FK`).
4. **`PAYMENT_INFO`** — Cardholder name, masked card number, expiration, and CVV.
5. **`SHIPPING_INFO`** — Delivery address, city, state, postal code, and email.

---

## Setup & Running the Application

Everything is configured out of the box to connect directly to the live AWS RDS database (`lab8-database.cz6cmg22wmo5.us-east-2.rds.amazonaws.com`).

### 1. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies (pymysql)
pip install pymysql
```

### 2. Start the Backend REST API Server
```bash
npm run start:backend
# Starts the HTTP server on http://localhost:5001
```

### 3. Start the Frontend Application (in a separate terminal)
```bash
npm start
# Launches the React application on http://localhost:3000
```

---

## Running Backend Unit Tests

```bash
python3 -m unittest discover -s backend/order_processing -p 'test_*.py'
```

