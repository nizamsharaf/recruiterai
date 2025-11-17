import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// Get evaluation for an interview
router.get('/interview/:interviewId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user owns the job associated with this interview
    const { data: interview } = await supabase
      .from('interviews')
      .select('jobs!inner(created_by)')
      .eq('id', req.params.interviewId)
      .single();

    if (!interview || (interview as any).jobs.created_by !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('interview_id', req.params.interviewId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    res.json(data || null);
  } catch (error: any) {
    console.error('Error fetching evaluation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all evaluations for a job
router.get('/job/:jobId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user owns the job
    const { data: job } = await supabase
      .from('jobs')
      .select('created_by')
      .eq('id', req.params.jobId)
      .single();

    if (!job || job.created_by !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        interviews!inner(job_id)
      `)
      .eq('interviews.job_id', req.params.jobId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

