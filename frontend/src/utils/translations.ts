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
  eligibleBanner: string;
  tabOverview: string;
  tabEligibility: string;
  tabHowToApply: string;
  tabDetails: string;
  noResultsTitle: string;
  startQuestionnairePrompt: string;
  startOver: string;
  viewingHistory: string;
  returnToCurrent: string;
  submitting: string;
  requiredField: string;
  matchedSchemesCount: string;
  retakeQuestionnaire: string;
  criteriaMatched: string;
  whyEligible: string;
  noSchemesFoundDesc: string;
  viewDetailsAndApply: string;
  officialPortal: string;
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
    applyNow: 'Apply Now',
    eligibleBanner: 'You appear to be eligible',
    tabOverview: 'Overview',
    tabEligibility: 'Eligibility',
    tabHowToApply: 'How to Apply',
    tabDetails: 'Details',
    noResultsTitle: 'No Matching Schemes Found',
    startQuestionnairePrompt: 'Please complete the questionnaire first to find matching schemes.',
    startOver: 'Start Over',
    viewingHistory: 'Viewing Past Answer (Read-Only)',
    returnToCurrent: 'Return to Active Question',
    submitting: 'Submitting...',
    requiredField: 'Please provide an answer before continuing',
    matchedSchemesCount: '{count} Matching Schemes Found',
    retakeQuestionnaire: 'Retake Questionnaire',
    criteriaMatched: 'Matched Criteria',
    whyEligible: 'Why You Qualify',
    noSchemesFoundDesc: 'No government schemes currently match all criteria for this specific profile combination. You can adjust your answers or retake the questionnaire.',
    viewDetailsAndApply: 'View Details & Apply',
    officialPortal: 'Official Portal',
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
    applyNow: 'आवेदन करें',
    eligibleBanner: 'आप इस योजना के लिए पात्र प्रतीत होते हैं',
    tabOverview: 'अवलोकन',
    tabEligibility: 'पात्रता',
    tabHowToApply: 'आवेदन प्रक्रिया',
    tabDetails: 'विवरण',
    noResultsTitle: 'कोई मेल खाती योजना नहीं मिली',
    startQuestionnairePrompt: 'कृपया मेल खाती योजनाओं को खोजने के लिए पहले प्रश्नावली पूरी करें।',
    startOver: 'पुनः प्रारंभ करें',
    viewingHistory: 'पिछला उत्तर देखा जा रहा है (केवल पढ़ने योग्य)',
    returnToCurrent: 'सक्रिय प्रश्न पर लौटें',
    submitting: 'जमा किया जा रहा है...',
    requiredField: 'आगे बढ़ने से पहले कृपया उत्तर प्रदान करें',
    matchedSchemesCount: '{count} मेल खाती योजनाएं मिलीं',
    retakeQuestionnaire: 'प्रश्नावली दोबारा भरें',
    criteriaMatched: 'सत्यापित मानदंड',
    whyEligible: 'पात्रता का कारण',
    noSchemesFoundDesc: 'वर्तमान में इस प्रोफ़ाइल संयोजन के सभी मानदंडों से मेल खाने वाली कोई सरकारी योजना नहीं मिली। आप अपने उत्तर समायोजित कर सकते हैं।',
    viewDetailsAndApply: 'विवरण देखें और आवेदन करें',
    officialPortal: 'आधिकारिक पोर्टल',
  },
};
