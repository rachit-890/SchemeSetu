import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { MatchedSchemeDto } from '../types';
import {
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Building,
  Tag,
  AlertCircle,
  FileText,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { lang, ui, results, sessionId, isTranslatingResults, resetQuestionnaire, setSession } = useApp();
  const navigate = useNavigate();

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

  // Helper to format rule strings cleanly (e.g., "AGE LTE 25" -> "Age ≤ 25")
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

  // Prompt if no session has ever been started
  if (!sessionId && results.length === 0) {
    return (
      <div className="flex-1 bg-slate-50 py-12 sm:py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{ui.noResultsTitle}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {ui.startQuestionnairePrompt}
            </p>
            <button
              onClick={handleRetake}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              <span>{ui.getStarted}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* 1. HERO RESULTS SUMMARY BANNER */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'एआई नियम-आधारित मिलान' : 'Rule-Engine Verified'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {ui.matchedSchemesCount.replace('{count}', String(results.length))}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal">
              {lang === 'hi'
                ? 'आपकी जनसांख्यिकीय व व्यावसायिक जानकारी के आधार पर निम्नलिखित योजनाएं उपयुक्त पाई गईं।'
                : 'Based on your submitted profile, you qualify for the following government programs.'}
            </p>
          </div>

          <button
            onClick={handleRetake}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/15 text-white font-medium text-xs sm:text-sm border border-white/10 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{ui.retakeQuestionnaire}</span>
          </button>
        </div>

        {/* 2. TRANSLATION RE-FETCHING SPINNER */}
        {isTranslatingResults && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-center gap-2.5 animate-pulse shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span className="font-medium">
              {lang === 'hi'
                ? 'योजनाओं का हिन्दी अनुवाद और एआई विश्लेषण लोड हो रहा है...'
                : 'Translating scheme details and AI explanations into English...'}
            </span>
          </div>
        )}

        {/* 3. ZERO MATCHES EMPTY STATE */}
        {results.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{ui.noResultsTitle}</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {ui.noSchemesFoundDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={handleRetake}
                type="button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{ui.retakeQuestionnaire}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 4. MATCHED SCHEMES LIST */
          <div className={`space-y-5 transition-opacity duration-200 ${isTranslatingResults ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            {results.map((scheme) => (
              <div
                key={scheme.schemeId}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between gap-5"
              >
                {/* Scheme Header */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{ui.eligibleBanner}</span>
                        </span>
                        {scheme.category && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                            <Tag className="w-3 h-3 text-slate-500" />
                            <span>{scheme.category}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer break-words"
                          onClick={() => handleViewSchemeDetails(scheme)}>
                        {scheme.schemeName}
                      </h3>
                    </div>

                    {/* Direct Portal Link */}
                    {scheme.sourceUrl && (
                      <a
                        href={scheme.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors shrink-0"
                        title={scheme.sourceUrl}
                      >
                        <span>{ui.officialPortal}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Issuing Body */}
                  {scheme.issuingBody && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{scheme.issuingBody}</span>
                    </div>
                  )}

                  {/* Grounded Reasoning */}
                  {scheme.explanation?.reasoning && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-xs mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{ui.whyEligible}:</span>
                      </div>
                      <p className="text-slate-600 line-clamp-3">{scheme.explanation.reasoning}</p>
                    </div>
                  )}

                  {/* Matched Criteria Chips */}
                  {scheme.matchedCriteria && scheme.matchedCriteria.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {ui.criteriaMatched}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scheme.matchedCriteria.map((crit, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {formatRuleTag(crit)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleViewSchemeDetails(scheme)}
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer group"
                  >
                    <span>{ui.viewDetailsAndApply}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
