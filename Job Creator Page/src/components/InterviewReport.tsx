import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Headphones,
  Clock,
  Award
} from 'lucide-react';

interface InterviewReportProps {
  candidateId: string;
  candidateName: string;
  onBack: () => void;
}

const mockReportData = {
  '1': {
    name: 'John Smith',
    overallScore: 92,
    duration: '12m 45s',
    skills: [
      { name: 'Technical Proficiency', score: 95 },
      { name: 'Problem Solving', score: 90 },
      { name: 'Communication', score: 91 }
    ],
    transcriptUrl: '#',
    recordingUrl: '#'
  },
  '2': {
    name: 'Sarah Johnson',
    overallScore: 88,
    duration: '9m 20s',
    skills: [
      { name: 'Product Thinking', score: 92 },
      { name: 'Stakeholder Management', score: 85 },
      { name: 'Strategic Planning', score: 87 }
    ],
    transcriptUrl: '#',
    recordingUrl: '#'
  }
};

export function InterviewReport({ candidateId, candidateName, onBack }: InterviewReportProps) {
  const report = mockReportData[candidateId as keyof typeof mockReportData] || mockReportData['1'];

  const handleDownloadPDF = () => {
    // Mock PDF download
    console.log('Downloading PDF report...');
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
            <p className="text-muted-foreground">{report.name}</p>
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
              <div className={`text-3xl ${getScoreColor(report.overallScore)}`}>
                {report.overallScore}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <div className="text-3xl">
                {report.duration}
              </div>
            </div>

            {report.skills.slice(0, 2).map((skill, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">{index + 1}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{skill.name}</p>
                <div className={`text-3xl ${getScoreColor(skill.score)}`}>
                  {skill.score}
                </div>
              </div>
            ))}
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
          {report.skills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{skill.name}</p>
                </div>
                <Badge variant={skill.score >= 85 ? 'default' : skill.score >= 70 ? 'secondary' : 'destructive'}>
                  {skill.score}/100
                </Badge>
              </div>
              <Progress value={skill.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interview Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <FileText className="h-8 w-8 mb-2 text-blue-600" />
            <CardTitle>Interview Transcript</CardTitle>
            <CardDescription>Full text transcript of the interview</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <a href={report.transcriptUrl} target="_blank" rel="noopener noreferrer">
                View Transcript
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Headphones className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>Audio Recording</CardTitle>
            <CardDescription>Listen to the full interview recording</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <a href={report.recordingUrl} target="_blank" rel="noopener noreferrer">
                Play Recording
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Analysis</CardTitle>
          <CardDescription>AI-generated insights and observations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Strengths</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Demonstrated strong technical knowledge and problem-solving abilities</li>
              <li>Clear and articulate communication throughout the interview</li>
              <li>Showed enthusiasm and genuine interest in the role</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Areas for Development</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Could provide more specific examples from past experience</li>
              <li>Opportunity to elaborate more on team collaboration scenarios</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Overall Assessment</h4>
            <p className="text-sm text-muted-foreground">
              The candidate demonstrated excellent technical capabilities and strong communication skills. 
              They showed a clear understanding of the role requirements and provided thoughtful responses 
              to behavioral questions. Recommended for next stage of interview process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
