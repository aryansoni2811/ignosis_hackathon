import React, { useState, useEffect } from 'react';
import { User, Check, X } from 'lucide-react';
import axiosInstance from '../config/axiosConfig';

const DashboardProposals = () => {
  const [recentProjects, setRecentProjects] = useState([]);
  const [projectProposals, setProjectProposals] = useState({});
  const [loadingProposals, setLoadingProposals] = useState(false);

  useEffect(() => {
    const fetchClientProjects = async () => {
      try {
        const clientEmail = localStorage.getItem('clientEmail');
        if (!clientEmail) return;
        
        const response = await axiosInstance.get(`/api/projects/client?email=${clientEmail}`);
        setRecentProjects(response.data);
        
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
};

export default DashboardProposals;