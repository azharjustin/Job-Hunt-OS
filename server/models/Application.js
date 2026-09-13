import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: String,
      default: '',
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    jobUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'],
      default: 'saved',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    location: {
      type: String,
      default: '',
    },
    workMode: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      default: 'remote',
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    salaryMin: {
      type: Number,
    },
    salaryMax: {
      type: Number,
    },
    salaryCurrency: {
      type: String,
      default: '$',
    },
    applicationDeadline: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: String,
      default: '',
    },
    resumeId: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    jobDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for id to mirror frontend expected interface
applicationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Application = mongoose.model('Application', applicationSchema);
