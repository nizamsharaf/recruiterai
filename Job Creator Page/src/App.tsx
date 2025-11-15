import { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { JobPostings } from './components/JobPostings';
import { AIInterviewer } from './components/AIInterviewer';
import { Analytics } from './components/Analytics';
import { JobDetails } from './components/JobDetails';
import { InterviewReport } from './components/InterviewReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { LogOut, Briefcase } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState<'main' | 'job-details' | 'interview-report'>('main');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedCandidateName, setSelectedCandidateName] = useState<string>('');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setCurrentView('main');
    setSelectedJobId(null);
    setSelectedCandidateId(null);
    setSelectedCandidateName('');
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentView('job-details');
  };

  const handleBackToJobPostings = () => {
    setCurrentView('main');
    setSelectedJobId(null);
  };

  const handleCandidateClick = (candidateId: string, candidateName: string) => {
    setSelectedCandidateId(candidateId);
    setSelectedCandidateName(candidateName);
    setCurrentView('interview-report');
  };

  const handleBackToJobDetails = () => {
    setCurrentView('job-details');
    setSelectedCandidateId(null);
    setSelectedCandidateName('');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-blue-600" />
                <h1>AI Recruiter Agent</h1>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'interview-report' && selectedCandidateId ? (
          <InterviewReport 
            candidateId={selectedCandidateId} 
            candidateName={selectedCandidateName}
            onBack={handleBackToJobDetails} 
          />
        ) : currentView === 'job-details' && selectedJobId ? (
          <JobDetails 
            jobId={selectedJobId} 
            onBack={handleBackToJobPostings}
            onCandidateClick={handleCandidateClick}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="job-postings">Job Postings</TabsTrigger>
              <TabsTrigger value="ai-interviewer">AI Interviewer</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <Dashboard onJobClick={handleJobClick} />
            </TabsContent>

            <TabsContent value="job-postings" className="space-y-4">
              <JobPostings onJobClick={handleJobClick} />
            </TabsContent>

            <TabsContent value="ai-interviewer" className="space-y-4">
              <AIInterviewer />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Analytics />
            </TabsContent>
          </Tabs>
        )}
      </main>
      </div>
    </>
  );
}
