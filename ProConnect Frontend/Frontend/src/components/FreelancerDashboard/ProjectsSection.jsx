import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Clock, MoreVertical } from 'lucide-react';
import axiosInstance from '../config/axiosConfig';
import './ProjectsSection.css';

const ProjectsSection = ({ freelancerId }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'

  const calculateProjectStatus = (project) => {
    const now = new Date();
    const deadline = new Date(project.deadline);
    const startDate = new Date(project.createdAt);
    
    // Calculate time values
    const totalDuration = deadline - startDate;
    const elapsedTime = now - startDate;
    
    // Determine status based on deadline
    const isCompleted = now > deadline;
    const status = isCompleted ? 'Completed' : 'In Progress';
    
    // Calculate progress (0-100)
    let progress = 0;
    if (totalDuration > 0) {
      progress = Math.min(Math.round((elapsedTime / totalDuration) * 100), 100);
    }
    
    // Calculate days remaining (always positive)
    const daysRemaining = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
    
    return {
      ...project,
      status,
      progress: isCompleted ? 100 : progress,
      daysRemaining,
      isOverdue: !isCompleted && daysRemaining === 0
    };
  };

  useEffect(() => {
    const fetchFreelancerProjects = async () => {
      try {
        const idToUse = freelancerId || localStorage.getItem('freelancerId');
        if (!idToUse) throw new Error('Freelancer ID not found');

        const response = await axiosInstance.get(`/api/projects/freelancer/${idToUse}`);
        
        // Calculate status and progress for each project
        const updatedProjects = response.data.map(calculateProjectStatus);
        
        setProjects(updatedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerProjects();

    // Set up interval to check project statuses periodically
    const interval = setInterval(() => {
      setProjects(prevProjects => prevProjects.map(calculateProjectStatus));
    }, 3600000); // Check every hour

    return () => clearInterval(interval);
  }, [freelancerId]);

  const handleCompleteProject = async (projectId) => {
    try {
      await axiosInstance.put(`/api/projects/${projectId}/complete`);
      setProjects(prev => prev.map(p => 
        p.id === projectId ? calculateProjectStatus({ ...p, deadline: new Date().toISOString() }) : p
      ));
    } catch (error) {
      console.error('Error completing project:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading projects...</div>;
  }

  // Filter projects based on active tab
  const filteredProjects = projects.filter(project => 
    activeTab === 'active' ? project.status === 'In Progress' : project.status === 'Completed'
  );

  return (
    <div className="projects-section-container">
      <div className="projects-section">
        <div className="section-header">
          <h2>My Projects</h2>
          <div className="project-tabs">
            <button 
              className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({projects.filter(p => p.status === 'In Progress').length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({projects.filter(p => p.status === 'Completed').length})
            </button>
          </div>
        </div>

      
        {filteredProjects.length === 0 ? (
          <div className="no-projects">
            <p>{activeTab === 'active' 
              ? "You don't have any active projects at the moment." 
              : "You haven't completed any projects yet."}
            </p>
          </div>
        ) : (
          <div className="projects-list">
            {filteredProjects.map(project => (
              <div key={project.id} className={`project-card ${project.isOverdue ? 'overdue' : ''} ${project.status.toLowerCase()}`}> <div className="project-header">
                <div className="project-title">
                  <Briefcase className="project-icon" />
                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.client?.name || 'Client'}</p>
                  </div>
                </div>
                <button className="project-actions">
                  <MoreVertical />
                </button>
              </div>
              <div className="project-details">
                <div className="project-status">
                  <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                    {project.isOverdue ? 'Due Today' : project.status}
                  </span>
                  {project.status === 'In Progress' && (
                    <span className="project-deadline">
                      {project.isOverdue ? 'Due today!' : `Due in ${project.daysRemaining} days`}
                    </span>
                  )}
                  {project.status === 'Completed' && (
                    <span className="project-deadline">
                      Completed on {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="project-progress">
                  <div className="progress-info">
                    <span>Project Budget</span>
                    <span>${project.budget?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{width: `${project.progress}%`}}
                    ></div>
                  </div>
                  <span className="progress-percentage">
                    {project.progress}% complete
                  </span>
                </div>
                {project.isOverdue && (
                  <button 
                    className="complete-project-btn"
                    onClick={() => handleCompleteProject(project.id)}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsSection;