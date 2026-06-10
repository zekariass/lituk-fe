import api from './client';
import { ApiResponse, FlaggedQuestionResponse, Explanation, Tip } from '@/lib/types';

export interface GetFlaggedQuestionsParams {
  categoryId?: number;
  page?: number;
  size?: number;
}

export async function getFlaggedQuestions(params: GetFlaggedQuestionsParams = {}) {
  const { page = 0, size = 20, categoryId } = params;
  
  try {
    const response = await api.get<any>('/api/v1/flags', {
      params: {
        page,
        size,
        ...(categoryId && { categoryId }),
      },
    });
    
    // Backend returns paginated response: { success, data: { content: [], page: {} } }
    const content = response.data?.data?.content;
    
    // Ensure we always return an array
    return Array.isArray(content) ? content : [];
  } catch (error) {
    console.error('Error fetching flagged questions:', error);
    return [];
  }
}

export async function deleteFlag(questionId: number) {
  const response = await api.delete<ApiResponse<void>>(`/api/v1/flags/${questionId}`);
  return response.data;
}

export async function getExplanation(questionId: number) {
  const response = await api.get<ApiResponse<Explanation>>(`/api/v1/questions/${questionId}/explanation`);
  return response.data.data;
}

export async function getTips(questionId: number) {
  const response = await api.get<ApiResponse<Tip[]>>(`/api/v1/questions/${questionId}/tips`);
  return response.data.data || [];
}
