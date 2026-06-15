import { Router } from 'express';
import { getCandidates } from '../controllers/recruiter.controller';

const router = Router();

router.get('/candidates', getCandidates);

export default router;
