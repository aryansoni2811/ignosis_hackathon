import React, { useState } from 'react';
import { FileText, CheckCircle, Mail, Phone, MapPin, Calendar, Edit2, Camera } from 'lucide-react';
import './DashboardProfile.css';

const DashboardProfile = ({ clientData, loading, projectStats }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

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

    return (
        <div className="profile-section">
            <div className="profile-header-main">
                <h2>My Profile</h2>
                <button
                    className={`btn-edit-profile ${isEditing ? 'active' : ''}`}
                    onClick={() => setIsEditing(!isEditing)}
                >
                    <Edit2 size={16} />
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
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
                            <h3>{clientData?.name || 'Client Name'}</h3>
                            <p className="profile-email">{clientData?.email || 'email@example.com'}</p>
                            <div className="profile-badges">
                <span className="badge verified">
                  <CheckCircle size={14} /> Verified
                </span>
                                <span className="badge member-since">
                  <Calendar size={14} /> Member since 2024
                </span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-details">
                        <div className="details-grid">
                            <div className="detail-item">
                                <Mail size={18} />
                                <div className="detail-content">
                                    <label>Email</label>
                                    <p>{clientData?.email || 'email@example.com'}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <Phone size={18} />
                                <div className="detail-content">
                                    <label>Phone</label>
                                    <p>{clientData?.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <MapPin size={18} />
                                <div className="detail-content">
                                    <label>Location</label>
                                    <p>{clientData?.location || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-stats-section">
                        <h4>Activity Overview</h4>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <FileText size={24} />
                                <div className="stat-info">
                                    <h5>Total Projects</h5>
                                    <span className="stat-number">{projectStats.totalProjects}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <CheckCircle size={24} />
                                <div className="stat-info">
                                    <h5>Completed</h5>
                                    <span className="stat-number">{projectStats.completedProjects}</span>
                                </div>
                            </div>
                            <div className="stat-card">
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