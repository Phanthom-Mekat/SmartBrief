import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, CreditCard, FileText, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { selectUser, logoutUser } from '@/redux/slices/authSlice';
import authService from '@/services/authService';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    authService.logout();
    dispatch(logoutUser());
    navigate('/login');
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">SmartBrief</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={getRoleBadgeVariant(user?.role)}>
                {user?.role?.toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to summarize some content? You have {user?.credits} credits available.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Role:</span> {user?.role}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Member since:</span> Recently
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Credits Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{user?.credits}</div>
              <p className="text-xs text-muted-foreground">
                Credits available for summarization
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Buy More Credits
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => navigate('/summarize')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create Summary
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/history')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View History
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started with SmartBrief</CardTitle>
            <CardDescription>
              Here's what you can do with your SmartBrief account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">AI-Powered Summarization</h4>
                <p className="text-sm text-gray-600">
                  Transform long articles, documents, and content into concise, intelligent summaries 
                  using advanced AI technology.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Credit System</h4>
                <p className="text-sm text-gray-600">
                  Each summary costs 1 credit. You started with 5 free credits, and you can 
                  purchase more as needed.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Summary History</h4>
                <p className="text-sm text-gray-600">
                  All your summaries are saved and accessible anytime. Track your usage and 
                  revisit previous summaries.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Analytics & Insights</h4>
                <p className="text-sm text-gray-600">
                  Get insights into your summarization patterns, word count reductions, 
                  and productivity gains.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;