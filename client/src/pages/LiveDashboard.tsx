// src/components/LiveDashboard.tsx
import React, { useEffect, useState, useRef } from 'react';
import CustomLineChart from '../graphs/CustomLineChart';
import ThermometerChart from '../graphs/ThermometerChart';
import WindGauge from '../graphs/WindGauge';
import Timelapse from '../components/Timelapse';
import axios from 'axios';

interface LiveData {
  temperature_c: number;
  temperature_f: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  timestamp: string;
  pressure: number;
  ambientweatherbatteryok: boolean;
  ambientweathertemp: number;
  ambientweatherhumidity: number;
  ambientweatherwinddirection: number;
  ambientweatherwindspeed: number;
  ambientweatherwindmaxspeed: number;
  ambientweatherrain: number;
  ambientweatheruv: number;
  ambientweatheruvi: number;
  ambientweatherlightlux: number;
  image_url?: string;
}

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

const CST_OFFSET = -6; // CST is UTC-6
const day_offset = 2; // Last 2 days for now

const LiveDashboard: React.FC = () => {
  const [data, setData] = useState<LiveData | null>(null);
  const dataRef = useRef<LiveData | null>(data); // Create a ref to hold the latest data
  const [temperatureData, setTemperatureData] = useState<ChartDataPoint[]>([]);
  const [humidityData, setHumidityData] = useState<ChartDataPoint[]>([]);
  const [airPressureData, setAirPressureData] = useState<ChartDataPoint[]>([]);
  const [windMaxSpeedData, setWindMaxSpeedData] = useState<ChartDataPoint[]>([]);
  const [rainData, setRainData] = useState<ChartDataPoint[]>([]);
  const [uvData, setUVData] = useState<ChartDataPoint[]>([]);
  const [lightLuxData, setLightLuxData] = useState<ChartDataPoint[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  // Update the ref whenever data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Function to fetch historical data for the last day
  const fetchHistoricalData = async () => {
    try {
      // Calculate the dates for the last day
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 3); // Last 2 day for now //////////////////

      // Convert dates to CST
      const cstEndDate = new Date(endDate.getTime() + CST_OFFSET * 60 * 60 * 1000);
      const cstStartDate = new Date(startDate.getTime() + CST_OFFSET * 60 * 60 * 1000);

      // Format dates for API
      const formattedStartDate = cstStartDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const formattedEndDate = cstEndDate.toISOString().split('T')[0]; // YYYY-MM-DD
      console.log('Fetching historical data from', formattedStartDate, 'to', formattedEndDate);

      const response = await axios.get<LiveData[]>(
        `https://sunsightenergy.com/api/history-data?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      if (response.data) {
        const historicalData = response.data;
        // console.log('Historical data:', historicalData);

        // Take the last 50 data points
        const last50Data = historicalData.slice(-50);
        // Update chart data arrays
        setTemperatureData(
          last50Data.map((d) => ({
            time: new Date(d.timestamp.slice(0, -1)).getTime(),
            value: d.temperature_c ? parseFloat(d.temperature_c.toFixed(2)) : 0,
          }))
        );
        setHumidityData(
          last50Data.map((d) => ({
            time: new Date(d.timestamp.slice(0, -1)).getTime(),
            value: d.humidity ? parseFloat(d.humidity.toFixed(2)) : 0,
          }))
        );
        setAirPressureData(
          last50Data.map((d) => ({
            time: new Date(d.timestamp.slice(0, -1)).getTime(),
            value: d.pressure ? parseFloat(d.pressure.toFixed(2)) : 0,
          }))
        );
        setWindMaxSpeedData(
          last50Data.map((d) => ({
            time: new Date(d.timestamp.slice(0, -1)).getTime(),
            value: d.ambientweatherwindmaxspeed ? parseFloat(d.ambientweatherwindmaxspeed.toFixed(2)) : 0,
          }))
        );
        setRainData(
          last50Data.map((d) => ({
            time: new Date(d.timestamp.slice(0, -1)).getTime(),
            value: d.ambientweatherrain ? parseFloat(d.ambientweatherrain.toFixed(2)) : 0,
          }))
        );
        setUVData(
          last50Data.map((d) => ({
            time: new Date(d.timestamp.slice(0, -1)).getTime(),
            value: d.ambientweatheruv ? d.ambientweatheruv : 0,
          }))
        );
        setLightLuxData(
          last50Data.map((d) => ({
            time: new Date(d.timestamp.slice(0, -1)).getTime(),
            value: d.ambientweatherlightlux ? parseFloat(d.ambientweatherlightlux.toFixed(2)) : 0,
          }))
        );

        // Update the image URLs for timelapse
        const imageUrls = last50Data
          .filter((d) => d.image_url)
          .map((d) => d.image_url!);
        setImageUrls(imageUrls);

        // Set the latest data point as the current data
        const latestData = last50Data[last50Data.length - 1];
        setData(latestData);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Unable to fetch historical data.');
    }
  };

  // Function to fetch live data
  const fetchLiveData = async () => {
    try {
      const response = await axios.get<LiveData>('https://sunsightenergy.com/api/live-data');
      if (response.data) {
        const newData: LiveData = {
          temperature_c: parseFloat((response.data.temperature_c ?? 0).toFixed(2)),
          temperature_f: parseFloat((response.data.temperature_f ?? 32).toFixed(2)),
          humidity: parseFloat((response.data.humidity ?? 0).toFixed(2)),
          wind_speed: parseFloat((response.data.wind_speed ?? 0).toFixed(2)),
          wind_direction: parseFloat((response.data.wind_direction ?? 0).toFixed(2)),
          timestamp: response.data.timestamp ?? new Date().toISOString(),
          pressure: parseFloat((response.data.pressure ?? 1013).toFixed(2)),
          ambientweatherbatteryok: response.data.ambientweatherbatteryok ?? true,
          ambientweathertemp: parseFloat((response.data.ambientweathertemp ?? 0).toFixed(2)),
          ambientweatherhumidity: parseFloat((response.data.ambientweatherhumidity ?? 0).toFixed(2)),
          ambientweatherwinddirection: parseFloat((response.data.ambientweatherwinddirection ?? 0).toFixed(2)),
          ambientweatherwindspeed: parseFloat((response.data.ambientweatherwindspeed ?? 0).toFixed(2)),
          ambientweatherwindmaxspeed: parseFloat((response.data.ambientweatherwindmaxspeed ?? 0).toFixed(2)),
          ambientweatherrain: parseFloat((response.data.ambientweatherrain ?? 0).toFixed(2)),
          ambientweatheruv: response.data.ambientweatheruv ?? 0,
          ambientweatheruvi: response.data.ambientweatheruvi ?? 0,
          ambientweatherlightlux: parseFloat((response.data.ambientweatherlightlux ?? 0).toFixed(2)),
          image_url: response.data.image_url,
        };

        // Use dataRef.current instead of data
        if (dataRef.current && newData.timestamp === dataRef.current.timestamp) {
          console.log('No new data, skipping update');
          return;
        }

        setData(newData);

        const timestamp = new Date(newData.timestamp.slice(0,-1)).getTime();

        // Append new data to charts, keeping only last 50 data points
        setTemperatureData((prevData) => [
          ...prevData.slice(-49),
          { time: timestamp, value: newData.temperature_c },
        ]);
        setHumidityData((prevData) => [
          ...prevData.slice(-49),
          { time: timestamp, value: newData.humidity },
        ]);
        setAirPressureData((prevData) => [
          ...prevData.slice(-49),
          { time: timestamp, value: newData.pressure },
        ]);
        setWindMaxSpeedData((prevData) => [
          ...prevData.slice(-49),
          { time: timestamp, value: newData.ambientweatherwindmaxspeed },
        ]);
        setRainData((prevData) => [
          ...prevData.slice(-49),
          { time: timestamp, value: newData.ambientweatherrain },
        ]);
        setUVData((prevData) => [
          ...prevData.slice(-49),
          { time: timestamp, value: newData.ambientweatheruv },
        ]);
        setLightLuxData((prevData) => [
          ...prevData.slice(-49),
          { time: timestamp, value: newData.ambientweatherlightlux },
        ]);

        if (newData.image_url) {
          setImageUrls((prevUrls) => [...prevUrls.slice(-49), newData.image_url!]);
        }

        try {
          await axios.post('https://sunsightenergy.com/api/process-forecast');
        } catch (error) {
          console.error('Error processing weather forecast:', error);
          // Optionally, you can display a notification to the user here
        }
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
      setError('Unable to fetch live data at this time.');
    }
  };

  useEffect(() => {
    // Fetch historical data on mount
    fetchHistoricalData();

    // Set up interval to fetch live data every 17 seconds
    const interval = setInterval(fetchLiveData, 17000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <p className="text-gray-500 text-xl">Loading live data...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 p-4 rounded mb-6">
          Error loading dashboard
        </div>
      }
    >
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
          </header>
          {error && (
            <div className="bg-red-100 dark:bg-gray-700 transition-colors duration-300 text-red-800 dark:text-red-100 p-4 rounded mb-6">
              <p>{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temperature Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Temperature (°C)"
                data={temperatureData}
                dataKey="value"
                unit=" °C"
                strokeColor="#FF4500"
                tickFormat="hourly"
                yAxisLabel="Temperature (°C)"
                dy={50}
              />
            </div>
            {/* Humidity Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Humidity (%)"
                data={humidityData}
                dataKey="value"
                unit=" %"
                strokeColor="#1E90FF"
                tickFormat="hourly"
                yAxisLabel="Humidity (%)"
                dy={40}
              />
            </div>
            {/* Air Pressure Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Air Pressure (hPa)"
                data={airPressureData}
                dataKey="value"
                unit=" hPa"
                strokeColor="#32CD32"
                tickFormat="hourly"
                yAxisLabel="Pressure (hPa)"
                dy={40}
                dx={-15}
              />
            </div>
            {/* Wind Max Speed Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Wind Max Speed (km/h)"
                data={windMaxSpeedData}
                dataKey="value"
                unit=" km/h"
                strokeColor="#FFD700"
                tickFormat="hourly"
                yAxisLabel="Wind Max Speed (km/h)"
                dy={70}
                dx={-5}
              />
            </div>
            {/* Rain Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Rain (mm)"
                data={rainData}
                dataKey="value"
                unit=" mm"
                strokeColor="#4682B4"
                tickFormat="hourly"
                yAxisLabel="Rain (mm)"
                dy={20}
              />
            </div>
            {/* UV Index Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="UV Index"
                data={uvData}
                dataKey="value"
                strokeColor="#FFA07A"
                tickFormat="hourly"
                yAxisLabel="UV Index"
                dy={20}
                dx={10}
              />
            </div>
            {/* Light Lux Chart */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <CustomLineChart
                title="Light Lux (lx)"
                data={lightLuxData}
                dataKey="value"
                unit=" lx"
                strokeColor="#8A2BE2"
                tickFormat="hourly"
                yAxisLabel="Light Lux (lx)"
                dy={40}
              />
            </div>
            {/* Wind Gauge */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300">
              <WindGauge
                speed={data.ambientweatherwindspeed}
                direction={data.ambientweatherwinddirection}
              />
            </div>
            {/* Thermometer Charts */}
            <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-700 transition-colors duration-300 flex flex-row justify-between space-x-6 items-center">
              <ThermometerChart temperature={data.temperature_c} unit="C" />
              <ThermometerChart temperature={data.temperature_f} unit="F" />
            </div>
            {/* Live Image */}
            <div className="bg-white shadow-md rounded p-4 flex flex-col items-center dark:bg-gray-700 transition-colors duration-300">
              <h2 className="text-xl font-bold mb-4 text-center dark:text-gray-300">
                Live Image
              </h2>
              {data.image_url ? (
                <div className="bg-white p-2 rounded-md shadow dark:bg-gray-700 transition-colors duration-300">
                  <img
                    src={data.image_url}
                    alt="Weather"
                    className="w-56 h-56 object-cover rounded"
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-lg dark:text-gray-300">
                  No image available
                </p>
              )}
            </div>
          </div>

          {/* Timelapse Section */}
          <div className="bg-white dark:bg-gray-700 transition-colors duration-300 shadow-md rounded-lg p-6 mt-6 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-300">
              Timelapse
            </h2>
            {imageUrls.length === 0 ? (
              <div className="flex justify-center items-center h-64 bg-gray-200 rounded-md">
                <p className="text-gray-500 text-lg dark:text-gray-300">
                  No timelapse images available
                </p>
              </div>
            ) : (
              <div className="bg-white p-2 rounded-md shadow dark:bg-gray-800 transition-colors duration-300">
                <Timelapse images={imageUrls} interval={500} />
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