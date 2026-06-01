import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  userId: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: String, required: true, index: true },
    messages: [
      {
        role: { type: String, enum: ['user', 'model'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IChat>('Chat', ChatSchema);
