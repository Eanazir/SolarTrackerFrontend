// src/components/Logo.tsx
import React from 'react';
import logo from '../assets/Solar Tracker Good Transparent Logo.png';

const Logo: React.FC = () => {
  return <img src={logo} alt="Logo" className="w-[38px] focus:outline-none" />;
};

export default Logo;