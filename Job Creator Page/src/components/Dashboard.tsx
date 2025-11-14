import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Briefcase, Users, CheckCircle, MapPin, Clock } from 'lucide-react';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  applicants: number;
  postedDate: string;
  status: 'active' | 'closed';
}

interface DashboardProps {
  onJobClick: (jobId: string) => void;
}

const mockJobs: JobPosting[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    applicants: 24,
    postedDate: '2 days ago',
    status: 'active'
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Innovation Labs',
    location: 'Remote',
    type: 'Full-time',
    applicants: 18,
    postedDate: '5 days ago',
    status: 'active'
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'Design Studio',
    location: 'New York, NY',
    type: 'Contract',
    applicants: 31,
    postedDate: '1 week ago',
    status: 'active'
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'AI Solutions',
    location: 'Boston, MA',
    type: 'Full-time',
    applicants: 15,
    postedDate: '3 days ago',
    status: 'active'
  }
];

export function Dashboard({ onJobClick }: DashboardProps) {
  const stats = {
    liveJobs: 12,
    totalApplicants: 156,
    successfulHires: 8
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Live Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.liveJobs}</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalApplicants}</div>
            <p className="text-xs text-muted-foreground">Across all positions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Successful Hires</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.successfulHires}</div>
            <p className="text-xs text-muted-foreground">Positions filled</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Job Postings */}
      <div>
        <h2 className="mb-4">Live Job Postings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockJobs.map((job) => (
            <Card 
              key={job.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onJobClick(job.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-1">{job.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.type}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{job.applicants} applicants</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{job.postedDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
