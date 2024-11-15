// src/components/graphs/CustomLineChart.tsx
import React from 'react';
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
  unit: string;
  strokeColor: string;
  tickFormat: 'hourly'  | 'daily'; 
}

const CustomLineChart: React.FC<CustomLineChartProps> = ({
  title,
  data,
  dataKey,
  unit,
  strokeColor,
  tickFormat
}) => {
  return (
    <div className="bg-white shadow-md rounded p-4">
      <h2 className="text-xl font-bold mb-4">{title} Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
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
            allowDataOverflow={false} // Prevent axis from shifting
          />
          <YAxis
            domain={['auto', 'auto']}
            unit={unit}
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            allowDataOverflow={false} // Prevent axis from shifting
          />
          <Tooltip
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleString();
            }}
            formatter={(value: number) => [`${value}${unit}`, title]}
          />
          <Line
            type="linear" // Straight lines
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ r: 4, stroke: strokeColor, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false} // Disable animation for Scatter
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;