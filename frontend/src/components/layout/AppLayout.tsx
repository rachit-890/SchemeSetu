import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useApp } from '../../context/AppContext';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { lang } = useApp();

  const isQuestionnaire = location.pathname === '/questionnaire';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#111827] font-sans">
      {/* Top horizontal navigation bar */}
      <Header />

      {/* Main page content area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer: Minimal privacy disclaimer during Questionnaire; full footer elsewhere */}
      {isQuestionnaire ? (
        <footer className="py-4 px-4 text-center text-xs text-gray-500 border-t border-[#E5E7EB] bg-white">
          <p>
            {lang === 'hi'
              ? 'स्कीमसेतु · आपकी जानकारी केवल पात्रता मिलान के लिए उपयोग की जाती है।'
              : 'SchemeSetu · Your information is used only for eligibility matching.'}
          </p>
        </footer>
      ) : (
        <Footer />
      )}
    </div>
  );
};
