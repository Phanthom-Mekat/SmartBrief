import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectIsAuthenticated } from '@/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Zap, Shield, Clock, TrendingUp, CheckCircle2, ArrowRight, Brain, Rocket, Users } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartBrief
              </span>
              <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">AI-Powered</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="hover:bg-blue-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="text-center pt-16 pb-12 md:pt-24 md:pb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
            <Rocket className="w-3.5 h-3.5 mr-2 inline" />
            Powered by Advanced AI Technology
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Transform Content into
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Intelligent Summaries
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Save hours of reading time with AI-powered summarization. Extract key insights from articles, 
            documents, and research papers in seconds. Perfect for professionals, students, and researchers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="text-base sm:text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => navigate('/register')}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Free - 5 Credits Included
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base sm:text-lg px-8 py-6 border-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => navigate('/login')}
            >
              Sign In to Continue
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span><strong className="text-gray-900">1000+</strong> Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span><strong className="text-gray-900">50,000+</strong> Summaries Created</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span><strong className="text-gray-900">85%</strong> Time Saved</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SmartBrief?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cutting-edge AI technology meets intuitive design for the ultimate summarization experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-2 border-blue-100/50 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Advanced AI Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  Powered by state-of-the-art language models that understand context, extract key points, 
                  and maintain the original meaning with remarkable accuracy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100/50 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  Get comprehensive summaries in seconds, not hours. Our optimized AI processes 
                  up to 50,000 characters instantly, saving you valuable time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-100/50 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Multiple Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  Support for text, TXT, and DOCX files. Summarize articles, research papers, 
                  reports, blog posts, and any document with ease.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100/50 hover:border-green-300 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  Enterprise-grade security with encrypted connections. Your content and summaries 
                  are completely private and never shared with third parties.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100/50 hover:border-orange-300 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">History & Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  Access all your summaries anytime. Edit, regenerate for free, download, 
                  or organize them with our intuitive dashboard interface.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-100/50 hover:border-pink-300 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  Track compression rates, word counts, and usage statistics. Understand 
                  how much time you're saving with detailed analytics.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-16 bg-white/50 backdrop-blur-sm rounded-3xl my-16">
          <div className="text-center mb-12 px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform lengthy content into actionable insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-8">
            <div className="relative">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Paste or Upload</h3>
                <p className="text-gray-600 leading-relaxed">
                  Copy and paste your text or upload a document file (.txt, .docx). 
                  Supports up to 50,000 characters for maximum flexibility.
                </p>
              </div>
              <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our advanced AI instantly analyzes the content, identifies key themes, 
                  and extracts the most important information with precision.
                </p>
              </div>
              <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Get Results</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive a well-structured, concise summary with all key insights preserved. 
                Edit, regenerate, or download with a single click.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16">
          <Card className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white text-center border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <CardContent className="py-16 px-4 relative z-10">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-blue-200" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Your Reading?
              </h2>
              <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                Join thousands of professionals, students, and researchers who are already 
                saving hours every week with SmartBrief's AI-powered summarization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => navigate('/register')}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Free Account
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-white bg-white/10 text-white hover:bg-white/20"
                  onClick={() => navigate('/login')}
                >
                  Sign In Now
                </Button>
              </div>
              <p className="text-blue-200 text-sm mt-6">
                ✓ No credit card required  ✓ 5 free credits included  ✓ Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartBrief
              </span>
            </div>
            <div className="text-center md:text-left">
              <p className="text-gray-600">&copy; 2025 SmartBrief. All rights reserved.</p>
              <p className="text-sm text-gray-500 mt-1">Powered by Advanced AI Technology</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Secure
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Fast
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Reliable
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
