import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="global-footer">
      <div className="footer-top">
        <div className="footer-col branding-col">
          <div className="nav-logo" style={{ marginBottom: '12px' }}>
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <span className="logo-text">groove<sup className="trade">TM</sup></span>
          </div>
          <p className="footer-bio">
            Curating high-fidelity audiophile pressings, timeless master recordings, and iconic vinyl records for genuine music lovers.
          </p>
          <p className="footer-location">Columbus, OH • CSE 5234 Distributed Enterprise Computing</p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/purchase">Record Catalog</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Customer Care</h4>
          <ul className="footer-links">
            <li><Link to="/contact">30-Day Hassle-Free Returns</Link></li>
            <li><Link to="/contact">Vinyl Safe-Transit Guarantee</Link></li>
            <li><Link to="/contact">Track Your Order</Link></li>
            <li><Link to="/contact">Frequently Asked Questions</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Contact & Support</h4>
          <p className="footer-contact-item"><strong>Email:</strong> support@groovevinyl.com</p>
          <p className="footer-contact-item"><strong>Hours:</strong> Mon – Fri: 9am – 6pm EST</p>
          <p className="footer-contact-item"><strong>Office:</strong> 2015 Neil Ave, Columbus, OH 43210</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} groove™ Vinyl Records Inc. All rights reserved. Built for CSE 5234.</p>
        <div className="footer-legal">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Shipping Policy</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

