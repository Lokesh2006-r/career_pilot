import { Router } from 'express';
import {
  getRecommendations,
  generateRecommendation,
  toggleTask,
  saveProject,
  deleteProject
} from '../controllers/project.controller';

const router = Router();

router.get('/recommendations/:userId', getRecommendations);
router.post('/recommendations/generate', generateRecommendation);
router.put('/recommendations/:projectId/task', toggleTask);
router.put('/recommendations/:projectId/save', saveProject);
router.delete('/recommendations/:projectId', deleteProject);

export default router;
