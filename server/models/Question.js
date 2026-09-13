import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
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
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'other'],
      default: 'technical',
    },
    prepared: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Question = mongoose.model('Question', questionSchema);
