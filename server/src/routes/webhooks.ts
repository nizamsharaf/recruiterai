import express from 'express';
import { supabase } from '../config/supabase';
import { getTranscript, getRecording } from '../services/twilio';
import { evaluateInterview } from '../services/evaluator';
import twilio from 'twilio';

const router = express.Router();

// Twilio voice webhook - handles call flow
router.post('/twilio/voice', async (req, res) => {
  try {
    const callSid = req.body.CallSid;
    const callStatus = req.body.CallStatus;

    // Find interview by call SID
    const { data: interview } = await supabase
      .from('interviews')
      .select('*')
      .eq('twilio_call_sid', callSid)
      .single();

    if (!interview) {
      return res.status(404).send('Interview not found');
    }

    const twiml = new twilio.twiml.VoiceResponse();

    if (callStatus === 'in-progress' || callStatus === 'ringing') {
      // Start the interview
      twiml.say({
        voice: 'alice',
      }, 'Hello! This is Avi, an AI assistant. I\'m calling to conduct a phone interview. Please wait while I connect you.');

      // Use Gather to collect speech
      const gather = twiml.gather({
        input: ['speech'],
        language: 'en-US',
        speechTimeout: 'auto',
        action: `/api/webhooks/twilio/process-speech?callSid=${callSid}`,
        method: 'POST',
      });

      // This will be handled by the process-speech endpoint
      gather.say({
        voice: 'alice',
      }, 'Please begin the interview when ready.');

      twiml.redirect(`/api/webhooks/twilio/process-speech?callSid=${callSid}`);
    } else {
      twiml.say({
        voice: 'alice',
      }, 'Thank you for your time. The interview will be reviewed and you will hear back soon.');
      twiml.hangup();
    }

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error: any) {
    console.error('Twilio voice webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Process speech from candidate
router.post('/twilio/process-speech', async (req, res) => {
  try {
    const callSid = req.body.CallSid;
    const speechResult = req.body.SpeechResult;

    // This is a simplified version
    // In production, you'd want to integrate with Anthropic here
    // For now, we'll just collect the speech and store it

    const { data: interview } = await supabase
      .from('interviews')
      .select('transcript')
      .eq('twilio_call_sid', callSid)
      .single();

    if (interview && speechResult) {
      const currentTranscript = interview.transcript || '';
      const updatedTranscript = currentTranscript 
        ? `${currentTranscript}\nCandidate: ${speechResult}`
        : `Candidate: ${speechResult}`;

      await supabase
        .from('interviews')
        .update({ transcript: updatedTranscript })
        .eq('twilio_call_sid', callSid);
    }

    const twiml = new twilio.twiml.VoiceResponse();
    
    // Simple response for now
    twiml.say({
      voice: 'alice',
    }, 'Thank you for that response. Do you have any questions for us?');

    // Continue gathering
    const gather = twiml.gather({
      input: ['speech'],
      language: 'en-US',
      speechTimeout: 'auto',
      action: `/api/webhooks/twilio/process-speech?callSid=${callSid}`,
      method: 'POST',
    });

    twiml.redirect(`/api/webhooks/twilio/process-speech?callSid=${callSid}`);

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error: any) {
    console.error('Process speech error:', error);
    res.status(500).send('Error processing speech');
  }
});

// Twilio status callback
router.post('/twilio/status', async (req, res) => {
  try {
    const callSid = req.body.CallSid;
    const callStatus = req.body.CallStatus;

    if (callStatus === 'completed') {
      // Fetch transcript and recording
      const transcript = await getTranscript(callSid);
      const recordingUrl = await getRecording(callSid);

      // Update interview record
      const { data: interview } = await supabase
        .from('interviews')
        .select('id, transcript, started_at')
        .eq('twilio_call_sid', callSid)
        .single();

      if (interview) {
        const startedAt = new Date(interview.started_at);
        const endedAt = new Date();
        const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

        await supabase
          .from('interviews')
          .update({
            transcript: transcript || interview.transcript,
            recording_url: recordingUrl,
            ended_at: endedAt.toISOString(),
            duration_minutes: durationMinutes,
          })
          .eq('id', interview.id);

        // Trigger evaluation
        try {
          await evaluateInterview(interview.id);
        } catch (evalError) {
          console.error('Error evaluating interview:', evalError);
          // Don't fail the webhook if evaluation fails
        }
      }
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Twilio status webhook error:', error);
    res.status(500).send('Error processing status');
  }
});

// Twilio transcription callback
router.post('/twilio/transcription', async (req, res) => {
  try {
    const callSid = req.body.CallSid;
    const transcriptionText = req.body.TranscriptionText;
    const transcriptionStatus = req.body.TranscriptionStatus;

    if (transcriptionStatus === 'completed' && transcriptionText) {
      // Update interview transcript
      const { data: interview } = await supabase
        .from('interviews')
        .select('transcript')
        .eq('twilio_call_sid', callSid)
        .single();

      if (interview) {
        const currentTranscript = interview.transcript || '';
        const updatedTranscript = currentTranscript
          ? `${currentTranscript}\n${transcriptionText}`
          : transcriptionText;

        await supabase
          .from('interviews')
          .update({ transcript: updatedTranscript })
          .eq('twilio_call_sid', callSid);
      }
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Twilio transcription webhook error:', error);
    res.status(500).send('Error processing transcription');
  }
});

export default router;

