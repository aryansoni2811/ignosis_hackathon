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
  Zap,
  TrendingUp,
  PieChart,
  Star
} from 'lucide-react';
import './FreelancerDashboard.css';
import TaxEstimationComponent from './TaxEstimationComponent';
import axiosInstance from '../config/axiosConfig';
import ProjectsSection from './ProjectsSection';
import ProposalsSection from './ProposalsSection';
import EarningsSection from './EarningsSection';
import MessagesSection from './MessagesSection';
import SettingsSection from './SettingsSection';
import BrowseProjectsSection from './BrowseProjectsSection';
import AnalysisSection from './AnalysisSection';
import '../../App.css';
import FinancialPlanningSection from './FinancialPlanningSection';

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
    id: null,
    averageRating: 0
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

        const freelancerResponse = await axiosInstance.get(`/api/auth/freelancer/freelancer?email=${email}`);
        const freelancer = freelancerResponse.data;

        localStorage.setItem('freelancerId', freelancer.id);

        const projectsResponse = await axiosInstance.get(`/api/projects/freelancer/${freelancer.id}`);
        const projects = projectsResponse.data || [];

        const ratingResponse = await axiosInstance.get(`/api/ratings/freelancer/${freelancer.id}/average`);
        const averageRating = ratingResponse.data || 0;


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
          id: freelancer.id,
          averageRating: averageRating
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
    let completeness = 30;
    if (freelancerData.name) completeness += 20;
    if (freelancerData.skills?.length > 0) completeness += 30;
    if (freelancerData.earnings > 0) completeness += 20;
    return Math.min(completeness, 100);
  };

  const renderOverview = () => (
    <div className="dashboard-metrics-grid">
      {/*<div className="dashboard-metric-card earnings-card">*/}
      {/*  <div className="metric-icon-container">*/}
      {/*    <DollarSign className="metric-icon" />*/}
      {/*  </div>*/}
      {/*  <div className="metric-content">*/}
      {/*    <h3>Total Earnings</h3>*/}
      {/*    <p>${freelancerData.earnings.toLocaleString()}</p>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div className="dashboard-metric-card projects-card">*/}
      {/*  <div className="metric-icon-container">*/}
      {/*    <CheckCircle className="metric-icon" />*/}
      {/*  </div>*/}
      {/*  <div className="metric-content">*/}
      {/*    <h3>Completed Projects</h3>*/}
      {/*    <p>{freelancerData.completedProjects}</p>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div className="dashboard-metric-card active-projects-card">*/}
      {/*  <div className="metric-icon-container">*/}
      {/*    <Clock className="metric-icon" />*/}
      {/*  </div>*/}
      {/*  <div className="metric-content">*/}
      {/*    <h3>Active Projects</h3>*/}
      {/*    <p>{freelancerData.activeProjects}</p>*/}
      {/*  </div>*/}
      {/*</div>*/}

      <div className="dashboard-metric-card profile-card">
        <div className="metric-icon-container">
          <Zap className="metric-icon" />
        </div>
        <div className="metric-content">
          <h3>Profile Completeness</h3>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${calculateProfileCompleteness()}%` }}
            ></div>
          </div>
          <p>{calculateProfileCompleteness()}%</p>
        </div>
      </div>

      <div className="dashboard-metric-card">
      <div className="metric-icon-container">
        <Star className="metric-icon" />
      </div>
      <div className="metric-content">
        <h3>Average Rating</h3>
        <p>
          {freelancerData.averageRating.toFixed(1)}/5
          <span className="rating-stars-small">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={`rating-star-small ${
                  i < Math.floor(freelancerData.averageRating) ? 'filled' : ''
                }`}
              />
            ))}
          </span>
        </p>
      </div>
    </div>
  </div>
  );

  const renderRecentProjects = () => (
    <div className="recent-projects-container">
      <div className="section-header">
        <h2>Recent Projects</h2>
        <button className="view-all-btn">View All</button>
      </div>

      {recentProjects.length > 0 ? (
        <div className="projects-list">
          {recentProjects.map(project => (
            <div key={project.id} className="project-item">
              <div className="project-details">
                <h3>{project.title}</h3>
                <p className="client-name">{project.client?.name || 'Client'}</p>
                <p className="project-description">{project.description?.substring(0, 100)}...</p>
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
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <p>No completed projects yet</p>
          <button className="browse-projects-btn">Browse Projects</button>
        </div>
      )}
    </div>
  );

  const renderTaxEstimation = () => (
    <div className="tax-estimation-container">
      <div className="section-header">
        <h2>Tax Estimation</h2>
        <PieChart className="section-icon" />
      </div>
      <div className="tax-content">
        {freelancerData.id && (
          <TaxEstimationComponent freelancerId={freelancerData.id} />
        )}
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="sidebar-container">
      <div className="profile-section">
        <div className="profile-avatar">
          {freelancerData.name?.charAt(0).toUpperCase() || 'F'}
        </div>
        <p className="freelancer">{freelancerData.name || 'Freelancer'}</p>
        <p className="profile-email">{freelancerData.email || 'email@example.com'}</p>
      </div>

      <nav className="sidebar-navigation">
        {[
          { icon: Home, label: 'Overview', section: 'overview' },
          { icon: Briefcase, label: 'Projects', section: 'projects' },
          { icon: FileText, label: 'Browse Projects', section: 'browse-projects' },
          { icon: DollarSign, label: 'Earnings', section: 'earnings' },
          { icon: PieChart, label: 'Financial Planning', section: 'financial-planning' },
          { icon: TrendingUp, label: 'Market Analysis', section: 'analysis' }, // New menu item
          { icon: Settings, label: 'Settings', section: 'settings' }
        ].map(({ icon: Icon, label, section }) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`nav-item ${activeSection === section ? 'active' : ''}`}
          >
            <Icon className="nav-icon" />
            <span>{label}</span>
            {activeSection === section && <div className="active-indicator"></div>}
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="freelancer-dashboard-wrapper">
      {renderSidebar()}

      <div className="main-content-wrapper">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        ) : (
          <div className="main-content-container">
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

            {activeSection === 'analysis' && (
              <div className="content-section">
                <AnalysisSection />
              </div>
            )}

            {activeSection === 'earnings' && (
              <div className="content-section">
                <EarningsSection freelancerId={freelancerData.id} />
              </div>
            )}

            {activeSection === 'financial-planning' && (
              <div className="content-section">
                <FinancialPlanningSection freelancerId={freelancerData.id} />
              </div>
            )}

            

            {activeSection === 'settings' && (
              <div className="content-section">
                <SettingsSection freelancerData={freelancerData} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboard;