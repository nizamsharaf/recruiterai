import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
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
  Users
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
}

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
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
    appliedDate: '2 days ago'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    score: 88,
    callDuration: '9m 20s',
    interviewDate: '5 hours ago',
    status: 'pending',
    appliedDate: '3 days ago'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    score: 76,
    callDuration: '11m 15s',
    interviewDate: '1 day ago',
    status: 'approved',
    appliedDate: '4 days ago'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    score: 95,
    callDuration: '15m 10s',
    interviewDate: '1 day ago',
    status: 'pending',
    appliedDate: '5 days ago'
  },
  {
    id: '5',
    name: 'Alex Rodriguez',
    email: 'alex.r@email.com',
    score: 68,
    callDuration: '8m 30s',
    interviewDate: '2 days ago',
    status: 'rejected',
    appliedDate: '6 days ago'
  },
  {
    id: '6',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    score: 85,
    callDuration: '13m 45s',
    interviewDate: '3 days ago',
    status: 'pending',
    appliedDate: '1 week ago'
  },
  {
    id: '7',
    name: 'David Brown',
    email: 'david.b@email.com',
    score: 91,
    callDuration: '14m 20s',
    interviewDate: '3 days ago',
    status: 'approved',
    appliedDate: '1 week ago'
  },
  {
    id: '8',
    name: 'Jessica Lee',
    email: 'jessica.lee@email.com',
    score: 79,
    callDuration: '10m 05s',
    interviewDate: '4 days ago',
    status: 'pending',
    appliedDate: '1 week ago'
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

export function JobDetails({ jobId, onBack }: JobDetailsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [candidates, setCandidates] = useState(mockCandidates);

  const job = jobDetails[jobId as keyof typeof jobDetails] || jobDetails['1'];

  const filterCandidates = () => {
    return candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      const matchesScore = scoreFilter === 'all' || 
        (scoreFilter === 'high' && candidate.score >= 85) ||
        (scoreFilter === 'medium' && candidate.score >= 70 && candidate.score < 85) ||
        (scoreFilter === 'low' && candidate.score < 70);
      
      return matchesSearch && matchesStatus && matchesScore;
    });
  };

  const filteredCandidates = filterCandidates();

  const handleDecision = (candidateId: string, decision: 'approved' | 'rejected') => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2>{job.title}</h2>
          <p className="text-muted-foreground">{job.company}</p>
        </div>
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
                <p className="font-medium">{job.location}</p>
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
            <h3 className="text-lg">Candidates ({filteredCandidates.length})</h3>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
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
          </div>
        </div>

        {/* Candidates List */}
        <div className="space-y-3">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="md:col-span-2">
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Score</p>
                          <Badge variant={getScoreBadgeVariant(candidate.score)}>
                            <span className={`text-lg ${getScoreColor(candidate.score)}`}>
                              {candidate.score}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Call Duration</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{candidate.callDuration}</span>
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

                    <div className="flex items-center gap-2">
                      {candidate.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecision(candidate.id, 'approved')}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Go
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecision(candidate.id, 'rejected')}
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
            ))
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No candidates match your filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
