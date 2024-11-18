// src/components/Forecasting.tsx
import React, { useState } from 'react';
import CustomLineChart from '../graphs/CustomLineChart';

interface ForecastInput {
  temperature: number;
  windSpeed: number;
  cloudCoverage: number;
  timeOfDay: string;
}

interface ForecastPoint {
  time: number;
  value: number;
}

const Forecasting: React.FC = () => {
  const [selectedInterval, setSelectedInterval] = useState<number>(15);
  const [inputs, setInputs] = useState<ForecastInput>({
    temperature: 20,
    windSpeed: 5,
    cloudCoverage: 0,
    timeOfDay: '12:00'
  });
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);

  const intervals = [15, 30, 45, 60];

  // Temporary mock prediction function
  const generatePredictions = (minutes: number) => {
    const predictions: ForecastPoint[] = [];
    const baseTime = new Date().getTime();
    
    for (let i = 0; i <= minutes; i += 5) {
      predictions.push({
        time: baseTime + i * 60000,
        value: Math.random() * 1000 // Mock irradiance value
      });
    }
    return predictions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally make an API call to your ML model
    const predictions = generatePredictions(selectedInterval);
    setForecastData(predictions);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Solar Irradiance Forecasting</h1>

      {/* Interval Selection */}
      <div className="mb-8 flex justify-center gap-4">
        {intervals.map(interval => (
          <button
            key={interval}
            onClick={() => setSelectedInterval(interval)}
            className={`px-4 py-2 rounded ${
              selectedInterval === interval
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {interval} minutes
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Temperature (°C):</label>
            <input
              type="number"
              value={inputs.temperature}
              onChange={(e) => setInputs({...inputs, temperature: Number(e.target.value)})}
              className="w-full border rounded p-2"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Wind Speed (m/s):</label>
            <input
              type="number"
              value={inputs.windSpeed}
              onChange={(e) => setInputs({...inputs, windSpeed: Number(e.target.value)})}
              className="w-full border rounded p-2"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Cloud Coverage (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={inputs.cloudCoverage}
              onChange={(e) => setInputs({...inputs, cloudCoverage: Number(e.target.value)})}
              className="w-full border rounded p-2"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Time of Day:</label>
            <input
              type="time"
              value={inputs.timeOfDay}
              onChange={(e) => setInputs({...inputs, timeOfDay: e.target.value})}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Generate Forecast
          </button>
        </div>
      </form>

      {/* Forecast Graph */}
      {forecastData.length > 0 && (
        <div className="mt-8">
          <CustomLineChart
            title={`${selectedInterval}-Minute Irradiance Forecast`}
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