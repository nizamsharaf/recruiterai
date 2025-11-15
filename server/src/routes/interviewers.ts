import express from 'express';
import { supabase } from '../config/supabase';
import { createInterviewer } from '../services/anthropic';

const router = express.Router();

// Get all AI interviewers for authenticated user (through their jobs)
router.get('/', async (req, res) => {
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

    // Get interviewers through jobs the user created
    const { data, error } = await supabase
      .from('ai_interviewers')
      .select(`
        *,
        jobs!inner(created_by)
      `)
      .eq('jobs.created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching interviewers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get interviewers for a specific job
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

    const { data, error } = await supabase
      .from('ai_interviewers')
      .select(`
        *,
        jobs!inner(created_by)
      `)
      .eq('job_id', req.params.jobId)
      .eq('jobs.created_by', user.id);

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching job interviewers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create AI interviewer using Anthropic
router.post('/create', async (req, res) => {
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

    const { jobDescription, name, elevenlabs_voice_id, job_id } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    // Call Anthropic to create interviewer
    const interviewerData = await createInterviewer(jobDescription);

    // Extract top 3 skills
    const topSkills = interviewerData.topSkills?.slice(0, 3).map((skill: any) => ({
      name: skill.name || skill,
      description: skill.description || '',
    })) || [];

    // Save to database
    const { data, error } = await supabase
      .from('ai_interviewers')
      .insert({
        name: name || interviewerData.positionDetails?.jobTitle || 'AI Interviewer',
        job_id: job_id || null,
        position_details: interviewerData.positionDetails || {},
        question_bank: interviewerData.questionBank || {},
        top_skills: topSkills,
        elevenlabs_voice_id: elevenlabs_voice_id || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      ...data,
      generatedData: interviewerData,
    });
  } catch (error: any) {
    console.error('Error creating interviewer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update AI interviewer
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

    // Verify user owns the job associated with this interviewer
    const { data: interviewer } = await supabase
      .from('ai_interviewers')
      .select('jobs!inner(created_by)')
      .eq('id', req.params.id)
      .single();

    if (!interviewer || (interviewer as any).jobs.created_by !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data, error } = await supabase
      .from('ai_interviewers')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error updating interviewer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete AI interviewer
router.delete('/:id', async (req, res) => {
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

    // Verify user owns the job associated with this interviewer
    const { data: interviewer } = await supabase
      .from('ai_interviewers')
      .select('jobs!inner(created_by)')
      .eq('id', req.params.id)
      .single();

    if (!interviewer || (interviewer as any).jobs.created_by !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { error } = await supabase
      .from('ai_interviewers')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Interviewer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting interviewer:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

