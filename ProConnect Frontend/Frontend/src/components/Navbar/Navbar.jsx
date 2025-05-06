import React from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="logo">ProConnect</div>
      <ul className="nav-links">
        <li>Home</li>
        <li>Explore</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
      <button className="login-btn" onClick={() => navigate('/login-selection')}>
        Login
      </button>
    </nav>
  );
};

export default Navbar;
