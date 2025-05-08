import React, { useState, useEffect } from 'react';
import { Home, Plus, User, MessageCircle, Briefcase, Search } from 'lucide-react';
import DashboardFreelancers from './DashboardFreelancers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardHome from './DashboardHome';
import DashboardProposals from './DashboardProposals';
import PostProject from './PostProject';
import DashboardMessages from './DashboardMessages';
import DashboardProfile from './DashboardProfile';
import axiosInstance from '../config/axiosConfig';
import './Client-Dashboard.css';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingInvoices: 0
  });

  const handleProfileUpdate = async (updateData) => {
    try {
      const response = await axiosInstance.put(
        `/api/auth/update-profile?email=${user.email}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        }
      );
      setClientData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'client') {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Get client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        if (!user?.email || !user?.token) {
        const token = localStorage.getItem('token');
        const clientEmail = localStorage.getItem('userEmail');
        
        if (!token || !clientEmail) {
          throw new Error('Authentication required');
        }

        const response = await axiosInstance.get(`/api/auth/client?email=${user.email}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setClientData(response.data);

        // Fetch project stats
        const projectsResponse = await axiosInstance.get(`/api/projects/client?email=${user.email}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        const stats = {
          totalProjects: projectsResponse.data.length,
          activeProjects: projectsResponse.data.filter(p => p.status === 'Open' || p.status === 'In Progress').length,
          completedProjects: projectsResponse.data.filter(p => p.status === 'Completed').length,
          pendingInvoices: projectsResponse.data.filter(p => p.status === 'Completed' && !p.isPaid).length || 0
        };

        setProjectStats(stats);
      } }catch (error) {
        console.error('Error fetching client data:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.email) {
      fetchClientData();
    }
  }, [isAuthenticated, user, navigate]);

  const navigationItems = [
    { icon: Home, label: 'Dashboard', section: 'dashboard' },
    { icon: Briefcase, label: 'Proposals', section: 'proposals' },
    { icon: Plus, label: 'Post Project', section: 'post-project' },
    { icon: Search, label: 'Find Freelancers', section: 'freelancers' },
    { icon: User, label: 'Profile', section: 'profile' }
  ];

  const renderSection = () => {
    switch (activeSection) {
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
      case 'freelancers':
        return <DashboardFreelancers />;
      case 'profile':
        return <DashboardProfile
          clientData={clientData}
          loading={loading}
          projectStats={projectStats}
          onProfileUpdate={handleProfileUpdate}
        />
      default:
        return <DashboardHome
          clientData={clientData}
          projectStats={projectStats}
          setProjectStats={setProjectStats}
        />;
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="cd-container">
      <div className="cd-sidebar">
        <div className="cd-profile">
          <div className="cd-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <h3>{user?.name || 'Loading...'}</h3>
          <p>{user?.email || 'Loading...'}</p>
        </div>

        <nav className="cd-nav">
          <ul className="cd-menu">
            {navigationItems.map((item, index) => (
              <li
                key={index}
                className={`cd-item ${activeSection === item.section ? 'cd-active' : ''}`}
                onClick={() => setActiveSection(item.section)}
              >
                <item.icon className="cd-icon" size={20} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="cd-main">
        <div className="cd-content">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;