import React, { useState, useEffect } from 'react';
import { Search, Clock, DollarSign, Calendar, Zap } from 'lucide-react';
import axiosInstance from '../config/axiosConfig';
import './BrowseProjectsSection.css';

const BrowseProjectsSection = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [freelancerId, setFreelancerId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get('/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFreelancerId = async () => {
      try {
        const email = localStorage.getItem('freelancerEmail');
        if (email) {
          const response = await axiosInstance.get(`/api/auth/freelancer/freelancer?email=${email}`);
          setFreelancerId(response.data.id);
        }
      } catch (error) {
        console.error('Error fetching freelancer ID:', error);
      }
    };

    fetchProjects();
    fetchFreelancerId();
  }, []);

  const handleApplyClick = (project) => {
    if (!freelancerId) {
      alert('Please log in as a freelancer to apply for projects');
      return;
    }
    setSelectedProject(project);
    setShowApplyModal(true);
    setBidAmount(project.budget ? (project.budget * 0.8).toFixed(2) : ''); // Suggest 80% of project budget
  };

  const handleSubmitApplication = async () => {
    try {
      if (!coverLetter || !bidAmount) {
        alert('Please fill in all fields');
        return;
      }
  
      const response = await axiosInstance.post('/api/proposals', {
        projectId: selectedProject.id,
        freelancerId: freelancerId, // Make sure this is properly set
        coverLetter: coverLetter,
        bidAmount: parseFloat(bidAmount)
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      setApplicationSuccess(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setApplicationSuccess(false);
        setCoverLetter('');
        setBidAmount('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting proposal:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        alert(`Error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        alert('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        alert('Error: ' + error.message);
      }
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.requiredSkills?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || project.status?.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline specified';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return <div className="loading-container">Loading projects...</div>;
  }

  return (
    <div className="browse-projects-container">
      <div className="projects-container">
      {/* Modal for applying to project */}
      {showApplyModal && (
        <div className="modal-overlay"> 
          <div className="apply-modal">
            <h2>Apply for {selectedProject?.title}</h2>
            
            {applicationSuccess ? (
              <div className="success-message">
                <p>Your application has been submitted successfully!</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Cover Letter</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Explain why you're the best fit for this project..."
                    rows={6}
                  />
                </div>
                
                <div className="form-group">
                  <label>Your Bid Amount ($)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter your bid amount"
                  />
                  <small>Project budget: ${selectedProject?.budget?.toLocaleString()}</small>
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="btn-cancel"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-submit"
                    onClick={handleSubmitApplication}
                  >
                    Submit Proposal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

<div className="projects-header">
          <h1>Browse Projects</h1>
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

      <div className="projects-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Projects
        </button>
        <button 
          className={`tab ${activeTab === 'open' ? 'active' : ''}`}
          onClick={() => setActiveTab('open')}
        >
          Open
        </button>
        <button 
          className={`tab ${activeTab === 'in progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('in progress')}
        >
          In Progress
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.title || 'Untitled Project'}</h3>
                <span className={`project-status ${project.status?.toLowerCase().replace(' ', '-')}`}>
                  {project.status || 'Unknown Status'}
                </span>
              </div>
              <p className="project-client">Posted by: {project.clientEmail || 'Unknown Client'}</p>
              
              <p className="project-description">
                {project.description ? 
                  (project.description.length > 150 
                    ? `${project.description.substring(0, 150)}...` 
                    : project.description)
                  : 'No description provided'}
              </p>
              
              <div className="project-skills">
                {project.requiredSkills ? 
                  project.requiredSkills.split(',').map((skill, index) => (
                    <span key={index} className="skill-tag">{skill.trim()}</span>
                  ))
                  : <span className="skill-tag">No skills specified</span>
                }
              </div>
              
              <div className="project-details">
                <div className="detail-item">
                  <DollarSign size={16} />
                  <span>${project.budget ? project.budget.toLocaleString() : 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>{formatDate(project.deadline)}</span>
                </div>
              </div>
              
              <button 
                className="btn-apply"
                onClick={() => handleApplyClick(project)}
                disabled={project.status?.toLowerCase() !== 'open'}
              >
                <Zap size={16} />
                {project.status?.toLowerCase() === 'open' ? 'Apply Now' : 'Not Accepting Applications'}
              </button>
            </div>
          ))
        ) : (
          <div className="no-projects">
            <p>No projects found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default BrowseProjectsSection;