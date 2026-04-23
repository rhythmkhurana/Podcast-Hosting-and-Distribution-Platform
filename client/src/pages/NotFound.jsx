import React from 'react';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 rounded-full animate-pulse"></div>
        <Radio size={80} className="text-primary relative z-10" />
      </div>
      
      <h1 className="text-6xl md:text-8xl font-display tracking-widest mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-6 uppercase tracking-wider">Dead Air</h2>
      
      <p className="text-textMuted max-w-md mb-8">
        We couldn't find the frequency you're tuning into. The page or podcast might have been moved or deleted.
      </p>
      
      <Link to="/" className="btn-primary">
        Return to Home Station
      </Link>
    </div>
  );
};

export default NotFound;