import { Router } from 'express';
import { getCandidates, chatWithClone } from '../controllers/recruiter.controller';

const router = Router();

router.get('/candidates', getCandidates);
router.post('/clone-chat/:studentId', chatWithClone);

export default router;
