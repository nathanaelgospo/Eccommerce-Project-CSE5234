import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';

const ShippingEntry = () => {
  const navigate = useNavigate();
  const { order, updateShippingInfo } = useOrder();

  const [shippingData, setShippingData] = useState({
    name: order.name || '',
    address_1: order.addressLine1 || order.address_1 || '',
    address_2: order.addressLine2 || order.address_2 || '',
    city: order.city || '',
    state: order.state || '',
    zip: order.zip || '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};

    // Recipient Name
    if (!shippingData.name.trim()) {
      errs.name = 'Recipient name is required.';
    } else if (shippingData.name.trim().length < 2) {
      errs.name = 'Please enter a valid name.';
    }

    // Street Address
    if (!shippingData.address_1.trim()) {
      errs.address_1 = 'Street address is required.';
    }

    // City
    if (!shippingData.city.trim()) {
      errs.city = 'City is required.';
    } else if (!/^[a-zA-Z\s.-]+$/.test(shippingData.city.trim())) {
      errs.city = 'Enter a valid city name.';
    }

    // State (2 letters)
    if (!shippingData.state.trim()) {
      errs.state = 'State required.';
    } else if (!/^[a-zA-Z]{2}$/.test(shippingData.state.trim())) {
      errs.state = '2-letter code (e.g. OH).';
    }

    // ZIP Code (5 digits or ZIP+4)
    if (!shippingData.zip.trim()) {
      errs.zip = 'ZIP required.';
    } else if (!/^\d{5}(-\d{4})?$/.test(shippingData.zip.trim())) {
      errs.zip = '5 digits (e.g. 43210).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-capitalize state
    const processedValue = name === 'state' ? value.toUpperCase() : value;
    setShippingData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    updateShippingInfo(shippingData);
    navigate('/purchase/viewOrder');
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

        <form onSubmit={handleSubmit} className="modern-form" noValidate>
          <div className="field-group">
            <label htmlFor="name">Recipient Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className={errors.name ? 'input-error' : ''}
              placeholder="Full Name"
              value={shippingData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="field-error-msg">{errors.name}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="address_1">Street Address</label>
            <input
              id="address_1"
              name="address_1"
              type="text"
              className={errors.address_1 ? 'input-error' : ''}
              placeholder="Address line 1"
              value={shippingData.address_1}
              onChange={handleChange}
            />
            {errors.address_1 && (
              <span className="field-error-msg">{errors.address_1}</span>
            )}
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
                className={errors.city ? 'input-error' : ''}
                placeholder="City"
                value={shippingData.city}
                onChange={handleChange}
              />
              {errors.city && <span className="field-error-msg">{errors.city}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                maxLength="2"
                className={errors.state ? 'input-error' : ''}
                placeholder="OH"
                value={shippingData.state}
                onChange={handleChange}
              />
              {errors.state && <span className="field-error-msg">{errors.state}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="zip">ZIP / Postal</label>
              <input
                id="zip"
                name="zip"
                type="text"
                maxLength="10"
                className={errors.zip ? 'input-error' : ''}
                placeholder="43210"
                value={shippingData.zip}
                onChange={handleChange}
              />
              {errors.zip && <span className="field-error-msg">{errors.zip}</span>}
            </div>
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              className="btn-text-back"
              onClick={() => navigate('/purchase/paymentEntry')}
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
