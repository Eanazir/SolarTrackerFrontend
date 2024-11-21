// server/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import weatherRoutes from './routes/weatherRoutes.js';
import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
import fs from 'fs/promises';
import { Scaler } from './utils/scaler.js';
import { fileURLToPath } from 'url';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Validate required environment variables
const requiredEnv = [
    'DB_USER',
    'DB_HOST',
    'DB_NAME',
    'DB_PASSWORD',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET'
];

requiredEnv.forEach(envVar => {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
});

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error, index' });
});

// Routes
app.use('/', weatherRoutes);

// Health Check Route
app.get('/test', (req, res) => {
    res.send('Weather Tracker API is running.');
});

// Define global variables for model and scaler
declare global {
    var cnn_model: tf.LayersModel | undefined;
    var scaler: Scaler | undefined;
}

// Function to load the TensorFlow model
const loadModel = async () => {
    try {
        const modelPath = `file://${path.join(__dirname, 'models/cnn/tfjs_model/model.json')}`;
        global.cnn_model = await tf.loadLayersModel(modelPath);
        console.log('TensorFlow model loaded successfully.');
    } catch (error) {
        console.error('Error loading TensorFlow model:', error);
        process.exit(1); // Exit if model fails to load
    }
};

// Function to load the scaler parameters
const loadScaler = async () => {
    try {
        const scalerPath =  `${path.join(__dirname, 'models/cnn/scaler_params.json')}`; // Adjust the path as necessary
        const scalerData = await fs.readFile(scalerPath, 'utf-8');
        const scalerParams = JSON.parse(scalerData);
        global.scaler = new Scaler(scalerParams);
        console.log('Scaler parameters loaded successfully.');
    } catch (error) {
        console.error('Error loading scaler parameters:', error);
        process.exit(1); // Exit if scaler fails to load
    }
};

// Load both model and scaler before starting the server
const initializeServer = async () => {
    await loadModel();
    await loadScaler();

    const PORT = parseInt(process.env.PORT || '3000', 10);
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

initializeServer();
