import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';

const PaymentEntry = () => {
  const navigate = useNavigate();
  const { order, updatePaymentInfo } = useOrder();

  const [paymentData, setPaymentData] = useState({
    credit_card_number: order.credit_card_number || '',
    expir_date: order.expir_date || '',
    cvvCode: order.cvvCode || '',
    card_holder_name: order.card_holder_name || '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};

    // Cardholder Name: at least 2 chars, letters and spaces
    if (!paymentData.card_holder_name.trim()) {
      errs.card_holder_name = 'Cardholder name is required.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(paymentData.card_holder_name.trim())) {
      errs.card_holder_name = 'Please enter a valid cardholder name.';
    }

    // Card Number: 13-19 digits
    const cleanCard = paymentData.credit_card_number.replace(/\s+/g, '');
    if (!cleanCard) {
      errs.credit_card_number = 'Credit card number is required.';
    } else if (!/^\d{13,19}$/.test(cleanCard)) {
      errs.credit_card_number = 'Enter a valid 13-19 digit card number.';
    }

    // Expiration Date: MM/YY, valid future date
    if (!paymentData.expir_date.trim()) {
      errs.expir_date = 'Expiration date is required.';
    } else {
      const match = paymentData.expir_date.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
      if (!match) {
        errs.expir_date = 'Format must be MM/YY.';
      } else {
        const month = parseInt(match[1], 10);
        const year = 2000 + parseInt(match[2], 10);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          errs.expir_date = 'Card is expired.';
        }
      }
    }

    // CVV: 3 or 4 digits
    if (!paymentData.cvvCode.trim()) {
      errs.cvvCode = 'CVV is required.';
    } else if (!/^\d{3,4}$/.test(paymentData.cvvCode.trim())) {
      errs.cvvCode = 'Enter 3 or 4 digits.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    updatePaymentInfo(paymentData);
    navigate('/purchase/shippingEntry');
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

        <form onSubmit={handleSubmit} className="modern-form" noValidate>
          <div className="field-group">
            <label htmlFor="card_holder_name">Cardholder Name</label>
            <input
              id="card_holder_name"
              name="card_holder_name"
              type="text"
              className={errors.card_holder_name ? 'input-error' : ''}
              placeholder="Full name as printed on card"
              value={paymentData.card_holder_name}
              onChange={handleChange}
            />
            {errors.card_holder_name && (
              <span className="field-error-msg">{errors.card_holder_name}</span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="credit_card_number">Credit Card Number</label>
            <input
              id="credit_card_number"
              name="credit_card_number"
              type="text"
              className={errors.credit_card_number ? 'input-error' : ''}
              placeholder="1234 5678 9012 3456"
              value={paymentData.credit_card_number}
              onChange={handleChange}
            />
            {errors.credit_card_number && (
              <span className="field-error-msg">{errors.credit_card_number}</span>
            )}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="expir_date">Expiration Date</label>
              <input
                id="expir_date"
                name="expir_date"
                type="text"
                maxLength="5"
                className={errors.expir_date ? 'input-error' : ''}
                placeholder="MM/YY"
                value={paymentData.expir_date}
                onChange={handleChange}
              />
              {errors.expir_date && (
                <span className="field-error-msg">{errors.expir_date}</span>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="cvvCode">CVV</label>
              <input
                id="cvvCode"
                name="cvvCode"
                type="password"
                maxLength="4"
                className={errors.cvvCode ? 'input-error' : ''}
                placeholder="123"
                value={paymentData.cvvCode}
                onChange={handleChange}
              />
              {errors.cvvCode && (
                <span className="field-error-msg">{errors.cvvCode}</span>
              )}
            </div>
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              className="btn-text-back"
              onClick={() => navigate('/purchase')}
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
