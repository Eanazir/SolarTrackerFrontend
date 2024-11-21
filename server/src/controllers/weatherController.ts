// server/src/controllers/weatherController.ts
import { Request, Response } from 'express';
import pool from '../config/db.js';
import { Parser } from 'json2csv';
import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';

// for inverse transforming model output
interface ScalerParams {
  min: number[];
  scale: number[];
  data_min: number[];
  data_max: number[];
  data_range: number[];
}

// Load the scaler parameters from the JSON file
const scalerParams: ScalerParams = JSON.parse(fs.readFileSync('scaler_y_params.json', 'utf8'));

// Function to perform the inverse transformation
function inverseTransform(scaledValues: number[], scalerParams: ScalerParams): number[] {
  return scaledValues.map((value, index) => {
      return (value - scalerParams.min[index]) / scalerParams.scale[index] * scalerParams.data_range[index] + scalerParams.data_min[index];
  });
}
//------------------------------------------
// Existing insertWeatherDataWithImage handler
export const insertWeatherDataWithImage = async (req: Request, res: Response): Promise<Response> => {
  const {
    temperature_c,
    temperature_f,
    humidity,
    wind_speed,
    wind_direction,
    timestamp,
    pressure,
    ambientWeatherBatteryOk,
    ambientWeatherTemp,
    ambientWeatherHumidity,
    ambientWeatherWindDirection,
    ambientWeatherWindSpeed,
    ambientWeatherWindMaxSpeed,
    ambientWeatherRain,
    ambientWeatherUV,
    ambientWeatherUVI,
    ambientWeatherLightLux,
  } = req.body;

  // Access the uploaded file
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  const imageUrl = (file as Express.MulterS3.File).location;

  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Insert into weather_data
    const insertWeatherText = `
        INSERT INTO weather_data (
          temperature_c,
          temperature_f,
          humidity,
          wind_speed,
          wind_direction,
          timestamp,
          pressure,
          ambientWeatherBatteryOk,
          ambientWeatherTemp,
          ambientWeatherHumidity,
          ambientWeatherWindDirection,
          ambientWeatherWindSpeed,
          ambientWeatherWindMaxSpeed,
          ambientWeatherRain,
          ambientWeatherUV,
          ambientWeatherUVI,
          ambientWeatherLightLux
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `;
    const insertWeatherValues = [
      temperature_c,
      temperature_f,
      humidity,
      wind_speed,
      wind_direction,
      timestamp,
      pressure,
      ambientWeatherBatteryOk,
      ambientWeatherTemp,
      ambientWeatherHumidity,
      ambientWeatherWindDirection,
      ambientWeatherWindSpeed,
      ambientWeatherWindMaxSpeed,
      ambientWeatherRain,
      ambientWeatherUV,
      ambientWeatherUVI,
      ambientWeatherLightLux,
    ];

    const weatherResult = await pool.query(insertWeatherText, insertWeatherValues);
    const weatherDataId = weatherResult.rows[0].id;

    // Insert into weather_images
    const insertImageText = `
        INSERT INTO weather_images (weather_data_id, image_url)
        VALUES ($1, $2)
        ON CONFLICT (weather_data_id) DO UPDATE SET image_url = EXCLUDED.image_url, timestamp = NOW()
      `;
    const insertImageValues = [weatherDataId, imageUrl];
    await pool.query(insertImageText, insertImageValues);

    // Commit the transaction
    await pool.query('COMMIT');

    return res.status(201).json({
      message: 'Weather data and image uploaded successfully.',
      weather_data_id: weatherDataId, // Return the ID for image association
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error inserting weather data and image:', error);
    return res.status(500).json({ error: ' Server Error' });
  }
};

// Handler to get the latest live data with image
export const getLiveData = async (req: Request, res: Response): Promise<Response> => {
  try {
    const queryText = `
      SELECT wd.*, wi.image_url
      FROM weather_data wd
      LEFT JOIN weather_images wi ON wd.id = wi.weather_data_id
      ORDER BY wd.timestamp DESC
      LIMIT 1
    `;
    const result = await pool.query(queryText);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found.' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching live data:', error);
    return res.status(500).json({ error: 'Internal Server Error, getlive' });
  }
};


// Handler to get historical data based on start and end dates
export const getHistoricalData = async (req: Request, res: Response): Promise<Response> => {
  const { startDate, endDate } = req.query;

  // Validate presence of both query parameters
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Both startDate and endDate query parameters are required in YYYY-MM-DD format.' });
  }

  // Validate that both parameters are strings
  if (typeof startDate !== 'string' || typeof endDate !== 'string') {
    return res.status(400).json({ error: 'startDate and endDate must be strings in YYYY-MM-DD format.' });
  }

  // Validate date formats using regex (simple validation)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return res.status(400).json({ error: 'startDate and endDate must be in YYYY-MM-DD format.' });
  }

  // Convert to Date objects to compare
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check for invalid dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Invalid startDate or endDate.' });
  }

  // Ensure startDate is not after endDate
  if (start > end) {
    return res.status(400).json({ error: 'startDate cannot be after endDate.' });
  }

  try {
    const queryText = `
      SELECT wd.*, wi.image_url
      FROM weather_data wd
      LEFT JOIN weather_images wi ON wd.id = wi.weather_data_id
      WHERE DATE(wd.timestamp) BETWEEN $1 AND $2
      ORDER BY wd.timestamp ASC
    `;
    const result = await pool.query(queryText, [startDate, endDate]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified date range.' });
    }

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return res.status(500).json({ error: 'Internal Server Error, getHistoricalData' });
  }
};

