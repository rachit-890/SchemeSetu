import type { Language } from '../types';

export interface UiLabels {
  appName: string;
  tagline: string;
  navHome: string;
  navSchemes: string;
  navAbout: string;
  navFaqs: string;
  ctaCheckEligibility: string;
  getStarted: string;
  learnMore: string;
  footerTagline: string;
  footerPlatform: string;
  footerResources: string;
  footerLegal: string;
  footerCopyright: string;
  trustMultiLanguage: string;
  trustEasyToUse: string;
  trustFastMatching: string;
  trustGovDirect: string;
  back: string;
  continue: string;
  questionProgress: string;
  whyWeAsk: string;
  viewDetails: string;
  applyNow: string;
  applyOfficialPortal: string;
  eligibleBanner: string;
  finalEligibilityDisclaimer: string;
  tabOverview: string;
  tabEligibility: string;
  tabHowToApply: string;
  tabDetails: string;
  noResultsTitle: string;
  startQuestionnairePrompt: string;
  preQuestionnaireTitle: string;
  preQuestionnaireDesc: string;
  checkMyEligibility: string;
  zeroMatchesTitle: string;
  zeroMatchesDesc: string;
  startOver: string;
  viewingHistory: string;
  returnToCurrent: string;
  submitting: string;
  requiredField: string;
  matchedSchemesCount: string;
  matchedSchemesCountSingular: string;
  matchedSchemesCountPlural: string;
  retakeQuestionnaire: string;
  criteriaMatched: string;
  whyEligible: string;
  whyEligibleSubtitle: string;
  noSchemesFoundDesc: string;
  viewDetailsAndApply: string;
  officialPortal: string;
  eligibilityMatching: string;
  opensOfficialWebsite: string;
  requiredDocuments: string;
  requiredDocumentsSubtitle: string;
  noDocumentsRequired: string;
}

