import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../Footer/Footer';
import './HomePage.css';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login-selection');
    };

    const handleDashboardNavigation = () => {
        if (user?.userType === 'client') {
            navigate('/client-dashboard');
        } else if (user?.userType === 'freelancer') {
            navigate('/freelancer-dashboard');
        }
    };

    const renderAuthenticatedContent = () => {
        if (user?.userType === 'client') {
            return (
                <section className="hero-section client-view">
                    <h1>Welcome back, {user.name}!</h1>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>Post a Project</h3>
                            <p>Create a new project and find talented freelancers</p>
                        </div>
                        <div className="feature-card">
                            <h3>Manage Projects</h3>
                            <p>Track your ongoing projects and collaborations</p>
                        </div>
                        <div className="feature-card">
                            <h3>Browse Freelancers</h3>
                            <p>Find skilled professionals for your projects</p>
                        </div>
                    </div>
                    <button className="dashboard-btn" onClick={handleDashboardNavigation}>
                        Go to Dashboard
                    </button>
                </section>
            );
        } else if (user?.userType === 'freelancer') {
            return (
                <section className="hero-section freelancer-view">
                    <h1>Welcome back, {user.name}!</h1>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>Find Projects</h3>
                            <p>Browse available projects that match your skills</p>
                        </div>
                        <div className="feature-card">
                            <h3>Track Earnings</h3>
                            <p>Monitor your earnings and payment history</p>
                        </div>
                        <div className="feature-card">
                            <h3>Manage Proposals</h3>
                            <p>Keep track of your submitted proposals</p>
                        </div>
                    </div>
                    <button className="dashboard-btn" onClick={handleDashboardNavigation}>
                        Go to Dashboard
                    </button>
                </section>
            );
        }
    };

    const renderUnauthenticatedContent = () => (
        <section className="hero-section">
            <h1>Find Your Next Freelance Gig</h1>
            <p>Join thousands of freelancers and businesses collaborating effectively.</p>
            <button className="cta-btn" onClick={handleGetStarted}>
                Get Started
            </button>
            <div className="features-grid">
                <div className="feature-card">
                    <h3>For Clients</h3>
                    <p>Post projects and hire talented freelancers</p>
                </div>
                <div className="feature-card">
                    <h3>For Freelancers</h3>
                    <p>Find projects and grow your business</p>
                </div>
            </div>
        </section>
    );

    return (
        <div className="home-container">
            {isAuthenticated ? renderAuthenticatedContent() : renderUnauthenticatedContent()}
        </div>
    );
};

export default HomePage;