import { Router } from 'express';
import { getProfile, updateProfile, getCloneProfile, trainClone } from '../controllers/student.controller';

const router = Router();

router.get('/profile/:userId', getProfile);
router.post('/profile/:userId', updateProfile);

router.get('/clone/:userId', getCloneProfile);
router.post('/clone/train/:userId', trainClone);

export default router;
