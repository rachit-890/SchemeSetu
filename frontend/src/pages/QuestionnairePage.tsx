import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { INDIAN_STATES, QUESTION_METADATA } from '../utils/constants';
import { STATE_TRANSLATIONS } from '../utils/criteriaFormatter';

// Cosmetic submission status messages cycled purely on client timer while awaiting single backend response
const COSMETIC_SUBMISSION_MESSAGES = {
  en: [
    'Evaluating eligibility rules...',
    'Checking matching welfare schemes...',
    'Preparing your personalized results...',
  ],
  hi: [
    'पात्रता नियमों का मूल्यांकन किया जा रहा है...',
    'मेल खाती सरकारी योजनाओं की जांच हो रही है...',
    'आपके परिणाम तैयार किए जा रहे हैं...',
  ],
};

import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  RotateCcw,
  Loader2,
  AlertCircle,
  Check,
  Briefcase,
  GraduationCap,
  Sprout,
  Users,
  Building2,
  Hammer,
  Clock,
  User,
} from 'lucide-react';

export const QuestionnairePage: React.FC = () => {
  const {
    lang,
    ui,
    sessionId,
    currentQuestion,
    questionIndex,
    history,
    setSession,
    setCurrentQuestion,
    setResults,
    pushHistory,
    resetQuestionnaire,
  } = useApp();

  const navigate = useNavigate();

  // Input states
  const [currentValue, setCurrentValue] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showWhyWeAsk, setShowWhyWeAsk] = useState(false);

  // Read-only history browsing state (index into history array, null when on current active question)
  const [viewingHistoryIndex, setViewingHistoryIndex] = useState<number | null>(null);

  // Cosmetic progress message index cycled purely on client timer while awaiting API response (single request/response)
  const [submissionCosmeticStep, setSubmissionCosmeticStep] = useState(0);

  useEffect(() => {
    let intervalId: any;
    if (submitting) {
      setSubmissionCosmeticStep(0);
      intervalId = setInterval(() => {
        setSubmissionCosmeticStep((prev) => (prev + 1) % 3);
      }, 1200);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [submitting]);

  // Initialize session if opened directly without a session
  useEffect(() => {
    if (!sessionId || !currentQuestion) {
      const initSession = async () => {
        setLoadingInitial(true);
        setErrorMessage(null);
        try {
          const res = await api.startQuestionnaire(lang);
          setSession(res.sessionId, res.question);
        } catch (err: any) {
          setErrorMessage(
            err?.message ||
              (lang === 'hi'
                ? 'प्रश्नावली सेवा से कनेक्ट नहीं हो सका। कृपया सुनिश्चित करें कि बैकएंड सर्वर चल रहा है।'
                : 'Could not connect to the questionnaire service. Please ensure the backend server is running.')
          );
        } finally {
          setLoadingInitial(false);
        }
      };
      initSession();
    }
  }, [sessionId, currentQuestion, lang, setSession]);

  // Reset value and why-we-ask panel when question changes
  useEffect(() => {
    setCurrentValue('');
    setShowWhyWeAsk(false);
    setErrorMessage(null);
  }, [currentQuestion?.id]);

  const handleStartOver = async () => {
    resetQuestionnaire();
    setViewingHistoryIndex(null);
    setCurrentValue('');
    setErrorMessage(null);
    setLoadingInitial(true);
    try {
      const res = await api.startQuestionnaire(lang);
      setSession(res.sessionId, res.question);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (lang === 'hi' ? 'नया सत्र प्रारंभ करने में विफल।' : 'Failed to start a new questionnaire session.')
      );
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (viewingHistoryIndex === null) {
      // Currently at active question, go to the latest history item
      if (history.length > 0) {
        setViewingHistoryIndex(history.length - 1);
      }
    } else if (viewingHistoryIndex > 0) {
      // Step back further into history
      setViewingHistoryIndex(viewingHistoryIndex - 1);
    }
  };

  const handleForwardHistory = () => {
    if (viewingHistoryIndex !== null) {
      if (viewingHistoryIndex < history.length - 1) {
        setViewingHistoryIndex(viewingHistoryIndex + 1);
      } else {
        // Return to active question
        setViewingHistoryIndex(null);
      }
    }
  };

  const handleReturnToActive = () => {
    setViewingHistoryIndex(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentValue.trim()) {
      setErrorMessage(ui.requiredField);
      return;
    }

    if (!sessionId || !currentQuestion) {
      setErrorMessage(lang === 'hi' ? 'कोई सक्रिय प्रश्नावली सत्र नहीं है।' : 'No active questionnaire session.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await api.submitAnswer(
        sessionId,
        currentQuestion.fieldName,
        currentValue.trim(),
        lang
      );

      // Record answer in client-side history for read-only inspection
      pushHistory({
        questionNumber: questionIndex,
        fieldName: currentQuestion.fieldName,
        value: currentValue.trim(),
        question: currentQuestion,
      });

      if (response.status === 'COMPLETED' || response.results) {
        setResults(response.results || []);
        navigate('/results');
      } else if (response.question) {
        setCurrentQuestion(response.question, questionIndex + 1);
        setCurrentValue('');
      } else {
        // Fallback match check if complete without explicit results list
        setResults([]);
        navigate('/results');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (lang === 'hi'
            ? 'उत्तर जमा करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
            : 'Failed to submit answer. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // If loading session initially
  if (loadingInitial) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
          <p className="text-sm font-medium">
            {lang === 'hi' ? 'प्रश्नावली लोड हो रही है...' : 'Initializing Questionnaire...'}
          </p>
        </div>
      </div>
    );
  }

  // Active question vs History item
  const isBrowsingHistory = viewingHistoryIndex !== null;
  const activeDisplayQuestion = isBrowsingHistory
    ? history[viewingHistoryIndex].question
    : currentQuestion;

  const activeDisplayQuestionNumber = isBrowsingHistory
    ? history[viewingHistoryIndex].questionNumber
    : questionIndex;

  const activeFieldName = activeDisplayQuestion?.fieldName || '';
  const metadata = QUESTION_METADATA[activeFieldName];
  const whyWeAskText =
    lang === 'hi'
      ? metadata?.whyWeAskHi || 'यह जानकारी सरकारी योजना पात्रता जांचने के लिए आवश्यक है।'
      : metadata?.whyWeAskEn || 'This information is required to evaluate official eligibility rules.';

  const questionTitle = activeDisplayQuestion
    ? lang === 'hi'
      ? activeDisplayQuestion.textHi || activeDisplayQuestion.text
      : activeDisplayQuestion.text
    : '';

  // Progress computation (total 7 questions max)
  const totalQuestions = 7;
  const progressPercent = Math.min(
    100,
    Math.round((activeDisplayQuestionNumber / totalQuestions) * 100)
  );

  return (
    <div className="flex-1 flex flex-col justify-center bg-[#F8FAFC] py-6 sm:py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full">

        {/* 1. TOP PROGRESS BAR & HEADER */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span className="flex items-center gap-1.5 text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-md border border-[#A7F3D0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              {ui.questionProgress.replace('{current}', String(activeDisplayQuestionNumber))}
            </span>
            <span className="text-gray-400 font-mono text-[11px]">
              {progressPercent}% {lang === 'hi' ? 'पूर्ण' : 'Complete'}
            </span>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#059669] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 2. READ-ONLY HISTORY BANNER (If viewing past answers) */}
        {isBrowsingHistory && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                <Clock className="w-4 h-4" />
                <span>{ui.viewingHistory}</span>
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5 font-normal">
                {lang === 'hi'
                  ? 'यह पहले दिया गया उत्तर है। उत्तर बदलने के लिए "पुनः प्रारंभ करें" दबाएं।'
                  : 'This answer is recorded in the session. To modify answers, click "Start Over".'}
              </p>
            </div>
            <button
              onClick={handleReturnToActive}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-medium text-xs transition-colors shrink-0 cursor-pointer"
            >
              <span>{ui.returnToCurrent}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. ERROR BANNER */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-shake shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{lang === 'hi' ? 'त्रुटि' : 'Notice'}</p>
              <p className="text-xs text-red-600 mt-0.5 font-normal">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 4. MAIN QUESTION CARD */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-6 sm:p-8 space-y-6">

          {/* Question Title */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {lang === 'hi' ? `प्रश्न ${activeDisplayQuestionNumber}` : `Question ${activeDisplayQuestionNumber}`}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight mt-1">
              {questionTitle || (lang === 'hi' ? 'प्रश्न लोड हो रहा है...' : 'Loading question...')}
            </h2>
          </div>

          {/* READ-ONLY VIEW for History */}
          {isBrowsingHistory ? (
            <div className="p-4 rounded-lg bg-gray-50 border border-[#E5E7EB] space-y-2">
              <span className="text-xs text-gray-500 font-normal">
                {lang === 'hi' ? 'दर्ज किया गया उत्तर:' : 'Submitted Answer:'}
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-sm font-medium">
                  <Check className="w-4 h-4" />
                  {history[viewingHistoryIndex].value}
                </span>
              </div>
            </div>
          ) : submitting ? (
            /* COSMETIC SUBMISSION LOADING CARD (Purely cosmetic client-side status hints while awaiting single API response) */
            <div className="py-10 px-4 rounded-xl bg-gray-50/80 border border-[#E5E7EB] text-center space-y-4 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
                <Loader2 className="w-6 h-6 animate-spin text-[#059669]" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <p className="text-sm font-semibold text-[#111827] transition-all duration-300">
                  {COSMETIC_SUBMISSION_MESSAGES[lang][submissionCosmeticStep]}
                </p>
                <p className="text-xs text-gray-500 font-normal leading-relaxed">
                  {lang === 'hi'
                    ? 'कृपया प्रतीक्षा करें, पात्रता का मूल्यांकन किया जा रहा है...'
                    : 'Please wait while your answers are evaluated against official scheme criteria...'}
                </p>
              </div>
            </div>
          ) : (
            /* ACTIVE QUESTION INPUT */
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* INPUT TYPE: GENDER */}
              {activeFieldName === 'gender' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { val: 'FEMALE', labelEn: 'Female', labelHi: 'महिला' },
                    { val: 'MALE', labelEn: 'Male', labelHi: 'पुरुष' },
                    { val: 'OTHER', labelEn: 'Other', labelHi: 'अन्य' },
                  ].map((option) => (
                    <button
                      key={option.val}
                      type="button"
                      onClick={() => setCurrentValue(option.val)}
                      className={`p-4 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
                        currentValue === option.val
                          ? 'border-[#059669] bg-[#ECFDF5] text-[#111827] shadow-xs'
                          : 'border-[#E5E7EB] bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <User className={`w-5 h-5 ${currentValue === option.val ? 'text-[#059669]' : 'text-gray-400'}`} />
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            currentValue === option.val
                              ? 'border-[#059669] bg-[#059669]'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {currentValue === option.val && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </div>
                      </div>
                      <span className="font-medium text-sm">
                        {lang === 'hi' ? option.labelHi : option.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* INPUT TYPE: CASTE CATEGORY */}
              {activeFieldName === 'casteCategory' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { val: 'GENERAL', labelEn: 'General', labelHi: 'सामान्य (General)' },
                    { val: 'OBC', labelEn: 'OBC', labelHi: 'अन्य पिछड़ा वर्ग (OBC)' },
                    { val: 'SC', labelEn: 'SC', labelHi: 'अनुसूचित जाति (SC)' },
                    { val: 'ST', labelEn: 'ST', labelHi: 'अनुसूचित जनजाति (ST)' },
                    { val: 'EWS', labelEn: 'EWS', labelHi: 'आर्थिक कमजोर वर्ग (EWS)' },
                  ].map((option) => (
                    <button
                      key={option.val}
                      type="button"
                      onClick={() => setCurrentValue(option.val)}
                      className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        currentValue === option.val
                          ? 'border-[#059669] bg-[#ECFDF5] text-[#111827] shadow-xs'
                          : 'border-[#E5E7EB] bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="font-medium text-xs sm:text-sm">
                        {lang === 'hi' ? option.labelHi : option.labelEn}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                          currentValue === option.val
                            ? 'border-[#059669] bg-[#059669]'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {currentValue === option.val && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* INPUT TYPE: OCCUPATION */}
              {activeFieldName === 'occupation' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { val: 'FARMER', labelEn: 'Farmer', labelHi: 'किसान (Farmer)', icon: Sprout },
                    { val: 'STUDENT', labelEn: 'Student', labelHi: 'छात्र/छात्रा (Student)', icon: GraduationCap },
                    { val: 'UNEMPLOYED', labelEn: 'Unemployed', labelHi: 'बेरोजगार (Unemployed)', icon: Users },
                    { val: 'SALARIED', labelEn: 'Salaried Employee', labelHi: 'वेतनभोगी (Salaried)', icon: Building2 },
                    { val: 'SELF_EMPLOYED', labelEn: 'Self-Employed / Business', labelHi: 'स्वरोजगार (Self-Employed)', icon: Briefcase },
                    { val: 'LABORER', labelEn: 'Daily Wage Laborer / Artisan', labelHi: 'श्रमिक / मजदूर (Laborer)', icon: Hammer },
                    { val: 'RETIRED', labelEn: 'Retired / Pensioner', labelHi: 'सेवानिवृत्त (Retired)', icon: Clock },
                  ].map((option) => {
                    const IconComp = option.icon;
                    return (
                      <button
                        key={option.val}
                        type="button"
                        onClick={() => setCurrentValue(option.val)}
                        className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                          currentValue === option.val
                            ? 'border-[#059669] bg-[#ECFDF5] text-[#111827] shadow-xs'
                            : 'border-[#E5E7EB] bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComp className={`w-4 h-4 ${currentValue === option.val ? 'text-[#059669]' : 'text-gray-400'}`} />
                          <span className="font-medium text-xs sm:text-sm">
                            {lang === 'hi' ? option.labelHi : option.labelEn}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                            currentValue === option.val
                              ? 'border-[#059669] bg-[#059669]'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {currentValue === option.val && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* INPUT TYPE: STATE */}
              {activeFieldName === 'state' && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-600">
                    {lang === 'hi' ? 'राज्य या केंद्र शासित प्रदेश चुनें:' : 'Select your State or Union Territory:'}
                  </label>
                  <select
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#E5E7EB] bg-white text-[#111827] text-sm font-medium focus:outline-hidden focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors cursor-pointer"
                  >
                    <option value="">
                      {lang === 'hi' ? '-- राज्य चुनें --' : '-- Select State --'}
                    </option>
                    {INDIAN_STATES.map((stateName) => {
                      const stateHi = STATE_TRANSLATIONS[stateName.toUpperCase()]?.hi;
                      return (
                        <option key={stateName} value={stateName}>
                          {lang === 'hi' && stateHi ? stateHi : stateName}
                        </option>
                      );
                    })}
                  </select>

                  {/* Featured Quick State Chips */}
                  <div className="pt-2">
                    <span className="text-[11px] text-gray-400 font-normal block mb-1.5">
                      {lang === 'hi' ? 'त्वरित चयन:' : 'Quick Select:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { val: 'Uttar Pradesh', labelHi: 'उत्तर प्रदेश', labelEn: 'Uttar Pradesh' },
                        { val: 'Maharashtra', labelHi: 'महाराष्ट्र', labelEn: 'Maharashtra' },
                        { val: 'Bihar', labelHi: 'बिहार', labelEn: 'Bihar' },
                        { val: 'Madhya Pradesh', labelHi: 'मध्य प्रदेश', labelEn: 'Madhya Pradesh' },
                        { val: 'Rajasthan', labelHi: 'राजस्थान', labelEn: 'Rajasthan' },
                        { val: 'Delhi', labelHi: 'दिल्ली', labelEn: 'Delhi' },
                      ].map((st) => (
                        <button
                          key={st.val}
                          type="button"
                          onClick={() => setCurrentValue(st.val)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                            currentValue === st.val
                              ? 'bg-[#059669] text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {lang === 'hi' ? st.labelHi : st.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* INPUT TYPE: AGE */}
              {activeFieldName === 'age' && (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                      placeholder={lang === 'hi' ? 'उदा. 24' : 'e.g. 24'}
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#E5E7EB] bg-white text-[#111827] text-base font-semibold focus:outline-hidden focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors"
                      autoFocus
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                      {lang === 'hi' ? 'वर्ष' : 'Years'}
                    </span>
                  </div>

                  {/* Quick Age Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-gray-400 font-normal">
                      {lang === 'hi' ? 'त्वरित विकल्प:' : 'Quick choices:'}
                    </span>
                    {['18', '21', '25', '35', '50', '60'].map((ageOption) => (
                      <button
                        key={ageOption}
                        type="button"
                        onClick={() => setCurrentValue(ageOption)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                          currentValue === ageOption
                            ? 'bg-[#059669] text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {ageOption} {lang === 'hi' ? 'वर्ष' : 'yrs'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* INPUT TYPE: MONTHLY INCOME */}
              {activeFieldName === 'monthlyIncome' && (
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-medium text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                      placeholder={lang === 'hi' ? 'उदा. 15000' : 'e.g. 15000'}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-md border border-[#E5E7EB] bg-white text-[#111827] text-base font-semibold focus:outline-hidden focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors"
                      autoFocus
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                      / {lang === 'hi' ? 'माह' : 'month'}
                    </span>
                  </div>

                  {/* Quick Income Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-gray-400 font-normal">
                      {lang === 'hi' ? 'त्वरित विकल्प:' : 'Quick choices:'}
                    </span>
                    {[
                      { val: '0', labelEn: '₹0 (No Income)', labelHi: '₹0 (कोई आय नहीं)' },
                      { val: '8000', labelEn: '₹8,000', labelHi: '₹8,000' },
                      { val: '15000', labelEn: '₹15,000', labelHi: '₹15,000' },
                      { val: '25000', labelEn: '₹25,000', labelHi: '₹25,000' },
                      { val: '50000', labelEn: '₹50,000', labelHi: '₹50,000' },
                    ].map((inc) => (
                      <button
                        key={inc.val}
                        type="button"
                        onClick={() => setCurrentValue(inc.val)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                          currentValue === inc.val
                            ? 'bg-[#059669] text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {lang === 'hi' ? inc.labelHi : inc.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* INPUT TYPE: LAND HOLDING ACRES */}
              {activeFieldName === 'landHoldingAcres' && (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                      placeholder={lang === 'hi' ? 'उदा. 2.5' : 'e.g. 2.5'}
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#E5E7EB] bg-white text-[#111827] text-base font-semibold focus:outline-hidden focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors"
                      autoFocus
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                      {lang === 'hi' ? 'एकड़' : 'Acres'}
                    </span>
                  </div>

                  {/* Quick Land Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-gray-400 font-normal">
                      {lang === 'hi' ? 'त्वरित विकल्प:' : 'Quick choices:'}
                    </span>
                    {[
                      { val: '0', labelEn: '0 (Landless)', labelHi: '0 (भूमिहीन)' },
                      { val: '1.0', labelEn: '1 Acre', labelHi: '1 एकड़' },
                      { val: '2.5', labelEn: '2.5 Acres', labelHi: '2.5 एकड़' },
                      { val: '5.0', labelEn: '5 Acres', labelHi: '5 एकड़' },
                    ].map((land) => (
                      <button
                        key={land.val}
                        type="button"
                        onClick={() => setCurrentValue(land.val)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                          currentValue === land.val
                            ? 'bg-[#059669] text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {lang === 'hi' ? land.labelHi : land.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FALLBACK INPUT (for any unmapped field) */}
              {!['gender', 'casteCategory', 'occupation', 'state', 'age', 'monthlyIncome', 'landHoldingAcres'].includes(
                activeFieldName
              ) && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder={lang === 'hi' ? 'अपना उत्तर दर्ज करें' : 'Enter your answer'}
                    className="w-full px-3.5 py-2.5 rounded-md border border-[#E5E7EB] bg-white text-[#111827] text-base font-medium focus:outline-hidden focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-colors"
                    autoFocus
                  />
                </div>
              )}
            </form>
          )}

          {/* 5. "WHY WE ASK THIS?" ACCORDION */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowWhyWeAsk(!showWhyWeAsk)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#111827] transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#059669]" />
              <span>{ui.whyWeAsk}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showWhyWeAsk ? 'rotate-180 text-[#111827]' : ''
                }`}
              />
            </button>

            {showWhyWeAsk && (
              <div className="mt-2.5 p-3 rounded-lg bg-gray-50 border border-[#E5E7EB] text-xs text-gray-600 leading-relaxed font-normal">
                {whyWeAskText}
              </div>
            )}
          </div>
        </div>

        {/* 6. BOTTOM NAVIGATION BUTTONS */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {/* Back / History button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={isBrowsingHistory ? viewingHistoryIndex === 0 : history.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{ui.back}</span>
            </button>

            {/* Start Over Button */}
            <button
              type="button"
              onClick={handleStartOver}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-gray-500 hover:text-[#111827] hover:bg-gray-100 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
              title={lang === 'hi' ? 'शुरुआत से पुनः प्रारंभ करें' : 'Reset and start questionnaire over'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{ui.startOver}</span>
            </button>
          </div>

          {/* Continue / Next / Return Button */}
          {isBrowsingHistory ? (
            <button
              type="button"
              onClick={handleForwardHistory}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md bg-[#111827] hover:bg-gray-800 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>
                {viewingHistoryIndex === history.length - 1
                  ? ui.returnToCurrent
                  : ui.continue}
              </span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={submitting || !currentValue.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md bg-[#059669] hover:bg-[#047857] text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{ui.submitting}</span>
                </>
              ) : (
                <>
                  <span>{ui.continue}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
