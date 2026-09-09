import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { lang, setLang, ui } = useApp();

  return (
    <footer className="bg-white border-t border-[#E5E7EB] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Top 2-Column Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 sm:gap-8">
          {/* Left: Brand + Tagline */}
          <div className="space-y-2 max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#111827] text-white flex items-center justify-center font-bold text-xs">
                S
              </div>
              <span className="font-bold text-base text-[#111827]">
                Scheme<span className="text-[#059669]">Setu</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed font-normal">
              {ui.footerTagline}
            </p>
          </div>

          {/* Right: Quick Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-600 font-medium">
            <Link to="/" className="hover:text-[#111827] transition-colors">
              {ui.navHome}
            </Link>
            <Link to="/questionnaire" className="hover:text-[#111827] transition-colors">
              {ui.ctaCheckEligibility}
            </Link>
            <Link to="/results" className="hover:text-[#111827] transition-colors">
              {ui.navSchemes}
            </Link>
            <a
              href="https://myscheme.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111827] transition-colors"
            >
              {lang === 'hi' ? 'माईस्कीम (सरकारी)' : 'myScheme (Govt)'}
            </a>
          </div>
        </div>

        {/* Bottom Section: Copyright + Language Selector */}
        <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p className="font-normal">{ui.footerCopyright}</p>

          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              id="footer-lang"
              aria-label="Select Language"
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'hi')}
              className="bg-gray-50 border border-[#E5E7EB] rounded px-2 py-1 text-xs text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};
