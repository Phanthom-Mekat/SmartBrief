import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, logoutUser } from '../redux/slices/authSlice';
import authService from '../services/authService';
import { Button } from './ui/button';
import { Sparkles, LogOut, User, Coins } from 'lucide-react';
import { Badge } from './ui/badge';

/**
 * Navbar Component
 * Dynamic navigation bar that displays different content based on authentication state
 */
const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      dispatch(logoutUser());
      navigate('/login');
    }
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
            <div className="flex items-center gap-4">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-2">
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
              </div>

              {/* Credits Display */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{user?.credits || 0} Credits</span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {user?.role}
                  </Badge>
                </div>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Logout</span>
                </Button>
              </div>
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
