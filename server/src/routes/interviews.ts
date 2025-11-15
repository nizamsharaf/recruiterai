import express from 'express';
import { supabase } from '../config/supabase';
import { initiateCall } from '../services/twilio';

const router = express.Router();

// Get interviews for a job
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
      .from('interviews')
      .select('*')
      .eq('job_id', req.params.jobId)
      .order('started_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initiate interview call
router.post('/initiate', async (req, res) => {
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

    const { candidate_id, job_id, interviewer_id } = req.body;

    if (!candidate_id || !job_id || !interviewer_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get candidate phone number
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('phone, job_id')
      .eq('id', candidate_id)
      .single();

    if (candidateError || !candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    if (!candidate.phone) {
      return res.status(400).json({ error: 'Candidate phone number not provided' });
    }

    // Verify user owns the job
    const { data: job } = await supabase
      .from('jobs')
      .select('created_by')
      .eq('id', job_id)
      .single();

    if (!job || job.created_by !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Initiate call via Twilio
    const callSid = await initiateCall({
      phoneNumber: candidate.phone,
      jobId: job_id,
      candidateId: candidate_id,
      interviewerId: interviewer_id,
    });

    // Create interview record
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        candidate_id,
        job_id,
        interviewer_id,
        twilio_call_sid: callSid,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (interviewError) {
      throw interviewError;
    }

    // Update candidate call status
    await supabase
      .from('candidates')
      .update({ call_status: 'scheduled' })
      .eq('id', candidate_id);

    res.status(201).json({
      interview,
      callSid,
    });
  } catch (error: any) {
    console.error('Error initiating interview:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

