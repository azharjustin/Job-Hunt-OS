import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['hr', 'screening', 'technical', 'behavioral', 'system-design', 'managerial', 'final', 'other'],
      default: 'technical',
    },
    dateTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 45,
    },
    interviewer: {
      type: String,
      default: '',
    },
    meetingUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Interview = mongoose.model('Interview', interviewSchema);
