import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axiosConfig';
import '../Form/Form.css';

const ClientSignup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    navigate('/client-login');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post('/api/auth/signup', {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: 'client'
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('clientEmail', formData.email);
        const userData = {
          token: response.data.token,
          userType: 'client',
          email: formData.email.toLowerCase(),
          name: formData.name.trim(),
          clientData: response.data.clientData || {}
        };

        login(userData);
        navigate('/client-dashboard');
      } else {
        setError(response.data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 409) {
        setError('Email already exists. Please use a different email.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred during signup. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="form-container">
        <h1>Client Signup</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className={error && !formData.name.trim() ? 'error' : ''}
          />
          <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className={error && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? 'error' : ''}
          />
          <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className={error && formData.password.length < 6 ? 'error' : ''}
          />
          <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className={error && formData.password !== formData.confirmPassword ? 'error' : ''}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p>
          Already have an account?{' '}
          <span onClick={!loading ? handleNavigate : undefined} className="login-link">
          Login
        </span>
        </p>
      </div>
  );
};

export default ClientSignup;