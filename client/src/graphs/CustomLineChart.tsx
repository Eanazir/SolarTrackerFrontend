// src/components/graphs/CustomLineChart.tsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface CustomDataPoint {
  time: number; // Timestamp in milliseconds
  value: number;
}

interface CustomLineChartProps {
  title: string;
  data: CustomDataPoint[];
  dataKey: string;
  unit?: string;
  strokeColor: string;
  yAxisLabel?: string;
  dy?: number;
  dx?: number;
  tickFormat: 'hourly'  | 'daily'; 
}

const CustomLineChart: React.FC<CustomLineChartProps> = ({
  title,
  data,
  dataKey,
  unit,
  strokeColor,
  yAxisLabel,
  dy = 0,
  dx = 0,
  tickFormat
}) => {
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

  const axisColor = isDarkMode ? '#ccc' : '#333';
  const gridColor = isDarkMode ? '#444' : '#ccc ';

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded p-4 transition-colors duration-300">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-300 text-center">{title} Over Time</h2>      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="time"
            type="number"
            domain={['auto', 'auto']}
            scale="time"
            tickFormatter={(tick) => {
              const date = new Date(tick);
              return tickFormat === 'hourly'
                ? `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
                : date.toLocaleDateString();
            }}
            // tickFormatter={(tick) => {
            //   const date = new Date(tick);
            //   return `${date.getHours()}:${date
            //     .getMinutes()
            //     .toString()
            //     .padStart(2, '0')}`;
            // }}
            minTickGap={20}
            allowDataOverflow={false}
            stroke={axisColor}
            tick={{ fill: axisColor }}
            label={{ value: 'Time', position: 'insideBottom', dy: 20, fill: axisColor }}
          />
          <YAxis
            domain={['auto', 'auto']}
            unit={unit}
            allowDecimals={false}
            tick={{ fontSize: 12, fill: axisColor }}
            allowDataOverflow={false}
            stroke={axisColor}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              dy,
              dx,
              fill: axisColor,
            }}
          />
          <Tooltip
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleString();
            }}
            formatter={(value: number) => [`${value}${unit}`, title]}
            contentStyle={{
              backgroundColor: isDarkMode ? '#333' : '#fff',
              borderColor: isDarkMode ? '#888' : '#ccc',
            }}
            itemStyle={{ color: axisColor }}
            labelStyle={{ color: axisColor }}
          />
          <Line
            type="linear"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ r: 4, stroke: strokeColor, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;