import type { MatchedCriterionDto } from '../types';

/**
 * Formats structured or raw rule expressions from matchedCriteria
 * into friendly human-readable checked lines showing citizen value vs requirement
 * for all 7 scheme demographic fields.
 * Supports English ('en') and Hindi ('hi').
 *
 * Operator coverage for numeric fields (AGE, MONTHLY_INCOME, LAND_HOLDING_ACRES):
 *   BETWEEN, LTE/<=, GTE/>=, LT/<, GT/>, EQ/EQUALS/=/IN
 *
 * Enum fields (STATE, OCCUPATION, CASTE_CATEGORY, GENDER) support EQ and comma-separated IN.
 */

const GENDER_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  FEMALE: { en: 'Female', hi: 'महिला' },
  MALE: { en: 'Male', hi: 'पुरुष' },
  OTHER: { en: 'Other', hi: 'अन्य' },
  ALL: { en: 'All Genders', hi: 'सभी लिंग' },
};

const OCCUPATION_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  FARMER: { en: 'Farmer', hi: 'किसान' },
  STUDENT: { en: 'Student', hi: 'छात्र/छात्रा' },
  UNEMPLOYED: { en: 'Unemployed', hi: 'बेरोजगार' },
  SALARIED: { en: 'Salaried Employee', hi: 'वेतनभोगी' },
  SELF_EMPLOYED: { en: 'Self-Employed / Business', hi: 'स्वरोजगार' },
  LABORER: { en: 'Daily Wage Laborer / Artisan', hi: 'श्रमिक / मजदूर' },
  RETIRED: { en: 'Retired / Pensioner', hi: 'सेवानिवृत्त' },
  ALL: { en: 'All Occupations', hi: 'सभी व्यवसाय' },
};

const CASTE_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  GENERAL: { en: 'General', hi: 'सामान्य' },
  OBC: { en: 'OBC', hi: 'अन्य पिछड़ा वर्ग (OBC)' },
  SC: { en: 'SC', hi: 'अनुसूचित जाति (SC)' },
  ST: { en: 'ST', hi: 'अनुसूचित जनजाति (ST)' },
  EWS: { en: 'EWS', hi: 'आर्थिक कमजोर वर्ग (EWS)' },
  ALL: { en: 'All Categories', hi: 'सभी वर्ग' },
};

/**
 * Complete state/UT translation table — synced with INDIAN_STATES in src/utils/constants.ts.
 * Keys are UPPERCASED versions of the exact strings from the questionnaire dropdown.
 */
