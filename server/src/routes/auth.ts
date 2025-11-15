import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// Google OAuth callback handler
// Note: Supabase handles the OAuth flow on the frontend
// This endpoint can be used for server-side verification if needed
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // Supabase handles OAuth on the frontend typically
    // This is a placeholder for server-side token exchange if needed
    res.json({ message: 'OAuth callback received', code });
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user (verify token from frontend)
router.post('/verify', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Missing access token' });
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user: data.user });
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

