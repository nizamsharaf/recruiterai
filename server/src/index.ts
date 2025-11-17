import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import jobsRoutes from './routes/jobs';
import interviewersRoutes from './routes/interviewers';
import candidatesRoutes from './routes/candidates';
import interviewsRoutes from './routes/interviews';
import evaluationsRoutes from './routes/evaluations';
import webhooksRoutes from './routes/webhooks';
import { supabase } from './config/supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/interviewers', interviewersRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/webhooks', webhooksRoutes);

// Public routes
app.get('/api/public/jobs/:publicLink', async (req, res) => {
  try {
    const { publicLink } = req.params;

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('public_link', publicLink)
      .eq('status', 'live')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching public job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

