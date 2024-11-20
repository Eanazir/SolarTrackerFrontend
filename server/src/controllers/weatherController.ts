// server/src/controllers/weatherController.ts
import { Request, Response } from 'express';
import pool from '../config/db.js';
import { Parser } from 'json2csv';
import * as tf from '@tensorflow/tfjs-node';

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

    // Get the last inserted weather data
    const lastDataQuery = `
      SELECT wd.*, wi.image_url
      FROM weather_data wd
      LEFT JOIN weather_images wi ON wd.id = wi.weather_data_id
      ORDER BY wd.timestamp DESC
      LIMIT 1
    `;
    const lastData = await pool.query(lastDataQuery);

    if (!lastData.rows[0]) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'No weather data found' });
    }

    if (!lastData.rows[0].image_url) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'No image found for latest weather data' });
    }

    // Load Keras model
    const model = await tf.loadLayersModel('file://path/to/your/model.json');

    const timestamp = new Date(lastData.rows[0].timestamp);
    const hour = timestamp.getHours() / 23.0; // Normalize hour
    const dayOfYear = (timestamp.getTime() - new Date(timestamp.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24);
    const normalizedDayOfYear = dayOfYear / 365.0; // Normalize day of year
    const windDirRad = (lastData.rows[0].wind_direction * Math.PI) / 180;
    const windDirSin = Math.sin(windDirRad);
    const windDirCos = Math.cos(windDirRad);

    // Prepare input data tensor
    const inputData = tf.tensor2d([
      lastData.rows[0].temperature_c,
      lastData.rows[0].humidity,
      lastData.rows[0].pressure,
      lastData.rows[0].wind_speed,
      windDirSin,
      windDirCos,
      hour,
      normalizedDayOfYear
    ]);

    const imageResponse = await fetch(lastData.rows[0].image_url);
    const imageBuffer = await imageResponse.arrayBuffer();
    const image = await tf.node.decodeImage(new Uint8Array(imageBuffer), 3);
    const processedImage = tf.expandDims(image);

    // Get prediction
    const prediction = model.predict([processedImage, inputData]) as tf.Tensor;
    const forecastValues = await prediction.data();

    // Insert forecasts query
    const insertForecastQuery = `
      INSERT INTO forecasts (
        date,
        "5minForecast",
        "15minForecast", 
        "30minForecast",
        "60minForecast"
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const forecastParams = [
      timestamp, // Timestamp associated with the predictions
      forecastValues[0], // 5 min forecast
      forecastValues[1], // 15 min forecast
      forecastValues[2], // 30 min forecast
      forecastValues[3]  // 60 min forecast
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
      '15minForecast': result.rows[0]['15minForecast'],
      '30minForecast': result.rows[0]['30minForecast'],
      '60minForecast': result.rows[0]['60minForecast']
    });
  } catch (error) {
    console.error('Error fetching latest forecast:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};