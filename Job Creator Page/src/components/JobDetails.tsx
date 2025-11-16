import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { jobsApi, candidatesApi, evaluationsApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Clock, 
  Phone,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Briefcase,
  Users,
  Calendar,
  Copy,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  score: number;
  callDuration: string;
  interviewDate: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  noticePeriod: '<=15' | '<=30' | '<=60' | '60+';
}

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
  onCandidateClick: (candidateId: string, candidateName: string) => void;
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    score: 92,
    callDuration: '12m 45s',
    interviewDate: '2 hours ago',
    status: 'pending',
    appliedDate: '2 days ago',
    noticePeriod: '<=30'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    score: 88,
    callDuration: '9m 20s',
    interviewDate: '5 hours ago',
    status: 'pending',
    appliedDate: '3 days ago',
    noticePeriod: '<=15'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    score: 76,
    callDuration: '11m 15s',
    interviewDate: '1 day ago',
    status: 'approved',
    appliedDate: '4 days ago',
    noticePeriod: '<=60'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    score: 95,
    callDuration: '15m 10s',
    interviewDate: '1 day ago',
    status: 'pending',
    appliedDate: '5 days ago',
    noticePeriod: '<=15'
  },
  {
    id: '5',
    name: 'Alex Rodriguez',
    email: 'alex.r@email.com',
    score: 68,
    callDuration: '8m 30s',
    interviewDate: '2 days ago',
    status: 'rejected',
    appliedDate: '6 days ago',
    noticePeriod: '60+'
  },
  {
    id: '6',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    score: 85,
    callDuration: '13m 45s',
    interviewDate: '3 days ago',
    status: 'pending',
    appliedDate: '1 week ago',
    noticePeriod: '<=30'
  },
  {
    id: '7',
    name: 'David Brown',
    email: 'david.b@email.com',
    score: 91,
    callDuration: '14m 20s',
    interviewDate: '3 days ago',
    status: 'approved',
    appliedDate: '1 week ago',
    noticePeriod: '<=15'
  },
  {
    id: '8',
    name: 'Jessica Lee',
    email: 'jessica.lee@email.com',
    score: 79,
    callDuration: '10m 05s',
    interviewDate: '4 days ago',
    status: 'pending',
    appliedDate: '1 week ago',
    noticePeriod: '<=60'
  }
];

const jobDetails = {
  '1': {
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    applicants: 24,
    postedDate: '2 days ago'
  }
};

export function JobDetails({ jobId, onBack, onCandidateClick }: JobDetailsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [noticePeriodFilter, setNoticePeriodFilter] = useState('all');
  const [statusTab, setStatusTab] = useState('all');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const loadJobData = async () => {
    try {
      setIsLoading(true);
      const [jobData, candidatesData] = await Promise.all([
        jobsApi.getById(jobId),
        candidatesApi.getByJobId(jobId),
      ]);
      setJob(jobData);
      setCandidates(candidatesData || []);
    } catch (error: any) {
      console.error('Error loading job data:', error);
      toast.error('Failed to load job data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPublicLink = async () => {
    if (!job?.public_link) {
      toast.error('No public link available for this job');
      return;
    }

    const publicUrl = `${window.location.origin}/job/${job.public_link}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Public link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const filterCandidates = () => {
    return candidates.filter(candidate => {
      const evaluation = candidate.evaluations?.[0];
      const score = evaluation?.overall_score || 0;
      
      const matchesSearch = candidate.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScore = scoreFilter === 'all' || 
        (scoreFilter === 'high' && score >= 85) ||
        (scoreFilter === 'medium' && score >= 70 && score < 85) ||
        (scoreFilter === 'low' && score < 70);
      const matchesNoticePeriod = noticePeriodFilter === 'all'; // Can add notice period later
      const matchesStatus = statusTab === 'all' || candidate.status === statusTab;
      
      return matchesSearch && matchesScore && matchesNoticePeriod && matchesStatus;
    });
  };

  const filteredCandidates = filterCandidates();

  const pendingCount = candidates.filter(c => c.status === 'pending').length;
  const approvedCount = candidates.filter(c => c.status === 'approved').length;
  const rejectedCount = candidates.filter(c => c.status === 'rejected').length;

  const handleDecision = (candidateId: string, decision: 'approved' | 'rejected', event: React.MouseEvent) => {
    event.stopPropagation();
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, status: decision } : c
    ));
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCandidateClick = (candidateId: string, candidateName: string) => {
    onCandidateClick(candidateId, candidateName);
  };

  const CandidateCard = ({ candidate }: { candidate: any }) => {
    const evaluation = candidate.evaluations?.[0];
    const score = evaluation?.overall_score || 0;
    
    return (
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleCandidateClick(candidate.id, candidate.name)}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              <div className="md:col-span-2">
                <p className="font-medium">{candidate.name}</p>
                <p className="text-sm text-muted-foreground">{candidate.email}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Score</p>
                  {evaluation ? (
                    <Badge variant={getScoreBadgeVariant(score)}>
                      <span className={`text-lg ${getScoreColor(score)}`}>
                        {score}
                      </span>
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
              </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{candidate.callDuration}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Notice Period</p>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{candidate.noticePeriod} days</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Interview</p>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{candidate.interviewDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {candidate.status === 'pending' ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleDecision(candidate.id, 'approved', e)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Go
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleDecision(candidate.id, 'rejected', e)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  No Go
                </Button>
              </>
            ) : (
              <Badge variant={candidate.status === 'approved' ? 'default' : 'destructive'}>
                {candidate.status === 'approved' ? 'Approved' : 'Rejected'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2>{job.title}</h2>
          <p className="text-muted-foreground">{job.company_name}</p>
        </div>
        {job.status === 'live' && job.public_link && (
          <Button variant="outline" onClick={handleCopyPublicLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Public Link
          </Button>
        )}
      </div>

      {/* Job Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Job Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{job.location || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{job.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Applicants</p>
                <p className="font-medium">{job.applicants}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Posted</p>
                <p className="font-medium">{job.postedDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg">Candidates</h3>
            <p className="text-sm text-muted-foreground">Review and make decisions on applicants</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (85+)</SelectItem>
                <SelectItem value="medium">Medium (70-84)</SelectItem>
                <SelectItem value="low">Low (&lt;70)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={noticePeriodFilter} onValueChange={setNoticePeriodFilter}>
              <SelectTrigger className="w-[170px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Notice Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="<=15">&le;15 days</SelectItem>
                <SelectItem value="<=30">&le;30 days</SelectItem>
                <SelectItem value="<=60">&le;60 days</SelectItem>
                <SelectItem value="60+">60+ days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={statusTab} onValueChange={setStatusTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All ({candidates.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusTab} className="space-y-3">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No candidates match your filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
