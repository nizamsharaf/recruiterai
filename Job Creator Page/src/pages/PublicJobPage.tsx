import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { MapPin, Briefcase, Clock, Building2, Loader2 } from 'lucide-react';
import { jobsApi } from '@/lib/api';
import { toast } from 'sonner@2.0.3';

export function PublicJobPage() {
  const { publicLink } = useParams<{ publicLink: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (publicLink) {
      loadJob();
    }
  }, [publicLink]);

  const loadJob = async () => {
    try {
      setIsLoading(true);
      const data = await jobsApi.getByPublicLink(publicLink!);
      setJob(data);
    } catch (error: any) {
      console.error('Error loading job:', error);
      toast.error('Job not found or no longer available');
      // Could redirect to 404 page
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (publicLink) {
      navigate(`/job/${publicLink}/apply`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This job posting is no longer available.
            </p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">AI Recruiter Agent</h1>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {job.status === 'live' ? 'Open' : 'Closed'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                <CardDescription className="text-lg mb-4">
                  <Building2 className="h-5 w-5 inline mr-2" />
                  {job.company_name}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {job.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.work_mode && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{job.work_mode}</span>
                </div>
              )}
              {job.department && (
                <Badge variant="secondary">{job.department}</Badge>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Job Description</h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {job.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {job.department && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Department</h3>
                <p className="text-muted-foreground">{job.department}</p>
              </div>
            )}

            <div className="pt-6 border-t">
              <Button 
                onClick={handleApply} 
                size="lg" 
                className="w-full sm:w-auto"
                disabled={job.status !== 'live'}
              >
                Apply Now
              </Button>
              {job.status !== 'live' && (
                <p className="text-sm text-muted-foreground mt-2">
                  This position is no longer accepting applications.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

