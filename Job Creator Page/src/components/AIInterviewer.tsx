import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { InterviewerChatCreator } from './InterviewerChatCreator';
import { 
  Phone, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Bot, 
  PlayCircle, 
  PauseCircle,
  Calendar
} from 'lucide-react';

interface Interviewer {
  id: string;
  name: string;
  description: string;
  jobRole: string;
  questionCount: number;
  interviewsConducted: number;
  averageDuration: string;
  status: 'live' | 'paused';
  createdDate: string;
}

const mockInterviewers: Interviewer[] = [
  {
    id: '1',
    name: 'Senior Software Engineer Interviewer',
    description: 'Evaluates technical skills in algorithms, system design, and coding proficiency. Includes behavioral questions for team collaboration.',
    jobRole: 'Software Engineer',
    questionCount: 15,
    interviewsConducted: 24,
    averageDuration: '35 mins',
    status: 'live',
    createdDate: '2 weeks ago'
  },
  {
    id: '2',
    name: 'Product Manager Interviewer',
    description: 'Assesses product thinking, stakeholder management, and strategic planning. Covers case studies and prioritization scenarios.',
    jobRole: 'Product Manager',
    questionCount: 12,
    interviewsConducted: 18,
    averageDuration: '42 mins',
    status: 'live',
    createdDate: '1 week ago'
  },
  {
    id: '3',
    name: 'UX Designer Interviewer',
    description: 'Focuses on design process, user research methods, and portfolio review. Includes design challenge discussion.',
    jobRole: 'UX Designer',
    questionCount: 10,
    interviewsConducted: 31,
    averageDuration: '38 mins',
    status: 'live',
    createdDate: '3 weeks ago'
  },
  {
    id: '4',
    name: 'Data Scientist Interviewer',
    description: 'Tests statistical knowledge, machine learning concepts, and data analysis skills. Includes SQL and Python assessments.',
    jobRole: 'Data Scientist',
    questionCount: 18,
    interviewsConducted: 12,
    averageDuration: '45 mins',
    status: 'paused',
    createdDate: '1 month ago'
  },
  {
    id: '5',
    name: 'Marketing Manager Interviewer',
    description: 'Evaluates marketing strategy, campaign management, and analytics understanding. Covers digital marketing and growth tactics.',
    jobRole: 'Marketing Manager',
    questionCount: 11,
    interviewsConducted: 8,
    averageDuration: '32 mins',
    status: 'paused',
    createdDate: '2 months ago'
  }
];

export function AIInterviewer() {
  const [subTab, setSubTab] = useState('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showChatCreator, setShowChatCreator] = useState(false);

  const filteredInterviewers = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase();

    return mockInterviewers.filter(interviewer => {
      const matchesRole = roleFilter === 'all' || interviewer.jobRole === roleFilter;

      if (!matchesRole) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        interviewer.name.toLowerCase().includes(normalizedSearch) ||
        interviewer.description.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [roleFilter, searchQuery]);

  const liveInterviewers = useMemo(
    () => filteredInterviewers.filter(i => i.status === 'live'),
    [filteredInterviewers]
  );
  const pausedInterviewers = useMemo(
    () => filteredInterviewers.filter(i => i.status === 'paused'),
    [filteredInterviewers]
  );

  const { totalInterviewers, totalInterviews } = useMemo(() => {
    return mockInterviewers.reduce(
      (acc, interviewer) => {
        acc.totalInterviewers += 1;
        acc.totalInterviews += interviewer.interviewsConducted;
        return acc;
      },
      { totalInterviewers: 0, totalInterviews: 0 }
    );
  }, []);
  const avgDuration = '37 mins';

  const roles = useMemo(
    () => ['all', ...Array.from(new Set(mockInterviewers.map(i => i.jobRole)))],
    []
  );

  const InterviewerCard = ({ interviewer }: { interviewer: Interviewer }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <CardTitle>{interviewer.name}</CardTitle>
            </div>
            <CardDescription>{interviewer.description}</CardDescription>
          </div>
          <Badge variant={interviewer.status === 'live' ? 'default' : 'secondary'}>
            {interviewer.status === 'live' ? (
              <PlayCircle className="h-3 w-3 mr-1" />
            ) : (
              <PauseCircle className="h-3 w-3 mr-1" />
            )}
            {interviewer.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-gray-900">{interviewer.jobRole}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>•</span>
            <span>{interviewer.questionCount} questions</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Interviews Conducted</p>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{interviewer.interviewsConducted}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Duration</p>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{interviewer.averageDuration}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>Created {interviewer.createdDate}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>AI Interviewer</h2>
          <p className="text-muted-foreground">Configure and monitor AI-powered phone interviews</p>
        </div>
        <Button onClick={() => setShowChatCreator(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Interviewer
        </Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Interviewers Created</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalInterviewers}</div>
            <p className="text-xs text-muted-foreground">Active AI agents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Interviews Conducted</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalInterviews}</div>
            <p className="text-xs text-muted-foreground">Total calls completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{avgDuration}</div>
            <p className="text-xs text-muted-foreground">Per interview</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search interviewers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Job Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.filter(role => role !== 'all').map(role => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for Live and Paused */}
      <Tabs value={subTab} onValueChange={setSubTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">
            Live ({liveInterviewers.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused ({pausedInterviewers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {liveInterviewers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveInterviewers.map((interviewer) => (
                <InterviewerCard key={interviewer.id} interviewer={interviewer} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery || roleFilter !== 'all' 
                      ? 'No interviewers match your filters' 
                      : 'No live interviewers'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          {pausedInterviewers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pausedInterviewers.map((interviewer) => (
                <InterviewerCard key={interviewer.id} interviewer={interviewer} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery || roleFilter !== 'all' 
                      ? 'No interviewers match your filters' 
                      : 'No paused interviewers'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Chat Creator Modal */}
      {showChatCreator && (
        <InterviewerChatCreator onClose={() => setShowChatCreator(false)} />
      )}
    </div>
  );
}
