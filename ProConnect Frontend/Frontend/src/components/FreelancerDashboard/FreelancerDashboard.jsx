import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Briefcase, 
  FileText, 
  DollarSign, 
  MessageCircle, 
  Settings,
  User,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import './FreelancerDashboard.css';
import axiosInstance from '../config/axiosConfig';
import ProjectsSection from './ProjectsSection';
import ProposalsSection from './ProposalsSection';
import EarningsSection from './EarningsSection';
import MessagesSection from './MessagesSection';
import SettingsSection from './SettingsSection';
import BrowseProjectsSection from './BrowseProjectsSection';
import '../../App.css';

const FreelancerDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [freelancerData, setFreelancerData] = useState({
    name: '',
    email: '',
    earnings: 0,
    completedProjects: 0,
    activeProjects: 0,
    skills: [],
    profession: '',
    id: null
  });
  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem('freelancerEmail');
        if (!email) {
          throw new Error('No freelancer email found');
        }
        
        // Fetch freelancer data
        const freelancerResponse = await axiosInstance.get(`/api/auth/freelancer/freelancer?email=${email}`);
        const freelancer = freelancerResponse.data;
        
        // Store freelancer ID in localStorage
        localStorage.setItem('freelancerId', freelancer.id);
        
        // Fetch projects data
        const projectsResponse = await axiosInstance.get(`/api/projects/freelancer/${freelancer.id}`);
        const projects = projectsResponse.data || [];
        
        // Calculate stats
        const completedProjects = projects.filter(p => {
          const deadline = new Date(p.deadline);
          const now = new Date();
          return now > deadline;
        }).length;
        
        const activeProjects = projects.filter(p => {
          const deadline = new Date(p.deadline);
          const now = new Date();
          return now <= deadline;
        }).length;
        
        // Get recent projects (last 5 completed)
        const recentCompleted = projects
          .filter(p => {
            const deadline = new Date(p.deadline);
            const now = new Date();
            return now > deadline;
          })
          .sort((a, b) => new Date(b.deadline) - new Date(a.deadline))
          .slice(0, 5);

        setFreelancerData({
          name: freelancer.name,
          email: freelancer.email,
          earnings: freelancer.earnings || 0,
          completedProjects,
          activeProjects,
          skills: freelancer.skills || [],
          profession: freelancer.profession || 'Freelancer',
          id: freelancer.id
        });

        setRecentProjects(recentCompleted);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateProfileCompleteness = () => {
    let completeness = 30; // Base score
    if (freelancerData.name) completeness += 20;
    if (freelancerData.skills?.length > 0) completeness += 30;
    if (freelancerData.earnings > 0) completeness += 20;
    return Math.min(completeness, 100); // Cap at 100%
  };

  const renderOverview = () => (
    <div className="dashboard-metrics-grid">
      <div className="dashboard-metric-card earnings-card">
        <DollarSign className="metric-icon" />
        <div>
          <h3>Total Earnings</h3>
          <p>${freelancerData.earnings.toLocaleString()}</p>
        </div>
      </div>
      <div className="dashboard-metric-card projects-card">
        <CheckCircle className="metric-icon" />
        <div>
          <h3>Completed Projects</h3>
          <p>{freelancerData.completedProjects}</p>
        </div>
      </div>
      <div className="dashboard-metric-card active-projects-card">
        <Clock className="metric-icon" />
        <div>
          <h3>Active Projects</h3>
          <p>{freelancerData.activeProjects}</p>
        </div>
      </div>
      <div className="dashboard-metric-card profile-card">
        <Zap className="metric-icon" />
        <div>
          <h3>Profile Completeness</h3>
          <p>{calculateProfileCompleteness()}%</p>
        </div>
      </div>
    </div>
  );

  const renderRecentProjects = () => (
    <div className="recent-projects-container">
      <h2>Recent Projects</h2>
      {recentProjects.length > 0 ? (
        recentProjects.map(project => (
          <div key={project.id} className="project-item">
            <div className="project-details">
              <h3>{project.title}</h3>
              <p>{project.client?.name || 'Client'}</p>
            </div>
            <div className="project-status">
              <span className={`status-badge completed`}>
                Completed
              </span>
              <span className="project-earnings">
                ${project.budget?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        ))
      ) : (
        <p>No completed projects yet</p>
      )}
    </div>
  );

  const renderSidebar = () => (
    <div className="sidebar-container">
      <div className="profile-section">
        <User className="profile-image" size={64} />
        <h2>{freelancerData.name}</h2>
        <p>{freelancerData.profession}</p>
        <p className="profile-email">{freelancerData.email}</p>
      </div>
      <nav className="sidebar-navigation">
        {[
          { icon: Home, label: 'Overview', section: 'overview' },
          { icon: Briefcase, label: 'Projects', section: 'projects' },
          { icon: FileText, label: 'Browse Projects', section: 'browse-projects' },
          { icon: DollarSign, label: 'Earnings', section: 'earnings' },
          { icon: MessageCircle, label: 'Messages', section: 'messages' },
          { icon: Settings, label: 'Settings', section: 'settings' }
        ].map(({ icon: Icon, label, section }) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`nav-item ${activeSection === section ? 'active' : ''}`}
          >
            <Icon className="nav-icon" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderMainContent = () => {
    if (loading) {
      return <div className="loading-container">Loading profile data...</div>;
    }

    switch(activeSection) {
      case 'overview':
        return (
          <>
            {renderOverview()}
            {renderRecentProjects()}
          </>
        );
      case 'projects':
        return <ProjectsSection freelancerId={freelancerData.id} />;
      case 'browse-projects':
        return <BrowseProjectsSection />;
      case 'earnings':
        return <EarningsSection freelancerId={freelancerData.id} />;
      case 'messages':
        return <MessagesSection />;
      case 'settings':
        return <SettingsSection freelancerData={freelancerData} />;
      default:
        return null;
    }
  };

  return (
    <div className="freelancer-dashboard-wrapper">
    <div className="dashboard-sidebar">
      {/* Sidebar content remains the same */}
      <div className="profile-section">
        <div className="profile-avatar">
          {freelancerData.name?.charAt(0).toUpperCase() || 'F'}
        </div>
        <h2>{freelancerData.name || 'Freelancer'}</h2>
        <p>{freelancerData.profession || 'Professional'}</p>
        <p className="profile-email">{freelancerData.email || 'email@example.com'}</p>
      </div>
      
      <nav className="sidebar-navigation">
        {[
          { icon: Home, label: 'Overview', section: 'overview' },
          { icon: Briefcase, label: 'Projects', section: 'projects' },
          { icon: FileText, label: 'Browse Projects', section: 'browse-projects' },
          { icon: DollarSign, label: 'Earnings', section: 'earnings' },
          { icon: MessageCircle, label: 'Messages', section: 'messages' },
          { icon: Settings, label: 'Settings', section: 'settings' }
        ].map(({ icon: Icon, label, section }) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`nav-item ${activeSection === section ? 'active' : ''}`}
          >
            <Icon className="nav-icon" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>

    <div className="main-content-wrapper">
      <div className="main-content-container">
        {loading ? (
          <div className="loading-spinner">Loading profile data...</div>
        ) : (
          <>
            {activeSection === 'overview' && (
              <>
                <div className="content-section">
                  {renderOverview()}
                </div>
                <div className="content-section">
                  {renderRecentProjects()}
                </div>
              </>
            )}
            {activeSection === 'projects' && (
              <div className="content-section">
                <ProjectsSection freelancerId={freelancerData.id} />
              </div>
            )}
            {activeSection === 'browse-projects' && (
              <div className="content-section">
                <BrowseProjectsSection />
              </div>
            )}
            {activeSection === 'earnings' && (
              <div className="content-section">
                <EarningsSection freelancerId={freelancerData.id} />
              </div>
            )}
            {activeSection === 'messages' && (
              <div className="content-section">
                <MessagesSection />
              </div>
            )}
            {activeSection === 'settings' && (
              <div className="content-section">
                <SettingsSection freelancerData={freelancerData} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
  );
};

export default FreelancerDashboard;