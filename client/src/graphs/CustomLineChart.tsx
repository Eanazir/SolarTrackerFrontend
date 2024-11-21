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

/**
 * @interface CustomDataPoint
 * Defines the structure for each data point in the chart.
 */
export interface CustomDataPoint {
  time: number; // Timestamp in milliseconds
  value: number; // The primary value for the main line
  image_url?: string; // Optional image URL associated with the data point
}

/**
 * @interface LineConfig
 * Defines the configuration for additional lines in the chart.
 */
export interface LineConfig {
  dataKey: string; // The key corresponding to the data in CustomDataPoint
  strokeColor: string; // Color of the line
  strokeDasharray?: string; // Optional dash pattern for the line (e.g., '5 5' for dotted)
}

/**
 * @interface CustomLineChartProps
 * Defines the props accepted by the CustomLineChart component.
 */
interface CustomLineChartProps {
  title: string;
  data: CustomDataPoint[]; // Array of data points
  dataKey: string; // Key for the main line (e.g., 'value')
  unit?: string; // Unit to display on the Y-axis and tooltips
  strokeColor: string; // Color for the main line
  yAxisLabel?: string; // Label for the Y-axis
  dy?: number; // Y-axis label vertical offset
  dx?: number; // Y-axis label horizontal offset
  tickFormat: 'hourly' | 'daily'; // Format for the X-axis ticks
  onClick?: (dataPoint: CustomDataPoint) => void; // Handler for data point clicks
  additionalLines?: LineConfig[]; // Configuration for any additional lines
}

/**
 * @component CustomLineChart
 * Renders a customizable line chart using Recharts.
 */
const CustomLineChart: React.FC<CustomLineChartProps> = ({
  title,
  data,
  dataKey,
  unit = '',
  strokeColor,
  yAxisLabel,
  dy = 0,
  dx = 0,
  tickFormat,
  onClick,
  additionalLines = [], // Default to empty array if not provided
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
  const gridColor = isDarkMode ? '#444' : '#ccc';

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded p-4 transition-colors duration-300">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-300 text-center">
        {title} Over Time
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
          onClick={(e) => {
            if (e && e.activePayload && e.activePayload[0] && onClick) {
              onClick(e.activePayload[0].payload); // Pass the clicked data point
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="time"
            type="number"
            domain={['auto', 'auto']}
            scale="time"
            tickFormatter={(tick) => {
              const date = new Date(tick);
              return tickFormat === 'hourly'
                ? date.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                : date.toLocaleDateString();
            }}
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
              return date.toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
                hour12: true,
              });
            }}
            formatter={(value: number, name: string) => [`${value}${unit}`, name]}
            contentStyle={{
              backgroundColor: isDarkMode ? '#333' : '#fff',
              borderColor: isDarkMode ? '#888' : '#ccc',
            }}
            itemStyle={{ color: axisColor }}
            labelStyle={{ color: axisColor }}
          />
          {/* Render the main line */}
          <Line
            type="linear"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ r: 4, stroke: strokeColor, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
          {/* Render additional lines if any */}
          {additionalLines.map((line, index) => (
            <Line
              key={index}
              type="linear"
              dataKey={line.dataKey}
              stroke={line.strokeColor}
              strokeWidth={2}
              strokeDasharray={line.strokeDasharray}
              dot={false} // Optional: disable dots for additional lines
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;