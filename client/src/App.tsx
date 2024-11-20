// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import LiveDashboard from './pages/LiveDashboard';
import DarkModeToggle from './components/DarkModeToggle';
import History from './pages/History';
import ExportData from './pages/ExportData';
import Forecasting from './pages/Forecasting';

const App: React.FC = () => {
  return (
    <Router>
      <nav className="flex items-center bg-blue-600 p-4 text-white">
        <div className="flex flex-1 justify-around">
        <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'font-extrabold bg-blue-800 p-2 rounded transition duration-300'
                : 'font-bold p-2 rounded transition duration-300'
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'font-extrabold bg-blue-800 p-2 rounded transition duration-300'
                : 'font-bold p-2 rounded transition duration-300'
            }
            end
          >
            Live Dashboard
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive
                ? 'font-extrabold bg-blue-800 p-2 rounded transition duration-300'
                : 'font-bold p-2 rounded transition duration-300'
            }
          >
            History
          </NavLink>
          <NavLink
            to="/export"
            className={({ isActive }) =>
              isActive
                ? 'font-extrabold bg-blue-800 p-2 rounded transition duration-300'
                : 'font-bold p-2 rounded transition duration-300'
            }
          >
            Export
          </NavLink>
          <NavLink
            to="/forecasting"
            className={({ isActive }) =>
              isActive
                ? 'font-extrabold bg-blue-800 p-2 rounded transition duration-300'
                : 'font-bold p-2 rounded transition duration-300'
            }
          >
            Forecasting
          </NavLink>
        </div>
        <DarkModeToggle />
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<LiveDashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/export" element = {<ExportData/>} />
        <Route path="/forecasting" element = {<Forecasting/>} />
        <Route path="/history" element={<History />} />
        <Route path="/export" element={<ExportData />} />
      </Routes>
    </Router>
  );
};

export default App;