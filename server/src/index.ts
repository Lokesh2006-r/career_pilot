import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import resumeRoutes from './routes/resume.routes';
import chatRoutes from './routes/chat.routes';
import interviewRoutes from './routes/interview.routes';
import codingRoutes from './routes/coding.routes';


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/resume', resumeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/coding', codingRoutes);

app.get('/', (req, res) => {
  res.send('CareerPilot API is running');
});

// Connect to MongoDB Atlas, then start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
