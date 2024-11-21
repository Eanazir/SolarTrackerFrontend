// src/components/Forecasting.tsx
<<<<<<< HEAD
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CustomLineChart from '../graphs/CustomLineChart';
=======

import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import CustomLineChart, { LineConfig, CustomDataPoint } from '../graphs/CustomLineChart'; // Import LineConfig and CustomDataPoint types
>>>>>>> a6796a872f664b4a9adc57a6d304e2d80b5253da

interface ForecastInput {
  temperature_c: number;
  wind_speed: number;
  humidity: number;
  pressure: number;
}

<<<<<<< HEAD
interface ForecastPoint {
  time: number;
  value: number;
=======
interface HistoricalDataPoint {
  timestamp: string; // ISO format
  lux_actual: number;
}

interface LatestForecast {
  id: number;
  weather_data_id: number;
  forecast_time: string; // ISO format
  lux_forecast: number;
  // Add other fields if necessary
>>>>>>> a6796a872f664b4a9adc57a6d304e2d80b5253da
}

const Forecasting: React.FC = () => {
  const [inputs, setInputs] = useState<ForecastInput>({
    temperature_c: 20,
    wind_speed: 5,
    humidity: 50,
    pressure: 1013,
  });
<<<<<<< HEAD
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
=======
  
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [latestForecast, setLatestForecast] = useState<LatestForecast | null>(null);
  
>>>>>>> a6796a872f664b4a9adc57a6d304e2d80b5253da
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

<<<<<<< HEAD
=======
  // Optional: Add loading and error states for better UX
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

>>>>>>> a6796a872f664b4a9adc57a6d304e2d80b5253da
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
<<<<<<< HEAD
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
      console.error('Error fetching forecast :', error);
      // Handle error appropriately
    }
  };

=======
    setLoading(true);
    setError(null);
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const historicalResponse = await axios.get(`https://sunsightenergy.com/api/history-data`, {
        params: {
          startDate: currentDate,
          endDate: currentDate,
        },
      });
      
      // Validate and transform response data
      const historical = Array.isArray(historicalResponse.data) 
        ? historicalResponse.data 
        : [];
      
      setHistoricalData(historical);

      const forecastResponse = await axios.get(`https://sunsightenergy.com/api/latest-forecast-cnn`);
      setLatestForecast(forecastResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch forecast data. Please try again later.');
      // Reset data on error
      setHistoricalData([]);
      setLatestForecast(null);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for the chart
  const prepareChartData = (): CustomDataPoint[] => {
    if (!Array.isArray(historicalData)) {
      console.warn('Historical data is not an array');
      return [];
    }

    const dataMap: { [key: number]: { time: number; Actual: number; Forecast?: number } } = {};

    // Safe iteration over historical data
    historicalData.forEach((point: HistoricalDataPoint) => {
      if (point && point.timestamp) {
        const time = new Date(point.timestamp).getTime();
        dataMap[time] = {
          time,
          Actual: Number(point.lux_actual) || 0,
        };
      }
    });

    // Safe handling of forecast data
    if (latestForecast && latestForecast.forecast_time) {
      const forecastTime = new Date(latestForecast.forecast_time).getTime();
      dataMap[forecastTime] = {
        time: forecastTime,
        Actual: dataMap[forecastTime]?.Actual ?? 0,
        Forecast: Number(latestForecast.lux_forecast) || 0,
      };
    }

    return Object.values(dataMap)
      .sort((a, b) => a.time - b.time)
      .map(dataPoint => ({
        time: dataPoint.time,
        value: dataPoint.Actual,
        image_url: undefined,
        ...(dataPoint.Forecast !== undefined && { Forecast: dataPoint.Forecast })
      }));
  };

  // Define line configurations
  const additionalLineConfigs: LineConfig[] = useMemo(() => {
    if (latestForecast) {
      return [
        {
          dataKey: 'Forecast',
          strokeColor: '#82ca9d', // Green for forecast
          strokeDasharray: '5 5',  // Dotted line
        },
      ];
    }
    return [];
  }, [latestForecast]);

>>>>>>> a6796a872f664b4a9adc57a6d304e2d80b5253da
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
<<<<<<< HEAD
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
=======
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Generate Forecast'}
        </button>
      </div>

      {/* Display Error Message */}
      {error && (
        <div className="flex justify-center mb-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Chart */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <CustomLineChart
          title="Solar Irradiance Forecast"
          data={prepareChartData()}
          dataKey="Actual" // Main historical data key
          strokeColor="#8884d8" // Purple for historical data
          additionalLines={additionalLineConfigs} // Pass additional forecast line
          unit=" W/m²"
          yAxisLabel="Lux"
          tickFormat="hourly"
        />
      </div>
>>>>>>> a6796a872f664b4a9adc57a6d304e2d80b5253da
    </div>
  );
};

export default Forecasting;