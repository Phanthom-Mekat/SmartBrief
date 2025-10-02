import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { refreshUser, selectIsAuthenticated } from '../redux/slices/authSlice';
import Navbar from '../components/Navbar';

/**
 * Main Layout Component
 * Wraps pages with Navbar and consistent layout structure
 * Automatically refreshes user data from backend on mount
 */
const MainLayout = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Refresh user data from backend when layout mounts
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch fresh user data from backend (fire and forget - don't block UI)
      dispatch(refreshUser()).catch(() => {
        // Silently fail if backend is unavailable
        console.log('Failed to refresh user data');
      });
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;
