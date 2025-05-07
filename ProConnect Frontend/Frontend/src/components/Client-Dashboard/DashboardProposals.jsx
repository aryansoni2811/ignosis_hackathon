import React, { useState, useEffect } from 'react';
import { User, Check, X, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axiosConfig';
import './DashboardProposals.css';

const DashboardProposals = () => {
  const { user } = useAuth();
  const [recentProjects, setRecentProjects] = useState([]);
  const [projectProposals, setProjectProposals] = useState({});
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectStatus, setProjectStatus] = useState('all');

  useEffect(() => {
    const fetchClientProjects = async () => {
      try {
        setLoadingProposals(true);
        setError(null);

        if (!user?.email || !user?.token) {
          throw new Error('Authentication required');
        }

        const response = await axiosInstance.get(`/api/projects/client?email=${user.email}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        setRecentProjects(response.data);

        const proposalsData = {};
        for (const project of response.data) {
          try {
            const proposalsRes = await axiosInstance.get(`/api/proposals/project/${project.id}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            proposalsData[project.id] = proposalsRes.data;
          } catch (proposalError) {
            console.error(`Error fetching proposals for project ${project.id}:`, proposalError);
          }
        }

        setProjectProposals(proposalsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoadingProposals(false);
      }
    };

    if (user?.email) {
      fetchClientProjects();
    }
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

      const projectsRes = await axiosInstance.get(`/api/projects/client?email=${user.email}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
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
      const response = await axiosInstance.put(`/api/proposals/${proposalId}/reject`, null, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const updatedProposals = { ...projectProposals };
      for (const projectId in updatedProposals) {
        updatedProposals[projectId] = updatedProposals[projectId].map(proposal =>
            proposal.id === proposalId ? response.data : proposal
        );
      }
      setProjectProposals(updatedProposals);
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert(error.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setLoadingProposals(false);
    }
  };

  const getFilteredAndSortedProjects = () => {
    let filtered = [...recentProjects];

    if (projectStatus !== 'all') {
      filtered = filtered.filter(project =>
          project.status.toLowerCase() === projectStatus.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(project =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(project =>
          projectProposals[project.id]?.some(proposal =>
              proposal.status.toLowerCase() === filterStatus.toLowerCase()
          )
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'most-proposals':
          return (projectProposals[b.id]?.length || 0) - (projectProposals[a.id]?.length || 0);
        default:
          return 0;
      }
    });
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
      <div className="proposals-section">
        <div className="proposals-header">
          <h2>Project Proposals</h2>
          <div className="filter-section">
            <div className="search-box">
              <Search size={20} />
              <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <Filter size={20} />
              {/*<select*/}
              {/*    value={projectStatus}*/}
              {/*    onChange={(e) => setProjectStatus(e.target.value)}*/}
              {/*    className="filter-select"*/}
              {/*>*/}
              {/*  <option value="all">All Projects</option>*/}
              {/*  <option value="open">Open Projects</option>*/}
              {/*  <option value="closed">Closed Projects</option>*/}
              {/*</select>*/}

              <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-proposals">Most Proposals</option>
              </select>

              <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
              >
                <option value="all">All Proposals</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loadingProposals ? (
            <div className="loading-spinner">Loading proposals...</div>
        ) : (
            <div className="proposals-grid">
              {getFilteredAndSortedProjects().length > 0 ? (
                  getFilteredAndSortedProjects().map(project => (
                      <div key={project.id} className="project-card">
                        <div className="project-header">
                          <h3>{project.title}</h3>
                          <span className={`project-status status-${project.status.toLowerCase()}`}>
                    {project.status}
                  </span>
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
                                      <span className={`proposal-status ${proposal.status.toLowerCase()}`}>
                            {proposal.status}
                          </span>
                                    </div>

                                    <div className="proposal-details">
                                      <p><strong>Bid Amount:</strong> ${proposal.bidAmount?.toFixed(2)}</p>
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