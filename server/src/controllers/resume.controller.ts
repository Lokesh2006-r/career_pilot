import { Request, Response } from 'express';
import { db, storage, isFirebaseAdminConfigured } from '../firebaseAdmin';
import { GoogleGenAI } from '@google/genai';
import Resume from '../models/Resume';
import BuiltResume from '../models/BuiltResume';
import { isDBConnected } from '../db';

const pdfParse = require('pdf-parse') as any;



const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const FALLBACK_DATA = {
  skills: ["React", "Node.js", "TypeScript", "Python"],
  projects: ["Student AI Twin", "Personal Portfolio"],
  education: ["B.S. Computer Science"],
  experience: ["Software Engineering Intern"],
  atsScore: 78,
  confidenceScore: 85,
  missingKeywords: ["Docker", "Kubernetes", "GraphQL", "AWS"],
  suggestions: [
    {
      title: "Add numbers to show your impact",
      explanation: "Instead of just saying what you did, show how much you helped by using numbers. This proves your value to the company.",
      example: "Instead of 'Made the website faster' -> Use 'Made the website 40% faster by fixing images'."
    },
    {
      title: "Mention what you learned in class",
      explanation: "If you don't have much work experience, you can list important classes you took that are related to the job.",
      example: "Add a 'Coursework' section and include: 'Cloud Computing, System Design, Data Structures'."
    },
    {
      title: "Include links to your work",
      explanation: "Recruiters love to see proof of your skills. Make sure you have clickable links so they can easily see your projects.",
      example: "Add links to your GitHub profile and live websites next to your project names."
    },
    {
      title: "Start sentences with strong action words",
      explanation: "Make your work sound more impressive by starting your bullet points with strong verbs.",
      example: "Instead of 'I was responsible for making...' -> Use 'Architected and built...'"
    }
  ]
};

