import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';

const ViewOrder = () => {
  const navigate = useNavigate();
  const { order, completeOrder } = useOrder();

  const selectedItems = (order.items || []).filter((item) => item.quantity > 0);
  const totalCost = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const maskedCard = order.credit_card_number
    ? `•••• •••• •••• ${order.credit_card_number.slice(-4)}`
    : 'N/A';

  const handleConfirmOrder = () => {
    completeOrder();
    navigate('/purchase/viewConfirmation');
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
          <span className="step-item done">2. Shipping</span>
          <span className="step-sep">&gt;</span>
          <span className="step-item active">3. Review</span>
        </div>
      </header>

      <div className="checkout-card-box wide-review">
        <h2 className="checkout-title">Review & Validate Order</h2>
        <p className="checkout-sub">Please verify your order and delivery details before confirmation.</p>

        <div className="review-sections-grid">
          {/* Items Summary */}
          <div className="review-panel">
            <h3 className="panel-title">Selected Items</h3>
            {selectedItems.length === 0 ? (
              <p className="empty-hint">No items selected.</p>
            ) : (
              <div className="review-items-list">
                {selectedItems.map((item) => (
                  <div key={item.id} className="review-item-row">
                    {item.image && <img src={item.image} alt={item.name} className="review-item-thumb" />}
                    <div className="review-item-meta">
                      <h4>{item.name}</h4>
                      <p className="subtext">{item.subtitle}</p>
                      <span>Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                    </div>
                    <div className="review-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="review-total-row">
              <span>Total Cost</span>
              <span className="grand-total-amount">${totalCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="review-side-column">
            <div className="review-panel">
              <div className="panel-header-row">
                <h3 className="panel-title">Shipping To</h3>
                <button
                  type="button"
                  className="btn-link-edit"
                  onClick={() => navigate('/purchase/shippingEntry', { state: { order } })}
                >
                  Edit
                </button>
              </div>
              <p className="info-bold">{order.name || 'Not provided'}</p>
              <p className="info-text">{order.addressLine1 || order.address_1}</p>
              {(order.addressLine2 || order.address_2) && (
                <p className="info-text">{order.addressLine2 || order.address_2}</p>
              )}
              <p className="info-text">{order.city ? `${order.city}, ${order.state} ${order.zip}` : ''}</p>
            </div>

            <div className="review-panel" style={{ marginTop: '16px' }}>
              <div className="panel-header-row">
                <h3 className="panel-title">Payment Method</h3>
                <button
                  type="button"
                  className="btn-link-edit"
                  onClick={() => navigate('/purchase/paymentEntry')}
                >
                  Edit
                </button>
              </div>
              <p className="info-bold">{order.card_holder_name || 'Cardholder'}</p>
              <p className="info-text">{maskedCard}</p>
              <p className="info-text">Exp: {order.expir_date || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="checkout-actions" style={{ marginTop: '32px' }}>
          <button
            type="button"
            className="btn-text-back"
            onClick={() => navigate('/purchase/shippingEntry')}
          >
            &larr; Back to Shipping
          </button>
          <button
            type="button"
            className="btn-black-pill"
            disabled={selectedItems.length === 0}
            onClick={handleConfirmOrder}
          >
            Confirm & Place Order &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
