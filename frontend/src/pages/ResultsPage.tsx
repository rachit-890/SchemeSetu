import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { MatchedSchemeDto } from '../types';
import { formatMatchedCriterion } from '../utils/criteriaFormatter';
import { formatMatchedSchemesCount, formatWhySchemeMatchesYou } from '../utils/translations';
import {
  Check,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Building,
  Tag,
  AlertCircle,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const {
    lang,
    ui,
    results,
    hasCompletedQuestionnaire,
    isTranslatingResults,
    resetQuestionnaire,
    setSession,
  } = useApp();
  const navigate = useNavigate();

  // Track expanded state of "Why you're eligible" for each scheme card
  const [expandedSchemeIds, setExpandedSchemeIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (schemeId: number) => {
    setExpandedSchemeIds((prev) => ({
      ...prev,
      [schemeId]: !prev[schemeId],
    }));
  };

  const handleRetake = async () => {
    resetQuestionnaire();
    try {
      const res = await api.startQuestionnaire(lang);
      setSession(res.sessionId, res.question);
      navigate('/questionnaire');
    } catch {
      navigate('/questionnaire');
    }
  };

  const handleViewSchemeDetails = (scheme: MatchedSchemeDto) => {
    navigate(`/schemes/${scheme.schemeId}`, { state: { scheme } });
  };

  // State 1: User navigated to /results WITHOUT having completed the questionnaire
  if (!hasCompletedQuestionnaire && results.length === 0) {
    return (
      <div className="flex-1 bg-[#F8FAFC] py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 text-[#111827] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-[#111827]">{ui.preQuestionnaireTitle}</h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                {ui.preQuestionnaireDesc}
              </p>
            </div>
            <button
              onClick={handleRetake}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-[#059669] hover:bg-[#047857] text-white font-medium text-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>{ui.checkMyEligibility}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* 1. HERO RESULTS SUMMARY BANNER (Lightened public-sector theme) */}
        <div className="p-6 sm:p-8 rounded-xl bg-white text-[#111827] shadow-xs border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
              <span>{ui.eligibilityMatching}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              {formatMatchedSchemesCount(results.length, lang)}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed">
              {lang === 'hi'
                ? 'आपकी जनसांख्यिकीय व व्यावसायिक जानकारी के आधार पर निम्नलिखित योजनाएं उपयुक्त पाई गईं।'
                : 'Based on your submitted profile, you qualify for the following government programs.'}
            </p>
          </div>

          <button
            onClick={handleRetake}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-medium text-xs sm:text-sm border border-[#E5E7EB] shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>{ui.retakeQuestionnaire}</span>
          </button>
        </div>

        {/* 2. TRANSLATION RE-FETCHING SPINNER */}
        {isTranslatingResults && (
          <div className="p-4 rounded-lg bg-gray-100 border border-gray-200 text-gray-800 text-xs sm:text-sm flex items-center justify-center gap-2.5 animate-pulse shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            <span className="font-medium">
              {lang === 'hi'
                ? 'योजनाओं का हिन्दी अनुवाद और एआई विश्लेषण लोड हो रहा है...'
                : 'Translating scheme details and AI explanations into English...'}
            </span>
          </div>
        )}

        {/* 3. ZERO MATCHES EMPTY STATE (State 2: Questionnaire completed with 0 matches) */}
        {results.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-xl bg-white border border-[#E5E7EB] text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#111827]">{ui.zeroMatchesTitle}</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed font-normal">
                {ui.zeroMatchesDesc}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleRetake}
                type="button"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#111827] hover:bg-gray-800 text-white font-medium text-sm shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{ui.retakeQuestionnaire}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 4. MATCHED SCHEMES LIST */
          <div className={`space-y-4 transition-opacity duration-200 ${isTranslatingResults ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            {results.map((scheme) => {
              const isExpanded = expandedSchemeIds[scheme.schemeId] ?? true; // Default expanded for clear visibility
              const hasCriteria = scheme.matchedCriteria && scheme.matchedCriteria.length > 0;

              return (
                <div
                  key={scheme.schemeId}
                  className="p-5 sm:p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between gap-4"
                >
                  {/* Scheme Header */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1.5 max-w-2xl">
                        {/* Status & Badges */}
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

                        <h3
                          className="text-lg sm:text-xl font-semibold text-[#111827] hover:text-[#059669] transition-colors cursor-pointer break-words"
                          onClick={() => handleViewSchemeDetails(scheme)}
                        >
                          {scheme.schemeName}
                        </h3>

                        {scheme.issuingBody && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-normal">
                            <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{scheme.issuingBody}</span>
                          </div>
                        )}
                      </div>

                      {/* Direct Portal Link */}
                      {scheme.sourceUrl && (
                        <a
                          href={scheme.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium transition-colors shrink-0"
                          title={scheme.sourceUrl}
                        >
                          <span>{ui.officialPortal}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                        </a>
                      )}
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] text-gray-400 italic">
                      {ui.finalEligibilityDisclaimer}
                    </p>

                    {/* Expandable "Why you're eligible" Section */}
                    {hasCriteria && (
                      <div className="border border-gray-100 rounded-lg overflow-hidden bg-[#F8FAFC]">
                        <button
                          onClick={() => toggleExpand(scheme.schemeId)}
                          type="button"
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-[#111827] hover:bg-gray-100/70 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#059669]" />
                            <span>{formatWhySchemeMatchesYou(scheme.matchedCriteria.length, lang)}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-3.5 pb-3 pt-1 space-y-1.5 border-t border-gray-100 bg-white">
                            {scheme.matchedCriteria.map((crit, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-xs text-gray-700 font-normal"
                              >
                                <Check className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                                <span>{formatMatchedCriterion(crit, lang)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                    <button
                      onClick={() => handleViewSchemeDetails(scheme)}
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#059669] hover:bg-[#047857] text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer group"
                    >
                      <span>{ui.viewDetailsAndApply}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
