// src/components/WindGauge.tsx
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

interface WindGaugeProps {
  speed: number;
  direction: number;
}

const WindGauge: React.FC<WindGaugeProps> = ({ speed, direction }) => {
  const [smoothDirection, setSmoothDirection] = useState(direction);
  const [smoothSpeed, setSmoothSpeed] = useState(speed);

  useEffect(() => {
    const animate = () => {
      setSmoothDirection(prev => {
        const diff = direction - prev;
        const adjustedDiff = diff > 180 ? diff - 360 : diff < -180 ? diff + 360 : diff;
        return prev + adjustedDiff * 0.1;
      });
      
      setSmoothSpeed(prev => {
        const diff = speed - prev;
        return prev + diff * 0.2;
      });
    };

    const interval = setInterval(animate, 16); // 60 FPS
    return () => clearInterval(interval);
  }, [direction, speed]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Wind Speed and Direction</h2>
      <Plot
        data={[
          {
            type: 'indicator',
            mode: 'gauge+number',
            value: smoothSpeed,
            title: { text: 'Wind Speed (km/h)' },
            gauge: {
              axis: { range: [0, 30] }, // maybe change this to max speed
              bar: { color: 'darkblue' },
            },
          },
        ]}
        layout={{ width: 300, height: 300 }}
      />
      <Plot
        data={[
          {
            type: 'scatterpolar',
            mode: 'lines+markers',
            r: [0, 1],
            theta: [0, smoothDirection],
            marker: { color: 'red', size: 10 },
            line: { color: 'red', width: 2 },
          },
        ]}
        layout={{
          polar: {
            radialaxis: { visible: false },
            angularaxis: { direction: 'clockwise' }
          },
          showlegend: false,
          width: 300,
          height: 300,
          title: 'Wind Direction',
        }}
      />
    </div>
  );
};

export default WindGauge;