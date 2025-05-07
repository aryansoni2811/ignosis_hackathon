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
        
        
        
        
      </div>
    </div>
  );
};

export default FinancialPlanningSection;