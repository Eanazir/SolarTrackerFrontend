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
      setSmoothDirection((prev) => {
        const diff = direction - prev;
        const adjustedDiff = diff > 180 ? diff - 360 : diff < -180 ? diff + 360 : diff;
        return prev + adjustedDiff * 0.1;
      });

      setSmoothSpeed((prev) => {
        const diff = speed - prev;
        return prev + diff * 0.2;
      });
    };

    const interval = setInterval(animate, 16); // 60 FPS
    return () => clearInterval(interval);
  }, [direction, speed]);

  return (
    <div className="flex flex-row space-x-6 justify-center">
      {/* Wind Speed Gauge */}
      <div className="bg-white shadow-md rounded p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Wind Speed (km/h)</h2>
        <Plot
          data={[
            {
              type: 'indicator',
              mode: 'gauge+number',
              value: smoothSpeed,
              gauge: {
                axis: { range: [0, 35], tickwidth: 1, tickcolor: 'darkblue' },
                bar: { color: 'darkblue' },
                bgcolor: 'white',
                borderwidth: 2,
                bordercolor: 'gray',
              },
            },
          ]}
          layout={{
            width: 300,
            height: 280,
            margin: { t: 18, b: 18, l: 18, r: 18 },
            paper_bgcolor: 'white',
          }}
        />
      </div>

      {/* Wind Direction Gauge */}
      <div className="bg-white shadow-md rounded p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Wind Direction</h2>
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
              angularaxis: {
                direction: 'clockwise',
                tickfont: { size: 14 }, // Adjust font size for better readability
              },
            },
            showlegend: false,
            width: 300, // Slightly increase width for better spacing
            height: 280, // Slightly increase height for better spacing
            margin: { t: 20, b: 20, l: 50, r: 40 }, // Add more margin to prevent cutoff
            paper_bgcolor: 'white',
          }}
        />
      </div>

    </div>
  );
};

export default WindGauge;
