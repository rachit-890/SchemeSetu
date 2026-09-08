import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Sparkles,
  Home,
  LayoutGrid,
  Info,
  HelpCircle,
  User,
  ChevronRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { lang, setLang, ui } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // Close avatar popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setShowAvatarMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageToggle = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  const navItems = [
    {
      to: '/',
      label: ui.navHome,
      desc: lang === 'hi' ? 'मुख्य पृष्ठ और अवलोकन' : 'Home & overview',
      icon: Home,
      isAnchor: false,
    },
    {
      to: '/results',
      label: ui.navSchemes,
      desc: lang === 'hi' ? 'पात्र कल्याणकारी योजनाएं' : 'Eligible welfare schemes',
      icon: LayoutGrid,
      isAnchor: false,
    },
    {
      to: '/#about',
      label: ui.navAbout,
      desc: lang === 'hi' ? 'मंच और पात्रता इंजन' : 'Platform & rules engine',
      icon: Info,
      isAnchor: true,
    },
    {
      to: '/#faqs',
      label: ui.navFaqs,
      desc: lang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Common questions',
      icon: HelpCircle,
      isAnchor: true,
    },
  ];

  return (
    <aside className="fixed top-0 right-0 h-screen w-64 bg-white/95 backdrop-blur-md border-l border-slate-200/80 z-40 flex flex-col justify-between p-5 shadow-xs select-none">
      {/* 1. TOP SECTION: LOGO WORDMARK & AVATAR POPOVER */}
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          {/* Logo / Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-slate-800 transition-colors shrink-0">
              <span>S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 leading-tight">
                Scheme<span className="text-emerald-600">Setu</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                {lang === 'hi' ? 'कल्याणकारी योजना सेतु' : 'Welfare Bridge'}
              </span>
            </div>
          </Link>

          {/* Avatar Icon with Popover Menu */}
          <div className="relative" ref={avatarMenuRef}>
            <button
              onClick={() => setShowAvatarMenu((prev) => !prev)}
              type="button"
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                showAvatarMenu
                  ? 'bg-slate-900 text-emerald-400 border-slate-900 shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700 border-slate-200/80'
              }`}
              title="Citizen Settings & Info"
              aria-label="Citizen Settings & Info"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Avatar Dropdown Popover */}
            {showAvatarMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200/90 shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 space-y-1 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900">
                    {lang === 'hi' ? 'नागरिक सहायता' : 'Citizen Portal'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'hi' ? 'सार्वजनिक कल्याण प्रणाली' : 'Public Welfare Service'}
                  </p>
                </div>

                {/* About Link */}
                <a
                  href="/#about"
                  onClick={() => setShowAvatarMenu(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ui.navAbout}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>

                {/* FAQs Link */}
                <a
                  href="/#faqs"
                  onClick={() => setShowAvatarMenu(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ui.navFaqs}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 2. STACKED VERTICAL NAVIGATION CARDS */}
        <nav className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-0.5">
            {lang === 'hi' ? 'नेविगेशन' : 'Menu'}
          </p>
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = !item.isAnchor && location.pathname === item.to;

            const cardClassName = `group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
              isActive
                ? 'bg-emerald-50/80 border-emerald-300/80 shadow-2xs'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
            }`;

            const iconContainerClass = `w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
              isActive
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 group-hover:text-slate-900 group-hover:border-slate-300'
            }`;

            const content = (
              <>
                <div className={iconContainerClass}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold leading-tight truncate ${
                        isActive ? 'text-emerald-950' : 'text-slate-800 group-hover:text-slate-950'
                      }`}
                    >
                      {item.label}
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                        isActive ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <p
                    className={`text-[10.5px] leading-tight mt-1 truncate ${
                      isActive ? 'text-emerald-700/90 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </>
            );

            if (item.isAnchor) {
              return (
                <a key={item.to} href={item.to} className={cardClassName}>
                  {content}
                </a>
              );
            }

            return (
              <Link key={item.to} to={item.to} className={cardClassName}>
                {content}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. BOTTOM SECTION: LANGUAGE TOGGLE & PRIMARY CTA */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        {/* Language Toggle Bar */}
        <button
          onClick={handleLanguageToggle}
          type="button"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
          title="Toggle English / हिन्दी"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'en' ? 'हिन्दी (Hindi)' : 'English (India)'}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-slate-500">
            {lang.toUpperCase()}
          </span>
        </button>

        {/* Primary CTA Check Eligibility Button */}
        <button
          onClick={() => navigate('/questionnaire')}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all hover:shadow-md cursor-pointer group"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>{ui.ctaCheckEligibility}</span>
        </button>
      </div>
    </aside>
  );
};
