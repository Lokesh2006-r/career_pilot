import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import InterviewModel from '../models/Interview';
import { isDBConnected } from '../db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const OFFLINE_QUESTIONS: Record<string, Record<string, string[]>> = {
  "Frontend Engineer": {
    technical: [
      "Can you explain the difference between virtual DOM and real DOM in React, and how reconciliation works?",
      "What is the purpose of useEffect dependency arrays, and how would you implement cleanups to prevent memory leaks?",
      "Explain how Next.js Server Components differ from Client Components and when you would use each."
    ],
    hr: [
      "Tell me about a challenging frontend layout or performance issue you resolved, and how you went about it.",
      "How do you keep yourself updated with the rapidly changing ecosystem of JavaScript and frontend frameworks?",
      "Why are you interested in becoming a Frontend Developer with our company?"
    ]
  },
  "Backend Engineer": {
    technical: [
      "Explain how Node.js handles asynchronous operations using the event loop, and what the libuv thread pool is.",
      "What is database indexing? How does it speed up queries, and what are the trade-offs associated with it?",
      "How would you design a rate-limiter for a public API? What storage/data structure would you use?"
    ],
    hr: [
      "Tell me about a time you had to optimize a slow database query or backend system. What was the impact?",
      "How do you handle conflicts with team members when deciding on database architecture or API design?",
      "What backend technologies are you most passionate about, and why?"
    ]
  },
  "Fullstack Engineer": {
    technical: [
      "Explain the lifecycle of a request from client-side render to database retrieval, and how you would optimize latency across layers.",
      "How do you handle state synchronization and caching between a client single-page application and database models?",
      "Explain how CORS works and how you would secure a session authentication flow across different domains."
    ],
    hr: [
      "Tell me about a time you had to balance feature delivery speed against architectural technical debt in a full-stack project.",
      "Do you prefer working on frontend layouts or backend schemas? How do you maintain equal proficiency in both?",
      "Why do you enjoy fullstack systems design over specialized engineering?"
    ]
  },
  "DevOps / Cloud Engineer": {
    technical: [
      "Explain the difference between mutable and immutable infrastructure, and how you would design a zero-downtime rolling update.",
      "What is a container orchestrator service mesh? When and why would you implement one in cloud deployments?",
      "How do you design a secure VPC configuration with public and private subnets, NAT gateways, and load balancers?"
    ],
    hr: [
      "Describe a time when a critical production service failed under load. How did you diagnose, resolve, and prevent it?",
      "How do you advocate for security compliance and infrastructure automation when development teams want to move fast?",
      "What drew you into cloud engineering and automation scripting?"
    ]
  },
  "Mobile Engineer": {
    technical: [
      "Explain memory management in mobile systems (e.g. ARC in iOS or GC in Android) and how to identify retention cycles.",
      "How do you optimize offline data sync and local database caching in mobile applications under poor network conditions?",
      "Describe how mobile app architectures (like MVVM or VIPER) solve code bloat and testing challenges compared to traditional MVC."
    ],
    hr: [
      "How do you handle differences in UX designs between platform guidelines (iOS vs Android) while maintaining a unified product feel?",
      "Tell me about a time you had to optimize battery usage or frame rendering speeds in a mobile application.",
      "Why are you passionate about mobile user experiences?"
    ]
  },
  "AI / Machine Learning Engineer": {
    technical: [
      "What is the difference between supervised and unsupervised learning, and when would you use a transformer-based model over traditional methods?",
      "Explain how Retrieval-Augmented Generation (RAG) works, and what methods you would use to improve chunking and retrieval accuracy.",
      "How do you prevent overfitting in deep learning models during training?"
    ],
    hr: [
      "AI is evolving incredibly fast. How do you decide which new research papers or models are worth implementing in your work?",
      "Describe a project where you had to explain a complex AI decision or black-box model to non-technical stakeholders.",
      "Why do you want to build AI systems at our company?"
    ]
  },
  "Data Engineer": {
    technical: [
      "Compare ETL (Extract-Transform-Load) and ELT (Extract-Load-Transform) patterns and when to use partition indexing in large data warehouses.",
      "Explain the difference between batch processing and stream processing with respect to message delivery guarantees.",
      "How would you design a data ingestion pipeline that handles out-of-order logs from millions of IoT sensors?"
    ],
    hr: [
      "How do you ensure data accuracy and schema validation when integrating new bulk streams from untrusted third parties?",
      "Tell me about a challenging pipeline failure or data corruption issue you resolved under pressure.",
      "Why did you choose data engineering over data analysis or general software development?"
    ]
  },
  "Data Analyst": {
    technical: [
      "What is the difference between inner join, left join, and outer join in SQL, and when would you use each?",
      "How do you handle missing or corrupted data in a dataset before starting your exploratory data analysis?",
      "Explain the difference between correlation and causation with a brief example."
    ],
    hr: [
      "Tell me about a time you found an unexpected trend or insight in a dataset. How did you communicate this finding to your team?",
      "How do you prioritize analytical tasks when multiple stakeholders demand reports at the same time?",
      "Why do you enjoy working with data, and what draws you to our analyst role?"
    ]
  },
  "Cybersecurity Engineer": {
    technical: [
      "Explain the difference between symmetric and asymmetric encryption, and how HTTPS uses both.",
      "What is a SQL injection vulnerability, and what are the primary ways to prevent it in backend code?",
      "How does OAuth 2.0 authentication work, and what is the security risk of using an implicit grant flow?"
    ],
    hr: [
      "Tell me about a time you discovered a security vulnerability in a project. How did you report and patch it?",
      "How do you balance the trade-off between strict security protocols and user convenience?",
      "What motivated you to specialize in Cybersecurity?"
    ]
  },
  "Product Manager": {
    technical: [
      "How do you measure product success? Walk me through how you define KPIs, North Star metrics, and guardrails for new features.",
      "How would you handle prioritizing a feature roadmap when engineering, sales, and executive teams have conflicting goals?",
      "Describe a framework you use to evaluate whether a proposed feature is worth the engineering resources to build."
    ],
    hr: [
      "Tell me about a time a product launch failed or did not meet metrics. What did you learn and how did you pivot?",
      "How do you communicate a difficult decision, like cutting a feature or postponing a launch, to cross-functional teams?",
      "What makes a product truly great in your eyes?"
    ]
  },
  "UI/UX Designer": {
    technical: [
      "Explain how you apply cognitive load principles, visual hierarchy, and accessibility guidelines (WCAG) to complex dashboard layouts.",
      "What is your process for creating, testing, and scaling a component design system across cross-functional teams?",
      "How do you use user testing data and A/B test logs to validate and iterate on wireframe layouts?"
    ],
    hr: [
      "How do you handle constructive criticism from developers or managers who want to compromise user experience for implementation ease?",
      "Tell me about a project where user research completely changed your initial design direction.",
      "What drew you into digital interface design?"
    ]
  },
  "QA Automation Engineer": {
    technical: [
      "What is the difference between integration testing, system testing, and regression testing in CI/CD build gates?",
      "How do you design a scalable test automation framework that minimizes flaky test runs across web and mobile platforms?",
      "Explain your testing approach for a highly distributed microservices platform. Where do you focus automation?"
    ],
    hr: [
      "How do you advocate for testing rigor when product managers want to ship a release ahead of testing cycles?",
      "Tell me about a major production bug that slipped past QA. How did you update your test suite to capture it next time?",
      "Why do you prefer QA automation over traditional development?"
    ]
  }
};

