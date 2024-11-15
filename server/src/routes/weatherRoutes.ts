// server/src/routes/weatherRoutes.ts
import express, { Router, Request, Response, RequestHandler } from 'express';
import {
  insertWeatherDataWithImage,
  getLiveData,
  getHistoricalData,
  exportDataToCSV,
} from '../controllers/weatherController';
import upload from '../middleware/upload';

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

// Route to insert weather data with image
router.post('/insert-data', upload.single('image'), typedInsertWeatherData);

// Route to get the latest live data
router.get('/live-data', typedGetLiveData);

// Route to get historical data based on date
router.get('/history-data', typedGetHistoricalData);

// Route to export data to CSV for a date/time range
router.get('/export-data', typedExportDataToCSV);

export default router;