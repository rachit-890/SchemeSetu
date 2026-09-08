import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { MatchedSchemeDto } from '../types';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Building,
  Tag,
  ShieldCheck,
  ListOrdered,
  Info,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const SchemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { results, lang, ui, isTranslatingResults } = useApp();

  // Active tab state: 'overview' | 'eligibility' | 'apply' | 'details'
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'apply' | 'details'>('overview');

  // Look up scheme from AppContext results first (for live translated updates), then from router state
  const scheme: MatchedSchemeDto | undefined =
    results.find((s) => String(s.schemeId) === id) || location.state?.scheme;

  // Helper to format rule strings cleanly
  const formatRuleTag = (ruleStr: string) => {
    return ruleStr
      .replace(/_/g, ' ')
      .replace(/\bLTE\b/g, '≤')
      .replace(/\bGTE\b/g, '≥')
      .replace(/\bLT\b/g, '<')
      .replace(/\bGT\b/g, '>')
      .replace(/\bEQ\b/g, '=')
      .replace(/\bEQUALS\b/g, '=')
      .replace(/\bIN\b/g, 'in');
  };

  // If no scheme was found in context / state (e.g. direct visit without questionnaire)
  if (!scheme) {
    return (
      <div className="flex-1 bg-slate-50 py-12 sm:py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{ui.noResultsTitle}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {lang === 'hi'
                ? 'व्यक्तिगत पात्रता और आवेदन चरणों को देखने के लिए कृपया पहले प्रश्नावली पूरी करें।'
                : 'Personalized eligibility reasoning and sequential application steps are generated from your questionnaire evaluation.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/questionnaire')}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>{ui.ctaCheckEligibility}</span>
              </button>
              {results.length > 0 && (
                <button
                  onClick={() => navigate('/results')}
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'परिणामों पर लौटें' : 'Back to Results'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* 1. TOP BREADCRUMB & ACTIONS */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/results')}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'परिणामों पर वापस' : 'Back to Results'}</span>
          </button>

          {scheme.sourceUrl && (
            <a
              href={scheme.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <span>{ui.applyNow}</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          )}
        </div>

        {/* Translation loading banner */}
        {isTranslatingResults && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-center gap-2.5 animate-pulse shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span className="font-medium">
              {lang === 'hi'
                ? 'योजना विवरण और एआई विश्लेषण का हिन्दी अनुवाद लोड हो रहा है...'
                : 'Translating scheme details and AI explanations into English...'}
            </span>
          </div>
        )}

        <div className={`space-y-6 transition-opacity duration-200 ${isTranslatingResults ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          {/* 2. SCHEME HEADER CARD */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{ui.eligibleBanner}</span>
            </span>

            {scheme.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>{scheme.category}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
            {scheme.schemeName}
          </h1>

          {scheme.issuingBody && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{scheme.issuingBody}</span>
            </div>
          )}
        </div>

        {/* 3. TABS NAVIGATION */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 overflow-x-auto no-scrollbar gap-2 sm:gap-4">
          {[
            { id: 'overview', label: ui.tabOverview, icon: Info },
            { id: 'eligibility', label: ui.tabEligibility, icon: ShieldCheck },
            { id: 'apply', label: ui.tabHowToApply, icon: ListOrdered },
            { id: 'details', label: ui.tabDetails, icon: FileText },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`inline-flex items-center gap-2 py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. TAB CONTENTS */}
        <div className="p-6 sm:p-8 rounded-b-2xl bg-white border border-t-0 border-slate-200/80 shadow-xs space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {lang === 'hi' ? 'योजना का विवरण' : 'Scheme Summary'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {scheme.description ||
                    (lang === 'hi'
                      ? 'इस कल्याणकारी योजना के दिशानिर्देश आधिकारिक सरकारी रिकॉर्ड के अनुसार पंजीकृत हैं।'
                      : 'Official government welfare program guidelines and eligibility rules registered in the SchemeSetu system.')}
                </p>
              </div>

              {/* Highlights Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {lang === 'hi' ? 'मुख्य विशेषताएं' : 'Key Highlights'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-medium block">
                      {lang === 'hi' ? 'श्रेणी' : 'Category'}
                    </span>
                    <span className="text-slate-800 font-bold mt-0.5 block">{scheme.category}</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-medium block">
                      {lang === 'hi' ? 'जारीकर्ता विभाग' : 'Department'}
                    </span>
                    <span className="text-slate-800 font-bold mt-0.5 block">{scheme.issuingBody}</span>
                  </div>
                </div>
              </div>

              {/* Official Portal Box */}
              {scheme.sourceUrl && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-900">
                      {lang === 'hi' ? 'आधिकारिक आवेदन पोर्टल' : 'Official Application Portal'}
                    </h4>
                    <p className="text-xs text-emerald-700">
                      {lang === 'hi'
                        ? 'इस योजना के लिए ऑनलाइन फॉर्म आधिकारिक पोर्टल पर सीधे जमा करें।'
                        : 'Submit your direct application on the verified government portal.'}
                    </p>
                  </div>
                  <a
                    href={scheme.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    <span>{ui.applyNow}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ELIGIBILITY & REASONING */}
          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              {/* AI Grounded Reasoning */}
              {scheme.explanation?.reasoning && (
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>{ui.whyEligible}</span>
                  </h3>
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-700 leading-relaxed">
                    {scheme.explanation.reasoning}
                  </div>
                </div>
              )}

              {/* Matched Rules List */}
              {scheme.matchedCriteria && scheme.matchedCriteria.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    {lang === 'hi' ? 'सत्यापित नियम और मानदंड' : 'Verified Matching Criteria'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {scheme.matchedCriteria.map((crit, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono font-medium">{formatRuleTag(crit)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HOW TO APPLY */}
          {activeTab === 'apply' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {lang === 'hi' ? 'आवेदन कैसे करें?' : 'How to Apply'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {lang === 'hi'
                    ? 'नीचे दिए गए चरणों का पालन करके आधिकारिक पोर्टल पर आवेदन करें।'
                    : 'Follow these step-by-step instructions to apply on the official government website.'}
                </p>
              </div>

              {/* Numbered Application Steps */}
              {scheme.explanation?.applicationSteps && scheme.explanation.applicationSteps.length > 0 ? (
                <div className="space-y-3">
                  {scheme.explanation.applicationSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              ) : scheme.applicationProcess ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
                  {scheme.applicationProcess}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  {lang === 'hi'
                    ? 'आधिकारिक पोर्टल लिंक पर क्लिक करें और वहां दिए गए आवेदन निर्देशों का पालन करें।'
                    : 'Visit the official government portal link to view complete submission procedures.'}
                </div>
              )}

              {/* Apply CTA Button */}
              {scheme.sourceUrl && (
                <div className="pt-2">
                  <a
                    href={scheme.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>{ui.applyNow}</span>
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'hi' ? 'योजना मेटाडेटा' : 'Scheme Metadata'}
              </h3>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs sm:text-sm">
                <div className="flex justify-between p-3.5 bg-white">
                  <span className="font-medium text-slate-500">Scheme ID</span>
                  <span className="font-mono font-semibold text-slate-800">#{scheme.schemeId}</span>
                </div>
                <div className="flex justify-between p-3.5 bg-slate-50/50">
                  <span className="font-medium text-slate-500">Category</span>
                  <span className="font-semibold text-slate-800">{scheme.category}</span>
                </div>
                <div className="flex justify-between p-3.5 bg-white">
                  <span className="font-medium text-slate-500">Issuing Authority</span>
                  <span className="font-semibold text-slate-800">{scheme.issuingBody}</span>
                </div>
                <div className="flex justify-between p-3.5 bg-slate-50/50">
                  <span className="font-medium text-slate-500">Official Portal</span>
                  {scheme.sourceUrl ? (
                    <a
                      href={scheme.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span className="max-w-[200px] truncate">{scheme.sourceUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
                <div className="flex justify-between p-3.5 bg-white">
                  <span className="font-medium text-slate-500">
                    {lang === 'hi' ? 'सत्यापन विधि' : 'Verification Mode'}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {lang === 'hi' ? 'आधिकारिक नियम-आधारित मिलान' : 'Official Rule-Based Matching'}
                  </span>
                </div>
              </div>
            </div>
          )}

          </div>
        </div>

      </div>
    </div>
  );
};
