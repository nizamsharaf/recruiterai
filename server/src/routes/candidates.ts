import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// Get candidates for a job
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
      .from('candidates')
      .select(`
        *,
        evaluations (
          overall_score,
          verdict,
          key_strengths,
          communication_score,
          technical_evaluation,
          cultural_fit_score
        )
      `)
      .eq('job_id', req.params.jobId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single candidate with related evaluation/interview
router.get('/:id', async (req, res) => {
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

    // Fetch candidate with job ownership validation
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        evaluations (*),
        interviews (*)
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Ensure the requester owns the related job
    const { data: job } = await supabase
      .from('jobs')
      .select('created_by')
      .eq('id', data.job_id)
      .single();

    if (!job || job.created_by !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit candidate application
router.post('/', async (req, res) => {
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

    const {
      job_id,
      name,
      email,
      phone,
      resume_url,
      scheduled_call_time,
      designation,
      years_of_experience,
      current_ctc,
      expected_ctc,
    } = req.body;

    if (!job_id || !name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify job exists and is live
    const { data: job } = await supabase
      .from('jobs')
      .select('status')
      .eq('id', job_id)
      .single();

    if (!job || job.status !== 'live') {
      return res.status(400).json({ error: 'Job is not available for applications' });
    }

    const callStatus = scheduled_call_time ? 'scheduled' : 'pending';

    const { data, error } = await supabase
      .from('candidates')
      .insert({
        job_id,
        name,
        email,
        phone,
        resume_url,
        scheduled_call_time: scheduled_call_time || null,
        call_status: callStatus,
        designation: designation || null,
        years_of_experience: years_of_experience || null,
        current_ctc: current_ctc || null,
        expected_ctc: expected_ctc || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update candidate (e.g., approve/reject)
router.put('/:id', async (req, res) => {
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

    // Verify user owns the job associated with this candidate
    const { data: candidate } = await supabase
      .from('candidates')
      .select('jobs!inner(created_by)')
      .eq('id', req.params.id)
      .single();

    if (!candidate || (candidate as any).jobs.created_by !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('candidates')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

