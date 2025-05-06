import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>About Us</h1>
        <p className="subtitle">Connecting Talent with Opportunity</p>
      </section>

      <section className="about-content">
        <div className="mission-section">
          <h2>Our Mission</h2>
          <p>
            We're dedicated to transforming how freelancing works by creating a
            platform that empowers both clients and freelancers to achieve their goals.
          </p>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <h3>Quality First</h3>
            <p>We ensure high standards in every project and connection made on our platform.</p>
          </div>
          <div className="value-card">
            <h3>Trust & Security</h3>
            <p>Your security and satisfaction are our top priorities in every transaction.</p>
          </div>
          <div className="value-card">
            <h3>Global Reach</h3>
            <p>Connect with talented professionals and opportunities worldwide.</p>
          </div>
          <div className="value-card">
            <h3>Fair Opportunity</h3>
            <p>We provide equal opportunities for everyone to succeed and grow.</p>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <h3>10K+</h3>
            <p>Active Freelancers</p>
          </div>
          <div className="stat-item">
            <h3>5K+</h3>
            <p>Satisfied Clients</p>
          </div>
          <div className="stat-item">
            <h3>15K+</h3>
            <p>Projects Completed</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;