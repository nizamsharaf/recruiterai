import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, MapPin, Briefcase, Users, Clock, TrendingUp, Search, Filter, Hash } from 'lucide-react';
import { CreateJobPosting } from './CreateJobPosting';

interface JobPosting {
  id: string;
  requisitionCode?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  applicants: number;
  postedDate: string;
  status: 'live' | 'closed';
}

const initialJobs: JobPosting[] = [
  {
    id: '1',
    requisitionCode: 'JR-2025-0001',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    applicants: 24,
    postedDate: '2 days ago',
    status: 'live'
  },
  {
    id: '2',
    requisitionCode: 'JR-2025-0002',
    title: 'Product Manager',
    company: 'Innovation Labs',
    location: 'Remote',
    type: 'Full-time',
    applicants: 18,
    postedDate: '5 days ago',
    status: 'live'
  },
  {
    id: '3',
    requisitionCode: 'JR-2025-0003',
    title: 'UX Designer',
    company: 'Design Studio',
    location: 'New York, NY',
    type: 'Contract',
    applicants: 31,
    postedDate: '1 week ago',
    status: 'live'
  },
  {
    id: '4',
    requisitionCode: 'JR-2025-0004',
    title: 'Data Scientist',
    company: 'AI Solutions',
    location: 'Boston, MA',
    type: 'Full-time',
    applicants: 15,
    postedDate: '3 days ago',
    status: 'live'
  },
  {
    id: '5',
    requisitionCode: 'JR-2025-0005',
    title: 'Frontend Developer',
    company: 'Web Studios',
    location: 'Austin, TX',
    type: 'Full-time',
    applicants: 42,
    postedDate: '2 weeks ago',
    status: 'closed'
  },
  {
    id: '6',
    requisitionCode: 'JR-2025-0006',
    title: 'Marketing Manager',
    company: 'Growth Co',
    location: 'Remote',
    type: 'Full-time',
    applicants: 28,
    postedDate: '3 weeks ago',
    status: 'closed'
  },
  {
    id: '7',
    requisitionCode: 'JR-2025-0007',
    title: 'DevOps Engineer',
    company: 'Cloud Systems',
    location: 'Seattle, WA',
    type: 'Full-time',
    applicants: 19,
    postedDate: '1 month ago',
    status: 'closed'
  }
];

interface JobPostingsProps {
  onJobClick: (jobId: string) => void;
}

export function JobPostings({ onJobClick }: JobPostingsProps) {
  const [subTab, setSubTab] = useState('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [jobs, setJobs] = useState<JobPosting[]>(initialJobs);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleJobCreated = (newJob: JobPosting) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const filterJobs = (jobsList: JobPosting[]) => {
    return jobsList.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (job.requisitionCode && job.requisitionCode.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
      const matchesType = typeFilter === 'all' || job.type === typeFilter;
      
      return matchesSearch && matchesLocation && matchesType;
    });
  };

  const liveJobs = filterJobs(jobs.filter(job => job.status === 'live'));
  const closedJobs = filterJobs(jobs.filter(job => job.status === 'closed'));

  const locations = ['all', ...Array.from(new Set(jobs.map(job => job.location)))];
  const types = ['all', ...Array.from(new Set(jobs.map(job => job.type)))];

  const JobCard = ({ job }: { job: JobPosting }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onJobClick(job.id)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>{job.title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{job.company}</p>
            {job.requisitionCode && (
              <div className="flex items-center gap-1 mt-2">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{job.requisitionCode}</span>
              </div>
            )}
          </div>
          <Badge variant={job.status === 'live' ? 'default' : 'secondary'}>
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
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{job.applicants} applications</span>
            {job.status === 'live' && job.applicants > 20 && (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{job.postedDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Job Postings</h2>
          <p className="text-muted-foreground">Create and manage your job postings</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job Posting
        </Button>
      </div>

      <CreateJobPosting
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onJobCreated={handleJobCreated}
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title, company, or requisition code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.filter(loc => loc !== 'all').map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.filter(type => type !== 'all').map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">
            Live ({liveJobs.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({closedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {liveJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery || locationFilter !== 'all' || typeFilter !== 'all' 
                      ? 'No jobs match your filters' 
                      : 'No live job postings'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {closedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {closedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery || locationFilter !== 'all' || typeFilter !== 'all' 
                      ? 'No jobs match your filters' 
                      : 'No closed job postings'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
