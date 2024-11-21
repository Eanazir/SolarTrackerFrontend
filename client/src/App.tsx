// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import LiveDashboard from './pages/LiveDashboard';
import DarkModeToggle from './components/DarkModeToggle';
import History from './pages/History';
import Forecasting from './pages/Forecasting';
import Logo from './components/Logo.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <nav className="bg-blue-600 p-2 sm:p-4 text-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:items-center sm:justify-between">
          {/* Left - Logo */}
          <div className="w-full sm:w-auto flex justify-center sm:justify-start mb-2 sm:mb-0">
            <Logo />
          </div>
          
          {/* Middle - Navigation */}
          <div className="flex flex-wrap justify-center flex-1 gap-2 sm:gap-4 sm:mx-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${isActive 
                  ? "font-extrabold bg-blue-800" 
                  : "font-bold hover:bg-blue-700"} 
                  p-2 rounded transition duration-300 w-full sm:w-auto text-center`
              }
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${isActive 
                  ? "font-extrabold bg-blue-800" 
                  : "font-bold hover:bg-blue-700"} 
                  p-2 rounded transition duration-300 w-full sm:w-auto text-center`
              }
              end
            >
              Live Dashboard
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `${isActive 
                  ? "font-extrabold bg-blue-800" 
                  : "font-bold hover:bg-blue-700"} 
                  p-2 rounded transition duration-300 w-full sm:w-auto text-center`
              }
            >
              History
            </NavLink>
            <NavLink
              to="/forecasting"
              className={({ isActive }) =>
                `${isActive 
                  ? "font-extrabold bg-blue-800" 
                  : "font-bold hover:bg-blue-700"} 
                  p-2 rounded transition duration-300 w-full sm:w-auto text-center`
              }
            >
              Forecasting
            </NavLink>
          </div>
          
          {/* Right - Dark Mode Toggle */}
          <div className="w-full sm:w-auto flex justify-center sm:justify-end mt-2 sm:mt-0">
            <DarkModeToggle />
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<LiveDashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/forecasting" element={<Forecasting />} />
      </Routes>
    </Router>
  );
};

export default App;