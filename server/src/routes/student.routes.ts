import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/student.controller';

const router = Router();

router.get('/profile/:userId', getProfile);
router.post('/profile/:userId', updateProfile);

export default router;
