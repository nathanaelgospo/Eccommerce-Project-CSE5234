import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder, CATALOG_ITEMS } from '../context/OrderContext';
import Navbar from './Navbar';
import Footer from './Footer';

const Purchase = () => {
  const navigate = useNavigate();
  const { order, updateQuantity, addToCart } = useOrder();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');

  const genres = ['All Genres', 'Rock', 'Progressive Rock', 'Jazz', 'Pop / Rock', 'Electronic'];
  const priceRanges = [
    { label: 'All Prices', value: 'All' },
    { label: 'Under $35', value: 'under-35' },
    { label: '$35 - $40', value: '35-40' },
    { label: 'Over $40', value: 'over-40' },
  ];
  const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Name: A to Z'];

  const handleQuantityChange = (itemId, value) => {
    updateQuantity(itemId, value);
  };

  const handleAddToCart = (itemId) => {
    addToCart(itemId);
    setIsDrawerOpen(true);
  };

  const selectedItems = order.items.filter((item) => item.quantity > 0);
  const totalItemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Compute filtered and sorted items
  const filteredAndSortedItems = CATALOG_ITEMS.filter((item) => {
    // Genre filter
    if (selectedGenre !== 'All Genres' && item.genre !== selectedGenre) {
      return false;
    }
    // Price filter
    if (selectedPriceRange === 'under-35' && item.price >= 35) return false;
    if (selectedPriceRange === '35-40' && (item.price < 35 || item.price > 40)) return false;
    if (selectedPriceRange === 'over-40' && item.price <= 40) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Name: A to Z') return a.name.localeCompare(b.name);
    return a.id - b.id; // Featured
  });

  const handleProceedToPayment = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item before continuing.');
      return;
    }
    navigate('/purchase/paymentEntry', { state: { order } });
  };

  return (
    <div className="store-page">
      {/* Main Navigation Bar */}
      <Navbar onOpenCart={() => setIsDrawerOpen(true)} />

      {/* Main Hero Header */}
      <div className="store-hero">
        <span className="page-tag">Store Catalog</span>
        <h1 className="hero-title">Classic Vinyl Records</h1>
        <p className="hero-subtext">
          Browse timeless essentials on vinyl. Filter by genre, sort by price, add records to your cart, and proceed to checkout.
        </p>

        {/* Filter Pills Row */}
        <div className="filter-row" style={{ marginTop: '24px' }}>
          <div className="filter-group-left">
            <div className="pill-dropdown">
              <span className="pill-label">Genre</span>
              <select
                className="pill-select"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="pill-dropdown">
              <span className="pill-label">Price</span>
              <select
                className="pill-select"
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
              >
                {priceRanges.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-group-right">
            <div className="pill-dropdown">
              <span className="pill-label">Sort</span>
              <select
                className="pill-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="product-grid-chanta">
        {filteredAndSortedItems.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: '#666' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No albums match your filter criteria.</p>
            <button
              type="button"
              className="add-to-cart-action-btn"
              style={{ marginTop: '10px' }}
              onClick={() => {
                setSelectedGenre('All Genres');
                setSelectedPriceRange('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredAndSortedItems.map((item) => {
            const currentItemOrder = order.items.find((it) => it.id === item.id);
            const currentQty = currentItemOrder?.quantity || 0;
            return (
              <div key={item.id} className="chanta-card">
                <div className="product-img-wrapper">
                  <img src={item.image} alt={item.name} className="product-photo" />
                </div>

                <div className="chanta-card-details">
                  <div className="card-top-info">
                    <div className="genre-pill-tag">{item.genre}</div>
                    <h3 className="item-title">{item.name}</h3>
                    <p className="item-material">{item.subtitle}</p>
                    <p className="item-price">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="item-order-actions">
                    <div className="quantity-stepper">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => handleQuantityChange(item.id, Math.max(0, currentQty - 1))}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="stepper-input"
                        value={currentQty}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      />
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => handleQuantityChange(item.id, currentQty + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="add-to-cart-action-btn"
                      onClick={() => handleAddToCart(item.id)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slide-out Cart Drawer */}
      {isDrawerOpen && (
        <div className="cart-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Shopping Cart ({totalItemCount})</h3>
              <button className="close-drawer-btn" onClick={() => setIsDrawerOpen(false)}>✕</button>
            </div>

            <div className="drawer-body">
              {selectedItems.length === 0 ? (
                <div className="empty-cart-state">
                  <p>Your shopping bag is empty.</p>
                  <span className="empty-hint">Add items from the catalog to see them here.</span>
                </div>
              ) : (
                <div className="cart-line-items">
                  {order.items.map((item) => {
                    if (item.quantity === 0) return null;
                      return (
                        <div key={item.id} className="drawer-item">
                          <img src={item.image} alt={item.name} className="drawer-item-img" />
                          <div className="drawer-item-info">
                            <h4>{item.name}</h4>
                            <span className="drawer-item-price">${item.price.toFixed(2)}</span>
                            <div className="drawer-qty-row">
                              <label>Qty:</label>
                              <div className="quantity-stepper" style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
                                <button
                                  type="button"
                                  className="stepper-btn"
                                  onClick={() => handleQuantityChange(item.id, Math.max(0, item.quantity - 1))}
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  className="stepper-input"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                />
                                <button
                                  type="button"
                                  className="stepper-btn"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                className="remove-btn"
                                onClick={() => handleQuantityChange(item.id, 0)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="drawer-item-subtotal">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {selectedItems.length > 0 && (
              <div className="drawer-footer">
                <div className="drawer-subtotal">
                  <span>Subtotal</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  className="checkout-full-btn"
                  onClick={handleProceedToPayment}
                >
                  Checkout (${totalCost.toFixed(2)}) &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar if items in cart and drawer closed */}
      {!isDrawerOpen && selectedItems.length > 0 && (
        <div className="floating-cart-bar">
          <div className="floating-cart-content">
            <div>
              <strong>{totalItemCount} item{totalItemCount > 1 ? 's' : ''} in cart</strong>
              <span className="floating-total"> Total: ${totalCost.toFixed(2)}</span>
            </div>
            <div className="floating-actions">
              <button className="floating-view-cart-btn" onClick={() => setIsDrawerOpen(true)}>
                View Cart
              </button>
              <button className="floating-checkout-btn" onClick={handleProceedToPayment}>
                Proceed to Payment &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default Purchase;
