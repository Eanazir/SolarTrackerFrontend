// src/components/LiveDashboard.tsx
import React, { useEffect, useState } from 'react';
import CustomLineChart from '../graphs/CustomLineChart';
import ThermometerChart from '../graphs/ThermometerChart';
import WindGauge from '../graphs/WindGauge';
import axios from 'axios';

interface LiveData {
  temperature_c: number;
  temperature_f: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  image_url?: string;
  timestamp: string;
}

const initialData: LiveData = {
  temperature_c: 0,
  temperature_f: 32,
  humidity: 0,
  pressure: 1013,
  wind_speed: 0,
  wind_direction: 0,
  timestamp: new Date().toISOString(),
};

interface ChartDataPoint {
  time: number;
  value: number;
}

class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const LiveDashboard: React.FC = () => {
  const [data, setData] = useState<LiveData>(initialData);
  const [temperatureData, setTemperatureData] = useState<ChartDataPoint[]>([]);
  const [humidityData, setHumidityData] = useState<ChartDataPoint[]>([]);
  const [airPressureData, setAirPressureData] = useState<ChartDataPoint[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.get<LiveData>('http://sunsightenergy.com/api/live-data');
      if (response.data) {
        const newData: LiveData = {
          temperature_c: response.data.temperature_c ?? 0,
          temperature_f: response.data.temperature_f ?? 32,
          humidity: response.data.humidity ?? 0,
          pressure: response.data.pressure ?? 1013,
          wind_speed: response.data.wind_speed ?? 0,
          wind_direction: response.data.wind_direction ?? 0,
          image_url: response.data.image_url,
          timestamp: response.data.timestamp ?? new Date().toISOString(),
        };
        setData(newData);
        const timestamp = new Date(newData.timestamp).getTime();

        // Append a unique identifier to the timestamp to ensure uniqueness
        const uniqueTimestamp = timestamp + Math.random();

        setTemperatureData(prevData => {
          const updated = [...prevData, { time: uniqueTimestamp, value: newData.temperature_c }];
          return updated.slice(-50);
        });

        setHumidityData(prevData => {
          const updated = [...prevData, { time: uniqueTimestamp, value: newData.humidity }];
          return updated.slice(-50);
        });

        setAirPressureData(prevData => {
          const updated = [...prevData, { time: uniqueTimestamp, value: newData.pressure }];
          return updated.slice(-50);
        });
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Fetch data every 60 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <ErrorBoundary fallback={<div className="text-red-500">Error loading dashboard</div>}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Live Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <CustomLineChart
              title="Temperature"
              data={temperatureData}
              dataKey="value"
              unit="°C"
              strokeColor="#FF4500"
            />
          </div>
          <div>
            <CustomLineChart
              title="Humidity"
              data={humidityData}
              dataKey="value"
              unit="%"
              strokeColor="#1E90FF"
            />
          </div>
          <div>
            <CustomLineChart
              title="Air Pressure"
              data={airPressureData}
              dataKey="value"
              unit=" hPa"
              strokeColor="#32CD32"
            />
          </div>
          <div>
            <WindGauge speed={data.wind_speed} direction={data.wind_direction} />
          </div>
          <ThermometerChart temperature={data.temperature_c} />
          <div>
            {data.image_url ? (
              <img 
                src={data.image_url} 
                alt="Weather" 
                className="mx-auto max-w-full h-auto"
                onError={(e) => {
                  console.error('Error loading image:', e);
                  (e.target as HTMLImageElement).src = '/path/to/fallback-image.png';
                }}
              />
            ) : (
              <div>No image available</div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LiveDashboard;