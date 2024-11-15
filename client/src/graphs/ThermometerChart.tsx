// src/graphs/ThermometerChart.tsx
import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface ThermometerChartProps {
  temperature: number;
  minTemp?: number;
  maxTemp?: number;
}

const ThermometerChart: React.FC<ThermometerChartProps> = ({ 
  temperature = 0, // Default value to prevent undefined
  minTemp = -20,
  maxTemp = 50
}) => {
  // Normalize temperature to percentage
  const normalizedValue = Math.min(Math.max((temperature - minTemp) / (maxTemp - minTemp) * 100, 0), 100);

  const data = [
    { value: normalizedValue },
    { value: 100 - normalizedValue }
  ];

  const getTemperatureColor = (temp: number): string => {
    // Create gradient effect based on temperature
    if (temp <= 0) return '#0066ff';  // Cold blue
    if (temp <= 10) return '#00ccff'; // Light blue
    if (temp <= 20) return '#00ff99'; // Cool green
    if (temp <= 25) return '#ffeb3b'; // Yellow
    if (temp <= 30) return '#ff9800'; // Orange
    if (temp <= 35) return '#ff5722'; // Deep orange
    return '#ff0000';                 // Hot red
  };

  return (
    <div className="relative w-[300px] flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Temperature Gauge</h2>
      <div className="relative">
        <PieChart width={300} height={180}>
          <Pie
            data={data}
            cx={150}
            cy={150}
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={120}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={getTemperatureColor(temperature)} />
            <Cell fill="#e0e0e0" />
          </Pie>
        </PieChart>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-[-25%] text-center">
          <span className="text-3xl font-bold">
            {Number.isFinite(temperature) ? temperature.toFixed(2) : '0.00'}°C
          </span>
        </div>
      </div>
      <div className="w-full flex justify-between px-4 mt-2">
        <span className="text-sm">{minTemp}°C</span>
        <span className="text-sm">{maxTemp}°C</span>
      </div>
    </div>
  );
};

export default ThermometerChart;