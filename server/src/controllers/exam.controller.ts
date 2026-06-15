import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const pdfParse = require('pdf-parse') as any;

// ─── helpers ─────────────────────────────────────────────────────────────────

async function extractText(file: Express.Multer.File): Promise<string> {
  if (file.mimetype === 'application/pdf') {
    try {
      const data = await pdfParse(file.buffer);
      return data.text.substring(0, 5000);
    } catch {
      return file.buffer.toString('utf-8').substring(0, 2000);
    }
  }
  if (
    file.originalname.endsWith('.docx') ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value.substring(0, 5000);
    } catch {
      return file.buffer.toString('utf-8').substring(0, 2000);
    }
  }
  return file.buffer.toString('utf-8').substring(0, 5000);
}

async function callGemini(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || '{}';
}

// ─── 1. Generate Questions ────────────────────────────────────────────────────

const DEMO_QUESTIONS = [
  { id: 1, type: 'MCQ', difficulty: 'Medium', question: 'Which data structure uses LIFO ordering?', options: ['Queue', 'Stack', 'Heap', 'Graph'], answer: 'Stack' },
  { id: 2, type: 'Short Answer', difficulty: 'Easy', question: 'What does HTTP stand for?' },
  { id: 3, type: 'Long Answer', difficulty: 'Hard', question: 'Explain the concept of polymorphism in OOP with examples.' },
  { id: 4, type: 'MCQ', difficulty: 'Easy', question: 'Which keyword is used to define a class in Python?', options: ['def', 'class', 'struct', 'object'], answer: 'class' },
  { id: 5, type: 'Short Answer', difficulty: 'Medium', question: 'What is the time complexity of binary search?' },
];

export const generateQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = parseInt(req.body.count) || 10;
    const difficulty = req.body.difficulty || 'Medium';
    const questionType = req.body.questionType || 'Mixed';

    let sourceText = req.body.pastedText || '';
    if (req.file) {
      sourceText = await extractText(req.file);
    }

    if (!sourceText.trim()) {
      res.status(400).json({ error: 'Please provide a file or paste text content.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(200).json({ questions: DEMO_QUESTIONS.slice(0, Math.min(count, 5)), isDemo: true });
      return;
    }

    const prompt = `You are an expert academic exam paper setter.
Based on the following study content, generate ${count} exam questions.
Difficulty: ${difficulty}
Question Type: ${questionType} (if Mixed, generate a balanced variety of MCQ, Short Answer, and Long Answer)

For MCQ questions include: options (array of 4 strings) and answer (correct option string).
For Short/Long Answer questions: omit options and answer.

Return ONLY a valid JSON array of objects with this schema:
[
  {
    "id": number,
    "type": "MCQ" | "Short Answer" | "Long Answer",
    "difficulty": "${difficulty}",
    "question": "string",
    "options": ["string"] (only for MCQ),
    "answer": "string" (only for MCQ)
  }
]

Study Content:
${sourceText}`;

    const raw = await callGemini(prompt);
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(jsonStr);

    res.status(200).json({ questions, isDemo: false });
  } catch (err: any) {
    console.error('[ExamCraft] generateQuestions error:', err);
    res.status(200).json({ questions: DEMO_QUESTIONS, isDemo: true, error: 'AI unavailable — showing demo data.' });
  }
};

// ─── 2. Generate Answers ──────────────────────────────────────────────────────

const DEMO_ANSWERS = [
  {
    question: 'Explain the OSI model.',
    answer: `The OSI (Open Systems Interconnection) model is a conceptual framework that standardises the functions of a communication system into seven distinct layers:

1. **Physical** – Transmits raw bit stream over physical medium.
2. **Data Link** – Provides node-to-node data transfer and error detection.
3. **Network** – Handles packet routing (e.g., IP).
4. **Transport** – Ensures end-to-end communication (e.g., TCP/UDP).
5. **Session** – Manages sessions between applications.
6. **Presentation** – Translates data formats (e.g., encryption, compression).
7. **Application** – Closest to the user, provides network services to applications (e.g., HTTP, FTP).

Each layer serves the layer above it and is served by the layer below it, enabling interoperability between different systems and vendors.`
  }
];

export const generateAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questions, answerLength, context } = req.body;

    if (!questions || !questions.trim()) {
      res.status(400).json({ error: 'Please provide questions to answer.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(200).json({ answers: DEMO_ANSWERS, isDemo: true });
      return;
    }

    const wordCount = answerLength === 'Brief' ? 80 : answerLength === 'Detailed' ? 400 : 200;

    const prompt = `You are an expert academic tutor and subject matter expert.
Answer each of the following exam questions thoroughly.
${context ? `Subject context: ${context}` : ''}
Target length: ~${wordCount} words per answer.
Use clear headings, bullet points, and examples where appropriate.
Format the answer in clean markdown.

Return ONLY a valid JSON array:
[
  {
    "question": "exact question text",
    "answer": "markdown formatted answer"
  }
]

Questions:
${questions}`;

    const raw = await callGemini(prompt);
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const answers = JSON.parse(jsonStr);

    res.status(200).json({ answers, isDemo: false });
  } catch (err: any) {
    console.error('[ExamCraft] generateAnswers error:', err);
    res.status(200).json({ answers: DEMO_ANSWERS, isDemo: true, error: 'AI unavailable — showing demo data.' });
  }
};

