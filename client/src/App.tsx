// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import LiveDashboard from './pages/LiveDashboard';
import History from './pages/History';
import ExportData from './pages/ExportData';

const App: React.FC = () => {
  return (
    <Router>
      <nav className="flex justify-around bg-blue-600 p-4 text-white">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "font-extrabold bg-blue-800 p-2 rounded transition duration-300"
              : "font-bold p-2 rounded transition duration-300"
          }
          end
        >
          Live Dashboard
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive
              ? "font-extrabold bg-blue-800 p-2 rounded transition duration-300"
              : "font-bold p-2 rounded transition duration-300"
          }
        >
          History
        </NavLink>
        <NavLink
          to="/export"
          className={({ isActive }) =>
            isActive
              ? "font-extrabold bg-blue-800 p-2 rounded transition duration-300"
              : "font-bold p-2 rounded transition duration-300"
          }
        >
          Export
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<LiveDashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/export" element = {<ExportData/>} />
        {/* <Route path="/history" element={<History />} />
        <Route path="/export" element={<ExportData />} /> */}
      </Routes>
    </Router>
  );
};

export default App;