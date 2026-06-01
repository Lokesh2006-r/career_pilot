import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewQA {
  question: string;
  answer: string;
  feedback: string;
}

export interface IInterviewReport {
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  detailedEvaluation: string;
  summary?: string;
  gaps?: string[];
}

export interface IInterview extends Document {
  userId: string;
  role: string;
  type: string;
  history: IInterviewQA[];
  report: IInterviewReport | null;
  status: 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    type: { type: String, required: true },
    history: [
      {
        question: { type: String },
        answer: { type: String },
        feedback: { type: String, default: '' },
      },
    ],
    report: {
      type: {
        technicalScore: { type: Number },
        communicationScore: { type: Number },
        confidenceScore: { type: Number },
        detailedEvaluation: { type: String },
        summary: { type: String },
        gaps: [{ type: String }],
      },
      default: null,
    },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  },
  { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
