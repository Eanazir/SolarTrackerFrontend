// src/pages/History.tsx
import React, { useState, useEffect } from 'react';
import CustomLineChart from '../graphs/CustomLineChart';
import ThermometerChart from '../graphs/ThermometerChart';
import WindGauge from '../graphs/WindGauge';

const EARLIEST_DATE = new Date('2023-01-01');

interface HistoricalData {
  temperature_c: number;
  temperature_f: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  wind_max_speed: number;
  rain: number;
  uv: number;
  uvi: number;
  light_lux: number;
  timestamp: string;
}

interface DataPoint {
  time: number;
  value: number;
}

const generateRandomDataPoint = (date: Date): HistoricalData => {
  return {
    temperature_c: Math.random() * 30,
    temperature_f: (Math.random() * 30) * 1.8 + 32,
    humidity: Math.random() * 100,
    pressure: 950 + Math.random() * 100,
    wind_speed: Math.random() * 15,
    wind_direction: Math.random() * 360,
    wind_max_speed: Math.random() * 20,
    rain: Math.random() * 10,
    uv: Math.random() * 11,
    uvi: Math.random() * 11,
    light_lux: Math.random() * 100000,
    timestamp: date.toISOString(),
  };
};

const generateHistoricalData = (startDate: Date, endDate: Date): HistoricalData[] => {
  const data: HistoricalData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    for (let i = 0; i < 10; i++) {
      const pointDate = new Date(currentDate);
      pointDate.setHours(Math.floor(i * 2.4));
      data.push(generateRandomDataPoint(pointDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

const History: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    // Adjust for local timezone
    weekAgo.setMinutes(weekAgo.getMinutes() + weekAgo.getTimezoneOffset());
    return weekAgo.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD in local timezone
  });

  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    // Adjust for local timezone
    today.setMinutes(today.getMinutes() + today.getTimezoneOffset());
    return today.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD in local timezone
  });

  const [error, setError] = useState<string>('');
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
      const data = generateHistoricalData(start, end);

      const transformedData = {
        temperature: data.map((d) => ({
          time: new Date(d.timestamp).getTime(),
          value: d.temperature_c,
        })),
        humidity: data.map((d) => ({
          time: new Date(d.timestamp).getTime(),
          value: d.humidity,
        })),
        pressure: data.map((d) => ({
          time: new Date(d.timestamp).getTime(),
          value: d.pressure,
        })),
        windMaxSpeed: data.map((d) => ({
          time: new Date(d.timestamp).getTime(),
          value: d.wind_max_speed,
        })),
        rain: data.map((d) => ({
          time: new Date(d.timestamp).getTime(),
          value: d.rain,
        })),
        uv: data.map((d) => ({
          time: new Date(d.timestamp).getTime(),
          value: d.uv,
        })),
        uvi: data.map((d) => ({
          time: new Date(d.timestamp).getTime(),
          value: d.uvi,
        })),
        lightLux: data.map((d) => ({
          time: new Date(d.timestamp).getTime(),
          value: d.light_lux,
        })),
        windSpeed: data[data.length - 1].wind_speed,
        windDirection: data[data.length - 1].wind_direction,
        temperatureC: data[data.length - 1].temperature_c,
        temperatureF: data[data.length - 1].temperature_f,
      };

      setHistoricalData(transformedData);
    } catch (err) {
      setError('Failed to generate historical data');
      console.error(err);
    }
  };

  const datePickerClasses = "border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-300";

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 min-h-screen w-full transition-colors duration-300 flex flex-col`}>
      <div className="flex-grow pt-12 pb-12 px-6 w-full">
        <header className="mb-8">
          <h1 className={`text-4xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100`}>
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
              <label htmlFor="startDate" className={`block mb-2 text-gray-600 dark:text-gray-100`}>
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
              <label htmlFor="endDate" className={`block mb-2 text-gray-600 dark:text-gray-100`}>
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
          <div className={`text-red-500 mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
            {error}
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
                tickFormat="daily"
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
                tickFormat="daily"
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
                tickFormat="daily"
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
                tickFormat="daily"
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
                tickFormat="daily"
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
                tickFormat="daily"
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
                tickFormat="daily"
                yAxisLabel="Light Lux (lx)"
                dy={40}
              />
            </div>
            {/* Wind Gauge */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <WindGauge
                speed={historicalData.windSpeed}
                direction={historicalData.windDirection}
              />
            </div>
            {/* Thermometer Charts */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300 flex flex-row justify-between space-x-6 items-center">
              <ThermometerChart
                temperature={historicalData.temperatureC}
                unit="C"
              />
              <ThermometerChart
                temperature={historicalData.temperatureF}
                unit="F"
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