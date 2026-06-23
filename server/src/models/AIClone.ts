import mongoose, { Schema, Document } from 'mongoose';

export interface IAIClone extends Document {
  userId: string;
  knowledgeBase: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AICloneSchema = new Schema<IAIClone>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    knowledgeBase: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAIClone>('AIClone', AICloneSchema);
