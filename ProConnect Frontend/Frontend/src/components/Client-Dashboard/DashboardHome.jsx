import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, DollarSign, Star } from 'lucide-react';
import axiosInstance from '../config/axiosConfig';
import Modal from 'react-modal';

// Make sure to bind modal to your appElement (for accessibility reasons)
Modal.setAppElement('#root');

const DashboardHome = ({ clientData, projectStats, setProjectStats }) => {
  const [recentProjects, setRecentProjects] = useState([]);
  const [feedbackModalIsOpen, setFeedbackModalIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Check if project deadline has passed
  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    try {
      if (!selectedProject || !selectedProject.freelancerId) return;
      
      const response = await axiosInstance.post('/api/ratings', { // removed /api from URL if baseURL already includes it
        freelancerId: selectedProject.freelancerId,
        projectId: selectedProject.id,
        rating,
        message: feedbackMessage,
        clientId: clientData.id
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Add any additional required headers here
        }
      });
  
      console.log('Feedback submitted successfully:', response.data);
      
      // Update the project to mark feedback as given
      const updatedProjects = recentProjects.map(project => 
        project.id === selectedProject.id 
          ? { ...project, hasFeedback: true } 
          : project
      );
      
      setRecentProjects(updatedProjects);
      setFeedbackModalIsOpen(false);
      setRating(0);
      setFeedbackMessage('');
      
      // Show success message
      alert('Feedback submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Show detailed error message to user
      alert(`Failed to submit feedback: ${error.response?.data?.message || error.message}`);
    }
  };

  // Get client projects
  const fetchClientProjects = async () => {
    try {
      const clientEmail = localStorage.getItem('clientEmail');
      if (!clientEmail) return;
      
      const response = await axiosInstance.get(`/api/projects/client?email=${clientEmail}`);
      
      // Update project status if deadline has passed
      const updatedProjects = response.data.map(project => {
        if ((project.status === 'Open' || project.status === 'In Progress') && isDeadlinePassed(project.deadline)) {
          return { ...project, status: 'Completed' };
        }
        return project;
      });
      
      setRecentProjects(updatedProjects);
      
      // Calculate stats
      const stats = {
        totalProjects: updatedProjects.length,
        activeProjects: updatedProjects.filter(p => p.status === 'Open' || p.status === 'In Progress').length,
        completedProjects: updatedProjects.filter(p => p.status === 'Completed').length,
        pendingInvoices: updatedProjects.filter(p => p.status === 'Completed' && !p.isPaid).length || 0
      };
      
      setProjectStats(stats);
    } catch (error) {
      console.error('Error fetching client projects:', error);
    }
  };

  useEffect(() => {
    fetchClientProjects();
  }, [setProjectStats]);

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
                <th>Feedback</th>
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
                  <td>
                    {project.status === 'Completed' && project.freelancerId && !project.hasFeedback ? (
                      <button 
                        onClick={() => {
                          setSelectedProject(project);
                          setFeedbackModalIsOpen(true);
                        }}
                        className="feedback-button"
                      >
                        Give Feedback
                      </button>
                    ) : project.hasFeedback ? (
                      <span className="feedback-given">Feedback Submitted</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No projects found. Start by posting your first project!</p>
        )}
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModalIsOpen}
        onRequestClose={() => setFeedbackModalIsOpen(false)}
        className="feedback-modal"
        overlayClassName="feedback-overlay"
      >
        <h2>Rate Freelancer for {selectedProject?.title}</h2>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={30}
              color={star <= (hoverRating || rating) ? '#FFD700' : '#C0C0C0'}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              style={{ cursor: 'pointer', margin: '0 5px' }}
            />
          ))}
        </div>
        <textarea
          placeholder="Write your feedback here..."
          value={feedbackMessage}
          onChange={(e) => setFeedbackMessage(e.target.value)}
          className="feedback-textarea"
        />
        <div className="modal-buttons">
          <button onClick={() => setFeedbackModalIsOpen(false)} className="cancel-button">
            Cancel
          </button>
          <button 
            onClick={handleSubmitFeedback} 
            className="submit-button"
            disabled={rating === 0}
          >
            Submit Feedback
          </button>
        </div>
      </Modal>
    </>
  );
};

export default DashboardHome;