import { Request, Response } from 'express';
import StudentProfile from '../models/StudentProfile';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    const profile = await StudentProfile.findOne({ userId });
    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error fetching student profile:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    
    // We update using findOneAndUpdate to upsert (create if not exists)
    const profile = await StudentProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { upsert: true, new: true }
    );
    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error updating student profile:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
