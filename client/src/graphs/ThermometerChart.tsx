// src/components/graphs/ThermometerChart.tsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ThermometerChartProps {
  temperature: number;
  unit?: 'C' | 'F';
}

const ThermometerChart: React.FC<ThermometerChartProps> = ({
  temperature,
  unit = 'C',
}) => {
  // Define temperature ranges based on unit
  const defaultMinTemp = unit === 'F' ? -4 : -20;
  const defaultMaxTemp = unit === 'F' ? 122 : 50;

  // Normalize the temperature value to a percentage
  const normalizedValue = Math.min(
    Math.max(
      ((temperature - defaultMinTemp) / (defaultMaxTemp - defaultMinTemp)) * 100,
      0
    ),
    100
  );

  // Define data for the gauge
  const data = [
    { value: normalizedValue },
    { value: 100 - normalizedValue },
  ];

  // Function to determine the color based on temperature
  const getTemperatureColor = (temp: number, unit: 'C' | 'F'): string => {
    if (unit === 'C') {
      if (temp <= 0) return '#00aaff';
      if (temp <= 10) return '#00ccff';
      if (temp <= 20) return '#00ff99';
      if (temp <= 25) return '#ffeb3b';
      if (temp <= 30) return '#ff9800';
      if (temp <= 35) return '#ff5722';
      return '#ff0000';
    } else {
      if (temp <= 32) return '#00aaff';
      if (temp <= 50) return '#00ccff';
      if (temp <= 68) return '#00ff99';
      if (temp <= 77) return '#ffeb3b';
      if (temp <= 86) return '#ff9800';
      if (temp <= 95) return '#ff5722';
      return '#ff0000';
    }
  };

  // State to manage dark mode
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  // Effect to listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Determine colors based on dark mode
  const backgroundColor = isDarkMode ? '#1f2937' : '#f3f4f6'; // Dark vs Light background
  const textColor = isDarkMode ? '#f3f4f6' : '#1f2937'; // Light vs Dark text
  const gaugeBackground = isDarkMode ? '#374151' : '#e5e7eb'; // Dark vs Light gauge background

  // Colors for the pie slices
  const activeColor = getTemperatureColor(temperature, unit);
  const inactiveColor = gaugeBackground;

  return (
    <div
      className={`shadow-md rounded-lg p-6 w-full flex flex-col items-center justify-center ${backgroundColor} transition-colors duration-300`}
    >
      {/* Chart Title */}
      <h2 className={`text-2xl font-semibold mb-4 ${textColor}`}>
        Temperature Gauge (°{unit})
      </h2>

      {/* Pie Chart Container */}
      <div className="w-full max-w-[300px] h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Background Pie */}
            <Pie
              data={[{ value: 100 }]}
              dataKey="value"
              cx="50%"
              cy="75%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={100}
              fill={inactiveColor}
            >
              {/* Optional: You can add cells if needed */}
            </Pie>

            {/* Active Pie */}
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="75%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={100}
              paddingAngle={0}
              blendStroke
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? activeColor : inactiveColor}
                />
              ))}
            </Pie>

            {/* Temperature Text */}
            <text
              x="50%"
              y="75%"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-xl sm:text-2xl font-bold ${textColor}`}
            >
              {temperature.toFixed(1)}°{unit}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Optional: Legend or Additional Info */}
      {/* <p className={`mt-4 text-sm ${textColor}`}>Temperature is within the normal range.</p> */}
    </div>
  );
};

export default ThermometerChart;