export type Language = 'en' | 'hi';

export interface QuestionDto {
  id: number;
  fieldName: string;
  text: string;
  textHi: string;
}

export interface ExplanationDto {
  reasoning: string;
  applicationSteps: string[];
  usedFallback: boolean;
}

export interface MatchedSchemeDto {
  schemeId: number;
  schemeName: string;
  description?: string;
  category: string;
  issuingBody: string;
  sourceUrl: string;
  applicationProcess?: string;
  matchedCriteria: string[];
  explanation: ExplanationDto;
  translationAvailable: boolean;
}

export interface QuestionnaireStartResponse {
  sessionId: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  question: QuestionDto | null;
}

export interface QuestionnaireAnswerResponse {
  sessionId: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  question?: QuestionDto | null;
  results?: MatchedSchemeDto[];
}

export interface AnswerHistoryItem {
  questionNumber: number;
  fieldName: string;
  value: string;
  question: QuestionDto;
}
