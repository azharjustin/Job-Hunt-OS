const PREFIX = 'jhos_';

export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },

  clear(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};

export const STORAGE_KEYS = {
  applications: 'applications',
  companies: 'companies',
  interviews: 'interviews',
  resumes: 'resumes',
  followUps: 'followUps',
  questions: 'questions',
  settings: 'settings',
  timeline: 'timeline',
} as const;
