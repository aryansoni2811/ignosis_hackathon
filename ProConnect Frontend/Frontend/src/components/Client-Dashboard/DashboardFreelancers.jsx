import React, { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Search, Star, Mail, Award } from 'lucide-react';
import './DashboardFreelancers.css';

const DashboardFreelancers = () => {
    const { user } = useAuth();
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [ratingRange, setRatingRange] = useState(null);

    useEffect(() => {
        // Modify your fetchFreelancers function in DashboardFreelancers.js
        const fetchFreelancers = async () => {
            try {
                const [freelancersResponse, ratingsResponse] = await Promise.all([
                    axiosInstance.get('/api/auth/freelancer/all', {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    }),
                    axiosInstance.get('/api/ratings', {
                        headers: {
                            Authorization: `Bearer ${user.token}`
                        }
                    })
                ]);

                // Create a map of freelancer IDs to their average ratings
                const ratingsMap = ratingsResponse.data.reduce((acc, rating) => {
                    if (!acc[rating.freelancerId]) {
                        acc[rating.freelancerId] = {
                            sum: 0,
                            count: 0
                        };
                    }
                    acc[rating.freelancerId].sum += rating.rating;
                    acc[rating.freelancerId].count++;
                    return acc;
                }, {});

                const freelancersData = freelancersResponse.data.map(freelancer => {
                    const ratingInfo = ratingsMap[freelancer.id] || { sum: 0, count: 0 };
                    const averageRating = ratingInfo.count > 0
                        ? ratingInfo.sum / ratingInfo.count
                        : 0;

                    return {
                        ...freelancer,
                        rating: averageRating,
                        ratingCount: ratingInfo.count
                    };
                });

                setFreelancers(freelancersData);
                setError(null);
            } catch (err) {
                console.error('Error fetching freelancers:', err);
                setError('Failed to load freelancers. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchFreelancers();
    }, [user.token]);

    const filteredFreelancers = () => {
        let result = [...freelancers];

        // Apply search filter (skills or name)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(freelancer =>
                freelancer.name?.toLowerCase().includes(term) ||
                freelancer.skills?.some(skill =>
                    skill.name?.toLowerCase().includes(term)
                )
            );
        }

        // Apply rating range filter
        if (ratingRange) {
            const [min, max] = ratingRange;
            result = result.filter(freelancer =>
                freelancer.rating >= min && freelancer.rating <= max
            );
        }

        // Apply active filter
        switch (activeFilter) {
            case 'top-rated':
                return result.sort((a, b) => b.rating - a.rating);
            default:
                return result;
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading freelancers...</p>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="freelancers-dashboard">
            <div className="dashboard-header">
                <h1>Find Talent</h1>
                <p>Browse through our network of professional freelancers</p>
            </div>

            <div className="search-filters">
                <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search by skills, name, or expertise..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-section">
                    <div className="filter-buttons">
                        <button
                            className={activeFilter === 'all' ? 'active' : ''}
                            onClick={() => setActiveFilter('all')}
                        >
                            All Freelancers
                        </button>
                        <button
                            className={activeFilter === 'top-rated' ? 'active' : ''}
                            onClick={() => setActiveFilter('top-rated')}
                        >
                            <Star size={16} /> Top Rated
                        </button>
                    </div>

                    <div className="rating-range-filter">
                        <span>Rating:</span>
                        <select
                            value={ratingRange ? `${ratingRange[0]}-${ratingRange[1]}` : 'all'}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === 'all') {
                                    setRatingRange(null);
                                } else {
                                    const [min, max] = value.split('-').map(Number);
                                    setRatingRange([min, max]);
                                }
                            }}
                        >
                            <option value="all">All Ratings</option>
                            <option value="4-5">4 - 5 Stars</option>
                            <option value="3-4">3 - 4 Stars</option>
                            <option value="2-3">2 - 3 Stars</option>
                            <option value="1-2">1 - 2 Stars</option>
                            <option value="0-1">0 - 1 Stars</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredFreelancers().length === 0 ? (
                <div className="no-results">
                    <img src="/illustrations/no-results.svg" alt="No results" />
                    <h3>No freelancers found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="freelancers-grid">
                    {filteredFreelancers().map((freelancer) => (
                        <div key={freelancer.id} className="freelancer-card">
                            <div className="card-header">
                                <div className="freelancer-avatar">
                                    {freelancer.name?.charAt(0).toUpperCase() || 'F'}
                                </div>
                                <div className="freelancer-basic-info">
                                    <h3>{freelancer.name || 'Unknown Freelancer'}</h3>
                                    <div className="rating">
                                        <Star size={16} fill="#FFD700" color="#FFD700" />
                                        <span>
                                            {freelancer.ratingCount > 0
                                                ? freelancer.rating.toFixed(1)
                                                : 'New'}
                                        </span>
                                        {freelancer.ratingCount > 0 && (
                                            <span className="rating-count">({freelancer.ratingCount})</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="freelancer-details">
                                <div className="detail-item">
                                    <Mail size={16} />
                                    <span>{freelancer.email || 'No email provided'}</span>
                                </div>
                                <div className="detail-item">
                                    <span>{freelancer.skills?.length || 0} skills</span>
                                </div>
                                {freelancer.badge && (
                                    <div className="detail-item">
                                        <Award size={16} color="#FFA500" />
                                        <span className="badge">{freelancer.badge}</span>
                                    </div>
                                )}
                            </div>

                            <div className="freelancer-skills">
                                {freelancer.skills?.slice(0, 6).map((skill, index) => (
                                    <span key={index} className="skill-tag">
                                        {skill.name || 'Unknown Skill'}
                                        {skill.proficiency && (
                                            <span className="proficiency-badge">
                                                {skill.proficiency}
                                            </span>
                                        )}
                                    </span>
                                ))}
                                {freelancer.skills?.length > 6 && (
                                    <span className="more-skills">+{freelancer.skills.length - 6} more</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardFreelancers;