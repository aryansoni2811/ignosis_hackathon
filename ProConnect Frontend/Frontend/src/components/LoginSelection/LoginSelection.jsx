import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSelection.css';

const LoginSelection = () => {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="login-selection">
            <h1>Welcome to ProConnect</h1>
            <p>Select your role to proceed</p>

            <div className="card-container">
                {/* Client Card */}
                <div className="card" onClick={() => handleNavigate('/client-login')}>
                    <h2>Client</h2>
                    <p>Login or Signup as a Client</p>
                </div>

                {/* Freelancer Card */}
                <div className="card" onClick={() => handleNavigate('/freelancer-login')}>
                    <h2>Freelancer</h2>
                    <p>Login or Signup as a Freelancer</p>
                </div>
            </div>
        </div>
    );
};

export default LoginSelection;
