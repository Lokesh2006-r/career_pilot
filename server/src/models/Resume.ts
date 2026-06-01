import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  userId: string;
  fileName: string;
  skills: string[];
  projects: string[];
  education: string[];
  experience: string[];
  atsScore: number;
  confidenceScore: number;
  missingKeywords: string[];
  suggestions: string[];
  rawText: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: String, required: true, index: true },
    fileName: { type: String, default: '' },
    skills: [{ type: String }],
    projects: [{ type: String }],
    education: [{ type: String }],
    experience: [{ type: String }],
    atsScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    missingKeywords: [{ type: String }],
    suggestions: [{ type: String }],
    rawText: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IResume>('Resume', ResumeSchema);
