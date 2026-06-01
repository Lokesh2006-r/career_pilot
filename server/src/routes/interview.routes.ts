import { Router } from 'express';
import { startInterview, answerQuestion, getInterviewHistory } from '../controllers/interview.controller';

const router = Router();

router.post('/start', startInterview);
router.post('/answer', answerQuestion);
router.get('/history/:userId', getInterviewHistory);

export default router;
