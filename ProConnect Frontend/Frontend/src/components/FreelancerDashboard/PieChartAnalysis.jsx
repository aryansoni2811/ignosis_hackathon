import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import './AnalysisSection.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartAnalysis = () => {
  const [skillStats, setSkillStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/skills/stats');
        setSkillStats(response.data);
      } catch (error) {
        console.error('Error fetching skill stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Chart data preparation
  const chartData = {
    labels: skillStats.map(skill => skill.skillName),
    datasets: [{
      data: skillStats.map(skill => skill.count),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC24A', '#FF5722', '#607D8B', '#9C27B0'
      ],
      borderWidth: 1
    }]
  };

  if (loading) return <div>Loading skill data...</div>;

  return (
    <div className="chart-container">
      <h2>Skill Demand Distribution</h2>
      <Pie data={chartData} options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }} />
    </div>
  );
};

export default PieChartAnalysis;