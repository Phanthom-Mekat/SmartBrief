import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Zap,
  History as HistoryIcon,
  ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { selectUser } from '@/redux/slices/authSlice';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'default';
      case 'reviewer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-lg text-gray-600">
                Ready to create amazing summaries? You have <span className="font-semibold text-blue-600">{user?.credits} credits</span> available.
              </p>
            </div>
            <Badge variant={getRoleBadgeVariant(user?.role)} className="text-sm px-4 py-2">
              {user?.role?.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Credits Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Zap className="h-6 w-6" />
                </div>
                <CreditCard className="h-8 w-8 opacity-20" />
              </div>
              <div className="text-4xl font-bold mb-1">{user?.credits}</div>
              <p className="text-blue-100 text-sm">Available Credits</p>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <Badge variant={getRoleBadgeVariant(user?.role)}>
                  {user?.role}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1 truncate">{user?.name}</div>
              <p className="text-gray-600 text-sm truncate">{user?.email}</p>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <HistoryIcon className="h-8 w-8 text-gray-200" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">Active</div>
              <p className="text-gray-600 text-sm">Account Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 hover:border-blue-500 transition-colors cursor-pointer group" onClick={() => navigate('/summarize')}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-colors">
                      <Sparkles className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Create Summary</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Transform long content into concise, intelligent summaries using AI
                  </p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                    Get Started <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-500 transition-colors cursor-pointer group" onClick={() => navigate('/history')}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-500 transition-colors">
                      <HistoryIcon className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">View History</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Access all your previous summaries and track your usage patterns
                  </p>
                  <div className="flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                    Browse History <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Platform Features</CardTitle>
            <CardDescription className="text-base">
              Everything you need to create powerful summaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Summarization</h4>
                  <p className="text-sm text-gray-600">
                    Transform long content into concise summaries using advanced AI technology
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Credit System</h4>
                  <p className="text-sm text-gray-600">
                    Simple pricing: 1 credit per summary. Start with free credits included
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Summary History</h4>
                  <p className="text-sm text-gray-600">
                    All summaries saved automatically. Access anytime, anywhere
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Analytics & Insights</h4>
                  <p className="text-sm text-gray-600">
                    Track usage patterns, word count reductions, and productivity gains
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;