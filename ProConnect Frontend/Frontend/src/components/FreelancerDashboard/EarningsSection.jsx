import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import axiosInstance from '../config/axiosConfig';
import './EarningsSection.css';

const EarningsSection = () => {
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    monthlyEarnings: [],
    recentTransactions: [],
    trend: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const freelancerEmail = localStorage.getItem('freelancerEmail');
        if (!freelancerEmail) {
          throw new Error('Please login to view earnings');
        }

        const freelancerRes = await axiosInstance.get(`/api/auth/freelancer/freelancer?email=${freelancerEmail}`);
        const freelancer = freelancerRes.data;
        
        if (!freelancer || !freelancer.id) {
          throw new Error('Freelancer data not found');
        }

        const earningsRes = await axiosInstance.get(`/api/auth/freelancer/earnings-details?id=${freelancer.id}`);
        const earnings = earningsRes.data || {};

        const monthlyEarnings = (earnings.monthlyEarnings || []).map(item => ({
          month: item.month,
          year: item.year,
          amount: item.amount,
          date: new Date(`${item.year}-${item.month}-01`),
          formattedDate: `${new Date(`${item.year}-${item.month}-01`).toLocaleString('default', { month: 'short' })} '${item.year.toString().slice(-2)}`
        })).sort((a, b) => a.date - b.date);

        setEarningsData({
          totalEarnings: freelancer.earnings || 0,
          monthlyEarnings,
          recentTransactions: earnings.recentTransactions || [],
          trend: earnings.trend || 0
        });
      } catch (error) {
        console.error('Error fetching earnings data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading earnings data...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  // Calculate max height for chart bars
  const maxAmount = Math.max(...earningsData.monthlyEarnings.map(m => m.amount), 1);
  const barMaxHeight = 150; // pixels
  const barWidth = 40; // pixels
  const barSpacing = 20; // pixels between bars

  const formatMonth = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(monthNumber) - 1] || monthNumber;
  };

  const getBarColor = (amount, maxAmount) => {
    const percentage = (amount / maxAmount) * 100;
    if (percentage > 80) return '#4CAF50'; // Green
    if (percentage > 50) return '#8BC34A'; // Light green
    if (percentage > 30) return '#FFC107'; // Amber
    return '#FF9800'; // Orange
  };

  return (
    <div className="earnings-section">
      <div className="earnings-overview">
        <div className="total-earnings-card">
          <div className="earnings-header">
            <DollarSign className="earnings-icon" />
            <h2>Total Earnings</h2>
          </div>
          <div className="total-amount">
            <h3>${earningsData.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            {earningsData.monthlyEarnings.length > 1 && (
              <span className={`earnings-trend ${earningsData.trend > 0 ? 'positive' : 'negative'}`}>
                {earningsData.trend > 0 ? <TrendingUp /> : <TrendingDown />}
                {Math.abs(earningsData.trend).toFixed(1)}% from last month
              </span>
            )}
          </div>
        </div>
        
        <div className="monthly-earnings-chart">
          <h3>Monthly Earnings Breakdown</h3>
          {earningsData.monthlyEarnings.length > 0 ? (
            <div className="bar-chart-container">
              <div className="chart-y-axis">
                {[100, 75, 50, 25 ,0 ].map((percent) => (
                  <div key={percent} className="y-axis-label">
                    ${Math.round((percent / 100) * maxAmount).toLocaleString()}
                  </div>
                ))}
              </div>
              <div className="chart-content">
                <div className="chart-bars">
                  {earningsData.monthlyEarnings.map((monthEarning, index) => {
                    const barHeight = (monthEarning.amount / maxAmount) * barMaxHeight;
                    return (
                      <div key={index} className="bar-container">
                        <div 
                          className="chart-bar" 
                          style={{
                            height: `${barHeight}px`,
                            backgroundColor: getBarColor(monthEarning.amount, maxAmount),
                            width: `${barWidth}px`
                          }}
                          title={`${formatMonth(monthEarning.month)} ${monthEarning.year}: $${monthEarning.amount.toLocaleString()}`}
                        >
                          <span className="bar-value">
                            ${monthEarning.amount > maxAmount * 0.1 ?
                              monthEarning.amount.toLocaleString('en-US', { maximumFractionDigits: 0 }) : ''}
                          </span>
                        </div>
                        <span className="bar-label">
                          {formatMonth(monthEarning.month)} '{monthEarning.year.toString().slice(-2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="chart-x-axis"></div>
              </div>
            </div>
          ) : (
            <p className="no-data-message">No earnings data available</p>
          )}
        </div>
      </div>
      
      <div className="recent-transactions">
        <div className="section-header">
          <h2>Recent Transactions</h2>
          <button 
            className="refresh-button"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
        <div className="transactions-list">
          {earningsData.recentTransactions.length > 0 ? (
            earningsData.recentTransactions.map((transaction, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-details">
                  <h3>{transaction.project || 'Project'}</h3>
                  <p>{transaction.client || 'Client'}</p>
                </div>
                <div className="transaction-amount">
                  <span>${transaction.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                  <p>{transaction.date ? new Date(transaction.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'Date not available'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data-message">No completed projects yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsSection;