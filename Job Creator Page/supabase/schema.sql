-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    department TEXT,
    description TEXT,
    location TEXT,
    work_mode TEXT,
    created_by UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'live', 'closed')),
    public_link TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_by for faster lookups
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_public_link ON jobs(public_link);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AI_INTERVIEWERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_interviewers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position_details JSONB,
    question_bank JSONB,
    top_skills JSONB[],
    elevenlabs_voice_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on job_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_interviewers_job_id ON ai_interviewers(job_id);

-- ============================================================================
-- CANDIDATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    resume_url TEXT,
    scheduled_call_time TIMESTAMP WITH TIME ZONE,
    call_status TEXT NOT NULL DEFAULT 'pending' CHECK (call_status IN ('pending', 'scheduled', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_call_status ON candidates(call_status);
CREATE INDEX IF NOT EXISTS idx_candidates_scheduled_call_time ON candidates(scheduled_call_time);

-- ============================================================================
-- INTERVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES ai_interviewers(id) ON DELETE CASCADE,
    twilio_call_sid TEXT,
    transcript TEXT,
    recording_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_id ON interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_twilio_call_sid ON interviews(twilio_call_sid);

-- Enable realtime for interviews table
ALTER PUBLICATION supabase_realtime ADD TABLE interviews;

-- ============================================================================
-- EVALUATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    overall_score NUMERIC(5, 2),
    key_strengths TEXT,
    areas_for_improvement TEXT,
    communication_score NUMERIC(5, 2),
    technical_evaluation TEXT,
    cultural_fit_score NUMERIC(5, 2),
    verdict TEXT,
    recommendations TEXT,
    qa_summary TEXT,
    analysis_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on interview_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_evaluations_interview_id ON evaluations(interview_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- JOBS TABLE POLICIES
-- ============================================================================

-- Users can view jobs they created
CREATE POLICY "Users can view their own jobs"
    ON jobs FOR SELECT
    USING (auth.uid() = created_by);

-- Users can view live jobs (public access)
CREATE POLICY "Anyone can view live jobs"
    ON jobs FOR SELECT
    USING (status = 'live');

-- Users can insert jobs they create
CREATE POLICY "Users can create their own jobs"
    ON jobs FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Users can update their own jobs
CREATE POLICY "Users can update their own jobs"
    ON jobs FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Users can delete their own jobs
CREATE POLICY "Users can delete their own jobs"
    ON jobs FOR DELETE
    USING (auth.uid() = created_by);

-- ============================================================================
-- AI_INTERVIEWERS TABLE POLICIES
-- ============================================================================

-- Users can view interviewers for jobs they created
CREATE POLICY "Users can view interviewers for their jobs"
    ON ai_interviewers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = ai_interviewers.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can create interviewers for their jobs
CREATE POLICY "Users can create interviewers for their jobs"
    ON ai_interviewers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = ai_interviewers.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can update interviewers for their jobs
CREATE POLICY "Users can update interviewers for their jobs"
    ON ai_interviewers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = ai_interviewers.job_id
            AND jobs.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = ai_interviewers.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can delete interviewers for their jobs
CREATE POLICY "Users can delete interviewers for their jobs"
    ON ai_interviewers FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = ai_interviewers.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- ============================================================================
-- CANDIDATES TABLE POLICIES
-- ============================================================================

-- Users can view candidates for jobs they created
CREATE POLICY "Users can view candidates for their jobs"
    ON candidates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = candidates.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can create candidates for their jobs
CREATE POLICY "Users can create candidates for their jobs"
    ON candidates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = candidates.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can update candidates for their jobs
CREATE POLICY "Users can update candidates for their jobs"
    ON candidates FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = candidates.job_id
            AND jobs.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = candidates.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can delete candidates for their jobs
CREATE POLICY "Users can delete candidates for their jobs"
    ON candidates FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = candidates.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- ============================================================================
-- INTERVIEWS TABLE POLICIES
-- ============================================================================

-- Users can view interviews for jobs they created
CREATE POLICY "Users can view interviews for their jobs"
    ON interviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = interviews.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can create interviews for their jobs
CREATE POLICY "Users can create interviews for their jobs"
    ON interviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = interviews.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can update interviews for their jobs
CREATE POLICY "Users can update interviews for their jobs"
    ON interviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = interviews.job_id
            AND jobs.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = interviews.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can delete interviews for their jobs
CREATE POLICY "Users can delete interviews for their jobs"
    ON interviews FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            WHERE jobs.id = interviews.job_id
            AND jobs.created_by = auth.uid()
        )
    );

-- ============================================================================
-- EVALUATIONS TABLE POLICIES
-- ============================================================================

-- Users can view evaluations for interviews of their jobs
CREATE POLICY "Users can view evaluations for their interviews"
    ON evaluations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM interviews
            JOIN jobs ON jobs.id = interviews.job_id
            WHERE interviews.id = evaluations.interview_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can create evaluations for interviews of their jobs
CREATE POLICY "Users can create evaluations for their interviews"
    ON evaluations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM interviews
            JOIN jobs ON jobs.id = interviews.job_id
            WHERE interviews.id = evaluations.interview_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can update evaluations for interviews of their jobs
CREATE POLICY "Users can update evaluations for their interviews"
    ON evaluations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM interviews
            JOIN jobs ON jobs.id = interviews.job_id
            WHERE interviews.id = evaluations.interview_id
            AND jobs.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM interviews
            JOIN jobs ON jobs.id = interviews.job_id
            WHERE interviews.id = evaluations.interview_id
            AND jobs.created_by = auth.uid()
        )
    );

-- Users can delete evaluations for interviews of their jobs
CREATE POLICY "Users can delete evaluations for their interviews"
    ON evaluations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM interviews
            JOIN jobs ON jobs.id = interviews.job_id
            WHERE interviews.id = evaluations.interview_id
            AND jobs.created_by = auth.uid()
        )
    );

