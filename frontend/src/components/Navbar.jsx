import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, logoutUser, refreshUser, selectRefreshLoading } from '../redux/slices/authSlice';
import authService from '../services/authService';
import { Button } from './ui/button';
import { Sparkles, LogOut, User, Coins, RefreshCw, Menu, Home, FileText, History } from 'lucide-react';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useState } from 'react';

/**
 * Navbar Component
 * Dynamic navigation bar that displays different content based on authentication state
 */
const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const refreshLoading = useSelector(selectRefreshLoading);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRefresh = () => {
    dispatch(refreshUser());
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logoutUser());
      navigate('/login');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      dispatch(logoutUser());
      navigate('/login');
      setMobileMenuOpen(false);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Sparkles className="w-6 h-6" />
            <span>SmartBrief</span>
          </Link>

          {/* Navigation Links & User Info */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="text-sm"
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/summarize')}
                  className="text-sm"
                >
                  Create Summary
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/history')}
                  className="text-sm"
                >
                  History
                </Button>
                {/* Admin-only link */}
                {user?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/admin')}
                    className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Admin Panel
                  </Button>
                )}
                {/* Editor-only link */}
                {(user?.role === 'editor' || user?.role === 'admin') && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/editor')}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Manage Content
                  </Button>
                )}
                {/* Reviewer-only link */}
                {(user?.role === 'reviewer' || user?.role === 'admin') && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/reviewer')}
                    className="text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    Review Content
                  </Button>
                )}
              </div>

              {/* Credits Display with Refresh */}
              <div className="hidden sm:flex items-center gap-1">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{user?.credits || 0}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshLoading}
                  title="Refresh credits"
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Desktop User Info & Logout */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {user?.role}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="ml-2">Logout</span>
                </Button>
              </div>

              {/* Mobile Menu Trigger */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      SmartBrief Menu
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col gap-4 mt-6">
                    {/* User Info Card */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user?.name}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {user?.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{user?.credits || 0} Credits</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={refreshLoading}
                          className="h-7 w-7 p-0"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${refreshLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigate('/dashboard')}
                        className="justify-start gap-3 h-12"
                      >
                        <Home className="w-5 h-5" />
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigate('/summarize')}
                        className="justify-start gap-3 h-12"
                      >
                        <FileText className="w-5 h-5" />
                        Create Summary
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigate('/history')}
                        className="justify-start gap-3 h-12"
                      >
                        <History className="w-5 h-5" />
                        History
                      </Button>

                      {/* Admin Link */}
                      {user?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          onClick={() => handleNavigate('/admin')}
                          className="justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <User className="w-5 h-5" />
                          Admin Panel
                        </Button>
                      )}

                      {/* Editor Link */}
                      {(user?.role === 'editor' || user?.role === 'admin') && (
                        <Button
                          variant="ghost"
                          onClick={() => handleNavigate('/editor')}
                          className="justify-start gap-3 h-12 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <FileText className="w-5 h-5" />
                          Manage Content
                        </Button>
                      )}

                      {/* Reviewer Link */}
                      {(user?.role === 'reviewer' || user?.role === 'admin') && (
                        <Button
                          variant="ghost"
                          onClick={() => handleNavigate('/reviewer')}
                          className="justify-start gap-3 h-12 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          <FileText className="w-5 h-5" />
                          Review Content
                        </Button>
                      )}
                    </div>

                    {/* Logout Button */}
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 mt-auto"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            // Not Authenticated - Show Login/Register
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-sm"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="text-sm"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
