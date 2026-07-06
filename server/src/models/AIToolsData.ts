import mongoose, { Schema, Document } from 'mongoose';

export interface IAIToolsData extends Document {
  userId: string;

  careerHealthScore: {
    score: number;
    categories: { name: string; score: number; maxScore: number }[];
    suggestions: string[];
    generatedAt: Date;
  } | null;

  dreamCompanyRoadmaps: {
    company: string;
    roadmap: {
      technicalSkills: string[];
      dsaRoadmap: string[];
      recommendedProjects: string[];
      certifications: string[];
      interviewPrep: string[];
      timeline: string;
      actionPlan: string[];
    };
    generatedAt: Date;
  }[];

  githubAnalysis: {
    username: string;
    score: number;
    metrics: {
      repositoryQuality: number;
      readmeQuality: number;
      commitConsistency: number;
      languageDiversity: number;
      projectDiversity: number;
      openSourceContributions: number;
    };
    languages: { name: string; percentage: number }[];
    suggestions: string[];
    report: string;
    generatedAt: Date;
  } | null;

  portfolioAnalysis: {
    url: string;
    score: number;
    metrics: {
      uiux: number;
      responsiveness: number;
      accessibility: number;
      projectQuality: number;
      performance: number;
      seo: number;
      missingSections: string[];
      contactInfo: boolean;
    };
    suggestions: string[];
    checklist: { item: string; status: 'pass' | 'fail' | 'warning' }[];
    generatedAt: Date;
  } | null;

  skillGapAnalysis: {
    targetRole: string;
    achievedSkills: string[];
    missingSkills: string[];
    priorityOrder: string[];
    learningRoadmap: { skill: string; resource: string; duration: string }[];
    certifications: string[];
    generatedAt: Date;
  } | null;

  placementReadiness: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    categoryScores: { name: string; score: number }[];
    generatedAt: Date;
  } | null;

  weeklyReports: {
    weekStart: string;
    weekEnd: string;
    resumeImprovements: string;
    codingActivity: string;
    interviewPerformance: string;
    newSkills: string;
    projectProgress: string;
    recommendedTasks: string[];
    summary: string;
    generatedAt: Date;
  }[];

  projectAnalyses: {
    repoUrl: string;
    repoName: string;
    score: number;
    metrics: {
      folderStructure: number;
      codeOrganization: number;
      documentation: number;
      innovation: number;
      scalability: number;
      readability: number;
      deploymentReadiness: number;
    };
    feedback: string;
    suggestions: string[];
    generatedAt: Date;
  }[];

  careerTimeline: {
    events: {
      date: string;
      type: 'skill' | 'certification' | 'coding' | 'project' | 'internship' | 'resume' | 'interview' | 'placement';
      title: string;
      description: string;
    }[];
    generatedAt: Date;
  } | null;

  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    earned: boolean;
    earnedAt: Date | null;
    progress: number;
    target: number;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const AIToolsDataSchema = new Schema<IAIToolsData>(
  {
    userId: { type: String, required: true, unique: true, index: true },

    careerHealthScore: { type: Schema.Types.Mixed, default: null },
    dreamCompanyRoadmaps: [{ type: Schema.Types.Mixed }],
    githubAnalysis: { type: Schema.Types.Mixed, default: null },
    portfolioAnalysis: { type: Schema.Types.Mixed, default: null },
    skillGapAnalysis: { type: Schema.Types.Mixed, default: null },
    placementReadiness: { type: Schema.Types.Mixed, default: null },
    weeklyReports: [{ type: Schema.Types.Mixed }],
    projectAnalyses: [{ type: Schema.Types.Mixed }],
    careerTimeline: { type: Schema.Types.Mixed, default: null },
    achievements: [{ type: Schema.Types.Mixed }],
  },
  { timestamps: true }
);

export default mongoose.model<IAIToolsData>('AIToolsData', AIToolsDataSchema);
