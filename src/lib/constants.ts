import type { ApplicationStatus, Priority, WorkMode, EmploymentType } from '../types';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: 'bg-slate-500/20 text-slate-800 dark:text-slate-300 border-slate-500/30 font-semibold',
  applied: 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/30 font-semibold',
  screening: 'bg-violet-500/20 text-violet-800 dark:text-violet-300 border-violet-500/30 font-semibold',
  interview: 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/30 font-semibold',
  offer: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-semibold',
  rejected: 'bg-red-500/20 text-red-800 dark:text-red-300 border-red-500/30 font-semibold',
  withdrawn: 'bg-gray-500/20 text-gray-800 dark:text-gray-400 border-gray-500/30 font-semibold',
};

export const STATUS_COLORS_LIGHT: Record<ApplicationStatus, string> = {
  saved: 'bg-slate-100 text-slate-700 border-slate-200',
  applied: 'bg-blue-100 text-blue-700 border-blue-200',
  screening: 'bg-violet-100 text-violet-700 border-violet-200',
  interview: 'bg-amber-100 text-amber-700 border-amber-200',
  offer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  withdrawn: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'text-slate-600 dark:text-slate-400 font-medium',
  medium: 'text-amber-700 dark:text-amber-400 font-semibold',
  high: 'text-red-700 dark:text-red-400 font-bold',
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

export const KANBAN_COLUMNS: ApplicationStatus[] = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
];

export const SKILLS_DICTIONARY = [
  'React', 'Vue', 'Angular', 'Svelte',
  'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby',
  'Node.js', 'Express', 'NestJS', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Rails',
  'Next.js', 'Nuxt.js', 'Remix', 'Gatsby',
  'GraphQL', 'REST', 'gRPC',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'SQLite',
  'AWS', 'GCP', 'Azure', 'Vercel', 'Netlify', 'Heroku', 'DigitalOcean',
  'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'GitLab CI',
  'Git', 'Linux', 'Bash', 'PowerShell',
  'Webpack', 'Vite', 'Rollup', 'Babel', 'ESLint', 'Prettier',
  'Jest', 'Vitest', 'Cypress', 'Playwright', 'Testing Library',
  'Figma', 'Adobe XD', 'Storybook',
  'Tailwind CSS', 'SASS', 'CSS', 'HTML',
  'Prisma', 'TypeORM', 'Sequelize', 'Mongoose',
  'Socket.io', 'WebSockets', 'RabbitMQ', 'Kafka',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'scikit-learn',
  'React Native', 'Flutter', 'Swift', 'Kotlin',
  'Microservices', 'System Design', 'CI/CD', 'DevOps', 'Agile', 'Scrum',
];

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/applications', label: 'Applications', icon: 'Briefcase' },
  { path: '/kanban', label: 'Kanban', icon: 'Columns3' },
  { path: '/interviews', label: 'Interviews', icon: 'Calendar' },
  { path: '/companies', label: 'Companies', icon: 'Building2' },
  { path: '/resumes', label: 'Resumes', icon: 'FileText' },
  { path: '/prep', label: 'Interview Prep', icon: 'BookOpen' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
] as const;

export const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD'];
