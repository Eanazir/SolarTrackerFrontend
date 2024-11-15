// src/components/History.tsx
import React, { useState } from 'react';
import CustomLineChart from '../graphs/CustomLineChart';

const EARLIEST_DATE = new Date('2023-01-01'); // adjust if needed

interface HistoricalData {
    temperatureC: number;
    humidity: number;
    airPressure: number;
    timestamp: string;
  }
  
  interface DataPoint {
    time: number;
    value: number;
  }

const generateRandomDataPoint = (date: Date): HistoricalData => {
    return {
      temperatureC: Math.random() * 30,
      humidity: Math.random() * 100,
      airPressure: 950 + Math.random() * 100,
      timestamp: date.toISOString()
    };
  };
  
  // Add this function to generate data for a date range
  const generateHistoricalData = (startDate: Date, endDate: Date): HistoricalData[] => {
    const data: HistoricalData[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Generate 10 points for each day
      for (let i = 0; i < 10; i++) {
        const pointDate = new Date(currentDate);
        // Spread points throughout the day
        pointDate.setHours(Math.floor(i * 2.4));
        data.push(generateRandomDataPoint(pointDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };




const History: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [historicalData, setHistoricalData] = useState<{
    temperature: DataPoint[];
    humidity: DataPoint[];
    airPressure: DataPoint[];
  } | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setHistoricalData(null);

  // Validate dates
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
    // Generate mock data instead of API call
    const data = generateHistoricalData(start, end);

    // Transform data for charts
    const transformedData = {
      temperature: data.map(d => ({
        time: new Date(d.timestamp).getTime(),
        value: d.temperatureC
      })),
      humidity: data.map(d => ({
        time: new Date(d.timestamp).getTime(),
        value: d.humidity
      })),
      airPressure: data.map(d => ({
        time: new Date(d.timestamp).getTime(),
        value: d.airPressure
      }))
    };

    setHistoricalData(transformedData);
  } catch (err) {
    setError('Failed to generate historical data');
    console.error(err);
  }
};

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Historical Data</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 flex flex-col items-center">
        <div className="flex gap-4">
          <div>
            <label htmlFor="startDate" className="block mb-2">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block mb-2">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded"
              required
            />
          </div>
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded self-end"
          >
            Fetch Data
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {historicalData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <CustomLineChart
              title="Historical Temperature"
              data={historicalData.temperature}
              dataKey="value"
              unit="°C"
              strokeColor="#FF4500"
              tickFormat='daily'
            />
          </div>
          <div>
            <CustomLineChart
              title="Historical Humidity"
              data={historicalData.humidity}
              dataKey="value"
              unit="%"
              strokeColor="#1E90FF"
              tickFormat='daily'
            />
          </div>
          <div>
            <CustomLineChart
              title="Historical Air Pressure"
              data={historicalData.airPressure}
              dataKey="value"
              unit=" hPa"
              strokeColor="#32CD32"
              tickFormat='daily'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default History;