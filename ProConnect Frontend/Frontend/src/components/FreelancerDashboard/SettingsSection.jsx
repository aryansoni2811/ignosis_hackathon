import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Lock, Plus, X, Edit2 } from 'lucide-react';
import './SettingsSection.css';
import axiosInstance from '../config/axiosConfig';

const SettingsSection = ({ freelancerData }) => {
  const [profileSettings, setProfileSettings] = useState({
    name: freelancerData.name || '',
    email: freelancerData.email || '',
    notifications: {
      email: true,
      sms: false,
      pushNotifications: true
    },
    privacy: {
      profileVisibility: 'public',
      contactPreference: 'all'
    }
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({
    name: '',
    proficiency: 'intermediate'
  });
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [editingSkill, setEditingSkill] = useState(null);

  useEffect(() => {
    if (freelancerData.email) {
      fetchFreelancerSkills();
    }
  }, [freelancerData.email]);

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

      await axiosInstance.delete(`/api/auth/freelancer/${freelancerId}/skills/${editingSkill.id}`);

      const updatedSkill = await axiosInstance.post(`/api/auth/freelancer/${freelancerId}/skills`, null, {
        params: {
          name: newSkill.name,
          proficiency: newSkill.proficiency
        }
      });

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

  const handleToggleNotification = (type) => {
    setProfileSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  return (
    <div className="settings-container-wrapper">
    <div className="settings-section">
      <div className="settings-container">
        <div className="section-header">
          <Settings className="settings-icon" />
          <h2>Account Settings</h2>
        </div>

        <div className="profile-display">
          <div className="profile-info">
            <User className="profile-icon" size={48} />
            <div>
              <h3>{freelancerData.name}</h3>
              <p className="profession">Graphic Designer</p>
              <p className="email">{freelancerData.email}</p>
            </div>
          </div>
        </div>

        <div className="settings-grid">
          {/* First Row - Profile and Skills */}
          <div className="settings-row">
            <div className="settings-card profile-settings">
              <div className="card-header">
                <User className="card-icon" />
                <h3>Profile Information</h3>
              </div>
              <div className="profile-details">
                <div className="profile-info-form">
                  <div className="info-row">
                    <label>Name</label>
                    <input 
                      type="text" 
                      value={profileSettings.name} 
                      readOnly 
                    />
                  </div>
                  <div className="info-row">
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={profileSettings.email} 
                      readOnly 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-card skills-settings">
              <div className="card-header">
                <Shield className="card-icon" />
                <h3>Your Skills</h3>
              </div>
              <div className="skills-management">
                {loadingSkills ? (
                  <p>Loading skills...</p>
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
                        onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                      />
                      <select
                        value={newSkill.proficiency}
                        onChange={(e) => setNewSkill({...newSkill, proficiency: e.target.value})}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                      {editingSkill ? (
                        <>
                          <button 
                            className="update-skill-btn"
                            onClick={handleUpdateSkill}
                          >
                            Update
                          </button>
                          <button 
                            className="cancel-edit-btn"
                            onClick={() => {
                              setEditingSkill(null);
                              setNewSkill({ name: '', proficiency: 'intermediate' });
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          className="add-skill-btn"
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

          {/* Second Row - Notifications and Security */}
          <div className="settings-row">
            <div className="settings-card notification-settings">
              <div className="card-header">
                <Bell className="card-icon" />
                <h3>Notification Preferences</h3>
              </div>
              <div className="notification-options">
                <div className="toggle-row">
                  <span>Email Notifications</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profileSettings.notifications.email}
                      onChange={() => handleToggleNotification('email')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-row">
                  <span>SMS Notifications</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profileSettings.notifications.sms}
                      onChange={() => handleToggleNotification('sms')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-row">
                  <span>Push Notifications</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profileSettings.notifications.pushNotifications}
                      onChange={() => handleToggleNotification('pushNotifications')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-card security-settings">
              <div className="card-header">
                <Lock className="card-icon" />
                <h3>Account Security</h3>
              </div>
              <div className="security-options">
                <button className="security-btn">Change Password</button>
                <button className="security-btn">Two-Factor Authentication</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SettingsSection;