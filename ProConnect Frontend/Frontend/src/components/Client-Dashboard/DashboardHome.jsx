import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, DollarSign } from 'lucide-react';
import axiosInstance from '../config/axiosConfig';

const DashboardHome = ({ clientData, projectStats, setProjectStats }) => {
  const [recentProjects, setRecentProjects] = useState([]);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

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
      } catch (error) {
        console.error('Error fetching client projects:', error);
      }
    };

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
};

export default DashboardHome;