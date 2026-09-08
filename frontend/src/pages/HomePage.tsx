import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import heroIllustrationSvg from '../assets/hero_illustration.svg';
import {
  ArrowRight,
  Globe,
  CheckCircle,
  Zap,
  ExternalLink,
  HelpCircle,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Award,
  Landmark,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { lang, ui, setSession } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetStarted = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.startQuestionnaire(lang);
      setSession(response.sessionId, response.question);
      navigate('/questionnaire');
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to the questionnaire service. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {lang === 'hi'
                    ? 'नागरिक कल्याण योजना पात्रता मंच'
                    : 'Citizen Welfare Eligibility Matcher'}
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                {lang === 'hi' ? (
                  <>
                    सरकारी योजनाएं खोजें जिनके लिए आप{' '}
                    <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">
                      वास्तव में पात्र हैं
                    </span>
                  </>
                ) : (
                  <>
                    Discover Government Schemes You Are{' '}
                    <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">
                      Truly Eligible For
                    </span>
                  </>
                )}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {lang === 'hi'
                  ? '7 आसान सवालों के जवाब दें और अपनी पात्रता के आधार पर केंद्रीय व राज्य स्तरीय कल्याणकारी योजनाओं, छात्रवृत्तियों और वित्तीय सहायता की सूची प्राप्त करें।'
                  : 'Answer 7 quick questions about your profile to get instantly matched with verified central and state welfare programs, subsidies, and student grants.'}
              </p>

              {/* Error Alert if start fails */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 max-w-lg mx-auto lg:mx-0">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{lang === 'hi' ? 'त्रुटि' : 'Connection Error'}</p>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={handleGetStarted}
                  disabled={loading}
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>{lang === 'hi' ? 'प्रारंभ हो रहा है...' : 'Starting...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{ui.getStarted}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <a
                  href="#about"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm sm:text-base border border-slate-200 transition-colors"
                >
                  <span>{ui.learnMore}</span>
                </a>
              </div>
            </div>

            {/* Right Column: Illustrated Graphic Area */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-lg mx-auto aspect-4/3 flex items-center justify-center p-2 sm:p-4">
                {/* Background Decorative Gradient Blobs */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/60 via-slate-100/40 to-teal-50/70 rounded-3xl -rotate-1 transform" />
                <div className="absolute inset-1 sm:inset-2 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden" />

                {/* Content Frame */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-3 sm:p-4">
                  {/* Top Floating Badges */}
                  <div className="w-full flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200/90 shadow-2xs">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-slate-900 leading-tight">
                          {lang === 'hi' ? 'सत्यापित योजनाएं' : 'Verified Welfare'}
                        </p>
                        <p className="text-[9px] text-slate-500 leading-tight">
                          {lang === 'hi' ? 'भारत सरकार और राज्य' : 'Central & State Govt'}
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold shadow-2xs">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>AI Match</span>
                    </div>
                  </div>

                  {/* SVG Hero Graphic */}
                  <div className="my-auto py-1 flex items-center justify-center w-full">
                    <img
                      src={heroIllustrationSvg}
                      alt="Citizen Welfare Scheme Finder Illustration"
                      className="w-full max-h-[220px] sm:max-h-[250px] object-contain drop-shadow-xs transform hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>

                  {/* Bottom Floating Feature Badges */}
                  <div className="w-full flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 border border-slate-200 shadow-2xs text-slate-700 text-[11px] font-medium">
                      <Landmark className="w-3.5 h-3.5 text-slate-500" />
                      <span>{lang === 'hi' ? 'सीधे पोर्टल आवेदन' : 'Direct Portals'}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 border border-slate-200 shadow-2xs text-slate-700 text-[11px] font-medium">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'hi' ? 'निशुल्क सेवा' : '100% Free'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST-BADGE ROW */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

            {/* Badge 1 */}
            <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">{ui.trustMultiLanguage}</p>
                <p className="text-[10px] text-slate-500">{lang === 'hi' ? 'द्विभाषी इंटरफ़ेस' : 'English & हिन्दी'}</p>
              </div>
            </div>

            {/* Badge 2 */}
            <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">{ui.trustEasyToUse}</p>
                <p className="text-[10px] text-slate-500">{lang === 'hi' ? 'केवल 2 मिनट' : 'No paperwork needed'}</p>
              </div>
            </div>

            {/* Badge 3 */}
            <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">{ui.trustFastMatching}</p>
                <p className="text-[10px] text-slate-500">{lang === 'hi' ? 'नियम-आधारित जांच' : 'Grounded AI rules'}</p>
              </div>
            </div>

            {/* Badge 4 */}
            <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">{ui.trustGovDirect}</p>
                <p className="text-[10px] text-slate-500">{lang === 'hi' ? 'सत्यापित पोर्टल' : 'Official applications'}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS / ABOUT SECTION */}
      <section id="about" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {lang === 'hi' ? 'यह कैसे काम करता है?' : 'How SchemeSetu Works'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              {lang === 'hi'
                ? 'तीन सरल चरणों में कल्याणकारी योजनाओं की पात्रता की जांच करें और सीधे आवेदन करें।'
                : 'Discover and apply for matching schemes in three simple steps.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-200 hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {lang === 'hi' ? '7 बुनियादी सवालों के जवाब दें' : 'Answer 7 Basic Questions'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'hi'
                  ? 'अपनी आयु, राज्य, आय और व्यवसाय जैसी बुनियादी जानकारी प्रदान करें। कोई जटिल दस्तावेज़ अपलोड करने की आवश्यकता नहीं है।'
                  : 'Provide basic demographic details like age, income, state, and occupation. No complex document uploads required.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-200 hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {lang === 'hi' ? 'सटीक पात्रता मिलान' : 'Grounded Eligibility Matching'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'hi'
                  ? 'हमारा नियम-इंजन सरकारी योजना के आधिकारिक दिशानिर्देशों से आपकी प्रोफ़ाइल की सटीक तुलना करता है।'
                  : 'Our rules engine verifies your profile against official government eligibility criteria with high accuracy.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-200 hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {lang === 'hi' ? 'कारण समझें और सीधे आवेदन करें' : 'Understand Why & Apply Direct'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {lang === 'hi'
                  ? 'स्पष्ट भाषा में समझें कि आप क्यों पात्र हैं, चरण-दर-चरण प्रक्रिया देखें और आधिकारिक सरकारी पोर्टल पर सीधे आवेदन करें।'
                  : 'Read clear reasoning on why you qualify, get sequential application instructions, and jump straight to official portals.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQS SECTION */}
      <section id="faqs" className="py-16 md:py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {ui.navFaqs}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {lang === 'hi' ? 'योजना सेतु के बारे में अक्सर पूछे जाने वाले प्रश्न' : 'Frequently asked questions about SchemeSetu'}
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  {lang === 'hi'
                    ? 'पात्रता मिलान कैसे काम करता है?'
                    : 'How does eligibility matching work?'}
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 pl-6 leading-relaxed">
                {lang === 'hi'
                  ? 'मंच नियम-आधारित मिलान का उपयोग करके प्रकाशित सरकारी योजना मानदंडों के आधार पर आपके उत्तरों का मूल्यांकन करता है।'
                  : 'The platform evaluates your answers against published government scheme criteria using rule-based matching.'}
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  {lang === 'hi'
                    ? 'योजनाओं के लिए आवेदन कहाँ करें?'
                    : 'Where do I apply for schemes?'}
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 pl-6 leading-relaxed">
                {lang === 'hi'
                  ? 'स्कीमसेतु आवेदन चरण प्रदान करता है और आपको प्रत्येक योजना के आधिकारिक सरकारी पोर्टल पर निर्देशित करता है।'
                  : 'SchemeSetu provides application steps and directs you to the official government portal for each scheme.'}
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>
                  {lang === 'hi'
                    ? 'कौन सी जानकारी आवश्यक है?'
                    : 'What details are required?'}
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 pl-6 leading-relaxed">
                {lang === 'hi'
                  ? 'प्रश्नावली पात्रता निर्धारित करने के लिए बुनियादी जनसांख्यिकीय और व्यावसायिक जानकारी (जैसे आयु, राज्य और व्यवसाय) पूछती है।'
                  : 'The questionnaire asks for basic demographic and occupational criteria (such as age, state, and occupation) to determine eligibility.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
