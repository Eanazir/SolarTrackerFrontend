// server/src/routes/weatherRoutes.ts
import express, { Router, Request, Response, RequestHandler } from 'express';
import {
  insertWeatherDataWithImage,
  getLiveData,
  getHistoricalData,
  exportDataToCSV,
  processWeatherForecast,
  getLatestForecast,
  getLatestForecastCNN,
  getLatestForecastCNNCurrentDay
} from '../controllers/weatherController.js';
import upload from '../middleware/upload.js';

const router: Router = express.Router();

// Cast handlers to RequestHandler to ensure type compatibility
const typedInsertWeatherData: RequestHandler = (req: Request, res: Response, next) => {
    insertWeatherDataWithImage(req, res).catch(next);
};

const typedGetLiveData: RequestHandler = (req: Request, res: Response, next) => {
    getLiveData(req, res).catch(next);
};

const typedGetHistoricalData: RequestHandler = (req: Request, res: Response, next) => {
    getHistoricalData(req, res).catch(next);
};

const typedExportDataToCSV: RequestHandler = (req: Request, res: Response, next) => {
    exportDataToCSV(req, res).catch(next);
};

// Add new typed handler
// const typedProcessForecast: RequestHandler = (req: Request, res: Response, next) => {
//     processWeatherForecast(req, res).catch(next);
// };

// const typedGetLatestForecast: RequestHandler = (req: Request, res: Response, next) => {
//     getLatestForecast(req, res).catch(next);
// };

const typedGetLatestForecastCNNt: RequestHandler = (req: Request, res: Response, next) => {
    getLatestForecastCNN(req, res).catch(next);
};

const typedGetLatestForecastCNNall: RequestHandler = (req: Request, res: Response, next) => {
    getLatestForecastCNNCurrentDay(req, res).catch(next);
};
  

// Add new route after insert-data route
// router.post('/process-forecast', typedProcessForecast);

// Route to insert weather data with image
router.post('/insert-data', upload.single('image'), typedInsertWeatherData);

// Route to get the latest live data
router.get('/live-data', typedGetLiveData);

// Route to get historical data based on date
router.get('/history-data', typedGetHistoricalData);

// Route to export data to CSV for a date/time range
router.get('/export-data', typedExportDataToCSV);

//router to get the latest forecasts from the forecast table
// router.get('/latest-forecast', typedGetLatestForecast);

// Add the new route for latest forecasts
router.get('/latest-forecasts-cnn', typedGetLatestForecastCNNt);

// Add route to get all current day forecasts
router.get('/latest-forecasts-cnn-all',typedGetLatestForecastCNNall)



export default router;