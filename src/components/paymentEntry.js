import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentEntry = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialOrder = location.state?.order || {
    items: [],
    credit_card_number: '',
    expir_date: '',
    cvvCode: '',
    card_holder_name: '',
    name: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    zip: '',
  };

  const [paymentData, setPaymentData] = useState({
    credit_card_number: initialOrder.credit_card_number || '',
    expir_date: initialOrder.expir_date || '',
    cvvCode: initialOrder.cvvCode || '',
    card_holder_name: initialOrder.card_holder_name || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedOrder = {
      ...initialOrder,
      ...paymentData,
    };
    navigate('/purchase/shippingEntry', { state: { order: updatedOrder } });
  };

  return (
    <div className="checkout-page">
      <header className="checkout-minimal-header">
        <div className="checkout-logo" onClick={() => navigate('/purchase')}>
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span className="logo-text">groove<sup className="trade">TM</sup></span>
        </div>
        <div className="checkout-steps">
          <span className="step-item active">1. Payment</span>
          <span className="step-sep">&gt;</span>
          <span className="step-item">2. Shipping</span>
          <span className="step-sep">&gt;</span>
          <span className="step-item">3. Review</span>
        </div>
      </header>

      <div className="checkout-card-box">
        <h2 className="checkout-title">Payment Information</h2>
        <p className="checkout-sub">Enter your payment card details below.</p>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="field-group">
            <label htmlFor="card_holder_name">Cardholder Name</label>
            <input
              id="card_holder_name"
              name="card_holder_name"
              type="text"
              required
              placeholder="Full name as printed on card"
              value={paymentData.card_holder_name}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label htmlFor="credit_card_number">Credit Card Number</label>
            <input
              id="credit_card_number"
              name="credit_card_number"
              type="text"
              required
              placeholder="1234 5678 9012 3456"
              value={paymentData.credit_card_number}
              onChange={handleChange}
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="expir_date">Expiration Date</label>
              <input
                id="expir_date"
                name="expir_date"
                type="text"
                required
                placeholder="MM/YY"
                value={paymentData.expir_date}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label htmlFor="cvvCode">CVV</label>
              <input
                id="cvvCode"
                name="cvvCode"
                type="password"
                maxLength="4"
                required
                placeholder="123"
                value={paymentData.cvvCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              className="btn-text-back"
              onClick={() => navigate('/purchase', { state: { order: initialOrder } })}
            >
              &larr; Return to store
            </button>
            <button type="submit" className="btn-black-pill">
              Continue to Shipping
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentEntry;
