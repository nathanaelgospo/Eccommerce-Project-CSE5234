import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const About = () => {
  const team = [
    {
      name: 'Nathanael Gospodinov',
      title: 'Lead Developer & Architecture',
      education: 'The Ohio State University — Computer Science & Engineering',
      bio: 'Focused on application architecture, routing structure, and end-to-end checkout flow development.',
      initials: 'NG',
    },
    {
      name: 'Andrew Mack',
      title: 'Full-Stack Developer & Systems',
      education: 'The Ohio State University — Computer Science & Engineering',
      bio: 'Focused on client state persistence, data models, and component integration across the store.',
      initials: 'AM',
    },
    {
      name: 'Aasama Prabhakar',
      title: 'UI/UX & Frontend Developer',
      education: 'The Ohio State University — Computer Science & Engineering',
      bio: 'Focused on catalog interface design, clean typography, and responsive presentation styling.',
      initials: 'AP',
    },
  ];

  return (
    <div className="about-page">
      <Navbar />

      <div className="page-header-banner">
        <div className="banner-content">
          <span className="page-tag">About groove</span>
          <h1 className="page-hero-title">Simple. Focused. Analog.</h1>
          <p className="page-hero-sub">
            Built for CSE 5234 at The Ohio State University, groove is an independent online record store focused on timeless music and a clean user experience.
          </p>
        </div>
      </div>

      <div className="content-wrap">
        {/* Mission and Vision Grid */}
        <section className="about-grid-two">
          <div className="about-card">
            <span className="card-kicker">Purpose</span>
            <h2>Mission</h2>
            <p>
              To offer a thoughtful, distraction-free platform where listeners can discover and purchase essential vinyl records pressed with audiophile standards.
            </p>
          </div>

          <div className="about-card">
            <span className="card-kicker">Direction</span>
            <h2>Vision</h2>
            <p>
              To connect physical music culture with modern web design—making ordering records straightforward, transparent, and dependable.
            </p>
          </div>
        </section>

        {/* Corporate Strategy Statement */}
        <section className="strategy-card">
          <span className="card-kicker">Operating Model</span>
          <h2>Corporate Strategy</h2>
          <p className="strategy-intro">
            Our approach prioritizes quality, reliability, and minimal overhead across three core areas:
          </p>

          <div className="strategy-columns">
            <div className="strategy-item">
              <h4>1. Deliberate Catalog</h4>
              <p>Curating only essential titles across Rock, Jazz, Electronic, and Pop rather than overwhelming customers with endless filler.</p>
            </div>
            <div className="strategy-item">
              <h4>2. Protective Fulfillment</h4>
              <p>Using rigid LP mailers and proper inner sleeves to guarantee that jackets and vinyl arrive in mint condition.</p>
            </div>
            <div className="strategy-item">
              <h4>3. Lightweight Frontend</h4>
              <p>Designing an uncluttered, responsive interface that keeps the focus on the music and makes checkout fast.</p>
            </div>
          </div>
        </section>

        {/* Meet the Team Section */}
        <section className="team-section">
          <div className="team-header">
            <h2>Meet the Team</h2>
            <p>Computer Science & Engineering students building the platform at The Ohio State University.</p>
          </div>

          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="member-card">
                <div className="member-avatar">
                  <span>{member.initials}</span>
                </div>
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-title">{member.title}</p>
                  <p className="member-edu">{member.education}</p>
                  <p className="member-bio">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;
