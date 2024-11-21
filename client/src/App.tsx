// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import LiveDashboard from './pages/LiveDashboard';
import DarkModeToggle from './components/DarkModeToggle';
import History from './pages/History';
import Forecasting from './pages/Forecasting';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      {/* Navbar */}
      <nav className="bg-blue-600 p-2 sm:p-4 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Hamburger Menu Icon - Left Side Mobile */}
          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Logo - Hidden on Mobile */}
          <div className="hidden sm:flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'font-extrabold bg-blue-800'
                    : 'font-bold hover:bg-blue-700'
                } p-2 rounded transition duration-300 text-center`
              }
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'font-extrabold bg-blue-800'
                    : 'font-bold hover:bg-blue-700'
                } p-2 rounded transition duration-300 text-center`
              }
            >
              Live Dashboard
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'font-extrabold bg-blue-800'
                    : 'font-bold hover:bg-blue-700'
                } p-2 rounded transition duration-300 text-center`
              }
            >
              History
            </NavLink>
            <NavLink
              to="/forecasting"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'font-extrabold bg-blue-800'
                    : 'font-bold hover:bg-blue-700'
                } p-2 rounded transition duration-300 text-center`
              }
            >
              Forecasting
            </NavLink>
          </div>

          {/* Dark Mode Toggle - Right Side */}
          <div className="flex items-center">
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile Menu (Below Navbar) */}
      {menuOpen && (
        <div className="bg-blue-600 text-white p-2 sm:hidden">
          <div className="flex flex-col space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'font-extrabold bg-blue-800'
                    : 'font-bold hover:bg-blue-700'
                } p-2 rounded transition duration-300 text-center`
              }
              end
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'font-extrabold bg-blue-800'
                    : 'font-bold hover:bg-blue-700'
                } p-2 rounded transition duration-300 text-center`
              }
              onClick={() => setMenuOpen(false)}
            >
              Live Dashboard
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'font-extrabold bg-blue-800'
                    : 'font-bold hover:bg-blue-700'
                } p-2 rounded transition duration-300 text-center`
              }
              onClick={() => setMenuOpen(false)}
            >
              History
            </NavLink>
            <NavLink
              to="/forecasting"
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'font-extrabold bg-blue-800'
                    : 'font-bold hover:bg-blue-700'
                } p-2 rounded transition duration-300 text-center`
              }
              onClick={() => setMenuOpen(false)}
            >
              Forecasting
            </NavLink>
          </div>
        </div>
      )}

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