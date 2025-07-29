import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const StockChart = ({ type = 'bar', data, options, height = 300 }) => {
  // Ensure data is properly structured
  const safeData = data && data.datasets ? data : {
    labels: [],
    datasets: []
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      tooltip: {
        titleFont: {
          size: window.innerWidth < 768 ? 10 : 12
        },
        bodyFont: {
          size: window.innerWidth < 768 ? 10 : 12
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 8 : 10
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 8 : 10
          }
        }
      }
    }
  };

  const chartOptions = { ...defaultOptions, ...options };

  const renderChart = () => {
    if (!safeData.datasets || safeData.datasets.length === 0) {
      return (
        <div style={{ 
          height: height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 8
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ fontSize: 16, color: '#666' }}>Chart Data Loading...</div>
          </div>
        </div>
      );
    }

    switch (type) {
      case 'line':
        return <Line data={safeData} options={chartOptions} height={height} />;
      default:
        return <Bar data={safeData} options={chartOptions} height={height} />;
    }
  };

  return (
    <div style={{ height: height, width: '100%' }}>
      {renderChart()}
    </div>
  );
};

export default StockChart; 