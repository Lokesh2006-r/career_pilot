import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface IProject {
  title: string;
  techStack: string;
  description: string;
  link: string;
}

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface IBuiltResume extends Document {
  userId: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
    summary: string;
    avatar: string;
  };
  experience: IExperience[];
  projects: IProject[];
  education: IEducation[];
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
  };
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

const BuiltResumeSchema = new Schema<IBuiltResume>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      website: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      summary: { type: String, default: '' },
      avatar: { type: String, default: '' },
    },
    experience: [
      {
        company: { type: String, default: '' },
        role: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        description: { type: String, default: '' },
      },
    ],
    projects: [
      {
        title: { type: String, default: '' },
        techStack: { type: String, default: '' },
        description: { type: String, default: '' },
        link: { type: String, default: '' },
      },
    ],
    education: [
      {
        institution: { type: String, default: '' },
        degree: { type: String, default: '' },
        fieldOfStudy: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        gpa: { type: String, default: '' },
      },
    ],
    skills: {
      languages: [{ type: String }],
      frameworks: [{ type: String }],
      databases: [{ type: String }],
      tools: [{ type: String }],
    },
    template: { type: String, default: 'modern' },
  },
  { timestamps: true }
);

export default mongoose.model<IBuiltResume>('BuiltResume', BuiltResumeSchema);
