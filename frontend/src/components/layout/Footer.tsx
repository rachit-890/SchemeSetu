import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Globe, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { lang, setLang, ui } = useApp();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Info */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-sm">
                S
              </div>
              <span className="font-bold text-lg text-slate-900">
                Scheme<span className="text-emerald-600">Setu</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              {ui.footerTagline}
            </p>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              {ui.footerPlatform}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/" className="hover:text-slate-900 transition-colors">
                  {ui.navHome}
                </Link>
              </li>
              <li>
                <Link to="/questionnaire" className="hover:text-slate-900 transition-colors">
                  {ui.ctaCheckEligibility}
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-slate-900 transition-colors">
                  {ui.navSchemes}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              {ui.footerResources}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="https://myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                  myScheme Portal (Govt)
                </a>
              </li>
              <li>
                <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                  PM Kisan Portal
                </a>
              </li>
              <li>
                <a href="https://scholarship.up.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                  UP Scholarship Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Language */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              {ui.footerLegal}
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <p>Government Welfare Eligibility System</p>
              <div className="pt-1">
                <label htmlFor="footer-lang" className="block text-[11px] text-slate-400 mb-1 font-medium">
                  Select Language / भाषा चुनें
                </label>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    id="footer-lang"
                    value={lang}
                    onChange={(e) => setLang(e.target.value as 'en' | 'hi')}
                    className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="en">English (India)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>{ui.footerCopyright}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" />
            <span>for Indian Citizens</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
