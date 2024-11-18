// src/components/graphs/ThermometerChart.tsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface ThermometerChartProps {
  temperature: number;
  unit?: 'C' | 'F';
}

const ThermometerChart: React.FC<ThermometerChartProps> = ({
  temperature,
  unit = 'C',
}) => {
  const defaultMinTemp = unit === 'F' ? -4 : -20;
  const defaultMaxTemp = unit === 'F' ? 122 : 50;

  const normalizedValue = Math.min(
    Math.max(
      ((temperature - defaultMinTemp) / (defaultMaxTemp - defaultMinTemp)) * 100,
      0
    ),
    100
  );

  const data = [
    { value: normalizedValue },
    { value: 100 - normalizedValue },
  ];

  const getTemperatureColor = (temp: number, unit: 'C' | 'F'): string => {
    if (unit === 'C') {
      if (temp <= 0) return '#0066ff';
      if (temp <= 10) return '#00ccff';
      if (temp <= 20) return '#00ff99';
      if (temp <= 25) return '#ffeb3b';
      if (temp <= 30) return '#ff9800';
      if (temp <= 35) return '#ff5722';
      return '#ff0000';
    } else {
      if (temp <= 32) return '#0066ff';
      if (temp <= 50) return '#00ccff';
      if (temp <= 68) return '#00ff99';
      if (temp <= 77) return '#ffeb3b';
      if (temp <= 86) return '#ff9800';
      if (temp <= 95) return '#ff5722';
      return '#ff0000';
    }
  };

  // Make isDarkMode a state variable that reacts to changes
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

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

  const textColorClass = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const backgroundColorClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const transitionClasses = 'transition-colors duration-300';

  return (
    <div
      className={`shadow-md rounded p-6 w-full flex flex-col items-center ${backgroundColorClass} ${transitionClasses}`}
    >
      <h2 className={`text-xl font-bold mb-4 ${textColorClass}`}>
        Temperature Gauge (°{unit})
      </h2>
      <div className="relative w-full max-w-[300px] flex flex-col items-center">
        <div
          className="w-full"
          style={{ position: 'relative', paddingBottom: '63.33%' }}
        >
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
            }}
          >
            <PieChart width={300} height={190}>
              <Pie
                data={data}
                cx={150}
                cy={150}
                startAngle={180}
                endAngle={0}
                innerRadius={35}
                outerRadius={120}
                dataKey="value"
              >
                <Cell fill={getTemperatureColor(temperature, unit)} />
                <Cell fill={isDarkMode ? '#555' : '#e0e0e0'} />
              </Pie>
            </PieChart>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-[-25%] text-center">
              <span className="text-3xl font-bold">
                {temperature.toFixed(2)}°{unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermometerChart;