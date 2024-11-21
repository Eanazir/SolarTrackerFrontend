// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import axios from 'axios';
import logo from '../assets/SolarTrackerLogo.png';

interface LiveData {
  image_url?: string;
}

const Home: React.FC = () => {
  const [liveImageUrl, setLiveImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLiveImage = async () => {
    try {
      const response = await axios.get<LiveData>('https://sunsightenergy.com/api/live-data');
      setLiveImageUrl(response.data.image_url || null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching live image:', err);
      setError('Unable to fetch live image at this time.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveImage();
    const interval = setInterval(fetchLiveImage, 17000); // Fetch every 17 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white dark:bg-gray-800 transition-colors duration-500 p-6 pt-20">
      {/* Project Logo */}
      <img src={logo} alt="Project Logo" className="w-58 h-48 mb-8" />

      {/* Project Title */}
      <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-4 text-center">
        Solar Irradiance Monitoring System
      </h1>

      {/* Project Description */}
      <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl text-center mb-16">
        Our project focuses on creating a cost-effective, real-time solar irradiance forecasting 
        system to address the challenges of integrating solar energy into modern power grids. 
        By combining sky imaging technology, advanced sensors, and machine learning, the system 
        captures and analyzes real-time data to deliver accurate solar forecasts. Designed to operate 
        in remote, harsh environments, the device is solar-powered, weatherproof, and built with 
        open-source hardware and software for affordability. This innovative solution aims 
        to enhance grid stability, optimize energy market decisions, and support a sustainable energy future.
      </p>

      {/* Team Members and Live Image Container */}
      <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-1 mx-auto">
        {/* Team Members */}
        <div className="flex-1 flex flex-col items-center text-center">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center md:text-left">Meet the Team</h2>
          <ul className="space-y-4">
            {/* Team Member 1 */}
            <li className="flex items-center space-x-4 justify-center md:justify-start">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200 underline">
                Chase Albright
              </span>
              <a
                href="https://github.com/chasemalbright"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://linkedin.com/in/chasemalbright"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-400"
              >
                <FaLinkedin size={24} />
              </a>
            </li>
            {/* Team Member 2 */}
            <li className="flex items-center space-x-4 justify-center md:justify-start">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Allen Li</span>
              <a
                href="https://github.com/allenallen512"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://linkedin.com/in/allenli512"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-400"
              >
                <FaLinkedin size={24} />
              </a>
            </li>
            {/* Team Member 3 */}
            <li className="flex items-center space-x-4 justify-center md:justify-start">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Ark Bylyku</span>
              <a
                href="https://github.com/arkeldi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://linkedin.com/in/arkeldibylyku"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-400"
              >
                <FaLinkedin size={24} />
              </a>
            </li>
            {/* Team Member 4 */}
            <li className="flex items-center space-x-4 justify-center md:justify-start">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Eyad Nazir</span>
              <a
                href="https://github.com/Eanazir"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://linkedin.com/in/eyad-nazir"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-400"
              >
                <FaLinkedin size={24} />
              </a>
            </li>
            {/* Team Member 5 */}
            <li className="flex items-center space-x-4 justify-center md:justify-start">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Gabriel Marshall</span>
              <a
                href="https://github.com/gabrielmarshall327"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://linkedin.com/in/gabriel-marshall"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-400"
              >
                <FaLinkedin size={24} />
              </a>
            </li>
            {/* Team Member 6 */}
            <li className="flex items-center space-x-4 justify-center md:justify-start">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Jacob Quintero</span>
              <a
                href="https://github.com/Jquintero08"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://linkedin.com/in/JacobQuintero"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-400"
              >
                <FaLinkedin size={24} />
              </a>
            </li>
          </ul>
        </div>

        {/* Live Image */}
        <div className="flex-1 flex flex-col items-center text-center">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center md:text-left">Live Weather Image</h2>
          {isLoading ? (
            <p className="text-center text-gray-600 dark:text-gray-300">Loading live image...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : liveImageUrl ? (
            <div className="flex justify-center md:justify-start">
              <img
                src={liveImageUrl}
                alt="Live Weather"
                className="w-72 h-72 object-cover rounded shadow-md transition-transform duration-500"
              />
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-300">No live image available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;