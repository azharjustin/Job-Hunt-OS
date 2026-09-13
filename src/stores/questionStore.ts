import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../lib/storage';
import { generateId, now } from '../lib/utils';
import { api, getToken } from '../services/api';
import type { InterviewQuestion } from '../types';

interface QuestionStore {
  questions: InterviewQuestion[];
  load: () => Promise<void>;
  add: (q: Omit<InterviewQuestion, 'id' | 'createdAt'>) => InterviewQuestion;
  update: (id: string, updates: Partial<InterviewQuestion>) => void;
  remove: (id: string) => void;
  getByApplication: (applicationId: string) => InterviewQuestion[];
  togglePrepared: (id: string) => void;
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],

  load: async () => {
    if (getToken()) {
      try {
        const data = await api.getQuestions();
        set({ questions: data });
        return;
      } catch (e) {
        console.warn('API load questions failed:', e);
      }
    }
    const data = storage.get<InterviewQuestion[]>(STORAGE_KEYS.questions) ?? [];
    set({ questions: data });
  },

  add: (qData) => {
    const question: InterviewQuestion = {
      ...qData,
      id: generateId(),
      createdAt: now(),
    };
    set((s) => {
      const updated = [...s.questions, question];
      storage.set(STORAGE_KEYS.questions, updated);
      return { questions: updated };
    });

    if (getToken()) {
      api.createQuestion(qData)
        .then((created: InterviewQuestion) => {
          set((s) => ({
            questions: s.questions.map((q) => (q.id === question.id ? created : q)),
          }));
        })
        .catch((e) => console.warn('API create question error:', e));
    }

    return question;
  },

  update: (id, updates) => {
    set((s) => {
      const updated = s.questions.map((q) => (q.id === id ? { ...q, ...updates } : q));
      storage.set(STORAGE_KEYS.questions, updated);
      return { questions: updated };
    });

    if (getToken()) {
      api.updateQuestion(id, updates).catch((e) => console.warn('API update question error:', e));
    }
  },

  remove: (id) => {
    set((s) => {
      const updated = s.questions.filter((q) => q.id !== id);
      storage.set(STORAGE_KEYS.questions, updated);
      return { questions: updated };
    });

    if (getToken()) {
      api.deleteQuestion(id).catch((e) => console.warn('API delete question error:', e));
    }
  },

  getByApplication: (applicationId) =>
    get().questions.filter((q) => q.applicationId === applicationId),

  togglePrepared: (id) => {
    const q = get().questions.find((q) => q.id === id);
    if (q) get().update(id, { prepared: !q.prepared });
  },
}));