// Handler to export data to CSV for a date/time range
export const exportDataToCSV = async (req: Request, res: Response): Promise<Response> => {
  const { start, end } = req.query;

  if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
    return res.status(400).json({ error: 'Start and end query parameters are required in ISO format.' });
  }

  try {
    const queryText = `
      SELECT wd.*, wi.image_url
      FROM weather_data wd
      LEFT JOIN weather_images wi ON wd.id = wi.weather_data_id
      WHERE wd.timestamp BETWEEN $1 AND $2
      ORDER BY wd.timestamp ASC
    `;
    const result = await pool.query(queryText, [start, end]);

    // Convert JSON to CSV
    const fields = [
      'id',
      'temperature_c', 
      'temperature_f',
      'humidity',
      'wind_speed',
      'wind_direction',
      'timestamp',
      'pressure',
      'ambientWeatherBatteryOk',
      'ambientWeatherTemp',
      'ambientWeatherHumidity',
      'ambientWeatherWindDirection',
      'ambientWeatherWindSpeed',
      'ambientWeatherWindMaxSpeed',
      'ambientWeatherRain',
      'ambientWeatherUV',
      'ambientWeatherUVI',
      'ambientWeatherLightLux',
      'image_url',
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('weather-data.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting data to CSV:', error);
    return res.status(500).json({ error: 'Internal Server Error, export' });
  }
};



export const processWeatherForecast = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Start transaction
    await pool.query('BEGIN');

    // Get the last 5 inserted weather data points
    const lastDataQuery = `
      SELECT wd.*, wi.image_url
      FROM weather_data wd
      LEFT JOIN weather_images wi ON wd.id = wi.weather_data_id
      ORDER BY wd.timestamp DESC
      LIMIT 5
    `;
    const lastData = await pool.query(lastDataQuery);

    if (lastData.rows.length < 5) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Not enough weather data found' });
    }

    // Prepare input data tensor
    const inputData = lastData.rows.map(row => [
      parseFloat(row.temperature_c),
      parseFloat(row.humidity),
      parseFloat(row.pressure),
      parseFloat(row.wind_speed),
      parseFloat(row.wind_direction),
      parseFloat(row.pressure),
      parseFloat(row.ambientWeatherUV),
      parseFloat(new Date(row.timestamp).toISOString().split('T')[1].replace(/:/g, '').slice(0, 4))
    ]);

    // Load Keras model
    let model;
    try {
      model = await tf.loadLayersModel('file://server/src/model/LSTM_MODEL_5MIN.keras');
    } catch (modelError) {
      await pool.query('ROLLBACK');
      console.error('Error loading Keras model:', modelError);
      return res.status(500).json({ error: 'Error loading Keras model' });
    }

    // Get prediction
    const prediction = model.predict(tf.tensor2d(inputData)) as tf.Tensor;
    const forecastValues = await prediction.array() as number[][];

    // Destructure the inner array to get the forecast values
    const [fiveMin] = forecastValues[0];

    // Inverse transform the 5-minute forecast
    const originalFiveMin = inverseTransform([fiveMin], scalerParams)[0];

    // Insert forecasts query
    const insertForecastQuery = `
      INSERT INTO forecasts (
        forecastDate,
        "5minForecast",
        "15minForecast", 
        "30minForecast",
        "60minForecast"
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const forecastParams = [
      new Date(), // Current timestamp
      originalFiveMin, // Inverse transformed 5 min forecast
      0, //
      0, // 0 for now since we changed model type
      0 // 0 for now 
    ];

    const forecastResult = await pool.query(insertForecastQuery, forecastParams);

    // Commit transaction
    await pool.query('COMMIT');

    return res.status(201).json({
      message: 'Forecast processed successfully',
      forecast_id: forecastResult.rows[0].id
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error processing forecast:', error);
    return res.status(500).json({ error: 'Error processing forecast' });
  }
};

export const getLatestForecast = async (req: Request, res: Response): Promise<Response> => {
  try {
    const queryText = `
      SELECT forecastdate,
             "5minForecast",
             "15minForecast",
             "30minForecast",
             "60minForecast"
      FROM forecasts
      ORDER BY forecastdate DESC
      LIMIT 1
    `;
    const result = await pool.query(queryText);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No forecasts found.' });
    }

    return res.json({
      date: result.rows[0].date,
      '5minForecast': result.rows[0]['5minForecast'],
      '15minForecast': 0,
      '30minForecast': 0,
      '60minForecast': 0,
    });
  } catch (error) {
    console.error('Error fetching latest forecast:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};