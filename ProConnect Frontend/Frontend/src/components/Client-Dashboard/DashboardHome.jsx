import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, DollarSign, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axiosConfig';
import Modal from 'react-modal';
import './DashboardHome.css';

Modal.setAppElement('#root');

const DashboardHome = ({ clientData, projectStats, setProjectStats }) => {
    const { user } = useAuth();
    const [recentProjects, setRecentProjects] = useState([]);
    const [feedbackModalIsOpen, setFeedbackModalIsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [rating, setRating] = useState(0);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const isDeadlinePassed = (deadline) => {
        return new Date(deadline) < new Date();
    };

    const checkFeedbackExists = async (projectId) => {
        try {
            if (!clientData?.id || !projectId) return false;
            
            const response = await axiosInstance.get('/api/ratings/check-rating', {
                params: {
                    projectId,
                    clientId: clientData.id
                },
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error checking feedback:', error);
            return false;
        }
    };

    // Fetch client ID if not available
    const fetchClientId = async () => {
        if (!clientData?.id && user?.email) {
            try {
                const response = await axiosInstance.get(`/api/auth/client?email=${user.email}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                });
                return response.data.id;
            } catch (error) {
                console.error('Error fetching client ID:', error);
                return null;
            }
        }
        return clientData?.id;
    };

    const fetchClientProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!user?.email || !user?.token) {
                throw new Error('Authentication required');
            }

            const response = await axiosInstance.get(`/api/projects/client?email=${user.email}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            const projectsWithFeedback = await Promise.all(
                response.data.map(async (project) => {
                    const isCompleted = project.status === 'Completed' || isDeadlinePassed(project.deadline);
                    const hasFeedback = isCompleted && project.freelancerId 
                        ? await checkFeedbackExists(project.id) 
                        : false;

                    return {
                        ...project,
                        status: isCompleted ? 'Completed' : project.status,
                        hasFeedback
                    };
                })
            );

            setRecentProjects(projectsWithFeedback);

            const stats = {
                totalProjects: projectsWithFeedback.length,
                activeProjects: projectsWithFeedback.filter(p => p.status === 'Open' || p.status === 'In Progress').length,
                completedProjects: projectsWithFeedback.filter(p => p.status === 'Completed').length,
                pendingInvoices: projectsWithFeedback.filter(p => p.status === 'Completed' && !p.isPaid).length || 0
            };

            setProjectStats(stats);
        } catch (error) {
            console.error('Error fetching client projects:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async () => {
        try {
            // Validate project and freelancer
            if (!selectedProject || !selectedProject.freelancerId) {
                throw new Error('No project selected or freelancer not assigned');
            }
            
            // Get client ID if not available
            const clientId = await fetchClientId();
            
            if (!clientId) {
                throw new Error('Client information not available');
            }
            
            if (rating === 0) {
                throw new Error('Please select a rating');
            }
    
            const payload = {
                freelancerId: selectedProject.freelancerId,
                projectId: selectedProject.id,
                rating: rating , // Convert to 1-10 scale
                message: feedbackMessage,
                clientId: clientId
            };
            
            console.log('Submitting feedback with:', payload);
    
            const response = await axiosInstance.post(
                '/api/ratings',
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`
                    }
                }
            );
    
            console.log('Feedback submission response:', response.data);
    
            // Update the UI
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
            console.error('Detailed feedback submission error:', {
                error: error.response?.data || error.message,
                status: error.response?.status,
                headers: error.response?.headers
            });
    
            let errorMessage = 'Failed to submit feedback';
            if (error.response) {
                // The request was made and the server responded with a status code
                errorMessage = error.response.data?.message || 
                             `Server error: ${error.response.status}`;
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = 'No response from server';
            } else {
                errorMessage = error.message;
            }
    
            alert(`${errorMessage}. Please try again.`);
        }
    };
    
    // Fetch projects when user or clientData changes
    useEffect(() => {
        if (user?.email) {
            fetchClientProjects();
        }
    }, [user, clientData]);

    return (
        <>
            <div className="stats-grid">
                {[
                    { icon: FileText, title: 'Total Projects', value: projectStats.totalProjects },
                    { icon: CheckCircle, title: 'Completed Projects', value: projectStats.completedProjects },
                    { icon: DollarSign, title: 'Pending Invoices', value: projectStats.pendingInvoices }
                ].map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon">
                            <stat.icon size={30} color="#4f46e5" />
                        </div>
                        <div>
                            <h4>{stat.title}</h4>
                            <h3>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="recent-projects">
                <h2>Recent Projects</h2>
                {loading ? (
                    <p>Loading projects...</p>
                ) : error ? (
                    <p className="error-message">Error: {error}</p>
                ) : recentProjects.length > 0 ? (
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
                                        <span className={`project-status status-${project.status.toLowerCase()}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td>${project.budget.toFixed(2)}</td>
                                    <td>{formatDate(project.deadline)}</td>
                                    <td>
                                        {project.status === 'Completed' && project.freelancerId ? (
                                            project.hasFeedback ? (
                                                <span className="feedback-given">
                                                    <CheckCircle size={16} /> Feedback Submitted
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedProject(project);
                                                        setFeedbackModalIsOpen(true);
                                                    }}
                                                    className="feedback-button"
                                                >
                                                    Give Feedback
                                                </button>
                                            )
                                        ) : (
                                            <span className="no-feedback">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No projects found. Start by posting your first project!</p>
                )}
            </div>

            <Modal
                isOpen={feedbackModalIsOpen}
                onRequestClose={() => {
                    setFeedbackModalIsOpen(false);
                    setRating(0);
                    setFeedbackMessage('');
                }}
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
                <p>Rating: {rating} of 5</p>
                <textarea
                    placeholder="Write your feedback here..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    className="feedback-textarea"
                    rows={5}
                />
                <div className="modal-buttons">
                    <button 
                        onClick={() => {
                            setFeedbackModalIsOpen(false);
                            setRating(0);
                            setFeedbackMessage('');
                        }} 
                        className="cancel-button"
                    >
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
