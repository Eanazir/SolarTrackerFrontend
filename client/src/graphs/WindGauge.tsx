// src/components/graphs/WindGauge.tsx
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

interface WindGaugeProps {
  speed: number;
  direction: number;
}

const WindGauge: React.FC<WindGaugeProps> = ({ speed, direction }) => {
  const [smoothDirection, setSmoothDirection] = useState(direction);
  const [smoothSpeed, setSmoothSpeed] = useState(speed);

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

  useEffect(() => {
    const animate = () => {
      setSmoothDirection((prev) => {
        const diff = direction - prev;
        const adjustedDiff =
          diff > 180 ? diff - 360 : diff < -180 ? diff + 360 : diff;
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

  const bgColor = isDarkMode ? '#1f2937' : '#fff';
  const textColor = isDarkMode ? '#ccc' : '#000';

  return (
    <div className="flex flex-wrap justify-center">
      {/* Wind Speed Gauge */}
      <div className={`bg-white dark:bg-gray-800 shadow-md rounded p-6 flex flex-col items-center m-2 w-full sm:w-auto transition-colors duration-300`}>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Wind Speed (km/h)
        </h2>
        <Plot
          data={[
            {
              type: 'indicator',
              mode: 'gauge+number',
              value: smoothSpeed,
              gauge: {
                axis: {
                  range: [0, 35],
                  tickwidth: 1,
                  tickcolor: textColor,
                  tickfont: { color: textColor },
                },
                bar: { color: 'darkblue' },
                bgcolor: bgColor,
                borderwidth: 2,
                bordercolor: isDarkMode ? '#555' : '#ccc',
              },
              number: { font: { color: textColor } },
            },
          ]}
          layout={{
            width: 300,
            height: 280,
            margin: { t: 18, b: 18, l: 18, r: 18 },
            paper_bgcolor: bgColor,
            font: { color: textColor },
          }}
          config={{ displayModeBar: false }}
        />
      </div>

      {/* Wind Direction Gauge */}
      <div className={`bg-white dark:bg-gray-800 shadow-md rounded p-6 flex flex-col items-center m-2 w-full sm:w-auto transition-colors duration-300`}>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Wind Direction
        </h2>
        <Plot
          data={[
            {
              type: 'scatterpolar',
              mode: 'lines+markers',
              r: [0, 1],
              theta: [0, smoothDirection],
              marker: { color: 'red', size: 10 },
              line: { color: 'red', width: 2 }
            },
          ]}
          layout={{
            polar: {
              radialaxis: { visible: false },
              angularaxis: {
                direction: 'clockwise',
                tickfont: { size: 14, color: textColor },
                tickcolor: textColor,
              },
            },
            showlegend: false,
            width: 300,
            height: 280,
            margin: { t: 20, b: 20, l: 50, r: 40 },
            paper_bgcolor: bgColor,
            font: { color: textColor },
          }}
          config={{ displayModeBar: false }}
        />
      </div>
    </div>
  );
};

export default WindGauge;