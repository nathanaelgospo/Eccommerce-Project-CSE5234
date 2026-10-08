import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ShippingEntry = () => {
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

  const [shippingData, setShippingData] = useState({
    name: initialOrder.name || '',
    address_1: initialOrder.address_1 || '',
    address_2: initialOrder.address_2 || '',
    city: initialOrder.city || '',
    state: initialOrder.state || '',
    zip: initialOrder.zip || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedOrder = {
      ...initialOrder,
      ...shippingData,
    };
    navigate('/purchase/viewOrder', { state: { order: updatedOrder } });
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
          <span className="step-item done">1. Payment</span>
          <span className="step-sep">&gt;</span>
          <span className="step-item active">2. Shipping</span>
          <span className="step-sep">&gt;</span>
          <span className="step-item">3. Review</span>
        </div>
      </header>

      <div className="checkout-card-box">
        <h2 className="checkout-title">Shipping Address</h2>
        <p className="checkout-sub">Where should we deliver your order?</p>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="field-group">
            <label htmlFor="name">Recipient Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Full Name"
              value={shippingData.name}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label htmlFor="address_1">Street Address</label>
            <input
              id="address_1"
              name="address_1"
              type="text"
              required
              placeholder="Address line 1"
              value={shippingData.address_1}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label htmlFor="address_2">Apartment, suite, etc. (Optional)</label>
            <input
              id="address_2"
              name="address_2"
              type="text"
              placeholder="Address line 2"
              value={shippingData.address_2}
              onChange={handleChange}
            />
          </div>

          <div className="field-row-three">
            <div className="field-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                required
                placeholder="City"
                value={shippingData.city}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                required
                maxLength="2"
                placeholder="State"
                value={shippingData.state}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label htmlFor="zip">ZIP / Postal</label>
              <input
                id="zip"
                name="zip"
                type="text"
                required
                placeholder="ZIP"
                value={shippingData.zip}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              className="btn-text-back"
              onClick={() => navigate('/purchase/paymentEntry', { state: { order: initialOrder } })}
            >
              &larr; Back to Payment
            </button>
            <button type="submit" className="btn-black-pill">
              Review Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingEntry;
