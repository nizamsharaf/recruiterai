import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  throw new Error('Missing Twilio environment variables. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.');
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || 'http://localhost:3001';

export interface CallInitiationParams {
  phoneNumber: string;
  jobId: string;
  candidateId: string;
  interviewerId: string;
}

export async function initiateCall(params: CallInitiationParams): Promise<string> {
  try {
    const call = await client.calls.create({
      to: params.phoneNumber,
      from: TWILIO_PHONE_NUMBER,
      url: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice`,
      method: 'POST',
      statusCallback: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      record: true,
      transcriptionSettings: {
        transcribe: true,
        transcriptionCallback: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/transcription`,
      },
      // Store metadata in the call
      twiml: `<Response><Say>Connecting your call...</Say></Response>`,
    });

    return call.sid;
  } catch (error: any) {
    console.error('Error initiating call:', error);
    throw new Error(`Failed to initiate call: ${error.message}`);
  }
}

export async function getTranscript(callSid: string): Promise<string | null> {
  try {
    const transcriptions = await client.transcriptions.list({
      callSid,
      limit: 1,
    });

    if (transcriptions.length > 0) {
      const transcription = await client.transcriptions(transcriptions[0].sid).fetch();
      return transcription.transcriptionText || null;
    }

    return null;
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

export async function getRecording(callSid: string): Promise<string | null> {
  try {
    const recordings = await client.recordings.list({
      callSid,
      limit: 1,
    });

    if (recordings.length > 0) {
      const recording = recordings[0];
      return `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Recordings/${recording.sid}.mp3`;
    }

    return null;
  } catch (error: any) {
    console.error('Error fetching recording:', error);
    return null;
  }
}

export function generateTwimlResponse(xml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>${xml}`;
}

