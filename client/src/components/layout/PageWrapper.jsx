import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const PageWrapper = () => {
  return (
    <div className="min-h-screen flex flex-col relative pb-24">
      {/* pb-24 ensures content doesn't hide behind the persistent player */}
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      {/* Footer Placeholder */}
      <footer className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-primary font-display tracking-widest text-xl">WAVCAST</div>
          <div className="text-sm text-textMuted">&copy; {new Date().getFullYear()} WavCast. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default PageWrapper;
