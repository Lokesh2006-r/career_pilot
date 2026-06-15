import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import resumeRoutes from './routes/resume.routes';
import chatRoutes from './routes/chat.routes';
import interviewRoutes from './routes/interview.routes';
import codingRoutes from './routes/coding.routes';
import projectRoutes from './routes/project.routes';
import studentRoutes from './routes/student.routes';
import adminRoutes from './routes/admin.routes';
import recruiterRoutes from './routes/recruiter.routes';
import examRoutes from './routes/exam.routes';


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/resume', resumeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/exam', examRoutes);

app.get('/', (req, res) => {
  res.send('CareerPilot API is running');
});

// Connect to MongoDB Atlas, then start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

export default app;
