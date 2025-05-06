import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './HomePage.css';

const HomePage = () => (
  <div className="home-container">
    
    <section className="hero-section">
      <h1>Find Your Next Freelance Gig</h1>
      <p>Join thousands of freelancers and businesses collaborating effectively.</p>
      <button className="cta-btn">Get Started</button>
    </section>
    <Footer />
  </div>
);

export default HomePage;
