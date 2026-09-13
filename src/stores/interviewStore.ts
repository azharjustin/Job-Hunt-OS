import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../lib/storage';
import { generateId, now } from '../lib/utils';
import { api, getToken } from '../services/api';
import type { Interview } from '../types';

interface InterviewStore {
  interviews: Interview[];
  load: () => Promise<void>;
  add: (interview: Omit<Interview, 'id' | 'createdAt'>) => Interview;
  update: (id: string, updates: Partial<Interview>) => void;
  remove: (id: string) => void;
  getByApplication: (applicationId: string) => Interview[];
  getUpcoming: () => Interview[];
}

export const useInterviewStore = create<InterviewStore>((set, get) => ({
  interviews: [],

  load: async () => {
    if (getToken()) {
      try {
        const data = await api.getInterviews();
        set({ interviews: data });
        return;
      } catch (e) {
        console.warn('API load interviews failed:', e);
      }
    }
    const data = storage.get<Interview[]>(STORAGE_KEYS.interviews) ?? [];
    set({ interviews: data });
  },

  add: (interviewData) => {
    const interview: Interview = {
      ...interviewData,
      id: generateId(),
      createdAt: now(),
    };
    set((s) => {
      const updated = [...s.interviews, interview];
      storage.set(STORAGE_KEYS.interviews, updated);
      return { interviews: updated };
    });

    if (getToken()) {
      api.createInterview(interviewData)
        .then((created: Interview) => {
          set((s) => ({
            interviews: s.interviews.map((i) => (i.id === interview.id ? created : i)),
          }));
        })
        .catch((e) => console.warn('API create interview error:', e));
    }

    return interview;
  },

  update: (id, updates) => {
    set((s) => {
      const updated = s.interviews.map((i) => (i.id === id ? { ...i, ...updates } : i));
      storage.set(STORAGE_KEYS.interviews, updated);
      return { interviews: updated };
    });

    if (getToken()) {
      api.updateInterview(id, updates).catch((e) => console.warn('API update interview error:', e));
    }
  },

  remove: (id) => {
    set((s) => {
      const updated = s.interviews.filter((i) => i.id !== id);
      storage.set(STORAGE_KEYS.interviews, updated);
      return { interviews: updated };
    });

    if (getToken()) {
      api.deleteInterview(id).catch((e) => console.warn('API delete interview error:', e));
    }
  },

  getByApplication: (applicationId) =>
    get().interviews.filter((i) => i.applicationId === applicationId),

  getUpcoming: () => {
    const nowTime = Date.now();
    return get()
      .interviews.filter((i) => i.status === 'scheduled' && new Date(i.dateTime).getTime() > nowTime)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  },
}));
