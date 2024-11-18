// src/pages/History.tsx
import React, { useState, useEffect } from 'react';
import CustomLineChart from '../graphs/CustomLineChart';

const EARLIEST_DATE = new Date('2024-11-15');
const CST_OFFSET = -6 * 60; // CST is UTC-6 in minutes

interface DataPoint {
  time: number;
  value: number;
}

const History: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Convert to CST
    const cstDate = new Date(weekAgo.getTime() + CST_OFFSET * 60 * 1000);

    // Make sure we don't go before EARLIEST_DATE
    const minDate = new Date(Math.max(EARLIEST_DATE.getTime(), cstDate.getTime()));

    return minDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    // Convert to CST
    const cstDate = new Date(today.getTime() + CST_OFFSET * 60 * 1000);
    return cstDate.toISOString().split('T')[0];
  });

  const [error, setError] = useState<string>('');
  const [isSameDay, setIsSameDay] = useState<boolean>(false);
  const [historicalData, setHistoricalData] = useState<{
    temperature: DataPoint[];
    humidity: DataPoint[];
    pressure: DataPoint[];
    windMaxSpeed: DataPoint[];
    rain: DataPoint[];
    uv: DataPoint[];
    uvi: DataPoint[];
    lightLux: DataPoint[];
    windSpeed: number;
    windDirection: number;
    temperatureC: number;
    temperatureF: number;
  } | null>(null);

  // Add isDarkMode state to react to theme changes
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setHistoricalData(null);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    // Check if same day selected
    const isSameDay = start.toISOString().split('T')[0] === end.toISOString().split('T')[0];
    setIsSameDay(isSameDay);

    // Validation checks
    if (start < EARLIEST_DATE) {
      setError('Start date cannot be earlier than ' + EARLIEST_DATE.toDateString());
      return;
    }
    if (end > today) {
      setError('End date cannot be in the future');
      return;
    }
    if (start > end) {
      setError('Start date must be before end date');
      return;
    }

    try {
      // Format dates for API
      const formattedStartDate = start.toISOString().split('T')[0];
      const formattedEndDate = end.toISOString().split('T')[0];

      const response = await fetch(
        `http://sunsightenergy.com/api/history-data?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      if (!response.ok) {
        // throw new Error('Failed to fetch data, could be that no data found for the selected date range.');
        setError('Failed to fetch data, could be that no data found for the selected date range.');
        return;
      }

      const data = await response.json();

      // Add this check for empty data
      if (data.length === 0) {
        setError('No data found for the selected date range.');
        return;
      }

      // Transform API data to match component state structure
      const transformedData = {
        temperature: data.map((d: any) => ({
          time: new Date(d.timestamp.slice(0,-1)).getTime(),
          value: parseFloat(d.temperature_c.toFixed(2)),
        })),
        humidity: data.map((d: any) => ({
          time: new Date(d.timestamp.slice(0,-1)).getTime(),
          value: parseFloat(d.humidity.toFixed(2)),
        })),
        pressure: data.map((d: any) => ({
          time: new Date(d.timestamp.slice(0,-1)).getTime(),
          value: parseFloat(d.pressure.toFixed(2)),
        })),
        windMaxSpeed: data.map((d: any) => ({
          time: new Date(d.timestamp.slice(0,-1)).getTime(),
          value: parseFloat(d.ambientweatherwindmaxspeed.toFixed(2)),
        })),
        rain: data.map((d: any) => ({
          time: new Date(d.timestamp.slice(0,-1)).getTime(),
          value: parseFloat(d.ambientweatherrain.toFixed(2)),
        })),
        uv: data.map((d: any) => ({
          time: new Date(d.timestamp.slice(0,-1)).getTime(),
          value: parseFloat(d.ambientweatheruv.toFixed(2)),
        })),
        uvi: data.map((d: any) => ({
          time: new Date(d.timestamp.slice(0,-1)).getTime(),
          value: parseFloat(d.ambientweatheruvi.toFixed(2)),
        })),
        lightLux: data.map((d: any) => ({
          time: new Date(d.timestamp.slice(0,-1)).getTime(),
          value: parseFloat(d.ambientweatherlightlux.toFixed(2)),
        })),
        // Use the latest values for gauges
        windSpeed: parseFloat(data[data.length - 1].wind_speed.toFixed(2)),
        windDirection: parseFloat(data[data.length - 1].wind_direction.toFixed(2)),
        temperatureC: parseFloat(data[data.length - 1].temperature_c.toFixed(2)),
        temperatureF: parseFloat(data[data.length - 1].temperature_f.toFixed(2)),
      };

      setHistoricalData(transformedData);
    } catch (err) {
      setError('Failed to fetch historical data');
      console.error(err);
    }
  };

  const datePickerClasses =
    'border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-300';

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-900 min-h-screen w-full transition-colors duration-300 flex flex-col`}
    >
      <div className="flex-grow pt-12 pb-12 px-6 w-full">
        <header className="mb-8">
          <h1
            className={`text-4xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100`}
          >
            Historical Data
          </h1>
          <p className={`text-center text-gray-600 dark:text-gray-300`}>
            View historical weather data
          </p>
        </header>

        {/* Form - Always visible */}
        <form onSubmit={handleSubmit} className="mb-8 flex flex-col items-center">
          <div className="flex flex-wrap gap-4 justify-center">
            <div>
              <label
                htmlFor="startDate"
                className={`block mb-2 text-gray-600 dark:text-gray-100`}
              >
                Start Date:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={datePickerClasses}
                required
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className={`block mb-2 text-gray-600 dark:text-gray-100`}
              >
                End Date:
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={datePickerClasses}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded self-end hover:bg-blue-600 mt-4 sm:mt-0"
            >
              Fetch Data
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Charts - Only visible when data exists */}
        {historicalData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temperature Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Temperature (°C)"
                data={historicalData.temperature}
                dataKey="value"
                unit=" °C"
                strokeColor="#FF4500"
                tickFormat={isSameDay ? 'hourly' : 'daily'}
                yAxisLabel="Temperature (°C)"
                dy={50}
              />
            </div>
            {/* Humidity Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Humidity (%)"
                data={historicalData.humidity}
                dataKey="value"
                unit=" %"
                strokeColor="#1E90FF"
                tickFormat={isSameDay ? 'hourly' : 'daily'}
                yAxisLabel="Humidity (%)"
                dy={40}
              />
            </div>
            {/* Air Pressure Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Air Pressure (hPa)"
                data={historicalData.pressure}
                dataKey="value"
                unit=" hPa"
                strokeColor="#32CD32"
                tickFormat={isSameDay ? 'hourly' : 'daily'}
                yAxisLabel="Pressure (hPa)"
                dy={40}
                dx={-15}
              />
            </div>
            {/* Wind Max Speed Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Wind Max Speed (km/h)"
                data={historicalData.windMaxSpeed}
                dataKey="value"
                unit=" km/h"
                strokeColor="#FFD700"
                tickFormat={isSameDay ? 'hourly' : 'daily'}
                yAxisLabel="Wind Max Speed (km/h)"
                dy={70}
                dx={-5}
              />
            </div>
            {/* Rain Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Rain (mm)"
                data={historicalData.rain}
                dataKey="value"
                unit=" mm"
                strokeColor="#4682B4"
                tickFormat={isSameDay ? 'hourly' : 'daily'}
                yAxisLabel="Rain (mm)"
                dy={20}
              />
            </div>
            {/* UV Index Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="UV Index"
                data={historicalData.uv}
                dataKey="value"
                strokeColor="#FFA07A"
                tickFormat={isSameDay ? 'hourly' : 'daily'}
                yAxisLabel="UV Index"
                dy={20}
                dx={10}
              />
            </div>
            {/* Light Lux Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Light Lux (lx)"
                data={historicalData.lightLux}
                dataKey="value"
                unit=" lx"
                strokeColor="#8A2BE2"
                tickFormat={isSameDay ? 'hourly' : 'daily'}
                yAxisLabel="Light Lux (lx)"
                dy={40}
              />
            </div>
          </div>
        )}
      </div>

      <footer className="bg-white dark:bg-gray-700 transition-colors duration-300 shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} CSCE 483 Solar Irradiance Project.
        </div>
      </footer>
    </div>
  );
};

export default History;