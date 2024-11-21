// src/components/Forecasting.tsx

import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import CustomLineChart, { LineConfig, CustomDataPoint } from '../graphs/CustomLineChart'; // Import LineConfig and CustomDataPoint types

const LUX_TO_SOLAR_IRR = 0.0079;

interface ForecastInput {
  temperature_c: number;
  wind_speed: number;
  humidity: number;
  pressure: number;
}

interface HistoricalDataPoint {
  timestamp: string; // ISO format
  lux_actual: number;
}

interface Forecast {
  id: number;
  weather_data_id: number;
  forecast_time: string; // ISO format
  lux_forecast: number;
  // Add other fields if necessary
}

const Forecasting: React.FC = () => {
  const [inputs, setInputs] = useState<ForecastInput>({
    temperature_c: 20,
    wind_speed: 5,
    humidity: 50,
    pressure: 1013,
  });
  
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  // Optional: Add loading and error states for better UX
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      console.log('Historical data:', historicalResponse.data);
      
      // Validate and transform response data
      const historical = Array.isArray(historicalResponse.data) 
        ? historicalResponse.data 
        : [];
      
      setHistoricalData(historical);

      const forecastResponse = await axios.get(`https://sunsightenergy.com/api/latest-forecasts-cnn`);
      console.log('Forecasts:', forecastResponse.data);
      setForecasts(forecastResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch forecast data. Please try again later.');
      // Reset data on error
      setHistoricalData([]);
      setForecasts([]);
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

    const dataMap: { [key: number]: { time: number; Actual?: number; Forecast?: number } } = {};

    // // Convert lux to solar irradiance for historical data
    // historicalData.forEach((point: HistoricalDataPoint) => {
    //   if (point && point.timestamp) {
    //     const time = new Date(point.timestamp).getTime();
    //     dataMap[time] = {
    //       time,
    //       Actual: (Number(point.lux_actual) || 0) * LUX_TO_SOLAR_IRR,
    //     };
    //   }
    // });

    // Convert lux to solar irradiance for forecast data
    forecasts.forEach((forecast: Forecast) => {
      if (forecast && forecast.forecast_time) {
        const forecastTime = new Date(forecast.forecast_time.slice(0,-1)).getTime();
        if (!dataMap[forecastTime]) {
          dataMap[forecastTime] = { time: forecastTime };
        }
        dataMap[forecastTime].Forecast = (Number(forecast.lux_forecast) || 0) * LUX_TO_SOLAR_IRR;
      }
    });

    return Object.values(dataMap)
      .sort((a, b) => a.time - b.time)
      .map(dataPoint => ({
        time: dataPoint.time,
        value: dataPoint.Actual ?? 0,
        image_url: undefined,
        ...(dataPoint.Forecast !== undefined && { Forecast: dataPoint.Forecast })
      }));
  };

  // Define line configurations
  const additionalLineConfigs: LineConfig[] = useMemo(() => {
    if (forecasts.length > 0) {
      return [
        {
          dataKey: 'Forecast',
          strokeColor: '#82ca9d', // Green for forecast
          strokeDasharray: '5 5',  // Dotted line
        },
      ];
    }
    return [];
  }, [forecasts]);

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
          yAxisLabel="Solar Irradiance (W/m²)"
          tickFormat="hourly"
        />
      </div>
    </div>
  );
};

export default Forecasting;