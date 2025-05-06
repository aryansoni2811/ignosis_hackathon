import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Search, 
  User, 
  MessageCircle, 
  CheckCircle, 
  DollarSign, 
  FileText,
  Star,
  Mail,
  Briefcase,
  Check,
  X
} from 'lucide-react';
import './Client-Dashboard.css';
import axiosInstance from '../config/axiosConfig';
import '../../App.css'

const ClientDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [clientData, setClientData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState([]);
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingInvoices: 0
  });

  // Form state for posting a project
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    requiredSkills: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Freelancer search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [projectProposals, setProjectProposals] = useState({});
  const [loadingProposals, setLoadingProposals] = useState(false);

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
          // Redirect to login if unauthorized
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchClientData();
  }, []);

  // Get client projects
  useEffect(() => {
    const fetchClientProjects = async () => {
      try {
        const clientEmail = localStorage.getItem('clientEmail');
        if (!clientEmail) return;
        
        const response = await axiosInstance.get(`/api/projects/client?email=${clientEmail}`);
        setRecentProjects(response.data);
        
        // Calculate stats
        const stats = {
          totalProjects: response.data.length,
          activeProjects: response.data.filter(p => p.status === 'Open' || p.status === 'In Progress').length,
          completedProjects: response.data.filter(p => p.status === 'Completed').length,
          pendingInvoices: response.data.filter(p => p.status === 'Completed' && !p.isPaid).length || 0
        };
        
        setProjectStats(stats);
        
        // Fetch proposals for each project
        const proposalsData = {};
        for (const project of response.data) {
          if (project.status === 'Open') {
            const proposalsRes = await axiosInstance.get(`/api/proposals/project/${project.id}`);
            proposalsData[project.id] = proposalsRes.data;
          }
        }
        setProjectProposals(proposalsData);
      } catch (error) {
        console.error('Error fetching client projects:', error);
      }
    };

    fetchClientProjects();
  }, []);


  const handleAcceptProposal = async (proposalId) => {
    try {
      setLoadingProposals(true);
      const response = await axiosInstance.put(`/api/proposals/${proposalId}/accept`);
      
      // Update local state
      const updatedProposals = {...projectProposals};
      for (const projectId in updatedProposals) {
        updatedProposals[projectId] = updatedProposals[projectId].map(proposal => {
          if (proposal.id === proposalId) {
            return response.data;
          }
          return proposal;
        });
      }
      setProjectProposals(updatedProposals);
      
      // Refresh projects
      const clientEmail = localStorage.getItem('clientEmail');
      const projectsRes = await axiosInstance.get(`/api/projects/client?email=${clientEmail}`);
      setRecentProjects(projectsRes.data);
    } catch (error) {
      console.error('Error accepting proposal:', error);
      alert(error.response?.data?.message || 'Failed to accept proposal');
    } finally {
      setLoadingProposals(false);
    }
  };

  // Handle rejecting a proposal
  const handleRejectProposal = async (proposalId) => {
    try {
      setLoadingProposals(true);
      const response = await axiosInstance.put(`/api/proposals/${proposalId}/reject`);
      
      // Update local state
      const updatedProposals = {...projectProposals};
      for (const projectId in updatedProposals) {
        updatedProposals[projectId] = updatedProposals[projectId].map(proposal => {
          if (proposal.id === proposalId) {
            return response.data;
          }
          return proposal;
        });
      }
      setProjectProposals(updatedProposals);
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert(error.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setLoadingProposals(false);
    }
  };


  // Improved freelancer search function with better error handling
  const handleFreelancerSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);
    
    try {
      // Encode the search query to handle spaces/special characters
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      console.log(`Searching for: ${encodedQuery}`);
      
      // Simplified request with proper error handling
      const response = await axiosInstance.get(`/api/auth/freelancer/search?skill=${encodedQuery}`);
      
      console.log('Search response:', response);
      
      if (Array.isArray(response.data)) {
        setSearchResults(response.data);
        if (response.data.length === 0) {
          console.log('No freelancers found matching the criteria');
        }
      } else {
        console.error('Unexpected response format:', response.data);
        setSearchError('Received unexpected data format from server');
      }
    } catch (error) {
      console.error('Search error details:', error);

      let errorMessage = 'Failed to search freelancers';
      
      if (error.response) {
        // Server responded with an error status
        const status = error.response.status;
        const errorData = error.response.data;
        
        errorMessage = `Error (${status}): ${errorData || 'Unknown server error'}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        // Error in setting up the request
        errorMessage = `Request error: ${error.message}`;
      }

      setSearchError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle project form input change
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProjectForm({
      ...projectForm,
      [id]: value
    });
    
    // Clear error when user starts typing
    if (formErrors[id]) {
      setFormErrors({
        ...formErrors,
        [id]: ''
      });
    }
  };

  // Validate project form
  const validateForm = () => {
    const errors = {};
    
    if (!projectForm.title.trim()) {
      errors.title = 'Project title is required';
    }
    
    if (!projectForm.description.trim()) {
      errors.description = 'Project description is required';
    }
    
    if (!projectForm.budget.trim()) {
      errors.budget = 'Budget is required';
    } else if (isNaN(parseFloat(projectForm.budget)) || parseFloat(projectForm.budget) <= 0) {
      errors.budget = 'Budget must be a positive number';
    }
    
    if (!projectForm.deadline) {
      errors.deadline = 'Deadline is required';
    } else {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const selectedDate = new Date(projectForm.deadline);
      
      if (selectedDate < currentDate) {
        errors.deadline = 'Deadline cannot be in the past';
      }
    }
    
    if (!projectForm.requiredSkills.trim()) {
      errors.requiredSkills = 'Required skills are required';
    }
    
    return errors;
  };

  // Handle project form submission
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    
    // Reset states
    setSubmitSuccess(false);
    setSubmitError('');
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const clientEmail = localStorage.getItem('clientEmail');
      if (!clientEmail) {
        throw new Error('No client email found');
      }
      
      const projectData = {
        title: projectForm.title,
        description: projectForm.description,
        budget: parseFloat(projectForm.budget),
        deadline: projectForm.deadline,
        requiredSkills: projectForm.requiredSkills,
        clientEmail: clientEmail
      };
      
      await axiosInstance.post('/api/projects', projectData);
      
      // Reset form
      setProjectForm({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        requiredSkills: ''
      });
      
      setSubmitSuccess(true);
      
      // Refresh projects after successful submission
      const response = await axiosInstance.get(`/api/projects/client?email=${clientEmail}`);
      setRecentProjects(response.data.slice(0, 5));
      
      // Update stats
      const stats = {
        totalProjects: response.data.length,
        activeProjects: response.data.filter(p => p.status === 'Open' || p.status === 'In Progress').length,
        completedProjects: response.data.filter(p => p.status === 'Completed').length,
        pendingInvoices: response.data.filter(p => p.status === 'Completed' && !p.isPaid).length || 0
      };
      
      setProjectStats(stats);
      
    } catch (error) {
      console.error('Error posting project:', error);
      setSubmitError('Failed to post project. Please try again.');
    }
  };

  const navigationItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      section: 'dashboard' 
    },
    { icon: Briefcase, label: 'Proposals', section: 'proposals' },
    { 
      icon: Plus, 
      label: 'Post Project', 
      section: 'post-project' 
    },
    
    { 
      icon: MessageCircle, 
      label: 'Messages', 
      section: 'messages' 
    },
    { 
      icon: User, 
      label: 'Profile', 
      section: 'profile' 
    }
  ];

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Render different sections based on activeSection
  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard':
        return (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              {[
                { 
                  icon: FileText, 
                  title: 'Total Projects', 
                  value: projectStats.totalProjects 
                },
                { 
                  icon: CheckCircle, 
                  title: 'Completed Projects', 
                  value: projectStats.completedProjects 
                },
                { 
                  icon: DollarSign, 
                  title: 'Pending Invoices', 
                  value: projectStats.pendingInvoices 
                }
              ].map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">
                    <stat.icon size={30} color="#1a73e8" />
                  </div>
                  <div>
                    <h4>{stat.title}</h4>
                    <h3>{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Projects */}
            <div className="recent-projects">
              <h2>Recent Projects</h2>
              {recentProjects.length > 0 ? (
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Budget</th>
                      <th>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProjects.map((project) => (
                      <tr key={project.id}>
                        <td>{project.title}</td>
                        <td>
                          <span 
                            className={`project-status ${
                              project.status === 'Open' 
                                ? 'status-open' 
                                : project.status === 'In Progress'
                                ? 'status-in-progress'
                                : 'status-completed'
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td>${project.budget.toFixed(2)}</td>
                        <td>{formatDate(project.deadline)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No projects found. Start by posting your first project!</p>
              )}
            </div>
          </>
        );


        case 'proposals':
        return (
          <div className="proposals-section">
            <h2>Project Proposals</h2>
            {loadingProposals ? (
              <div className="loading-spinner">Loading proposals...</div>
            ) : (
              <div className="proposals-container">
                {recentProjects.filter(p => p.status === 'Open').length > 0 ? (
                  recentProjects.filter(p => p.status === 'Open').map(project => (
                    <div key={project.id} className="project-card">
                      <div className="project-header">
                        <h3>{project.title}</h3>
                        <span className="project-status status-open">{project.status}</span>
                      </div>
                      
                      <div className="proposals-list">
                        <h4>Proposals ({projectProposals[project.id]?.length || 0})</h4>
                        
                        {projectProposals[project.id]?.length > 0 ? (
                          projectProposals[project.id].map(proposal => (
                            <div key={proposal.id} className="proposal-card">
                              <div className="proposal-header">
                                <div className="freelancer-info">
                                  <User size={16} />
                                  <span>{proposal.freelancer.name}</span>
                                </div>
                                <span className={`proposal-status ${proposal.status.toLowerCase()}`}>
                                  {proposal.status}
                                </span>
                              </div>
                              
                              <div className="proposal-details">
                                <p><strong>Bid Amount:</strong> ${proposal.bidAmount.toFixed(2)}</p>
                                <p><strong>Submitted:</strong> {new Date(proposal.submittedAt).toLocaleString()}</p>
                              </div>
                              
                              <div className="proposal-cover-letter">
                                <p>{proposal.coverLetter}</p>
                              </div>
                              
                              {proposal.status === 'Pending' && (
                                <div className="proposal-actions">
                                  <button 
                                    className="btn-accept"
                                    onClick={() => handleAcceptProposal(proposal.id)}
                                  >
                                    <Check size={16} /> Accept
                                  </button>
                                  <button 
                                    className="btn-reject"
                                    onClick={() => handleRejectProposal(proposal.id)}
                                  >
                                    <X size={16} /> Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p>No proposals received yet for this project.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>You currently have no open projects with proposals.</p>
                )}
              </div>
            )}
          </div>
        );
      
      case 'post-project':
        return (
          <div className="post-project-section">
            <h2>Post a New Project</h2>
            
            {submitSuccess && (
              <div className="success-message">
                Project posted successfully! Freelancers can now view and bid on your project.
              </div>
            )}
            
            {submitError && (
              <div className="error-message">
                {submitError}
              </div>
            )}
            
            <form className="post-project-form" onSubmit={handleSubmitProject}>
              <div className="form-group">
                <label htmlFor="title">Project Title</label>
                <input 
                  type="text" 
                  id="title" 
                  placeholder="Enter project title" 
                  value={projectForm.title}
                  onChange={handleInputChange}
                  className={formErrors.title ? 'error' : ''}
                />
                {formErrors.title && <span className="error-text">{formErrors.title}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Project Description</label>
                <textarea 
                  id="description" 
                  placeholder="Describe your project in detail"
                  rows="4"
                  value={projectForm.description}
                  onChange={handleInputChange}
                  className={formErrors.description ? 'error' : ''}
                ></textarea>
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="budget">Budget ($)</label>
                  <input 
                    type="text" 
                    id="budget" 
                    placeholder="Enter project budget" 
                    value={projectForm.budget}
                    onChange={handleInputChange}
                    className={formErrors.budget ? 'error' : ''}
                  />
                  {formErrors.budget && <span className="error-text">{formErrors.budget}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="deadline">Deadline</label>
                  <input 
                    type="date" 
                    id="deadline"
                    value={projectForm.deadline}
                    onChange={handleInputChange}
                    className={formErrors.deadline ? 'error' : ''}
                  />
                  {formErrors.deadline && <span className="error-text">{formErrors.deadline}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="requiredSkills">Required Skills</label>
                <input 
                  type="text" 
                  id="requiredSkills" 
                  placeholder="e.g., React, Node.js, Python" 
                  value={projectForm.requiredSkills}
                  onChange={handleInputChange}
                  className={formErrors.requiredSkills ? 'error' : ''}
                />
                {formErrors.requiredSkills && <span className="error-text">{formErrors.requiredSkills}</span>}
              </div>
              
              <button type="submit" className="submit-project-btn">
                Post Project
              </button>
            </form>
          </div>
        );
      
      
      
      case 'messages':
        return (
          <div className="messages-section">
            <h2>Messages</h2>
            <div className="messages-container">
              <p>No messages at the moment.</p>
            </div>
          </div>
        );
      
        case 'profile':
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
      default:
        return null;
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