const getFallbackQuestion = (role: string, type: string, index: number): string => {
  const roleQuestions = OFFLINE_QUESTIONS[role] || OFFLINE_QUESTIONS["Frontend Engineer"];
  const list = roleQuestions[type] || roleQuestions.technical;
  return list[index % list.length];
};

export const startInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, type, resumeText } = req.body as { role: string; type: 'technical' | 'hr' | 'resume'; resumeText?: string };

    if (!role || !type) {
      res.status(400).json({ error: 'Role and Type are required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      const firstQuestion = getFallbackQuestion(role, type, 0);
      res.status(200).json({ question: firstQuestion, step: 1, totalSteps: 3 });
      return;
    }

    let prompt = `You are a principal technical recruiter and hiring manager at a top-tier tech firm (like Google, Stripe, or Netflix).
Generate the first interview question for a candidate applying for the role of ${role} (Interview type: ${type}).
The question must be professional, demanding, and highly representative of actual top-tier industry loops. For technical roles, focus on practical scenarios, architectural tradeoffs, system design concepts, or data structures. For HR roles, focus on leadership, problem-solving, and collaboration.
Keep the question brief and focused (1-2 sentences). Return ONLY the question text.`;

    if (type === 'resume' && resumeText) {
      prompt = `You are a principal technical recruiter and hiring manager at a top-tier tech firm (like Google, Stripe, or Netflix).
The candidate is applying for the role of ${role} and has provided the following resume:
"""
${resumeText}
"""
Generate a highly personalized, targeted first interview question based *specifically* on the projects, skills, or experience listed in their resume.
The question should ask them to dive deep into a specific technical decision, architectural tradeoff, or challenge they faced in one of their listed projects.
Keep the question brief and focused (1-2 sentences). Return ONLY the question text.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const question = response.text?.trim() || getFallbackQuestion(role, type, 0);

    // Save new interview session to MongoDB
    let interviewId = '';
    if (isDBConnected()) {
      try {
        const session = await InterviewModel.create({
          userId: req.body.userId || 'anonymous',
          role,
          type,
          history: [{ question, answer: '', feedback: '' }],
          status: 'in_progress',
        });
        interviewId = session._id.toString();
        console.log('[Interview] ✅ Session created in MongoDB:', interviewId);
      } catch (dbErr) {
        console.error('[Interview] MongoDB create error:', dbErr);
      }
    }

    res.status(200).json({ question, step: 1, totalSteps: 3, interviewId });
  } catch (error: any) {
    console.error('[Start Interview Error]:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const answerQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, type, question, answer, step, history } = req.body as {
      role: string;
      type: 'technical' | 'hr';
      question: string;
      answer: string;
      step: number;
      history: { question: string; answer: string }[];
    };

    if (!role || !type || !question || !answer || typeof step !== 'number') {
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }

    const nextStep = step + 1;
    const totalSteps = 3;

    if (!process.env.GEMINI_API_KEY) {
      // Offline/Mock evaluation
      if (nextStep <= totalSteps) {
        const nextQ = getFallbackQuestion(role, type, nextStep - 1);
        
        // Save offline intermediate step to MongoDB if interviewId is provided
        if (isDBConnected() && req.body.interviewId) {
          try {
            const session = await InterviewModel.findById(req.body.interviewId);
            if (session) {
              const dbHistory = session.history || [];
              if (dbHistory.length > 0) {
                dbHistory[dbHistory.length - 1].answer = answer;
                dbHistory[dbHistory.length - 1].feedback = "Good response. (Offline Mode)";
              }
              dbHistory.push({ question: nextQ, answer: '', feedback: '' });
              session.history = dbHistory;
              await session.save();
            }
          } catch (dbErr) {
            console.error('[Interview Offline] MongoDB intermediate update error:', dbErr);
          }
        }

        res.status(200).json({
          feedback: "Good response. You explained the core concepts well, though you could elaborate a bit more on real-world examples.",
          nextQuestion: nextQ,
          step: nextStep,
          totalSteps,
          isCompleted: false
        });
      } else {
        // Evaluate overall session offline
        const scores = type === 'technical' ? [82, 85, 78] : [88, 90, 85];
        const report = {
          technicalScore: scores[0],
          communicationScore: scores[1],
          confidenceScore: scores[2],
          detailedEvaluation: "You demonstrated solid knowledge in core topics. For improvement, structure your technical answers using the STAR method (Situation, Task, Action, Result) and try to specify performance metrics where applicable. (Offline Mode)",
          summary: "You demonstrated a strong foundation in core engineering paradigms and communicated your concepts clearly.",
          gaps: [
            "Structure technical responses using the STAR method.",
            "Elaborate with concrete performance metrics or latency trade-offs.",
            "Discuss potential edge cases or failure modes for the proposed design."
          ]
        };

        // Save offline completed interview to MongoDB
        if (isDBConnected() && req.body.interviewId) {
          try {
            const session = await InterviewModel.findById(req.body.interviewId);
            if (session) {
              const dbHistory = session.history || [];
              if (dbHistory.length > 0) {
                dbHistory[dbHistory.length - 1].answer = answer;
                dbHistory[dbHistory.length - 1].feedback = "Solid concluding response.";
              }
              session.history = dbHistory;
              session.report = report;
              session.status = 'completed';
              await session.save();
            }
          } catch (dbErr) {
            console.error('[Interview Offline] MongoDB final update error:', dbErr);
          }
        }

        res.status(200).json({
          feedback: "Solid concluding response.",
          nextQuestion: null,
          step: nextStep,
          totalSteps,
          isCompleted: true,
          report
        });
      }
      return;
    }

    if (nextStep <= totalSteps) {
      // Evaluate current answer AND generate next question using Gemini
      const prompt = `You are an elite hiring manager conducting a ${type} interview for the role of ${role}.
The candidate just answered the question: "${question}"
Their answer: "${answer}"

Analyze the answer rigorously. Provide a brief, constructive feedback on their answer (1-2 sentences) highlighting what they did well and what key detail or depth they missed. Then generate a logical follow-up question that pushes them to expand on technical details, address edge cases, or discuss scalability/trade-offs.

Return ONLY a valid JSON object matching this structure:
{
  "feedback": "constructive feedback text",
  "nextQuestion": "next interview question"
}
Do NOT return markdown, explanation, or wrap it in anything other than the raw JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '{}';
      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      let parsed = { feedback: "Good answer.", nextQuestion: getFallbackQuestion(role, type, nextStep - 1) };
      try {
        parsed = JSON.parse(jsonStr);
      } catch (err) {
        console.error('Failed to parse Gemini JSON on middle question evaluation, using fallback.', err);
      }

      // Save intermediate answer and next question to MongoDB
      if (isDBConnected() && req.body.interviewId) {
        try {
          const session = await InterviewModel.findById(req.body.interviewId);
          if (session) {
            const dbHistory = session.history || [];
            if (dbHistory.length > 0) {
              dbHistory[dbHistory.length - 1].answer = answer;
              dbHistory[dbHistory.length - 1].feedback = parsed.feedback || '';
            }
            dbHistory.push({ question: parsed.nextQuestion, answer: '', feedback: '' });
            session.history = dbHistory;
            await session.save();
            console.log('[Interview] ✅ Intermediate step saved to MongoDB');
          }
        } catch (dbErr) {
          console.error('[Interview] MongoDB intermediate update error:', dbErr);
        }
      }

      res.status(200).json({
        feedback: parsed.feedback,
        nextQuestion: parsed.nextQuestion,
        step: nextStep,
        totalSteps,
        isCompleted: false
      });
    } else {
      // Final question evaluation - Generate score card
      const fullHistory = [...(history || []), { question, answer }];
      const historyStr = fullHistory.map((h, i) => `Q${i+1}: ${h.question}\nA${i+1}: ${h.answer}`).join('\n\n');

      const prompt = `You are a senior placement board director and principal architect evaluating a candidate for the role of ${role} after a 3-question ${type} interview.
Here is the full transcript of the interview:
${historyStr}

Perform a rigorous, professional evaluation and score the candidate based on these strict rubrics:
- Technical Score (0-100): Depth of knowledge, correct explanations of architectures/paradigms, consideration of edge cases, and accuracy of terms.
- Communication Score (0-100): Structured logic, clarity of thoughts, avoiding vagueness, using clear examples (e.g. STAR method).
- Confidence Score (0-100): Certainty, tone, ownership of designs/tradeoffs, and clarity of articulation.

Generate a JSON object containing:
- feedback: string — brief concluding comment on the final answer
- report: object:
  - technicalScore: number (0-100) — score for domain knowledge / accuracy
  - communicationScore: number (0-100) — score for clarity and structure
  - confidenceScore: number (0-100) — score for tone and certainty
  - detailedEvaluation: string — a detailed, professional, constructive summary (2-3 paragraphs) listing exactly what they did well, specific technical gaps or incorrect assumptions they made, and clear actionable steps to improve before a real placement interview.
  - summary: string — a concise 1-2 sentence assessment summarizing their overall performance matching the role requirements.
  - gaps: array of strings — 3 to 4 specific gaps or improvement areas identified in their answers (such as specific concepts they missed, incorrect assumptions they made).

Return ONLY a valid JSON object. No explanation, no markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '{}';
      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      let parsed = {
        feedback: "Interview completed.",
        report: {
          technicalScore: 80,
          communicationScore: 82,
          confidenceScore: 78,
          detailedEvaluation: "Good interview overall. Work on deep-diving into system design tradeoffs.",
          summary: "Good interview overall. Demonstrated clear potential in role competencies.",
          gaps: [
            "Elaborate further on scalability issues.",
            "Refine code modularity under load.",
            "Demonstrate familiarity with more edge cases."
          ]
        }
      };

      try {
        parsed = JSON.parse(jsonStr);
      } catch (err) {
        console.error('Failed to parse Gemini JSON on final evaluation, using fallback.', err);
      }

      // Save completed interview to MongoDB
      if (isDBConnected() && req.body.interviewId) {
        try {
          const session = await InterviewModel.findById(req.body.interviewId);
          if (session) {
            const dbHistory = session.history || [];
            if (dbHistory.length > 0) {
              dbHistory[dbHistory.length - 1].answer = answer;
              dbHistory[dbHistory.length - 1].feedback = parsed.feedback || '';
            }
            session.history = dbHistory;
            session.report = parsed.report || null;
            session.status = 'completed';
            await session.save();
            console.log('[Interview] ✅ Final evaluation saved to MongoDB');
          }
        } catch (dbErr) {
          console.error('[Interview] MongoDB final update error:', dbErr);
        }
      }

      res.status(200).json({
        feedback: parsed.feedback,
        nextQuestion: null,
        step: nextStep,
        totalSteps,
        isCompleted: true,
        report: parsed.report
      });
    }
  } catch (error: any) {
    console.error('[Answer Question Error]:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const getInterviewHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (!isDBConnected()) {
      res.status(200).json([]);
      return;
    }

    const sessions = await InterviewModel.find({ userId, status: 'completed' })
      .sort({ createdAt: -1 });

    res.status(200).json(sessions);
  } catch (error: any) {
    console.error('[Get History Error]:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const executeCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language, code } = req.body as { language: string; code: string };
    if (!language || !code) {
      res.status(400).json({ error: 'Language and code are required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(200).json({ success: true, stdout: `${language} mock executed successfully (Offline Mode)`, stderr: '' });
      return;
    }

    const prompt = `You are a secure, sandboxed code execution environment (compiler and runner).
The user wants to execute the following code block in the ${language} programming language:

\`\`\`${language}
${code}
\`\`\`

Analyze the code. If there are syntax errors, compile errors, runtime errors, or uncaught exceptions, capture them. If there are no errors, simulate execution and capture the standard output (stdout).
Provide the execution details. Return ONLY a valid JSON object matching this structure:
{
  "success": true if executed with exit code 0 else false,
  "stdout": "output standard stream contents",
  "stderr": "compilation or runtime errors if success is false else empty string"
}
Do NOT return any markdown, explanation, or wrap the JSON in anything other than the raw JSON itself. Ensure standard error messages look authentic (e.g. including line numbers if applicable).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '{}';
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let result = { success: false, stdout: '', stderr: 'Execution simulation failed.' };
    try {
      result = JSON.parse(jsonStr);
    } catch (err) {
      console.error('Failed to parse Gemini code execution result JSON:', err);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('[Execute Code Error]:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const generateSpeech = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voiceId = 'pNInz6obpgDQGcFmaJgB' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'ELEVENLABS_API_KEY is not configured' });
      return;
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ElevenLabs API Error]:', response.status, errorText);
      res.status(response.status).json({ error: 'ElevenLabs API error', details: errorText });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length.toString()
    });

    res.send(buffer);
  } catch (error: any) {
    console.error('[Generate Speech Error]:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
