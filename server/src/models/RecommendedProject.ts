import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendedProject extends Document {
  userId: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  tags: string[];
  roleTarget: string;
  phases: {
    title: string;
    tasks: {
      text: string;
      completed: boolean;
    }[];
  }[];
  architecture: string[];
  whyFits: string;
  isSaved: boolean;
  problemStatement?: string;
  detailedTechStack?: { name: string; justification: string }[];
  learningDeliverables?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RecommendedProjectSchema = new Schema<IRecommendedProject>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    estimatedTime: { type: String, default: '2 Weeks' },
    tags: [{ type: String }],
    roleTarget: { type: String, default: 'Fullstack Developer' },
    phases: [
      {
        title: { type: String, required: true },
        tasks: [
          {
            text: { type: String, required: true },
            completed: { type: Boolean, default: false }
          }
        ]
      }
    ],
    architecture: [{ type: String }],
    whyFits: { type: String, default: '' },
    isSaved: { type: Boolean, default: false },
    problemStatement: { type: String, default: '' },
    detailedTechStack: [
      {
        name: { type: String, required: true },
        justification: { type: String, required: true }
      }
    ],
    learningDeliverables: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<IRecommendedProject>('RecommendedProject', RecommendedProjectSchema);
