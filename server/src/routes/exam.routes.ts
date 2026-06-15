import { Router } from 'express';
import multer from 'multer';
import {
  generateQuestions,
  generateAnswers,
  evaluateScript,
  generateTopicQuiz,
} from '../controllers/exam.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/generate-questions', upload.single('file'), generateQuestions);
router.post('/generate-answers', generateAnswers);
router.post('/evaluate-script', evaluateScript);
router.post('/topic-quiz', generateTopicQuiz);

export default router;
