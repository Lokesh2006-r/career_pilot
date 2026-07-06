import { Router } from 'express';
import {
  generateCareerHealthScore,
  generateDreamCompanyRoadmap,
  analyzeGitHubProfile,
  analyzePortfolio,
  analyzeSkillGap,
  generatePlacementReadiness,
  generateWeeklyReport,
  getWeeklyReports,
  analyzeProjectQuality,
  generateCareerTimeline,
  generateAchievements,
  getCachedData,
} from '../controllers/ai-tools.controller';

const router = Router();

// Get all cached AI tools data for a user
router.get('/cached/:userId', getCachedData);

// 1. Career Health Score
router.post('/career-health/:userId', generateCareerHealthScore);

// 2. Dream Company Roadmap
router.post('/dream-company/:userId', generateDreamCompanyRoadmap);

// 3. GitHub Profile Analyzer
router.post('/github-analyze/:userId', analyzeGitHubProfile);

// 4. Portfolio Analyzer
router.post('/portfolio-analyze/:userId', analyzePortfolio);

// 5. Skill Gap Analyzer
router.post('/skill-gap/:userId', analyzeSkillGap);

// 6. Placement Readiness Predictor
router.post('/placement-readiness/:userId', generatePlacementReadiness);

// 7. Weekly AI Career Report
router.post('/weekly-report/:userId', generateWeeklyReport);
router.get('/weekly-reports/:userId', getWeeklyReports);

// 8. Project Quality Analyzer
router.post('/project-analyze/:userId', analyzeProjectQuality);

// 9. Career Timeline
router.post('/career-timeline/:userId', generateCareerTimeline);

// 10. Digital Achievement Passport
router.post('/achievements/:userId', generateAchievements);

export default router;
