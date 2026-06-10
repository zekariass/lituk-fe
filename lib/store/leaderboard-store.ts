import { create } from 'zustand';
import { LeaderboardEntry, ApiResponse } from '@/lib/types';
import api from '@/lib/api/client';

type LeaderboardPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  currentUserRank: LeaderboardEntry | null;
  period: LeaderboardPeriod;
  isLoading: boolean;
  error: string | null;
  
  fetchLeaderboard: (period: LeaderboardPeriod, jurisdictionId?: number) => Promise<void>;
  setPeriod: (period: LeaderboardPeriod) => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  currentUserRank: null,
  period: 'WEEKLY',
  isLoading: false,
  error: null,

  fetchLeaderboard: async (period: LeaderboardPeriod, jurisdictionId?: number) => {
    set({ isLoading: true, error: null, period });
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (jurisdictionId) params.append('jurisdictionId', jurisdictionId.toString());

      const response = await api.get<ApiResponse<LeaderboardEntry[]>>(
        `/api/v1/leaderboard?${params.toString()}`
      );

      const entries = response.data.data;
      const currentUserRank = entries.find(entry => entry.isCurrentUser) || null;

      set({ 
        entries,
        currentUserRank,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch leaderboard',
        isLoading: false 
      });
      throw error;
    }
  },

  setPeriod: (period: LeaderboardPeriod) => {
    set({ period });
  },
}));
