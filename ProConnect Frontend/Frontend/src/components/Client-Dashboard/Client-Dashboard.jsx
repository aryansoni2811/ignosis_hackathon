import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  User, 
  MessageCircle, 
  Briefcase 
} from 'lucide-react';
import DashboardHome from './DashboardHome';
import DashboardProposals from './DashboardProposals';
import PostProject from './PostProject';
import DashboardMessages from './DashboardMessages';
import DashboardProfile from './DashboardProfile';
import axiosInstance from '../config/axiosConfig';
import './Client-Dashboard.css';

const ClientDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingInvoices: 0
  });

  // Get client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const token = localStorage.getItem('token');
        const clientEmail = localStorage.getItem('clientEmail');
        
        if (!token || !clientEmail) {
          throw new Error('Authentication required');
        }
        
        const response = await axiosInstance.get(`/api/auth/client?email=${clientEmail}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setClientData(response.data);
      } catch (error) {
        console.error('Error fetching client data:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchClientData();
  }, []);

  const navigationItems = [
    { icon: Home, label: 'Dashboard', section: 'dashboard' },
    { icon: Briefcase, label: 'Proposals', section: 'proposals' },
    { icon: Plus, label: 'Post Project', section: 'post-project' },
    { icon: MessageCircle, label: 'Messages', section: 'messages' },
    { icon: User, label: 'Profile', section: 'profile' }
  ];

  // Render different sections based on activeSection
  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard':
        return <DashboardHome 
                 clientData={clientData} 
                 projectStats={projectStats} 
                 setProjectStats={setProjectStats} 
               />;
      case 'proposals':
        return <DashboardProposals />;
      case 'post-project':
        return <PostProject 
                 setProjectStats={setProjectStats} 
               />;
      case 'messages':
        return <DashboardMessages />;
      case 'profile':
        return <DashboardProfile 
                 clientData={clientData} 
                 loading={loading} 
                 projectStats={projectStats} 
               />;
      default:
        return <DashboardHome 
                 clientData={clientData} 
                 projectStats={projectStats} 
                 setProjectStats={setProjectStats} 
               />;
    }
  };

  return (
    <div className="client-dashboard-container">
      <div className="dashboard-sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            {clientData?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <h3>{clientData?.name || 'Loading...'}</h3>
          <p>{clientData?.email || 'Loading...'}</p>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {navigationItems.map((item, index) => (
              <li 
                key={index}
                className={`nav-item ${activeSection === item.section ? 'active' : ''}`}
                onClick={() => setActiveSection(item.section)}
              >
                <item.icon className="nav-icon" size={20} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="dashboard-main-content">
        <div className="content-wrapper">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;