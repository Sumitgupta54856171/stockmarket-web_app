'use client'
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const stockData = [
  { name: 'Jan', price: 150 },
  { name: 'Feb', price: 165 },
  { name: 'Mar', price: 160 },
  { name: 'Apr', price: 175 },
  { name: 'May', price: 180 },
  { name: 'Jun', price: 195 },
  { name: 'Jul', price: 200 },
  { name: 'Aug', price: 190 },
  { name: 'Sep', price: 210 },
  { name: 'Oct', price: 225 },
  { name: 'Nov', price: 220 },
  { name: 'Dec', price: 235 },
];

const StockChart = () => {
  return (
   
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Stock Price Over Time</h2>

  
      <ResponsiveContainer width="100%" height={300}>
       
        <LineChart
          data={stockData}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <XAxis dataKey="name" stroke="#888888" />

          <YAxis stroke="#888888" />


          <Tooltip cursor={{ stroke: 'red', strokeDasharray: '3 3' }} />

          <Legend />

          <Line type="monotone" dataKey="price" stroke="#82ca9d" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div> 
  );
}


const Chart = () => {
  return (
    
    <div className="min-h-screen bg-gray-100 py-10">
      <StockChart />
    </div>
  );
}

export default Chart;
