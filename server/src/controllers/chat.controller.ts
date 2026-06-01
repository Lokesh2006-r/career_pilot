import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import ChatModel from '../models/Chat';
import { isDBConnected } from '../db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export const handleChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Invalid messages list' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Simulate/mock AI response
      const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
      let mockReply = "I am your AI Twin. Let's work on getting you prepared for your placements! Do you want to practice mock interviews, review your resume, or sync coding trackers?";
      
      if (lastMessage.includes('resume')) {
        mockReply = "Your resume has an ATS score of 78. Adding the recent 'Student AI Twin' project could raise it to 86. Would you like some tips on how to describe it?";
      } else if (lastMessage.includes('interview') || lastMessage.includes('mock')) {
        mockReply = "Mock interviews are the best way to prepare! You can head over to the Mock Interviews tab to configure a Technical or HR session.";
      } else if (lastMessage.includes('coding') || lastMessage.includes('leetcode')) {
        mockReply = "Your coding tracker shows strong performance in Arrays & Two Pointers, but Dynamic Programming needs attention. Have you solved 'Climbing Stairs' yet?";
      }
      
      res.status(200).json({ reply: mockReply });
      return;
    }

    // Format messages for the Google Gen AI SDK
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: "You are the student's personal AI Twin—a highly expert principal software engineer, coding coach, and tech recruitment director. Your goal is to guide the student toward top-tier engineering roles and internships. Provide precise, actionable, and technically rigorous guidance. When analyzing topics, reference standard system design concepts (e.g., caching strategies, database replication, rate limiters, trade-offs) and clean code practices. Keep responses structured, professional, and encouraging, using clear headings and bullet points."
      }
    });

    const reply = response.text || "I'm having trouble thinking of a response right now. Let's try again.";

    // Save chat exchange to MongoDB
    if (isDBConnected()) {
      try {
        const userId = req.body.userId || 'anonymous';
        const lastUserMsg = messages[messages.length - 1];
        await ChatModel.findOneAndUpdate(
          { userId },
          {
            $push: {
              messages: {
                $each: [
                  { role: 'user', content: lastUserMsg.content, timestamp: new Date() },
                  { role: 'model', content: reply, timestamp: new Date() },
                ],
              },
            },
          },
          { upsert: true, new: true }
        );
        console.log('[Chat] ✅ Conversation saved to MongoDB');
      } catch (dbErr) {
        console.error('[Chat] MongoDB save error:', dbErr);
      }
    }

    res.status(200).json({ reply });
  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
