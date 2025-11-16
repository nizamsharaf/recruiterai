import express from 'express';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all jobs for authenticated user
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

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    let user = null;

    if (token) {
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      throw error;
    }

    // If no auth or not the creator, only show if status is 'live'
    if (!user || data.created_by !== user.id) {
      if (data.status !== 'live') {
        return res.status(404).json({ error: 'Job not found' });
      }
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get job by public link (no auth required)
router.get('/public/:publicLink', async (req, res) => {
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

// Create new job
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
      title,
      company_name,
      department,
      description,
      location,
      work_mode,
      status,
      interviewer_id,
    } = req.body;

    // Generate public link if status is 'live'
    const publicLink = status === 'live' ? uuidv4() : null;

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title,
        company_name,
        department,
        description,
        location,
        work_mode,
        status: status || 'draft',
        public_link: publicLink,
        created_by: user.id,
        interviewer_id: interviewer_id || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update job
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

    const { status, ...updateData } = req.body;

    // If status changed to 'live' and no public_link exists, generate one
    if (status === 'live') {
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('public_link')
        .eq('id', req.params.id)
        .single();

      if (!existingJob?.public_link) {
        updateData.public_link = uuidv4();
      }
    }

    if (status) {
      updateData.status = status;
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('created_by', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete job
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

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', req.params.id)
      .eq('created_by', user.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

