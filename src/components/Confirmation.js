import React from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import Footer from './Footer';

const Confirmation = () => {
  const { order, resetOrder } = useOrder();

  const confirmationNumber = order.confirmationNumber;

  const selectedItems = (order.items || []).filter((item) => item.quantity > 0);
  const totalCost = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="checkout-page">
      <header className="checkout-minimal-header">
        <div className="checkout-logo">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span className="logo-text">groove<sup className="trade">TM</sup></span>
        </div>
      </header>

      <div className="checkout-card-box confirmation-container">
        <div className="minimal-check-circle">&#10003;</div>
        <h2 className="confirm-hero-title">Thank You, {order.name || 'Valued Customer'}!</h2>
        <p className="checkout-sub">
          Your order has been placed successfully and is being prepared for shipment.
        </p>

        <div className="order-number-tag">
          <span className="tag-label">Order Confirmation Number</span>
          <span className="tag-value">{confirmationNumber}</span>
        </div>

        <div className="confirmation-items-summary">
          <h3 className="panel-title" style={{ textAlign: 'left', marginBottom: '16px' }}>Summary of Your Purchase</h3>
          <div className="confirm-items-table">
            {selectedItems.map((item) => (
              <div key={item.id} className="confirm-item-row">
                {item.image && <img src={item.image} alt={item.name} className="confirm-item-thumb" />}
                <div className="confirm-item-info">
                  <strong>{item.name}</strong>
                  <span>Qty: {item.quantity}</span>
                </div>
                <div className="confirm-item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="confirm-grand-total">
            <span>Total Paid</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ marginTop: '36px' }}>
          <Link
            to="/purchase"
            className="btn-black-pill"
            style={{ textDecoration: 'none', display: 'inline-block' }}
            onClick={resetOrder}
          >
            Continue Shopping &rarr;
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Confirmation;
