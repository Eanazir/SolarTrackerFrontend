import React, { useState } from 'react';

interface WeatherData {
  timestamp: string;
  temperatureC: number;
  humidity: number;
  airPressure: number;
}

const EARLIEST_DATE = new Date('2024-01-01'); // adjust as needed

const ExportData: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Generate mock data for date range
  const generateData = (start: Date, end: Date): WeatherData[] => {
    const data: WeatherData[] = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      // Generate data points per day
      for (let i = 0; i < 24; i++) {
        const pointDate = new Date(currentDate);
        pointDate.setHours(i);
        data.push({
          timestamp: pointDate.toISOString(),
          temperatureC: Math.random() * 30,
          humidity: Math.random() * 100,
          airPressure: 950 + Math.random() * 100
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  };

  const convertToCSV = (data: WeatherData[]): string => {
    const headers = ['Timestamp', 'Temperature (°C)', 'Humidity (%)', 'Air Pressure (hPa)'];
    const rows = data.map(item => [
      item.timestamp,
      item.temperatureC.toFixed(2),
      item.humidity.toFixed(2),
      item.airPressure.toFixed(2)
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();

      // Validate dates
      if (start < EARLIEST_DATE) {
        setError(`Data only available from ${EARLIEST_DATE.toLocaleDateString()} onwards`);
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

      // Generate data and convert to CSV
      const data = generateData(start, end);
      const csv = convertToCSV(data);

      // Create and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `weather_data_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export data');
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen w-full transition-colors duration-300 flex flex-col">
      <header className="mb-8 pt-10">
          <h1
            className={`text-4xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100`}
          >
            Export Weather Data
          </h1>
          <p className={`text-center text-gray-600 dark:text-gray-300`}>
            Export historical weather data
          </p>
        </header>

      <form onSubmit={handleExport} className="mb-8 flex flex-col items-center">
        <div className="flex gap-4">
          <div>
            <label htmlFor="startDate" className="block mb-2 text-gray-600 dark:text-gray-100">
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              min={EARLIEST_DATE.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-300"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block mb-2 text-gray-600 dark:text-gray-100">
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-300"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded self-end hover:bg-blue-600 mt-4 sm:mt-0"
            disabled={!startDate || !endDate}
          >
            Export to CSV
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 dark:text-red-400 text-center mb-4">{error}</div>
      )}
    </div>
  );
};

export default ExportData;