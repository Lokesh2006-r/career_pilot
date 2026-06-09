import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentProfile extends Document {
  userId: string;
  fullName: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  university: string;
  degree: string;
  gradYear: string;
  github: string;
  linkedin: string;
  portfolio: string;
  codingHandles: {
    leetcode: string;
    codeforces: string;
    codechef: string;
  };
  settings: Record<string, any>;
  dailyChecklist: Array<any>;
  practiceLogs: Array<any>;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, default: '' },
    headline: { type: String, default: '' },
    location: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    university: { type: String, default: '' },
    degree: { type: String, default: '' },
    gradYear: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    codingHandles: {
      leetcode: { type: String, default: '' },
      codeforces: { type: String, default: '' },
      codechef: { type: String, default: '' },
    },
    settings: { type: Schema.Types.Mixed, default: {} },
    dailyChecklist: [{ type: Schema.Types.Mixed }],
    practiceLogs: [{ type: Schema.Types.Mixed }],
  },
  { timestamps: true }
);

export default mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
