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
    <div className="flex flex-col items-center justify-start min-h-screen bg-white dark:bg-gray-900 transition-colors duration-500 p-6 pt-12">
      {/* Logo Container with White Background */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-12 transform hover:scale-105 transition-transform duration-300">
        <img src={logo} alt="Project Logo" className="w-48 h-40 object-contain" />
      </div>

      {/* Project Title with Enhanced Typography */}
      <h1 className="text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-6 text-center bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Solar Irradiance Monitoring System
      </h1>

      {/* Project Description with Better Readability */}
      <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl text-center mb-16 leading-relaxed">
        Our project focuses on creating a cost-effective, real-time solar irradiance forecasting 
        system to address the challenges of integrating solar energy into modern power grids. 
        By combining sky imaging technology, advanced sensors, and machine learning, the system 
        captures and analyzes real-time data to deliver accurate solar forecasts. Designed to operate 
        in remote, harsh environments, the device is solar-powered, weatherproof, and built with 
        open-source hardware and software for affordability. This innovative solution aims 
        to enhance grid stability, optimize energy market decisions, and support a sustainable energy future.
      </p>

      {/* Team Members and Live Image in Enhanced Container */}
      <div className="w-full max-w-5xl mb-8 flex flex-col items-center md:flex-row md:items-start justify-between space-y-8 md:space-y-0 md:space-x-12 mx-auto">
        {/* Team Members Section */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center md:text-left border-b pb-2 border-gray-200 dark:border-gray-700">
            Meet the Team
          </h2>
          <ul className="space-y-6">
            {/* Update each team member list item */}
            <li className="group flex items-center space-x-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors duration-200">
                Chase Albright
              </span>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/chasemalbright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
                >
                  <FaGithub size={24} />
                </a>
                <a
                  href="https://www.linkedin.com/in/chase-albright-b82b92202/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-400 transform hover:scale-110 transition-all duration-200"
                >
                  <FaLinkedin size={24} />
                </a>
              </div>
            </li>
            {/* Team Member 2 */}
            <li className="group flex items-center space-x-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors duration-200">Allen Li</span>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/allenallen512"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
                >
                  <FaGithub size={24} />
                </a>
                <a
                  href="https://linkedin.com/in/allenli512"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-400 transform hover:scale-110 transition-all duration-200"
                >
                  <FaLinkedin size={24} />
                </a>
              </div>
            </li>
            {/* Team Member 3 */}
            <li className="group flex items-center space-x-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors duration-200">Ark Bylyku</span>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/arkeldi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
                >
                  <FaGithub size={24} />
                </a>
                <a
                  href="https://linkedin.com/in/arkeldibylyku"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-400 transform hover:scale-110 transition-all duration-200"
                >
                  <FaLinkedin size={24} />
                </a>
              </div>
            </li>
            {/* Team Member 4 */}
            <li className="group flex items-center space-x-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors duration-200">Eyad Nazir</span>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/Eanazir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
                >
                  <FaGithub size={24} />
                </a>
                <a
                  href="https://linkedin.com/in/eyad-nazir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-400 transform hover:scale-110 transition-all duration-200"
                >
                  <FaLinkedin size={24} />
                </a>
              </div>
            </li>
            {/* Team Member 5 */}
            <li className="group flex items-center space-x-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors duration-200">Gabriel Marshall</span>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/gabrielmarshall327"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
                >
                  <FaGithub size={24} />
                </a>
                <a
                  href="https://linkedin.com/in/gabriel-marshall"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-400 transform hover:scale-110 transition-all duration-200"
                >
                  <FaLinkedin size={24} />
                </a>
              </div>
            </li>
            {/* Team Member 6 */}
            <li className="group flex items-center space-x-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors duration-200">Jacob Quintero</span>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/Jquintero08"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
                >
                  <FaGithub size={24} />
                </a>
                <a
                  href="https://linkedin.com/in/JacobQuintero"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-400 transform hover:scale-110 transition-all duration-200"
                >
                  <FaLinkedin size={24} />
                </a>
              </div>
            </li>
          </ul>
        </div>

        {/* Live Image Section */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center md:text-left border-b pb-2 border-gray-200 dark:border-gray-700">
            Live Weather Image
          </h2>
          <div className="flex justify-center items-center min-h-[300px]">
            {isLoading ? (
              <div className="animate-pulse text-center text-gray-600 dark:text-gray-300">
                Loading live image...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
                {error}
              </div>
            ) : liveImageUrl ? (
              <img
                src={liveImageUrl}
                alt="Live Weather"
                className="w-full h-72 object-cover rounded-lg shadow-md transform hover:scale-105 transition-all duration-500"
              />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/30 p-4 rounded-lg">
                No live image available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;