import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    topic: 'return',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'What is your return policy for defective records?',
      a: 'We offer a 30-day replacement policy. If your record arrives warped, skips, or has sleeve damage, contact us for a free replacement or full refund.',
    },
    {
      q: 'How do I start an exchange or return?',
      a: 'Submit the form below or email support@groovevinyl.com with your order number. We will send a prepaid USPS return label.',
    },
    {
      q: 'How long does shipping take?',
      a: 'Orders are processed in 1 to 2 business days and typically arrive within 3 to 5 business days via standard media mail.',
    },
    {
      q: 'Can I change my delivery address after ordering?',
      a: 'Contact us within 1 hour of placing your order and we will update the shipping label before carrier hand-off.',
    },
  ];

  return (
    <div className="contact-page">
      <Navbar />

      <div className="page-header-banner">
        <div className="banner-content">
          <span className="page-tag">Support & Care</span>
          <h1 className="page-hero-title">Customer Support</h1>
          <p className="page-hero-sub">
            Assistance with orders, returns, and catalog questions. Reach our Columbus support desk below.
          </p>
        </div>
      </div>

      <div className="content-wrap">
        {/* Support Channels */}
        <div className="support-channels-grid">
          <div className="channel-card">
            <span className="channel-tag">Email</span>
            <h3>support@groovevinyl.com</h3>
            <p>Direct inquiries to our support team.</p>
            <span className="channel-meta">Replies within 24 hours</span>
          </div>

          <div className="channel-card">
            <span className="channel-tag">Phone</span>
            <h3>(614) 292-6446</h3>
            <p>Order assistance and questions.</p>
            <span className="channel-meta">Mon – Fri: 9am – 5pm EST</span>
          </div>

          <div className="channel-card">
            <span className="channel-tag">Location</span>
            <h3>The Ohio State University</h3>
            <p>Columbus, OH 43210</p>
            <span className="channel-meta">Fulfillment Hub</span>
          </div>
        </div>

        {/* Return & Warranty Policy */}
        <section className="policy-card">
          <span className="card-kicker">After-Sale Policy</span>
          <h2>30-Day Return & Replacement Guarantee</h2>
          <p className="policy-intro">
            We want every record to spin cleanly. If an issue arises with your delivery, we handle returns quickly:
          </p>

          <div className="policy-grid">
            <div className="policy-item">
              <h4>1. Defect Replacements</h4>
              <p>Replacements provided for audio defects, surface noise issues, or jacket damage caused in transit.</p>
            </div>
            <div className="policy-item">
              <h4>2. Prepaid Labels</h4>
              <p>We provide a prepaid shipping label so you never pay out of pocket for defective returns.</p>
            </div>
            <div className="policy-item">
              <h4>3. 48-Hour Refunds</h4>
              <p>Refunds are initiated to your original payment method within two business days of return receipt.</p>
            </div>
          </div>
        </section>

        {/* FAQs & Contact Form */}
        <div className="faq-form-row">
          <div className="faq-col">
            <span className="card-kicker">Help Topics</span>
            <h2 className="section-heading">Frequently Asked Questions</h2>

            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-card">
                  <h4 className="faq-question">{faq.q}</h4>
                  <p className="faq-answer">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="form-col">
            <div className="support-form-card">
              <span className="card-kicker">Direct Inquiry</span>
              <h2>Send a Message</h2>
              <p className="form-sub">We will respond directly to your email address.</p>

              {submitted ? (
                <div className="form-success-box">
                  <h3>Message Sent</h3>
                  <p>
                    Thank you, <strong>{formData.name}</strong>. Your inquiry has been received. We will respond to <strong>{formData.email}</strong> shortly.
                  </p>
                  <button
                    type="button"
                    className="btn-black-pill"
                    style={{ marginTop: '14px' }}
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', orderNumber: '', topic: 'return', message: '' });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="support-form">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="orderNumber">Order Number (optional)</label>
                    <input
                      type="text"
                      id="orderNumber"
                      name="orderNumber"
                      placeholder="e.g. 749201"
                      value={formData.orderNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="topic">Topic</label>
                    <select
                      id="topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                    >
                      <option value="return">Return or Defective Record</option>
                      <option value="shipping">Shipping & Delivery Inquiries</option>
                      <option value="payment">Payment & Billing</option>
                      <option value="general">General Inquiries</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      required
                      placeholder="How can we help?"
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-black-pill" style={{ width: '100%', justifyContent: 'center' }}>
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
