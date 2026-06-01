import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI is not defined. Running without database persistence.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('[MongoDB] ✅ Connected successfully to MongoDB Atlas');
  } catch (error: any) {
    console.error('[MongoDB] ❌ Connection failed:', error.message);
    // Don't crash the server — just warn
  }
};

export const isDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
