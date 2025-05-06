import React, { useState } from 'react';
import './ProposalsSection.css';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

const ProposalsSection = () => {
  const [activeTab, setActiveTab] = useState('sent');

  const proposalsData = {
    sent: [
      {
        id: 1,
        title: 'Logo Design for Tech Startup',
        client: 'InnovaTech Solutions',
        date: '2024-04-15',
        budget: 1200,
        status: 'Pending'
      },
      {
        id: 2,
        title: 'Mobile App UI/UX Design',
        client: 'DigitalWave Inc.',
        date: '2024-04-10',
        budget: 2500,
        status: 'Reviewed'
      }
    ],
    accepted: [
      {
        id: 3,
        title: 'Corporate Branding Package',
        client: 'Global Enterprises',
        date: '2024-03-20',
        budget: 3500,
        status: 'Accepted'
      }
    ],
    rejected: [
      {
        id: 4,
        title: 'Website Redesign Concept',
        client: 'Local Retail Store',
        date: '2024-02-15',
        budget: 1800,
        status: 'Rejected'
      }
    ]
  };

  const renderProposalCard = (proposal) => (
    <div key={proposal.id} className="proposal-card">
      <div className="proposal-header">
        <h3>{proposal.title}</h3>
        <span className="proposal-client">{proposal.client}</span>
      </div>
      <div className="proposal-details">
        <div className="proposal-date">
          <FileText size={16} />
          <span>Submitted: {proposal.date}</span>
        </div>
        <div className="proposal-budget">
          <span>Budget: ${proposal.budget}</span>
        </div>
        <div className={`proposal-status ${proposal.status.toLowerCase()}`}>
          {proposal.status}
        </div>
      </div>
      <div className="proposal-actions">
        <button className="btn-view">View Details</button>
        {activeTab === 'sent' && (
          <button className="btn-withdraw">Withdraw</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="proposals-container">
      <div className="proposals-header">
        <h1>My Proposals</h1>
        <button className="btn-new-proposal">
          <Send size={16} />
          Send New Proposal
        </button>
      </div>
      
      <div className="proposals-tabs">
        {['sent', 'accepted', 'rejected'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Proposals
          </button>
        ))}
      </div>
      
      <div className="proposals-grid">
        {proposalsData[activeTab].map(renderProposalCard)}
      </div>
    </div>
  );
};

export default ProposalsSection;