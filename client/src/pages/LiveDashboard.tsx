// src/components/LiveDashboard.tsx
import React, { useEffect, useState } from 'react';
import CustomLineChart from '../graphs/CustomLineChart';
import ThermometerChart from '../graphs/ThermometerChart';
import WindGauge from '../graphs/WindGauge';
import Timelapse from '../components/Timelapse';
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
  battery_ok: boolean;
  wind_max_speed: number;
  rain: number;
  uv: number;
  uvi: number;
  light_lux: number;
}

const initialData: LiveData = {
  temperature_c: 0,
  temperature_f: 32,
  humidity: 0,
  pressure: 1013,
  wind_speed: 0,
  wind_direction: 0,
  timestamp: new Date().toISOString(),
  battery_ok: true,
  wind_max_speed: 0,
  rain: 0,
  uv: 0,
  uvi: 0,
  light_lux: 0,
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const LiveDashboard: React.FC = () => {
  const [data, setData] = useState<LiveData | null>(null);
  const [temperatureData, setTemperatureData] = useState<ChartDataPoint[]>([]);
  const [humidityData, setHumidityData] = useState<ChartDataPoint[]>([]);
  const [airPressureData, setAirPressureData] = useState<ChartDataPoint[]>([]);
  const [windMaxSpeedData, setWindMaxSpeedData] = useState<ChartDataPoint[]>([]);
  const [rainData, setRainData] = useState<ChartDataPoint[]>([]);
  const [uvData, setUVData] = useState<ChartDataPoint[]>([]);
  const [uviData, setUVIData] = useState<ChartDataPoint[]>([]);
  const [lightLuxData, setLightLuxData] = useState<ChartDataPoint[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    try {
      const response = await axios.get<LiveData>('http://sunsightenergy.com/api/live-data');
      if (response.data) {
        const newData: LiveData = {
          temperature_c: parseFloat((response.data.temperature_c ?? 0).toFixed(2)),
          temperature_f: parseFloat((response.data.temperature_f ?? 32).toFixed(2)),
          humidity: parseFloat((response.data.humidity ?? 0).toFixed(2)),
          pressure: parseFloat((response.data.pressure ?? 1013).toFixed(2)),
          wind_speed: parseFloat((response.data.wind_speed ?? 0).toFixed(2)),
          wind_direction: parseFloat((response.data.wind_direction ?? 0).toFixed(2)),
          image_url: response.data.image_url,
          timestamp: response.data.timestamp ?? new Date().toISOString(),
          battery_ok: response.data.battery_ok ?? true,
          wind_max_speed: parseFloat((response.data.wind_max_speed ?? 0).toFixed(2)),
          rain: parseFloat((response.data.rain ?? 0).toFixed(2)),
          uv: parseFloat((response.data.uv ?? 0).toFixed(2)),
          uvi: parseFloat((response.data.uvi ?? 0).toFixed(2)),
          light_lux: parseFloat((response.data.light_lux ?? 0).toFixed(2)),
        };
  
        setData(newData);
  
        const timestamp = new Date(newData.timestamp).getTime();
        const uniqueTimestamp = timestamp + Math.random();
  
        setTemperatureData((prevData) => [...prevData, { time: uniqueTimestamp, value: newData.temperature_c }].slice(-50));
        setHumidityData((prevData) => [...prevData, { time: uniqueTimestamp, value: newData.humidity }].slice(-50));
        setAirPressureData((prevData) => [...prevData, { time: uniqueTimestamp, value: newData.pressure }].slice(-50));
        setWindMaxSpeedData((prevData) => [...prevData, { time: uniqueTimestamp, value: newData.wind_max_speed }].slice(-50));
        setRainData((prevData) => [...prevData, { time: uniqueTimestamp, value: newData.rain }].slice(-50));
        setUVData((prevData) => [...prevData, { time: uniqueTimestamp, value: newData.uv }].slice(-50));
        setUVIData((prevData) => [...prevData, { time: uniqueTimestamp, value: newData.uvi }].slice(-50));
        setLightLuxData((prevData) => [...prevData, { time: uniqueTimestamp, value: newData.light_lux }].slice(-50));
  
        if (newData.image_url) {
          if (newData.image_url) {
            setImageUrls((prevUrls) => [...prevUrls, newData.image_url!].slice(-50));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
      setError('Unable to fetch live data at this time.');
    }
  };
  
  useEffect(() => {
    fetchData();
    const dataInterval = setInterval(fetchData, 60000);
    return () => clearInterval(dataInterval);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-xl">Loading live data...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div className="text-red-500">Error loading dashboard</div>}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen w-full transition-colors duration-300">
        <div className="pt-12 pb-12 px-6 w-full">
          <header className="mb-8">
            <div>
              <h1 className="text-4xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100">
                Live Weather Data
              </h1>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Real-time solar irradiance and weather monitoring
              </p>
            </div>
            {/* DarkModeToggle is included in App component */}
          </header>
          {error && (
            <div className="bg-red-100 dark:bg-gray-700 transition-colors duration-300 text-red-800 dark:text-red-100 p-4 rounded mb-6">
              <p>{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart title="Temperature (°C)" data={temperatureData} dataKey="value" unit=" °C" strokeColor="#FF4500" tickFormat='hourly' yAxisLabel="Temperature (°C)" dy={50} />
            </div>
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart title="Humidity (%)" data={humidityData} dataKey="value" unit=" %" strokeColor="#1E90FF" tickFormat='hourly' yAxisLabel="Humidity (%)" dy={40} />
            </div>
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart title="Air Pressure (hPa)" data={airPressureData} dataKey="value" unit=" hpa" strokeColor="#32CD32" tickFormat='hourly' yAxisLabel="Pressure (hPa)" dy={40} dx={-15} />
            </div>
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart title="Wind Max Speed (km/h)" data={windMaxSpeedData} dataKey="value" unit=" km/h" strokeColor="#FFD700" tickFormat='hourly' yAxisLabel="Wind Max Speed (km/h)" dy={70} dx={-5} />
            </div>
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart title="Rain (mm)" data={rainData} dataKey="value" unit=" mm" strokeColor="#4682B4" tickFormat='hourly' yAxisLabel="Rain (mm)" dy={20}/>
            </div>
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart title="UV Index" data={uvData} dataKey="value" strokeColor="#FFA07A" tickFormat='hourly' yAxisLabel="UV Index" dy={20} dx={10} />
            </div>
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart title="Light Lux (lx)" data={lightLuxData} dataKey="value" unit=" lx" strokeColor="#8A2BE2" tickFormat='hourly' yAxisLabel="Light Lux (lx)" dy={40} />
            </div>
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <WindGauge speed={data.wind_speed} direction={data.wind_direction} />
            </div>

            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300 flex flex-row justify-between space-x-6 items-center dark:bg-gray-700 transition-colors duration-300">
              <ThermometerChart temperature={data.temperature_c} unit="C" />
              <ThermometerChart temperature={data.temperature_f} unit="F" />
            </div>

            <div className="bg-white shadow-md rounded p-4 flex flex-col items-center dark:bg-gray-700 transition-colors duration-300">
              <h2 className="text-xl font-bold mb-4 text-center dark:text-gray-300">Live Image</h2>
              {data.image_url ? (
                <div className="bg-white p-2 rounded-md shadow dark:bg-gray-700 transition-colors duration-300">
                  <img
                    src={data.image_url}
                    alt="Weather"
                    className="w-56 h-56 object-cover rounded"
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-lg dark:text-gray-300">No image available</p>
              )}
            </div>


          </div>

          {/* Timelapse Section */}
          <div className="bg-white dark:bg-gray-700 transition-colors duration-300 shadow-md rounded-lg p-6 mt-6 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-300">Timelapse</h2>
            {imageUrls.length === 0 ? (
              <div className="flex justify-center items-center h-64 bg-gray-200 rounded-md">
                <p className="text-gray-500 text-lg dark:text-gray-300">No timelapse images available</p>
              </div>
            ) : (
              <div className="bg-white p-2 rounded-md shadow dark:bg-gray-800 transition-colors duration-300">
                <Timelapse images={imageUrls} interval={1500} />
              </div>
            )}
          </div>

        </div>

        <footer className="bg-white dark:bg-gray-700 transition-colors duration-300 shadow-sm transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-300">
            &copy; {new Date().getFullYear()} CSCE 483 Solar Irradiance Project.
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default LiveDashboard;
