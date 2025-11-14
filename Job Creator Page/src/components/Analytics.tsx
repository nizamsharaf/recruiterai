import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  BarChart3
} from 'lucide-react';

export function Analytics() {
  const stats = {
    totalCalls: 243,
    successfulCalls: 198,
    failedCalls: 45,
    averageCallDuration: '8m 32s',
    totalDuration: '34h 15m',
    successRate: 81
  };

  const recentCalls = [
    { id: '1', candidate: 'John Smith', job: 'Senior Software Engineer', status: 'success', duration: '12m 45s', timestamp: '2 hours ago' },
    { id: '2', candidate: 'Sarah Johnson', job: 'Product Manager', status: 'success', duration: '9m 20s', timestamp: '3 hours ago' },
    { id: '3', candidate: 'Mike Chen', job: 'UX Designer', status: 'failed', duration: '0m 15s', timestamp: '5 hours ago' },
    { id: '4', candidate: 'Emily Davis', job: 'Data Scientist', status: 'success', duration: '15m 10s', timestamp: '6 hours ago' },
    { id: '5', candidate: 'Alex Rodriguez', job: 'Frontend Developer', status: 'success', duration: '11m 30s', timestamp: '8 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2>Analytics Dashboard</h2>
        <p className="text-muted-foreground">ElevenLabs integration analytics and call metrics</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalCalls}</div>
            <p className="text-xs text-muted-foreground">All-time interviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Successful Calls</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.successfulCalls}</div>
            <p className="text-xs text-muted-foreground">{stats.successRate}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Failed Calls</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.failedCalls}</div>
            <p className="text-xs text-muted-foreground">{Math.round((stats.failedCalls / stats.totalCalls) * 100)}% failure rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Duration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Average Call Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.averageCallDuration}</div>
            <p className="text-xs text-muted-foreground">Per interview session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Call Time</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalDuration}</div>
            <p className="text-xs text-muted-foreground">Cumulative interview time</p>
          </CardContent>
        </Card>
      </div>

      {/* ElevenLabs Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>ElevenLabs Integration</CardTitle>
          <CardDescription>Voice AI platform connection and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">API Connection</p>
                  <p className="text-sm text-muted-foreground">Connected and active</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <p className="text-sm">Voice Quality</p>
                </div>
                <p className="text-2xl">98.5%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <p className="text-sm">API Latency</p>
                </div>
                <p className="text-2xl">125ms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Calls */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Call Activity</CardTitle>
          <CardDescription>Latest interview calls and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {call.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{call.candidate}</p>
                    <p className="text-sm text-muted-foreground">{call.job}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{call.duration}</span>
                  </div>
                  <span>{call.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
