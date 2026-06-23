import { Request, Response } from 'express';
import StudentProfile from '../models/StudentProfile';
import Resume from '../models/Resume';
import AIClone from '../models/AIClone';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });


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

export const chatWithClone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { messages, knowledgeBaseOverride, isActiveOverride } = req.body;

    if (!studentId || !messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    const cloneData = await AIClone.findOne({ userId: studentId });

    const isCloneActive = isActiveOverride !== undefined ? isActiveOverride : cloneData?.isActive;

    if (!isCloneActive) {
      res.status(404).json({ error: 'This candidate has not activated their AI Clone.' });
      return;
    }

    const finalKnowledgeBase = knowledgeBaseOverride !== undefined ? knowledgeBaseOverride : (cloneData?.knowledgeBase || "");

    const systemInstruction = `You are the AI Clone of ${studentProfile?.fullName || 'the candidate'}. 
Your goal is to answer questions from a recruiter confidently, professionally, and honestly, based ONLY on the knowledge base provided. Do not make up experience. If asked something outside the knowledge base, state that you don't have that specific experience but express willingness to learn. Keep responses concise and conversational.
KNOWLEDGE BASE:
${finalKnowledgeBase}`;

    let formattedMessages = messages;
    while (formattedMessages.length > 0 && formattedMessages[0].role !== 'user') {
      formattedMessages.shift();
    }

    const contents = formattedMessages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    if (!process.env.GEMINI_API_KEY) {
      res.status(200).json({ reply: "Mock Clone Response: I am an AI representation of this candidate based on their profile data (API KEY MISSING). My background includes React and Node.js." });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: { systemInstruction }
    });

    const reply = response.text || "I'm having trouble thinking of a response right now.";
    res.status(200).json({ reply });
    return;
  } catch (error: any) {
    console.error('Error in clone chat:', error);
    res.status(500).json({ error: error.message });
    return;
  }
};
