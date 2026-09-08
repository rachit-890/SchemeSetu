import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Right-docked vertical sidebar */}
      <Header />

      {/* Main viewport area offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col md:mr-64 transition-[margin] duration-200">
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
