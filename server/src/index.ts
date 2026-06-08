import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import resumeRoutes from './routes/resume.routes';
import chatRoutes from './routes/chat.routes';
import interviewRoutes from './routes/interview.routes';
import codingRoutes from './routes/coding.routes';
import projectRoutes from './routes/project.routes';


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB connection eagerly for serverless environments
connectDB();

app.use('/api/resume', resumeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
  res.send('CareerPilot API is running');
});

// Start listening only if NOT running as a serverless function on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
