import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User, X, Loader2 } from 'lucide-react';
import { interviewersApi } from '@/lib/api';
import { toast } from 'sonner@2.0.3';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewerChatCreatorProps {
  onClose: () => void;
  onInterviewerCreated?: (interviewer: any) => void;
}

export function InterviewerChatCreator({ onClose, onInterviewerCreated }: InterviewerChatCreatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm here to help you create an AI interviewer. Please share the job requirements and I'll help you set up an interviewer with relevant questions and evaluation criteria. What position are you hiring for?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [interviewerName, setInterviewerName] = useState('');

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Call API to create interviewer
      const response = await interviewersApi.create({
        jobDescription: currentInput,
      });

      const generated = response.generatedData || response;
      setGeneratedData(generated);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Great! I've created an AI interviewer configuration based on your job description. I've identified the following:

**Position**: ${generated.positionDetails?.jobTitle || 'N/A'}
**Top 3 Skills**: ${generated.topSkills?.map((s: any) => s.name || s).join(', ') || 'N/A'}
**Questions Generated**: ${generated.questionBank?.sections?.reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0) || 0} questions

Please provide a name for this interviewer, and I'll save it for you.`
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Set default name from position
      setInterviewerName(generated.positionDetails?.jobTitle || 'AI Interviewer');
    } catch (error: any) {
      console.error('Error creating interviewer:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm sorry, I encountered an error while creating the interviewer: ${error.message}. Please try again with a more detailed job description.`
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to create interviewer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedData || !interviewerName.trim()) {
      toast.error('Please provide a name for the interviewer');
      return;
    }

    try {
      setIsLoading(true);
      const response = await interviewersApi.create({
        jobDescription: messages.find(m => m.role === 'user')?.content || '',
        name: interviewerName,
        elevenlabs_voice_id: null, // Can be set later
      });

      toast.success('Interviewer created successfully!');
      onInterviewerCreated?.(response);
      onClose();
    } catch (error: any) {
      console.error('Error saving interviewer:', error);
      toast.error('Failed to save interviewer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Create AI Interviewer</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-600">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4 space-y-3">
            {generatedData && (
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Interviewer name..."
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSave} disabled={isLoading || !interviewerName.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Describe the job requirements, skills needed, and interview focus areas..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
