import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import axiosInstance from '../config/axiosConfig';
import './EarningsSection.css';

const EarningsSection = ({ freelancerId }) => {
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    monthlyEarnings: [],
    recentTransactions: [],
    trend: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        if (!freelancerId) return;
        
        // Fetch both freelancer data and earnings data
        const [freelancerRes, earningsRes] = await Promise.all([
          axiosInstance.get(`/api/auth/freelancer/freelancer?id=${freelancerId}`),
          axiosInstance.get(`/api/auth/freelancer/earnings?id=${freelancerId}`)
        ]);

        const freelancer = freelancerRes.data;
        const earnings = earningsRes.data || {};

        // Format monthly earnings for chart
        const monthlyEarnings = Object.entries(earnings.monthlyEarnings || {}).map(([monthYear, amount]) => {
          const [month, year] = monthYear.split('-');
          return {
            month: month,
            amount: amount,
            year: year
          };
        }).sort((a, b) => {
          // Sort by year and month
          if (a.year !== b.year) return a.year - b.year;
          return new Date(`${a.month} 1, ${a.year}`) - new Date(`${b.month} 1, ${b.year}`);
        });

        setEarningsData({
          totalEarnings: freelancer.earnings || 0, // Get total earnings from freelancer data
          monthlyEarnings,
          recentTransactions: earnings.recentTransactions || [],
          trend: earnings.trend || 0
        });
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [freelancerId]);

  if (loading) {
    return <div className="loading-spinner">Loading earnings data...</div>;
  }

  // Calculate max height for chart bars
  const maxAmount = Math.max(...earningsData.monthlyEarnings.map(m => m.amount), 1);
  const maxHeight = 100; // percentage

  return (
    <div className="earnings-section">
      <div className="earnings-overview">
        <div className="total-earnings-card">
          <div className="earnings-header">
            <DollarSign className="earnings-icon" />
            <h2>Total Earnings</h2>
          </div>
          <div className="total-amount">
            <h3>${earningsData.totalEarnings.toLocaleString()}</h3>
            {earningsData.monthlyEarnings.length > 1 && (
              <span className={`earnings-trend ${earningsData.trend > 0 ? 'positive' : 'negative'}`}>
                {earningsData.trend > 0 ? <TrendingUp /> : <TrendingDown />}
                {Math.abs(earningsData.trend)}% from last month
              </span>
            )}
          </div>
        </div>
        
        <div className="monthly-earnings-chart">
          <h3>Monthly Earnings Breakdown</h3>
          <div className="chart-bars">
            {earningsData.monthlyEarnings.length > 0 ? (
              earningsData.monthlyEarnings.map((monthEarning, index) => (
                <div key={index} className="chart-bar-container">
                  <div 
                    className="chart-bar" 
                    style={{
                      height: `${(monthEarning.amount / maxAmount) * maxHeight}%`
                    }}
                  ></div>
                  <span>{monthEarning.month.substring(0, 3)}</span>
                  <span className="chart-bar-amount">${monthEarning.amount.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="no-data-message">No earnings data available</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="recent-transactions">
        <div className="section-header">
          <h2>Recent Transactions</h2>
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
                  <span>${transaction.amount?.toLocaleString() || '0'}</span>
                  <p>{transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Date'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data-message">No recent transactions</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsSection;