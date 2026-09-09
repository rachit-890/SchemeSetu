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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'general' | 'eligibility' | 'application';
  categoryLabelEn: string;
  categoryLabelHi: string;
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
}

const FAQS_DATA: FaqItem[] = [
  // 1. General & Platform
  {
    id: 'faq-1',
    category: 'general',
    categoryLabelEn: 'General',
    categoryLabelHi: 'सामान्य',
    questionEn: 'What is SchemeSetu and who is it designed for?',
    questionHi: 'स्कीमसेतु क्या है और यह किसके लिए बनाया गया है?',
    answerEn:
      'SchemeSetu is a bilingual public-welfare discovery platform designed to help Indian citizens quickly find government welfare programs, scholarships, pensions, and financial aid that match their demographic profile.',
    answerHi:
      'स्कीमसेतु एक द्विभाषी कल्याणकारी मंच है जो भारतीय नागरिकों को उनकी प्रोफ़ाइल के अनुसार सरकारी योजनाओं, छात्रवृत्तियों, पेंशन और वित्तीय सहायता की खोज करने में मदद करता है।',
  },
  {
    id: 'faq-2',
    category: 'general',
    categoryLabelEn: 'General',
    categoryLabelHi: 'सामान्य',
    questionEn: 'Is SchemeSetu completely free to use?',
    questionHi: 'क्या स्कीमसेतु का उपयोग पूर्णतः निःशुल्क है?',
    answerEn:
      'Yes, SchemeSetu is 100% free for all citizens. We do not charge any fee for answering questions, evaluating eligibility, or accessing scheme instructions.',
    answerHi:
      'हाँ, स्कीमसेतु सभी नागरिकों के लिए 100% निःशुल्क है। पात्रता जांचने या आवेदन निर्देश प्राप्त करने के लिए कोई शुल्क नहीं लिया जाता है।',
  },

  // 2. Eligibility & Matching
  {
    id: 'faq-3',
    category: 'eligibility',
    categoryLabelEn: 'Eligibility',
    categoryLabelHi: 'पात्रता',
    questionEn: 'How does the eligibility matching engine work?',
    questionHi: 'पात्रता मिलान इंजन कैसे काम करता है?',
    answerEn:
      'Our engine evaluates your responses (such as state, age, monthly income, occupation, and caste category) against official eligibility rules extracted from verified government scheme guidelines.',
    answerHi:
      'हमारा नियम-इंजन आपके उत्तरों (जैसे राज्य, आयु, मासिक आय, व्यवसाय और जाति वर्ग) की तुलना आधिकारिक सरकारी योजना दिशानिर्देशों से करता है।',
  },
  {
    id: 'faq-4',
    category: 'eligibility',
    categoryLabelEn: 'Eligibility',
    categoryLabelHi: 'पात्रता',
    questionEn: 'Does a positive match guarantee scheme benefits?',
    questionHi: 'क्या पात्रता मिलान सरकारी लाभ की गारंटी देता है?',
    answerEn:
      'No. A match indicates that you appear eligible based on the criteria evaluated. Final eligibility determination, document verification, and benefit disbursal are conducted solely by the respective government department or issuing authority.',
    answerHi:
      'नहीं। मिलान यह दर्शाता है कि आप मूल्यांकन किए गए मानदंडों के आधार पर पात्र प्रतीत होते हैं। अंतिम पात्रता का निर्धारण, दस्तावेज़ सत्यापन और लाभ वितरण केवल संबंधित सरकारी विभाग या योजना प्राधिकरण द्वारा किया जाता है।',
  },

  // 3. Application & Security
  {
    id: 'faq-5',
    category: 'application',
    categoryLabelEn: 'Application & Security',
    categoryLabelHi: 'आवेदन और सुरक्षा',
    questionEn: 'Where do I submit my formal scheme application?',
    questionHi: 'मैं योजना के लिए औपचारिक आवेदन कहाँ जमा करूँ?',
    answerEn:
      'SchemeSetu provides direct links to the official government portals (such as State scholarship portals or Ministry websites) and step-by-step instructions so you apply safely on authentic official domains.',
    answerHi:
      'स्कीमसेतु आधिकारिक सरकारी पोर्टलों के सीधे लिंक और चरण-दर-चरण आवेदन निर्देश प्रदान करता है ताकि आप प्रामाणिक सरकारी वेबसाइटों पर सुरक्षित रूप से आवेदन कर सकें।',
  },
  {
    id: 'faq-6',
    category: 'application',
    categoryLabelEn: 'Application & Security',
    categoryLabelHi: 'आवेदन और सुरक्षा',
    questionEn: 'How is my questionnaire data handled?',
    questionHi: 'मेरे द्वारा दी गई जानकारी कैसे प्रबंधित की जाती है?',
    answerEn:
      'SchemeSetu only collects anonymous demographic and occupational answers (such as age, state, income range, and occupation) necessary to evaluate scheme eligibility rules and generate guidance. We do not ask for or collect Aadhaar numbers, bank details, government ID documents, or personal contact information.',
    answerHi:
      'स्कीमसेतु केवल वही अनाम जनसांख्यिकीय और व्यावसायिक जानकारी (जैसे आयु, राज्य, आय वर्ग और व्यवसाय) लेता है जो योजना पात्रता नियमों का मूल्यांकन करने और मार्गदर्शन देने के लिए आवश्यक है। हम आधार संख्या, बैंक खाता विवरण, सरकारी पहचान पत्र या व्यक्तिगत संपर्क जानकारी नहीं मांगते हैं।',
  },
];

export const HomePage: React.FC = () => {
  const { lang, ui, setSession } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FAQ Category filter & expanded accordion state
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<'all' | 'general' | 'eligibility' | 'application'>('all');
  const [expandedFaqIds, setExpandedFaqIds] = useState<Record<string, boolean>>({ 'faq-1': true });

  const toggleFaq = (faqId: string) => {
    setExpandedFaqIds((prev) => ({
      ...prev,
      [faqId]: !prev[faqId],
    }));
  };

  const filteredFaqs = selectedFaqCategory === 'all'
    ? FAQS_DATA
    : FAQS_DATA.filter((f) => f.category === selectedFaqCategory);

  const handleGetStarted = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.startQuestionnaire(lang);
      setSession(response.sessionId, response.question);
      navigate('/questionnaire');
    } catch (err: any) {
      setError(
        err?.message ||
          (lang === 'hi'
            ? 'प्रश्नावली सेवा से कनेक्ट करने में विफल। कृपया सुनिश्चित करें कि बैकएंड चल रहा है।'
            : 'Failed to connect to the questionnaire service. Please ensure the backend is running.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                <span>
                  {lang === 'hi'
                    ? 'नागरिक कल्याण योजना पात्रता मंच'
                    : 'Citizen Welfare Eligibility Matcher'}
                </span>
              </div>

              {/* Main Heading (Calmer tone, no underlines, accent on eligible) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#111827] tracking-tight leading-[1.15]">
                {lang === 'hi' ? (
                  <>
                    सरकारी योजनाएं खोजें जिनके लिए आप{' '}
                    <span className="text-[#059669]">पात्र</span> हो सकते हैं।
                  </>
                ) : (
                  <>
                    Find government schemes you may be{' '}
                    <span className="text-[#059669]">eligible</span> for.
                  </>
                )}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'कुछ सरल प्रश्नों के उत्तर दें और अपनी प्रोफ़ाइल के अनुसार कल्याणकारी योजनाओं, छात्रवृत्तियों, सब्सिडी और पेंशन की जानकारी प्राप्त करें।'
                  : 'Answer a few simple questions and discover welfare schemes, scholarships, subsidies, and pensions matched to your profile.'}
              </p>

              {/* Error Alert if start fails */}
              {error && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 max-w-lg mx-auto lg:mx-0">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{lang === 'hi' ? 'त्रुटि' : 'Connection Error'}</p>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={handleGetStarted}
                  disabled={loading}
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white font-medium text-sm sm:text-base shadow-xs transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{lang === 'hi' ? 'प्रारंभ हो रहा है...' : 'Starting...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{ui.getStarted}</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>

                <a
                  href="#about"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm sm:text-base border border-gray-200 transition-colors"
                >
                  <span>{ui.learnMore}</span>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Illustration (Seamlessly on page background without card container) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full max-w-md sm:max-w-lg mx-auto flex items-center justify-center">
                <img
                  src={heroIllustrationSvg}
                  alt="Citizen Welfare Scheme Finder Illustration"
                  className="w-full h-auto max-h-[260px] sm:max-h-[300px] lg:max-h-[340px] object-contain"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST-BADGE ROW (Compact & high information density) */}
      <section className="bg-white border-b border-[#E5E7EB] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

            {/* Badge 1 */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
              <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-[#111827] truncate">{ui.trustMultiLanguage}</p>
                <p className="text-[11px] text-gray-500 truncate">{lang === 'hi' ? 'द्विभाषी इंटरफ़ेस' : 'English & हिन्दी interface'}</p>
              </div>
            </div>

            {/* Badge 2 */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
              <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-[#111827] truncate">{ui.trustEasyToUse}</p>
                <p className="text-[11px] text-gray-500 truncate">{lang === 'hi' ? 'केवल 2 मिनट' : 'No paperwork needed'}</p>
              </div>
            </div>

            {/* Badge 3 */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
              <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-[#111827] truncate">{ui.trustFastMatching}</p>
                <p className="text-[11px] text-gray-500 truncate">{lang === 'hi' ? 'नियम-आधारित जांच' : 'Grounded rule matching'}</p>
              </div>
            </div>

            {/* Badge 4 */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
              <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-[#111827] truncate">{ui.trustGovDirect}</p>
                <p className="text-[11px] text-gray-500 truncate">{lang === 'hi' ? 'सत्यापित पोर्टल' : 'Direct official portals'}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS / ABOUT SECTION */}
      <section id="about" className="py-12 md:py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              {lang === 'hi' ? 'यह कैसे काम करता है?' : 'How SchemeSetu Works'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2 font-normal">
              {lang === 'hi'
                ? 'तीन सरल चरणों में कल्याणकारी योजनाओं की पात्रता की जांच करें और सीधे आवेदन करें।'
                : 'Discover and apply for matching schemes in three simple steps.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-5 rounded-lg bg-white border border-[#E5E7EB] shadow-xs">
              <div className="w-8 h-8 rounded-md bg-[#111827] text-white flex items-center justify-center font-bold text-xs mb-3">
                1
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-1.5">
                {lang === 'hi' ? '7 बुनियादी सवालों के जवाब दें' : 'Answer 7 Basic Questions'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'अपनी आयु, राज्य, आय और व्यवसाय जैसी बुनियादी जानकारी प्रदान करें। कोई जटिल दस्तावेज़ अपलोड करने की आवश्यकता नहीं है।'
                  : 'Provide basic demographic details like age, income, state, and occupation. No complex document uploads required.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-lg bg-white border border-[#E5E7EB] shadow-xs">
              <div className="w-8 h-8 rounded-md bg-[#111827] text-white flex items-center justify-center font-bold text-xs mb-3">
                2
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-1.5">
                {lang === 'hi' ? 'सटीक पात्रता मिलान' : 'Grounded Eligibility Matching'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'हमारा नियम-इंजन सरकारी योजना के आधिकारिक दिशानिर्देशों से आपकी प्रोफ़ाइल की सटीक तुलना करता है।'
                  : 'Our rules engine verifies your profile against official government eligibility criteria with high accuracy.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-lg bg-white border border-[#E5E7EB] shadow-xs">
              <div className="w-8 h-8 rounded-md bg-[#111827] text-white flex items-center justify-center font-bold text-xs mb-3">
                3
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-1.5">
                {lang === 'hi' ? 'कारण समझें और सीधे आवेदन करें' : 'Understand Why & Apply Direct'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'स्पष्ट भाषा में समझें कि आप क्यों पात्र हैं, चरण-दर-चरण प्रक्रिया देखें और आधिकारिक सरकारी पोर्टल पर सीधे आवेदन करें।'
                  : 'Read clear reasoning on why you qualify, get sequential application instructions, and jump straight to official portals.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQS SECTION (3-Category Expandable Accordion) */}
      <section id="faqs" className="py-12 md:py-16 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              {ui.navFaqs}
            </h2>
            <p className="text-sm text-gray-600 mt-1.5 font-normal">
              {lang === 'hi' ? 'योजना सेतु के बारे में अक्सर पूछे जाने वाले प्रश्न' : 'Frequently asked questions about SchemeSetu'}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {[
              { key: 'all' as const, labelEn: 'All Questions', labelHi: 'सभी प्रश्न' },
              { key: 'general' as const, labelEn: 'General', labelHi: 'सामान्य' },
              { key: 'eligibility' as const, labelEn: 'Eligibility', labelHi: 'पात्रता' },
              { key: 'application' as const, labelEn: 'Application & Security', labelHi: 'आवेदन और सुरक्षा' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedFaqCategory(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  selectedFaqCategory === tab.key
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {lang === 'hi' ? tab.labelHi : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = expandedFaqIds[faq.id] ?? false;
              return (
                <div
                  key={faq.id}
                  className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-[#111827] hover:bg-gray-100/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 pr-2">
                      <HelpCircle className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{lang === 'hi' ? faq.questionHi : faq.questionEn}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white">
                      <p className="text-xs sm:text-sm text-gray-600 pl-6 leading-relaxed font-normal">
                        {lang === 'hi' ? faq.answerHi : faq.answerEn}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
