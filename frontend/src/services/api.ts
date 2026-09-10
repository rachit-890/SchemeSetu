import type { Language, QuestionnaireStartResponse, QuestionnaireAnswerResponse, MatchedSchemeDto } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = {
  async startQuestionnaire(lang: Language): Promise<QuestionnaireStartResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/questionnaire/start?lang=${lang}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errBody: any;
      try {
        errBody = await response.json();
      } catch {
        errBody = { error: response.statusText };
      }
      throw new ApiError(errBody.error || 'Failed to start questionnaire session', response.status, errBody);
    }

    return response.json();
  },

  async submitAnswer(
    sessionId: number,
    fieldName: string,
    value: string,
    lang: Language
  ): Promise<QuestionnaireAnswerResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/questionnaire/${sessionId}/answer?lang=${lang}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fieldName, value }),
    });

    if (!response.ok) {
      let errBody: any;
      try {
        errBody = await response.json();
      } catch {
        errBody = { error: response.statusText };
      }
      throw new ApiError(errBody.error || 'Failed to submit answer', response.status, errBody);
    }

    return response.json();
  },

  async matchSchemesDirect(
    params: {
      age?: number;
      monthlyIncome?: number;
      state?: string;
      casteCategory?: string;
      occupation?: string;
      gender?: string;
      landHoldingAcres?: number;
      lang?: Language;
    }
  ): Promise<MatchedSchemeDto[]> {
    const query = new URLSearchParams();
    if (params.age !== undefined) query.append('age', params.age.toString());
    if (params.monthlyIncome !== undefined) query.append('monthlyIncome', params.monthlyIncome.toString());
    if (params.state) query.append('state', params.state);
    if (params.casteCategory) query.append('casteCategory', params.casteCategory);
    if (params.occupation) query.append('occupation', params.occupation);
    if (params.gender) query.append('gender', params.gender);
    if (params.landHoldingAcres !== undefined) query.append('landHoldingAcres', params.landHoldingAcres.toString());
    if (params.lang) query.append('lang', params.lang);

    const response = await fetch(`${API_BASE_URL}/api/v1/schemes/match?${query.toString()}`);
    if (!response.ok) {
      throw new ApiError('Failed to fetch matched schemes', response.status);
    }
    return response.json();
  },
};
