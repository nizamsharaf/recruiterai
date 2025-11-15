import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { ArrowLeft, Loader2, Upload, CalendarIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { jobsApi, candidatesApi } from '@/lib/api';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';

export function ApplyPage() {
  const { publicLink } = useParams<{ publicLink: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    yearsOfExperience: '',
    currentCtc: '',
    expectedCtc: '',
    phone: '',
    resumeUrl: '',
    callTiming: 'now' as 'now' | 'schedule',
    scheduledDateTime: null as Date | null,
  });

  useEffect(() => {
    checkAuth();
    if (publicLink) {
      loadJob();
    }
  }, [publicLink]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setIsAuthenticated(true);
      setUser(session.user);
      setFormData(prev => ({
        ...prev,
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
        email: session.user.email || '',
      }));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/job/${publicLink}/apply`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in with Google');
    }
  };

  const loadJob = async () => {
    try {
      setIsLoading(true);
      const data = await jobsApi.getByPublicLink(publicLink!);
      setJob(data);
    } catch (error: any) {
      console.error('Error loading job:', error);
      toast.error('Job not found');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, resumeUrl: data.publicUrl }));
      toast.success('Resume uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in first');
      return;
    }

    if (!formData.name || !formData.phone || !formData.designation) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const candidateData = {
        job_id: job.id,
        name: formData.name,
        email: user.email,
        phone: formData.phone,
        resume_url: formData.resumeUrl,
        scheduled_call_time: formData.callTiming === 'schedule' && formData.scheduledDateTime
          ? formData.scheduledDateTime.toISOString()
          : null,
        designation: formData.designation,
        years_of_experience: parseInt(formData.yearsOfExperience) || 0,
        current_ctc: formData.currentCtc,
        expected_ctc: formData.expectedCtc,
      };

      await candidatesApi.create(candidateData);

      toast.success('Application submitted successfully!');
      
      if (formData.callTiming === 'now') {
        toast.info('You will receive a call shortly');
      } else {
        toast.info(`Call scheduled for ${format(formData.scheduledDateTime!, 'PPP p')}`);
      }

      // Navigate back or show success
      setTimeout(() => {
        navigate(`/job/${publicLink}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(`Failed to submit application: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign In to Apply</CardTitle>
            <CardDescription>
              Please sign in with Google to submit your application for this position.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoogleLogin} className="w-full" size="lg">
              Sign in with Google
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/job/${publicLink}`)}
              className="w-full mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/job/${publicLink}`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job
          </Button>
          <h1 className="text-2xl font-semibold">Apply for {job.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Fill in your details to apply for this position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <Separator />

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="designation">
                    Current Designation <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">
                    Years of Experience <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentCtc">
                      Current CTC (Annual) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="currentCtc"
                      type="number"
                      value={formData.currentCtc}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentCtc: e.target.value }))}
                      placeholder="e.g., 100000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedCtc">
                      Expected CTC (Annual) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="expectedCtc"
                      type="number"
                      value={formData.expectedCtc}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedCtc: e.target.value }))}
                      placeholder="e.g., 120000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume Upload</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="cursor-pointer"
                  />
                  {formData.resumeUrl && (
                    <p className="text-sm text-green-600">Resume uploaded successfully</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Call Scheduling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interview Call</h3>
                <RadioGroup
                  value={formData.callTiming}
                  onValueChange={(value: 'now' | 'schedule') =>
                    setFormData(prev => ({ ...prev, callTiming: value }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="now" id="now" />
                    <Label htmlFor="now" className="cursor-pointer">
                      Call Now
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="schedule" id="schedule" />
                    <Label htmlFor="schedule" className="cursor-pointer">
                      Schedule for Later
                    </Label>
                  </div>
                </RadioGroup>

                {formData.callTiming === 'schedule' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduledDateTime
                          ? format(formData.scheduledDateTime, 'PPP p')
                          : 'Pick a date and time'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.scheduledDateTime || undefined}
                        onSelect={(date) => {
                          if (date) {
                            // If a date is already selected, preserve the time
                            if (formData.scheduledDateTime) {
                              const newDate = new Date(date);
                              newDate.setHours(formData.scheduledDateTime.getHours(), formData.scheduledDateTime.getMinutes());
                              setFormData(prev => ({ ...prev, scheduledDateTime: newDate }));
                            } else {
                              // First time selecting, set default time to 9 AM
                              const newDate = new Date(date);
                              newDate.setHours(9, 0);
                              setFormData(prev => ({ ...prev, scheduledDateTime: newDate }));
                            }
                          } else {
                            setFormData(prev => ({ ...prev, scheduledDateTime: null }));
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                      {formData.scheduledDateTime && (
                        <div className="p-4 border-t">
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={formData.scheduledDateTime.toTimeString().slice(0, 5)}
                            onChange={(e) => {
                              if (formData.scheduledDateTime && e.target.value) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(formData.scheduledDateTime);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                setFormData(prev => ({ ...prev, scheduledDateTime: newDate }));
                              }
                            }}
                            className="mt-2"
                          />
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <Separator />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/job/${publicLink}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

