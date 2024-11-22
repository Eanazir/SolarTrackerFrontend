import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LUX_TO_SOLAR_IRR = 0.0079;
const SCALER = 90;

const Forecasting: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [forecastsAll, setForecastsAll] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingForecastsAll, setLoadingForecastsAll] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorForecastsAll, setErrorForecastsAll] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        
        const [historicalResponse, forecastResponse] = await Promise.all([
          axios.get(`https://sunsightenergy.com/api/history-data`, {
            params: {
              startDate: currentDate,
              endDate: currentDate,
            },
          }),
          axios.get(`https://sunsightenergy.com/api/latest-forecasts-cnn`)
        ]);

        // Process historical data
        const processedHistoricalData = historicalResponse.data.map(item => ({
          ...item,
          Actual: (Number(item.ambientweatherlightlux) || 0) * LUX_TO_SOLAR_IRR,
          time: new Date(item.timestamp).toLocaleString('en-US', { timeZone: 'UTC' })
        }));

        // Sort historical data by time (in case it's not sorted)
        processedHistoricalData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        setHistoricalData(processedHistoricalData);

        setForecasts(forecastResponse.data.map(item => ({
          ...item,
          Forecast: (Number(item.lux_forecast) || 0) * LUX_TO_SOLAR_IRR + SCALER,
          time: new Date(item.forecast_time).toLocaleString('en-US', { timeZone: 'UTC' })
        })));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch forecast data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchForecastsAll = async () => {
      try {
        setLoadingForecastsAll(true);
        const response = await axios.get('https://sunsightenergy.com/api/latest-forecasts-cnn-all');
        setForecastsAll(response.data.map(item => ({
          ...item,
          ForecastAll: (Number(item.lux_forecast) || 0) * LUX_TO_SOLAR_IRR + SCALER,
          time: new Date(item.forecast_time).toLocaleString('en-US', { timeZone: 'UTC' })
        })));
        setLoadingForecastsAll(false);
      } catch (error) {
        console.error('Error fetching data from latest-forecasts-cnn-all:', error);
        setErrorForecastsAll('Failed to fetch data from latest-forecasts-cnn-all. Please try again later.');
        setLoadingForecastsAll(false);
      }
    };
    fetchForecastsAll();
  }, []);

  // Slice historical data to show only the most recent 100 points
  const historicalDataRecent = historicalData.slice(-50);

  const chartData = [...historicalDataRecent, ...forecasts].reduce((acc, curr) => {
    const existingIndex = acc.findIndex(item => item.time === curr.time);
    if (existingIndex === -1) {
      acc.push(curr);
    } else {
      acc[existingIndex] = { ...acc[existingIndex], ...curr };
    }
    return acc;
  }, []).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const chartDataAll = [...historicalData, ...forecastsAll].reduce((acc, curr) => {
    const existingIndex = acc.findIndex(item => item.time === curr.time);
    if (existingIndex === -1) {
      acc.push(curr);
    } else {
      acc[existingIndex] = { ...acc[existingIndex], ...curr };
    }
    return acc;
  }, []).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  if (loading || loadingForecastsAll) return <div>Loading...</div>;
  if (error || errorForecastsAll) return <div className="text-red-500">{error || errorForecastsAll}</div>;

  return (
    <div className="p-12 bg-gray-50 dark:bg-gray-800 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Solar Irradiance Forecast
      </h1>

      {/* First Graph */}
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
        Forecast using latest-forecasts-cnn
      </h2>

      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()}
            />
            <YAxis label={{ value: 'Solar Irradiance (W/m²)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              labelFormatter={(timeStr) => new Date(timeStr).toLocaleString()}
              formatter={(value, name) => [value.toFixed(2), name]}
            />
            <Legend />
            
            <Line 
              type="monotone" 
              dataKey="Actual" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Actual Irradiance"
            />
            
            <Line 
              type="monotone" 
              dataKey="Forecast" 
              stroke="#82ca9d" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Forecast Irradiance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Second Graph */}
      <h2 className="text-2xl font-bold mt-12 mb-4 text-center text-gray-800 dark:text-gray-100">
        Forecast using latest-forecasts-cnn-all
      </h2>

      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartDataAll}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()}
            />
            <YAxis label={{ value: 'Solar Irradiance (W/m²)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              labelFormatter={(timeStr) => new Date(timeStr).toLocaleString()}
              formatter={(value, name) => [value.toFixed(2), name]}
            />
            <Legend />
            
            <Line 
              type="monotone" 
              dataKey="Actual" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Actual Irradiance"
            />
            
            <Line 
              type="monotone" 
              dataKey="ForecastAll" 
              stroke="#FF0000" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="ForecastAll Irradiance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Forecasting;
