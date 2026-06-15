import { Request, Response } from 'express';
import StudentProfile from '../models/StudentProfile';
import Resume from '../models/Resume';

// Dashboard Stats Endpoint
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const studentCount = await StudentProfile.countDocuments();
    const recruiterCount = 0; // No Recruiter model exists yet
    
    // Simulate real logs using recently updated student profiles
    const recentStudents = await StudentProfile.find().sort({ updatedAt: -1 }).limit(5);
    const logs = recentStudents.map(student => {
      const time = student.updatedAt ? new Date(student.updatedAt).toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0];
      return {
        timestamp: time,
        level: 'INFO',
        message: `Profile updated for student: ${student.fullName || student.email || student.userId}`
      };
    });

    // If no recent students, return some default system logs
    if (logs.length === 0) {
      logs.push({
        timestamp: new Date().toTimeString().split(' ')[0],
        level: 'SUCCESS',
        message: 'System started successfully.'
      });
    }

    return res.json({
      success: true,
      data: {
        studentCount,
        recruiterCount,
        apiUsage: 0, // Placeholder
        serverStatus: 'Online',
        logs
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Students List Endpoint
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await StudentProfile.find().sort({ createdAt: -1 });
    
    // Fetch all resumes to map ATS scores
    const resumes = await Resume.find();
    const resumeMap = new Map();
    resumes.forEach(r => {
      resumeMap.set(r.userId, r.atsScore || 0);
    });

    const studentAccounts = students.map(s => ({
      id: s.userId,
      name: s.fullName || 'Anonymous User',
      email: s.email || 'No Email',
      atsScore: resumeMap.get(s.userId) || 0,
      status: 'Active', // Placeholder status
      joinedDate: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    return res.json({ success: true, data: studentAccounts });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Recruiters List Endpoint
export const getRecruiters = async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Reports List Endpoint
export const getReports = async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// AI Usage Stats Endpoint
export const getAiUsage = async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: {
        totalTokens: '0',
        averageResponseTime: '0ms',
        activeModel: 'N/A',
        activeAgents: 0
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
