import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Upload,
  Sparkles,
  Plus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { jobsApi, interviewersApi } from '@/lib/api';

interface CreateJobPostingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated: (job: any) => void;
}

interface FormData {
  requisitionCode: string;
  aiInterviewer: string;
  jobTitle: string;
  companyName: string;
  location: string;
  employmentType: string;
  workMode: string;
  department: string;
  jobDescription: string;
  jobSummary: string;
  responsibilities: string;
  requiredSkills: string[];
  tools: string;
  education: string;
  experienceMin: string;
  experienceMax: string;
  ctcMin: string;
  ctcMax: string;
}

export function CreateJobPosting({ open, onOpenChange, onJobCreated }: CreateJobPostingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    requisitionCode: '',
    aiInterviewer: '',
    jobTitle: '',
    companyName: '',
    location: '',
    employmentType: '',
    workMode: '',
    department: '',
    jobDescription: '',
    jobSummary: '',
    responsibilities: '',
    requiredSkills: [],
    tools: '',
    education: '',
    experienceMin: '',
    experienceMax: '',
    ctcMin: '',
    ctcMax: ''
  });
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [availableInterviewers, setAvailableInterviewers] = useState<any[]>([]);
  const [isLoadingInterviewers, setIsLoadingInterviewers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load available interviewers
  useEffect(() => {
    if (open) {
      loadInterviewers();
    }
  }, [open]);

  const loadInterviewers = async () => {
    try {
      setIsLoadingInterviewers(true);
      const data = await interviewersApi.getAll();
      setAvailableInterviewers(data || []);
    } catch (error: any) {
      console.error('Error loading interviewers:', error);
      toast.error('Failed to load interviewers');
      setAvailableInterviewers([]);
    } finally {
      setIsLoadingInterviewers(false);
    }
  };

  // Generate unique requisition code when dialog opens
  useEffect(() => {
    if (open && !formData.requisitionCode) {
      const code = generateRequisitionCode();
      setFormData(prev => ({ ...prev, requisitionCode: code }));
    }
  }, [open]);

  const generateRequisitionCode = () => {
    const prefix = 'JR';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  };

  const totalSteps = 3;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && formData.requiredSkills.length < 3) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
    }));
  };

  const handleAIGenerate = async () => {
    if (!formData.jobDescription.trim()) {
      toast.error('Please provide a job description first');
      return;
    }

    setIsAIGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI-generated content
    setFormData(prev => ({
      ...prev,
      jobSummary: 'We are seeking a talented professional to join our dynamic team. This role offers an exciting opportunity to work on challenging projects and make a significant impact.',
      responsibilities: '• Lead and execute key projects\n• Collaborate with cross-functional teams\n• Drive innovation and continuous improvement\n• Mentor junior team members',
      requiredSkills: ['Communication', 'Problem Solving', 'Leadership'],
      education: "Bachelor's degree in relevant field",
      tools: 'Based on job description requirements'
    }));
    
    setIsAIGenerating(false);
    toast.success('AI has generated job details!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock file reading
      toast.success('JD uploaded successfully');
      setFormData(prev => ({
        ...prev,
        jobDescription: `Uploaded from ${file.name}\n\nJob description content will be extracted here...`
      }));
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        return formData.aiInterviewer && formData.jobTitle && formData.companyName && 
               formData.location && formData.employmentType && formData.workMode;
      case 1:
        return formData.jobDescription.trim() !== '';
      case 2:
        return formData.responsibilities && formData.requiredSkills.length > 0 && 
               formData.experienceMin && formData.experienceMax && 
               formData.ctcMin && formData.ctcMax;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === 1 && !formData.jobSummary) {
        // If moving from step 1 to 2 without AI generation, show prompt
        const shouldGenerate = window.confirm('Would you like AI to generate job details from your description?');
        if (shouldGenerate) {
          handleAIGenerate();
        }
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handlePost = async () => {
    if (!validateStep()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const jobData = {
        title: formData.jobTitle,
        company_name: formData.companyName,
        location: formData.location,
        work_mode: formData.workMode,
        department: formData.department,
        description: formData.jobDescription,
        status: 'live', // or 'draft' if they want to save without publishing
      };

      const newJob = await jobsApi.create(jobData);

      // If interviewer is selected, link it to the job
      if (formData.aiInterviewer) {
        await interviewersApi.update(formData.aiInterviewer, {
          job_id: newJob.id,
        });
      }

      onJobCreated(newJob);
      toast.success('Job posted successfully!');
      handleClose();
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast.error(`Failed to create job: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddQuestions = () => {
    toast.info('Redirecting to form builder...');
    // This would open a form builder interface
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFormData({
      requisitionCode: '',
      aiInterviewer: '',
      jobTitle: '',
      companyName: '',
      location: '',
      employmentType: '',
      workMode: '',
      department: '',
      jobDescription: '',
      jobSummary: '',
      responsibilities: '',
      requiredSkills: [],
      tools: '',
      education: '',
      experienceMin: '',
      experienceMax: '',
      ctcMin: '',
      ctcMax: ''
    });
    setNewSkill('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Posting</DialogTitle>
          <DialogDescription>
            <div className="flex items-center justify-between">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <Badge variant="outline">{formData.requisitionCode || 'Generating...'}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="mb-6" />

        <div className="space-y-6">
          {/* Step 0: AI Interviewer & Basic Details */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiInterviewer">
                  AI Interviewer <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.aiInterviewer} onValueChange={(value) => updateField('aiInterviewer', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an AI interviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingInterviewers ? (
                      <SelectItem value="loading" disabled>
                        <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                        Loading interviewers...
                      </SelectItem>
                    ) : availableInterviewers.length > 0 ? (
                      availableInterviewers.map((interviewer: any) => (
                        <SelectItem key={interviewer.id} value={interviewer.id}>
                          {interviewer.name} - {interviewer.position_details?.jobTitle || 'N/A'}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No interviewers available. Create one first.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="e.g., Tech Corp"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Job Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employmentType">
                    Employment Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.employmentType} onValueChange={(value) => updateField('employmentType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workMode">
                    Work Mode <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.workMode} onValueChange={(value) => updateField('workMode', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="on-site">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department / Function</Label>
                <Select value={formData.department} onValueChange={(value) => updateField('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 1: Job Description */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobDescription">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="jobDescription"
                  value={formData.jobDescription}
                  onChange={(e) => updateField('jobDescription', e.target.value)}
                  placeholder="Paste or type the full job description here. You can also upload a file below."
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="jdUpload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload JD file</p>
                      <Input
                        id="jdUpload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </Label>
                </div>

                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">or</span>
                </div>

                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleAIGenerate}
                    disabled={isAIGenerating || !formData.jobDescription.trim()}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isAIGenerating ? 'Generating...' : 'Let AI Generate Details'}
                  </Button>
                </div>
              </div>

              {formData.jobSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    ✓ AI has generated job details. Continue to review and edit them in the next step.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Detailed Job Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobSummary">Job Summary</Label>
                <Textarea
                  id="jobSummary"
                  value={formData.jobSummary}
                  onChange={(e) => updateField('jobSummary', e.target.value)}
                  placeholder="Brief summary of the role"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">
                  Roles & Responsibilities <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => updateField('responsibilities', e.target.value)}
                  placeholder="List key responsibilities (use bullet points)"
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Required Skills (up to 3) <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill"
                    disabled={formData.requiredSkills.length >= 3}
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    disabled={formData.requiredSkills.length >= 3}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                      <button
                        onClick={() => removeSkill(index)}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tools">Tools / Technologies</Label>
                <Input
                  id="tools"
                  value={formData.tools}
                  onChange={(e) => updateField('tools', e.target.value)}
                  placeholder="e.g., React, Node.js, AWS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Educational Requirements</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => updateField('education', e.target.value)}
                  placeholder="e.g., Bachelor's degree in Computer Science"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experienceMin">
                    Min Experience (years) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="experienceMin"
                    type="number"
                    min="0"
                    value={formData.experienceMin}
                    onChange={(e) => updateField('experienceMin', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceMax">
                    Max Experience (years) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="experienceMax"
                    type="number"
                    min="0"
                    value={formData.experienceMax}
                    onChange={(e) => updateField('experienceMax', e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctcMin">
                    Min CTC (Annual) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ctcMin"
                    type="number"
                    min="0"
                    value={formData.ctcMin}
                    onChange={(e) => updateField('ctcMin', e.target.value)}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctcMax">
                    Max CTC (Annual) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ctcMax"
                    type="number"
                    min="0"
                    value={formData.ctcMax}
                    onChange={(e) => updateField('ctcMax', e.target.value)}
                    placeholder="100000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < totalSteps - 1 ? (
              <Button onClick={handleNext} disabled={!validateStep()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleAddQuestions}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Questions
                </Button>
                <Button onClick={handlePost} disabled={!validateStep() || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Post Job
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
