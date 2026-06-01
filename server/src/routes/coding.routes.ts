import { Router } from 'express';
import { getCodingProfile } from '../controllers/coding.controller';

const router = Router();

// GET /api/coding/profile?leetcode=<handle>&codeforces=<handle>&codechef=<handle>
router.get('/profile', getCodingProfile);

export default router;
