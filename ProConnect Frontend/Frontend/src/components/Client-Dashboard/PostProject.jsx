import React, { useState } from 'react';
import axiosInstance from '../config/axiosConfig';

const PostProject = ({ setProjectStats }) => {
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
    requiredSkills: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

  const validateForm = () => {
    const errors = {};
    
    if (!projectForm.title.trim()) {
      errors.title = 'Project title is required';
    }
    
    if (!projectForm.description.trim()) {
      errors.description = 'Project description is required';
    }
    if (!projectForm.category) errors.category = 'Category is required';
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
        category: projectForm.category,
        clientEmail: clientEmail
      };
      
      await axiosInstance.post('/api/projects', projectData);
      
      // Reset form
      setProjectForm({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        category: '',
        requiredSkills: ''
      });
      
      setSubmitSuccess(true);
      
      // Refresh projects after successful submission
      const response = await axiosInstance.get(`/api/projects/client?email=${clientEmail}`);
      
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

        <div className="form-group">
          <label htmlFor="category">Project Category</label>
          <select
              id="category"
              value={projectForm.category}
              onChange={handleInputChange}
              className={formErrors.category ? 'error' : ''}
          >
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App">Mobile App</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Data Science">Data Science</option>
              <option value="DevOps">DevOps</option>
              <option value="Other">Other</option>
          </select>
          {formErrors.category && <span className="error-text">{formErrors.category}</span>}
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
};

export default PostProject;