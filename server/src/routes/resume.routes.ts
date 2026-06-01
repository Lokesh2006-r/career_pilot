import { Router } from 'express';
import multer from 'multer';
import { uploadResume, saveBuiltResume, loadBuiltResume, enhanceResumeText, getLatestResume } from '../controllers/resume.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/latest/:userId', getLatestResume);
router.post('/build/save', saveBuiltResume);
router.get('/build/load/:userId', loadBuiltResume);
router.post('/enhance', enhanceResumeText);

export default router;
