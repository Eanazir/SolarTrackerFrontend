// src/components/Forecasting.tsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CustomLineChart from '../graphs/CustomLineChart';

interface ForecastInput {
  temperature_c: number;
  wind_speed: number;
  humidity: number;
  pressure: number;
}

interface ForecastPoint {
  time: number;
  value: number;
}

const Forecasting: React.FC = () => {
  const [inputs, setInputs] = useState<ForecastInput>({
    temperature_c: 20,
    wind_speed: 5,
    humidity: 50,
    pressure: 1013,
  });
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
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

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await axios.get('https://sunsightenergy.com/api/latest-forecast');
      const predictions = response.data;

      console.log('forecasting response status:', response.status);
      console.log('forecasting response data:', response.data);

      const currentTime = new Date(predictions.forecastdate).getTime();
      const forecastPoints: ForecastPoint[] = [
        { time: currentTime + 5 * 60000, value: predictions['5minForecast'] },
        { time: currentTime + 15 * 60000, value: predictions['15minForecast'] },
        { time: currentTime + 30 * 60000, value: predictions['30minForecast'] },
        { time: currentTime + 60 * 60000, value: predictions['60minForecast'] },
      ];

      setForecastData(forecastPoints);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Solar Irradiance Forecasting
      </h1>

      {/* Generate Forecast Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
        >
          Generate Forecast
        </button>
      </div>

      {forecastData.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <CustomLineChart
            title="Solar Irradiance Forecast"
            data={forecastData}
            dataKey="value"
            unit=" W/m²"
            strokeColor="#FFA500"
            tickFormat="hourly"
          />
        </div>
      )}
    </div>
  );
};

export default Forecasting;