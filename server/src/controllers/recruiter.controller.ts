import { Request, Response } from 'express';
import StudentProfile from '../models/StudentProfile';
import Resume from '../models/Resume';

// Candidates List Endpoint
export const getCandidates = async (req: Request, res: Response) => {
  try {
    const students = await StudentProfile.find().sort({ createdAt: -1 });
    const resumes = await Resume.find();
    
    // Map resumes by userId for quick lookup
    const resumeMap = new Map();
    resumes.forEach(r => {
      resumeMap.set(r.userId, r);
    });

    const candidates = students.map(s => {
      const userResume = resumeMap.get(s.userId);
      const atsScore = userResume?.atsScore || 0;
      
      // Combine skills from profile and resume, removing duplicates
      const profileSkills = Array.isArray((s as any).skills) ? (s as any).skills : [];
      const resumeSkills = userResume?.skills || [];
      const combinedSkills = Array.from(new Set([...profileSkills, ...resumeSkills]));

      // Fallback for avatar
      const avatar = (s.fullName || 'Anonymous User').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

      // Simple proxy for leetcode solved (since we don't track it natively)
      const leetcodeSolved = s.practiceLogs ? s.practiceLogs.length * 2 : 0;
      const projectsCount = userResume?.projects ? userResume.projects.length : 0;

      const personalityPrompt = `You are ${s.fullName || 'a student'}'s AI Twin. Speak confidently about ${s.headline || 'your background'}, and focus deeply on ${combinedSkills.slice(0, 3).join(', ')}.`;

      return {
        id: s.userId,
        name: s.fullName || 'Anonymous User',
        roleTarget: s.headline || 'Software Engineer',
        atsScore,
        leetcodeSolved,
        leetcodeStreak: 0, // Not tracked
        skills: combinedSkills,
        personalityPrompt,
        avatar,
        email: s.email || 'No Email',
        education: s.university ? `${s.degree || 'Degree'} from ${s.university}` : 'Education details pending',
        projectsCount
      };
    });

    return res.json({ success: true, data: candidates });
  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
