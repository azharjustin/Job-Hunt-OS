import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApplicationStore } from '../../stores/applicationStore';
import { useCompanyStore } from '../../stores/companyStore';
import { useResumeStore } from '../../stores/resumeStore';
import type { Application } from '../../types';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

const schema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  companyId: z.string().min(1, 'Company is required'),
  jobUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn']),
  priority: z.enum(['low', 'medium', 'high']),
  location: z.string().optional(),
  workMode: z.enum(['remote', 'hybrid', 'onsite']),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  salaryCurrency: z.string().optional(),
  applicationDeadline: z.string().optional(),
  appliedAt: z.string().optional(),
  resumeId: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ApplicationFormProps {
  onSuccess: (app: Application) => void;
  onCancel: () => void;
  initial?: Partial<Application>;
}

export function ApplicationForm({ onSuccess, onCancel, initial }: ApplicationFormProps) {
  const { add, update } = useApplicationStore();
  const { companies } = useCompanyStore();
  const { resumes } = useResumeStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      jobTitle: initial?.jobTitle ?? '',
      companyId: initial?.companyId ?? '',
      jobUrl: initial?.jobUrl ?? '',
      status: initial?.status ?? 'saved',
      priority: initial?.priority ?? 'medium',
      location: initial?.location ?? '',
      workMode: initial?.workMode ?? 'remote',
      employmentType: initial?.employmentType ?? 'full-time',
      salaryMin: initial?.salaryMin,
      salaryMax: initial?.salaryMax,
      salaryCurrency: initial?.salaryCurrency ?? 'USD',
      applicationDeadline: initial?.applicationDeadline?.slice(0, 10) ?? '',
      appliedAt: initial?.appliedAt?.slice(0, 10) ?? '',
      resumeId: initial?.resumeId ?? '',
      notes: initial?.notes ?? '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (initial?.id) {
      update(initial.id, data);
      onSuccess({ ...initial, ...data } as Application);
    } else {
      const app = add(data as any);
      onSuccess(app);
    }
  };

  const companyOptions = [
    { value: '', label: '— Select Company —' },
    ...companies.map((c) => ({ value: c.id, label: c.name })),
  ];

  const resumeOptions = [
    { value: '', label: '— No Resume —' },
    ...resumes.map((r) => ({ value: r.id, label: `${r.name} v${r.version}` })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Job Title *" {...register('jobTitle')} error={errors.jobTitle?.message} placeholder="e.g. Senior Frontend Developer" />
        </div>
        <div className="col-span-2">
          <Select label="Company *" {...register('companyId')} error={errors.companyId?.message} options={companyOptions} />
        </div>
        <Select label="Status" {...register('status')} options={[
          { value: 'saved', label: 'Saved' },
          { value: 'applied', label: 'Applied' },
          { value: 'screening', label: 'Screening' },
          { value: 'interview', label: 'Interview' },
          { value: 'offer', label: 'Offer' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'withdrawn', label: 'Withdrawn' },
        ]} />
        <Select label="Priority" {...register('priority')} options={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ]} />
        <Input label="Location" {...register('location')} placeholder="e.g. New York, NY" />
        <Select label="Work Mode" {...register('workMode')} options={[
          { value: 'remote', label: 'Remote' },
          { value: 'hybrid', label: 'Hybrid' },
          { value: 'onsite', label: 'On-site' },
        ]} />
        <Select label="Employment Type" {...register('employmentType')} options={[
          { value: 'full-time', label: 'Full-time' },
          { value: 'part-time', label: 'Part-time' },
          { value: 'contract', label: 'Contract' },
          { value: 'internship', label: 'Internship' },
        ]} />
        <Select label="Currency" {...register('salaryCurrency')} options={[
          { value: 'USD', label: 'USD ($)' },
          { value: 'INR', label: 'INR (₹)' },
          { value: 'EUR', label: 'EUR (€)' },
          { value: 'GBP', label: 'GBP (£)' },
          { value: 'CAD', label: 'CAD' },
        ]} />
        <Input label="Salary Min" type="number" {...register('salaryMin')} placeholder="e.g. 80000" />
        <Input label="Salary Max" type="number" {...register('salaryMax')} placeholder="e.g. 120000" />
        <Input label="Applied Date" type="date" {...register('appliedAt')} />
        <Input label="Deadline" type="date" {...register('applicationDeadline')} />
        <div className="col-span-2">
          <Input label="Job URL" {...register('jobUrl')} error={errors.jobUrl?.message} placeholder="https://..." />
        </div>
        <div className="col-span-2">
          <Select label="Resume Used" {...register('resumeId')} options={resumeOptions} />
        </div>
        <div className="col-span-2">
          <Textarea label="Notes" {...register('notes')} rows={3} placeholder="Any notes about this application..." />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {initial?.id ? 'Save Changes' : 'Add Application'}
        </Button>
      </div>
    </form>
  );
}
