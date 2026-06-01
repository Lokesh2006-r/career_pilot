import { Router } from 'express';
import { startInterview, answerQuestion, getInterviewHistory, executeCode } from '../controllers/interview.controller';

const router = Router();

router.post('/start', startInterview);
router.post('/answer', answerQuestion);
router.post('/execute', executeCode);
router.get('/history/:userId', getInterviewHistory);

export default router;
