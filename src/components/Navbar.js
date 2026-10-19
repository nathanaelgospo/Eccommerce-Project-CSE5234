import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';

const Navbar = ({ onOpenCart }) => {
  const location = useLocation();
  const { order } = useOrder();

  const selectedItems = (order.items || []).filter((item) => item.quantity > 0);
  const totalItemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="chanta-nav">
      <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        <span className="logo-text">groove<sup className="trade">TM</sup></span>
      </Link>

      <nav className="nav-center">
        <Link to="/" className={location.pathname === '/' ? 'active-nav' : ''}>Home</Link>
        <Link to="/purchase" className={location.pathname === '/purchase' ? 'active-nav' : ''}>Store</Link>
        <Link to="/about" className={location.pathname === '/about' ? 'active-nav' : ''}>About Us</Link>
        <Link to="/contact" className={location.pathname === '/contact' ? 'active-nav' : ''}>Contact Us</Link>
      </nav>

      <div className="nav-right">
        {onOpenCart ? (
          <button className="cart-badge-btn" onClick={onOpenCart}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Cart {totalItemCount}</span>
          </button>
        ) : (
          <Link to="/purchase" className="cart-badge-btn" style={{ textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Cart {totalItemCount}</span>
          </Link>
        )}
        <span className="account-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          My account
        </span>
      </div>
    </header>
  );
};

export default Navbar;