export const UI_TRANSLATIONS: Record<Language, UiLabels> = {
  en: {
    appName: 'SchemeSetu',
    tagline: 'Bridging Citizens to Government Schemes',
    navHome: 'Home',
    navSchemes: 'Schemes',
    navAbout: 'About',
    navFaqs: 'FAQs',
    ctaCheckEligibility: 'Check Eligibility',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    footerTagline: 'AI-assisted welfare scheme discovery and eligibility matching for Indian citizens.',
    footerPlatform: 'Platform',
    footerResources: 'Resources',
    footerLegal: 'Legal & Contact',
    footerCopyright: '© 2026 SchemeSetu. Built for citizen empowerment.',
    trustMultiLanguage: 'English & Hindi',
    trustEasyToUse: '7 Quick Questions',
    trustFastMatching: 'Instant AI Matching',
    trustGovDirect: 'Direct Portal Links',
    back: 'Back',
    continue: 'Continue',
    questionProgress: 'Question {current} of 7',
    whyWeAsk: 'Why we ask this?',
    viewDetails: 'View Details',
    applyNow: 'Apply on Official Portal',
    applyOfficialPortal: 'Apply on Official Portal',
    eligibleBanner: 'You appear eligible',
    finalEligibilityDisclaimer: 'Final eligibility is determined by the official scheme authority.',
    tabOverview: 'Overview',
    tabEligibility: 'Eligibility',
    tabHowToApply: 'How to Apply',
    tabDetails: 'Details',
    noResultsTitle: 'No Matching Schemes Found',
    startQuestionnairePrompt: 'Please complete the questionnaire first to find matching schemes.',
    preQuestionnaireTitle: 'Find schemes matched to you',
    preQuestionnaireDesc: "Tell us a little about yourself and we'll check your eligibility across verified government schemes.",
    checkMyEligibility: 'Check My Eligibility',
    zeroMatchesTitle: 'No schemes matched your profile',
    zeroMatchesDesc: "We couldn't find schemes matching the information you provided.",
    startOver: 'Start Over',
    viewingHistory: 'Viewing Past Answer (Read-Only)',
    returnToCurrent: 'Return to Active Question',
    submitting: 'Submitting...',
    requiredField: 'Please provide an answer before continuing',
    matchedSchemesCount: '{count} Matching Schemes Found',
    matchedSchemesCountSingular: '1 Matching Scheme Found',
    matchedSchemesCountPlural: '{count} Matching Schemes Found',
    retakeQuestionnaire: 'Retake Questionnaire',
    criteriaMatched: 'Matched Criteria',
    whyEligible: 'Why this scheme matches you',
    whyEligibleSubtitle: 'Verified profile and demographic criteria',
    noSchemesFoundDesc: 'No government schemes currently match all criteria for this specific profile combination. You can adjust your answers or retake the questionnaire.',
    viewDetailsAndApply: 'View Details & Apply',
    officialPortal: 'Official Portal',
    eligibilityMatching: 'Eligibility Matching',
    opensOfficialWebsite: 'Opens the official government website.',
    requiredDocuments: 'Required Documents',
    requiredDocumentsSubtitle: 'Keep these documents ready before starting your application',
    noDocumentsRequired: 'No specific documents explicitly listed. Please verify on the official portal.',
  },
  hi: {
    appName: 'स्कीमसेतु',
    tagline: 'नागरिकों को सरकारी योजनाओं से जोड़ना',
    navHome: 'होम',
    navSchemes: 'योजनाएं',
    navAbout: 'हमारे बारे में',
    navFaqs: 'सामान्य प्रश्न',
    ctaCheckEligibility: 'पात्रता जांचें',
    getStarted: 'शुरू करें',
    learnMore: 'अधिक जानें',
    footerTagline: 'भारतीय नागरिकों के लिए एआई-संचालित कल्याणकारी योजना खोज और पात्रता प्रणाली।',
    footerPlatform: 'प्लेटफ़ॉर्म',
    footerResources: 'संसाधन',
    footerLegal: 'कानूनी और संपर्क',
    footerCopyright: '© 2026 स्कीमसेतु। नागरिक सशक्तिकरण के लिए निर्मित।',
    trustMultiLanguage: 'अंग्रेजी और हिन्दी',
    trustEasyToUse: '7 आसान प्रश्न',
    trustFastMatching: 'त्वरित एआई मिलान',
    trustGovDirect: 'आधिकारिक पोर्टल लिंक',
    back: 'वापस',
    continue: 'आगे बढ़ें',
    questionProgress: 'प्रश्न {current} / 7',
    whyWeAsk: 'हम यह क्यों पूछते हैं?',
    viewDetails: 'विवरण देखें',
    applyNow: 'आधिकारिक पोर्टल पर आवेदन करें',
    applyOfficialPortal: 'आधिकारिक पोर्टल पर आवेदन करें',
    eligibleBanner: 'आप पात्र प्रतीत होते हैं',
    finalEligibilityDisclaimer: 'अंतिम पात्रता आधिकारिक योजना प्राधिकरण द्वारा निर्धारित की जाती है।',
    tabOverview: 'अवलोकन',
    tabEligibility: 'पात्रता',
    tabHowToApply: 'आवेदन प्रक्रिया',
    tabDetails: 'विवरण',
    noResultsTitle: 'कोई मेल खाती योजना नहीं मिली',
    startQuestionnairePrompt: 'कृपया मेल खाती योजनाओं को खोजने के लिए पहले प्रश्नावली पूरी करें।',
    preQuestionnaireTitle: 'अपने लिए उपयुक्त योजनाएं खोजें',
    preQuestionnaireDesc: 'हमें अपने बारे में थोड़ी जानकारी दें और हम सत्यापित सरकारी योजनाओं में आपकी पात्रता की जांच करेंगे।',
    checkMyEligibility: 'मेरी पात्रता जांचें',
    zeroMatchesTitle: 'आपकी प्रोफ़ाइल से कोई योजना मेल नहीं खाई',
    zeroMatchesDesc: 'आपके द्वारा प्रदान की गई जानकारी से मेल खाने वाली कोई सरकारी योजना नहीं मिली।',
    startOver: 'पुनः प्रारंभ करें',
    viewingHistory: 'पिछला उत्तर देखा जा रहा है (केवल पढ़ने योग्य)',
    returnToCurrent: 'सक्रिय प्रश्न पर लौटें',
    submitting: 'जमा किया जा रहा है...',
    requiredField: 'आगे बढ़ने से पहले कृपया उत्तर प्रदान करें',
    matchedSchemesCount: '{count} मेल खाती योजनाएं मिलीं',
    matchedSchemesCountSingular: '1 मेल खाती योजना मिली',
    matchedSchemesCountPlural: '{count} मेल खाती योजनाएं मिलीं',
    retakeQuestionnaire: 'प्रश्नावली दोबारा भरें',
    criteriaMatched: 'सत्यापित मानदंड',
    whyEligible: 'यह योजना आपके लिए क्यों उपयुक्त है',
    whyEligibleSubtitle: 'सत्यापित प्रोफ़ाइल और जनसांख्यिकीय मानदंड',
    noSchemesFoundDesc: 'वर्तमान में इस प्रोफ़ाइल संयोजन के सभी मानदंडों से मेल खाने वाली कोई सरकारी योजना नहीं मिली। आप अपने उत्तर समायोजित कर सकते हैं।',
    viewDetailsAndApply: 'विवरण देखें और आवेदन करें',
    officialPortal: 'आधिकारिक पोर्टल',
    eligibilityMatching: 'पात्रता मिलान',
    opensOfficialWebsite: 'यह आधिकारिक सरकारी वेबसाइट पर खुलेगा।',
    requiredDocuments: 'आवश्यक दस्तावेज़',
    requiredDocumentsSubtitle: 'आवेदन शुरू करने से पहले इन दस्तावेज़ों को तैयार रखें',
    noDocumentsRequired: 'कोई विशिष्ट दस्तावेज़ सूचीबद्ध नहीं हैं। कृपया आधिकारिक पोर्टल पर विवरण देखें।',
  },
};

/** Format singular/plural schemes count headline in English and Hindi */
export function formatMatchedSchemesCount(count: number, lang: Language): string {
  if (count === 1) {
    return lang === 'hi' ? '1 मेल खाती योजना मिली' : '1 Matching Scheme Found';
  }
  return lang === 'hi'
    ? `${count} मेल खाती योजनाएं मिलीं`
    : `${count} Matching Schemes Found`;
}

/** Format dynamic "Why this scheme matches you (X criteria met)" heading in English and Hindi */
export function formatWhySchemeMatchesYou(criteriaCount: number, lang: Language): string {
  if (lang === 'hi') {
    if (criteriaCount === 0) return 'यह योजना आपके लिए क्यों उपयुक्त है';
    if (criteriaCount === 1) return 'यह योजना आपके लिए क्यों उपयुक्त है (1 मानदंड पूरा)';
    return `यह योजना आपके लिए क्यों उपयुक्त है (${criteriaCount} मानदंड पूरे)`;
  }
  if (criteriaCount === 0) return 'Why this scheme matches you';
  if (criteriaCount === 1) return 'Why this scheme matches you (1 criterion met)';
  return `Why this scheme matches you (${criteriaCount} criteria met)`;
}