// ─── 3. Evaluate Answer Script ────────────────────────────────────────────────

const DEMO_EVALUATION = {
  totalScore: 14,
  maxScore: 20,
  percentage: 70,
  grade: 'B',
  results: [
    {
      question: 'What is polymorphism?',
      studentAnswer: 'Polymorphism means many forms. In programming it allows different classes to be treated as same type.',
      score: 7,
      maxScore: 10,
      feedback: 'Good basic understanding. Missing concrete code examples and types of polymorphism (compile-time vs runtime). Mentioning method overriding/overloading would strengthen the answer.',
      keyPointsCovered: ['many forms', 'same type'],
      keyPointsMissed: ['compile-time polymorphism', 'runtime polymorphism', 'code example']
    },
    {
      question: 'Explain memory management in C.',
      studentAnswer: 'C uses malloc and free for memory. You have to manually manage it.',
      score: 7,
      maxScore: 10,
      feedback: 'Correct but incomplete. Should mention calloc, realloc, stack vs heap distinction, and common pitfalls like memory leaks and dangling pointers.',
      keyPointsCovered: ['malloc', 'free', 'manual management'],
      keyPointsMissed: ['calloc/realloc', 'stack vs heap', 'memory leaks', 'dangling pointers']
    }
  ]
};

export const evaluateScript = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questions, studentAnswers, totalMarks } = req.body;

    if (!questions?.trim() || !studentAnswers?.trim()) {
      res.status(400).json({ error: 'Please provide both questions and student answers.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(200).json({ evaluation: DEMO_EVALUATION, isDemo: true });
      return;
    }

    const maxScore = parseInt(totalMarks) || 100;

    const prompt = `You are a strict but fair academic examiner.
Evaluate the student's answers against the exam questions.
Total marks available: ${maxScore}

For each question:
- Assign a score (proportional to ${maxScore} marks total)
- Provide specific, constructive feedback
- List key points covered and key points missed

Return ONLY a valid JSON object:
{
  "totalScore": number,
  "maxScore": ${maxScore},
  "percentage": number,
  "grade": "A+" | "A" | "B" | "C" | "D" | "F",
  "results": [
    {
      "question": "string",
      "studentAnswer": "string",
      "score": number,
      "maxScore": number,
      "feedback": "string",
      "keyPointsCovered": ["string"],
      "keyPointsMissed": ["string"]
    }
  ]
}

Exam Questions:
${questions}

Student Answers:
${studentAnswers}`;

    const raw = await callGemini(prompt);
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const evaluation = JSON.parse(jsonStr);

    res.status(200).json({ evaluation, isDemo: false });
  } catch (err: any) {
    console.error('[ExamCraft] evaluateScript error:', err);
    res.status(200).json({ evaluation: DEMO_EVALUATION, isDemo: true, error: 'AI unavailable — showing demo data.' });
  }
};

// ─── 4. Topic Quiz Generator ──────────────────────────────────────────────────

const DEMO_QUIZ = [
  { id: 1, question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Core Processing Utility', 'Central Program Unit', 'Core Program Utility'], correctIndex: 0, explanation: 'CPU stands for Central Processing Unit, the primary component that executes instructions.' },
  { id: 2, question: 'Which protocol is used for secure web browsing?', options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], correctIndex: 2, explanation: 'HTTPS (HyperText Transfer Protocol Secure) uses TLS/SSL encryption for secure communication.' },
  { id: 3, question: 'What is the binary representation of decimal 10?', options: ['1000', '1010', '1100', '0110'], correctIndex: 1, explanation: '10 in binary is 1010 (8+2=10).' },
  { id: 4, question: 'Which sorting algorithm has O(n log n) average time complexity?', options: ['Bubble Sort', 'Merge Sort', 'Insertion Sort', 'Selection Sort'], correctIndex: 1, explanation: 'Merge Sort guarantees O(n log n) by dividing and merging.' },
  { id: 5, question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'System Query Language'], correctIndex: 0, explanation: 'SQL stands for Structured Query Language, used for database management.' },
];

export const generateTopicQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, count, difficulty } = req.body;

    if (!topic?.trim()) {
      res.status(400).json({ error: 'Please provide a topic.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(200).json({ quiz: DEMO_QUIZ.slice(0, Math.min(parseInt(count) || 5, 5)), isDemo: true });
      return;
    }

    const numQuestions = Math.min(parseInt(count) || 10, 20);

    const prompt = `You are an expert quiz creator.
Generate ${numQuestions} multiple-choice quiz questions on the topic: "${topic}"
Difficulty: ${difficulty || 'Medium'}

Each question must have exactly 4 options and one correct answer.
Include a brief explanation for the correct answer.

Return ONLY a valid JSON array:
[
  {
    "id": number,
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctIndex": number (0-3, index of correct option),
    "explanation": "string (brief explanation of why this is correct)"
  }
]`;

    const raw = await callGemini(prompt);
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const quiz = JSON.parse(jsonStr);

    res.status(200).json({ quiz, isDemo: false });
  } catch (err: any) {
    console.error('[ExamCraft] generateTopicQuiz error:', err);
    res.status(200).json({ quiz: DEMO_QUIZ, isDemo: true, error: 'AI unavailable — showing demo data.' });
  }
};