export const STATE_TRANSLATIONS: Record<string, { en: string; hi: string }> = {
  // 28 States
  'ANDHRA PRADESH': { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' },
  'ARUNACHAL PRADESH': { en: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश' },
  'ASSAM': { en: 'Assam', hi: 'असम' },
  'BIHAR': { en: 'Bihar', hi: 'बिहार' },
  'CHHATTISGARH': { en: 'Chhattisgarh', hi: 'छत्तीसगढ़' },
  'GOA': { en: 'Goa', hi: 'गोवा' },
  'GUJARAT': { en: 'Gujarat', hi: 'गुजरात' },
  'HARYANA': { en: 'Haryana', hi: 'हरियाणा' },
  'HIMACHAL PRADESH': { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश' },
  'JHARKHAND': { en: 'Jharkhand', hi: 'झारखंड' },
  'KARNATAKA': { en: 'Karnataka', hi: 'कर्नाटक' },
  'KERALA': { en: 'Kerala', hi: 'केरल' },
  'MADHYA PRADESH': { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' },
  'MAHARASHTRA': { en: 'Maharashtra', hi: 'महाराष्ट्र' },
  'MANIPUR': { en: 'Manipur', hi: 'मणिपुर' },
  'MEGHALAYA': { en: 'Meghalaya', hi: 'मेघालय' },
  'MIZORAM': { en: 'Mizoram', hi: 'मिज़ोरम' },
  'NAGALAND': { en: 'Nagaland', hi: 'नागालैंड' },
  'ODISHA': { en: 'Odisha', hi: 'ओडिशा' },
  'PUNJAB': { en: 'Punjab', hi: 'पंजाब' },
  'RAJASTHAN': { en: 'Rajasthan', hi: 'राजस्थान' },
  'SIKKIM': { en: 'Sikkim', hi: 'सिक्किम' },
  'TAMIL NADU': { en: 'Tamil Nadu', hi: 'तमिलनाडु' },
  'TELANGANA': { en: 'Telangana', hi: 'तेलंगाना' },
  'TRIPURA': { en: 'Tripura', hi: 'त्रिपुरा' },
  'UTTAR PRADESH': { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
  'UP': { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
  'UTTARAKHAND': { en: 'Uttarakhand', hi: 'उत्तराखंड' },
  'WEST BENGAL': { en: 'West Bengal', hi: 'पश्चिम बंगाल' },
  // 8 Union Territories
  'ANDAMAN AND NICOBAR ISLANDS': { en: 'Andaman and Nicobar Islands', hi: 'अंडमान और निकोबार द्वीपसमूह' },
  'CHANDIGARH': { en: 'Chandigarh', hi: 'चंडीगढ़' },
  'DADRA AND NAGAR HAVELI AND DAMAN AND DIU': { en: 'Dadra and Nagar Haveli and Daman and Diu', hi: 'दादरा और नगर हवेली और दमन और दीव' },
  'DELHI': { en: 'Delhi', hi: 'दिल्ली' },
  'JAMMU AND KASHMIR': { en: 'Jammu and Kashmir', hi: 'जम्मू और कश्मीर' },
  'LADAKH': { en: 'Ladakh', hi: 'लद्दाख' },
  'LAKSHADWEEP': { en: 'Lakshadweep', hi: 'लक्षद्वीप' },
  'PUDUCHERRY': { en: 'Puducherry', hi: 'पुदुचेरी' },
  // Special / pan-India
  'ALL': { en: 'All States (Pan-India)', hi: 'सभी राज्य (अखिल भारतीय)' },
};

function formatCurrency(val: string): string {
  const num = parseFloat(val.replace(/,/g, ''));
  if (isNaN(num)) return val;
  return num.toLocaleString('en-IN');
}

/** Translate a single enum token against a lookup table, falling back to the raw string. */
function translateEnum(
  rawValue: string,
  table: Record<string, { en: string; hi: string }>,
  isHi: boolean,
): string {
  return rawValue
    .split(',')
    .map((s) => {
      const key = s.trim().toUpperCase();
      return table[key]
        ? (isHi ? table[key].hi : table[key].en)
        : s.trim();
    })
    .join(', ');
}

/** Normalize legacy and verbose operators to standardized tokens */
function normalizeOperator(rawOp: string): string {
  const op = rawOp.trim().toUpperCase();
  switch (op) {
    case 'LESS_THAN':
    case '<':
    case 'LT':
      return 'LT';
    case 'LESS_THAN_OR_EQUALS':
    case '<=':
    case 'LTE':
      return 'LTE';
    case 'GREATER_THAN':
    case '>':
    case 'GT':
      return 'GT';
    case 'GREATER_THAN_OR_EQUALS':
    case '>=':
    case 'GTE':
      return 'GTE';
    case 'EQUAL_TO':
    case 'EQUALS':
    case '=':
    case 'EQ':
      return 'EQ';
    default:
      return op;
  }
}

export function formatMatchedCriterion(
  criterion: MatchedCriterionDto | string,
  lang: 'en' | 'hi' = 'en'
): string {
  if (!criterion) return '';

  let field: string;
  let operator: string;
  let ruleValue: string;
  let actualValue: string | undefined;

  if (typeof criterion === 'string') {
    const parts = criterion.trim().split(/\s+/);
    if (parts.length < 3) return criterion;
    field = parts[0].toUpperCase();
    operator = normalizeOperator(parts[1]);
    ruleValue = parts.slice(2).join(' ');
    actualValue = undefined;
  } else {
    field = (criterion.field || '').toUpperCase();
    operator = normalizeOperator(criterion.operator || '');
    ruleValue = criterion.ruleValue || '';
    actualValue = criterion.actualValue;
  }

  const isHi = lang === 'hi';
  const hasActual = actualValue !== undefined && actualValue !== null && actualValue.trim() !== '';

  switch (field) {
    // ── AGE (numeric): BETWEEN, LTE, GTE, LT, GT, EQ ──
    case 'AGE': {
      let reqText = '';
      if (operator === 'BETWEEN') {
        const [min, max] = ruleValue.split(',').map((s) => s.trim());
        reqText = isHi ? `${min}-${max} वर्ष` : `${min}-${max} years`;
      } else if (operator === 'LTE') {
        reqText = isHi ? `${ruleValue} वर्ष या उससे कम` : `${ruleValue} years or younger`;
      } else if (operator === 'GTE') {
        reqText = isHi ? `${ruleValue} वर्ष या उससे अधिक` : `${ruleValue} years or older`;
      } else if (operator === 'LT') {
        reqText = isHi ? `${ruleValue} वर्ष से कम` : `Under ${ruleValue} years`;
      } else if (operator === 'GT') {
        reqText = isHi ? `${ruleValue} वर्ष से अधिक` : `Over ${ruleValue} years`;
      } else if (operator === 'EQ' || operator === 'IN') {
        reqText = isHi ? `${ruleValue} वर्ष` : `${ruleValue} years`;
      } else {
        reqText = `${operator} ${ruleValue}`;
      }

      if (hasActual) {
        return isHi
          ? `आपकी आयु: ${actualValue} — आवश्यकता: ${reqText}`
          : `Your age: ${actualValue} — Requirement: ${reqText}`;
      }
      return isHi ? `आयु आवश्यकता पूरी — ${reqText}` : `Age requirement met — ${reqText}`;
    }

    // ── STATE (enum): EQ / IN with full state/UT translation ──
    case 'STATE': {
      const reqState = translateEnum(ruleValue, STATE_TRANSLATIONS, isHi);
      if (hasActual) {
        const actualState = translateEnum(actualValue!, STATE_TRANSLATIONS, isHi);
        return isHi
          ? `आपका राज्य: ${actualState} — आवश्यकता: ${reqState}`
          : `Your state: ${actualState} — Requirement: ${reqState}`;
      }
      return isHi ? `राज्य आवश्यकता पूरी — ${reqState}` : `State requirement met — ${reqState}`;
    }

    // ── MONTHLY_INCOME (numeric): BETWEEN, LTE, GTE, LT, GT, EQ ──
    case 'MONTHLY_INCOME':
    case 'INCOME': {
      let reqText = '';
      if (operator === 'LTE') {
        reqText = isHi ? `₹${formatCurrency(ruleValue)}/माह या कम` : `Up to ₹${formatCurrency(ruleValue)}/mo`;
      } else if (operator === 'GTE') {
        reqText = isHi ? `₹${formatCurrency(ruleValue)}/माह या अधिक` : `At least ₹${formatCurrency(ruleValue)}/mo`;
      } else if (operator === 'LT') {
        reqText = isHi ? `₹${formatCurrency(ruleValue)}/माह से कम` : `Under ₹${formatCurrency(ruleValue)}/mo`;
      } else if (operator === 'GT') {
        reqText = isHi ? `₹${formatCurrency(ruleValue)}/माह से अधिक` : `Over ₹${formatCurrency(ruleValue)}/mo`;
      } else if (operator === 'BETWEEN') {
        const [min, max] = ruleValue.split(',').map((s) => s.trim());
        reqText = isHi ? `₹${formatCurrency(min)} से ₹${formatCurrency(max)}/माह` : `₹${formatCurrency(min)} to ₹${formatCurrency(max)}/mo`;
      } else if (operator === 'EQ' || operator === 'IN') {
        reqText = isHi ? `₹${formatCurrency(ruleValue)}/माह` : `₹${formatCurrency(ruleValue)}/mo`;
      } else {
        reqText = `${operator} ₹${formatCurrency(ruleValue)}`;
      }

      if (hasActual) {
        return isHi
          ? `आपकी मासिक आय: ₹${formatCurrency(actualValue!)} — आवश्यकता: ${reqText}`
          : `Your monthly income: ₹${formatCurrency(actualValue!)} — Requirement: ${reqText}`;
      }
      return isHi ? `मासिक आय आवश्यकता पूरी — ${reqText}` : `Monthly income requirement met — ${reqText}`;
    }

    // ── OCCUPATION (enum): EQ / IN with translation ──
    case 'OCCUPATION': {
      const reqOcc = translateEnum(ruleValue, OCCUPATION_TRANSLATIONS, isHi);
      if (hasActual) {
        const actualOcc = translateEnum(actualValue!, OCCUPATION_TRANSLATIONS, isHi);
        return isHi
          ? `आपका व्यवसाय: ${actualOcc} — आवश्यकता: ${reqOcc}`
          : `Your occupation: ${actualOcc} — Requirement: ${reqOcc}`;
      }
      return isHi ? `व्यवसाय आवश्यकता पूरी — ${reqOcc}` : `Occupation requirement met — ${reqOcc}`;
    }

    // ── CASTE_CATEGORY (enum): EQ / IN with translation ──
    case 'CASTE_CATEGORY':
    case 'CASTE': {
      const reqCaste = translateEnum(ruleValue, CASTE_TRANSLATIONS, isHi);
      if (hasActual) {
        const actualCaste = translateEnum(actualValue!, CASTE_TRANSLATIONS, isHi);
        return isHi
          ? `आपकी श्रेणी: ${actualCaste} — आवश्यकता: ${reqCaste}`
          : `Your category: ${actualCaste} — Requirement: ${reqCaste}`;
      }
      return isHi ? `श्रेणी आवश्यकता पूरी — ${reqCaste}` : `Category requirement met — ${reqCaste}`;
    }

    // ── GENDER (enum): EQ / IN with translation ──
    case 'GENDER': {
      const reqGender = translateEnum(ruleValue, GENDER_TRANSLATIONS, isHi);
      if (hasActual) {
        const actualGender = translateEnum(actualValue!, GENDER_TRANSLATIONS, isHi);
        return isHi
          ? `आपका लिंग: ${actualGender} — आवश्यकता: ${reqGender}`
          : `Your gender: ${actualGender} — Requirement: ${reqGender}`;
      }
      return isHi ? `लिंग आवश्यकता पूरी — ${reqGender}` : `Gender requirement met — ${reqGender}`;
    }

    // ── LAND_HOLDING_ACRES (numeric): BETWEEN, LTE, GTE, LT, GT, EQ ──
    case 'LAND_HOLDING_ACRES':
    case 'LAND_HOLDING': {
      let reqText = '';
      if (operator === 'LTE') {
        reqText = isHi ? `${ruleValue} एकड़ या कम` : `Up to ${ruleValue} acres`;
      } else if (operator === 'GTE') {
        reqText = isHi ? `${ruleValue} एकड़ या अधिक` : `At least ${ruleValue} acres`;
      } else if (operator === 'LT') {
        reqText = isHi ? `${ruleValue} एकड़ से कम` : `Under ${ruleValue} acres`;
      } else if (operator === 'GT') {
        reqText = isHi ? `${ruleValue} एकड़ से अधिक` : `Over ${ruleValue} acres`;
      } else if (operator === 'BETWEEN') {
        const [min, max] = ruleValue.split(',').map((s) => s.trim());
        reqText = isHi ? `${min} से ${max} एकड़` : `${min} to ${max} acres`;
      } else if (operator === 'EQ' || operator === 'IN') {
        reqText = isHi ? `${ruleValue} एकड़` : `${ruleValue} acres`;
      } else {
        reqText = `${operator} ${ruleValue}`;
      }

      if (hasActual) {
        return isHi
          ? `आपकी भूमि: ${actualValue} एकड़ — आवश्यकता: ${reqText}`
          : `Your land holding: ${actualValue} acres — Requirement: ${reqText}`;
      }
      return isHi ? `भूमि जोत आवश्यकता पूरी — ${reqText}` : `Land holding requirement met — ${reqText}`;
    }
  }

  // Fallback for custom or unrecognized criteria
  const friendlyField = field.replace(/_/g, ' ').toLowerCase();
  if (hasActual) {
    return isHi
      ? `${friendlyField}: ${actualValue} — आवश्यकता: ${operator} ${ruleValue}`
      : `Your ${friendlyField}: ${actualValue} — Requirement: ${operator} ${ruleValue}`;
  }
  return isHi
    ? `${friendlyField} मानदंड सत्यापित — ${operator} ${ruleValue}`
    : `${friendlyField.charAt(0).toUpperCase() + friendlyField.slice(1)} criterion met — ${operator} ${ruleValue}`;
}
