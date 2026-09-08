export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export interface QuestionMetadata {
  fieldName: string;
  whyWeAskEn: string;
  whyWeAskHi: string;
}

export const QUESTION_METADATA: Record<string, QuestionMetadata> = {
  age: {
    fieldName: 'age',
    whyWeAskEn:
      'Age determines eligibility for youth, student scholarships, working-age employment programs, or senior citizen pensions.',
    whyWeAskHi:
      'आयु यह निर्धारित करती है कि आप युवा छात्रवृत्ति, कार्यशील आयु रोजगार कार्यक्रम, या वरिष्ठ नागरिक पेंशन के लिए पात्र हैं।',
  },
  gender: {
    fieldName: 'gender',
    whyWeAskEn:
      'Several welfare schemes, such as women empowerment initiatives and girl child education grants, are gender-specific.',
    whyWeAskHi:
      'महिला सशक्तिकरण और बालिकाओं की शिक्षा से जुड़ी कई योजनाएं लिंग-विशिष्ट लाभ प्रदान करती हैं।',
  },
  state: {
    fieldName: 'state',
    whyWeAskEn:
      'State residency determines your eligibility for state-funded welfare schemes alongside national central schemes.',
    whyWeAskHi:
      'राज्य निवास यह तय करता है कि आप राष्ट्रीय केंद्रीय योजनाओं के साथ-साथ किन राज्य-विशिष्ट कल्याणकारी योजनाओं के पात्र हैं।',
  },
  casteCategory: {
    fieldName: 'casteCategory',
    whyWeAskEn:
      'Certain welfare schemes and scholarships provide specific financial allocations or fee exemptions for designated social categories.',
    whyWeAskHi:
      'कुछ कल्याणकारी योजनाएं और छात्रवृत्तियां आरक्षित सामाजिक श्रेणियों के लिए विशिष्ट वित्तीय सहायता या शुल्क छूट प्रदान करती हैं।',
  },
  occupation: {
    fieldName: 'occupation',
    whyWeAskEn:
      'Occupation enables matching with professional welfare programs such as PM-KISAN for farmers, scholarships for students, or artisan loans.',
    whyWeAskHi:
      'व्यवसाय से किसानों (पीएम-किसान), छात्रों (छात्रवृत्ति), या कारीगरों और श्रमिकों के लिए लक्षित योजनाओं की पहचान होती है।',
  },
  monthlyIncome: {
    fieldName: 'monthlyIncome',
    whyWeAskEn:
      'Income ceilings are used to determine eligibility for subsidized welfare programs, BPL benefits, and financial aid grants.',
    whyWeAskHi:
      'आय सीमा का उपयोग सब्सिडी युक्त कल्याणकारी कार्यक्रमों, बीपीएल लाभों और वित्तीय सहायता अनुदान की पात्रता के लिए किया जाता है।',
  },
  landHoldingAcres: {
    fieldName: 'landHoldingAcres',
    whyWeAskEn:
      'Agricultural schemes like PM-KISAN require verification of small or marginal landholding limits (e.g. up to 2 hectares / 5 acres).',
    whyWeAskHi:
      'पीएम-किसान जैसी कृषि योजनाएं छोटे या सीमांत भूमि धारकों (उदा. 5 एकड़ तक) के लिए पात्रता सत्यापित करती हैं।',
  },
};
