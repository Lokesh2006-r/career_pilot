import { Router } from 'express';
import { getDashboardStats, getStudents, getRecruiters, getReports, getAiUsage } from '../controllers/admin.controller';

const router = Router();

router.get('/dashboard', getDashboardStats);
router.get('/students', getStudents);
router.get('/recruiters', getRecruiters);
router.get('/reports', getReports);
router.get('/ai-usage', getAiUsage);

export default router;
