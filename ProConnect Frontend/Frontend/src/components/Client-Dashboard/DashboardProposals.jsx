import React, { useState, useEffect } from 'react';
import { User, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axiosConfig';
import './DashboardProposals.css';

const DashboardProposals = () => {
  const { user } = useAuth();
  const [recentProjects, setRecentProjects] = useState([]);
  const [projectProposals, setProjectProposals] = useState({});
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientProjects = async () => {
      try {
        setLoadingProposals(true);
        setError(null);

        const userEmail = user?.email || localStorage.getItem('userEmail');
        const userToken = user?.token;

        if (!userEmail) {
          setError("No user email found");
          setLoadingProposals(false);
          return;
        }

        const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {};
        const response = await axiosInstance.get(`/api/projects/client?email=${userEmail}`, { headers });
        setRecentProjects(response.data);

        const proposalsData = {};
        for (const project of response.data) {
          try {
            const proposalsRes = await axiosInstance.get(`/api/proposals/project/${project.id}`, { headers });
            proposalsData[project.id] = Array.isArray(proposalsRes.data) ? proposalsRes.data : [];
          } catch (err) {
            console.error(`Error fetching proposals for project ${project.id}:`, err);
            proposalsData[project.id] = [];
          }
        }

        setProjectProposals(proposalsData);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.response?.data?.message || 'Failed to load projects');
      } finally {
        setLoadingProposals(false);
      }
    };

    fetchClientProjects();
  }, [user]);

  const handleAcceptProposal = async (proposalId) => {
    try {
      setLoadingProposals(true);
      const response = await axiosInstance.put(`/api/proposals/${proposalId}/accept`, null, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const updatedProposals = { ...projectProposals };
      for (const projectId in updatedProposals) {
        updatedProposals[projectId] = updatedProposals[projectId].map(proposal =>
          proposal.id === proposalId ? response.data : proposal
        );
      }
      setProjectProposals(updatedProposals);
      setError(null);
    } catch (err) {
      console.error('Error accepting proposal:', err);
      setError(err.response?.data?.message || 'Failed to accept proposal');
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      setLoadingProposals(true);
      const response = await axiosInstance.put(`/api/proposals/${proposalId}/reject`, null, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const updatedProposals = { ...projectProposals };
      for (const projectId in updatedProposals) {
        updatedProposals[projectId] = updatedProposals[projectId].map(proposal =>
          proposal.id === proposalId ? { ...proposal, status: 'Rejected' } : proposal
        );
      }
      setProjectProposals(updatedProposals);
      setError(null);
    } catch (err) {
      console.error('Error rejecting proposal:', err);
      setError(err.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setLoadingProposals(false);
    }
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="proposals-section">
      <h2>Project Proposals</h2>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loadingProposals ? (
        <div className="loading-spinner">Loading proposals...</div>
      ) : (
        <div className="proposals-container">
          {recentProjects.filter(p => p.status === 'Open').length > 0 ? (
            recentProjects
              .filter(project => project.status === 'Open')
              .map(project => (
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
                              <span>{proposal.freelancer?.name || 'Unknown Freelancer'}</span>
                            </div>
                            <span className={`proposal-status ${(proposal.status || '').toLowerCase()}`}>
                              {proposal.status || 'Unknown'}
                            </span>
                          </div>

                          <div className="proposal-details">
                            <p><strong>Bid Amount:</strong> ${proposal.bidAmount?.toFixed(2) || '0.00'}</p>
                            <p><strong>Submitted:</strong> {proposal.submittedAt ? new Date(proposal.submittedAt).toLocaleString() : 'Unknown'}</p>
                          </div>

                          <div className="proposal-cover-letter">
                            <p>{proposal.coverLetter || 'No cover letter provided.'}</p>
                          </div>

                          {proposal.status === 'Pending' && (
                            <div className="proposal-actions">
                              <button
                                className="btn-accept"
                                onClick={() => handleAcceptProposal(proposal.id)}
                                disabled={loadingProposals}
                              >
                                <Check size={16} /> Accept
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => handleRejectProposal(proposal.id)}
                                disabled={loadingProposals}
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
            <p className="no-results">No matching projects found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardProposals;
