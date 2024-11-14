// src/components/WindGauge.tsx
import React from 'react';
import Plot from 'react-plotly.js';

interface WindGaugeProps {
  speed: number;
  direction: number;
}

const WindGauge: React.FC<WindGaugeProps> = ({ speed, direction }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Wind Speed and Direction</h2>
      <Plot
        data={[
          {
            type: 'indicator',
            mode: 'gauge+number',
            value: speed,
            title: { text: 'Wind Speed (km/h)' },
            gauge: {
              axis: { range: [0, 100] },
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
            theta: [0, direction],
            marker: { color: 'red', size: 10 },
          },
        ]}
        layout={{
          polar: {
            radialaxis: { visible: false },
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