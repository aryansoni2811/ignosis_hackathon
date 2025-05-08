import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axiosConfig';
import '../Form/Form.css';

const FreelancerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    navigate('/freelancer-signup');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getDefaultName = (email) => {
    return email.split('@')[0];
  };

  const fetchFreelancerId = async (email) => {
    try {
      const response = await axiosInstance.get(`/api/auth/freelancer/by-email?email=${email}`);
      return response.data.id; // Returns the freelancer ID
    } catch (error) {
      console.error('Error fetching freelancer ID:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      const response = await axiosInstance.post('/api/auth/freelancer/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {

        const freelancerId = await fetchFreelancerId(formData.email);

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('freelancerEmail', formData.email);
        localStorage.setItem('freelancerId', freelancerId);
        const userData = {
          token: response.data.token,
          userType: 'freelancer',
          email: formData.email,
          name: response.data.name || response.data.freelancerName || getDefaultName(formData.email),
          freelancerData: response.data.freelancerData,
          id: freelancerId
        };

        login(userData);
        navigate('/freelancer-dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error details:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="form-container">
        <h1>Freelancer Login</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
          />
          <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don't have an account?{' '}
          <span onClick={handleNavigate} className="signup-link">
          Sign up
        </span>
        </p>
      </div>
  );
};

export default FreelancerLogin;
