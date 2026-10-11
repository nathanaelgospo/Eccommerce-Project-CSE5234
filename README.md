# CSE 5234 – Lab 5: Presentation Tier (E-Commerce Web Application)

## Project Overview
An e-commerce web application for **groove™**, a boutique vinyl records store. Built using React and React Router v6, featuring a modern minimalist presentation tier with persistent shopping cart management and a complete 5-step checkout flow.

---

## 5-Page Flow & Routes
1. **`/purchase`** — Catalog of 5 vinyl records with album artwork, pricing, interactive quantity steppers, genre & price filtering, and an editable slide-out shopping cart.
2. **`/purchase/paymentEntry`** — Payment form collecting Cardholder Name, Credit Card Number, Expiration Date (MM/YY), and CVV with active field validation.
3. **`/purchase/shippingEntry`** — Shipping form collecting Recipient Name, Street Address (`addressLine1`), Suite/Apt (`addressLine2`), City, 2-letter State, and ZIP code with active field validation.
4. **`/purchase/viewOrder`** — Order review and validation summary showing selected line items, quantities, subtotal/total cost, shipping destination, masked payment details, and edit links.
5. **`/purchase/viewConfirmation`** — Order receipt displaying a thank-you greeting, unique confirmation number, full order summary, and a button to continue shopping.

---

## State Management & Persistence
- Built with **React Context** (`OrderContext`), ensuring order details, shopping cart items, payment information, and shipping address persist across:
  - Navigation across all 5 pages
  - Browser Back and Forward buttons
  - Page reloads (`F5`) via `sessionStorage` backing

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Running the Application
```bash
npm start
```
The application will be available at [http://localhost:3000](http://localhost:3000) (automatically redirects `/` to `/purchase`).

### Building for Production
```bash
npm run build
```
Creates an optimized production bundle in the `build/` directory.
