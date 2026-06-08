import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import RecommendedProject from '../models/RecommendedProject';
import Resume from '../models/Resume';
import BuiltResume from '../models/BuiltResume';
import { isDBConnected } from '../db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const INITIAL_PROJECTS = [
  {
    title: "Autonomous RAG Knowledge Hub",
    description: "An AI-powered document semantic lookup agent that performs contextual chunking, hierarchical indexing, and real-time response generation.",
    difficulty: "Advanced" as const,
    estimatedTime: "2-3 Weeks",
    tags: ["Next.js", "Python", "Pinecone", "LangChain"],
    roleTarget: "AI Engine Engineer",
    phases: [
      {
        title: "Week 1: Ingestion & Vector Pipeline",
        tasks: [
          { text: "Set up custom PDF parsing using python-pdfminer", completed: false },
          { text: "Implement recursive character text splitting with overlapping windows", completed: false },
          { text: "Generate embeddings using OpenAI text-embedding-3-small and upload to Pinecone index", completed: false }
        ]
      },
      {
        title: "Week 2: Hybrid Query Retrieval",
        tasks: [
          { text: "Integrate BM25 sparse keyword scores with dense vector semantic results", completed: false },
          { text: "Apply Cohere Re-ranker to sort top 10 documents down to top 3 context windows", completed: false },
          { text: "Build sliding-context prompt buffers to prevent LLM hallucination", completed: false }
        ]
      },
      {
        title: "Week 3: Agentic UI Orchestration",
        tasks: [
          { text: "Create streaming API gateway using Next.js route handlers", completed: false },
          { text: "Develop glassmorphic chat pane showing citation node maps", completed: false },
          { text: "Benchmark latency and retrieval context accuracy metrics", completed: false }
        ]
      }
    ],
    architecture: ["Ingestion Pipeline", "Vector DB Embeddings", "Re-ranking Engine", "Streaming Chat API"],
    whyFits: "Strengthens Python and LLM workflow experience while establishing semantic search vector pipeline patterns.",
    isSaved: false
  },
  {
    title: "High-Throughput Analytics Dashboard",
    description: "A real-time telemetry visualizer built for web apps, processing WebSockets streaming data with ultra-low latency canvas rendering.",
    difficulty: "Intermediate" as const,
    estimatedTime: "1-2 Weeks",
    tags: ["React", "FastAPI", "Redis", "ChartJS"],
    roleTarget: "Fullstack Developer",
    phases: [
      {
        title: "Week 1: WebSocket Backend Feed",
        tasks: [
          { text: "Establish high-frequency telemetry generator in FastAPI", completed: false },
          { text: "Deploy Redis pub-sub channels to partition payload streaming", completed: false },
          { text: "Handle concurrent client socket heartbeats and cleanup routines", completed: false }
        ]
      },
      {
        title: "Week 2: UI Canvas Render Optimization",
        tasks: [
          { text: "Construct interactive layout panels using Tailwind glass styles", completed: false },
          { text: "Use Canvas2D context or ChartJS stream adapter for high refresh charts", completed: false },
          { text: "Batch UI updates to minimize React re-render cycles", completed: false }
        ]
      }
    ],
    architecture: ["FastAPI WebSocket Server", "Redis Sub/Pub", "React Telemetry Consumer", "HTML5 Canvas Chart Grid"],
    whyFits: "Builds experience in web socket performance and real-time state orchestration using FastAPI and Redis.",
    isSaved: false
  },
  {
    title: "Decentralized Escrow Smart Contract Hub",
    description: "Multi-party automated transaction verification protocol enforcing programmatic release controls under customizable criteria.",
    difficulty: "Advanced" as const,
    estimatedTime: "3 Weeks",
    tags: ["Solidity", "Hardhat", "Ether.js", "React"],
    roleTarget: "Blockchain Developer",
    phases: [
      {
        title: "Week 1: Smart Contract Protocol",
        tasks: [
          { text: "Write Solidity contracts modeling party deposit and dispute windows", completed: false },
          { text: "Implement Multi-signature release checks and re-entrancy protection guards", completed: false },
          { text: "Draft exhaustive test suite verifying extreme condition fallbacks", completed: false }
        ]
      },
      {
        title: "Week 2: Smart Contract Local Testing",
        tasks: [
          { text: "Configure Hardhat local nodes and mock ERC-20 token distributions", completed: false },
          { text: "Write integration script simulating multi-stage contract fulfillment", completed: false },
          { text: "Run gas optimization audit tools", completed: false }
        ]
      },
      {
        title: "Week 3: Web3 Interface Bridge",
        tasks: [
          { text: "Integrate wagmi hooks to establish MetaMask or Rainbow connection profiles", completed: false },
          { text: "Read contract states and trigger deposit operations using Viem/Ethers", completed: false },
          { text: "Include transactional gas fee estimations and pending progress overlays", completed: false }
        ]
      }
    ],
    architecture: ["Solidity Core Contract", "Hardhat Test Rig", "Viem / Wagmi Connectors", "Transaction Ledger UI"],
    whyFits: "Demonstrates blockchain smart contract safety execution alongside standard Web3 client integration flows.",
    isSaved: false
  }
];

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ error: 'userId parameter is required' });
      return;
    }

    if (!isDBConnected()) {
      // Database is not connected, return mocked projects directly
      const mockProjects = INITIAL_PROJECTS.map((proj, idx) => ({
        ...proj,
        _id: `mock-db-${idx}`,
        userId
      }));
      res.status(200).json({ projects: mockProjects });
      return;
    }

    let projects = await RecommendedProject.find({ userId }).sort({ createdAt: -1 });

    if (projects.length === 0) {
      // Seed with initial projects
      console.log(`[Project Recs] Seeding default projects for user: ${userId}`);
      const seedData = INITIAL_PROJECTS.map(proj => ({
        ...proj,
        userId
      }));
      await RecommendedProject.insertMany(seedData);
      projects = await RecommendedProject.find({ userId }).sort({ createdAt: -1 });
    }

    res.status(200).json({ projects });
  } catch (error: any) {
    console.error('Error fetching project recommendations:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const generateRecommendation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, targetRole, difficulty, customSkills, focusOnGaps } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    // Attempt to retrieve latest resume skills and missing keywords
    let studentSkills: string[] = [];
    let missingKeywords: string[] = [];

    if (isDBConnected()) {
      try {
        const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
        if (latestResume) {
          studentSkills = latestResume.skills || [];
          missingKeywords = latestResume.missingKeywords || [];
        } else {
          // Check built resume
          const builtResume = await BuiltResume.findOne({ userId });
          if (builtResume && builtResume.skills) {
            const { languages = [], frameworks = [], databases = [], tools = [] } = builtResume.skills;
            studentSkills = [...languages, ...frameworks, ...databases, ...tools];
          }
        }
      } catch (err) {
        console.error('[Project Recs] Failed to load resume background for AI generation:', err);
      }
    }

    // Default fallbacks if empty
    if (studentSkills.length === 0) {
      studentSkills = ["React", "JavaScript", "HTML", "CSS"];
    }

    // Perform AI-generation using Gemini Pro/Flash
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a principal software engineer, elite system architect, and technical placement director.
You need to suggest ONE highly customized, realistic, and commercially-valuable software engineering project for a student with the following profile:
- Current Technical Skills: ${studentSkills.join(', ')}
- Resume Gaps (Missing Core Technologies/Concepts): ${focusOnGaps ? missingKeywords.join(', ') : 'None specified'}
- Targeted Engineering Role: ${targetRole || 'Fullstack Developer'}
- Target Difficulty Level: ${difficulty || 'Intermediate'}
- Tech/Skills requested to practice: ${customSkills || 'None specified'}

The recommended project must specifically help the student bridge their resume gaps (prioritize missing keywords like Redis, Docker, CI/CD, AWS, etc., if applicable) and demonstrate target role capabilities.
Generate exactly 1 phase for Beginner projects (titled 'Week 1: ...'), exactly 2 phases for Intermediate projects ('Week 1: ...', 'Week 2: ...'), and exactly 3 phases for Advanced projects ('Week 1: ...', 'Week 2: ...', 'Week 3: ...').

Return the recommended project in valid JSON format. Follow this exact JSON structure:
{
  "title": string,
  "description": string,
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTime": string (e.g. "1-2 Weeks", "3 Weeks"),
  "tags": string[] (4-6 key tech badges),
  "roleTarget": string,
  "architecture": string[] (exactly 4 system design components or building blocks),
  "whyFits": string (a professional, customized sentence explaining why this fits their profile and bridges their skills/resume gaps),
  "problemStatement": string (a comprehensive paragraph detailing the real-world problem and user/business pain point this project solves),
  "detailedTechStack": [
    {
      "name": string (technology name),
      "justification": string (1-2 sentences on why this tech was chosen for this project and its exact responsibility in the system)
    }
  ] (length must match tags),
  "learningDeliverables": string[] (exactly 3 bullet points describing the concrete skills, patterns, or architecture rules the student will master by building this project),
  "phases": [
    {
      "title": string (e.g. "Week 1: Core Setup & Schema Integration"),
      "tasks": string[] (exactly 3 detailed, clear, action-oriented implementation items per phase)
    }
  ]
}

Return ONLY the raw JSON object. Do not wrap in markdown \`\`\`json blocks, do not include preamble or conversational output. Ensure all JSON fields are formatted correctly.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '{}';
        const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        // Map phases/tasks to include completed status
        const formattedPhases = (parsed.phases || []).map((phase: any) => ({
          title: phase.title || 'Phase',
          tasks: (phase.tasks || []).map((taskStr: string) => ({
            text: taskStr,
            completed: false
          }))
        }));

        const newProjectData = {
          userId,
          title: parsed.title || "Custom AI Engineering Sandbox",
          description: parsed.description || "A personalized project designed to master modern engineering tools and frameworks.",
          difficulty: parsed.difficulty || (difficulty || "Intermediate"),
          estimatedTime: parsed.estimatedTime || "2 Weeks",
          tags: parsed.tags || studentSkills.slice(0, 4),
          roleTarget: parsed.roleTarget || (targetRole || "Fullstack Developer"),
          architecture: parsed.architecture || ["Client App", "REST API", "Database", "Caching Layer"],
          whyFits: parsed.whyFits || "Bridges key architectural understanding and modern tech stacks.",
          phases: formattedPhases,
          isSaved: false,
          problemStatement: parsed.problemStatement || "A customized project targeting role preparation and placement credentials.",
          detailedTechStack: parsed.detailedTechStack || [],
          learningDeliverables: parsed.learningDeliverables || ["Industrial systems orchestration", "API engineering best practices", "Modern tech stack design"]
        };

        let savedProject: any = newProjectData;
        if (isDBConnected()) {
          const doc = await RecommendedProject.create(newProjectData);
          savedProject = doc.toObject();
        }

        res.status(200).json({ project: savedProject });
        return;
      } catch (aiErr: any) {
        console.error('[Project Recs] Gemini generation failed, running mock generation fallback:', aiErr);
      }
    }

    // Mock Fallback implementation if API key is missing or AI fails
    console.log('[Project Recs] Servicing simulated AI response.');
    
    // Choose mock project based on target role
    let mockTitle = "Scalable Serverless Payment Gateway";
    let mockDesc = "A secure multi-tenant payment validation API modeling transaction queues, idempotency checks, and Stripe webhooks integration.";
    let mockRole = targetRole || "Backend Engineer";
    let mockTags = ["Node.js", "Express", "RabbitMQ", "Stripe API", "PostgreSQL"];
    let mockArch = ["Client Checkout UI", "API Gateway & Auth", "RabbitMQ Transaction Queue", "Worker Payment Processor"];
    let mockWhy = "Enforces asynchronous payment processing logic and idempotency patterns missing from your resume.";
    let mockProblem = "E-commerce developers require a robust payment gateway integration, but handling failures, duplicate charges, and webhook drops poses complex distributed system challenges.";
    let mockTechStack = [
      { name: "Node.js", justification: "Provides non-blocking event loops ideal for concurrent queue notifications and transactions." },
      { name: "Express", justification: "Lightweight routing framework for fast HTTP entrypoints." },
      { name: "RabbitMQ", justification: "Message broker used to isolate payment processing and prevent webhook drops." },
      { name: "Stripe API", justification: "Core merchant transaction engine." },
      { name: "PostgreSQL", justification: "Relational database supporting transactions with ACID compliance." }
    ];
    let mockDeliverables = [
      "Implementing RabbitMQ queues and worker processing patterns.",
      "Resolving API idempotency using key stores.",
      "Securing API requests and processing Stripe webhooks."
    ];
    let mockPhases = [
      {
        title: "Week 1: API & Security Framework",
        tasks: [
          { text: "Write core Express router validating requests using Joi schemas", completed: false },
          { text: "Implement JWT session authorization with RSA encryption keys", completed: false },
          { text: "Design database schemas modeling Transactions, Wallets, and Audits", completed: false }
        ]
      },
      {
        title: "Week 2: Queue & Webhook Gateway",
        tasks: [
          { text: "Configure RabbitMQ exchange to stream transaction requests", completed: false },
          { text: "Build payment webhook processor handling Stripe events", completed: false },
          { text: "Write idempotency checker middleware using Redis store key checks", completed: false }
        ]
      }
    ];

    if (mockRole.toLowerCase().includes("ai") || mockRole.toLowerCase().includes("machine") || mockRole.toLowerCase().includes("ml")) {
      mockTitle = "Real-time AI Video Copilot";
      mockDesc = "An in-browser screen and audio analyzer leveraging Gemini Multimodal Live API to provide visual feedback and automated voice responses.";
      mockRole = "AI Frontend Architect";
      mockTags = ["WebRTC", "Next.js", "Gemini API", "Tailwind"];
      mockArch = ["Screen Capture Engine", "Frame Processing Pipeline", "Gemini Flash API Adapter", "Floating Copilot Overlay"];
      mockWhy = "Leverages WebRTC media streams and LLM API endpoints to build state-of-the-art multimodal web agents.";
      mockProblem = "Students lack immediate feedback on active programming sessions or mock environments. A real-time capture and response engine can stream advice dynamically.";
      mockTechStack = [
        { name: "WebRTC", justification: "Streams client capture buffers directly to processing pipelines with ultra-low latency." },
        { name: "Next.js", justification: "Orchestrates API routers and serves responsive glassmorphism control interfaces." },
        { name: "Gemini API", justification: "Generates semantic multimodal assessments of visual frames." },
        { name: "Tailwind", justification: "Utility-first CSS framework for rapid interface layout styling." }
      ];
      mockDeliverables = [
        "Handling real-time media streams and binary buffers in Node.",
        "Integrating Gemini API's vision and structured output models.",
        "Designing WebSocket server infrastructure for real-time bi-directional events."
      ];
      mockPhases = [
        {
          title: "Week 1: Media Capture Setup",
          tasks: [
            { text: "Create WebRTC capture stream for user screens or webcam feeds", completed: false },
            { text: "Compress frames at 1fps using Canvas grab workflows", completed: false },
            { text: "Maintain persistent WebSockets session to target endpoints", completed: false }
          ]
        },
        {
          title: "Week 2: Gemini Stream Integration",
          tasks: [
            { text: "Send sequential visual buffers to Gemini Flash models with prompt instructions", completed: false },
            { text: "Receive structured JSON suggestions mapping current workspace state", completed: false },
            { text: "Build customizable hotkey controls to pause or resume analysis instantly", completed: false }
          ]
        }
      ];
    } else if (mockRole.toLowerCase().includes("frontend") || mockRole.toLowerCase().includes("ui")) {
      mockTitle = "Dynamic Drag-and-Drop Form Builder";
      mockDesc = "An interactive, low-code interface builder where users drag components, configure styling rules, and export functional React page bundles.";
      mockRole = "Frontend Engineer";
      mockTags = ["Next.js", "React DnD", "TypeScript", "Tailwind"];
      mockArch = ["Draggable Toolbox Panels", "Form Canvas Layout Generator", "JSON Schema Compiler", "React Code Exporter"];
      mockWhy = "Strengthens React rendering optimization, complex drag-and-drop state, and browser-compiled code generation.";
      mockProblem = "Non-technical users require customizable interfaces, but manually designing responsive forms takes massive developer hours. A visual drag-and-drop tool solves this.";
      mockTechStack = [
        { name: "Next.js", justification: "Compiles page components and hosts dynamic UI rendering blocks." },
        { name: "React DnD", justification: "Provides low-level drag-and-drop mechanics for workspace canvas interactions." },
        { name: "TypeScript", justification: "Statically types canvas configurations to prevent structural runtime errors." },
        { name: "Tailwind", justification: "Utility classes for rapid custom styling configurations on forms." }
      ];
      mockDeliverables = [
        "Managing nested drag-and-drop state representations.",
        "Writing JSON schema AST compilers.",
        "Isolating user code previews in secure sandbox environments."
      ];
      mockPhases = [
        {
          title: "Week 1: Draggable Component Grid",
          tasks: [
            { text: "Integrate React DnD to model toolbox controls and canvas drops", completed: false },
            { text: "Maintain nested state configuration representing form elements schema", completed: false },
            { text: "Create properties editing bar permitting instant CSS style modifications", completed: false }
          ]
        },
        {
          title: "Week 2: Code Compilation & Export",
          tasks: [
            { text: "Write AST generator compiling UI JSON states to valid React typescript syntax", completed: false },
            { text: "Bundle code output using JSZip for one-click ZIP package download", completed: false },
            { text: "Set up preview sandbox executing the compiled UI inside iframe scopes", completed: false }
          ]
        }
      ];
    }

    const mockProjectData = {
      userId,
      title: mockTitle,
      description: mockDesc,
      difficulty: difficulty || "Advanced",
      estimatedTime: "2 Weeks",
      tags: mockTags,
      roleTarget: mockRole,
      architecture: mockArch,
      whyFits: mockWhy,
      phases: mockPhases,
      isSaved: false,
      problemStatement: mockProblem,
      detailedTechStack: mockTechStack,
      learningDeliverables: mockDeliverables
    };

    let responseData: any = mockProjectData;
    if (isDBConnected()) {
      const doc = await RecommendedProject.create(mockProjectData);
      responseData = doc.toObject();
    } else {
      (responseData as any)._id = `mock-gen-${Date.now()}`;
    }

    res.status(200).json({ project: responseData });
  } catch (error: any) {
    console.error('Error generating project recommendation:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const toggleTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { phaseIndex, taskIndex } = req.body;

    if (phaseIndex === undefined || taskIndex === undefined) {
      res.status(450).json({ error: 'phaseIndex and taskIndex are required' });
      return;
    }

    if (!isDBConnected()) {
      res.status(200).json({ message: 'Mock toggle complete (No DB Connection)' });
      return;
    }

    const project = await RecommendedProject.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project recommendation not found' });
      return;
    }

    if (!project.phases[phaseIndex] || !project.phases[phaseIndex].tasks[taskIndex]) {
      res.status(400).json({ error: 'Invalid phaseIndex or taskIndex' });
      return;
    }

    const task = project.phases[phaseIndex].tasks[taskIndex];
    task.completed = !task.completed;

    // Use markModified to let Mongoose know the nested array changed
    project.markModified('phases');
    await project.save();

    res.status(200).json({ project });
  } catch (error: any) {
    console.error('Error toggling task status:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const saveProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!isDBConnected()) {
      res.status(200).json({ message: 'Mock bookmark complete (No DB Connection)' });
      return;
    }

    const project = await RecommendedProject.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project recommendation not found' });
      return;
    }

    project.isSaved = !project.isSaved;
    await project.save();

    res.status(200).json({ project });
  } catch (error: any) {
    console.error('Error saving/pinning project:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!isDBConnected()) {
      res.status(200).json({ success: true, message: 'Mock deletion complete (No DB Connection)' });
      return;
    }

    const result = await RecommendedProject.findByIdAndDelete(projectId);
    if (!result) {
      res.status(404).json({ error: 'Project recommendation not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Project recommendation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
