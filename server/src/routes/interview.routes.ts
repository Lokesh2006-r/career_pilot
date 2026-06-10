import { Router } from 'express';
import multer from 'multer';
const pdfParse = require('pdf-parse');
import { startInterview, answerQuestion, getInterviewHistory, executeCode } from '../controllers/interview.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/start', startInterview);
router.post('/answer', answerQuestion);
router.post('/execute', executeCode);
router.get('/history/:userId', getInterviewHistory);

router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const pdfData = await pdfParse(req.file.buffer);
    res.status(200).json({ text: pdfData.text });
  } catch (error: any) {
    console.error('[Upload Resume Error]:', error);
    res.status(500).json({ error: 'Failed to parse PDF resume', details: error.message });
  }
});

export default router;
