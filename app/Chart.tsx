'use client'
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { candlestickData } from './lib/canddlestickData';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

// Custom plugin to draw wicks and hollow bodies
const hollowCandlestickPlugin = {
  id: 'hollowCandlestickPlugin',
  beforeDatasetsDraw(chart: any, args: any, pluginOptions: any) {
    const { ctx, chartArea: { top, bottom, left, right, width, height }, scales: { x, y } } = chart;

    chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
      if (dataset.type === 'candlestick') {
        const meta = chart.getDatasetMeta(datasetIndex);
        meta.data.forEach((element: any, index: number) => {
          const { open, high, low, close } = dataset.data[index];

          // Determine candle color based on open vs close
          const isRising = close >= open;
          const candleColor = isRising ? pluginOptions.risingColor : pluginOptions.fallingColor;

          ctx.save();
          ctx.beginPath();

          // Get pixel coordinates for open, high, low, close
          const xPos = x.getPixelForValue(index);
          const yOpen = y.getPixelForValue(open);
          const yClose = y.getPixelForValue(close);
          const yHigh = y.getPixelForValue(high);
          const yLow = y.getPixelForValue(low);

          // Calculate bar width (you can adjust this)
          const barWidth = 10; // Adjust as needed
          const halfBarWidth = barWidth / 2;

          // Draw Wick (High-Low)
          ctx.strokeStyle = candleColor;
          ctx.lineWidth = 1; // Wick thickness
          ctx.moveTo(xPos, yHigh);
          ctx.lineTo(xPos, yLow);
          ctx.stroke();

          // Draw Body (Open-Close)
          // For hollow, we only draw the border
          const bodyTop = Math.min(yOpen, yClose);
          const bodyBottom = Math.max(yOpen, yClose);
          const bodyHeight = bodyBottom - bodyTop;

          ctx.strokeStyle = candleColor;
          ctx.lineWidth = 1; // Body border thickness
          ctx.strokeRect(xPos - halfBarWidth, bodyTop, barWidth, bodyHeight);

          // If it's a rising candle, fill the body
          if (isRising) {
            ctx.fillStyle = pluginOptions.risingFillColor || 'transparent'; // Use a transparent fill by default for hollow
            ctx.fillRect(xPos - halfBarWidth, bodyTop, barWidth, bodyHeight);
          } else {
            ctx.fillStyle = pluginOptions.fallingFillColor || 'transparent';
            ctx.fillRect(xPos - halfBarWidth, bodyTop, barWidth, bodyHeight);
          }

          ctx.restore();
        });
      }
    });
  }
};

// Register the custom plugin
ChartJS.register(hollowCandlestickPlugin);

const Chart = () => {
  const chartData = {
    labels: candlestickData.map(d => d.time),
    datasets: [
      {
        type: 'candlestick', // Custom type to be used by our plugin
        label: 'Price',
        data: candlestickData,
        // These colors will be used by our custom plugin
        risingColor: 'rgb(34, 197, 94)',   // Tailwind's green-500
        fallingColor: 'rgb(239, 68, 68)',  // Tailwind's red-500
        // Set fill colors for hollow effect (transparent for body)
        risingFillColor: 'transparent',
        fallingFillColor: 'transparent',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows you to control height with Tailwind
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function(context: { raw: { open: number; high: number; low: number; close: number; }; }) {
            const dataPoint = context.raw;
            return [
              `Open: ${dataPoint.open}`,
              `High: ${dataPoint.high}`,
              `Low: ${dataPoint.low}`,
              `Close: ${dataPoint.close}`
            ];
          }
        }
      },
      hollowCandlestickPlugin: { // Pass options to your plugin
        risingColor: 'rgb(34, 197, 94)', // Tailwind's green-500
        fallingColor: 'rgb(239, 68, 68)', // Tailwind's red-500
        risingFillColor: 'transparent',
        fallingFillColor: 'transparent',
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)', // Light grid lines
        },
      },
    },
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-xl max-w-4xl mx-auto my-8">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">Hollow Candlestick Chart</h2>
      <div className="relative h-96"> {/* Set a height for the chart */}
        <Bar type="candlestick" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Chart;