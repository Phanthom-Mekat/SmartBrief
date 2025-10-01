import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectIsAuthenticated } from '@/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Zap, Shield } from 'lucide-react';

function App() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">SmartBrief</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Long Content into
            <span className="text-blue-600 block">Smart Summaries</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Harness the power of AI to create intelligent, concise summaries from any content. 
            Save time, boost productivity, and never miss key insights again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/register')}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Summarizing Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-blue-600 mr-3" />
                <CardTitle>AI-Powered Intelligence</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Advanced AI technology analyzes your content and extracts the most important 
                information while maintaining context and meaning.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <CardTitle>Multiple Formats</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Summarize articles, research papers, documents, blog posts, and any text content 
                up to 50,000 characters with ease.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <CardTitle>Secure & Private</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Your content is processed securely with enterprise-grade encryption. 
                All summaries are private and accessible only to you.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Paste Your Content</h3>
              <p className="text-gray-600">
                Simply paste or type the content you want to summarize. Supports up to 50,000 characters.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Processing</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes the content and generates an intelligent, concise summary.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Get Your Summary</h3>
              <p className="text-gray-600">
                Receive a well-structured summary with key insights and important details preserved.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-blue-600 text-white text-center border-0">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of users who are already saving time with SmartBrief
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-3"
              onClick={() => navigate('/register')}
            >
              Create Free Account
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 SmartBrief. Powered by AI for intelligent content summarization.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
