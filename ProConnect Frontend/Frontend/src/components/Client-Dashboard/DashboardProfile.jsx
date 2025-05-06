import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

const DashboardProfile = ({ clientData, loading, projectStats }) => {
  return (
    <div className="profile-section">
      <h2>Profile</h2>
      
      {loading ? (
        <div className="loading-spinner">Loading profile...</div>
      ) : (
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              {clientData?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="profile-info">
              <h3>{clientData?.name || 'Client Name'}</h3>
              <p className="profile-email">{clientData?.email || 'email@example.com'}</p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <FileText size={20} />
              <span>{projectStats.totalProjects} Projects Posted</span>
            </div>
            <div className="stat-item">
              <CheckCircle size={20} />
              <span>{projectStats.completedProjects} Completed</span>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-edit-profile">
              Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProfile;