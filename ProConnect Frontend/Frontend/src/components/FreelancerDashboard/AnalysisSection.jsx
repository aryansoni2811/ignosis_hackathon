import React, { useState, useEffect } from 'react';
import { PieChart, BarChart2 } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axiosInstance from '../config/axiosConfig';
import './AnalysisSection.css';
import PieChartAnalysis from './PieChartAnalysis';
import SkillGapAnalysis from './SkillGapAnalysis';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalysisSection = () => {
  const [categoryStats, setCategoryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'
  const [freelancerId, setFreelancerId] = useState(null); // Assuming you have a way to set this

  

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        console.log('email:',email);
        
        if(email) {
        const res = await axiosInstance.get(`/api/auth/freelancer/by-email?email=${email}`);
        console.log('res:',res.data);
        
        setFreelancerId(res.data.id);
      } 
        const response = await axiosInstance.get('/api/projects/category-stats');
        setCategoryStats(response.data);
      } catch (error) {
        console.error('Error fetching category stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryStats();
  }, []);

  // Prepare chart data
  const chartData = {
    labels: Object.keys(categoryStats),
    datasets: [
      {
        data: Object.values(categoryStats), // Removed the label here
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 16,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Project Categories Distribution',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Projects'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Categories'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading project analysis...</p>
      </div>
    );
  }

  // Calculate total projects for insights
  const totalProjects = Object.values(categoryStats).reduce((a, b) => a + b, 0);

  return (
    <div className="analysis-section">
      <div className="section-header">
        <h2>Market Analysis</h2>
        <p>Understand which skills are in demand to focus your learning and marketing efforts</p>
      </div>

      <div className="chart-controls">
        <div className="chart-toggle">
          <button 
            className={chartType === 'bar' ? 'active' : ''}
            onClick={() => setChartType('bar')}
          >
            <BarChart2 size={16} />
            Bar Chart
          </button>
          <button 
            className={chartType === 'pie' ? 'active' : ''}
            onClick={() => setChartType('pie')}
          >
            <PieChart size={16} />
            Pie Chart
          </button>
        </div>
      </div>

      <div className="chart-container">
        {chartType === 'bar' ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <Pie data={chartData} options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                ...chartOptions.plugins.legend,
                labels: {
                  ...chartOptions.plugins.legend.labels,
                  generateLabels: function(chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const value = data.datasets[0].data[i];
                        return {
                          text: `${label}: ${value}`,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          hidden: false,
                          index: i
                        };
                      });
                    }
                    return [];
                  }
                }
              }
            }
          }} />
        )}
      </div>

      <div className="insights-container">
        <h3>Key Insights</h3>
        <div className="total-projects">
          <strong>Total Projects Analyzed:</strong> {totalProjects}
        </div>
        <ul>
          {Object.entries(categoryStats)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => (
              <li key={category}>
                <strong>{category}:</strong> {count} projects ({Math.round((count / totalProjects) * 100)}% of total)
              </li>
            ))}
        </ul>
      </div>
      <div><PieChartAnalysis/></div>
      <div><SkillGapAnalysis freelancerId={freelancerId}/></div>
    </div>
  );
};

export default AnalysisSection;