import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { candidatesApi, evaluationsApi, interviewsApi } from '@/lib/api';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Headphones,
  Clock,
  Award,
  Loader2,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react';

interface InterviewReportProps {
  candidateId: string;
  candidateName: string;
  onBack: () => void;
}

export function InterviewReport({ candidateId, candidateName, onBack }: InterviewReportProps) {
  const [evaluation, setEvaluation] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [candidateId]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      // Get candidate to find interview_id
      const candidates = await candidatesApi.getByJobId(''); // We need jobId, but let's try a different approach
      
      // For now, let's assume we can get the interview directly from candidate
      // In a real app, we'd need to pass interviewId or fetch it differently
      const candidate = await fetch(`/api/candidates/${candidateId}`).then(r => r.json()).catch(() => null);
      
      if (candidate?.interview_id) {
        const [evalData, interviewData] = await Promise.all([
          evaluationsApi.getByInterviewId(candidate.interview_id),
          fetch(`/api/interviews/${candidate.interview_id}`).then(r => r.json()).catch(() => null),
        ]);
        
        setEvaluation(evalData);
        setInterview(interviewData);
      }
    } catch (error: any) {
      console.error('Error loading report:', error);
      toast.error('Failed to load interview report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    toast.info('PDF download feature coming soon');
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-600';
    if (score >= 70) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'go':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Go</Badge>;
      case 'no go':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> No Go</Badge>;
      case 'neutral':
        return <Badge variant="secondary"><Minus className="h-3 w-3 mr-1" /> Neutral</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2>Interview Report</h2>
            <p className="text-muted-foreground">{candidateName}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No evaluation available yet. The interview may still be in progress.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallScore = evaluation.overall_score || 0;
  const technicalSkills = evaluation.technical_evaluation?.topSkills || [];
  const communicationScore = evaluation.communication_score || 0;
  const culturalFitScore = evaluation.cultural_fit_score || 0;
  const duration = interview?.duration_minutes ? `${interview.duration_minutes} min` : 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
            <div>
            <h2>Interview Report</h2>
            <p className="text-muted-foreground">{candidateName}</p>
          </div>
          <div className="flex items-center gap-2">
            {getVerdictBadge(evaluation.verdict)}
          </div>
        </div>
        <Button onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Quick View Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Overview</CardTitle>
          <CardDescription>Summary of interview performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Award className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
              <div className={`text-3xl ${getScoreColor(overallScore)}`}>
                {overallScore}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <div className="text-3xl">
                {duration}
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Headphones className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground mb-1">Communication</p>
              <div className={`text-3xl ${getScoreColor(communicationScore * 10)}`}>
                {communicationScore}/10
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Award className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm text-muted-foreground mb-1">Cultural Fit</p>
              <div className={`text-3xl ${getScoreColor(culturalFitScore * 10)}`}>
                {culturalFitScore}/10
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Assessment</CardTitle>
          <CardDescription>Detailed breakdown of evaluated skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {technicalSkills.length > 0 ? (
            technicalSkills.map((skill: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{skill.skill || skill.name}</p>
                    {skill.justification && (
                      <p className="text-sm text-muted-foreground mt-1">{skill.justification}</p>
                    )}
                  </div>
                  <Badge variant={(skill.score || 0) >= 8.5 ? 'default' : (skill.score || 0) >= 7 ? 'secondary' : 'destructive'}>
                    {skill.score || 0}/10
                  </Badge>
                </div>
                <Progress value={(skill.score || 0) * 10} className="h-2" />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No technical skills evaluated yet.</p>
          )}
          
          {/* Key Strengths and Areas for Improvement */}
          {(evaluation.key_strengths || evaluation.areas_for_improvement) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              {evaluation.key_strengths && (
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">Key Strengths</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {evaluation.key_strengths.split('\n').filter(Boolean).map((strength: string, i: number) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              {evaluation.areas_for_improvement && (
                <div>
                  <h4 className="font-semibold mb-2 text-orange-700">Areas for Improvement</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {evaluation.areas_for_improvement.split('\n').filter(Boolean).map((area: string, i: number) => (
                      <li key={i}>{area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {evaluation.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggestions for candidate development</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {evaluation.recommendations.split('\n').filter(Boolean).map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* QA Summary */}
      {evaluation.qa_summary && evaluation.qa_summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question-Answer Summary</CardTitle>
            <CardDescription>Key questions and responses from the interview</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {evaluation.qa_summary.map((qa: any, index: number) => (
                <AccordionItem key={index} value={`qa-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Q{index + 1}:</span>
                      <span className="text-sm">{qa.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-1">Expected Answer:</p>
                        <p className="text-sm text-muted-foreground">{qa.expectedAnswer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">Actual Answer:</p>
                        <p className="text-sm text-muted-foreground">{qa.actualAnswer}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Interview Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <FileText className="h-8 w-8 mb-2 text-blue-600" />
            <CardTitle>Interview Transcript</CardTitle>
            <CardDescription>Full text transcript of the interview</CardDescription>
          </CardHeader>
          <CardContent>
            {interview?.transcript ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  const blob = new Blob([interview.transcript], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                }}
              >
                View Transcript
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Transcript not available</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Headphones className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>Audio Recording</CardTitle>
            <CardDescription>Listen to the full interview recording</CardDescription>
          </CardHeader>
          <CardContent>
            {interview?.recording_url ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.open(interview.recording_url, '_blank')}
              >
                Play Recording
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Recording not available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
