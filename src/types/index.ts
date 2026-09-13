export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type Priority = 'low' | 'medium' | 'high';

export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export type InterviewType =
  | 'hr'
  | 'screening'
  | 'technical'
  | 'behavioral'
  | 'system-design'
  | 'managerial'
  | 'final'
  | 'other';

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';

export type FollowUpType = 'email' | 'message' | 'call' | 'other';

export interface Application {
  id: string;
  companyId: string;
  jobTitle: string;
  jobUrl?: string;
  status: ApplicationStatus;
  priority: Priority;
  location?: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  applicationDeadline?: string;
  appliedAt?: string;
  resumeId?: string;
  notes?: string;
  jobDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  size?: CompanySize;
  notes?: string;
  contacts: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  type: InterviewType;
  dateTime: string;
  duration?: number;
  interviewer?: string;
  meetingUrl?: string;
  status: InterviewStatus;
  notes?: string;
  feedback?: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  name: string;
  role: string;
  version: string;
  fileUrl?: string;
  skills: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  applicationId: string;
  title: string;
  dueDate: string;
  type: FollowUpType;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  applicationId: string;
  question: string;
  answer?: string;
  category: 'technical' | 'behavioral' | 'other';
  prepared: boolean;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  applicationId: string;
  type: 'status_change' | 'interview' | 'follow_up' | 'note' | 'resume';
  title: string;
  description?: string;
  date: string;
}

export interface SkillMatch {
  skill: string;
  matched: boolean;
  partial: boolean;
}

export interface Settings {
  theme: 'dark' | 'light';
  userName: string;
  userSkills: string[];
  currency: string;
}
