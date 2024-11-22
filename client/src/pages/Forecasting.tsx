import React, { useLayoutEffect, useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const LUX_TO_SOLAR_IRR = 0.0079;
const SCALER = 100;

interface HistoricalDataItem {
  ambientweatherlightlux?: string;
  timestamp?: string;
  [key: string]: any;
}

interface ProcessedHistoricalDataItem extends HistoricalDataItem {
  Actual: number;
  time: string;
}

interface ForecastDataItem {
  lux_forecast?: string;
  forecast_time?: string;
  [key: string]: any;
}

interface ProcessedForecastDataItem extends ForecastDataItem {
  Forecast?: number;
  ForecastAll?: number;
  time: string;
}

interface ChartDataItem {
  time: string;
  Actual?: number;
  Forecast?: number;
  ForecastAll?: number;
  [key: string]: any;
}

const Forecasting: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<ProcessedHistoricalDataItem[]>([]);
  const [forecasts, setForecasts] = useState<ProcessedForecastDataItem[]>([]);
  const [forecastsAll, setForecastsAll] = useState<ProcessedForecastDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingForecastsAll, setLoadingForecastsAll] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorForecastsAll, setErrorForecastsAll] = useState<string | null>(null);

  // Add dark mode state
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  // Initialize isDarkMode using useLayoutEffect to ensure it runs before paint
  useLayoutEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // Observe changes to the 'dark' class on the document element
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

  const axisColor = isDarkMode ? '#ccc' : '#333';
  const gridColor = isDarkMode ? '#555' : '#ccc';

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

        const processedHistoricalData = (historicalResponse.data as HistoricalDataItem[]).map((item: HistoricalDataItem) => ({
          ...item,
          Actual: (Number(item.ambientweatherlightlux) || 0) * LUX_TO_SOLAR_IRR,
          time: new Date(item.timestamp || '').toLocaleString('en-US', { timeZone: 'UTC' })
        }));

        processedHistoricalData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        setHistoricalData(processedHistoricalData);

        setForecasts((forecastResponse.data as ForecastDataItem[]).map((item: ForecastDataItem) => ({
          ...item,
          Forecast: (Number(item.lux_forecast) || 0) * LUX_TO_SOLAR_IRR + SCALER,
          time: new Date(item.forecast_time || '').toLocaleString('en-US', { timeZone: 'UTC' })
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
        setForecastsAll((response.data as ForecastDataItem[]).map((item: ForecastDataItem) => ({
          ...item,
          ForecastAll: (Number(item.lux_forecast) || 0) * LUX_TO_SOLAR_IRR + SCALER,
          time: new Date(item.forecast_time || '').toLocaleString('en-US', { timeZone: 'UTC' })
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

  const historicalDataRecent = historicalData.slice(-50);

  const chartData = [...historicalDataRecent, ...forecasts]
    .reduce((acc: ChartDataItem[], curr: ChartDataItem) => {
      const existingIndex = acc.findIndex((item: ChartDataItem) => item.time === curr.time);
      if (existingIndex === -1) {
        acc.push(curr);
      } else {
        acc[existingIndex] = { ...acc[existingIndex], ...curr };
      }
      return acc;
    }, [])
    .sort((a: ChartDataItem, b: ChartDataItem) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const chartDataAll = [...historicalData, ...forecastsAll]
    .reduce((acc: ChartDataItem[], curr: ChartDataItem) => {
      const existingIndex = acc.findIndex((item: ChartDataItem) => item.time === curr.time);
      if (existingIndex === -1) {
        acc.push(curr);
      } else {
        acc[existingIndex] = { ...acc[existingIndex], ...curr };
      }
      return acc;
    }, [])
    .sort((a: ChartDataItem, b: ChartDataItem) => new Date(a.time).getTime() - new Date(b.time).getTime());

  if (loading || loadingForecastsAll) return <div>Loading...</div>;
  if (error || errorForecastsAll) return <div className="text-red-500">{error || errorForecastsAll}</div>;

  return (
    <div className="p-12 bg-gray-50 dark:bg-gray-800 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Solar Irradiance Forecast
      </h1>

      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
        5 minute forecast using CNN model
      </h2>

      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart key={isDarkMode ? 'dark' : 'light'} data={chartData}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()}
              stroke={axisColor}
            />
            <YAxis
              label={{
                value: 'Solar Irradiance (W/m²)',
                angle: -90,
                position: 'insideLeft',
                dy: 60,
                fill: axisColor, // Ensures label color updates
              }}
              stroke={axisColor}
            />
            <Tooltip
              labelFormatter={(timeStr) => new Date(timeStr).toLocaleString()}
              formatter={(value, name) => [(value as number).toFixed(2), name]}
              contentStyle={{
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
              }}
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

      <h2 className="text-2xl font-bold mt-12 mb-4 text-center text-gray-800 dark:text-gray-100">
        Full-day forecast using CNN model
      </h2>

      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart key={isDarkMode ? 'dark' : 'light'} data={chartDataAll}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()}
              stroke={axisColor}
            />
            <YAxis
              label={{
                value: 'Solar Irradiance (W/m²)',
                angle: -90,
                position: 'insideLeft',
                dy: 60,
                fill: axisColor, // Ensures label color updates
              }}
              stroke={axisColor}
            />
            <Tooltip
              labelFormatter={(timeStr) => new Date(timeStr).toLocaleString()}
              formatter={(value, name) => [(value as number).toFixed(2), name]}
              contentStyle={{
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
              }}
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