import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { InterviewerChatCreator } from './InterviewerChatCreator';
import { interviewersApi } from '@/lib/api';
import { toast } from 'sonner@2.0.3';
import { 
  Phone, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Bot, 
  PlayCircle, 
  PauseCircle,
  Calendar,
  Loader2
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
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInterviewers();
  }, []);

  const loadInterviewers = async () => {
    try {
      setIsLoading(true);
      const data = await interviewersApi.getAll();
      setInterviewers(data || []);
    } catch (error: any) {
      console.error('Error loading interviewers:', error);
      toast.error('Failed to load interviewers');
      setInterviewers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewerCreated = (newInterviewer: any) => {
    loadInterviewers();
    toast.success('Interviewer created successfully!');
  };

  const filterInterviewers = (interviewers: any[]) => {
    return interviewers.filter(interviewer => {
      const matchesSearch = interviewer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          interviewer.position_details?.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || interviewer.position_details?.jobTitle === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  };

  const liveInterviewers = filterInterviewers(interviewers);
  const pausedInterviewers: any[] = []; // Can add status filtering later

  const totalInterviewers = interviewers.length;
  const totalInterviews = 0; // Can calculate from interviews later
  const avgDuration = '37 mins';

  const roles = ['all', ...Array.from(new Set(interviewers.map((i: any) => i.position_details?.jobTitle).filter(Boolean)))];

  const InterviewerCard = ({ interviewer }: { interviewer: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <CardTitle>{interviewer.name}</CardTitle>
            </div>
            <CardDescription>
              {interviewer.position_details?.roleOverview || 'AI Interviewer for technical screening'}
            </CardDescription>
          </div>
          <Badge variant="default">
            <PlayCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-gray-900">
              {interviewer.position_details?.jobTitle || 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>•</span>
            <span>
              {interviewer.question_bank?.sections?.reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0) || 0} questions
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Interviews Conducted</p>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">0</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Created</p>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{new Date(interviewer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : liveInterviewers.length > 0 ? (
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
        <InterviewerChatCreator 
          onClose={() => setShowChatCreator(false)}
          onInterviewerCreated={handleInterviewerCreated}
        />
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
