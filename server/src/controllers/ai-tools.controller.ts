import { Request, Response } from 'express';

import AIToolsData from '../models/AIToolsData';
import Resume from '../models/Resume';
import Interview from '../models/Interview';
import StudentProfile from '../models/StudentProfile';
import { isDBConnected } from '../db';
import axios from 'axios';

import { generateContentWithFallback } from '../utils/gemini';

// Helper: call Gemini and parse JSON from response with retry mechanism
async function callGeminiJSON(prompt: string): Promise<any> {
  const response = await generateContentWithFallback({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: 'You are an expert career advisor AI for engineering students. Always respond with valid JSON only. No markdown fences, no extra text — just the JSON object.',
    },
  });
  const text = (response.text || '').trim();
  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

// Helper: get or create AIToolsData doc
async function getOrCreateDoc(userId: string) {
  let doc = await AIToolsData.findOne({ userId });
  if (!doc) {
    doc = await AIToolsData.create({ userId });
  }
  return doc;
}

// ─── 1. Career Health Score ───────────────────────────────────────
export const generateCareerHealthScore = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    // Gather all student data
    const [profile, resume, interviews] = await Promise.all([
      StudentProfile.findOne({ userId }),
      Resume.findOne({ userId }).sort({ createdAt: -1 }),
      Interview.find({ userId, status: 'completed' }),
    ]);

    const prompt = `Analyze this student's career readiness and generate a Career Health Score (0-100).

Student Data:
- Resume ATS Score: ${resume?.atsScore || 'Not uploaded'}
- Skills: ${resume?.skills?.join(', ') || 'None listed'}
- Projects: ${resume?.projects?.join(', ') || 'None'}
- Experience: ${resume?.experience?.join(', ') || 'None'}
- GitHub: ${profile?.github || 'Not connected'}
- LinkedIn: ${profile?.linkedin || 'Not connected'}
- Completed Interviews: ${interviews.length}
- Average Interview Score: ${interviews.length > 0 ? Math.round(interviews.reduce((sum, i) => sum + ((i.report?.technicalScore || 0) + (i.report?.communicationScore || 0) + (i.report?.confidenceScore || 0)) / 3, 0) / interviews.length) : 'No interviews'}
- Coding Handles: LeetCode: ${profile?.codingHandles?.leetcode || 'None'}, Codeforces: ${profile?.codingHandles?.codeforces || 'None'}

Return JSON:
{
  "score": <number 0-100>,
  "categories": [
    {"name": "Resume Quality", "score": <0-100>, "maxScore": 100},
    {"name": "Coding Progress", "score": <0-100>, "maxScore": 100},
    {"name": "Interview Performance", "score": <0-100>, "maxScore": 100},
    {"name": "Projects", "score": <0-100>, "maxScore": 100},
    {"name": "Certifications", "score": <0-100>, "maxScore": 100},
    {"name": "Skills", "score": <0-100>, "maxScore": 100},
    {"name": "LinkedIn Profile", "score": <0-100>, "maxScore": 100},
    {"name": "GitHub Activity", "score": <0-100>, "maxScore": 100}
  ],
  "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>", "<suggestion4>", "<suggestion5>"]
}`;

    const result = await callGeminiJSON(prompt);
    const data = {
      score: result.score,
      categories: result.categories,
      suggestions: result.suggestions,
      generatedAt: new Date(),
    };

    if (isDBConnected()) {
      await AIToolsData.findOneAndUpdate(
        { userId },
        { $set: { careerHealthScore: data } },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('[AI Tools] Career Health Score error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 2. Dream Company Roadmap ─────────────────────────────────────
export const generateDreamCompanyRoadmap = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { company } = req.body;
    if (!userId || !company) return res.status(400).json({ success: false, error: 'User ID and company required' });

    const [profile, resume] = await Promise.all([
      StudentProfile.findOne({ userId }),
      Resume.findOne({ userId }).sort({ createdAt: -1 }),
    ]);

    const prompt = `Create a detailed preparation roadmap for a student targeting ${company}.

Student's current profile:
- Skills: ${resume?.skills?.join(', ') || 'None listed'}
- Projects: ${resume?.projects?.join(', ') || 'None'}
- Degree: ${profile?.degree || 'Unknown'}
- Graduation Year: ${profile?.gradYear || 'Unknown'}

Return JSON:
{
  "technicalSkills": ["skill1", "skill2", ...],
  "dsaRoadmap": ["Step 1: ...", "Step 2: ...", ...],
  "recommendedProjects": ["project1 description", "project2 description", ...],
  "certifications": ["cert1", "cert2", ...],
  "interviewPrep": ["tip1", "tip2", ...],
  "timeline": "Estimated X months preparation",
  "actionPlan": ["Week 1-2: ...", "Week 3-4: ...", ...]
}`;

    const result = await callGeminiJSON(prompt);
    const roadmapEntry = {
      company,
      roadmap: result,
      generatedAt: new Date(),
    };

    if (isDBConnected()) {
      await AIToolsData.findOneAndUpdate(
        { userId },
        { $push: { dreamCompanyRoadmaps: { $each: [roadmapEntry], $slice: -10 } } },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data: roadmapEntry });
  } catch (error: any) {
    console.error('[AI Tools] Dream Company Roadmap error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 3. GitHub Profile Analyzer ───────────────────────────────────
export const analyzeGitHubProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;
    if (!userId || !username) return res.status(400).json({ success: false, error: 'User ID and GitHub username required' });

    // Fetch GitHub data
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'CareerPilot' };
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;

    let ghUser: any = {};
    let repos: any[] = [];
    let languages: Record<string, number> = {};

    try {
      const [userRes, reposRes] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`, { headers }),
        axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
      ]);
      ghUser = userRes.data;
      repos = reposRes.data;

      // Aggregate languages
      for (const repo of repos.slice(0, 20)) {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      }
    } catch (ghErr: any) {
      console.error('[AI Tools] GitHub API error:', ghErr.message);
      return res.status(400).json({ success: false, error: 'Could not fetch GitHub profile. Check the username.' });
    }

    const totalLangs = Object.values(languages).reduce((a, b) => a + b, 0) || 1;
    const langList = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, percentage: Math.round((count / totalLangs) * 100) }));

    const repoSummary = repos.slice(0, 15).map(r => ({
      name: r.name,
      description: r.description || 'No description',
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      hasReadme: true, // GitHub repos have README by default
      updatedAt: r.updated_at,
    }));

    const prompt = `Analyze this GitHub profile and provide a detailed assessment.

GitHub Profile:
- Username: ${username}
- Public Repos: ${ghUser.public_repos || repos.length}
- Followers: ${ghUser.followers || 0}
- Following: ${ghUser.following || 0}
- Account Created: ${ghUser.created_at || 'Unknown'}
- Bio: ${ghUser.bio || 'None'}

Top Repositories:
${JSON.stringify(repoSummary, null, 2)}

Languages Used: ${langList.map(l => `${l.name} (${l.percentage}%)`).join(', ')}

Return JSON:
{
  "score": <number 0-100>,
  "metrics": {
    "repositoryQuality": <0-100>,
    "readmeQuality": <0-100>,
    "commitConsistency": <0-100>,
    "languageDiversity": <0-100>,
    "projectDiversity": <0-100>,
    "openSourceContributions": <0-100>
  },
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "report": "<detailed 3-4 paragraph analysis>"
}`;

    const result = await callGeminiJSON(prompt);
    const analysis = {
      username,
      score: result.score,
      metrics: result.metrics,
      languages: langList,
      suggestions: result.suggestions,
      report: result.report,
      generatedAt: new Date(),
    };

    if (isDBConnected()) {
      await AIToolsData.findOneAndUpdate(
        { userId },
        { $set: { githubAnalysis: analysis } },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('[AI Tools] GitHub Analyzer error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 4. Portfolio Analyzer ────────────────────────────────────────
export const analyzePortfolio = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { url } = req.body;
    if (!userId || !url) return res.status(400).json({ success: false, error: 'User ID and portfolio URL required' });

    const prompt = `You are an expert web developer and UX designer. Analyze the portfolio website at: ${url}

Based on common best practices for developer portfolios, evaluate the following categories. Since you cannot render the page, use your knowledge of what a well-structured portfolio at this URL domain would typically contain and assess based on the URL structure, common patterns, and best practices.

Return JSON:
{
  "score": <number 0-100>,
  "metrics": {
    "uiux": <0-100>,
    "responsiveness": <0-100>,
    "accessibility": <0-100>,
    "projectQuality": <0-100>,
    "performance": <0-100>,
    "seo": <0-100>,
    "missingSections": ["section1", "section2"],
    "contactInfo": <true/false>
  },
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "checklist": [
    {"item": "Hero section with clear intro", "status": "pass"},
    {"item": "Projects showcase with live links", "status": "warning"},
    {"item": "Contact form or email link", "status": "fail"},
    {"item": "Responsive mobile design", "status": "pass"},
    {"item": "SEO meta tags", "status": "warning"},
    {"item": "Performance optimization", "status": "pass"},
    {"item": "About section with photo", "status": "pass"},
    {"item": "Skills/Tech stack section", "status": "pass"},
    {"item": "Social media links", "status": "warning"},
    {"item": "Blog or articles section", "status": "fail"}
  ]
}`;

    const result = await callGeminiJSON(prompt);
    const analysis = {
      url,
      score: result.score,
      metrics: result.metrics,
      suggestions: result.suggestions,
      checklist: result.checklist,
      generatedAt: new Date(),
    };

    if (isDBConnected()) {
      await AIToolsData.findOneAndUpdate(
        { userId },
        { $set: { portfolioAnalysis: analysis } },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('[AI Tools] Portfolio Analyzer error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 5. Skill Gap Analyzer ────────────────────────────────────────
export const analyzeSkillGap = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { targetRole } = req.body;
    if (!userId || !targetRole) return res.status(400).json({ success: false, error: 'User ID and target role required' });

    const [resume, profile] = await Promise.all([
      Resume.findOne({ userId }).sort({ createdAt: -1 }),
      StudentProfile.findOne({ userId }),
    ]);

    const currentSkills = resume?.skills?.join(', ') || 'None listed';

    const prompt = `Compare this student's current skills against the required skills for a ${targetRole} role in the current industry.

Student's Current Skills: ${currentSkills}
Student's Projects: ${resume?.projects?.join(', ') || 'None'}
Student's Education: ${profile?.degree || 'Unknown'} - ${profile?.university || 'Unknown'}

Return JSON:
{
  "targetRole": "${targetRole}",
  "achievedSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "priorityOrder": ["highest priority skill", "second priority", ...],
  "learningRoadmap": [
    {"skill": "skill name", "resource": "recommended resource/course", "duration": "estimated time"},
    ...
  ],
  "certifications": ["certification1", "certification2", ...]
}`;

    const result = await callGeminiJSON(prompt);
    const analysis = {
      ...result,
      generatedAt: new Date(),
    };

    if (isDBConnected()) {
      await AIToolsData.findOneAndUpdate(
        { userId },
        { $set: { skillGapAnalysis: analysis } },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('[AI Tools] Skill Gap Analyzer error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 6. Placement Readiness Predictor ─────────────────────────────
export const generatePlacementReadiness = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const [profile, resume, interviews] = await Promise.all([
      StudentProfile.findOne({ userId }),
      Resume.findOne({ userId }).sort({ createdAt: -1 }),
      Interview.find({ userId, status: 'completed' }),
    ]);

    const avgIntScore = interviews.length > 0
      ? Math.round(interviews.reduce((sum, i) => sum + ((i.report?.technicalScore || 0) + (i.report?.communicationScore || 0) + (i.report?.confidenceScore || 0)) / 3, 0) / interviews.length)
      : 0;

    const prompt = `Based on the following student data, predict their placement readiness.

Student Profile:
- Resume ATS Score: ${resume?.atsScore || 'Not uploaded'}
- Skills: ${resume?.skills?.join(', ') || 'None'}
- Projects: ${resume?.projects?.length || 0} projects
- Experience: ${resume?.experience?.length || 0} entries
- Completed Mock Interviews: ${interviews.length}
- Average Interview Score: ${avgIntScore || 'No interviews'}
- GitHub: ${profile?.github ? 'Connected' : 'Not connected'}
- LinkedIn: ${profile?.linkedin ? 'Connected' : 'Not connected'}
- Coding Profiles: LeetCode: ${profile?.codingHandles?.leetcode || 'None'}, Codeforces: ${profile?.codingHandles?.codeforces || 'None'}

Return JSON:
{
  "score": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"],
  "categoryScores": [
    {"name": "Resume", "score": <0-100>},
    {"name": "Technical Skills", "score": <0-100>},
    {"name": "Communication", "score": <0-100>},
    {"name": "Projects", "score": <0-100>},
    {"name": "Interview Skills", "score": <0-100>},
    {"name": "Online Presence", "score": <0-100>}
  ]
}`;

    const result = await callGeminiJSON(prompt);
    const data = {
      ...result,
      generatedAt: new Date(),
    };

    if (isDBConnected()) {
      await AIToolsData.findOneAndUpdate(
        { userId },
        { $set: { placementReadiness: data } },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('[AI Tools] Placement Readiness error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 7. Weekly AI Career Report ───────────────────────────────────
export const generateWeeklyReport = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekStart = weekAgo.toISOString().split('T')[0];
    const weekEnd = now.toISOString().split('T')[0];

    const [profile, resume, interviews] = await Promise.all([
      StudentProfile.findOne({ userId }),
      Resume.findOne({ userId }).sort({ createdAt: -1 }),
      Interview.find({ userId, status: 'completed', createdAt: { $gte: weekAgo } }),
    ]);

    const prompt = `Generate a weekly career progress report for this student.

Week: ${weekStart} to ${weekEnd}

Student Data This Week:
- Resume Status: ${resume ? `ATS Score: ${resume.atsScore}, Skills: ${resume.skills?.slice(0, 5).join(', ')}` : 'No resume uploaded'}
- Mock Interviews Completed This Week: ${interviews.length}
- Interview Scores: ${interviews.map(i => `${i.role}: ${Math.round(((i.report?.technicalScore || 0) + (i.report?.communicationScore || 0) + (i.report?.confidenceScore || 0)) / 3)}/100`).join(', ') || 'None'}
- Practice Logs: ${profile?.practiceLogs?.filter((l: any) => new Date(l.date) >= weekAgo).length || 0} sessions
- GitHub: ${profile?.github || 'Not connected'}

Return JSON:
{
  "resumeImprovements": "<summary of resume status and suggestions>",
  "codingActivity": "<summary of coding progress>",
  "interviewPerformance": "<summary of interview results>",
  "newSkills": "<skills worked on or acquired>",
  "projectProgress": "<project updates>",
  "recommendedTasks": ["task1", "task2", "task3", "task4", "task5"],
  "summary": "<overall weekly summary paragraph>"
}`;

    const result = await callGeminiJSON(prompt);
    const report = {
      weekStart,
      weekEnd,
      ...result,
      generatedAt: new Date(),
    };

    if (isDBConnected()) {
      await AIToolsData.findOneAndUpdate(
        { userId },
        { $push: { weeklyReports: { $each: [report], $slice: -52 } } },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data: report });
  } catch (error: any) {
    console.error('[AI Tools] Weekly Report error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getWeeklyReports = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const doc = await AIToolsData.findOne({ userId });
    return res.json({ success: true, data: doc?.weeklyReports || [] });
  } catch (error: any) {
    console.error('[AI Tools] Get Weekly Reports error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 8. Project Quality Analyzer ──────────────────────────────────
export const analyzeProjectQuality = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { repoUrl } = req.body;
    if (!userId || !repoUrl) return res.status(400).json({ success: false, error: 'User ID and repo URL required' });

    // Parse owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return res.status(400).json({ success: false, error: 'Invalid GitHub repository URL' });

    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, '');

    const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'CareerPilot' };
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;

    let repoData: any = {};
    let contents: any[] = [];
    let readmeContent = '';
    let languages: any = {};

    try {
      const [repoRes, contentsRes, langRes] = await Promise.all([
        axios.get(`https://api.github.com/repos/${owner}/${repoName}`, { headers }),
        axios.get(`https://api.github.com/repos/${owner}/${repoName}/contents`, { headers }).catch(() => ({ data: [] })),
        axios.get(`https://api.github.com/repos/${owner}/${repoName}/languages`, { headers }).catch(() => ({ data: {} })),
      ]);
      repoData = repoRes.data;
      contents = contentsRes.data || [];
      languages = langRes.data || {};

      // Try to fetch README
      try {
        const readmeRes = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/readme`, { headers });
        readmeContent = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8').substring(0, 2000);
      } catch { readmeContent = 'No README found'; }
    } catch (ghErr: any) {
      return res.status(400).json({ success: false, error: 'Could not fetch repository. Check the URL and make sure it is public.' });
    }

    const fileList = contents.map((f: any) => `${f.type === 'dir' ? '📁' : '📄'} ${f.name}`).join('\n');

    const prompt = `Analyze this GitHub repository for code quality and project standards.

Repository: ${owner}/${repoName}
Description: ${repoData.description || 'None'}
Stars: ${repoData.stargazers_count || 0}
Forks: ${repoData.forks_count || 0}
Languages: ${Object.entries(languages).map(([l, b]) => l).join(', ')}
License: ${repoData.license?.name || 'None'}
Last Updated: ${repoData.updated_at}

Root File Structure:
${fileList}

README Preview:
${readmeContent.substring(0, 1500)}

Return JSON:
{
  "score": <number 0-100>,
  "metrics": {
    "folderStructure": <0-100>,
    "codeOrganization": <0-100>,
    "documentation": <0-100>,
    "innovation": <0-100>,
    "scalability": <0-100>,
    "readability": <0-100>,
    "deploymentReadiness": <0-100>
  },
  "feedback": "<detailed 2-3 paragraph analysis>",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]
}`;

    const result = await callGeminiJSON(prompt);
    const analysis = {
      repoUrl,
      repoName: `${owner}/${repoName}`,
      score: result.score,
      metrics: result.metrics,
      feedback: result.feedback,
      suggestions: result.suggestions,
      generatedAt: new Date(),
    };

    if (isDBConnected()) {
      await AIToolsData.findOneAndUpdate(
        { userId },
        { $push: { projectAnalyses: { $each: [analysis], $slice: -20 } } },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('[AI Tools] Project Analyzer error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 9. Career Timeline ──────────────────────────────────────────
export const generateCareerTimeline = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const [profile, resume, interviews, aiData] = await Promise.all([
      StudentProfile.findOne({ userId }),
      Resume.findOne({ userId }).sort({ createdAt: -1 }),
      Interview.find({ userId, status: 'completed' }).sort({ createdAt: 1 }),
      AIToolsData.findOne({ userId }),
    ]);

    const prompt = `Generate a career timeline for this student showing their progress from early stages to current state.

Student Data:
- Degree: ${profile?.degree || 'Unknown'}, University: ${profile?.university || 'Unknown'}
- Graduation Year: ${profile?.gradYear || 'Unknown'}
- Skills: ${resume?.skills?.join(', ') || 'None'}
- Projects: ${resume?.projects?.join(', ') || 'None'}
- Resume ATS Score: ${resume?.atsScore || 'Not uploaded'}
- Mock Interviews Completed: ${interviews.length}
- Interview Scores: ${interviews.slice(-5).map(i => `${new Date(i.createdAt).toISOString().split('T')[0]}: ${i.role} (${Math.round(((i.report?.technicalScore || 0) + (i.report?.communicationScore || 0) + (i.report?.confidenceScore || 0)) / 3)}/100)`).join(', ') || 'None'}
- GitHub: ${profile?.github || 'Not connected'}
- Career Health Score: ${aiData?.careerHealthScore?.score || 'Not generated'}
- Practice Sessions: ${profile?.practiceLogs?.length || 0}

Create a realistic timeline based on the available data. Use actual dates where available, estimate others based on graduation year.

Return JSON:
{
  "events": [
    {"date": "YYYY-MM", "type": "skill", "title": "event title", "description": "brief description"},
    ...
  ]
}

Use types: skill, certification, coding, project, internship, resume, interview, placement.
Generate 8-15 timeline events.`;

    const result = await callGeminiJSON(prompt);
    const timeline = {
      events: result.events,
      generatedAt: new Date(),
    };

    if (isDBConnected()) {
      await AIToolsData.findOneAndUpdate(
        { userId },
        { $set: { careerTimeline: timeline } },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data: timeline });
  } catch (error: any) {
    console.error('[AI Tools] Career Timeline error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── 10. Digital Achievement Passport ─────────────────────────────
export const generateAchievements = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const [profile, resume, interviews, aiData] = await Promise.all([
      StudentProfile.findOne({ userId }),
      Resume.findOne({ userId }).sort({ createdAt: -1 }),
      Interview.find({ userId, status: 'completed' }),
      AIToolsData.findOne({ userId }),
    ]);

    const totalSolved = 0; // Would come from coding profile
    const interviewCount = interviews.length;
    const resumeScore = resume?.atsScore || 0;
    const projectCount = resume?.projects?.length || 0;
    const hasGitHub = !!profile?.github;
    const hasLinkedIn = !!profile?.linkedin;

    // Define badge criteria
    const badges = [
      {
        id: 'coding-100',
        title: '100 Problems Solved',
        description: 'Solved 100+ coding problems across platforms',
        icon: 'fa-solid fa-code',
        category: 'Coding',
        earned: totalSolved >= 100,
        earnedAt: totalSolved >= 100 ? new Date() : null,
        progress: Math.min(totalSolved, 100),
        target: 100,
      },
      {
        id: 'first-ai-project',
        title: 'First AI Project',
        description: 'Completed your first AI/ML project',
        icon: 'fa-solid fa-brain',
        category: 'Projects',
        earned: (resume?.projects || []).some((p: string) => /ai|ml|machine learning|deep learning|neural/i.test(p)),
        earnedAt: (resume?.projects || []).some((p: string) => /ai|ml|machine learning|deep learning|neural/i.test(p)) ? new Date() : null,
        progress: (resume?.projects || []).some((p: string) => /ai|ml|machine learning|deep learning|neural/i.test(p)) ? 1 : 0,
        target: 1,
      },
      {
        id: 'resume-90',
        title: 'Resume Score 90+',
        description: 'Achieved an ATS resume score above 90',
        icon: 'fa-solid fa-file-lines',
        category: 'Resume',
        earned: resumeScore >= 90,
        earnedAt: resumeScore >= 90 ? new Date() : null,
        progress: Math.min(resumeScore, 90),
        target: 90,
      },
      {
        id: 'mock-interviews-5',
        title: 'Interview Champion',
        description: 'Completed 5+ mock interviews',
        icon: 'fa-solid fa-video',
        category: 'Interviews',
        earned: interviewCount >= 5,
        earnedAt: interviewCount >= 5 ? new Date() : null,
        progress: Math.min(interviewCount, 5),
        target: 5,
      },
      {
        id: 'mock-interviews-1',
        title: 'First Mock Interview',
        description: 'Completed your first mock interview',
        icon: 'fa-solid fa-microphone',
        category: 'Interviews',
        earned: interviewCount >= 1,
        earnedAt: interviewCount >= 1 ? new Date() : null,
        progress: Math.min(interviewCount, 1),
        target: 1,
      },
      {
        id: 'github-connected',
        title: 'GitHub Contributor',
        description: 'Connected your GitHub profile',
        icon: 'fa-brands fa-github',
        category: 'Online Presence',
        earned: hasGitHub,
        earnedAt: hasGitHub ? new Date() : null,
        progress: hasGitHub ? 1 : 0,
        target: 1,
      },
      {
        id: 'project-published',
        title: 'Project Published',
        description: 'Published 3+ projects on your profile',
        icon: 'fa-solid fa-rocket',
        category: 'Projects',
        earned: projectCount >= 3,
        earnedAt: projectCount >= 3 ? new Date() : null,
        progress: Math.min(projectCount, 3),
        target: 3,
      },
      {
        id: 'linkedin-connected',
        title: 'Professional Network',
        description: 'Connected your LinkedIn profile',
        icon: 'fa-brands fa-linkedin',
        category: 'Online Presence',
        earned: hasLinkedIn,
        earnedAt: hasLinkedIn ? new Date() : null,
        progress: hasLinkedIn ? 1 : 0,
        target: 1,
      },
      {
        id: 'coding-50',
        title: '50 Problems Milestone',
        description: 'Solved 50+ coding problems',
        icon: 'fa-solid fa-trophy',
        category: 'Coding',
        earned: totalSolved >= 50,
        earnedAt: totalSolved >= 50 ? new Date() : null,
        progress: Math.min(totalSolved, 50),
        target: 50,
      },
      {
        id: 'skills-5',
        title: 'Skill Collector',
        description: 'Listed 5+ technical skills on your resume',
        icon: 'fa-solid fa-star',
        category: 'Skills',
        earned: (resume?.skills?.length || 0) >= 5,
        earnedAt: (resume?.skills?.length || 0) >= 5 ? new Date() : null,
        progress: Math.min(resume?.skills?.length || 0, 5),
        target: 5,
      },
    ];

    if (isDBConnected()) {
      await AIToolsData.findOneAndUpdate(
        { userId },
        { $set: { achievements: badges } },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data: badges });
  } catch (error: any) {
    console.error('[AI Tools] Achievements error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─── Get cached data (for loading saved results) ──────────────────
export const getCachedData = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const doc = await AIToolsData.findOne({ userId });
    return res.json({ success: true, data: doc });
  } catch (error: any) {
    console.error('[AI Tools] Get cached data error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
