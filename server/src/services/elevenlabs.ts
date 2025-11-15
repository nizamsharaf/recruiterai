import axios from 'axios';

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error('Missing ELEVENLABS_API_KEY environment variable');
}

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

const apiClient = axios.create({
  baseURL: ELEVENLABS_API_URL,
  headers: {
    'xi-api-key': process.env.ELEVENLABS_API_KEY,
  },
});

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
}

export async function getAvailableVoices(): Promise<Voice[]> {
  try {
    const response = await apiClient.get('/voices');
    return response.data.voices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      category: voice.category || 'default',
    }));
  } catch (error: any) {
    console.error('Error fetching voices:', error);
    throw new Error(`Failed to fetch voices: ${error.message}`);
  }
}

export async function generateVoice(
  text: string,
  voiceId: string
): Promise<Buffer> {
  try {
    const response = await apiClient.post(
      `/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('Error generating voice:', error);
    throw new Error(`Failed to generate voice: ${error.message}`);
  }
}

export async function getVoiceUrl(text: string, voiceId: string): Promise<string> {
  try {
    // For Twilio integration, we'll need to store the audio temporarily
    // or return a data URL. For now, this is a placeholder.
    // In production, you might want to upload to S3 or similar storage
    const audioBuffer = await generateVoice(text, voiceId);
    const base64 = audioBuffer.toString('base64');
    return `data:audio/mpeg;base64,${base64}`;
  } catch (error: any) {
    console.error('Error generating voice URL:', error);
    throw new Error(`Failed to generate voice URL: ${error.message}`);
  }
}

