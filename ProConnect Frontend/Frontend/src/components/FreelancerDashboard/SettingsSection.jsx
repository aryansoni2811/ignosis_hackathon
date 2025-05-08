import React, { useState, useEffect } from 'react';
import {
  User, Edit2, Camera, Award, ChevronRight,
  Plus, X, Shield, CheckCircle, BarChart2,
  FileText, Smartphone, Globe, Mail
} from 'lucide-react';
import './SettingsSection.css';
import axiosInstance from '../config/axiosConfig';

const SettingsSection = ({ freelancerData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: freelancerData.name || '',
    email: freelancerData.email || '',
    phone: freelancerData.phone || '',
    location: freelancerData.location || ''
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({
    name: '',
    proficiency: 'intermediate'
  });
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [editingSkill, setEditingSkill] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (freelancerData.email) {
      fetchFreelancerSkills();
      setFormData({
        name: freelancerData.name || '',
        email: freelancerData.email || '',
        phone: freelancerData.phone || '',
        location: freelancerData.location || ''
      });
      if (freelancerData.profileImage) {
        setImagePreview(`/api/auth/freelancer/profile-image/${freelancerData.email}`);
      }
    }
  }, [freelancerData]);

  const fetchFreelancerSkills = async () => {
    try {
      const email = localStorage.getItem('freelancerEmail');
      const response = await axiosInstance.get(`/api/auth/freelancer/freelancer?email=${email}`);
      const freelancerId = response.data.id;

      const skillsResponse = await axiosInstance.get(`/api/auth/freelancer/${freelancerId}/skills`);
      setSkills(skillsResponse.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;

    try {
      const email = localStorage.getItem('freelancerEmail');
      const response = await axiosInstance.get(`/api/auth/freelancer/freelancer?email=${email}`);
      const freelancerId = response.data.id;

      const addedSkill = await axiosInstance.post(`/api/auth/freelancer/${freelancerId}/skills`, null, {
        params: {
          name: newSkill.name,
          proficiency: newSkill.proficiency
        }
      });

      setSkills([...skills, addedSkill.data]);
      setNewSkill({ name: '', proficiency: 'intermediate' });
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleUpdateSkill = async () => {
    if (!newSkill.name.trim() || !editingSkill) return;

    try {
      const email = localStorage.getItem('freelancerEmail');
      const response = await axiosInstance.get(`/api/auth/freelancer/freelancer?email=${email}`);
      const freelancerId = response.data.id;

      const updatedSkill = await axiosInstance.put(
        `/api/auth/freelancer/${freelancerId}/skills/${editingSkill.id}`,
        null,
        {
          params: {
            name: newSkill.name,
            proficiency: newSkill.proficiency
          }
        }
      );

      setSkills(skills.map(skill =>
        skill.id === editingSkill.id ? updatedSkill.data : skill
      ));
      setEditingSkill(null);
      setNewSkill({ name: '', proficiency: 'intermediate' });
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      const email = localStorage.getItem('freelancerEmail');
      const response = await axiosInstance.get(`/api/auth/freelancer/freelancer?email=${email}`);
      const freelancerId = response.data.id;

      await axiosInstance.delete(`/api/auth/freelancer/${freelancerId}/skills/${skillId}`);
      setSkills(skills.filter(skill => skill.id !== skillId));
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setNewSkill({
      name: skill.name,
      proficiency: skill.proficiency
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', freelancerData.email);

        const response = await axiosInstance.post('/api/auth/freelancer/upload-profile-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setIsUploadingImage(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading image:', error);
        setIsUploadingImage(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const email = localStorage.getItem('freelancerEmail');
      
      const updates = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location
      };
  
      const response = await axiosInstance.put('/api/auth/freelancer/update', updates, {
        params: { email }
      });
  
      if (response.status === 200) {
        if (formData.email !== email) {
          localStorage.setItem('freelancerEmail', formData.email);
        }
  
        if (typeof onUpdate === 'function') {
          onUpdate(response.data);
        }
  
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile';
      if (error.response) {
        errorMessage = error.response.data || errorMessage;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="profile-section">
      <div className="profile-header-main">
        <h2>
          <User size={24} className="header-icon" />
          Profile Settings
        </h2>
        {isEditing ? (
          <div className="edit-buttons">
            <button
              className="btn-edit-profile cancel"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="btn-edit-profile active"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
            <Edit2 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" />
              ) : (
                freelancerData?.name?.charAt(0).toUpperCase() || 'F'
              )}
              {isUploadingImage && (
                <div className="avatar-upload-overlay">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            {isEditing && (
              <label className="avatar-upload-btn">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                  disabled={isUploadingImage}
                />
              </label>
            )}
          </div>
          <div className="profile-info">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="profile-edit-input"
              />
            ) : (
              <h3>
                <User size={20} className="profile-icon" />
                {freelancerData?.name || 'Freelancer Name'}
              </h3>
            )}
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="profile-edit-input"
              />
            ) : (
              <p className="profile-email">
                <Mail size={16} className="email-icon" />
                {freelancerData?.email || 'email@example.com'}
              </p>
            )}
            <div className="profile-badges">
              <span className="badge verified">
                <Shield size={14} /> Verified Account
              </span>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <Mail size={20} className="detail-icon" />
              </div>
              <div className="detail-content">
                <label>Email Address</label>
                <p>{freelancerData?.email || 'email@example.com'}</p>
              </div>
              <ChevronRight size={18} className="detail-arrow" />
            </div>
            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <Smartphone size={20} className="detail-icon" />
              </div>
              <div className="detail-content">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p>{formData.phone || 'Not provided'}</p>
                )}
              </div>
              <ChevronRight size={18} className="detail-arrow" />
            </div>
            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <Globe size={20} className="detail-icon" />
              </div>
              <div className="detail-content">
                <label>Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="profile-edit-input"
                    placeholder="Enter your location"
                  />
                ) : (
                  <p>{formData.location || 'Not specified'}</p>
                )}
              </div>
              <ChevronRight size={18} className="detail-arrow" />
            </div>
          </div>
        </div>

        <div className="skills-section">
          <div className="section-header">
            <Award size={20} className="section-icon" />
            <h4>Your Skills</h4>
          </div>

          {loadingSkills ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading skills...</p>
            </div>
          ) : (
            <>
              <div className="skills-list">
                {skills.length === 0 ? (
                  <p className="no-skills">No skills added yet</p>
                ) : (
                  skills.map(skill => (
                    <div key={skill.id} className="skill-item">
                      <div className="skill-info">
                        <span className="skill-name">{skill.name}</span>
                        <span className={`skill-proficiency ${skill.proficiency}`}>
                          {skill.proficiency}
                        </span>
                      </div>
                      <div className="skill-actions">
                        <button
                          className="edit-skill-btn"
                          onClick={() => handleEditSkill(skill)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="delete-skill-btn"
                          onClick={() => handleDeleteSkill(skill.id)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="add-skill-form">
                <input
                  type="text"
                  placeholder="Skill name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="skill-input"
                />
                <select
                  value={newSkill.proficiency}
                  onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                  className="skill-select"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
                {editingSkill ? (
                  <div className="skill-form-buttons">
                    <button
                      className="btn-edit-profile active"
                      onClick={handleUpdateSkill}
                    >
                      Update Skill
                    </button>
                    <button
                      className="btn-edit-profile cancel"
                      onClick={() => {
                        setEditingSkill(null);
                        setNewSkill({ name: '', proficiency: 'intermediate' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-edit-profile"
                    onClick={handleAddSkill}
                  >
                    <Plus size={16} /> Add Skill
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;