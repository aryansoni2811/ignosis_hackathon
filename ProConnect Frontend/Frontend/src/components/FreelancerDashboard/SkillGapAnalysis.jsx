import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SkillGapAnalysis.css';

const SkillGapAnalysis = ({ freelancerId }) => {
    console.log(freelancerId);
    
    const [skillAnalysis, setSkillAnalysis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSkillAnalysis = async () => {
            try {
                // Make sure freelancerId is valid before making the request
                if (!freelancerId) {
                    setError("Missing freelancer ID");
                    setLoading(false);
                    return;
                }
                
                const response = await axios.get(`/api/skill-analysis/${freelancerId}`);
                console.log('API Response:', response.data); // Debug log
                
                // Ensure we always have an array
                const data = Array.isArray(response.data) 
                    ? response.data 
                    : [];
                    
                setSkillAnalysis(data);
                setError(null); // Clear any previous errors
            } catch (err) {
                console.error('Error fetching skill analysis:', err);
                setError(err.message || "Failed to fetch skill analysis");
                setSkillAnalysis([]); // Fallback to empty array
            } finally {
                setLoading(false);
            }
        };
        
        fetchSkillAnalysis();
    }, [freelancerId]);

    if (loading) return <div className="loading">Loading skill analysis...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!skillAnalysis || !skillAnalysis.length) return <div>No skill data available</div>;

    return (
        <div className="skill-gap-container">
            <h3>Your Skill Performance</h3>
            <div className="skill-feedback-list">
                {skillAnalysis.map((skill, index) => (
                    <div key={index} className={`skill-feedback ${getFeedbackClass(skill)}`}>
                        <h4>{skill.skill}</h4>
                        <p>{skill.feedback}</p>
                        <div className="skill-stats">
                            <span>Applications: {skill.totalApplications || 0}</span><br />
                            <span>Won: {skill.wonProjects || 0}</span><br />
                            <span>Success rate: {calculateSuccessRate(skill)}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper functions
const calculateSuccessRate = (skill) => {
    if (!skill.totalApplications || skill.totalApplications === 0) return 0;
    return Math.round((skill.wonProjects / skill.totalApplications) * 100);
};

const getFeedbackClass = (skill) => {
    const successRate = calculateSuccessRate(skill);
    if (successRate < 30) return 'needs-improvement';
    if (successRate > 70) return 'excellent';
    return 'average';
};

export default SkillGapAnalysis;