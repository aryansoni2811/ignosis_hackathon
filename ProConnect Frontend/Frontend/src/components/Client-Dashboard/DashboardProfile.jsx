import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, Mail, Phone, MapPin, 
  Edit2, Camera, User, Award, BarChart2, 
  ChevronRight, Shield, Globe, Smartphone 
} from 'lucide-react';
import './DashboardProfile.css';

const DashboardProfile = ({ clientData, loading, projectStats, onProfileUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: ''
    });

    useEffect(() => {
        if (clientData) {
            setFormData({
                name: clientData.name || '',
                phone: clientData.phone || '',
                location: clientData.location || ''
            });
        }
    }, [clientData]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
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
            await onProfileUpdate(formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className="profile-section">
            <div className="profile-header-main">
                <h2>
                    <User size={24} className="header-icon" />
                    My Profile
                </h2>
                {isEditing ? (
                    <div className="edit-buttons">
                        <button className="btn-edit-profile cancel" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                        <button className="btn-edit-profile active" onClick={handleSubmit}>
                            Save Changes
                        </button>
                    </div>
                ) : (
                    <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                        <Edit2 size={16} />
                        Edit Profile
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            ) : (
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" />
                                ) : (
                                    clientData?.name?.charAt(0).toUpperCase() || 'C'
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
                                    {clientData?.name || 'Client Name'}
                                </h3>
                            )}
                            <p className="profile-email">
                                <Mail size={16} className="email-icon" />
                                {clientData?.email || 'email@example.com'}
                            </p>
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
                                    <p>{clientData?.email || 'email@example.com'}</p>
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
                                        <p>{clientData?.phone || 'Not provided'}</p>
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
                                        <p>{clientData?.location || 'Not specified'}</p>
                                    )}
                                </div>
                                <ChevronRight size={18} className="detail-arrow" />
                            </div>
                        </div>
                    </div>

                    <div className="profile-stats-section">
                        <h4>
                            <BarChart2 size={20} className="stats-icon" />
                            Activity Overview
                        </h4>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <FileText size={24} className="stat-icon" />
                                </div>
                                <div className="stat-info">
                                    <h5>Total Projects</h5>
                                    <span className="stat-number">{projectStats.totalProjects}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <Award size={24} className="stat-icon" />
                                </div>
                                <div className="stat-info">
                                    <h5>Completed</h5>
                                    <span className="stat-number">{projectStats.completedProjects}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <CheckCircle size={24} className="stat-icon" />
                                </div>
                                <div className="stat-info">
                                    <h5>Success Rate</h5>
                                    <span className="stat-number">
                                        {projectStats.totalProjects ?
                                            Math.round((projectStats.completedProjects / projectStats.totalProjects) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardProfile;