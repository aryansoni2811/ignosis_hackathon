// src/components/FinancialPlanningSection.jsx
import React from 'react';
import TaxEstimationComponent from './TaxEstimationComponent';
import './FinancialPlanningSection.css';

const FinancialPlanningSection = ({ freelancerId }) => {
  return (
    <div className="financial-planning-container">
      <div className="financial-planning-header">
        <h2>Financial Planning</h2>
        <p>Manage your earnings, taxes, and savings goals</p>
      </div>
      
      <div className="financial-planning-grid">
        <div className="financial-card tax-card">
          <TaxEstimationComponent freelancerId={freelancerId} />
        </div>
        
        <div className="financial-card savings-card">
          <h3>Savings Goals</h3>
          <div className="savings-content">
            <p>Coming soon: Track your savings goals and set aside money for taxes</p>
          </div>
        </div>
        
        <div className="financial-card tips-card">
          <h3>Financial Tips</h3>
          <div className="tips-content">
            <div className="tip-item">
              <h4>Quarterly Tax Payments</h4>
              <p>Consider making estimated tax payments quarterly to avoid penalties.</p>
            </div>
            <div className="tip-item">
              <h4>Emergency Fund</h4>
              <p>Aim to save 3-6 months of living expenses for emergencies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialPlanningSection;