// src/components/Logo.tsx
import React from 'react';
import logo from '../assets/Solar Tracker Good Transparent Logo.png';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <img 
      src={logo} 
      alt="Logo" 
      className={`${className} w-[30px] sm:w-[38px] h-auto focus:outline-none`}
    />
  );
};

export default Logo;