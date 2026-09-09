import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { MatchedSchemeDto } from '../types';
import { formatMatchedCriterion } from '../utils/criteriaFormatter';
import { formatWhySchemeMatchesYou } from '../utils/translations';
import { formatDocumentName } from '../utils/documentFormatter';
import {
  ArrowLeft,
  ExternalLink,
  Check,
  Building,
  Tag,
  ShieldCheck,
  CheckCircle2,
  ListOrdered,
  Info,
  FileText,
  FileCheck,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const SchemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { results, lang, ui, isTranslatingResults } = useApp();

  // Active tab state: 'overview' | 'eligibility' | 'apply' | 'details'
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'apply' | 'details'>('overview');

  // Track expanded state of "Why you're eligible" checklist
  const [isCriteriaExpanded, setIsCriteriaExpanded] = useState<boolean>(true);

  // Look up scheme from AppContext results first (for live translated updates), then from router state
  const scheme: MatchedSchemeDto | undefined =
    results.find((s) => String(s.schemeId) === id) || location.state?.scheme;

  // If no scheme was found in context / state (e.g. direct visit without questionnaire)
  if (!scheme) {
    return (
      <div className="flex-1 bg-[#F8FAFC] py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 text-[#111827] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-[#111827]">{ui.noResultsTitle}</h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'व्यक्तिगत पात्रता और आवेदन चरणों को देखने के लिए कृपया पहले प्रश्नावली पूरी करें।'
                  : 'Personalized eligibility reasoning and sequential application steps are generated from your questionnaire evaluation.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/questionnaire')}
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#059669] hover:bg-[#047857] text-white font-medium text-sm shadow-xs transition-colors cursor-pointer"
              >
                <span>{ui.ctaCheckEligibility}</span>
              </button>
              {results.length > 0 && (
                <button
                  onClick={() => navigate('/results')}
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[#111827] font-medium text-sm transition-colors cursor-pointer"
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

  const hasCriteria = scheme.matchedCriteria && scheme.matchedCriteria.length > 0;

  return (
    <div className="flex-1 bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* 1. TOP BREADCRUMB NAVIGATION */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/results')}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white hover:bg-gray-50 border border-[#E5E7EB] text-gray-700 font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'परिणामों पर वापस' : 'Back to Results'}</span>
          </button>
        </div>

        {/* Translation loading banner */}
        {isTranslatingResults && (
          <div className="p-3.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-800 text-xs sm:text-sm flex items-center justify-center gap-2.5 animate-pulse shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            <span className="font-medium">
              {lang === 'hi'
                ? 'योजना विवरण और एआई विश्लेषण का हिन्दी अनुवाद लोड हो रहा है...'
                : 'Translating scheme details and AI explanations into English...'}
            </span>
          </div>
        )}

        <div className={`space-y-6 transition-opacity duration-200 ${isTranslatingResults ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>

          {/* 2. ABOVE-THE-FOLD PRIMARY CARD (Hierarchy: Badges -> Name/Body -> Eligibility Banner & Disclaimer -> Criteria -> Apply CTA) */}
          <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#E5E7EB] shadow-xs space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] font-medium text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                <span>{ui.eligibleBanner}</span>
              </span>

              {scheme.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium text-xs">
                  <Tag className="w-3 h-3 text-gray-500" />
                  <span>{scheme.category}</span>
                </span>
              )}
            </div>

            {/* Scheme Title & Issuing Body */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight break-words">
                {scheme.schemeName}
              </h1>

              {scheme.issuingBody && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 font-normal">
                  <Building className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{scheme.issuingBody}</span>
                </div>
              )}
            </div>

            {/* Eligibility Banner & Disclaimer (Part G) */}
            <div className="p-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] space-y-1.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#059669]">
                <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
                <span>{ui.eligibleBanner}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                {ui.finalEligibilityDisclaimer}
              </p>
            </div>

            {/* Expandable "Why you're eligible" Section (Part F) */}
            {hasCriteria && (
              <div className="border border-gray-100 rounded-lg overflow-hidden bg-[#F8FAFC]">
                <button
                  onClick={() => setIsCriteriaExpanded(!isCriteriaExpanded)}
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#111827] hover:bg-gray-100/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#059669]" />
                    <span>{formatWhySchemeMatchesYou(scheme.matchedCriteria.length, lang)}</span>
                  </div>
                  {isCriteriaExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {isCriteriaExpanded && (
                  <div className="px-4 pb-3.5 pt-1 space-y-2 border-t border-gray-100 bg-white">
                    {scheme.matchedCriteria.map((crit, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-gray-700 font-normal"
                      >
                        <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                        <span>{formatMatchedCriterion(crit, lang)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Primary Action Button (Apply on Official Portal) */}
            {scheme.sourceUrl && (
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={scheme.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-[#059669] hover:bg-[#047857] text-white font-medium text-sm shadow-xs transition-colors cursor-pointer"
                >
                  <span>{ui.applyOfficialPortal}</span>
                  <ExternalLink className="w-4 h-4 text-white/90" />
                </a>
                <span className="text-xs text-gray-500">
                  {ui.opensOfficialWebsite}
                </span>
              </div>
            )}
          </div>

          {/* 3. BELOW-THE-FOLD TABBED DETAILS */}
          <div className="rounded-xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
            {/* Tabs Bar */}
            <div className="flex border-b border-[#E5E7EB] bg-gray-50/70 px-3 pt-2 overflow-x-auto no-scrollbar gap-1 sm:gap-2">
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
                    className={`inline-flex items-center gap-2 py-2.5 px-3.5 font-medium text-xs sm:text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'border-[#059669] text-[#111827] bg-white font-semibold rounded-t-md -mb-px'
                        : 'border-transparent text-gray-500 hover:text-[#111827] hover:bg-gray-100/60'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-[#059669]' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents Area */}
            <div className="p-6 sm:p-8 space-y-6">

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#111827]">
                      {lang === 'hi' ? 'योजना का विवरण' : 'Scheme Summary'}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-normal">
                      {scheme.description ||
                        (lang === 'hi'
                          ? 'इस कल्याणकारी योजना के दिशानिर्देश आधिकारिक सरकारी रिकॉर्ड के अनुसार पंजीकृत हैं।'
                          : 'Official government welfare program guidelines and eligibility rules registered in the SchemeSetu system.')}
                    </p>
                  </div>

                  {/* Highlights Box */}
                  <div className="p-4 rounded-lg bg-gray-50 border border-[#E5E7EB] space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {lang === 'hi' ? 'मुख्य विवरण' : 'Key Information'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-md border border-[#E5E7EB]">
                        <span className="text-gray-400 font-normal block">
                          {lang === 'hi' ? 'श्रेणी' : 'Category'}
                        </span>
                        <span className="text-[#111827] font-medium mt-0.5 block">{scheme.category || '—'}</span>
                      </div>
                      <div className="p-3 bg-white rounded-md border border-[#E5E7EB]">
                        <span className="text-gray-400 font-normal block">
                          {lang === 'hi' ? 'जारीकर्ता विभाग' : 'Department'}
                        </span>
                        <span className="text-[#111827] font-medium mt-0.5 block">{scheme.issuingBody || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ELIGIBILITY & REASONING */}
              {activeTab === 'eligibility' && (
                <div className="space-y-6">
                  {/* AI Grounded or Rule-Based Reasoning */}
                  {scheme.explanation?.reasoning && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
                        {scheme.explanation.usedFallback ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-gray-600" />
                            <span>{lang === 'hi' ? 'नियम-आधारित मिलान' : 'Rule-Based Match'}</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-[#059669]" />
                            <span>{ui.whyEligible}</span>
                          </>
                        )}
                      </h3>
                      <div className="p-4 rounded-lg bg-gray-50 border border-[#E5E7EB] text-sm text-gray-700 leading-relaxed font-normal">
                        {scheme.explanation.reasoning}
                      </div>
                    </div>
                  )}

                  {/* Matched Rules List */}
                  {hasCriteria && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-[#111827]">
                        {lang === 'hi' ? 'सत्यापित नियम और मानदंड' : 'Verified Matching Criteria'}
                      </h4>
                      <div className="space-y-2">
                        {scheme.matchedCriteria.map((crit, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white rounded-lg border border-[#E5E7EB] flex items-center gap-2.5 text-xs text-gray-700 font-normal"
                          >
                            <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                            <span>{formatMatchedCriterion(crit, lang)}</span>
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
                  {/* Required Documents Section */}
                  <div className="space-y-3">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#059669]" />
                        <span>{ui.requiredDocuments}</span>
                      </h3>
                      <p className="text-xs text-gray-500 font-normal">
                        {ui.requiredDocumentsSubtitle}
                      </p>
                    </div>

                    {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {scheme.requiredDocuments.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-gray-50 border border-[#E5E7EB] flex items-center gap-3"
                          >
                            <div className="w-7 h-7 rounded-md bg-white border border-[#E5E7EB] text-[#059669] flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-800">
                              {formatDocumentName(doc, lang)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-lg bg-gray-50 border border-[#E5E7EB] text-xs text-gray-500 font-normal flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{ui.noDocumentsRequired}</span>
                      </div>
                    )}
                  </div>

                  {/* Application Process Header & Steps */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-[#111827]">
                        {lang === 'hi' ? 'आवेदन के चरण' : 'Application Steps'}
                      </h3>
                      <p className="text-xs text-gray-500 font-normal">
                        {lang === 'hi'
                          ? 'नीचे दिए गए चरणों का पालन करके आधिकारिक पोर्टल पर आवेदन करें।'
                          : 'Follow these step-by-step instructions to apply on the official government website.'}
                      </p>
                    </div>

                    {/* Numbered Application Steps */}
                    {scheme.explanation?.applicationSteps && scheme.explanation.applicationSteps.length > 0 ? (
                      <div className="space-y-2.5">
                        {scheme.explanation.applicationSteps.map((step, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-lg bg-gray-50 border border-[#E5E7EB] flex items-start gap-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-[#111827] text-white font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : scheme.applicationProcess ? (
                      <div className="p-4 rounded-lg bg-gray-50 border border-[#E5E7EB] text-sm text-gray-700 leading-relaxed font-normal">
                        {scheme.applicationProcess}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-50 border border-[#E5E7EB] text-xs text-gray-600 font-normal">
                        {lang === 'hi'
                          ? 'आधिकारिक पोर्टल लिंक पर क्लिक करें और वहां दिए गए आवेदन निर्देशों का पालन करें।'
                          : 'Visit the official government portal link to view complete submission procedures.'}
                      </div>
                    )}
                  </div>

                  {/* Apply CTA Button */}
                  {scheme.sourceUrl && (
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <a
                        href={scheme.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#059669] hover:bg-[#047857] text-white font-medium text-sm shadow-xs transition-colors cursor-pointer"
                      >
                        <span>{ui.applyOfficialPortal}</span>
                        <ExternalLink className="w-4 h-4 text-white/90" />
                      </a>
                      <span className="text-xs text-gray-500">
                        {ui.opensOfficialWebsite}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#111827]">
                    {lang === 'hi' ? 'योजना मेटाडेटा' : 'Scheme Metadata'}
                  </h3>

                  <div className="divide-y divide-gray-100 border border-[#E5E7EB] rounded-lg overflow-hidden text-xs sm:text-sm">
                    <div className="flex justify-between p-3.5 bg-white">
                      <span className="font-normal text-gray-500">
                        {lang === 'hi' ? 'योजना पहचान संख्या' : 'Scheme ID'}
                      </span>
                      <span className="font-mono font-medium text-[#111827]">#{scheme.schemeId}</span>
                    </div>
                    <div className="flex justify-between p-3.5 bg-gray-50/50">
                      <span className="font-normal text-gray-500">
                        {lang === 'hi' ? 'श्रेणी' : 'Category'}
                      </span>
                      <span className="font-medium text-[#111827]">{scheme.category || '—'}</span>
                    </div>
                    <div className="flex justify-between p-3.5 bg-white">
                      <span className="font-normal text-gray-500">
                        {lang === 'hi' ? 'जारीकर्ता प्राधिकरण' : 'Issuing Authority'}
                      </span>
                      <span className="font-medium text-[#111827]">{scheme.issuingBody || '—'}</span>
                    </div>
                    <div className="flex justify-between p-3.5 bg-gray-50/50">
                      <span className="font-normal text-gray-500">
                        {lang === 'hi' ? 'आधिकारिक पोर्टल' : 'Official Portal'}
                      </span>
                      {scheme.sourceUrl ? (
                        <a
                          href={scheme.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#059669] hover:underline flex items-center gap-1"
                        >
                          <span className="max-w-[200px] truncate">{scheme.sourceUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                    <div className="flex justify-between p-3.5 bg-white">
                      <span className="font-normal text-gray-500">
                        {lang === 'hi' ? 'सत्यापन स्थिति' : 'Verification Status'}
                      </span>
                      <span className="font-medium text-[#059669]">
                        {lang === 'hi' ? 'सरकारी पात्रता नियमों के अनुसार सत्यापित' : 'Verified against government eligibility rules'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
