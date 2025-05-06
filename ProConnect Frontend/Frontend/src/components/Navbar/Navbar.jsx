import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const avatarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current &&
                avatarRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !avatarRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowDropdown(false);
    };

    const handleProfileClick = () => {
        const route = user?.userType === 'freelancer'
            ? '/freelancer-dashboard'
            : '/client-dashboard';
        navigate(route);
        setShowDropdown(false);
    };

    return (
        <nav className="Navbar">
            <div className="logo" onClick={() => navigate('/')}>ProConnect</div>
            <ul className="nav-links">
                <li onClick={() => navigate('/')}>Home</li>
                <li>Explore</li>
                <li onClick={() => navigate('/about')}>AboutUs</li>
                <li onClick={() => navigate('/contact')}>ContactUs</li>
            </ul>
            {!user ? (
                <button className="login-btn" onClick={() => navigate('/login-selection')}>
                    Login
                </button>
            ) : (
                <div className="navbar-user-menu">
                    <div
                        ref={avatarRef}
                        className="navbar-user-avatar"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        {user.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt={user.name}
                                className="navbar-avatar-image"
                            />
                        ) : (
                            <FaUserCircle size={16} className="navbar-avatar-image" color="#000000" style={{ cursor: 'pointer' }} />
                        )}
                    </div>
                    {showDropdown && (
                        <div ref={dropdownRef} className="dropdown-menu">
                            <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-type">{user.userType}</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button onClick={handleProfileClick}>Profile</button>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;