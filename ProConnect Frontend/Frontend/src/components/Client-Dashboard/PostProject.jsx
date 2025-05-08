import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axiosConfig';
import './PostProject.css';

const PostProject = ({ setProjectStats }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
    requiredSkills: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProjectForm({
      ...projectForm,
      [id]: value
    });

    if (formErrors[id]) {
      setFormErrors({
        ...formErrors,
        [id]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!projectForm.title.trim()) {
      errors.title = 'Project title is required';
    }

    if (!projectForm.description.trim()) {
      errors.description = 'Project description is required';
    }

    if (!projectForm.category) {
      errors.category = 'Category is required';
    }

    if (!projectForm.budget.trim()) {
      errors.budget = 'Budget is required';
    } else if (isNaN(parseFloat(projectForm.budget))) {
      errors.budget = 'Budget must be a number';
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

  const handleSubmitProject = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || user?.userType !== 'client') {
      navigate('/login');
      return;
    }

    setSubmitError('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const projectData = {
        title: projectForm.title,
        description: projectForm.description,
        budget: parseFloat(projectForm.budget),
        deadline: projectForm.deadline,
        requiredSkills: projectForm.requiredSkills,
        category: projectForm.category,
        clientEmail: user.email
      };

      await axiosInstance.post('/api/projects', projectData, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      // Reset form
      setProjectForm({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        category: '',
        requiredSkills: ''
      });

      // Update project stats
      const response = await axiosInstance.get(`/api/projects/client?email=${user.email}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      const stats = {
        totalProjects: response.data.length,
        activeProjects: response.data.filter(p => p.status === 'Open' || p.status === 'In Progress').length,
        completedProjects: response.data.filter(p => p.status === 'Completed').length,
        pendingInvoices: response.data.filter(p => p.status === 'Completed' && !p.isPaid).length || 0
      };

      setProjectStats(stats);

      // Redirect to dashboard
      navigate('/ClientDashboard');

    } catch (error) {
      console.error('Error posting project:', error);
      setSubmitError('Failed to post project. Please try again.');

      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  if (!isAuthenticated || user?.userType !== 'client') {
    navigate('/login');
    return null;
  }

  return (
      <div className="new-project-section">
        <h2>Post a New Project</h2>

        {submitError && (
            <div className="new-error-message">
              {submitError}
            </div>
        )}

        <form className="new-project-form" onSubmit={handleSubmitProject}>
          <div className="new-form-group">
            <label htmlFor="title">Project Title</label>
            <input
                type="text"
                id="title"
                placeholder="Enter project title"
                value={projectForm.title}
                onChange={handleInputChange}
                className={formErrors.title ? 'new-error' : ''}
            />
            {formErrors.title && <span className="new-error-text">{formErrors.title}</span>}
          </div>

          <div className="new-form-group">
            <label htmlFor="description">Project Description</label>
            <textarea
                id="description"
                placeholder="Describe your project in detail"
                rows="4"
                value={projectForm.description}
                onChange={handleInputChange}
                className={formErrors.description ? 'new-error' : ''}
            ></textarea>
            {formErrors.description && <span className="new-error-text">{formErrors.description}</span>}
          </div>

          <div className="new-form-group">
            <label htmlFor="category">Project Category</label>
            <select
                id="category"
                value={projectForm.category}
                onChange={handleInputChange}
                className={formErrors.category ? 'new-error' : ''}
            >
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App">Mobile App</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Data Science">Data Science</option>
              <option value="DevOps">DevOps</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.category && <span className="new-error-text">{formErrors.category}</span>}
          </div>

          <div className="new-form-row">
            <div className="new-form-group">
              <label htmlFor="budget">Budget ($)</label>
              <input
                  type="text"
                  id="budget"
                  placeholder="Enter project budget"
                  value={projectForm.budget}
                  onChange={handleInputChange}
                  className={formErrors.budget ? 'new-error' : ''}
              />
              {formErrors.budget && <span className="new-error-text">{formErrors.budget}</span>}
            </div>

            <div className="new-form-group">
              <label htmlFor="deadline">Deadline</label>
              <input
                  type="date"
                  id="deadline"
                  value={projectForm.deadline}
                  onChange={handleInputChange}
                  className={formErrors.deadline ? 'new-error' : ''}
              />
              {formErrors.deadline && <span className="new-error-text">{formErrors.deadline}</span>}
            </div>
          </div>

          <div className="new-form-group">
            <label htmlFor="requiredSkills">Required Skills</label>
            <input
                type="text"
                id="requiredSkills"
                placeholder="e.g., React, Node.js, Python"
                value={projectForm.requiredSkills}
                onChange={handleInputChange}
                className={formErrors.requiredSkills ? 'new-error' : ''}
            />
            {formErrors.requiredSkills && <span className="new-error-text">{formErrors.requiredSkills}</span>}
          </div>

          <button type="submit" className="new-submit-project-btn">
            Post Project
          </button>
        </form>
      </div>
  );
};

export default PostProject;
