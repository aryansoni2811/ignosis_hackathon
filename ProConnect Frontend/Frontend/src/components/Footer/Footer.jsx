// src/components/Footer/Footer.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const [showScroll, setShowScroll] = useState(false);

    useEffect(() => {
        const checkScrollTop = () => {
            if (!showScroll && window.scrollY > 600) {
                setShowScroll(true);
            } else if (showScroll && window.scrollY <= 600) {
                setShowScroll(false);
            }
        };

        window.addEventListener('scroll', checkScrollTop);
        return () => window.removeEventListener('scroll', checkScrollTop);
    }, [showScroll]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className="simple-footer">
            <div className="footer-container">
                <div className="footer-row">
                    <div className="footer-col">
                        <h4>Contact Us</h4>
                        <div className="contact-info">
                            <p><i className="fas fa-envelope"></i> info@proconnect.com</p>
                            <p><i className="fas fa-phone"></i> +1 (123) 456-7890</p>
                        </div>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <ul>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="copyright">© {new Date().getFullYear()} ProConnect. All rights reserved.</p>
                </div>
            </div>
            {showScroll && (
                <div className="scroll-top" onClick={scrollToTop}>
                    <i className="fas fa-arrow-up"></i>
                </div>
            )}
        </footer>
    );
};

export default Footer;