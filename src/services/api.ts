const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

const TOKEN_KEY = 'jhos_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    if (!payload.exp) return false;
    // Check if token expires within 5 seconds
    return Date.now() >= (payload.exp * 1000) - 5000;
  } catch {
    return true;
  }
};

async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  if (token && isTokenExpired(token)) {
    removeToken();
    throw new Error('Session expired (2 hours limit). Please log in again.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
    }
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => apiFetch<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => apiFetch<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => apiFetch<any>('/auth/me'),
  updateProfile: (data: any) => apiFetch<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Applications
  getApplications: () => apiFetch<any[]>('/applications'),
  createApplication: (data: any) => apiFetch<any>('/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateApplication: (id: string, data: any) => apiFetch<any>(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteApplication: (id: string) => apiFetch<any>(`/applications/${id}`, { method: 'DELETE' }),
  seedApplications: (applications: any[]) => apiFetch<any[]>('/applications/seed', { method: 'POST', body: JSON.stringify({ applications }) }),

  // Companies
  getCompanies: () => apiFetch<any[]>('/companies'),
  createCompany: (data: any) => apiFetch<any>('/companies', { method: 'POST', body: JSON.stringify(data) }),
  updateCompany: (id: string, data: any) => apiFetch<any>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCompany: (id: string) => apiFetch<any>(`/companies/${id}`, { method: 'DELETE' }),

  // Interviews
  getInterviews: () => apiFetch<any[]>('/interviews'),
  createInterview: (data: any) => apiFetch<any>('/interviews', { method: 'POST', body: JSON.stringify(data) }),
  updateInterview: (id: string, data: any) => apiFetch<any>(`/interviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInterview: (id: string) => apiFetch<any>(`/interviews/${id}`, { method: 'DELETE' }),

  // Resumes
  getResumes: () => apiFetch<any[]>('/resumes'),
  createResume: (data: any) => apiFetch<any>('/resumes', { method: 'POST', body: JSON.stringify(data) }),
  updateResume: (id: string, data: any) => apiFetch<any>(`/resumes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteResume: (id: string) => apiFetch<any>(`/resumes/${id}`, { method: 'DELETE' }),

  // FollowUps
  getFollowUps: () => apiFetch<any[]>('/followups'),
  createFollowUp: (data: any) => apiFetch<any>('/followups', { method: 'POST', body: JSON.stringify(data) }),
  updateFollowUp: (id: string, data: any) => apiFetch<any>(`/followups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFollowUp: (id: string) => apiFetch<any>(`/followups/${id}`, { method: 'DELETE' }),

  // Questions
  getQuestions: () => apiFetch<any[]>('/questions'),
  createQuestion: (data: any) => apiFetch<any>('/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id: string, data: any) => apiFetch<any>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id: string) => apiFetch<any>(`/questions/${id}`, { method: 'DELETE' }),
};
