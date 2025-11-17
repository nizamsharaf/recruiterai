import { supabase } from '../config/supabase';
import { evaluateTranscript } from './anthropic';

export async function evaluateInterview(interviewId: string): Promise<any> {
  try {
    // Fetch interview data
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select(`
        *,
        candidates!inner(*),
        jobs!inner(*),
        ai_interviewers!inner(*)
      `)
      .eq('id', interviewId)
      .single();

    if (interviewError || !interview) {
      throw new Error('Interview not found');
    }

    const transcript = interview.transcript;
    if (!transcript) {
      throw new Error('No transcript available for evaluation');
    }

    const job = (interview as any).jobs;
    const interviewer = (interview as any).ai_interviewers;

    // Calculate metadata
    const transcriptLength = transcript.length;
    const startedAt = new Date(interview.started_at);
    const endedAt = interview.ended_at ? new Date(interview.ended_at) : new Date();
    const interviewDuration = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000); // minutes
    
    // Estimate candidate participation (rough heuristic: count words in transcript)
    const words = transcript.split(/\s+/).length;
    const estimatedParticipation = Math.min(100, Math.round((words / 500) * 100)); // Rough estimate

    // Call Anthropic evaluation
    const evaluation = await evaluateTranscript(
      transcript,
      job.description || '',
      interviewer.question_bank || {}
    );

    // Add metadata to evaluation
    const evaluationData = {
      interview_id: interviewId,
      overall_score: evaluation.overallScore,
      key_strengths: evaluation.keyStrengths || [],
      areas_for_improvement: evaluation.areasForImprovement || [],
      communication_score: evaluation.communicationScore,
      technical_evaluation: evaluation.technicalEvaluation || {},
      cultural_fit_score: evaluation.culturalFitScore,
      verdict: evaluation.verdict,
      recommendations: evaluation.recommendations || [],
      qa_summary: evaluation.qaSummary || [],
      analysis_metadata: {
        ...evaluation.analysisMetadata,
        transcriptLength,
        interviewDuration,
        candidateParticipation: estimatedParticipation,
        analysisTimestamp: new Date().toISOString(),
      },
    };

    // Save evaluation to database
    const { data: savedEvaluation, error: saveError } = await supabase
      .from('evaluations')
      .insert(evaluationData)
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    // Update interview duration
    await supabase
      .from('interviews')
      .update({
        ended_at: interview.ended_at || endedAt.toISOString(),
        duration_minutes: interviewDuration,
      })
      .eq('id', interviewId);

    // Update candidate call status
    await supabase
      .from('candidates')
      .update({ call_status: 'completed' })
      .eq('id', interview.candidate_id);

    return savedEvaluation;
  } catch (error: any) {
    console.error('Error evaluating interview:', error);
    throw new Error(`Failed to evaluate interview: ${error.message}`);
  }
}

