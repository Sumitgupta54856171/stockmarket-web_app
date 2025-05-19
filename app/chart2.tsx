'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const chart2 = () => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Sample stock data
      const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Stock Price ($)',
            data: [100, 120, 115, 130, 125, 140],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };

      // Chart configuration
      const config = {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Stock Price Trend',
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Price ($)',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Month',
              },
            },
          },
        },
      };

      // Destroy existing chart if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Create new chart
      chartRef.current = new Chart(canvasRef.current, config);

      // Cleanup on unmount
      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
        }
      };
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Stock Market Chart</h2>
      <div className="relative">
        <canvas ref={canvasRef} className="w-full h-96" />
      </div>
    </div>
  );
};

export default chart2;