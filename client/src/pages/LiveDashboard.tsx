// src/components/LiveDashboard.tsx
import React, { useEffect, useState } from 'react';
import CustomLineChart from '../graphs/CustomLineChart';
import ThermometerChart from '../graphs/ThermometerChart';
import WindGauge from '../graphs/WindGauge';
// import axios from 'axios';
import testImage from '../assets/test.jpg'; // Import the image


interface LiveData {
  temperatureC: number;
  temperatureF: number;
  humidity: number;
  airPressure: number;
  windSpeed: number;
  windDirection: number;
  imageUrl: string;
  timestamp: string;
}

interface DataPoint {
  time: number; // Timestamp in milliseconds
  value: number;
}

const generateBogusData = (): LiveData => {
  const now = new Date();
  return {
    temperatureC: Math.random() * 30,
    temperatureF: Math.random() * 86,
    humidity: Math.random() * 100,
    airPressure: 950 + Math.random() * 100,
    windSpeed: Math.random() * 20,
    windDirection: Math.random() * 360,
    imageUrl: testImage,
    timestamp: now.toISOString(),
  };
};

const LiveDashboard: React.FC = () => {
  const [data, setData] = useState<LiveData | null>(null);
  const [temperatureData, setTemperatureData] = useState<DataPoint[]>([]);
  const [humidityData, setHumidityData] = useState<DataPoint[]>([]);
  const [airPressureData, setAirPressureData] = useState<DataPoint[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // const response = await axios.get<LiveData>('http://localhost:5000/api/live-data');
      // setData(response.data);
      const newData = generateBogusData();
      setData(newData);
      const timestamp = new Date(newData.timestamp).getTime();

      setTemperatureData(prevData => {
        const updated = [...prevData, { time: timestamp, value: newData.temperatureC }];
        return updated.slice(-50); // Keep last 50 points
      });

      setHumidityData(prevData => {
        const updated = [...prevData, { time: timestamp, value: newData.humidity }];
        return updated.slice(-50); // Keep last 50 points
      });

      setAirPressureData(prevData => {
        const updated = [...prevData, { time: timestamp, value: newData.airPressure }];
        return updated.slice(-50); // Keep last 50 points
      });
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Live Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Temperature Charts */}
        <div>
          <CustomLineChart
            title="Temperature"
            data={temperatureData}
            dataKey="value"
            unit="°C"
            strokeColor="#FF4500"
          />
        </div>
        {/* Humidity Charts */}
        <div>
          <CustomLineChart
            title="Humidity"
            data={humidityData}
            dataKey="value"
            unit="%"
            strokeColor="#1E90FF"
          />
        </div>
        {/* Air Pressure Charts */}
        <div>
          <CustomLineChart
            title="Air Pressure"
            data={airPressureData}
            dataKey="value"
            unit=" hPa"
            strokeColor="#32CD32"
          />
        </div>
        {/* Wind Gauges */}
        <div>
          <WindGauge speed={data.windSpeed} direction={data.windDirection} />
        </div>
        <ThermometerChart temperature={data.temperatureC} />
        {/* Image */}
        <div>
          <img src={data.imageUrl} alt="Weather" className="mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;