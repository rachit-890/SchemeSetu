import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { lang, setLang, ui } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleLanguageToggle = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  const navItems = [
    {
      to: '/',
      label: ui.navHome,
      isAnchor: false,
    },
    {
      to: '/results',
      label: ui.navSchemes,
      isAnchor: false,
    },
    {
      to: '/#about',
      label: ui.navAbout,
      isAnchor: true,
    },
    {
      to: '/#faqs',
      label: ui.navFaqs,
      isAnchor: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* 1. BRAND LOGO (LEFT) */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-md bg-[#111827] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            S
          </div>
          <span className="font-bold text-lg text-[#111827] tracking-tight">
            Scheme<span className="text-[#059669]">Setu</span>
          </span>
        </Link>

        {/* 2. DESKTOP NAVIGATION LINKS (CENTER) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = !item.isAnchor && location.pathname === item.to;
            const linkClass = `px-3.5 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'text-[#059669] font-semibold bg-[#ECFDF5]'
                : 'text-gray-600 hover:text-[#111827] hover:bg-gray-50 font-medium'
            }`;

            if (item.isAnchor) {
              return (
                <a key={item.to} href={item.to} className={linkClass}>
                  {item.label}
                </a>
              );
            }

            return (
              <Link key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 3. DESKTOP ACTIONS (RIGHT: Language Switcher + CTA) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            onClick={handleLanguageToggle}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E5E7EB] bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors cursor-pointer shadow-xs"
            title="Toggle English / हिन्दी"
          >
            <Globe className="w-3.5 h-3.5 text-gray-500" />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          <button
            onClick={() => navigate('/questionnaire')}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#059669] hover:bg-[#047857] text-white font-medium text-sm shadow-xs transition-colors cursor-pointer"
          >
            <span>{ui.ctaCheckEligibility}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4. MOBILE CONTROLS (RIGHT: Language + Hamburger with 44px tap target) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={handleLanguageToggle}
            type="button"
            className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-md border border-[#E5E7EB] text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer"
            title="Toggle English / हिन्दी"
          >
            <Globe className="w-3.5 h-3.5 text-gray-500" />
            <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            type="button"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-md border border-[#E5E7EB] text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 5. MOBILE SLIDE-DOWN OVERLAY MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 space-y-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = !item.isAnchor && location.pathname === item.to;
                const linkClass = `min-h-[44px] flex items-center px-3.5 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-[#ECFDF5] text-[#059669] font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 font-medium'
                }`;

                if (item.isAnchor) {
                  return (
                    <a
                      key={item.to}
                      href={item.to}
                      className={linkClass}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={linkClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/questionnaire');
                }}
                type="button"
                className="min-h-[44px] w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium transition-colors cursor-pointer shadow-xs"
              >
                <span>{ui.ctaCheckEligibility}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
