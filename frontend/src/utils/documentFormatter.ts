import type { Language } from '../types';

/**
 * Common Indian government document translations to Hindi.
 */
const COMMON_DOCUMENT_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  'class 12 marksheet': { en: 'Class 12 Marksheet', hi: '12वीं कक्षा की अंकतालिका / मार्कशीट' },
  '12th marksheet': { en: 'Class 12 Marksheet', hi: '12वीं कक्षा की अंकतालिका / मार्कशीट' },
  'class 10 marksheet': { en: 'Class 10 Marksheet', hi: '10वीं कक्षा की अंकतालिका / मार्कशीट' },
  '10th marksheet': { en: 'Class 10 Marksheet', hi: '10वीं कक्षा की अंकतालिका / मार्कशीट' },
  'income certificate': { en: 'Income Certificate', hi: 'आय प्रमाण पत्र' },
  'caste certificate': { en: 'Caste Certificate', hi: 'जाति प्रमाण पत्र' },
  'bank passbook': { en: 'Bank Passbook / Account Details', hi: 'बैंक पासबुक / बैंक खाता विवरण' },
  'bank account': { en: 'Bank Account Details', hi: 'बैंक खाता विवरण' },
  'bank passbook copy': { en: 'Bank Passbook Copy', hi: 'बैंक पासबुक की प्रति' },
  'aadhaar card': { en: 'Aadhaar Card', hi: 'आधार कार्ड' },
  'aadhaar': { en: 'Aadhaar Card', hi: 'आधार कार्ड' },
  'domicile certificate': { en: 'Domicile / Residence Certificate', hi: 'निवास / अधिवास प्रमाण पत्र' },
  'residence certificate': { en: 'Residence Certificate', hi: 'निवास प्रमाण पत्र' },
  'ration card': { en: 'Ration Card', hi: 'राशन कार्ड' },
  'land ownership document': { en: 'Land Ownership Document / RoR', hi: 'भूमि स्वामित्व दस्तावेज़ / खतौनी' },
  'land records': { en: 'Land Records / Khasra-Khatauni', hi: 'भूमि रिकॉर्ड / खसरा-खतौनी' },
  'khasra khatauni': { en: 'Khasra Khatauni', hi: 'खसरा खतौनी' },
  'passport size photograph': { en: 'Passport Size Photograph', hi: 'पासपोर्ट साइज फोटो' },
  'passport size photo': { en: 'Passport Size Photo', hi: 'पासपोर्ट साइज फोटो' },
  'age proof': { en: 'Age Proof (Birth Certificate / School Certificate)', hi: 'आयु प्रमाण पत्र (जन्म प्रमाण पत्र)' },
  'birth certificate': { en: 'Birth Certificate', hi: 'जन्म प्रमाण पत्र' },
  'disability certificate': { en: 'Disability Certificate', hi: 'दिव्यांगता प्रमाण पत्र' },
  'bpl card': { en: 'BPL Card', hi: 'बीपीएल कार्ड' },
  'voter id': { en: 'Voter ID Card', hi: 'मतदाता पहचान पत्र (वोटर आईडी)' },
  'pan card': { en: 'PAN Card', hi: 'पैन कार्ड' },
  'farmer registration certificate': { en: 'Farmer Registration Certificate', hi: 'किसान पंजीकरण प्रमाण पत्र' },
};

/**
 * Translates and formats document names according to the selected language.
 */
export function formatDocumentName(doc: string, lang: Language = 'en'): string {
  if (!doc) return '';
  if (lang === 'en') return doc;

  const normalized = doc.trim().toLowerCase();
  if (COMMON_DOCUMENT_TRANSLATIONS[normalized]) {
    return COMMON_DOCUMENT_TRANSLATIONS[normalized].hi;
  }

  // Look for partial substring match
  for (const [key, val] of Object.entries(COMMON_DOCUMENT_TRANSLATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return val.hi;
    }
  }

  return doc;
}
