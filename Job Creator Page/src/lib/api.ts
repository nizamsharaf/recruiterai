const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured');
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Jobs API
export const jobsApi = {
  getAll: () => fetchWithAuth('/api/jobs'),
  getById: (id: string) => fetchWithAuth(`/api/jobs/${id}`),
  getByPublicLink: (publicLink: string) => fetchWithAuth(`/api/public/jobs/${publicLink}`),
  create: (data: any) => fetchWithAuth('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/api/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/api/jobs/${id}`, {
    method: 'DELETE',
  }),
};

// Interviewers API
export const interviewersApi = {
  getAll: () => fetchWithAuth('/api/interviewers'),
  getByJobId: (jobId: string) => fetchWithAuth(`/api/interviewers/job/${jobId}`),
  create: (data: { jobDescription: string; name?: string; elevenlabs_voice_id?: string; job_id?: string }) => 
    fetchWithAuth('/api/interviewers/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) => fetchWithAuth(`/api/interviewers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/api/interviewers/${id}`, {
    method: 'DELETE',
  }),
};

// Candidates API
export const candidatesApi = {
  getByJobId: (jobId: string) => fetchWithAuth(`/api/candidates/job/${jobId}`),
  create: (data: any) => fetchWithAuth('/api/candidates', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/api/candidates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Interviews API
export const interviewsApi = {
  getByJobId: (jobId: string) => fetchWithAuth(`/api/interviews/job/${jobId}`),
  initiate: (data: { candidate_id: string; job_id: string; interviewer_id: string }) =>
    fetchWithAuth('/api/interviews/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Evaluations API
export const evaluationsApi = {
  getByInterviewId: (interviewId: string) => fetchWithAuth(`/api/evaluations/interview/${interviewId}`),
  getByJobId: (jobId: string) => fetchWithAuth(`/api/evaluations/job/${jobId}`),
};

