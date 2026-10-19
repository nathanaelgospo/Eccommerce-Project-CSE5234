
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useOrder } from '../context/OrderContext';

const Home = () => {
  const { order, inventoryLoading, inventoryError } = useOrder();
  const products = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Banner Section */}
      <section className="home-hero">
        <div className="hero-content">
          <span className="hero-badge">Curated Vinyl Catalog</span>
          <h1 className="hero-heading">Classic Sound. Pure Vinyl.</h1>
          <p className="hero-text">
            A focused collection of essential albums, pressed on high-grade vinyl and delivered with care.
          </p>
          <div className="hero-actions">
            <Link to="/purchase" className="btn-black-pill">
              Browse Records &rarr;
            </Link>
            <Link to="/about" className="btn-outline-pill">
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Perks */}
      <section className="perks-container">
        <div className="perks-grid">
          <div className="perk-card">
            <span className="perk-label">01 / Pressing</span>
            <h3>180g Heavyweight Vinyl</h3>
            <p>Pressed on virgin vinyl for reduced noise and long-term durability.</p>
          </div>
          <div className="perk-card">
            <span className="perk-label">02 / Transit</span>
            <h3>Reinforced Mailers</h3>
            <p>Shipped in rigid LP mailers to prevent corner dings and sleeve splits.</p>
          </div>
          <div className="perk-card">
            <span className="perk-label">03 / Audio</span>
            <h3>Original Master Audio</h3>
            <p>Sourced from high-fidelity analog masters for warm, accurate dynamics.</p>
          </div>
          <div className="perk-card">
            <span className="perk-label">04 / Support</span>
            <h3>30-Day Guarantee</h3>
            <p>Prompt replacement or full refund if your record arrives with defects.</p>
          </div>
        </div>
      </section>

      {/* Featured Catalog Preview */}
      <section className="home-featured-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Featured Albums</h2>
            <p className="section-subtitle">A selection of staples currently in stock</p>
          </div>
          <Link to="/purchase" className="view-all-link">View all &rarr;</Link>
        </div>

        <div className="product-grid-chanta" style={{ padding: '0', backgroundColor: 'transparent' }}>
          {inventoryLoading ? (
            <p>Loading featured albums...</p>
          ) : inventoryError ? (
            <p role="alert">Inventory unavailable: {inventoryError}</p>
          ) : (
            products.slice(0, 4).map((item) => (
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
                  <div className="item-order-actions" style={{ marginTop: 'auto' }}>
                    <Link
                      to="/purchase"
                      className="btn-black-pill"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        textAlign: 'center',
                        textDecoration: 'none',
                        padding: '9px 16px',
                        fontSize: '0.85rem'
                      }}
                    >
                      View in Store &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link
            to="/purchase"
            className="btn-black-pill"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            Open Catalog
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