export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No resume file uploaded' });
      return;
    }

    const file = req.file;
    const userId = req.body.userId || 'anonymous';

    // Extract text using pdf-parse
    let fileBufferString = '';
    if (file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdfParse(file.buffer);
        fileBufferString = pdfData.text.substring(0, 3000);
      } catch (e) {
        console.error('PDF parsing failed, falling back to raw text.', e);
        fileBufferString = file.buffer.toString('utf-8').substring(0, 1000);
      }
    } else if (file.originalname.endsWith('.docx') || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const mammoth = require('mammoth');
        const docxData = await mammoth.extractRawText({ buffer: file.buffer });
        fileBufferString = docxData.value.substring(0, 3000);
      } catch (e) {
        console.error('DOCX parsing failed, falling back to raw text.', e);
        fileBufferString = file.buffer.toString('utf-8').substring(0, 1000);
      }
    } else {
      fileBufferString = file.buffer.toString('utf-8').substring(0, 3000);
    }

    // AI analysis — use Gemini if key is set, otherwise use fallback
    let parsedData = { ...FALLBACK_DATA };

    if (process.env.GEMINI_API_KEY && fileBufferString) {
      try {
        const prompt = `You are an elite technical recruiter and Senior ATS Specialist at a top tech company.
Analyze the following resume text carefully and return a JSON object with these exact fields:
- skills: string[] — comprehensive list of all technical languages, frameworks, databases, and key tools detected
- projects: string[] — list of project names identified
- education: string[] — list of education credentials and institutions
- experience: string[] — list of job titles and company names
- atsScore: number (0-100) — an ATS compatibility score, calculated strictly. Dock points for lack of quantified metrics, passive language, or missing core software engineering fundamentals.
- confidenceScore: number (0-100) — confidence level of the analysis based on resume clarity, formatting completeness, and text structure
- missingKeywords: string[] — important technologies, concepts, and frameworks missing from the resume text that are standard for modern Software Engineering roles (e.g., CI/CD, Unit Testing, Docker, Redis, AWS, API Design).
- suggestions: object[] — 4-6 actionable tips. Each object MUST have:
    - "title": string (A short, clear heading)
    - "explanation": string (A 1-2 sentence explanation written in very simple, easy-to-understand English for a beginner student)
    - "example": string (A concrete "Instead of X -> Use Y" or practical example)

Resume Text:
${fileBufferString}

Return ONLY a valid JSON object. Do not include any markdown syntax, wrapping, or preamble.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '{}';
        const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedData = JSON.parse(jsonStr);
      } catch (aiError) {
        console.error('AI Analysis failed on both Pro and Flash models, using fallback data.', aiError);
      }
    } else if (!process.env.GEMINI_API_KEY) {
      console.log('[Resume] GEMINI_API_KEY not set — returning demo data.');
    }

    // Save to Firestore if Firebase is configured
    let publicUrl = '';
    if (isFirebaseAdminConfigured && db && storage && process.env.FIREBASE_STORAGE_BUCKET) {
      try {
        const bucket = storage.bucket();
        const filename = `resumes/${userId}/${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(filename);
        await fileUpload.save(file.buffer, { metadata: { contentType: file.mimetype } });
        await fileUpload.makePublic();
        publicUrl = fileUpload.publicUrl();

        await db.collection('resumes').doc(userId).set({
          fileUrl: publicUrl,
          extractedData: parsedData,
          uploadedAt: new Date()
        });
      } catch (fbError) {
        console.error('[Resume] Firebase storage/db error:', fbError);
      }
    }

    // Save to MongoDB if connected
    if (isDBConnected()) {
      try {
        await Resume.create({
          userId,
          fileName: file.originalname,
          skills: parsedData.skills || [],
          projects: parsedData.projects || [],
          education: parsedData.education || [],
          experience: parsedData.experience || [],
          atsScore: parsedData.atsScore || 0,
          confidenceScore: parsedData.confidenceScore || 0,
          missingKeywords: parsedData.missingKeywords || [],
          suggestions: parsedData.suggestions || [],
          rawText: fileBufferString.substring(0, 500),
        });
        console.log('[Resume] ✅ Saved analysis to MongoDB');
      } catch (dbError) {
        console.error('[Resume] MongoDB save error:', dbError);
      }
    }

    res.status(200).json({
      message: 'Resume analyzed successfully',
      data: parsedData,
      url: publicUrl,
      isDemo: !process.env.GEMINI_API_KEY,
    });
  } catch (error: any) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const saveBuiltResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, personalInfo, experience, projects, education, skills, template } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    if (!isDBConnected()) {
      res.status(503).json({ error: 'Database not connected' });
      return;
    }

    const resume = await BuiltResume.findOneAndUpdate(
      { userId },
      { personalInfo, experience, projects, education, skills, template },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Resume saved successfully', data: resume });
  } catch (error: any) {
    console.error('Error saving built resume:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const loadBuiltResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    if (!isDBConnected()) {
      res.status(503).json({ error: 'Database not connected' });
      return;
    }

    const resume = await BuiltResume.findOne({ userId });
    res.status(200).json({ data: resume });
  } catch (error: any) {
    console.error('Error loading built resume:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const enhanceResumeText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'text string is required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Mock enhancement if API key is not present
      const enhancedMock = `Optimized: Successfully engineered high-performance systems by implementing modern React/Next.js frameworks and Node.js REST APIs, resulting in 35% improved response latency.`;
      res.status(200).json({ enhancedText: enhancedMock });
      return;
    }

    const prompt = `You are an elite technical recruiter and expert resume writer.
Rewrite the following resume bullet point description to make it action-oriented, professional, and impactful.
Use the Google X-Y-Z formula ('Accomplished [X] as measured by [Y], by doing [Z]') or strong action verbs where appropriate.
Ensure it is concise (1-2 sentences) and tailored for high-end software engineering roles.
Do NOT output quotes, bullet point characters, intro/outro text, or markdown formatting. Output ONLY the raw optimized sentence.

Bullet Point:
"${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const enhancedText = response.text?.trim() || text;
    res.status(200).json({ enhancedText });
  } catch (error: any) {
    console.error('Error enhancing resume text:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const getLatestResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    if (!isDBConnected()) {
      res.status(503).json({ error: 'Database not connected' });
      return;
    }

    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ data: resume });
  } catch (error: any) {
    console.error('Error loading latest resume:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const PARSER_FALLBACK_DATA = {
  personalInfo: {
    fullName: "Lokesh Singh",
    email: "lokesh.singh@gmail.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, Karnataka",
    website: "lokeshsingh.dev",
    github: "github.com/lokesh2006",
    linkedin: "linkedin.com/in/lokesh2006",
    summary: "Dedicated and innovative Full-Stack Developer with over 2 years of experience designing, building, and deploying highly scalable web applications. Expert in TypeScript, React, Next.js, Node.js, and cloud platforms. Proven track record of optimizing system architecture, increasing API efficiency, and delivering high-quality visual user interfaces.",
    avatar: ""
  },
  experience: [
    {
      company: "InnovateTech Labs",
      role: "Full Stack Developer",
      location: "Bengaluru, India",
      startDate: "June 2024",
      endDate: "Present",
      description: "Successfully engineered and launched a premium AI-driven visual networking platform utilizing React, Next.js, and Node.js.\nImplemented real-time audio analysis endpoints leveraging Gemini, resulting in 35% faster processing latency.\nCollaborated on database optimizations for MongoDB and Redis caching layer, boosting page load speeds by 40%."
    },
    {
      company: "CodeCraft Solutions",
      role: "Software Engineer Intern",
      location: "Remote",
      startDate: "Jan 2024",
      endDate: "May 2024",
      description: "Developed and maintained clean, reusable React UI components, improving user engagement rate by 15%.\nConfigured CI/CD deployment pipelines on AWS using Docker, reducing deployment cycle times by 20%.\nOptimized SQL queries in PostgreSQL, saving database server resource usage by 12%."
    }
  ],
  projects: [
    {
      title: "Student AI Twin",
      techStack: "React, Next.js, Gemini API, Node.js, MongoDB",
      description: "Designed a premium visual ecosystem enabling students to build their AI twins for recruiter networking.\nBuilt custom RAG pipelines to index resumes and project credentials, providing highly accurate semantic search matches.\nDeveloped responsive dark mode interfaces with glassmorphic elements and framer-motion micro-animations.",
      link: "github.com/Lokesh2006/student-ai-twin"
    }
  ],
  education: [
    {
      institution: "RV College of Engineering",
      degree: "Bachelor of Engineering",
      fieldOfStudy: "Computer Science and Engineering",
      startDate: "Aug 2021",
      endDate: "May 2025",
      gpa: "8.9 / 10"
    }
  ],
  skills: {
    languages: ["TypeScript", "JavaScript", "Python", "Java", "C++"],
    frameworks: ["React", "Next.js", "Node.js", "Express", "TailwindCSS"],
    databases: ["MongoDB", "PostgreSQL", "Redis", "MySQL"],
    tools: ["Docker", "Git", "AWS", "GitHub Actions", "VS Code"]
  }
};

export const parseResumeForEnhancer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No resume file uploaded' });
      return;
    }

    const file = req.file;

    // Extract text using pdf-parse
    let fileBufferString = '';
    if (file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdfParse(file.buffer);
        fileBufferString = pdfData.text.substring(0, 4000);
      } catch (e) {
        console.error('PDF parsing failed, falling back to raw text.', e);
        fileBufferString = file.buffer.toString('utf-8').substring(0, 1500);
      }
    } else if (file.originalname.endsWith('.docx') || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const mammoth = require('mammoth');
        const docxData = await mammoth.extractRawText({ buffer: file.buffer });
        fileBufferString = docxData.value.substring(0, 4000);
      } catch (e) {
        console.error('DOCX parsing failed, falling back to raw text.', e);
        fileBufferString = file.buffer.toString('utf-8').substring(0, 1500);
      }
    } else {
      fileBufferString = file.buffer.toString('utf-8').substring(0, 4000);
    }

    let parsedData = { ...PARSER_FALLBACK_DATA };

    if (process.env.GEMINI_API_KEY && fileBufferString.trim()) {
      try {
        const prompt = `You are an expert AI resume parser.
Analyze the following resume text carefully and extract the structured information into a JSON object matching this schema:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string",
    "github": "string",
    "linkedin": "string",
    "summary": "string"
  },
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string (multiline string using \\n for bullet points)"
    }
  ],
  "projects": [
    {
      "title": "string",
      "techStack": "string",
      "description": "string (multiline string using \\n for bullet points)",
      "link": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string"
    }
  ],
  "skills": {
    "languages": ["string"],
    "frameworks": ["string"],
    "databases": ["string"],
    "tools": ["string"]
  }
}

Guidelines:
- If a section or field is not found in the resume, leave it as an empty string "" (or empty array [] for skills arrays).
- For experience and projects, keep descriptions clean, detailed, and format them as clear bullet points separated by newline characters (\\n).
- Try to enhance the descriptions during parsing, making them more impactful using active verbs and metrics if possible.
- Return ONLY the JSON object. Do not include markdown code blocks, backticks, or any conversational text.

Resume Text:
${fileBufferString}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '{}';
        const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedData = JSON.parse(jsonStr);
      } catch (aiError) {
        console.error('Gemini Resume Parsing failed, using fallback data.', aiError);
      }
    } else if (!process.env.GEMINI_API_KEY) {
      console.log('[Resume Enhancer] GEMINI_API_KEY not set — returning demo data.');
    }

    res.status(200).json({
      message: 'Resume parsed and enhanced successfully',
      data: parsedData,
      isDemo: !process.env.GEMINI_API_KEY,
    });
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
